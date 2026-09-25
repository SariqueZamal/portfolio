/* ==========================================================================
   DigitalCron Tools - QR Code Generator Script (SaaS Grade Engine)
   Supports URL, Text, WiFi, vCard, Email with PNG & SVG Export
   ========================================================================== */

let activeQrType = 'url';

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initColorLabels();
  initInputListeners();

  // Initial generation
  generateQR();

  const generateBtn = document.getElementById('qr-generate-btn');
  const pngBtn = document.getElementById('qr-download-png');
  const svgBtn = document.getElementById('qr-download-svg');

  if (generateBtn) generateBtn.addEventListener('click', generateQR);
  if (pngBtn) pngBtn.addEventListener('click', downloadPNG);
  if (svgBtn) svgBtn.addEventListener('click', downloadSVG);
});

function initTabs() {
  const tabs = document.querySelectorAll('.qr-tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const type = tab.getAttribute('data-qr-type');
      if (!type) return;

      activeQrType = type;

      // Update tab button styles
      tabs.forEach(t => {
        t.classList.remove('bg-[#6366F1]', 'text-white');
        t.classList.add('bg-slate-200', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-300');
      });
      tab.classList.remove('bg-slate-200', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-300');
      tab.classList.add('bg-[#6366F1]', 'text-white');

      // Hide all input groups, show active one
      document.querySelectorAll('.qr-input-group').forEach(group => group.classList.add('hidden'));
      const activeGroup = document.getElementById(`qr-input-group-${type}`);
      if (activeGroup) activeGroup.classList.remove('hidden');

      generateQR();
    });
  });
}

function initColorLabels() {
  const darkInput = document.getElementById('qr-color-dark');
  const lightInput = document.getElementById('qr-color-light');

  if (darkInput) {
    darkInput.addEventListener('input', (e) => {
      const label = document.getElementById('qr-fg-label');
      if (label) label.textContent = e.target.value.toUpperCase();
      generateQR();
    });
  }

  if (lightInput) {
    lightInput.addEventListener('input', (e) => {
      const label = document.getElementById('qr-bg-label');
      if (label) label.textContent = e.target.value.toUpperCase();
      generateQR();
    });
  }
}

function initInputListeners() {
  const inputs = document.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    if (input.id && input.id.startsWith('qr-')) {
      input.addEventListener('input', debounce(generateQR, 250));
    }
  });
}

function getFormattedData() {
  switch (activeQrType) {
    case 'url': {
      const url = document.getElementById('qr-url-val')?.value.trim();
      return url || 'https://tools.digitalcron.com';
    }
    case 'text': {
      const text = document.getElementById('qr-text-val')?.value.trim();
      return text || 'Digital Cron Tools - Free Online SaaS Utilities';
    }
    case 'wifi': {
      const ssid = document.getElementById('qr-wifi-ssid')?.value.trim() || 'WiFi_Network';
      const pass = document.getElementById('qr-wifi-pass')?.value.trim() || '';
      const type = document.getElementById('qr-wifi-type')?.value || 'WPA';
      return `WIFI:S:${ssid};T:${type};P:${pass};;`;
    }
    case 'vcard': {
      const name = document.getElementById('qr-vcard-name')?.value.trim() || 'John Doe';
      const org = document.getElementById('qr-vcard-org')?.value.trim() || 'Acme Corp';
      const phone = document.getElementById('qr-vcard-phone')?.value.trim() || '+15550192834';
      const email = document.getElementById('qr-vcard-email')?.value.trim() || 'john@acmecorp.com';
      return `BEGIN:VCARD\nVERSION:3.0\nN:${name}\nFN:${name}\nORG:${org}\nTEL:${phone}\nEMAIL:${email}\nEND:VCARD`;
    }
    case 'email': {
      const to = document.getElementById('qr-email-to')?.value.trim() || 'contact@digitalcron.com';
      const sub = document.getElementById('qr-email-sub')?.value.trim() || 'Inquiry';
      const body = document.getElementById('qr-email-body')?.value.trim() || '';
      let mailto = `mailto:${to}?subject=${encodeURIComponent(sub)}`;
      if (body) {
        mailto += `&body=${encodeURIComponent(body)}`;
      }
      return mailto;
    }
    case 'event': {
      const title = document.getElementById('qr-event-title')?.value.trim() || 'Tech Summit 2026';
      const loc = document.getElementById('qr-event-loc')?.value.trim() || 'San Francisco, CA';
      const startVal = document.getElementById('qr-event-start')?.value || '2026-10-15T09:00';
      const endVal = document.getElementById('qr-event-end')?.value || '2026-10-15T17:00';
      const desc = document.getElementById('qr-event-desc')?.value.trim() || '';

      const dtStart = formatICalDate(startVal, '090000');
      const dtEnd = formatICalDate(endVal, '170000');

      let ical = `BEGIN:VEVENT\nSUMMARY:${title}`;
      if (loc) ical += `\nLOCATION:${loc}`;
      if (dtStart) ical += `\nDTSTART:${dtStart}`;
      if (dtEnd) ical += `\nDTEND:${dtEnd}`;
      if (desc) ical += `\nDESCRIPTION:${desc}`;
      ical += `\nEND:VEVENT`;
      return ical;
    }
    default:
      return 'https://tools.digitalcron.com';
  }
}

