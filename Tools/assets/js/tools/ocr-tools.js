/**
 * Enterprise Optical Character Recognition (OCR) Engine & Document Editor Suite
 * Inspired by PDFLeader (pdfleader.com/ocr-pdf & pdfleader.com/editor)
 * Powered by Tesseract.js (Client-Side WebAssembly), PDF.js, JSZip & jsPDF
 * 100% Zero-Cloud Client-Side Privacy
 */

// Modern SaaS non-blocking notification helper
function notifyUser(msg, type = 'error') {
  if (typeof showToast === 'function') {
    showToast(msg, type);
  } else {
    console.warn(`[${type}] ${msg}`);
  }
}

// Global XML Escape helper for OpenXML Word generation
function escapeXml(unsafe) {
  return (unsafe || '').replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

// ─────────────────────────────────────────────────────────────────
// UNIVERSAL EXPORT SUBSYSTEM (.docx, .pdf, .txt, clipboard, drawer)
// ─────────────────────────────────────────────────────────────────

// 1. Client-Side Microsoft Word (.docx) Exporter via OpenXML
function downloadDocx(text, filename = 'ocr-document.docx') {
  if (!text || !text.trim()) {
    notifyUser('No text to export. Please extract or enter text first.');
    return;
  }
  if (!filename.toLowerCase().endsWith('.docx')) filename += '.docx';

  // If JSZip is available, compile a true OpenXML .docx archive
  if (window.JSZip) {
    try {
      const zip = new window.JSZip();

      // [Content_Types].xml
      zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`);

      // _rels/.rels
      zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);

      // word/_rels/document.xml.rels
      zip.file('word/_rels/document.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`);

      // word/styles.xml
      zip.file('word/styles.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>
        <w:sz w:val="22"/>
        <w:color w:val="1E293B"/>
      </w:rPr>
    </w:rPrDefault>
    <w:pPrDefault>
      <w:pPr>
        <w:spacing w:after="140" w:line="260" w:lineRule="auto"/>
      </w:pPr>
    </w:pPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:pPr><w:spacing w:before="240" w:after="120"/></w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
      <w:b/>
      <w:sz w:val="30"/>
      <w:color w:val="4F46E5"/>
    </w:rPr>
  </w:style>
</w:styles>`);

      // Generate paragraphs
      const lines = text.split(/\r?\n/);
      let paragraphsXml = '';
      for (const line of lines) {
        if (!line.trim()) {
          paragraphsXml += '<w:p><w:pPr><w:spacing w:after="80"/></w:pPr><w:r><w:t></w:t></w:r></w:p>';
        } else if (line.startsWith('---') && line.includes('PAGE')) {
          paragraphsXml += `<w:p><w:pPr><w:pStyle w:val="Heading1"/><w:spacing w:before="200" w:after="100"/></w:pPr><w:r><w:rPr><w:b/><w:color w:val="4F46E5"/></w:rPr><w:t>${escapeXml(line)}</w:t></w:r></w:p>`;
        } else {
          paragraphsXml += `<w:p><w:r><w:t xml:space="preserve">${escapeXml(line)}</w:t></w:r></w:p>`;
        }
      }

      // word/document.xml
      zip.file('word/document.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    <w:p>
      <w:pPr><w:pStyle w:val="Heading1"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="32"/><w:color w:val="4F46E5"/></w:rPr><w:t>Digital Cron OCR Studio Document</w:t></w:r>
    </w:p>
    ${paragraphsXml}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
    </w:sectPr>
  </w:body>
</w:document>`);

      zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }).then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        notifyUser('Word document (.docx) exported successfully!', 'success');
      });
      return;
    } catch (e) {
      console.warn('JSZip error, falling back to Word HTML blob:', e);
    }
  }

  // Fallback: Word HTML MIME Blob
  const htmlContent = `<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${escapeXml(filename)}</title><style>body { font-family: Calibri, sans-serif; font-size: 11pt; line-height: 1.5; color: #1e293b; margin: 40pt; } p { margin: 0 0 8pt 0; } h1 { color: #4f46e5; font-size: 16pt; }</style></head><body><h1>Digital Cron OCR Studio Document</h1>${text.split(/\r?\n/).map(l => `<p>${escapeXml(l)}</p>`).join('')}</body></html>`;
  const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  notifyUser('Word document exported successfully!', 'success');
}

// 2. Client-Side Searchable Vector PDF Exporter via jsPDF
function downloadSearchablePdf(text, filename = 'ocr-document.pdf', title = 'Digital Cron OCR Export') {
  if (!text || !text.trim()) {
    notifyUser('No text to export. Please extract or enter text first.');
    return;
  }
  if (!filename.toLowerCase().endsWith('.pdf')) filename += '.pdf';

  const jsPDFClass = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
  if (!jsPDFClass) {
    notifyUser('jsPDF library loading... Please wait a moment or export as .txt.');
    downloadTxt(text, filename.replace(/\.pdf$/i, '.txt'));
    return;
  }

  try {
    const doc = new jsPDFClass({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 45;
    const maxLineWidth = pageWidth - (margin * 2);
    let cursorY = margin + 30;

    // Header banner
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(79, 70, 229);
    doc.text(title, margin, margin + 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('100% Client-Side Privacy · Digital Cron OCR Studio', margin, margin + 22);

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(1);
    doc.line(margin, margin + 26, pageWidth - margin, margin + 26);

    cursorY = margin + 45;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);

    const paragraphs = text.split(/\r?\n/);
    const lineHeight = 14;

    paragraphs.forEach((p) => {
      if (!p.trim()) {
        cursorY += 8;
        return;
      }

      if (p.startsWith('---') && p.includes('PAGE')) {
        cursorY += 10;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(79, 70, 229);
        doc.text(p, margin, cursorY);
        cursorY += lineHeight;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(30, 41, 59);
        return;
      }

      const lines = doc.splitTextToSize(p, maxLineWidth);
      lines.forEach(l => {
        if (cursorY + lineHeight > pageHeight - margin - 20) {
          doc.addPage();
          cursorY = margin + 20;
        }
        doc.text(l, margin, cursorY);
        cursorY += lineHeight;
      });
      cursorY += 4;
    });

    // Running Footer
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 25, { align: 'center' });
    }

    doc.save(filename);
    notifyUser('Searchable PDF (.pdf) exported successfully!', 'success');
  } catch (err) {
    console.error('jsPDF generation failed:', err);
    notifyUser('Failed to generate PDF: ' + err.message);
  }
}

// 3. Download Plain Text (.txt)
function downloadTxt(text, filename = 'extracted-text.txt') {
  if (!text || !text.trim()) {
    notifyUser('No text to export.');
    return;
  }
  if (!filename.toLowerCase().endsWith('.txt')) filename += '.txt';
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.download = filename;
  a.href = url;
  a.click();
  URL.revokeObjectURL(url);
  notifyUser('Plain text (.txt) downloaded!', 'success');
}

// 4. Copy to Clipboard
function copyToClipboard(text, btn = null) {
  if (!text || !text.trim()) {
    notifyUser('Nothing to copy.');
    return;
  }
  navigator.clipboard.writeText(text).then(() => {
    if (btn) {
      const orig = btn.innerHTML;
      btn.innerHTML = '✅ Copied!';
      setTimeout(() => { btn.innerHTML = orig; }, 1800);
    }
    notifyUser('Text copied to clipboard!', 'success');
  }).catch(() => {
    notifyUser('Could not copy text to clipboard.');
  });
}

