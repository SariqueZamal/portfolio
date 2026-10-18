/**
 * DIGITAL CRON - GOOGLE APPS SCRIPT WEBHOOK FOR FORM SUBMISSIONS
 * Spreadsheet: Digital Cron Form Data
 * ID: 1oJ_1j9pVMZ9mtx4NseBOqx2-pTOmdJrjZQSuAXcV9jY
 *
 * TABS HANDLED:
 * 1. "Book Consultation" (From contact.html)
 * 2. "Free Audit" (From free-audit.html)
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var rawData = e.postData ? e.postData.contents : "";
    var data = {};

    try {
      data = JSON.parse(rawData);
    } catch (parseErr) {
      data = e.parameter || {};
    }

    var sheetName = data.sheetName || "Book Consultation";
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);

    // If the sheet doesn't exist yet, create it
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }

    // If the sheet is empty, create standard headers matching the website
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Name",
        "Business Name",
        "Email Address",
        "Phone Number",
        "Website URL (if any)",
        "Industry",
        "What do you need",
        "Tell us about your current process",
        "Preferred Contact Method",
        "Submission Time"
      ]);
      sheet.getRange(1, 1, 1, 10)
        .setFontWeight("bold")
        .setBackground("#1e1b4b")
        .setFontColor("#ffffff");
    }

    // Read the existing column headers from row 1
    var numCols = Math.max(sheet.getLastColumn(), 1);
    var headers = sheet.getRange(1, 1, 1, numCols).getValues()[0];

    // Dynamically match incoming payload fields to the sheet's column headers
    var row = headers.map(function(header) {
      var h = header.toString().trim().toLowerCase();

      // Name (exclude Business Name)
      if (h.indexOf("name") !== -1 && h.indexOf("business") === -1) {
        return data.name || "";
      }
      // Business Name
      if (h.indexOf("business") !== -1) {
        return data.business || "";
      }
      // Email
      if (h.indexOf("email") !== -1) {
        return data.email || "";
      }
      // Phone / Mobile
      if (h.indexOf("phone") !== -1 || h.indexOf("mobile") !== -1) {
        return data.phone || "";
      }
      // Website
      if (h.indexOf("website") !== -1) {
        return data.website || "";
      }
      // Industry
      if (h.indexOf("industry") !== -1) {
        return data.industry || "";
      }
      // What do you need / Help needed
      if (h.indexOf("need") !== -1 || h.indexOf("help") !== -1) {
        return data.need || "";
      }
      // Process / Challenge
      if (h.indexOf("process") !== -1 || h.indexOf("challenge") !== -1) {
        return data.current_process || "";
      }
      // Preferred Contact Method
      if (h.indexOf("prefer") !== -1 || h.indexOf("method") !== -1 || h.indexOf("contact") !== -1) {
        return data.preferred_method || "";
      }
      // Submission Timestamp
      if (h.indexOf("time") !== -1 || h.indexOf("date") !== -1) {
        return data.timestamp || new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
      }

      return data[header] || "";
    });

    // Append the row to the sheet
    sheet.appendRow(row);

    return ContentService.createTextOutput(JSON.stringify({
      result: "success",
      sheet: sheetName,
      row: sheet.getLastRow()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      result: "error",
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput("Digital Cron Google Sheet Webhook is active and listening.")
    .setMimeType(ContentService.MimeType.TEXT);
}
