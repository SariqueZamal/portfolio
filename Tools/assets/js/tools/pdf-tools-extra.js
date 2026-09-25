/**
 * PDF Tools Extra Engines:
 * - PDF Page Rotator (uses pdf-lib)
 * - Text to PDF Converter (uses jsPDF)
 */


// Modern SaaS non-blocking notification helper
function notifyUser(msg, type = 'error') {
  if (typeof showToast === 'function') {
    showToast(msg, type);
  } else {
    console.warn(`[${type}] ${msg}`);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // ─────────────────────────────────────────────────────────────────
  // 1. PDF PAGE ROTATOR
  // ─────────────────────────────────────────────────────────────────
  const dropZone = document.getElementById('pdf-rot-drop-zone');
  const fileInput = document.getElementById('pdf-rot-file-input');
  const workspace = document.getElementById('pdf-rot-workspace');
  const filenameEl = document.getElementById('pdf-rot-filename');
  const pageCountEl = document.getElementById('pdf-rot-page-count');
  const rotGrid = document.getElementById('pdf-rot-grid');
  const statusEl = document.getElementById('pdf-rot-status');
  const btnSave = document.getElementById('btn-save-rotated-pdf');

  if (dropZone && fileInput && rotGrid) {
    let pdfDoc = null;
    let pdfBytes = null;
    let pageRotations = [];
    let currentFileName = 'document.pdf';

    const handlePdfFile = async (file) => {
      if (!file) return;
      currentFileName = file.name;
      if (statusEl) statusEl.textContent = 'Loading document pages into memory...';

      try {
        pdfBytes = await file.arrayBuffer();
        if (typeof PDFLib === 'undefined') {
          notifyUser('PDF-Lib is loading or unavailable. Please check your internet connection.');
          return;
        }
        pdfDoc = await PDFLib.PDFDocument.load(pdfBytes, { ignoreEncryption: true });
        const count = pdfDoc.getPageCount();

        if (filenameEl) filenameEl.textContent = file.name;
        if (pageCountEl) pageCountEl.textContent = count + (count === 1 ? ' Page' : ' Pages');

        pageRotations = [];
        rotGrid.innerHTML = '';

        for (let i = 0; i < count; i++) {
          const page = pdfDoc.getPage(i);
          const currentRotation = page.getRotation().angle || 0;
          pageRotations.push(currentRotation);

          const card = document.createElement('div');
          card.className = 'p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-between text-xs font-mono space-y-3';
          card.id = 'pdf-page-card-' + i;
          card.innerHTML = `
            <div class="flex items-center justify-between w-full">
              <span class="font-bold text-slate-700 dark:text-slate-300">Page ${i + 1}</span>
              <span class="page-rot-badge px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-[#6366F1]">${currentRotation}°</span>
            </div>
            <div class="w-full h-32 rounded-lg bg-slate-100 dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-800 flex items-center justify-center p-2 text-center text-slate-400">
              <div class="transform transition-transform duration-300 page-preview-icon" style="transform: rotate(${currentRotation}deg)">
                <div class="text-3xl">📄</div>
                <div class="text-[9px] mt-1 font-bold">P. ${i + 1}</div>
              </div>
            </div>
            <div class="flex items-center justify-center gap-2 w-full pt-1">
              <button type="button" class="btn-rot-left p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs" title="Rotate -90°">↺ -90°</button>
              <button type="button" class="btn-rot-right p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs" title="Rotate +90°">↻ +90°</button>
            </div>
          `;

          const btnLeft = card.querySelector('.btn-rot-left');
          const btnRight = card.querySelector('.btn-rot-right');

          btnLeft.addEventListener('click', () => rotateSinglePage(i, -90));
          btnRight.addEventListener('click', () => rotateSinglePage(i, 90));

          rotGrid.appendChild(card);
        }

        if (workspace) workspace.classList.remove('hidden');
        if (statusEl) statusEl.textContent = 'Document ready. Rotate pages and click Save.';
      } catch (err) {
        console.error('Error loading PDF:', err);
        notifyUser('Could not parse PDF file. Ensure the file is not password-protected.');
        if (statusEl) statusEl.textContent = 'Error parsing PDF document.';
      }
    };

    const updateCardVisual = (idx) => {
      const card = document.getElementById('pdf-page-card-' + idx);
      if (!card) return;
      const angle = pageRotations[idx];
      const badge = card.querySelector('.page-rot-badge');
      const icon = card.querySelector('.page-preview-icon');
      if (badge) badge.textContent = angle + '°';
      if (icon) icon.style.transform = 'rotate(' + angle + 'deg)';
    };

    const rotateSinglePage = (idx, delta) => {
      let angle = (pageRotations[idx] + delta) % 360;
      if (angle < 0) angle += 360;
      pageRotations[idx] = angle;
      updateCardVisual(idx);
    };

    const rotateAllPages = (delta) => {
      for (let i = 0; i < pageRotations.length; i++) {
        let angle = (pageRotations[i] + delta) % 360;
        if (angle < 0) angle += 360;
        pageRotations[i] = angle;
        updateCardVisual(i);
      }
    };

    const btnAllLeft = document.getElementById('btn-rot-all-left');
    const btnAllRight = document.getElementById('btn-rot-all-right');
    const btnAll180 = document.getElementById('btn-rot-all-180');

    if (btnAllLeft) btnAllLeft.addEventListener('click', () => rotateAllPages(-90));
    if (btnAllRight) btnAllRight.addEventListener('click', () => rotateAllPages(90));
    if (btnAll180) btnAll180.addEventListener('click', () => rotateAllPages(180));

    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('border-[#6366F1]');
    });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('border-[#6366F1]'));
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('border-[#6366F1]');
      if (e.dataTransfer.files.length) handlePdfFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length) handlePdfFile(e.target.files[0]);
    });

    if (btnSave) {
      btnSave.addEventListener('click', async () => {
        if (!pdfDoc) return;
        try {
          if (statusEl) statusEl.textContent = 'Applying page rotations and compiling PDF...';
          const pages = pdfDoc.getPages();
          for (let i = 0; i < pages.length; i++) {
            const rot = pageRotations[i];
            pages[i].setRotation(PDFLib.degrees(rot));
          }
          const savedBytes = await pdfDoc.save();
          const blob = new Blob([savedBytes], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          const cleanName = currentFileName.replace(/\.pdf$/i, '');
          a.download = cleanName + '-rotated.pdf';
          a.href = url;
          a.click();
          URL.revokeObjectURL(url);
          if (statusEl) statusEl.textContent = '✅ Rotated PDF downloaded successfully!';
        } catch (err) {
          console.error(err);
          notifyUser('Failed to save rotated PDF: ' + err.message);
        }
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // 2. TEXT TO PDF CONVERTER
  // ─────────────────────────────────────────────────────────────────
  const txtContent = document.getElementById('pdf-txt-content');
  const txtTitle = document.getElementById('pdf-txt-title');
  const txtFont = document.getElementById('pdf-txt-font');
  const txtSize = document.getElementById('pdf-txt-size');
  const txtMargin = document.getElementById('pdf-txt-margin');
  const txtPreviewBox = document.getElementById('pdf-txt-preview-box');
  const txtStats = document.getElementById('pdf-txt-stats');
  const btnGeneratePdf = document.getElementById('btn-generate-text-pdf');

  if (txtContent && txtPreviewBox && btnGeneratePdf) {
    const updatePreview = () => {
      const text = txtContent.value || '';
      const title = txtTitle ? txtTitle.value : '';
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      if (txtStats) txtStats.textContent = words.toLocaleString() + ' words';

      let html = '';
      if (title) {
        html += '<div class="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2 mb-3">' + escapeHtml(title) + '</div>';
      }
      if (text) {
        html += '<div class="whitespace-pre-wrap leading-relaxed">' + escapeHtml(text) + '</div>';
      } else {
        html += '<span class="text-slate-400 italic">Document text preview will appear here in real time...</span>';
      }
      txtPreviewBox.innerHTML = html;
    };

    const escapeHtml = (str) => {
      return str.replace(/[&<>"']/g, (m) => {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
      });
    };

    txtContent.addEventListener('input', updatePreview);
    if (txtTitle) txtTitle.addEventListener('input', updatePreview);

    // Initial default demo text
    txtContent.value = `PROJECT SPECIFICATION & REQUIREMENTS

1. System Architecture
All computation is conducted strictly client-side within the browser environment. Zero server-side API round-trips occur, guaranteeing enterprise-grade confidentiality, zero storage of confidential files, and instantaneous processing speed.

2. Quality Assurance Standards
Every interactive tool follows responsive mobile-first layouts, high-contrast dark/light mode standards, and seamless clipboard and local file export workflows.

3. Deliverables
- Fully responsive HTML5 web interface
- Standalone client-side JavaScript engine
- Comprehensive technical documentation and user FAQs`;

    updatePreview();

    btnGeneratePdf.addEventListener('click', () => {
      const text = txtContent.value || '';
      const title = txtTitle ? txtTitle.value.trim() : '';

      if (!text.trim() && !title) {
        notifyUser('Please enter document title or body text to generate PDF.');
        return;
      }

      try {
        const { jsPDF } = window.jspdf || {};
        if (!jsPDF) {
          notifyUser('PDF generation engine is still loading. Please try again.');
          return;
        }

        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        const font = txtFont ? txtFont.value : 'helvetica';
        const fontSize = txtSize ? parseInt(txtSize.value, 10) || 12 : 12;
        const margin = txtMargin ? parseInt(txtMargin.value, 10) || 20 : 20;

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const maxLineWidth = pageWidth - (margin * 2);

        let cursorY = margin + 5;

        // Title Header
        if (title) {
          doc.setFont(font, 'bold');
          doc.setFontSize(fontSize + 6);
          const splitTitle = doc.splitTextToSize(title, maxLineWidth);
          doc.text(splitTitle, margin, cursorY);
          cursorY += (splitTitle.length * (fontSize * 0.45)) + 4;

          // Header line
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.5);
          doc.line(margin, cursorY, pageWidth - margin, cursorY);
          cursorY += 8;
        }

        // Body Text
        doc.setFont(font, 'normal');
        doc.setFontSize(fontSize);
        const lineHeight = fontSize * 0.45;

        const paragraphs = text.split('\n');
        for (let i = 0; i < paragraphs.length; i++) {
          const para = paragraphs[i];
          if (!para.trim()) {
            cursorY += lineHeight * 0.8;
            continue;
          }

          const lines = doc.splitTextToSize(para, maxLineWidth);
          for (let j = 0; j < lines.length; j++) {
            if (cursorY + lineHeight > pageHeight - margin) {
              doc.addPage();
              cursorY = margin + 5;
            }
            doc.text(lines[j], margin, cursorY);
            cursorY += lineHeight;
          }
          cursorY += lineHeight * 0.4;
        }

        const cleanName = (title || 'document').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        doc.save(cleanName + '.pdf');
      } catch (err) {
        console.error(err);
        notifyUser('Error generating PDF: ' + err.message);
      }
    });
  }
});
