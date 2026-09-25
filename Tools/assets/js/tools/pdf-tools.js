/**
 * Digital Cron Tools - PDF Tools Client-Side Engine
 * 100% Private, Browser-based PDF manipulation using pdf-lib, pdf.js, and jsPDF.
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
  // Setup PDF.js worker if PDF.js is loaded
  if (window.pdfjsLib) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
  }

  // Utility: Format Bytes
  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  // Utility: Drop Zone Listener
  function setupPDFDropZone(dropZoneId, fileInputId, acceptTypes, onFilesLoaded) {
    const dropZone = document.getElementById(dropZoneId);
    const fileInput = document.getElementById(fileInputId);
    if (!dropZone || !fileInput) return;

    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('border-[#6366F1]', 'bg-[#6366F1]/5');
    });
    dropZone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      dropZone.classList.remove('border-[#6366F1]', 'bg-[#6366F1]/5');
    });
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('border-[#6366F1]', 'bg-[#6366F1]/5');
      if (e.dataTransfer.files && e.dataTransfer.files.length) {
        onFilesLoaded(Array.from(e.dataTransfer.files));
      }
    });
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length) {
        onFilesLoaded(Array.from(e.target.files));
      }
    });
  }

  // 1. PDF PAGE NUMBERING TOOL
  const numberingInput = document.getElementById('numbering-file-input');
  if (numberingInput) {
    let pdfBytes = null;
    let pdfFile = null;

    setupPDFDropZone('numbering-drop-zone', 'numbering-file-input', '.pdf', async (files) => {
      pdfFile = files[0];
      pdfBytes = await pdfFile.arrayBuffer();
      document.getElementById('numbering-controls').classList.remove('hidden');
      document.getElementById('numbering-orig-info').textContent = `${pdfFile.name} (${formatBytes(pdfFile.size)})`;
    });

    const numBtn = document.getElementById('numbering-download-btn');
    if (numBtn) {
      numBtn.addEventListener('click', async () => {
        if (!pdfBytes || !window.PDFLib) return;
        const { PDFDocument, rgb, StandardFonts } = window.PDFLib;
        const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
        const pages = pdfDoc.getPages();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

        const format = document.getElementById('numbering-format')?.value || 'page_x_of_y';
        const position = document.getElementById('numbering-position')?.value || 'bottom_center';
        const fontSize = parseInt(document.getElementById('numbering-size')?.value || 12);

        pages.forEach((page, idx) => {
          const { width, height } = page.getSize();
          const pageNum = idx + 1;
          const totalPages = pages.length;

          let text = `${pageNum}`;
          if (format === 'page_x') text = `Page ${pageNum}`;
          if (format === 'page_x_of_y') text = `Page ${pageNum} of ${totalPages}`;

          const textWidth = font.widthOfTextAtSize(text, fontSize);
          let x = (width - textWidth) / 2;
          let y = 30;

          if (position.includes('right')) x = width - textWidth - 30;
          if (position.includes('top')) y = height - 30;

          page.drawText(text, {
            x,
            y,
            size: fontSize,
            font,
            color: rgb(0.2, 0.2, 0.2),
          });
        });

        const modifiedBytes = await pdfDoc.save();
        const blob = new Blob([modifiedBytes], { type: 'application/pdf' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `numbered-${pdfFile.name}`;
        a.click();
      });
    }
  }

  // 2. PDF PAGE DELETER
  const deleterInput = document.getElementById('deleter-file-input');
  if (deleterInput) {
    let pdfBytes = null;
    let selectedPagesToDelete = new Set();
    let pdfDocLib = null;

    setupPDFDropZone('deleter-drop-zone', 'deleter-file-input', '.pdf', async (files) => {
      const file = files[0];
      pdfBytes = await file.arrayBuffer();
      document.getElementById('deleter-controls').classList.remove('hidden');

      if (!window.pdfjsLib || !window.PDFLib) return;
      const pdf = await window.pdfjsLib.getDocument({ data: pdfBytes.slice(0) }).promise;
      const grid = document.getElementById('deleter-thumbnails-grid');
      grid.innerHTML = '';
      selectedPagesToDelete.clear();

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.3 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;

        const card = document.createElement('div');
        card.className = 'relative p-2 rounded-xl border-2 border-slate-800 bg-slate-900 cursor-pointer select-none transition-all hover:border-[#6366F1]';
        
        const badge = document.createElement('div');
        badge.className = 'text-center font-bold text-xs text-slate-300 mt-1';
        badge.textContent = `Page ${i}`;

        card.appendChild(canvas);
        card.appendChild(badge);

        card.onclick = () => {
          if (selectedPagesToDelete.has(i - 1)) {
            selectedPagesToDelete.delete(i - 1);
            card.classList.remove('border-rose-500', 'bg-rose-500/10');
            card.classList.add('border-slate-800');
          } else {
            selectedPagesToDelete.add(i - 1);
            card.classList.remove('border-slate-800');
            card.classList.add('border-rose-500', 'bg-rose-500/10');
          }
          document.getElementById('deleter-selected-count').textContent = `${selectedPagesToDelete.size} Pages Selected for Deletion`;
        };

        grid.appendChild(card);
      }
    });

    const delDownloadBtn = document.getElementById('deleter-download-btn');
    if (delDownloadBtn) {
      delDownloadBtn.addEventListener('click', async () => {
        if (!pdfBytes || !window.PDFLib) return;
        const { PDFDocument } = window.PDFLib;
        const originalDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
        const newDoc = await PDFDocument.create();

        const totalPages = originalDoc.getPageCount();
        const pageIndicesToKeep = [];
        for (let i = 0; i < totalPages; i++) {
          if (!selectedPagesToDelete.has(i)) pageIndicesToKeep.push(i);
        }

        if (pageIndicesToKeep.length === 0) {
          notifyUser('You cannot delete all pages!');
          return;
        }

        const copiedPages = await newDoc.copyPages(originalDoc, pageIndicesToKeep);
        copiedPages.forEach(p => newDoc.addPage(p));

        const savedBytes = await newDoc.save();
        const blob = new Blob([savedBytes], { type: 'application/pdf' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'pdf-pages-removed.pdf';
        a.click();
      });
    }
  }

  // 3. PDF TO IMAGE CONVERTER
  const pdfToImgInput = document.getElementById('pdf-to-img-file-input');
  if (pdfToImgInput) {
    let pdfBytes = null;

    setupPDFDropZone('pdf-to-img-drop-zone', 'pdf-to-img-file-input', '.pdf', async (files) => {
      const file = files[0];
      pdfBytes = await file.arrayBuffer();
      document.getElementById('pdf-to-img-controls').classList.remove('hidden');

      if (!window.pdfjsLib) return;
      const pdf = await window.pdfjsLib.getDocument({ data: pdfBytes.slice(0) }).promise;
      const container = document.getElementById('pdf-to-img-results');
      container.innerHTML = '';

      const format = document.getElementById('pdf-to-img-format')?.value || 'image/png';
      const ext = format === 'image/jpeg' ? 'jpg' : 'png';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;

        const card = document.createElement('div');
        card.className = 'p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2';

        const img = document.createElement('img');
        img.src = canvas.toDataURL(format, 0.95);
        img.className = 'w-full rounded-xl border border-slate-700 max-h-60 object-contain mx-auto';

        const dlBtn = document.createElement('button');
        dlBtn.className = 'w-full py-2 text-xs font-bold text-white bg-[#6366F1] rounded-xl hover:bg-indigo-600';
        dlBtn.textContent = `Download Page ${i} (${ext.toUpperCase()})`;
        dlBtn.onclick = () => {
          const a = document.createElement('a');
          a.href = canvas.toDataURL(format, 0.95);
          a.download = `page-${i}.${ext}`;
          a.click();
        };

        card.appendChild(img);
        card.appendChild(dlBtn);
        container.appendChild(card);
      }
    });
  }

  // 4, 5, 6. IMAGE (JPG, PNG) TO PDF CONVERTER
  const imgToPdfInput = document.getElementById('img-to-pdf-file-input');
  if (imgToPdfInput) {
    let imageFiles = [];

    setupPDFDropZone('img-to-pdf-drop-zone', 'img-to-pdf-file-input', 'image/*', (files) => {
      imageFiles = files;
      document.getElementById('img-to-pdf-controls').classList.remove('hidden');
      document.getElementById('img-to-pdf-info').textContent = `${files.length} Images Selected`;

      const gallery = document.getElementById('img-to-pdf-preview-gallery');
      if (gallery) {
        gallery.innerHTML = '';
        files.forEach((file, index) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const card = document.createElement('div');
            card.className = 'p-2 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-1';
            
            const img = document.createElement('img');
            img.src = e.target.result;
            img.className = 'w-full h-24 object-cover rounded-lg border border-slate-700';

            const name = document.createElement('div');
            name.className = 'text-[10px] text-slate-300 truncate font-mono';
            name.textContent = `${index + 1}. ${file.name}`;

            card.appendChild(img);
            card.appendChild(name);
            gallery.appendChild(card);
          };
          reader.readAsDataURL(file);
        });
      }
    });

    const convertBtn = document.getElementById('img-to-pdf-download-btn');
    if (convertBtn) {
      convertBtn.addEventListener('click', async () => {
        if (!imageFiles.length || !window.jspdf) return;
        const { jsPDF } = window.jspdf;
        convertBtn.disabled = true;
        convertBtn.innerHTML = '<span>⚙️ Converting Images to PDF...</span>';

        try {
          let doc = null;

          for (let i = 0; i < imageFiles.length; i++) {
            const file = imageFiles[i];
            const imgData = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => resolve(e.target.result);
              reader.readAsDataURL(file);
            });

            const img = await new Promise((resolve, reject) => {
              const image = new Image();
              image.onload = () => resolve(image);
              image.onerror = reject;
              image.src = imgData;
            });

            const isLandscape = img.naturalWidth > img.naturalHeight;
            const pageW = isLandscape ? 297 : 210;
            const pageH = isLandscape ? 210 : 297;
            const margin = 10;
            const maxW = pageW - (margin * 2);
            const maxH = pageH - (margin * 2);

            const ratio = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight);
            const scaledW = img.naturalWidth * ratio;
            const scaledH = img.naturalHeight * ratio;
            const x = (pageW - scaledW) / 2;
            const y = (pageH - scaledH) / 2;

            let fmt = 'JPEG';
            if (file.type === 'image/png' || file.name.toLowerCase().endsWith('.png')) fmt = 'PNG';
            else if (file.type === 'image/webp' || file.name.toLowerCase().endsWith('.webp')) fmt = 'WEBP';

            if (i === 0) {
              doc = new jsPDF({ orientation: isLandscape ? 'l' : 'p', unit: 'mm', format: 'a4' });
            } else {
              doc.addPage('a4', isLandscape ? 'l' : 'p');
            }

            doc.addImage(imgData, fmt, x, y, scaledW, scaledH);
          }

          const outName = imageFiles.length === 1 ? imageFiles[0].name.replace(/\.[^.]+$/, '') + '.pdf' : 'converted-images.pdf';
          doc.save(outName);
          if (typeof showToast === 'function') showToast(`Successfully compiled ${imageFiles.length} image(s) to PDF!`);
        } catch (err) {
          console.error(err);
          notifyUser('Failed to convert images to PDF.');
        } finally {
          convertBtn.disabled = false;
          convertBtn.innerHTML = '<span>CONVERT TO PDF & DOWNLOAD</span>';
        }
      });
    }
  }

  // 7. PDF BLANK PAGE DETECTOR
  const blankInput = document.getElementById('blank-file-input');
  if (blankInput) {
    let pdfBytes = null;
    let detectedBlankPages = [];

    setupPDFDropZone('blank-drop-zone', 'blank-file-input', '.pdf', async (files) => {
      const file = files[0];
      pdfBytes = await file.arrayBuffer();
      document.getElementById('blank-controls').classList.remove('hidden');

      if (!window.pdfjsLib) return;
      const pdf = await window.pdfjsLib.getDocument({ data: pdfBytes.slice(0) }).promise;
      detectedBlankPages = [];

      const statusBox = document.getElementById('blank-results');
      statusBox.innerHTML = '<span class="text-slate-400">Scanning pages for blank whitespace...</span>';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.2 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let nonWhitePixels = 0;

        for (let p = 0; p < imgData.length; p += 4) {
          const r = imgData[p];
          const g = imgData[p+1];
          const b = imgData[p+2];
          if (r < 240 || g < 240 || b < 240) {
            nonWhitePixels++;
          }
        }

        const nonWhiteRatio = nonWhitePixels / (canvas.width * canvas.height);
        if (nonWhiteRatio < 0.005) { // Less than 0.5% non-white content
          detectedBlankPages.push(i);
        }
      }

      if (detectedBlankPages.length > 0) {
        statusBox.innerHTML = `
          <div class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xs space-y-2">
            <div>⚠️ Detected ${detectedBlankPages.length} Blank Page(s): Page ${detectedBlankPages.join(', ')}</div>
            <button id="remove-blank-pages-btn" class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs uppercase tracking-wider font-extrabold">
              Remove Detected Blank Pages & Download PDF
            </button>
          </div>
        `;

        document.getElementById('remove-blank-pages-btn')?.addEventListener('click', async () => {
          if (!window.PDFLib) return;
          const { PDFDocument } = window.PDFLib;
          const originalDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
          const newDoc = await PDFDocument.create();

          const total = originalDoc.getPageCount();
          const keepIndices = [];
          for (let k = 0; k < total; k++) {
            if (!detectedBlankPages.includes(k + 1)) keepIndices.push(k);
          }

          const copied = await newDoc.copyPages(originalDoc, keepIndices);
          copied.forEach(p => newDoc.addPage(p));

          const saved = await newDoc.save();
          const blob = new Blob([saved], { type: 'application/pdf' });
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = 'pdf-blank-pages-removed.pdf';
          a.click();
        });
      } else {
        statusBox.innerHTML = '<div class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs">✓ No blank pages detected in this PDF.</div>';
      }
    });
  }

  // 8. PDF TEXT EXTRACTOR
  const extractorInput = document.getElementById('extractor-file-input');
  if (extractorInput) {
    let extractedText = '';

    setupPDFDropZone('extractor-drop-zone', 'extractor-file-input', '.pdf', async (files) => {
      const file = files[0];
      const bytes = await file.arrayBuffer();
      document.getElementById('extractor-controls').classList.remove('hidden');

      if (!window.pdfjsLib) return;
      const pdf = await window.pdfjsLib.getDocument({ data: bytes }).promise;
      extractedText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        extractedText += `--- Page ${i} ---\n${pageText}\n\n`;
      }

      document.getElementById('extractor-text-output').value = extractedText;
    });

    const copyBtn = document.getElementById('extractor-copy-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        safeCopy(extractedText, 'Extracted text copied to clipboard!');
        notifyUser('Extracted text copied to clipboard!');
      });
    }

    const downloadTxtBtn = document.getElementById('extractor-download-btn');
    if (downloadTxtBtn) {
      downloadTxtBtn.addEventListener('click', () => {
        const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'extracted-pdf-text.txt';
        a.click();
      });
    }
  }

  // 9. PDF COLOR PAGE DETECTOR
  const colorDetectorInput = document.getElementById('color-detector-file-input');
  if (colorDetectorInput) {
    setupPDFDropZone('color-detector-drop-zone', 'color-detector-file-input', '.pdf', async (files) => {
      const file = files[0];
      const bytes = await file.arrayBuffer();
      document.getElementById('color-detector-controls').classList.remove('hidden');

      if (!window.pdfjsLib) return;
      const pdf = await window.pdfjsLib.getDocument({ data: bytes }).promise;
      const resultsContainer = document.getElementById('color-detector-results');
      resultsContainer.innerHTML = '';

      let colorPagesCount = 0;
      let bwPagesCount = 0;

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.2 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let isColor = false;

        for (let p = 0; p < imgData.length; p += 4) {
          const r = imgData[p];
          const g = imgData[p+1];
          const b = imgData[p+2];
          if (Math.abs(r - g) > 15 || Math.abs(g - b) > 15 || Math.abs(r - b) > 15) {
            isColor = true;
            break;
          }
        }

        if (isColor) colorPagesCount++;
        else bwPagesCount++;

        const card = document.createElement('div');
        card.className = `p-3 rounded-xl border text-center space-y-1 text-xs font-bold ${
          isColor ? 'bg-purple-500/10 border-purple-500/40 text-purple-400' : 'bg-slate-900 border-slate-800 text-slate-400'
        }`;
        card.innerHTML = `<div>Page ${i}</div><div class="text-[10px] uppercase">${isColor ? '🎨 Color' : '⚫ Grayscale'}</div>`;
        resultsContainer.appendChild(card);
      }

      document.getElementById('color-pages-summary').textContent = `${colorPagesCount} Color Pages, ${bwPagesCount} Grayscale Pages`;
    });
  }

  // 10. PDF MERGER
  const mergerInput = document.getElementById('pdf-merger-file-input');
  if (mergerInput) {
    let pdfFiles = [];

    const handleMergerFiles = (files) => {
      pdfFiles = files.filter(f => f.name.toLowerCase().endsWith('.pdf') || f.type === 'application/pdf');
      const controls = document.getElementById('pdf-merger-controls');
      const info = document.getElementById('pdf-merger-info');
      if (controls) controls.classList.remove('hidden');
      if (info) info.textContent = `${pdfFiles.length} PDF Document${pdfFiles.length > 1 ? 's' : ''} Selected`;
    };

    mergerInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length) {
        handleMergerFiles(Array.from(e.target.files));
      }
    });

    const dropContainer = mergerInput.closest('.border-dashed');
    if (dropContainer) {
      dropContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropContainer.classList.add('border-[#6366F1]', 'bg-[#6366F1]/5');
      });
      dropContainer.addEventListener('dragleave', () => {
        dropContainer.classList.remove('border-[#6366F1]', 'bg-[#6366F1]/5');
      });
      dropContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        dropContainer.classList.remove('border-[#6366F1]', 'bg-[#6366F1]/5');
        if (e.dataTransfer.files && e.dataTransfer.files.length) {
          handleMergerFiles(Array.from(e.dataTransfer.files));
        }
      });
    }

    const mergeBtn = document.getElementById('pdf-merger-download-btn');
    if (mergeBtn) {
      mergeBtn.addEventListener('click', async () => {
        if (!pdfFiles.length || !window.PDFLib) {
          notifyUser('Please select PDF files to merge.');
          return;
        }

        mergeBtn.disabled = true;
        mergeBtn.innerHTML = '<span>🔗 Merging Documents...</span>';

        try {
          const { PDFDocument } = window.PDFLib;
          const mergedPdf = await PDFDocument.create();

          for (const file of pdfFiles) {
            const bytes = await file.arrayBuffer();
            const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
            const copiedPages = await mergedPdf.copyPages(doc, doc.getPageIndices());
            copiedPages.forEach(p => mergedPdf.addPage(p));
          }

          const mergedBytes = await mergedPdf.save();
          const blob = new Blob([mergedBytes], { type: 'application/pdf' });
          downloadBlob(blob, 'merged-documents.pdf');
          if (typeof showToast === 'function') showToast(`Successfully merged ${pdfFiles.length} PDF documents!`);
        } catch (err) {
          console.error(err);
          notifyUser('Failed to merge documents. Ensure documents are not corrupted.');
        } finally {
          mergeBtn.disabled = false;
          mergeBtn.innerHTML = '<svg class="w-5 h-5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16"/></svg> MERGE PDFS & DOWNLOAD';
        }
      });
    }
  }

  // 11. PDF SPLITTER
  const splitterInput = document.getElementById('pdf-splitter-file-input');
  if (splitterInput) {
    let pdfBytes = null;
    let pdfFile = null;

    setupPDFDropZone('pdf-splitter-drop-zone', 'pdf-splitter-file-input', '.pdf', async (files) => {
      pdfFile = files[0];
      pdfBytes = await pdfFile.arrayBuffer();
      document.getElementById('pdf-splitter-controls').classList.remove('hidden');
      document.getElementById('pdf-splitter-orig-info').textContent = `${pdfFile.name} (${formatBytes(pdfFile.size)})`;
    });

    function parsePageRange(rangeStr, totalPages) {
      const parts = (rangeStr || '1').split(',').map(s => s.trim()).filter(Boolean);
      const indices = new Set();

      for (const part of parts) {
        if (part.includes('-')) {
          const [rawStart, rawEnd] = part.split('-').map(s => parseInt(s.trim(), 10));
          if (!isNaN(rawStart) && !isNaN(rawEnd)) {
            const start = Math.max(1, Math.min(rawStart, rawEnd));
            const end = Math.min(totalPages, Math.max(rawStart, rawEnd));
            for (let p = start; p <= end; p++) {
              indices.add(p - 1);
            }
          }
        } else {
          const p = parseInt(part, 10);
          if (!isNaN(p) && p >= 1 && p <= totalPages) {
            indices.add(p - 1);
          }
        }
      }
      return Array.from(indices).sort((a, b) => a - b);
    }

    const splitBtn = document.getElementById('pdf-splitter-download-btn');
    if (splitBtn) {
      splitBtn.addEventListener('click', async () => {
        if (!pdfBytes || !window.PDFLib) return;
        splitBtn.disabled = true;
        splitBtn.innerHTML = '<span>✂️ Splitting PDF Pages...</span>';

        try {
          const { PDFDocument } = window.PDFLib;
          const srcDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
          const totalPages = srcDoc.getPageCount();

          const rangeStr = document.getElementById('pdf-splitter-range')?.value || '1';
          const validIndices = parsePageRange(rangeStr, totalPages);

          if (validIndices.length === 0) {
            notifyUser(`Invalid page range specified. Document has ${totalPages} page(s).`);
            return;
          }

          const newDoc = await PDFDocument.create();
          const copied = await newDoc.copyPages(srcDoc, validIndices);
          copied.forEach(p => newDoc.addPage(p));

          const saved = await newDoc.save();
          const blob = new Blob([saved], { type: 'application/pdf' });
          downloadBlob(blob, `split-${pdfFile.name}`);
          if (typeof showToast === 'function') showToast(`Extracted ${validIndices.length} page(s) successfully!`);
        } catch (err) {
          console.error(err);
          notifyUser('Could not extract pages from PDF.');
        } finally {
          splitBtn.disabled = false;
          splitBtn.innerHTML = '<span>SPLIT PDF & DOWNLOAD</span>';
        }
      });
    }
  }
});