// 5. PDFLeader-Style Multi-Format Choose Format Drawer (ChooseFormatOCRDrawer)
function openExportFormatDrawer(text, baseName = 'ocr-export') {
  if (!text || !text.trim()) {
    notifyUser('No extracted text available to export.');
    return;
  }

  let drawer = document.getElementById('dc-ocr-format-drawer');
  if (!drawer) {
    drawer = document.createElement('div');
    drawer.id = 'dc-ocr-format-drawer';
    drawer.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in font-mono text-xs';
    drawer.innerHTML = `
      <div class="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
        <div class="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div class="text-[10px] font-bold text-[#6366F1] uppercase tracking-wider">Enterprise Export Hub</div>
            <h3 class="text-xl font-extrabold text-slate-900 dark:text-white">Choose Download Format</h3>
          </div>
          <button type="button" id="dc-close-format-drawer" class="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">✕</button>
        </div>

        <div class="space-y-3">
          <!-- Option 1: Word .docx -->
          <label class="dc-format-card flex items-start gap-4 p-4 rounded-2xl border-2 border-[#6366F1] bg-indigo-500/5 cursor-pointer transition-all">
            <input type="radio" name="ocr_export_format" value="docx" checked class="mt-1 w-4 h-4 text-[#6366F1] focus:ring-[#6366F1]" />
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <span class="font-extrabold text-slate-900 dark:text-white text-sm">Microsoft Word (.docx)</span>
                <span class="px-2 py-0.5 rounded-full bg-[#6366F1] text-white text-[9px] font-bold uppercase">Recommended</span>
              </div>
              <p class="text-slate-500 text-[11px] mt-0.5">Editable document preserving paragraphs, layout, and line breaks.</p>
            </div>
          </label>

          <!-- Option 2: Searchable PDF -->
          <label class="dc-format-card flex items-start gap-4 p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-[#6366F1] bg-white dark:bg-slate-900 cursor-pointer transition-all">
            <input type="radio" name="ocr_export_format" value="pdf" class="mt-1 w-4 h-4 text-[#6366F1] focus:ring-[#6366F1]" />
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <span class="font-extrabold text-slate-900 dark:text-white text-sm">Searchable PDF (.pdf)</span>
                <span class="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[9px] font-bold uppercase">Vector Print</span>
              </div>
              <p class="text-slate-500 text-[11px] mt-0.5">Paginated vector PDF document with selectable, searchable text.</p>
            </div>
          </label>

          <!-- Option 3: Plain Text -->
          <label class="dc-format-card flex items-start gap-4 p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-[#6366F1] bg-white dark:bg-slate-900 cursor-pointer transition-all">
            <input type="radio" name="ocr_export_format" value="txt" class="mt-1 w-4 h-4 text-[#6366F1] focus:ring-[#6366F1]" />
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <span class="font-extrabold text-slate-900 dark:text-white text-sm">Plain Text (.txt)</span>
                <span class="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[9px] font-bold uppercase">UTF-8 Raw</span>
              </div>
              <p class="text-slate-500 text-[11px] mt-0.5">Lightweight universal text file compatible with any code or text editor.</p>
            </div>
          </label>
        </div>

        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button type="button" id="dc-drawer-copy-btn" class="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold uppercase transition-all">
            📋 Copy All
          </button>
          <button type="button" id="dc-drawer-download-btn" class="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#6366F1] hover:bg-[#5457E5] text-white font-extrabold uppercase shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2">
            <span>💾 Download Document</span>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(drawer);

    // Card border selection styling
    const radios = drawer.querySelectorAll('input[name="ocr_export_format"]');
    radios.forEach(r => {
      r.addEventListener('change', () => {
        drawer.querySelectorAll('.dc-format-card').forEach(c => {
          c.classList.remove('border-[#6366F1]', 'bg-indigo-500/5');
          c.classList.add('border-slate-200', 'dark:border-slate-800', 'bg-white', 'dark:bg-slate-900');
        });
        const activeCard = r.closest('.dc-format-card');
        if (activeCard) {
          activeCard.classList.remove('border-slate-200', 'dark:border-slate-800', 'bg-white', 'dark:bg-slate-900');
          activeCard.classList.add('border-[#6366F1]', 'bg-indigo-500/5');
        }
      });
    });

    document.getElementById('dc-close-format-drawer').addEventListener('click', () => {
      drawer.classList.add('hidden');
    });

    drawer.addEventListener('click', (e) => {
      if (e.target === drawer) drawer.classList.add('hidden');
    });
  }

  drawer.classList.remove('hidden');

  const btnDl = document.getElementById('dc-drawer-download-btn');
  const btnCopy = document.getElementById('dc-drawer-copy-btn');

  // Replace handlers for current text
  btnDl.onclick = () => {
    const selected = drawer.querySelector('input[name="ocr_export_format"]:checked').value;
    if (selected === 'docx') {
      downloadDocx(text, `${baseName}.docx`);
    } else if (selected === 'pdf') {
      downloadSearchablePdf(text, `${baseName}.pdf`);
    } else {
      downloadTxt(text, `${baseName}.txt`);
    }
    drawer.classList.add('hidden');
  };

  btnCopy.onclick = () => {
    copyToClipboard(text, btnCopy);
  };
}

// ─────────────────────────────────────────────────────────────────
// IN-PLACE OCR DOCUMENT & TEXT EDITOR COMPONENT (pdfleader.com/editor)
// ─────────────────────────────────────────────────────────────────

/**
 * Mounts the rich document editor toolbar, stats, find/replace, and export controls
 * on any OCR output textarea.
 */
function mountOcrEditor({
  container,          // parent container of textarea
  textarea,           // target textarea element
  previewContainer,    // image/canvas preview container (for side-by-side toggle)
  getBaseFilename,    // function returning string base filename
  onTextChange        // callback on text updates
}) {
  if (!textarea || textarea.dataset.ocrEditorMounted) return;
  textarea.dataset.ocrEditorMounted = 'true';

  const editorWrapper = document.createElement('div');
  editorWrapper.className = 'dc-ocr-editor-workspace space-y-2.5 font-mono text-xs';

  // 1. TOP STATS BAR
  const statsBar = document.createElement('div');
  statsBar.className = 'flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400 pb-1.5 border-b border-slate-200 dark:border-slate-800';
  statsBar.innerHTML = `
    <div class="flex items-center gap-3">
      <span class="font-extrabold uppercase text-slate-800 dark:text-slate-200 tracking-wider">Document Editor</span>
      <span class="dc-stat-words font-semibold text-indigo-500">0 words</span>
      <span class="dc-stat-chars">0 chars</span>
      <span class="dc-stat-lines">0 lines</span>
      <span class="dc-stat-read hidden sm:inline text-slate-400">~1 min read</span>
    </div>
    <div class="flex items-center gap-2">
      <span class="dc-stat-accuracy px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">Ready</span>
      <button type="button" class="dc-btn-sidebyside px-2 py-0.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:border-[#6366F1] text-[10px] font-bold text-slate-700 dark:text-slate-300 transition-colors" title="Toggle side-by-side proofreader view">
        👁️ Split View
      </button>
    </div>
  `;

  // 2. RICH TOOLBAR (Formatting, Case transforms, Find/Replace)
  const toolbar = document.createElement('div');
  toolbar.className = 'flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800';
  toolbar.innerHTML = `
    <div class="flex flex-wrap items-center gap-1">
      <!-- Formatting Buttons -->
      <div class="flex items-center bg-white dark:bg-slate-950 rounded-lg p-0.5 border border-slate-200 dark:border-slate-800 shadow-sm">
        <button type="button" class="dc-btn-fmt px-2.5 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded font-black text-xs text-slate-800 dark:text-slate-200" data-format="bold" title="Bold (**text**)">B</button>
        <button type="button" class="dc-btn-fmt px-2.5 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded italic font-serif text-xs text-slate-800 dark:text-slate-200" data-format="italic" title="Italic (*text*)">I</button>
        <button type="button" class="dc-btn-fmt px-2.5 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded underline text-xs text-slate-800 dark:text-slate-200" data-format="underline" title="Underline (<u>text</u>)">U</button>
        <button type="button" class="dc-btn-fmt px-2.5 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded line-through text-xs text-slate-800 dark:text-slate-200" data-format="strike" title="Strikethrough (~~text~~)">S</button>
        <button type="button" class="dc-btn-fmt px-2.5 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-rose-500 text-[10px] font-bold" data-format="clear" title="Clear Markdown Formatting">⌫</button>
      </div>

      <!-- Quick Case Transforms -->
      <div class="flex items-center bg-white dark:bg-slate-950 rounded-lg p-0.5 border border-slate-200 dark:border-slate-800 shadow-sm text-[10px] font-bold text-slate-600 dark:text-slate-300">
        <button type="button" class="dc-btn-transform px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded" data-transform="upper" title="Convert to UPPERCASE">UPPER</button>
        <button type="button" class="dc-btn-transform px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded" data-transform="lower" title="Convert to lowercase">lower</button>
        <button type="button" class="dc-btn-transform px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded" data-transform="title" title="Convert to Title Case">Title</button>
        <button type="button" class="dc-btn-transform px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-indigo-500" data-transform="clean-spaces" title="Remove excess whitespace & clean tabs">Trim</button>
        <button type="button" class="dc-btn-transform px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-indigo-500" data-transform="strip-blanks" title="Remove consecutive blank lines">Compact</button>
      </div>

      <!-- Find & Replace Toggle -->
      <button type="button" class="dc-btn-toggle-find px-2.5 py-1 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-[#6366F1] font-bold text-[10px] text-slate-700 dark:text-slate-300 shadow-sm transition-all flex items-center gap-1.5">
        <span>🔍 Find &amp; Replace</span>
      </button>
    </div>

    <!-- Right: Quick Export Buttons -->
    <div class="flex items-center gap-1.5">
      <button type="button" class="dc-btn-quick-docx px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10px] uppercase shadow-sm transition-all flex items-center gap-1" title="Export Microsoft Word Document">
        <span>📄 Word</span>
      </button>
      <button type="button" class="dc-btn-quick-pdf px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[10px] uppercase shadow-sm transition-all flex items-center gap-1" title="Export Searchable PDF">
        <span>📑 PDF</span>
      </button>
    </div>
  `;

  // 3. EXPANDABLE FIND & REPLACE BAR
  const findBar = document.createElement('div');
  findBar.className = 'dc-find-replace-bar hidden p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 space-y-2';
  findBar.innerHTML = `
    <div class="flex flex-wrap items-center gap-2">
      <div class="relative flex-1 min-w-[140px]">
        <input type="text" class="dc-find-input w-full p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-1 focus:ring-[#6366F1] focus:outline-none" placeholder="Find in extracted text..." />
      </div>
      <div class="relative flex-1 min-w-[140px]">
        <input type="text" class="dc-replace-input w-full p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-1 focus:ring-[#6366F1] focus:outline-none" placeholder="Replace with..." />
      </div>
      <span class="dc-find-matches text-[11px] font-bold text-slate-400 px-1">0 matches</span>
      <button type="button" class="dc-btn-replace-next px-3 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 font-bold text-[10px] uppercase text-slate-700 dark:text-slate-200">Replace Next</button>
      <button type="button" class="dc-btn-replace-all px-3 py-1.5 rounded-lg bg-[#6366F1] hover:bg-[#5457E5] text-white font-bold text-[10px] uppercase shadow">Replace All</button>
      <button type="button" class="dc-btn-close-find p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs">✕</button>
    </div>
  `;

  // 4. BOTTOM ACTION FOOTER (Copy, Download .txt, Export Hub)
  const exportFooter = document.createElement('div');
  exportFooter.className = 'flex flex-wrap items-center justify-between gap-3 pt-2';
  exportFooter.innerHTML = `
    <div class="flex flex-wrap items-center gap-2">
      <button type="button" class="dc-btn-copy-main px-4 py-2.5 rounded-xl bg-[#6366F1] hover:bg-[#5457E5] text-white text-xs font-bold uppercase transition-all shadow flex items-center gap-2">
        <span>📋 Copy Text</span>
      </button>
      <button type="button" class="dc-btn-download-txt px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold uppercase transition-all flex items-center gap-2">
        <span>💾 Download .txt</span>
      </button>
      <button type="button" class="dc-btn-open-export-hub px-4 py-2.5 rounded-xl border-2 border-[#6366F1] text-[#6366F1] hover:bg-indigo-500/10 text-xs font-bold uppercase transition-all flex items-center gap-2">
        <span>📥 Export Hub ▾</span>
      </button>
    </div>
    <button type="button" class="dc-btn-clear-editor px-3 py-2 text-rose-500 hover:underline text-xs">Clear Editor</button>
  `;

  // Insert above and below textarea
  textarea.parentNode.insertBefore(editorWrapper, textarea);
  editorWrapper.appendChild(statsBar);
  editorWrapper.appendChild(toolbar);
  editorWrapper.appendChild(findBar);
  editorWrapper.appendChild(textarea);
  editorWrapper.appendChild(exportFooter);

  // ─── LOGIC & LISTENERS ───

  const statWords = statsBar.querySelector('.dc-stat-words');
  const statChars = statsBar.querySelector('.dc-stat-chars');
  const statLines = statsBar.querySelector('.dc-stat-lines');
  const statRead = statsBar.querySelector('.dc-stat-read');
  const statAccuracy = statsBar.querySelector('.dc-stat-accuracy');
  const btnSideBySide = statsBar.querySelector('.dc-btn-sidebyside');

  const updateStats = () => {
    const text = textarea.value || '';
    const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
    const chars = text.length;
    const lines = text ? text.split(/\r?\n/).length : 0;
    const readMin = Math.max(1, Math.ceil(words / 200));

    if (statWords) statWords.textContent = `${words} words`;
    if (statChars) statChars.textContent = `${chars} chars`;
    if (statLines) statLines.textContent = `${lines} lines`;
    if (statRead) statRead.textContent = `~${readMin} min read`;

    if (onTextChange) onTextChange(text);
  };

  textarea.addEventListener('input', () => {
    updateStats();
    if (statAccuracy && statAccuracy.textContent !== 'Ready') {
      statAccuracy.textContent = '✓ Edited';
      statAccuracy.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400';
    }
  });

  // Text selection helpers
  const wrapTextSelection = (before, after) => {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const val = textarea.value;
    const selected = val.substring(start, end) || 'text';
    const replacement = before + selected + after;
    textarea.value = val.substring(0, start) + replacement + val.substring(end);
    textarea.selectionStart = start + before.length;
    textarea.selectionEnd = start + before.length + selected.length;
    textarea.focus();
    updateStats();
  };

  // Rich formatting buttons
  toolbar.querySelectorAll('.dc-btn-fmt').forEach(btn => {
    btn.addEventListener('click', () => {
      const fmt = btn.dataset.format;
      if (fmt === 'bold') wrapTextSelection('**', '**');
      else if (fmt === 'italic') wrapTextSelection('*', '*');
      else if (fmt === 'underline') wrapTextSelection('<u>', '</u>');
      else if (fmt === 'strike') wrapTextSelection('~~', '~~');
      else if (fmt === 'clear') {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const val = textarea.value;
        const selected = val.substring(start, end);
        const clean = (selected || val).replace(/[\*\~]|<u>|<\/u>/g, '');
        if (selected) {
          textarea.value = val.substring(0, start) + clean + val.substring(end);
        } else {
          textarea.value = clean;
        }
        updateStats();
      }
    });
  });

  // Text transform buttons
  toolbar.querySelectorAll('.dc-btn-transform').forEach(btn => {
    btn.addEventListener('click', () => {
      const tr = btn.dataset.transform;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;
      const selected = val.substring(start, end);
      const target = selected || val;
      let result = target;

      if (tr === 'upper') result = target.toUpperCase();
      else if (tr === 'lower') result = target.toLowerCase();
      else if (tr === 'title') {
        result = target.replace(/\b\w+/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
      } else if (tr === 'clean-spaces') {
        result = target.replace(/[ \t]+/g, ' ').replace(/^ +| +$/gm, '');
      } else if (tr === 'strip-blanks') {
        result = target.replace(/\n\s*\n/g, '\n').trim();
      }

      if (selected) {
        textarea.value = val.substring(0, start) + result + val.substring(end);
      } else {
        textarea.value = result;
      }
      updateStats();
    });
  });

  // Find & Replace controller
  const btnToggleFind = toolbar.querySelector('.dc-btn-toggle-find');
  const findInput = findBar.querySelector('.dc-find-input');
  const replaceInput = findBar.querySelector('.dc-replace-input');
  const findMatches = findBar.querySelector('.dc-find-matches');
  const btnReplaceNext = findBar.querySelector('.dc-btn-replace-next');
  const btnReplaceAll = findBar.querySelector('.dc-btn-replace-all');
  const btnCloseFind = findBar.querySelector('.dc-btn-close-find');

  btnToggleFind.addEventListener('click', () => {
    findBar.classList.toggle('hidden');
    if (!findBar.classList.contains('hidden')) findInput.focus();
  });

  btnCloseFind.addEventListener('click', () => {
    findBar.classList.add('hidden');
  });

  const countMatches = () => {
    const query = findInput.value;
    if (!query) {
      findMatches.textContent = '0 matches';
      return;
    }
    const val = textarea.value;
    const re = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = (val.match(re) || []).length;
    findMatches.textContent = `${matches} match${matches === 1 ? '' : 'es'}`;
  };

  findInput.addEventListener('input', countMatches);

  btnReplaceNext.addEventListener('click', () => {
    const q = findInput.value;
    const r = replaceInput.value;
    if (!q) return;
    const val = textarea.value;
    const idx = val.toLowerCase().indexOf(q.toLowerCase(), textarea.selectionEnd);
    const targetIdx = idx !== -1 ? idx : val.toLowerCase().indexOf(q.toLowerCase());
    if (targetIdx !== -1) {
      textarea.value = val.substring(0, targetIdx) + r + val.substring(targetIdx + q.length);
      textarea.selectionStart = targetIdx;
      textarea.selectionEnd = targetIdx + r.length;
      textarea.focus();
      updateStats();
      countMatches();
    } else {
      notifyUser(`No matches found for "${q}"`);
    }
  });

  btnReplaceAll.addEventListener('click', () => {
    const q = findInput.value;
    const r = replaceInput.value;
    if (!q) return;
    const val = textarea.value;
    const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const count = (val.match(re) || []).length;
    if (count > 0) {
      textarea.value = val.replace(re, r);
      updateStats();
      countMatches();
      notifyUser(`Replaced ${count} occurrence${count === 1 ? '' : 's'}.`, 'success');
    } else {
      notifyUser(`No matches found for "${q}"`);
    }
  });

  // Side-by-side Proofreader toggle
  if (btnSideBySide) {
    btnSideBySide.addEventListener('click', () => {
      const mainWorkspace = container ? container.closest('.grid') : null;
      if (mainWorkspace) {
        mainWorkspace.classList.toggle('dc-side-by-side-active');
        if (mainWorkspace.classList.contains('dc-side-by-side-active')) {
          btnSideBySide.textContent = '📄 Stack View';
          btnSideBySide.classList.add('bg-[#6366F1]', 'text-white');
        } else {
          btnSideBySide.textContent = '👁️ Split View';
          btnSideBySide.classList.remove('bg-[#6366F1]', 'text-white');
        }
      }
    });
  }

  // Quick download buttons on toolbar
  const btnQuickDocx = toolbar.querySelector('.dc-btn-quick-docx');
  const btnQuickPdf = toolbar.querySelector('.dc-btn-quick-pdf');

  if (btnQuickDocx) {
    btnQuickDocx.addEventListener('click', () => {
      const base = getBaseFilename ? getBaseFilename() : 'ocr-document';
      downloadDocx(textarea.value, `${base}.docx`);
    });
  }

  if (btnQuickPdf) {
    btnQuickPdf.addEventListener('click', () => {
      const base = getBaseFilename ? getBaseFilename() : 'ocr-document';
      downloadSearchablePdf(textarea.value, `${base}.pdf`);
    });
  }

  // Export action footer buttons
  const btnCopyMain = exportFooter.querySelector('.dc-btn-copy-main');
  const btnDlTxt = exportFooter.querySelector('.dc-btn-download-txt');
  const btnOpenHub = exportFooter.querySelector('.dc-btn-open-export-hub');
  const btnClear = exportFooter.querySelector('.dc-btn-clear-editor');

  if (btnCopyMain) {
    btnCopyMain.addEventListener('click', () => copyToClipboard(textarea.value, btnCopyMain));
  }

  if (btnDlTxt) {
    btnDlTxt.addEventListener('click', () => {
      const base = getBaseFilename ? getBaseFilename() : 'ocr-document';
      downloadTxt(textarea.value, `${base}.txt`);
    });
  }

  if (btnOpenHub) {
    btnOpenHub.addEventListener('click', () => {
      const base = getBaseFilename ? getBaseFilename() : 'ocr-document';
      openExportFormatDrawer(textarea.value, base);
    });
  }

  if (btnClear) {
    btnClear.addEventListener('click', () => {
      textarea.value = '';
      updateStats();
      if (statAccuracy) {
        statAccuracy.textContent = 'Ready';
        statAccuracy.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
      }
    });
  }

  // Initial stats calculation
  updateStats();

  return {
    updateStats,
    setAccuracy: (conf) => {
      if (statAccuracy) {
        statAccuracy.textContent = `${conf}% Confidence`;
        statAccuracy.className = conf >= 85
          ? 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400'
          : (conf >= 65
            ? 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400'
            : 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-400');
      }
    }
  };
}

// ─────────────────────────────────────────────────────────────────
// DOM READY & TOOL SUITE INITIALIZATION
// ─────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {

  // Helper: Safely run Tesseract recognition with progress feedback
  const runTesseract = async (imageSource, lang = 'eng', onProgress = null) => {
    if (typeof Tesseract === 'undefined') {
      throw new Error('Tesseract OCR engine is loading. Please check your internet connection or try again.');
    }
    const result = await Tesseract.recognize(
      imageSource,
      lang,
      {
        logger: m => {
          if (onProgress && m) {
            onProgress(m.status || 'Processing', Math.round((m.progress || 0) * 100));
          }
        }
      }
    );
    return result.data;
  };

  // Helper: Image file to Image element
  const fileToImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Helper: High-contrast binarization canvas
  const binarizeCanvas = (img, threshold = 135) => {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      const val = gray > threshold ? 255 : 0;
      d[i] = val;
      d[i + 1] = val;
      d[i + 2] = val;
    }
    ctx.putImageData(imgData, 0, 0);
    return canvas;
  };

  // Helper: Invert colors canvas
  const invertCanvas = (img) => {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      d[i] = 255 - d[i];
      d[i + 1] = 255 - d[i + 1];
      d[i + 2] = 255 - d[i + 2];
    }
    ctx.putImageData(imgData, 0, 0);
    return canvas;
  };

  // Helper: Attach drag & drop handlers to dropzone
  const setupDropZone = (dropZoneEl, onFiles) => {
    if (!dropZoneEl) return;
    dropZoneEl.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZoneEl.classList.add('border-[#6366F1]');
    });
    dropZoneEl.addEventListener('dragleave', () => {
      dropZoneEl.classList.remove('border-[#6366F1]');
    });
    dropZoneEl.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZoneEl.classList.remove('border-[#6366F1]');
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
        onFiles(e.dataTransfer.files);
      }
    });
  };

  // ─────────────────────────────────────────────────────────────────
  // 1. IMAGE TO TEXT (UNIVERSAL OCR)
  // ─────────────────────────────────────────────────────────────────
  const ocrDropZone = document.getElementById('ocr-drop-zone');
  const ocrFileInput = document.getElementById('ocr-file-input');
  if (ocrDropZone && ocrFileInput) {
    const previewBox = document.getElementById('ocr-img-preview-box');
    const imgPreview = document.getElementById('ocr-img-preview');
    const imgInfo = document.getElementById('ocr-img-info');
    const langSelect = document.getElementById('ocr-lang-select');
    const btnRun = document.getElementById('btn-run-ocr');
    const progBox = document.getElementById('ocr-progress-container');
    const statusText = document.getElementById('ocr-status-text');
    const pctText = document.getElementById('ocr-progress-pct');
    const progressBar = document.getElementById('ocr-progress-bar');
    const outputText = document.getElementById('ocr-output-text');
    const binarizeToggle = document.getElementById('ocr-binarize-toggle');
    const invertToggle = document.getElementById('ocr-invert-toggle');

    let currentFile = null;
    let rawLoadedImg = null;

    // Mount In-Place Editor
    const editor = mountOcrEditor({
      container: outputText.parentNode,
      textarea: outputText,
      getBaseFilename: () => currentFile ? currentFile.name.replace(/\.[^/.]+$/, '') : 'image-text'
    });

    const refreshImagePreview = () => {
      if (!rawLoadedImg) return;
      let canvasSource = rawLoadedImg;
      if (binarizeToggle && binarizeToggle.checked) {
        canvasSource = binarizeCanvas(rawLoadedImg, 135);
      }
      if (invertToggle && invertToggle.checked) {
        canvasSource = invertCanvas(canvasSource);
      }
      if (imgPreview) {
        imgPreview.src = (canvasSource instanceof HTMLCanvasElement) ? canvasSource.toDataURL() : rawLoadedImg.src;
      }
    };

    if (binarizeToggle) binarizeToggle.addEventListener('change', refreshImagePreview);
    if (invertToggle) invertToggle.addEventListener('change', refreshImagePreview);

    const loadFile = async (file) => {
      if (!file) return;
      currentFile = file;
      rawLoadedImg = await fileToImage(file);
      if (imgPreview) imgPreview.src = rawLoadedImg.src;
      if (previewBox) previewBox.classList.remove('hidden');
      if (imgInfo) imgInfo.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
      refreshImagePreview();
    };

    ocrDropZone.addEventListener('click', () => ocrFileInput.click());
    setupDropZone(ocrDropZone, (files) => loadFile(files[0]));
    ocrFileInput.addEventListener('change', (e) => {
      if (e.target.files.length) loadFile(e.target.files[0]);
    });

    window.addEventListener('paste', (e) => {
      if (document.activeElement && (document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'INPUT')) return;
      if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length) {
        const file = e.clipboardData.files[0];
        if (file.type && file.type.startsWith('image/')) {
          loadFile(file);
        }
      }
    });

    if (btnRun) {
      btnRun.addEventListener('click', async () => {
        if (!rawLoadedImg && (!imgPreview || !imgPreview.src)) {
          notifyUser('Please upload or paste an image first.');
          return;
        }

        btnRun.disabled = true;
        if (progBox) progBox.classList.remove('hidden');
        if (progressBar) progressBar.style.width = '0%';
        if (pctText) pctText.textContent = '0%';
        if (statusText) statusText.textContent = 'Initializing OCR neural engine...';

        const lang = langSelect ? langSelect.value : 'eng';

        try {
          const source = imgPreview.src;
          const data = await runTesseract(source, lang, (status, pct) => {
            if (statusText) statusText.textContent = status + '...';
            if (pctText) pctText.textContent = pct + '%';
            if (progressBar) progressBar.style.width = pct + '%';
          });

          if (outputText) outputText.value = data.text || '';
          if (editor) {
            editor.updateStats();
            editor.setAccuracy(Math.round(data.confidence || 0));
          }
          notifyUser('Text extracted successfully!', 'success');
        } catch (err) {
          console.error(err);
          notifyUser('OCR Extraction Error: ' + err.message);
        } finally {
          btnRun.disabled = false;
        }
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // 2. SCREENSHOT TO TEXT OCR
  // ─────────────────────────────────────────────────────────────────
  const ssPasteZone = document.getElementById('ss-paste-zone');
  const ssFileInput = document.getElementById('ss-file-input');
  if (ssPasteZone && ssFileInput) {
    const previewContainer = document.getElementById('ss-preview-container');
    const progBox = document.getElementById('ss-progress-box');
    const statusText = document.getElementById('ss-status-text');
    const pctText = document.getElementById('ss-pct');
    const progressBar = document.getElementById('ss-bar');
    const outputText = document.getElementById('ss-output');

    let ssFile = null;

    const editor = mountOcrEditor({
      container: outputText.parentNode,
      textarea: outputText,
      getBaseFilename: () => ssFile ? ssFile.name.replace(/\.[^/.]+$/, '') : 'screenshot-text'
    });

    const handleScreenshot = async (file) => {
      if (!file) return;
      ssFile = file;
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target.result;
        if (previewContainer) {
          previewContainer.innerHTML = `<img src="${dataUrl}" class="max-h-56 rounded-lg shadow object-contain mx-auto" />`;
        }
        if (progBox) progBox.classList.remove('hidden');
        if (progressBar) progressBar.style.width = '0%';
        if (pctText) pctText.textContent = '0%';
        if (statusText) statusText.textContent = 'Scanning screenshot...';

        try {
          const data = await runTesseract(dataUrl, 'eng', (st, pct) => {
            if (statusText) statusText.textContent = st + '...';
            if (pctText) pctText.textContent = pct + '%';
            if (progressBar) progressBar.style.width = pct + '%';
          });
          if (outputText) outputText.value = data.text || '';
          if (editor) {
            editor.updateStats();
            editor.setAccuracy(Math.round(data.confidence || 0));
          }
          notifyUser('Screenshot text recognized!', 'success');
        } catch (err) {
          notifyUser('OCR Failed: ' + err.message);
        }
      };
      reader.readAsDataURL(file);
    };

    ssPasteZone.addEventListener('click', () => ssFileInput.click());
    setupDropZone(ssPasteZone, (files) => handleScreenshot(files[0]));
    ssFileInput.addEventListener('change', (e) => {
      if (e.target.files.length) handleScreenshot(e.target.files[0]);
    });

    window.addEventListener('paste', (e) => {
      if (document.activeElement && (document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'INPUT')) return;
      if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length) {
        const file = e.clipboardData.files[0];
        if (file.type && file.type.startsWith('image/')) {
          handleScreenshot(file);
        }
      }
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // 3. SCANNED PDF TO TEXT OCR (pdfleader.com/ocr-pdf Multi-Page Parity)
  // ─────────────────────────────────────────────────────────────────
  const pdfOcrDrop = document.getElementById('pdf-ocr-drop-zone');
  const pdfOcrFile = document.getElementById('pdf-ocr-file-input');
  if (pdfOcrDrop && pdfOcrFile) {
    const metaBox = document.getElementById('pdf-ocr-meta');
    const filenameEl = document.getElementById('pdf-ocr-filename');
    const pagesEl = document.getElementById('pdf-ocr-pages');
    const progBox = document.getElementById('pdf-ocr-progress-box');
    const statusText = document.getElementById('pdf-ocr-status');
    const pctText = document.getElementById('pdf-ocr-pct');
    const progressBar = document.getElementById('pdf-ocr-bar');
    const outputText = document.getElementById('pdf-ocr-output');

    // Multi-page navigation controls
    const navBar = document.getElementById('pdf-ocr-nav-bar');
    const btnPrevPage = document.getElementById('btn-pdf-prev-page');
    const btnNextPage = document.getElementById('btn-pdf-next-page');
    const pageNumDisplay = document.getElementById('pdf-page-display');
    const canvasPreview = document.getElementById('pdf-page-canvas');
    const btnOcrCurrentPage = document.getElementById('btn-ocr-current-page');
    const btnOcrAllPages = document.getElementById('btn-ocr-all-pages');

    let currentPdfDoc = null;
    let currentPdfFile = null;
    let activePage = 1;
    let totalPdfPages = 1;
    const pageTexts = {}; // map pageNum -> text

    const editor = mountOcrEditor({
      container: outputText.parentNode,
      textarea: outputText,
      getBaseFilename: () => currentPdfFile ? currentPdfFile.name.replace(/\.pdf$/i, '') : 'scanned-pdf-text'
    });

    const renderActivePagePreview = async (pageNum) => {
      if (!currentPdfDoc) return;
      try {
        const page = await currentPdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.5 });
        if (canvasPreview) {
          canvasPreview.width = viewport.width;
          canvasPreview.height = viewport.height;
          const ctx = canvasPreview.getContext('2d');
          await page.render({ canvasContext: ctx, viewport }).promise;
          canvasPreview.classList.remove('hidden');
        }
        if (pageNumDisplay) pageNumDisplay.textContent = `Page ${pageNum} of ${totalPdfPages}`;
      } catch (err) {
        console.error('Failed to render PDF page preview:', err);
      }
    };

    const performOcrOnPage = async (pageNum) => {
      const page = await currentPdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      await page.render({ canvasContext: ctx, viewport }).promise;

      const data = await runTesseract(canvas, 'eng', (st, p) => {
        if (statusText) statusText.textContent = `Page ${pageNum}: ${st}...`;
        if (pctText) pctText.textContent = `${p}%`;
        if (progressBar) progressBar.style.width = `${p}%`;
      });
      return data;
    };

    const handlePdf = async (file) => {
      if (!file) return;
      currentPdfFile = file;
      if (filenameEl) filenameEl.textContent = file.name;
      if (metaBox) metaBox.classList.remove('hidden');
      if (navBar) navBar.classList.remove('hidden');

      try {
        const arrayBuffer = await file.arrayBuffer();
        if (typeof pdfjsLib === 'undefined') {
          notifyUser('PDF.js library is loading. Please try again in a moment.');
          return;
        }

        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        currentPdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        totalPdfPages = currentPdfDoc.numPages;
        activePage = 1;

        if (pagesEl) pagesEl.textContent = `${totalPdfPages} Page${totalPdfPages > 1 ? 's' : ''}`;
        await renderActivePagePreview(1);
      } catch (err) {
        console.error(err);
        notifyUser('Failed to load PDF: ' + err.message);
      }
    };

    if (btnPrevPage) {
      btnPrevPage.addEventListener('click', async () => {
        if (activePage > 1) {
          activePage--;
          await renderActivePagePreview(activePage);
        }
      });
    }

    if (btnNextPage) {
      btnNextPage.addEventListener('click', async () => {
        if (activePage < totalPdfPages) {
          activePage++;
          await renderActivePagePreview(activePage);
        }
      });
    }

    // OCR Current Page
    if (btnOcrCurrentPage) {
      btnOcrCurrentPage.addEventListener('click', async () => {
        if (!currentPdfDoc) {
          notifyUser('Please upload a PDF document first.');
          return;
        }
        if (progBox) progBox.classList.remove('hidden');
        if (progressBar) progressBar.style.width = '0%';
        if (statusText) statusText.textContent = `Extracting Page ${activePage}...`;

        try {
          btnOcrCurrentPage.disabled = true;
          const data = await performOcrOnPage(activePage);
          pageTexts[activePage] = data.text || '';

          // Update editor with current page text or append
          outputText.value = `--- PAGE ${activePage} ---\n\n` + (data.text || '');
          if (editor) {
            editor.updateStats();
            editor.setAccuracy(Math.round(data.confidence || 0));
          }
          if (statusText) statusText.textContent = `✅ Page ${activePage} extracted!`;
          if (pctText) pctText.textContent = '100%';
          if (progressBar) progressBar.style.width = '100%';
          notifyUser(`Page ${activePage} OCR complete!`, 'success');
        } catch (e) {
          notifyUser('Page OCR Error: ' + e.message);
        } finally {
          btnOcrCurrentPage.disabled = false;
        }
      });
    }

    // OCR All Pages
    if (btnOcrAllPages) {
      btnOcrAllPages.addEventListener('click', async () => {
        if (!currentPdfDoc) {
          notifyUser('Please upload a PDF document first.');
          return;
        }
        if (progBox) progBox.classList.remove('hidden');
        if (progressBar) progressBar.style.width = '0%';
        btnOcrAllPages.disabled = true;

        try {
          let fullDocText = '';
          let totalConfidence = 0;

          for (let p = 1; p <= totalPdfPages; p++) {
            if (statusText) statusText.textContent = `Processing Page ${p} of ${totalPdfPages}...`;
            const overallPct = Math.round(((p - 1) / totalPdfPages) * 100);
            if (progressBar) progressBar.style.width = `${overallPct}%`;
            if (pctText) pctText.textContent = `${overallPct}%`;

            const data = await performOcrOnPage(p);
            pageTexts[p] = data.text || '';
            totalConfidence += (data.confidence || 0);

            fullDocText += `--- PAGE ${p} of ${totalPdfPages} ---\n\n` + (data.text || '') + '\n\n';
            outputText.value = fullDocText;
            if (editor) editor.updateStats();
          }

          if (editor) {
            editor.setAccuracy(Math.round(totalConfidence / totalPdfPages));
          }
          if (statusText) statusText.textContent = '✅ All PDF pages successfully extracted!';
          if (pctText) pctText.textContent = '100%';
          if (progressBar) progressBar.style.width = '100%';
          notifyUser('Full PDF OCR extraction complete!', 'success');
        } catch (err) {
          notifyUser('Batch PDF OCR Error: ' + err.message);
        } finally {
          btnOcrAllPages.disabled = false;
        }
      });
    }

    pdfOcrDrop.addEventListener('click', () => pdfOcrFile.click());
    setupDropZone(pdfOcrDrop, (files) => handlePdf(files[0]));
    pdfOcrFile.addEventListener('change', (e) => {
      if (e.target.files.length) handlePdf(e.target.files[0]);
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // 4. HANDWRITING TO TEXT OCR
  // ─────────────────────────────────────────────────────────────────
  const hwDrop = document.getElementById('hw-drop-zone');
  const hwFile = document.getElementById('hw-file-input');
  if (hwDrop && hwFile) {
    const previewBox = document.getElementById('hw-preview-box');
    const imgPreview = document.getElementById('hw-img-preview');
    const binarizeToggle = document.getElementById('hw-binarize-toggle');
    const btnRun = document.getElementById('btn-run-hw');
    const progBox = document.getElementById('hw-progress-box');
    const statusText = document.getElementById('hw-status');
    const pctText = document.getElementById('hw-pct');
    const progressBar = document.getElementById('hw-bar');
    const outputText = document.getElementById('hw-output');

    let rawImg = null;

    const editor = mountOcrEditor({
      container: outputText.parentNode,
      textarea: outputText,
      getBaseFilename: () => 'handwritten-notes'
    });

    const updatePreview = () => {
      if (!rawImg) return;
      if (binarizeToggle && binarizeToggle.checked) {
        const binCanvas = binarizeCanvas(rawImg, 140);
        imgPreview.src = binCanvas.toDataURL();
      } else {
        imgPreview.src = rawImg.src;
      }
      previewBox.classList.remove('hidden');
    };

    const loadHwFile = async (file) => {
      if (!file) return;
      rawImg = await fileToImage(file);
      updatePreview();
    };

    hwDrop.addEventListener('click', () => hwFile.click());
    setupDropZone(hwDrop, (files) => loadHwFile(files[0]));
    hwFile.addEventListener('change', async (e) => {
      if (e.target.files.length) loadHwFile(e.target.files[0]);
    });

    if (binarizeToggle) binarizeToggle.addEventListener('change', updatePreview);

    if (btnRun) {
      btnRun.addEventListener('click', async () => {
        if (!rawImg) {
          notifyUser('Please upload a handwritten note image first.');
          return;
        }
        if (progBox) progBox.classList.remove('hidden');
        if (progressBar) progressBar.style.width = '0%';
        if (pctText) pctText.textContent = '0%';
        if (statusText) statusText.textContent = 'Processing handwriting...';
        btnRun.disabled = true;

        try {
          const source = (binarizeToggle && binarizeToggle.checked) ? binarizeCanvas(rawImg, 140) : rawImg.src;
          const data = await runTesseract(source, 'eng', (st, p) => {
            if (statusText) statusText.textContent = st + '...';
            if (pctText) pctText.textContent = p + '%';
            if (progressBar) progressBar.style.width = p + '%';
          });
          if (outputText) outputText.value = data.text || '';
          if (editor) {
            editor.updateStats();
            editor.setAccuracy(Math.round(data.confidence || 0));
          }
          notifyUser('Handwriting recognized successfully!', 'success');
        } catch (err) {
          notifyUser('OCR Error: ' + err.message);
        } finally {
          btnRun.disabled = false;
        }
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // 5. RECEIPT & INVOICE OCR
  // ─────────────────────────────────────────────────────────────────
  const recDrop = document.getElementById('rec-drop-zone');
  const recFile = document.getElementById('rec-file-input');
  if (recDrop && recFile) {
    const previewBox = document.getElementById('rec-preview-box');
    const imgPreview = document.getElementById('rec-img-preview');
    const btnRun = document.getElementById('btn-run-rec');
    const progBox = document.getElementById('rec-progress-box');
    const statusText = document.getElementById('rec-status');
    const pctText = document.getElementById('rec-pct');
    const progressBar = document.getElementById('rec-bar');
    const valMerchant = document.getElementById('rec-val-merchant');
    const valDate = document.getElementById('rec-val-date');
    const valTax = document.getElementById('rec-val-tax');
    const valTotal = document.getElementById('rec-val-total');
    const recBadge = document.getElementById('rec-badge');
    const fullText = document.getElementById('rec-full-text');

    let loadedImg = null;

    let editor = null;
    if (fullText) {
      editor = mountOcrEditor({
        container: fullText.parentNode,
        textarea: fullText,
        getBaseFilename: () => 'receipt-invoice-ocr'
      });
    }

    const loadRecFile = async (file) => {
      if (!file) return;
      loadedImg = await fileToImage(file);
      if (imgPreview) imgPreview.src = loadedImg.src;
      if (previewBox) previewBox.classList.remove('hidden');
    };

    recDrop.addEventListener('click', () => recFile.click());
    setupDropZone(recDrop, (files) => loadRecFile(files[0]));
    recFile.addEventListener('change', async (e) => {
      if (e.target.files.length) loadRecFile(e.target.files[0]);
    });

    if (btnRun) {
      btnRun.addEventListener('click', async () => {
        if (!loadedImg) {
          notifyUser('Please upload a receipt image first.');
          return;
        }
        if (progBox) progBox.classList.remove('hidden');
        if (progressBar) progressBar.style.width = '0%';
        if (pctText) pctText.textContent = '0%';
        if (statusText) statusText.textContent = 'Scanning receipt data...';
        btnRun.disabled = true;

        try {
          const data = await runTesseract(loadedImg.src, 'eng', (st, p) => {
            if (statusText) statusText.textContent = st + '...';
            if (pctText) pctText.textContent = p + '%';
            if (progressBar) progressBar.style.width = p + '%';
          });

          const raw = data.text || '';
          if (fullText) fullText.value = raw;
          if (editor) {
            editor.updateStats();
            editor.setAccuracy(Math.round(data.confidence || 0));
          }

          const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);

          const merchant = lines.length ? lines[0].replace(/[^a-zA-Z0-9\s&'-]/g, '') : 'Unknown Vendor';

          let dateFound = '--';
          const dateRegex = /\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})\b|\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}\b/i;
          for (const l of lines) {
            const m = l.match(dateRegex);
            if (m) {
              dateFound = m[0];
              break;
            }
          }

          let maxAmount = 0;
          let taxAmount = '--';
          const moneyRegex = /\$?\s*(\d+[.,]\d{2})/g;

          for (const l of lines) {
            const lower = l.toLowerCase();
            if (lower.includes('tax') || lower.includes('vat') || lower.includes('gst')) {
              const tm = l.match(moneyRegex);
              if (tm) taxAmount = tm[0];
            }
            if (lower.includes('total') || lower.includes('amount due') || lower.includes('balance')) {
              let match;
              while ((match = moneyRegex.exec(l)) !== null) {
                const parsed = parseFloat(match[1].replace(',', '.'));
                if (parsed > maxAmount) maxAmount = parsed;
              }
            }
          }

          if (maxAmount === 0) {
            for (const l of lines) {
              let match;
              while ((match = moneyRegex.exec(l)) !== null) {
                const parsed = parseFloat(match[1].replace(',', '.'));
                if (parsed > maxAmount) maxAmount = parsed;
              }
            }
          }

          if (valMerchant) valMerchant.textContent = merchant;
          if (valDate) valDate.textContent = dateFound;
          if (valTax) valTax.textContent = taxAmount;
          if (valTotal) valTotal.textContent = maxAmount > 0 ? ('$' + maxAmount.toFixed(2)) : '--';

          if (recBadge) {
            recBadge.textContent = '✅ Parsed Successfully';
            recBadge.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400';
          }
          notifyUser('Receipt parsed and loaded into editor!', 'success');
        } catch (err) {
          notifyUser('Error: ' + err.message);
        } finally {
          btnRun.disabled = false;
        }
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // 6. BUSINESS CARD TO VCARD OCR
  // ─────────────────────────────────────────────────────────────────
  const bcDrop = document.getElementById('bc-drop-zone');
  const bcFile = document.getElementById('bc-file-input');
  if (bcDrop && bcFile) {
    const previewBox = document.getElementById('bc-preview-box');
    const imgPreview = document.getElementById('bc-img-preview');
    const btnRun = document.getElementById('btn-run-bc');
    const progBox = document.getElementById('bc-progress-box');
    const statusText = document.getElementById('bc-status');
    const pctText = document.getElementById('bc-pct');
    const progressBar = document.getElementById('bc-bar');

    const inpName = document.getElementById('bc-name');
    const inpTitle = document.getElementById('bc-title');
    const inpPhone = document.getElementById('bc-phone');
    const inpEmail = document.getElementById('bc-email');
    const inpWebsite = document.getElementById('bc-website');
    const btnVcard = document.getElementById('btn-download-vcard');
    const bcRawText = document.getElementById('bc-raw-text');

    let loadedImg = null;

    let editor = null;
    if (bcRawText) {
      editor = mountOcrEditor({
        container: bcRawText.parentNode,
        textarea: bcRawText,
        getBaseFilename: () => inpName && inpName.value.trim() ? inpName.value.trim() : 'business-card'
      });
    }

    const loadBcFile = async (file) => {
      if (!file) return;
      loadedImg = await fileToImage(file);
      if (imgPreview) imgPreview.src = loadedImg.src;
      if (previewBox) previewBox.classList.remove('hidden');
    };

    bcDrop.addEventListener('click', () => bcFile.click());
    setupDropZone(bcDrop, (files) => loadBcFile(files[0]));
    bcFile.addEventListener('change', async (e) => {
      if (e.target.files.length) loadBcFile(e.target.files[0]);
    });

    if (btnRun) {
      btnRun.addEventListener('click', async () => {
        if (!loadedImg) {
          notifyUser('Please upload a business card photo first.');
          return;
        }
        if (progBox) progBox.classList.remove('hidden');
        if (progressBar) progressBar.style.width = '0%';
        if (pctText) pctText.textContent = '0%';
        if (statusText) statusText.textContent = 'Reading business card...';
        btnRun.disabled = true;

        try {
          const data = await runTesseract(loadedImg.src, 'eng', (st, p) => {
            if (statusText) statusText.textContent = st + '...';
            if (pctText) pctText.textContent = p + '%';
            if (progressBar) progressBar.style.width = p + '%';
          });

          const raw = data.text || '';
          if (bcRawText) bcRawText.value = raw;
          if (editor) {
            editor.updateStats();
            editor.setAccuracy(Math.round(data.confidence || 0));
          }

          const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);

          let detectedEmail = '';
          let detectedPhone = '';
          let detectedWebsite = '';
          let nameCandidate = '';
          let titleCandidate = '';

          const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/;
          const phoneRegex = /(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/;
          const urlRegex = /(https?:\/\/[^\s]+|www\.[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;

          lines.forEach((l, idx) => {
            if (!detectedEmail && l.match(emailRegex)) {
              detectedEmail = l.match(emailRegex)[0];
              return;
            }
            if (!detectedPhone && l.match(phoneRegex)) {
              detectedPhone = l.match(phoneRegex)[0];
              return;
            }
            if (!detectedWebsite && l.match(urlRegex)) {
              detectedWebsite = l.match(urlRegex)[0];
              return;
            }
            if (!nameCandidate && idx === 0 && l.length < 35) {
              nameCandidate = l;
            } else if (!titleCandidate && idx === 1 && l.length < 50) {
              titleCandidate = l;
            }
          });

          if (inpName) inpName.value = nameCandidate || 'Contact Name';
          if (inpTitle) inpTitle.value = titleCandidate || 'Professional Title';
          if (inpPhone) inpPhone.value = detectedPhone || '';
          if (inpEmail) inpEmail.value = detectedEmail || '';
          if (inpWebsite) inpWebsite.value = detectedWebsite || '';

          notifyUser('Business card parsed into vCard and Editor!', 'success');
        } catch (err) {
          notifyUser('OCR Error: ' + err.message);
        } finally {
          btnRun.disabled = false;
        }
      });
    }

    if (btnVcard) {
      btnVcard.addEventListener('click', () => {
        const name = inpName ? inpName.value.trim() : 'Contact';
        const title = inpTitle ? inpTitle.value.trim() : '';
        const phone = inpPhone ? inpPhone.value.trim() : '';
        const email = inpEmail ? inpEmail.value.trim() : '';
        const website = inpWebsite ? inpWebsite.value.trim() : '';

        const vcardText = [
          'BEGIN:VCARD',
          'VERSION:3.0',
          `FN:${name}`,
          `N:;${name};;;`,
          title ? `TITLE:${title}` : '',
          phone ? `TEL;TYPE=CELL:${phone}` : '',
          email ? `EMAIL;TYPE=WORK:${email}` : '',
          website ? `URL:${website}` : '',
          'END:VCARD'
        ].filter(Boolean).join('\r\n');

        const cleanFilename = name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '.vcf';
        downloadTxt(vcardText, cleanFilename);
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // 7. CODE SCREENSHOT TO TEXT OCR
  // ─────────────────────────────────────────────────────────────────
  const codeDrop = document.getElementById('code-drop-zone');
  const codeFile = document.getElementById('code-file-input');
  if (codeDrop && codeFile) {
    const previewBox = document.getElementById('code-preview-box');
    const imgPreview = document.getElementById('code-img-preview');
    const btnRun = document.getElementById('btn-run-code-ocr');
    const progBox = document.getElementById('code-progress-box');
    const statusText = document.getElementById('code-status');
    const pctText = document.getElementById('code-pct');
    const progressBar = document.getElementById('code-bar');
    const outputText = document.getElementById('code-output');

    let loadedImg = null;

    const editor = mountOcrEditor({
      container: outputText.parentNode,
      textarea: outputText,
      getBaseFilename: () => 'code-snippet'
    });

    const loadCodeFile = async (file) => {
      if (!file) return;
      loadedImg = await fileToImage(file);
      if (imgPreview) imgPreview.src = loadedImg.src;
      if (previewBox) previewBox.classList.remove('hidden');
    };

    codeDrop.addEventListener('click', () => codeFile.click());
    setupDropZone(codeDrop, (files) => loadCodeFile(files[0]));
    codeFile.addEventListener('change', async (e) => {
      if (e.target.files.length) loadCodeFile(e.target.files[0]);
    });

    if (btnRun) {
      btnRun.addEventListener('click', async () => {
        if (!loadedImg) {
          notifyUser('Please upload a code screenshot first.');
          return;
        }
        if (progBox) progBox.classList.remove('hidden');
        if (progressBar) progressBar.style.width = '0%';
        if (pctText) pctText.textContent = '0%';
        if (statusText) statusText.textContent = 'Transcribing code symbols...';
        btnRun.disabled = true;

        try {
          const data = await runTesseract(loadedImg.src, 'eng', (st, p) => {
            if (statusText) statusText.textContent = st + '...';
            if (pctText) pctText.textContent = p + '%';
            if (progressBar) progressBar.style.width = p + '%';
          });

          let codeText = (data.text || '')
            .replace(/[“”]/g, '"')
            .replace(/[‘’]/g, "'")
            .replace(/—/g, '--');

          if (outputText) outputText.value = codeText;
          if (editor) {
            editor.updateStats();
            editor.setAccuracy(Math.round(data.confidence || 0));
          }
          notifyUser('Code extracted and syntax standardized!', 'success');
        } catch (err) {
          notifyUser('Code OCR Error: ' + err.message);
        } finally {
          btnRun.disabled = false;
        }
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // 8. TABLE / DATA TO CSV OCR
  // ─────────────────────────────────────────────────────────────────
  const tabDrop = document.getElementById('tab-drop-zone');
  const tabFile = document.getElementById('tab-file-input');
  if (tabDrop && tabFile) {
    const previewBox = document.getElementById('tab-preview-box');
    const imgPreview = document.getElementById('tab-img-preview');
    const btnRun = document.getElementById('btn-run-tab');
    const progBox = document.getElementById('tab-progress-box');
    const statusText = document.getElementById('tab-status');
    const pctText = document.getElementById('tab-pct');
    const progressBar = document.getElementById('tab-bar');
    const csvOutput = document.getElementById('tab-csv-output');
    const htmlRender = document.getElementById('tab-html-render');

    let loadedImg = null;

    let editor = null;
    if (csvOutput) {
      editor = mountOcrEditor({
        container: csvOutput.parentNode,
        textarea: csvOutput,
        getBaseFilename: () => 'table-data'
      });
    }

    const loadTabFile = async (file) => {
      if (!file) return;
      loadedImg = await fileToImage(file);
      if (imgPreview) imgPreview.src = loadedImg.src;
      if (previewBox) previewBox.classList.remove('hidden');
    };

    tabDrop.addEventListener('click', () => tabFile.click());
    setupDropZone(tabDrop, (files) => loadTabFile(files[0]));
    tabFile.addEventListener('change', async (e) => {
      if (e.target.files.length) loadTabFile(e.target.files[0]);
    });

    if (btnRun) {
      btnRun.addEventListener('click', async () => {
        if (!loadedImg) {
          notifyUser('Please upload a table image first.');
          return;
        }
        if (progBox) progBox.classList.remove('hidden');
        if (progressBar) progressBar.style.width = '0%';
        if (pctText) pctText.textContent = '0%';
        if (statusText) statusText.textContent = 'Detecting tabular cells...';
        btnRun.disabled = true;

        try {
          const data = await runTesseract(loadedImg.src, 'eng', (st, p) => {
            if (statusText) statusText.textContent = st + '...';
            if (pctText) pctText.textContent = p + '%';
            if (progressBar) progressBar.style.width = p + '%';
          });

          const raw = data.text || '';
          const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);

          const csvRows = [];
          let tableHtml = '<table class="w-full text-left border-collapse text-xs font-mono">';

          lines.forEach((line, rIdx) => {
            const cols = line.includes('|')
              ? line.split('|').map(c => c.trim()).filter(Boolean)
              : line.split(/\s{2,}|\t/).map(c => c.trim()).filter(Boolean);

            if (cols.length) {
              const csvRow = cols.map(c => `"${c.replace(/"/g, '""')}"`).join(',');
              csvRows.push(csvRow);

              tableHtml += '<tr class="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900">';
              cols.forEach(c => {
                if (rIdx === 0) {
                  tableHtml += `<th class="p-2 font-bold bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white">${escapeXml(c)}</th>`;
                } else {
                  tableHtml += `<td class="p-2 text-slate-700 dark:text-slate-300">${escapeXml(c)}</td>`;
                }
              });
              tableHtml += '</tr>';
            }
          });

          tableHtml += '</table>';

          const finalCsv = csvRows.join('\n');
          if (csvOutput) csvOutput.value = finalCsv;
          if (htmlRender) htmlRender.innerHTML = tableHtml;
          if (editor) {
            editor.updateStats();
            editor.setAccuracy(Math.round(data.confidence || 0));
          }
          notifyUser('Table parsed into CSV and interactive editor!', 'success');
        } catch (err) {
          notifyUser('Table OCR Error: ' + err.message);
        } finally {
          btnRun.disabled = false;
        }
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // 9. NUMBERS & DIGITS ONLY OCR
  // ─────────────────────────────────────────────────────────────────
  const numDrop = document.getElementById('num-drop-zone');
  const numFile = document.getElementById('num-file-input');
  if (numDrop && numFile) {
    const previewBox = document.getElementById('num-preview-box');
    const imgPreview = document.getElementById('num-img-preview');
    const btnRun = document.getElementById('btn-run-num');
    const progBox = document.getElementById('num-progress-box');
    const statusText = document.getElementById('num-status');
    const pctText = document.getElementById('num-pct');
    const progressBar = document.getElementById('num-bar');

    const largeDisplay = document.getElementById('num-large-display');
    const digitCount = document.getElementById('num-digit-count');
    const multilineOutput = document.getElementById('num-multiline-output');

    let loadedImg = null;

    let editor = null;
    if (multilineOutput) {
      editor = mountOcrEditor({
        container: multilineOutput.parentNode,
        textarea: multilineOutput,
        getBaseFilename: () => 'numbers-digits'
      });
    }

    const loadNumFile = async (file) => {
      if (!file) return;
      loadedImg = await fileToImage(file);
      if (imgPreview) imgPreview.src = loadedImg.src;
      if (previewBox) previewBox.classList.remove('hidden');
    };

    numDrop.addEventListener('click', () => numFile.click());
    setupDropZone(numDrop, (files) => loadNumFile(files[0]));
    numFile.addEventListener('change', async (e) => {
      if (e.target.files.length) loadNumFile(e.target.files[0]);
    });

    if (btnRun) {
      btnRun.addEventListener('click', async () => {
        if (!loadedImg) {
          notifyUser('Please upload an image with numbers first.');
          return;
        }
        if (progBox) progBox.classList.remove('hidden');
        if (progressBar) progressBar.style.width = '0%';
        if (pctText) pctText.textContent = '0%';
        if (statusText) statusText.textContent = 'Extracting numeric characters...';
        btnRun.disabled = true;

        try {
          const data = await runTesseract(loadedImg.src, 'eng', (st, p) => {
            if (statusText) statusText.textContent = st + '...';
            if (pctText) pctText.textContent = p + '%';
            if (progressBar) progressBar.style.width = p + '%';
          });

          const raw = data.text || '';
          const filteredLines = raw.split('\n')
            .map(line => line.replace(/[^0-9\.\-\/\s]/g, '').trim())
            .filter(Boolean);

          const joinedDigits = filteredLines.join(' ');
          const digitsOnly = joinedDigits.replace(/[^0-9]/g, '');

          if (largeDisplay) largeDisplay.textContent = joinedDigits || 'No Digits Detected';
          if (digitCount) digitCount.textContent = digitsOnly.length.toLocaleString();
          if (multilineOutput) multilineOutput.value = filteredLines.join('\n');
          if (editor) {
            editor.updateStats();
            editor.setAccuracy(Math.round(data.confidence || 0));
          }
          notifyUser('Digits extracted successfully!', 'success');
        } catch (err) {
          notifyUser('Digits OCR Error: ' + err.message);
        } finally {
          btnRun.disabled = false;
        }
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // 10. MULTI-LANGUAGE OCR SCANNER
  // ─────────────────────────────────────────────────────────────────
  const mlDrop = document.getElementById('ml-drop-zone');
  const mlFile = document.getElementById('ml-file-input');
  if (mlDrop && mlFile) {
    const langSelect = document.getElementById('ml-lang-select');
    const previewBox = document.getElementById('ml-preview-box');
    const imgPreview = document.getElementById('ml-img-preview');
    const btnRun = document.getElementById('btn-run-ml');
    const progBox = document.getElementById('ml-progress-box');
    const statusText = document.getElementById('ml-status');
    const pctText = document.getElementById('ml-pct');
    const progressBar = document.getElementById('ml-bar');
    const outputText = document.getElementById('ml-output');

    let loadedImg = null;

    const editor = mountOcrEditor({
      container: outputText.parentNode,
      textarea: outputText,
      getBaseFilename: () => {
        const lang = langSelect ? langSelect.value : 'doc';
        return `${lang}-multilingual-ocr`;
      }
    });

    const loadMlFile = async (file) => {
      if (!file) return;
      loadedImg = await fileToImage(file);
      if (imgPreview) imgPreview.src = loadedImg.src;
      if (previewBox) previewBox.classList.remove('hidden');
    };

    mlDrop.addEventListener('click', () => mlFile.click());
    setupDropZone(mlDrop, (files) => loadMlFile(files[0]));
    mlFile.addEventListener('change', async (e) => {
      if (e.target.files.length) loadMlFile(e.target.files[0]);
    });

    if (btnRun) {
      btnRun.addEventListener('click', async () => {
        if (!loadedImg) {
          notifyUser('Please upload an image document first.');
          return;
        }
        const lang = langSelect ? langSelect.value : 'eng';
        if (progBox) progBox.classList.remove('hidden');
        if (progressBar) progressBar.style.width = '0%';
        if (pctText) pctText.textContent = '0%';
        if (statusText) statusText.textContent = `Loading ${lang.toUpperCase()} OCR neural model...`;
        btnRun.disabled = true;

        try {
          const data = await runTesseract(loadedImg.src, lang, (st, p) => {
            if (statusText) statusText.textContent = st + '...';
            if (pctText) pctText.textContent = p + '%';
            if (progressBar) progressBar.style.width = p + '%';
          });

          if (outputText) outputText.value = data.text || '';
          if (editor) {
            editor.updateStats();
            editor.setAccuracy(Math.round(data.confidence || 0));
          }
          notifyUser(`${lang.toUpperCase()} text recognized successfully!`, 'success');
        } catch (err) {
          notifyUser('Multilingual OCR Error: ' + err.message);
        } finally {
          btnRun.disabled = false;
        }
      });
    }
  }
});