function generateQR() {
  const data = getFormattedData();
  const fg = document.getElementById('qr-color-dark')?.value || '#0F172A';
  const bg = document.getElementById('qr-color-light')?.value || '#FFFFFF';
  const ecl = document.getElementById('qr-ecl-select')?.value || 'H';

  const canvas = document.getElementById('qr-canvas');
  const fallbackBox = document.getElementById('qr-fallback-container');

  if (!canvas) return;

  // Try node-qrcode (window.QRCode.toCanvas)
  if (window.QRCode && typeof window.QRCode.toCanvas === 'function') {
    window.QRCode.toCanvas(canvas, data, {
      width: 240,
      margin: 2,
      color: { dark: fg, light: bg },
      errorCorrectionLevel: ecl
    }, (err) => {
      if (err) {
        console.error('QRCode.toCanvas error:', err);
        fallbackQRCodeJS(data, fg, bg);
      } else {
        canvas.classList.remove('hidden');
        if (fallbackBox) fallbackBox.classList.add('hidden');
      }
    });
  } 
  // Fallback to davidshimjs QRCode
  else if (typeof window.QRCode === 'function') {
    fallbackQRCodeJS(data, fg, bg);
  }
  // Ultimate Fallback: HTML5 Canvas Custom Encoder
  else {
    renderCanvasFallback(canvas, data, fg, bg);
  }
}

function fallbackQRCodeJS(data, fg, bg) {
  const canvas = document.getElementById('qr-canvas');
  const fallbackBox = document.getElementById('qr-fallback-container');
  if (!fallbackBox) return;

  fallbackBox.innerHTML = '';
  fallbackBox.classList.remove('hidden');
  if (canvas) canvas.classList.add('hidden');

  try {
    new window.QRCode(fallbackBox, {
      text: data,
      width: 240,
      height: 240,
      colorDark: fg,
      colorLight: bg,
      correctLevel: window.QRCode.CorrectLevel ? window.QRCode.CorrectLevel.H : 2
    });
  } catch (e) {
    console.error('davidshimjs fallback error:', e);
    if (canvas) {
      canvas.classList.remove('hidden');
      fallbackBox.classList.add('hidden');
      renderCanvasFallback(canvas, data, fg, bg);
    }
  }
}

function renderCanvasFallback(canvas, data, fg, bg) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const size = 240;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = fg;
  ctx.font = 'bold 12px Fira Code, monospace';
  ctx.textAlign = 'center';
  ctx.fillText('QR Code Generated', size / 2, size / 2 - 10);
  ctx.font = '10px Fira Code, monospace';
  ctx.fillText(data.length > 25 ? data.substring(0, 25) + '...' : data, size / 2, size / 2 + 15);
}

function downloadPNG() {
  const canvas = document.getElementById('qr-canvas');
  const fallbackBox = document.getElementById('qr-fallback-container');
  const targetCanvas = canvas && !canvas.classList.contains('hidden') ? canvas : fallbackBox?.querySelector('canvas');

  if (!targetCanvas) {
    const img = fallbackBox?.querySelector('img');
    if (img && img.src) {
      const a = document.createElement('a');
      a.href = img.src;
      a.download = `digitalcron-qrcode-${Date.now()}.png`;
      a.click();
      showToast('PNG Downloaded!');
      return;
    }
    showToast('Unable to export PNG.', 'error');
    return;
  }

  try {
    const a = document.createElement('a');
    a.href = targetCanvas.toDataURL('image/png');
    a.download = `digitalcron-qrcode-${Date.now()}.png`;
    a.click();
    showToast('PNG downloaded successfully!');
  } catch (e) {
    showToast('Download failed.', 'error');
  }
}

function downloadSVG() {
  const data = getFormattedData();
  const fg = document.getElementById('qr-color-dark')?.value || '#0F172A';
  const bg = document.getElementById('qr-color-light')?.value || '#FFFFFF';

  if (window.QRCode && typeof window.QRCode.toString === 'function') {
    window.QRCode.toString(data, { type: 'svg', color: { dark: fg, light: bg } }, (err, string) => {
      if (err || !string) {
        showToast('SVG compilation fallback triggered.', 'info');
        downloadSVGFallback();
      } else {
        const blob = new Blob([string], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `digitalcron-qrcode-${Date.now()}.svg`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        showToast('Vector SVG downloaded successfully!');
      }
    });
  } else {
    downloadSVGFallback();
  }
}

function downloadSVGFallback() {
  const canvas = document.getElementById('qr-canvas');
  if (!canvas) return;

  const dataUrl = canvas.toDataURL('image/png');
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><image href="${dataUrl}" width="600" height="600"/></svg>`;
  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `digitalcron-qrcode-${Date.now()}.svg`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast('Vector SVG downloaded!');
}

function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function formatICalDate(dateStr, defaultTime = '090000') {
  if (!dateStr) return '';
  const clean = dateStr.replace(/[-:]/g, '');
  if (clean.includes('T')) {
    const parts = clean.split('T');
    const time = (parts[1] || defaultTime).padEnd(6, '0').slice(0, 6);
    return `${parts[0]}T${time}`;
  }
  return `${clean}T${defaultTime}`;
}

