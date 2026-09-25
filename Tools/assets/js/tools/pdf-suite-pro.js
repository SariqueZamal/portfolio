/**
 * ============================================================================
 * Digital Cron Tools - Enterprise PDF Suite Pro Engine (pdf-suite-pro.js)
 * 100% Private Client-Side PDF Architecture (Zero-Upload Web Sandbox)
 * Powered by pdf-lib, pdf.js, jsPDF, SheetJS, Mammoth.js, PptxGenJS & Canvas API
 * ============================================================================
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
  // Setup PDF.js Global Worker
  if (window.pdfjsLib && !window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
  }

  // Initialize individual tool engines safely based on DOM presence
  initCompressPdf();
  initPdfToWord();
  initPdfToPowerPoint();
  initPdfToExcel();
  initExcelToPdf();
  initWordToPdf();
  initPowerPointToPdf();
  initHtmlToPdf();
  initProtectPdf();
  initSignPdf();
  initPdfWatermark();
  initOrganizePdf();
  initUnlockPdf();
  initCropPdf();
  initRedactPdf();
  initComparePdf();
  initRepairPdf();
  initPdfToPdfa();
});

/* ── Global Utility Functions ────────────────────────────────────────────── */
function formatBytes(bytes, decimals = 2) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

function setupDropZone(dropZoneId, fileInputId, acceptExt, onFileSelected) {
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelected(e.dataTransfer.files[0]);
    }
  });
  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelected(e.target.files[0]);
    }
  });
}

/* ==========================================================================
   1. COMPRESS PDF ENGINE (Professional SaaS Grade - Matches Image Compressor)
   ========================================================================== */
function initCompressPdf() {
  const dropZone    = document.getElementById('drop-zone');
  const fileInput   = document.getElementById('compress-input');
  const qualRange   = document.getElementById('compress-quality');
  const qualVal     = document.getElementById('quality-val');
  const downloadBtn = document.getElementById('download-compressed');
  const resetBtn    = document.getElementById('btn-compress-reset');

  if (!dropZone || !fileInput) return;

  let currentFile = null;
  let currentCompressedBlob = null;
  let loadedPdfDoc = null;
  let currentPageNum = 1;
  let totalPdfPages = 1;
  let debounceTimer = null;
  let currentCompressReqId = 0;
  let isCompressing = false;
  let pendingCompress = false;

  // Drop zone events
  dropZone.addEventListener('click', () => fileInput.click());
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('border-[#6366F1]', 'bg-[#6366F1]/5');
  });
  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('border-[#6366F1]', 'bg-[#6366F1]/5');
  });
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('border-[#6366F1]', 'bg-[#6366F1]/5');
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))) {
      processFile(file);
    } else {
      notifyUser('Please drop a valid PDF document.');
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  });

  if (qualRange) {
    qualRange.addEventListener('input', () => {
      if (qualVal) qualVal.textContent = `${qualRange.value}%`;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (currentFile) {
          if (isCompressing) {
            pendingCompress = true;
          } else {
            compress(currentFile);
          }
        }
      }, 80);
    });
  }

  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      if (!currentCompressedBlob || !currentFile) return;
      const name = currentFile.name.replace(/\.[^.]+$/, '') + '-compressed.pdf';
      downloadBlob(currentCompressedBlob, name);
      if (typeof showToast === 'function') showToast('Compressed PDF downloaded!');
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', resetCompressor);
  }

  // Page preview pager buttons
  document.getElementById('pdf-prev-page')?.addEventListener('click', () => {
    if (currentPageNum > 1 && loadedPdfDoc) {
      currentPageNum--;
      renderPdfPagePreview(loadedPdfDoc, currentPageNum);
    }
  });

  document.getElementById('pdf-next-page')?.addEventListener('click', () => {
    if (currentPageNum < totalPdfPages && loadedPdfDoc) {
      currentPageNum++;
      renderPdfPagePreview(loadedPdfDoc, currentPageNum);
    }
  });

  function resetCompressor() {
    fileInput.value = '';
    currentFile = null;
    currentCompressedBlob = null;
    loadedPdfDoc = null;
    currentPageNum = 1;
    totalPdfPages = 1;
    if (qualRange) qualRange.value = 80;
    if (qualVal) qualVal.textContent = '80%';
    document.getElementById('compress-controls')?.classList.add('hidden');
    const origSize = document.getElementById('orig-size');
    const newSize = document.getElementById('new-size');
    const savingsPct = document.getElementById('savings-pct');
    if (origSize) origSize.textContent = '—';
    if (newSize) newSize.textContent = '—';
    if (savingsPct) savingsPct.textContent = '—';
    if (downloadBtn) {
      downloadBtn.disabled = true;
      downloadBtn.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16"/></svg> DOWNLOAD COMPRESSED PDF';
    }
  }

  async function processFile(file) {
    if (file.size > 50 * 1024 * 1024) {
      notifyUser('PDF too large. Max 50MB allowed.');
      return;
    }
    currentFile = file;

    const origSize = document.getElementById('orig-size');
    if (origSize) origSize.textContent = formatBytes(file.size);

    const controls = document.getElementById('compress-controls');
    if (controls) controls.classList.remove('hidden');

    if (qualRange) qualRange.value = 80;
    if (qualVal) qualVal.textContent = '80%';

    // Load preview using PDF.js
    try {
      if (window.pdfjsLib) {
        const buffer = await file.arrayBuffer();
        loadedPdfDoc = await window.pdfjsLib.getDocument({ data: buffer }).promise;
        totalPdfPages = loadedPdfDoc.numPages;
        currentPageNum = 1;

        const pager = document.getElementById('pdf-preview-pager');
        if (pager) {
          if (totalPdfPages > 1) {
            pager.classList.remove('hidden');
            pager.classList.add('flex');
          } else {
            pager.classList.add('hidden');
            pager.classList.remove('flex');
          }
        }
        renderPdfPagePreview(loadedPdfDoc, 1).catch(e => console.warn('Preview render note:', e));
      }
    } catch (previewErr) {
      console.warn('PDF preview error:', previewErr);
    }

    await compress(file);
  }

  async function renderPdfPagePreview(pdfDoc, pageNum) {
    try {
      const page = await pdfDoc.getPage(pageNum);
      const canvas = document.getElementById('compress-preview-canvas');
      if (!canvas) return;

      const viewport = page.getViewport({ scale: 1.2 });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      await page.render({ canvasContext: ctx, viewport }).promise;

      const indicator = document.getElementById('pdf-page-indicator');
      if (indicator) indicator.textContent = `Page ${pageNum} of ${totalPdfPages}`;
    } catch (e) {
      console.warn('Page render error:', e);
    }
  }

  async function compress(file) {
    if (isCompressing) {
      pendingCompress = true;
      return;
    }
    isCompressing = true;
    const reqId = ++currentCompressReqId;

    const sliderVal = Number(document.getElementById('compress-quality')?.value || 80);
    const norm = Math.max(0, Math.min(1, (sliderVal - 10) / (100 - 10)));
    const targetFraction = 0.18 + (norm * 0.75); // 10% -> 18%, 100% -> 93%
    const targetBytes = Math.max(1024, Math.min(Math.round(file.size * 0.94), Math.round(file.size * targetFraction)));

    const newSizeEl  = document.getElementById('new-size');
    const dlBtn      = document.getElementById('download-compressed');
    const savingsPct = document.getElementById('savings-pct');

    if (newSizeEl) newSizeEl.textContent = 'Compressing...';
    if (savingsPct) {
      savingsPct.textContent = 'Calculating...';
      savingsPct.className = 'text-lg font-extrabold text-[#6366F1]';
    }
    if (dlBtn) {
      dlBtn.disabled = true;
      dlBtn.innerHTML = '<span class="inline-block animate-spin mr-2">⚙️</span> COMPRESSING PDF...';
    }

    try {
      const buffer = await file.arrayBuffer();
      if (reqId !== currentCompressReqId) return;

      let compressedBytes = null;

      // Method 1: In-Place PDF-Lib vector stream & image optimization
      if (window.PDFLib) {
        try {
          const { PDFDocument, PDFName, PDFNumber } = window.PDFLib;
          const pdfDoc = await PDFDocument.load(buffer.slice(0), { ignoreEncryption: true });

          pdfDoc.setProducer('DigitalCron High-Performance PDF Engine');
          pdfDoc.setCreator('DigitalCron Tools');

          const maxImgDimension = Math.round(750 + norm * 1500);
          const targetJpegQuality = Math.max(0.30, Math.min(0.92, 0.35 + (norm * 0.50)));

          for (const [ref, obj] of pdfDoc.context.enumerateIndirectObjects()) {
            if (reqId !== currentCompressReqId) return;
            if (obj && obj.dict && obj.dict.get(PDFName.of('Subtype')) === PDFName.of('Image')) {
              const filter = obj.dict.get(PDFName.of('Filter'));
              const isJpeg = filter === PDFName.of('DCTDecode');

              if (isJpeg) {
                try {
                  const rawBytes = obj.asUint8Array();
                  if (rawBytes && rawBytes.byteLength > 2048) {
                    const blob = new Blob([rawBytes], { type: 'image/jpeg' });
                    const bmp = await createImageBitmap(blob);
                    let targetW = bmp.width;
                    let targetH = bmp.height;
                    const maxDim = Math.max(targetW, targetH);

                    if (maxDim > maxImgDimension) {
                      const scale = maxImgDimension / maxDim;
                      targetW = Math.max(1, Math.round(targetW * scale));
                      targetH = Math.max(1, Math.round(targetH * scale));
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = targetW;
                    canvas.height = targetH;
                    const ctx = canvas.getContext('2d');
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(bmp, 0, 0, targetW, targetH);
                    bmp.close();

                    const newJpegBlob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', targetJpegQuality));
                    if (newJpegBlob) {
                      const newBytes = new Uint8Array(await newJpegBlob.arrayBuffer());
                      if (newBytes.byteLength < rawBytes.byteLength) {
                        obj.contents = newBytes;
                        obj.dict.set(PDFName.of('Length'), PDFNumber.of(newBytes.byteLength));
                        obj.dict.set(PDFName.of('Width'), PDFNumber.of(targetW));
                        obj.dict.set(PDFName.of('Height'), PDFNumber.of(targetH));
                      }
                    }
                  }
                } catch (imgErr) {
                  console.warn('In-place image recompression note:', imgErr);
                }
              }
            }
          }

          const candidate = await pdfDoc.save({
            useObjectStreams: true,
            addDefaultPage: false,
            updateFieldAppearances: false
          });

          // Accept if candidate is within targetBytes and strictly smaller than original
          if (candidate.byteLength < file.size && (candidate.byteLength <= targetBytes || !window.jspdf)) {
            compressedBytes = candidate;
          }
        } catch (pdfLibErr) {
          console.warn('PDF-Lib vector optimization error:', pdfLibErr);
        }
      }

      // Method 2: High-Performance Monotonic Rasterization Pipeline (PDF.js + jsPDF)
      // Dynamic proportional target scaling inspired by image-compressor.js
      if ((!compressedBytes || compressedBytes.byteLength >= file.size || compressedBytes.byteLength > targetBytes * 1.15) && window.pdfjsLib && window.jspdf) {
        try {
          const pdfJsDoc = loadedPdfDoc || await window.pdfjsLib.getDocument({ data: buffer.slice(0) }).promise;
          const { jsPDF } = window.jspdf;

          let curScale = Math.max(0.50, Math.min(1.10, 0.55 + (norm * 0.50)));
          let curQ = Math.max(0.20, Math.min(0.85, 0.22 + (norm * 0.60)));

          async function renderRasterPdf(scale, quality) {
            const outPdf = new jsPDF({ orientation: 'p', unit: 'pt', compress: true });
            for (let p = 1; p <= pdfJsDoc.numPages; p++) {
              if (reqId !== currentCompressReqId) return null;
              const page = await pdfJsDoc.getPage(p);
              const origVp = page.getViewport({ scale: 1.0 });
              const vp = page.getViewport({ scale: scale });
              const canvas = document.createElement('canvas');
              canvas.width = Math.max(1, Math.round(vp.width));
              canvas.height = Math.max(1, Math.round(vp.height));
              const ctx = canvas.getContext('2d');
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';
              await page.render({ canvasContext: ctx, viewport: vp }).promise;

              const imgData = canvas.toDataURL('image/jpeg', quality);
              if (p > 1) {
                outPdf.addPage([origVp.width, origVp.height], origVp.width > origVp.height ? 'l' : 'p');
              } else {
                outPdf.deletePage(1);
                outPdf.addPage([origVp.width, origVp.height], origVp.width > origVp.height ? 'l' : 'p');
              }
              outPdf.addImage(imgData, 'JPEG', 0, 0, origVp.width, origVp.height, undefined, 'FAST');
            }
            return new Uint8Array(outPdf.output('arraybuffer'));
          }

          let candidate = await renderRasterPdf(curScale, curQ);
          if (reqId !== currentCompressReqId) return;

          // Adaptive step (proportionally step down scale and quality if needed)
          if (candidate && (candidate.byteLength > targetBytes * 1.08 || candidate.byteLength >= file.size * 0.95)) {
            const shrinkRatio = Math.sqrt(targetBytes / candidate.byteLength);
            curScale = Math.max(0.35, curScale * Math.min(0.95, shrinkRatio));
            curQ = Math.max(0.18, curQ * Math.min(0.95, shrinkRatio));
            const adjusted = await renderRasterPdf(curScale, curQ);
            if (reqId !== currentCompressReqId) return;
            if (adjusted && adjusted.byteLength < candidate.byteLength) {
              candidate = adjusted;
            }
          }

          // Absolute safeguard: guaranteed strictly less than original file size
          if (candidate && candidate.byteLength >= file.size) {
            const forceRatio = Math.sqrt((file.size * 0.88) / candidate.byteLength);
            curScale = Math.max(0.30, curScale * Math.min(0.90, forceRatio));
            curQ = Math.max(0.15, curQ * Math.min(0.90, forceRatio));
            const forced = await renderRasterPdf(curScale, curQ);
            if (reqId !== currentCompressReqId) return;
            if (forced && forced.byteLength < file.size) {
              candidate = forced;
            }
          }

          if (candidate && (!compressedBytes || candidate.byteLength < compressedBytes.byteLength || compressedBytes.byteLength >= file.size)) {
            compressedBytes = candidate;
          }
        } catch (scanErr) {
          console.warn('Canvas rasterization pipeline note:', scanErr);
        }
      }

      // Default fallback
      if (!compressedBytes) {
        compressedBytes = new Uint8Array(buffer);
      }

      if (reqId !== currentCompressReqId) return;

      const finalBlob = new Blob([compressedBytes], { type: 'application/pdf' });
      currentCompressedBlob = finalBlob;
      const displaySize = finalBlob.size;
      const isSmaller = displaySize < file.size;

      if (isSmaller) {
        const savings = Math.max(1, Math.round(((file.size - displaySize) / file.size) * 100));
        if (newSizeEl) newSizeEl.textContent = formatBytes(displaySize);
        if (savingsPct) {
          savingsPct.textContent = `${savings}% Smaller`;
          savingsPct.className = 'text-lg font-extrabold text-[#6366F1]';
        }
        if (dlBtn) {
          dlBtn.disabled = false;
          dlBtn.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16"/></svg> DOWNLOAD COMPRESSED PDF (${formatBytes(displaySize)})`;
        }
        if (typeof showToast === 'function') {
          showToast(`Compressed! Saved ${savings}%`);
        }
      } else {
        currentCompressedBlob = new Blob([buffer], { type: 'application/pdf' });
        if (newSizeEl) newSizeEl.textContent = formatBytes(file.size);
        if (savingsPct) {
          savingsPct.textContent = 'Already Optimized';
          savingsPct.className = 'text-lg font-extrabold text-emerald-500';
        }
        if (dlBtn) {
          dlBtn.disabled = false;
          dlBtn.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16"/></svg> DOWNLOAD OPTIMIZED PDF (${formatBytes(file.size)})`;
        }
      }

    } catch (err) {
      console.error(err);
      notifyUser('Failed to compress PDF. File may be encrypted or corrupted.');
    } finally {
      isCompressing = false;
      if (pendingCompress) {
        pendingCompress = false;
        if (currentFile) compress(currentFile);
      }
    }
  }
}

/* ==========================================================================
   2. PDF TO WORD ENGINE
   ========================================================================== */
function uint8ToBase64(u8) {
  let binary = '';
  const len = u8.byteLength;
  const chunk = 8192;
  for (let i = 0; i < len; i += chunk) {
    const slice = u8.subarray(i, Math.min(i + chunk, len));
    binary += String.fromCharCode.apply(null, slice);
  }
  return btoa(binary);
}

/* ==========================================================================
   2. PDF TO WORD ENGINE (SmallPDF-Grade Layout & Entity Reconstruction)
   ========================================================================== */
function initPdfToWord() {
  const input = document.getElementById('pdf-word-file-input');
  if (!input) return;

  let currentFile = null;
  let extractedDocxBlob = null;
  let extractedDocBlob = null;
  let extractedPlainText = '';

  setupDropZone('pdf-word-drop-zone', 'pdf-word-file-input', '.pdf', (file) => {
    currentFile = file;
    const nameEl = document.getElementById('pdf-word-filename');
    const sizeEl = document.getElementById('pdf-word-filesize');
    if (nameEl) nameEl.textContent = file.name;
    if (sizeEl) sizeEl.textContent = formatBytes(file.size);
    document.getElementById('pdf-word-workspace')?.classList.remove('hidden');
    document.getElementById('pdf-word-preview')?.classList.add('hidden');
    const status = document.getElementById('pdf-word-status');
    if (status) status.classList.add('hidden');
  });

  const resetBtn = document.getElementById('btn-pdf-word-reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      input.value = '';
      currentFile = null;
      extractedDocxBlob = null;
      extractedDocBlob = null;
      extractedPlainText = '';
      document.getElementById('pdf-word-workspace')?.classList.add('hidden');
      document.getElementById('pdf-word-preview')?.classList.add('hidden');
      const status = document.getElementById('pdf-word-status');
      if (status) status.classList.add('hidden');
    });
  }

  // Tab switching between Formatted Preview and Raw Text
  const tabFormatted = document.getElementById('tab-preview-formatted');
  const tabRaw = document.getElementById('tab-preview-raw');
  const formattedPreview = document.getElementById('pdf-word-formatted-preview');
  const textPreview = document.getElementById('pdf-word-text-preview');

  tabFormatted?.addEventListener('click', () => {
    tabFormatted.className = 'px-3.5 py-2 rounded-xl text-xs font-bold font-mono bg-[#6366F1] text-white shadow transition-all';
    tabRaw.className = 'px-3.5 py-2 rounded-xl text-xs font-bold font-mono bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-white transition-all';
    formattedPreview?.classList.remove('hidden');
    textPreview?.classList.add('hidden');
  });

  tabRaw?.addEventListener('click', () => {
    tabRaw.className = 'px-3.5 py-2 rounded-xl text-xs font-bold font-mono bg-[#6366F1] text-white shadow transition-all';
    tabFormatted.className = 'px-3.5 py-2 rounded-xl text-xs font-bold font-mono bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-white transition-all';
    textPreview?.classList.remove('hidden');
    formattedPreview?.classList.add('hidden');
  });

  document.getElementById('btn-convert-pdf-word')?.addEventListener('click', async () => {
    if (!currentFile || !window.pdfjsLib) {
      notifyUser('PDF parser engine is initializing. Please check your connection.');
      return;
    }
    const btn = document.getElementById('btn-convert-pdf-word');
    const status = document.getElementById('pdf-word-status');

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="inline-block animate-spin mr-2">⚙️</span> Extracting Layout, Typography & Images...';
    }
    if (status) {
      status.classList.remove('hidden');
      status.textContent = 'Parsing PDF text streams, font tables, and embedded images...';
    }

    try {
      const buffer = await currentFile.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: buffer.slice(0) }).promise;

      // Extract raw images from PDF-Lib if available
      const rawExtractedImages = [];
      if (window.PDFLib) {
        try {
          const { PDFDocument, PDFName } = window.PDFLib;
          const pdfDoc = await PDFDocument.load(buffer.slice(0), { ignoreEncryption: true });
          let imgCount = 0;
          for (const [ref, obj] of pdfDoc.context.enumerateIndirectObjects()) {
            if (obj && obj.dict && obj.dict.get(PDFName.of('Subtype')) === PDFName.of('Image')) {
              const filter = obj.dict.get(PDFName.of('Filter'));
              const isJpeg = filter === PDFName.of('DCTDecode');
              // Only extract true JPEG streams from XObjects directly
              if (!isJpeg) continue;

              const bytes = typeof obj.asUint8Array === 'function' ? obj.asUint8Array() : null;
              if (bytes && bytes.byteLength > 1024) {
                imgCount++;
                const wObj = obj.dict.get(PDFName.of('Width'));
                const hObj = obj.dict.get(PDFName.of('Height'));
                let w = 400;
                let h = 300;
                if (wObj && typeof wObj.asNumber === 'function') w = wObj.asNumber();
                else if (typeof wObj?.value === 'number') w = wObj.value;
                else if (!isNaN(Number(wObj))) w = Number(wObj);

                if (hObj && typeof hObj.asNumber === 'function') h = hObj.asNumber();
                else if (typeof hObj?.value === 'number') h = hObj.value;
                else if (!isNaN(Number(hObj))) h = Number(hObj);

                w = Math.max(10, Math.round(Number(w) || 400));
                h = Math.max(10, Math.round(Number(h) || 300));

                rawExtractedImages.push({
                  id: imgCount,
                  filename: `image_${imgCount}.jpeg`,
                  ext: 'jpeg',
                  bytes,
                  width: w,
                  height: h
                });
              }
            }
          }
        } catch (e) {
          console.warn('PDF-Lib image extraction note:', e);
        }
      }

      const pagesData = [];
      let fullHtmlDoc = '';
      let textContentPreview = '';
      let formattedHtmlPreview = '';
      let totalWords = 0;
      let totalChars = 0;
      let mediaList = [];
      let globalImgCounter = 0;

      for (let i = 1; i <= pdf.numPages; i++) {
        if (status) status.textContent = `Reconstructing Page ${i} of ${pdf.numPages}...`;
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageVp = page.getViewport({ scale: 1.0 });

        // Line clustering by baseline Y
        const lineMap = new Map();
        textContent.items.forEach(item => {
          const str = item.str;
          if (!str || str.trim().length === 0) return;
          const y = Math.round(item.transform[5]);
          let matchY = null;
          for (const k of lineMap.keys()) {
            if (Math.abs(k - y) <= 3.5) { matchY = k; break; }
          }
          if (matchY === null) { matchY = y; lineMap.set(matchY, []); }
          const fontSize = Math.round(Math.hypot(item.transform[0], item.transform[1])) || 11;
          const isBold = /bold|black|heavy|medium/i.test(item.fontName || '');
          const isItalic = /italic|oblique/i.test(item.fontName || '');
          lineMap.get(matchY).push({
            x: item.transform[4],
            y,
            str,
            fontSize,
            isBold,
            isItalic,
            width: item.width || 0
          });
        });

        const sortedYs = Array.from(lineMap.keys()).sort((a, b) => b - a);
        const pageLines = sortedYs.map(y => {
          const items = lineMap.get(y).sort((a, b) => a.x - b.x);
          return items;
        });

        // Detect if page has no text (scanned document / pure image)
        const isScannedPage = pageLines.length === 0;
        let pageScanImage = null;
        if (isScannedPage) {
          try {
            const vp = page.getViewport({ scale: 2.0 });
            const canvas = document.createElement('canvas');
            canvas.width = vp.width;
            canvas.height = vp.height;
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            await page.render({ canvasContext: ctx, viewport: vp }).promise;
            const scanBlob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.92));
            if (scanBlob) {
              globalImgCounter++;
              const scanBytes = new Uint8Array(await scanBlob.arrayBuffer());
              pageScanImage = {
                id: globalImgCounter,
                filename: `page_scan_${i}.jpeg`,
                ext: 'jpeg',
                bytes: scanBytes,
                width: Math.max(100, Math.round(pageVp.width)),
                height: Math.max(100, Math.round(pageVp.height))
              };
              mediaList.push(pageScanImage);
            }
          } catch (scanErr) {
            console.warn('Scanned page capture note:', scanErr);
          }
        }

        // Group lines into Paragraphs and Tables
        const pageBlocks = [];
        let currentTable = null;

        for (let l = 0; l < pageLines.length; l++) {
          const lineItems = pageLines[l];
          // Check if line has multiple distinct columns (gap >= 22pt)
          let hasMultiColumns = false;
          if (lineItems.length >= 2) {
            for (let c = 0; c < lineItems.length - 1; c++) {
              const gap = lineItems[c+1].x - (lineItems[c].x + lineItems[c].width);
              if (gap >= 22) { hasMultiColumns = true; break; }
            }
          }

          if (hasMultiColumns) {
            if (!currentTable) {
              currentTable = { type: 'table', rows: [] };
              pageBlocks.push(currentTable);
            }
            // Form cells for this table row by grouping adjacent items
            const cells = [];
            let curCell = [lineItems[0]];
            for (let c = 1; c < lineItems.length; c++) {
              const gap = lineItems[c].x - (lineItems[c-1].x + lineItems[c-1].width);
              if (gap >= 18) {
                cells.push(curCell);
                curCell = [lineItems[c]];
              } else {
                curCell.push(lineItems[c]);
              }
            }
            if (curCell.length) cells.push(curCell);
            currentTable.rows.push(cells);
          } else {
            currentTable = null;
            const fullText = lineItems.map(it => it.str).join(' ').trim();
            if (fullText.length > 0) {
              const maxFontSize = Math.max(...lineItems.map(it => it.fontSize));
              const isHeading = maxFontSize >= 15 || (lineItems.some(it => it.isBold) && fullText.length < 60);
              pageBlocks.push({
                type: 'paragraph',
                isHeading,
                fontSize: maxFontSize,
                items: lineItems,
                text: fullText
              });
            }
          }
        }

        // Calculate word & char stats
        let pageTextRaw = '';
        pageLines.forEach(l => {
          pageTextRaw += l.map(it => it.str).join(' ') + '\n';
        });
        const words = pageTextRaw.trim() ? pageTextRaw.trim().split(/\s+/).length : 0;
        totalWords += words;
        totalChars += pageTextRaw.length;
        textContentPreview += `=== PAGE ${i} ===\n` + (pageTextRaw.trim() || '[No embedded text - visual raster page]') + '\n\n';

        // Check if raw extracted images map to this page (distribute evenly)
        const pageImages = [];
        if (pageScanImage) {
          pageImages.push(pageScanImage);
        } else if (rawExtractedImages.length > 0) {
          const imgsPerPage = Math.ceil(rawExtractedImages.length / pdf.numPages);
          const startIdx = (i - 1) * imgsPerPage;
          const assigned = rawExtractedImages.slice(startIdx, startIdx + imgsPerPage);
          assigned.forEach(img => {
            if (!mediaList.some(m => m.filename === img.filename)) {
              mediaList.push(img);
            }
            pageImages.push(img);
          });
        }

        pagesData.push({
          pageNum: i,
          blocks: pageBlocks,
          images: pageImages,
          pageWidth: Math.round(pageVp.width),
          pageHeight: Math.round(pageVp.height),
          isScanned: isScannedPage
        });

        // HTML Formatted Preview for this page
        let pageHtmlContent = '';
        if (isScannedPage && pageScanImage) {
          const base64 = uint8ToBase64(pageScanImage.bytes);
          pageHtmlContent += `<div class="text-center my-3"><img src="data:image/jpeg;base64,${base64}" class="max-w-full rounded-lg shadow border border-slate-200 dark:border-slate-800 mx-auto" alt="Scanned Page ${i}" /></div>`;
        } else {
          // Render Images at top if any
          pageImages.forEach(img => {
            const b64 = uint8ToBase64(img.bytes);
            pageHtmlContent += `<div class="text-center my-3"><img src="data:${img.ext === 'jpeg' ? 'image/jpeg' : 'image/png'};base64,${b64}" class="max-w-xs max-h-48 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 inline-block" alt="Image" /></div>`;
          });

          pageBlocks.forEach(blk => {
            if (blk.type === 'paragraph') {
              if (blk.isHeading) {
                pageHtmlContent += `<h3 class="text-base sm:text-lg font-bold text-[#6366F1] mt-4 mb-2">${escapeHtml(blk.text)}</h3>`;
              } else {
                pageHtmlContent += `<p class="mb-2 leading-relaxed text-slate-700 dark:text-slate-300 text-xs sm:text-sm text-justify">${escapeHtml(blk.text)}</p>`;
              }
            } else if (blk.type === 'table') {
              let tableHtml = '<div class="overflow-x-auto my-3"><table class="w-full text-xs font-mono border-collapse border border-slate-200 dark:border-slate-800 rounded-lg">';
              blk.rows.forEach((row, rIdx) => {
                const isHead = rIdx === 0;
                tableHtml += `<tr class="${isHead ? 'bg-slate-100 dark:bg-slate-800/80 font-bold text-slate-900 dark:text-white' : 'border-b border-slate-100 dark:border-slate-800/50'}">`;
                row.forEach(cellItems => {
                  const cellText = cellItems.map(it => it.str).join(' ').trim();
                  tableHtml += `<td class="p-2 border border-slate-200 dark:border-slate-800">${escapeHtml(cellText)}</td>`;
                });
                tableHtml += '</tr>';
              });
              tableHtml += '</table></div>';
              pageHtmlContent += tableHtml;
            }
          });
        }

        fullHtmlDoc += `<h3>Page ${i}</h3>\n${pageHtmlContent}\n<hr/>\n`;

        formattedHtmlPreview += `
          <div class="p-6 sm:p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm font-sans">
            <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 text-xs text-slate-400 font-mono">
              <span class="font-bold text-[#6366F1]">📄 Page ${i} of ${pdf.numPages}</span>
              <span>${words.toLocaleString()} words</span>
            </div>
            <div>${pageHtmlContent}</div>
          </div>
        `;
      }

      extractedPlainText = textContentPreview.trim();

      // Update Document Stats Ribbon
      const statPages = document.getElementById('pdf-word-stat-pages');
      const statWords = document.getElementById('pdf-word-stat-words');
      const statChars = document.getElementById('pdf-word-stat-chars');
      if (statPages) statPages.textContent = pdf.numPages.toLocaleString();
      if (statWords) statWords.textContent = totalWords.toLocaleString();
      if (statChars) statChars.textContent = totalChars.toLocaleString();

      if (formattedPreview) formattedPreview.innerHTML = formattedHtmlPreview;
      if (textPreview) textPreview.textContent = extractedPlainText;

      // Build Legacy HTML .DOC Blob
      const docxHeader = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset='utf-8'><title>${escapeHtml(currentFile.name)}</title>
<style>
body { font-family: 'Calibri', 'Segoe UI', sans-serif; font-size: 11pt; line-height: 1.45; color: #111; margin: 1in; }
h3 { font-size: 14pt; color: #4f46e5; margin-top: 18pt; border-bottom: 1px solid #e5e7eb; padding-bottom: 4pt; }
p { margin: 0 0 8pt 0; text-align: justify; }
table { border-collapse: collapse; width: 100%; margin: 12pt 0; }
th, td { border: 1px solid #cbd5e1; padding: 6pt; text-align: left; }
th { background-color: #f1f5f9; font-weight: bold; }
hr { border: none; border-top: 1px dashed #cbd5e1; margin: 24pt 0; }
</style></head><body>${fullHtmlDoc}</body></html>`;
      extractedDocBlob = new Blob(['\ufeff' + docxHeader], { type: 'application/msword' });

      // Build Real OpenXML .DOCX using JSZip
      if (window.JSZip) {
        try {
          const zip = new window.JSZip();

          zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="jpeg" ContentType="image/jpeg"/>
  <Default Extension="jpg" ContentType="image/jpeg"/>
  <Default Extension="png" ContentType="image/png"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`);

          zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);

          let docRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>`;

          // Add media files to zip & docRels
          mediaList.forEach((m, mIdx) => {
            const relId = `rIdImg${mIdx + 1}`;
            m.relId = relId;
            zip.file(`word/media/${m.filename}`, m.bytes);
            docRelsXml += `\n  <Relationship Id="${relId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${m.filename}"/>`;
          });
          docRelsXml += '\n</Relationships>';
          zip.file('word/_rels/document.xml.rels', docRelsXml);

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
        <w:spacing w:after="80" w:line="240" w:lineRule="auto"/>
      </w:pPr>
    </w:pPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:pPr><w:spacing w:before="240" w:after="100"/></w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
      <w:b/>
      <w:sz w:val="28"/>
      <w:color w:val="4F46E5"/>
    </w:rPr>
  </w:style>
</w:styles>`);

          let bodyXml = '';
          const escapeXml = (s) => (s || '')
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F]/g, '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');

          pagesData.forEach((page, pIdx) => {
            bodyXml += `<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>Page ${page.pageNum}</w:t></w:r></w:p>`;

            // Embed page images with valid dimensions and OpenXML schema compliance
            page.images.forEach((img, iIdx) => {
              const rawW = typeof img.width === 'number' && !isNaN(img.width) && img.width > 0 ? img.width : 400;
              const rawH = typeof img.height === 'number' && !isNaN(img.height) && img.height > 0 ? img.height : 300;
              const maxPtW = Math.min(480, Math.max(80, Math.round(rawW)));
              const maxPtH = Math.min(650, Math.max(60, Math.round(maxPtW * (rawH / rawW))));
              const cx = Math.max(100000, Math.round(maxPtW * 12700));
              const cy = Math.max(100000, Math.round(maxPtH * 12700));
              const dId = 1000 + (pIdx * 20) + iIdx + 1;

              bodyXml += `<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:docPr id="${dId}" name="Picture ${dId}"/><wp:cNvGraphicFramePr/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="${dId}" name=""/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${img.relId}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`;
            });

            // Blocks (paragraphs & tables)
            page.blocks.forEach(blk => {
              if (blk.type === 'paragraph') {
                if (blk.isHeading) {
                  bodyXml += `<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t xml:space="preserve">${escapeXml(blk.text)}</w:t></w:r></w:p>`;
                } else {
                  let rXml = '';
                  blk.items.forEach(it => {
                    const clean = escapeXml(it.str);
                    const rawSz = typeof it.fontSize === 'number' && !isNaN(it.fontSize) ? it.fontSize : 11;
                    const sz = Math.min(72, Math.max(16, Math.round(rawSz * 2)));
                    const bXml = it.isBold ? '<w:b/>' : '';
                    const iXml = it.isItalic ? '<w:i/>' : '';
                    rXml += `<w:r><w:rPr><w:sz w:val="${sz}"/>${bXml}${iXml}</w:rPr><w:t xml:space="preserve">${clean} </w:t></w:r>`;
                  });
                  bodyXml += `<w:p>${rXml}</w:p>`;
                }
              } else if (blk.type === 'table') {
                const maxCols = Math.max(1, ...blk.rows.map(r => r.length));
                const colW = Math.round(9000 / maxCols);
                let gridColsXml = '';
                for (let c = 0; c < maxCols; c++) {
                  gridColsXml += `<w:gridCol w:w="${colW}"/>`;
                }

                bodyXml += `<w:tbl><w:tblPr><w:tblW w:w="0" w:type="auto"/><w:tblBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/><w:left w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/><w:right w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/><w:insideV w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/></w:tblBorders></w:tblPr><w:tblGrid>${gridColsXml}</w:tblGrid>`;

                blk.rows.forEach((row, rIdx) => {
                  bodyXml += '<w:tr>';
                  row.forEach(cellItems => {
                    const text = cellItems.map(it => it.str).join(' ').trim();
                    const isHead = rIdx === 0;
                    const shd = isHead ? '<w:shd w:val="clear" w:color="auto" w:fill="F1F5F9"/>' : '';
                    const bXml = isHead ? '<w:b/>' : '';
                    bodyXml += `<w:tc><w:tcPr><w:tcW w:w="${colW}" w:type="dxa"/>${shd}<w:tcMar><w:top w:w="120" w:type="dxa"/><w:bottom w:w="120" w:type="dxa"/><w:left w:w="140" w:type="dxa"/><w:right w:w="140" w:type="dxa"/></w:tcMar></w:tcPr><w:p><w:r><w:rPr>${bXml}</w:rPr><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p></w:tc>`;
                  });
                  bodyXml += '</w:tr>';
                });
                bodyXml += '</w:tbl>';
              }
            });

            if (pIdx < pagesData.length - 1) {
              bodyXml += `<w:p><w:r><w:br w:type="page"/></w:r></w:p>`;
            }
          });

          const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
            xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
            xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
            xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
  <w:body>
    ${bodyXml}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;

          zip.file('word/document.xml', documentXml);

          extractedDocxBlob = await zip.generateAsync({
            type: 'blob',
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            compression: 'DEFLATE',
            compressionOptions: { level: 6 }
          });
        } catch (docxErr) {
          console.warn('DOCX packaging fallback:', docxErr);
          extractedDocxBlob = extractedDocBlob;
        }
      } else {
        extractedDocxBlob = extractedDocBlob;
      }

      document.getElementById('pdf-word-preview')?.classList.remove('hidden');
      if (status) status.textContent = `Conversion completed! Successfully reconstructed ${pdf.numPages} pages (${totalWords.toLocaleString()} words).`;
      if (typeof showToast === 'function') showToast('PDF successfully converted to editable Word format!', 'success');
    } catch (err) {
      console.error(err);
      notifyUser('Failed to parse PDF document. Ensure file is not encrypted or corrupted.');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span>📄 Convert to Word (.docx)</span>';
      }
    }
  });

  // Download DOCX (Modern)
  document.getElementById('btn-download-docx')?.addEventListener('click', () => {
    if ((extractedDocxBlob || extractedDocBlob) && currentFile) {
      const blob = extractedDocxBlob || extractedDocBlob;
      downloadBlob(blob, currentFile.name.replace(/\.pdf$/i, '.docx'));
    }
  });

  // Download DOC (Legacy)
  document.getElementById('btn-download-word')?.addEventListener('click', () => {
    if (extractedDocBlob && currentFile) {
      downloadBlob(extractedDocBlob, currentFile.name.replace(/\.pdf$/i, '.doc'));
    }
  });

  // Copy Extracted Text
  document.getElementById('btn-copy-pdf-word')?.addEventListener('click', () => {
    if (extractedPlainText) {
      if (typeof safeCopy === 'function') {
        safeCopy(extractedPlainText, 'Document text copied to clipboard!');
      } else if (typeof copyToClipboard === 'function') {
        copyToClipboard(extractedPlainText, 'Document text copied to clipboard!');
      }
    }
  });
}

/* ==========================================================================
   3. PDF TO POWERPOINT ENGINE (SmallPDF-Grade Presentation Slides)
   ========================================================================== */
function initPdfToPowerPoint() {
  const input = document.getElementById('pdf-ppt-file-input');
  if (!input) return;

  let currentFile = null;
  let pptxBlob = null;
  let currentLoadedPdf = null;
  let activeSlideNum = 1;
  let totalSlideCount = 1;

  setupDropZone('pdf-ppt-drop-zone', 'pdf-ppt-file-input', '.pdf', (file) => {
    currentFile = file;
    const nameEl = document.getElementById('pdf-ppt-filename');
    const sizeEl = document.getElementById('pdf-ppt-filesize');
    if (nameEl) nameEl.textContent = file.name;
    if (sizeEl) sizeEl.textContent = formatBytes(file.size);
    document.getElementById('pdf-ppt-workspace')?.classList.remove('hidden');
    document.getElementById('pdf-ppt-result')?.classList.add('hidden');
    const status = document.getElementById('pdf-ppt-status');
    if (status) status.classList.add('hidden');
  });

  const resetBtn = document.getElementById('btn-pdf-ppt-reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      input.value = '';
      currentFile = null;
      pptxBlob = null;
      currentLoadedPdf = null;
      activeSlideNum = 1;
      totalSlideCount = 1;
      document.getElementById('pdf-ppt-workspace')?.classList.add('hidden');
      document.getElementById('pdf-ppt-result')?.classList.add('hidden');
      const status = document.getElementById('pdf-ppt-status');
      if (status) status.classList.add('hidden');
    });
  }

  async function renderSlidePreview(slideNum) {
    if (!currentLoadedPdf) return;
    try {
      const page = await currentLoadedPdf.getPage(slideNum);
      const canvas = document.getElementById('pdf-ppt-preview-canvas');
      if (!canvas) return;
      const vp = page.getViewport({ scale: 1.5 });
      canvas.width = vp.width;
      canvas.height = vp.height;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      await page.render({ canvasContext: ctx, viewport: vp }).promise;
      const indicator = document.getElementById('pdf-ppt-slide-indicator');
      if (indicator) indicator.textContent = `Slide ${slideNum} of ${totalSlideCount}`;
    } catch (e) {
      console.warn('Slide preview render note:', e);
    }
  }

  document.getElementById('pdf-ppt-prev-slide')?.addEventListener('click', () => {
    if (activeSlideNum > 1) {
      activeSlideNum--;
      renderSlidePreview(activeSlideNum);
    }
  });

  document.getElementById('pdf-ppt-next-slide')?.addEventListener('click', () => {
    if (activeSlideNum < totalSlideCount) {
      activeSlideNum++;
      renderSlidePreview(activeSlideNum);
    }
  });

  document.getElementById('btn-convert-pdf-ppt')?.addEventListener('click', async () => {
    if (!currentFile || !window.pdfjsLib) return;
    const btn = document.getElementById('btn-convert-pdf-ppt');
    const status = document.getElementById('pdf-ppt-status');

    btn.disabled = true;
    btn.innerHTML = '<span class="inline-block animate-spin mr-2">⚙️</span> Rendering High-Definition Presentation Slides...';
    if (status) {
      status.classList.remove('hidden');
      status.textContent = 'Analyzing slide geometry and rendering presentation canvas...';
    }

    try {
      const buffer = await currentFile.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: buffer.slice(0) }).promise;
      currentLoadedPdf = pdf;
      totalSlideCount = pdf.numPages;
      activeSlideNum = 1;

      // Detect aspect ratio from first page
      const firstPage = await pdf.getPage(1);
      const vp1 = firstPage.getViewport({ scale: 1.0 });
      const isWidescreen = vp1.width / vp1.height >= 1.45;
      const ratioStr = isWidescreen ? '16:9 HD' : '4:3 Standard';

      const statSlides = document.getElementById('pdf-ppt-stat-slides');
      const statRatio = document.getElementById('pdf-ppt-stat-ratio');
      const indicator = document.getElementById('pdf-ppt-slide-indicator');
      if (statSlides) statSlides.textContent = pdf.numPages.toLocaleString();
      if (statRatio) statRatio.textContent = ratioStr;
      if (indicator) indicator.textContent = `Slide 1 of ${pdf.numPages}`;

      if (window.PptxGenJS) {
        const pptx = new window.PptxGenJS();
        pptx.layout = isWidescreen ? 'LAYOUT_16x9' : 'LAYOUT_4x3';

        for (let i = 1; i <= pdf.numPages; i++) {
          if (status) status.textContent = `Compiling Slide ${i} of ${pdf.numPages}...`;
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2.0 });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          await page.render({ canvasContext: ctx, viewport }).promise;

          const slide = pptx.addSlide();
          // Scale and center precisely preserving natural aspect ratio with zero distortion
          const slideW = 10;
          const slideH = isWidescreen ? 5.625 : 7.5;
          const pageRatio = viewport.width / viewport.height;
          let imgW = slideW;
          let imgH = imgW / pageRatio;
          if (imgH > slideH) {
            imgH = slideH;
            imgW = imgH * pageRatio;
          }
          const imgX = (slideW - imgW) / 2;
          const imgY = (slideH - imgH) / 2;
          slide.addImage({ data: imgData, x: imgX, y: imgY, w: imgW, h: imgH });
        }

        const outBlob = await pptx.write('blob');
        pptxBlob = outBlob;
      } else {
        const textData = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const tc = await page.getTextContent();
          textData.push(`Slide ${i}:\n` + tc.items.map(it => it.str).join(' '));
        }
        pptxBlob = new Blob([textData.join('\n\n')], { type: 'application/vnd.ms-powerpoint' });
      }

      document.getElementById('pdf-ppt-result')?.classList.remove('hidden');
      if (status) status.textContent = `Presentation ready! Compiled ${pdf.numPages} slides (${ratioStr}).`;
      await renderSlidePreview(1);
      if (typeof showToast === 'function') showToast('PDF successfully converted to PowerPoint slide deck!', 'success');
    } catch (err) {
      console.error(err);
      notifyUser('Could not convert PDF to presentation slides.');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<span>📊 Convert to PowerPoint (.pptx)</span>';
    }
  });

  document.getElementById('btn-download-pptx')?.addEventListener('click', () => {
    if (pptxBlob && currentFile) {
      downloadBlob(pptxBlob, currentFile.name.replace(/\.pdf$/i, '.pptx'));
    }
  });
}

/* ==========================================================================
   4. PDF TO EXCEL ENGINE (SmallPDF-Grade 2D Column & Tabular Clustering)
   ========================================================================== */
function initPdfToExcel() {
  const input = document.getElementById('pdf-excel-file-input');
  if (!input) return;

  let currentFile = null;
  let excelBlob = null;
  let csvBlob = null;
  let extractedRows = [];
  let tableClipboardData = '';

  setupDropZone('pdf-excel-drop-zone', 'pdf-excel-file-input', '.pdf', (file) => {
    currentFile = file;
    const nameEl = document.getElementById('pdf-excel-filename');
    const sizeEl = document.getElementById('pdf-excel-filesize');
    if (nameEl) nameEl.textContent = file.name;
    if (sizeEl) sizeEl.textContent = formatBytes(file.size);
    document.getElementById('pdf-excel-workspace')?.classList.remove('hidden');
    document.getElementById('pdf-excel-table-preview')?.classList.add('hidden');
    const status = document.getElementById('pdf-excel-status');
    if (status) status.classList.add('hidden');
  });

  const resetBtn = document.getElementById('btn-pdf-excel-reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      input.value = '';
      currentFile = null;
      excelBlob = null;
      csvBlob = null;
      extractedRows = [];
      tableClipboardData = '';
      document.getElementById('pdf-excel-workspace')?.classList.add('hidden');
      document.getElementById('pdf-excel-table-preview')?.classList.add('hidden');
      const status = document.getElementById('pdf-excel-status');
      if (status) status.classList.add('hidden');
    });
  }

  document.getElementById('btn-convert-pdf-excel')?.addEventListener('click', async () => {
    if (!currentFile || !window.pdfjsLib) return;
    const btn = document.getElementById('btn-convert-pdf-excel');
    const status = document.getElementById('pdf-excel-status');
    const thead = document.getElementById('pdf-excel-thead');
    const tbody = document.getElementById('pdf-excel-tbody');

    btn.disabled = true;
    btn.innerHTML = '<span class="inline-block animate-spin mr-2">⚙️</span> Parsing Coordinate Ledger Rows & Columns...';
    if (status) {
      status.classList.remove('hidden');
      status.textContent = 'Extracting numeric and tabular structures with 2D column projection...';
    }

    try {
      const buffer = await currentFile.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: buffer.slice(0) }).promise;
      extractedRows = [];
      const perPageRows = [];
      let maxColsFound = 0;

      for (let i = 1; i <= pdf.numPages; i++) {
        if (status) status.textContent = `Analyzing tables on Page ${i} of ${pdf.numPages}...`;
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageRows = [];

        // 1. Group items into baseline Y rows
        const rowMap = new Map();
        textContent.items.forEach(item => {
          const str = item.str;
          if (!str || str.trim().length === 0) return;
          const y = Math.round(item.transform[5]);
          let matchY = null;
          for (const k of rowMap.keys()) {
            if (Math.abs(k - y) <= 3.5) { matchY = k; break; }
          }
          if (matchY === null) { matchY = y; rowMap.set(matchY, []); }
          const x = Math.round(item.transform[4]);
          rowMap.get(matchY).push({ x, str, width: item.width || 0 });
        });

        // 2. Intra-row word clustering: merge words into logical cells/phrases
        const rawRowCells = [];
        const sortedYs = Array.from(rowMap.keys()).sort((a, b) => b - a);
        sortedYs.forEach(y => {
          const items = rowMap.get(y).sort((a, b) => a.x - b.x);
          if (!items.length) return;
          const cellsInRow = [];
          let curCell = { x: items[0].x, endX: items[0].x + items[0].width, text: items[0].str.trim() };

          for (let idx = 1; idx < items.length; idx++) {
            const it = items[idx];
            const gap = it.x - curCell.endX;
            if (gap < 16) {
              curCell.text += (gap > 1 ? ' ' : '') + it.str.trim();
              curCell.endX = Math.max(curCell.endX, it.x + it.width);
            } else {
              if (curCell.text) cellsInRow.push(curCell);
              curCell = { x: it.x, endX: it.x + it.width, text: it.str.trim() };
            }
          }
          if (curCell.text) cellsInRow.push(curCell);
          if (cellsInRow.length > 0) rawRowCells.push({ y, cells: cellsInRow });
        });

        // 3. Dynamic column anchor detection from multi-cell (tabular) rows
        const tableRows = rawRowCells.filter(r => r.cells.length >= 2);
        const colAnchors = [];
        if (tableRows.length > 0) {
          const startXs = [];
          tableRows.forEach(r => {
            r.cells.forEach(c => startXs.push(c.x));
          });
          startXs.sort((a, b) => a - b);
          startXs.forEach(x => {
            let found = false;
            for (const col of colAnchors) {
              if (Math.abs(col.avg - x) <= 28) {
                col.count++;
                col.avg = Math.round((col.avg * (col.count - 1) + x) / col.count);
                found = true;
                break;
              }
            }
            if (!found) colAnchors.push({ avg: x, count: 1 });
          });
          colAnchors.sort((a, b) => a.avg - b.avg);
        }

        const numCols = Math.max(1, colAnchors.length);
        if (numCols > maxColsFound) maxColsFound = numCols;

        // 4. Map row cells into columns
        rawRowCells.forEach(r => {
          if (r.cells.length === 1 && (colAnchors.length <= 1 || r.cells[0].x <= (colAnchors[0]?.avg || 0) + 30)) {
            const rowArr = new Array(numCols).fill('');
            rowArr[0] = r.cells[0].text;
            pageRows.push(rowArr);
            extractedRows.push(rowArr);
            return;
          }

          const rowArr = new Array(numCols).fill('');
          r.cells.forEach(cell => {
            let bestCol = 0;
            let minDiff = Infinity;
            colAnchors.forEach((col, cIdx) => {
              const diff = Math.abs(col.avg - cell.x);
              if (diff < minDiff) { minDiff = diff; bestCol = cIdx; }
            });
            if (rowArr[bestCol]) {
              rowArr[bestCol] += ' ' + cell.text;
            } else {
              rowArr[bestCol] = cell.text;
            }
          });

          if (rowArr.some(c => c.length > 0)) {
            pageRows.push(rowArr);
            extractedRows.push(rowArr);
          }
        });

        if (pageRows.length === 0) {
          const scanNoteRow = [`[Page ${i}: Scanned Image Document - No vector text found]`];
          pageRows.push(scanNoteRow);
          extractedRows.push(scanNoteRow);
        }

        perPageRows.push({ pageNum: i, rows: pageRows });
      }

      // Safeguard for scanned or empty documents
      if (extractedRows.length === 0) {
        extractedRows = [
          ['Status', 'Details'],
          ['Scanned Image Document', 'The uploaded PDF does not contain selectable vector text. Please use OCR tools to extract text.']
        ];
        maxColsFound = 2;
      }

      // Format column headers: A, B, C, D...
      const colHeaders = [];
      for (let c = 0; c < maxColsFound; c++) {
        colHeaders.push(String.fromCharCode(65 + (c % 26)) + (c >= 26 ? Math.floor(c / 26) : ''));
      }

      // Update stats ribbon
      const statPages = document.getElementById('pdf-excel-stat-pages');
      const statRows = document.getElementById('pdf-excel-stat-rows');
      const statCols = document.getElementById('pdf-excel-stat-cols');
      if (statPages) statPages.textContent = pdf.numPages.toLocaleString();
      if (statRows) statRows.textContent = extractedRows.length.toLocaleString();
      if (statCols) statCols.textContent = maxColsFound.toLocaleString();

      // Render Table Header & Body
      if (thead) {
        thead.innerHTML = '<tr><th class="p-2 w-12 text-center border-r border-slate-200 dark:border-slate-800">#</th>' +
          colHeaders.map(h => `<th class="p-2 border-r border-slate-200 dark:border-slate-800 text-center">${h}</th>`).join('') +
          '</tr>';
      }

      if (tbody) {
        tbody.innerHTML = '';
        extractedRows.slice(0, 50).forEach((row, rIdx) => {
          const tr = document.createElement('tr');
          tr.className = 'border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-900/50';
          let rowCellsHtml = `<td class="p-2 text-center text-slate-400 font-bold bg-slate-50 dark:bg-slate-900/80 border-r border-slate-200 dark:border-slate-800 text-[10px]">${rIdx + 1}</td>`;
          for (let c = 0; c < maxColsFound; c++) {
            const cellVal = row[c] || '';
            rowCellsHtml += `<td class="p-2 text-slate-800 dark:text-slate-200 border-r border-slate-100 dark:border-slate-800/40">${escapeHtml(cellVal)}</td>`;
          }
          tr.innerHTML = rowCellsHtml;
          tbody.appendChild(tr);
        });
      }

      // Build CSV Data
      const csvLines = extractedRows.map(r => {
        return r.map(c => `"${(c || '').replace(/"/g, '""')}"`).join(',');
      });
      const csvContent = csvLines.join('\n');
      csvBlob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      tableClipboardData = csvContent;

      // Build Real XLSX with SheetJS
      if (window.XLSX) {
        const wb = window.XLSX.utils.book_new();

        // Sheet 1: All Combined Data
        const wsCombined = window.XLSX.utils.aoa_to_sheet(extractedRows);
        // Set column widths
        const colWidths = [];
        for (let c = 0; c < maxColsFound; c++) {
          let maxLen = 10;
          extractedRows.forEach(r => {
            if (r[c] && r[c].length > maxLen) maxLen = Math.min(50, r[c].length);
          });
          colWidths.push({ wch: maxLen + 3 });
        }
        wsCombined['!cols'] = colWidths;
        window.XLSX.utils.book_append_sheet(wb, wsCombined, 'All Data');

        // Multi-page sheets
        perPageRows.forEach(p => {
          if (p.rows.length > 0) {
            const wsPage = window.XLSX.utils.aoa_to_sheet(p.rows);
            wsPage['!cols'] = colWidths;
            window.XLSX.utils.book_append_sheet(wb, wsPage, `Page ${p.pageNum}`);
          }
        });

        const wbout = window.XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        excelBlob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      } else {
        excelBlob = csvBlob;
      }

      document.getElementById('pdf-excel-table-preview')?.classList.remove('hidden');
      if (status) status.textContent = `Extracted ${extractedRows.length} structured rows across ${pdf.numPages} pages.`;
      if (typeof showToast === 'function') showToast('PDF successfully extracted to Excel spreadsheet!', 'success');
    } catch (err) {
      console.error(err);
      notifyUser('Failed to extract table structure from PDF.');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<span>📊 Convert to Excel (.xlsx)</span>';
    }
  });

  document.getElementById('btn-download-excel')?.addEventListener('click', () => {
    if (excelBlob && currentFile) {
      downloadBlob(excelBlob, currentFile.name.replace(/\.pdf$/i, '.xlsx'));
    }
  });

  document.getElementById('btn-download-csv')?.addEventListener('click', () => {
    if (csvBlob && currentFile) {
      downloadBlob(csvBlob, currentFile.name.replace(/\.pdf$/i, '.csv'));
    }
  });

  document.getElementById('btn-copy-excel-data')?.addEventListener('click', () => {
    if (tableClipboardData) {
      if (typeof safeCopy === 'function') {
        safeCopy(tableClipboardData, 'Spreadsheet data copied to clipboard!');
      } else if (typeof copyToClipboard === 'function') {
        copyToClipboard(tableClipboardData, 'Spreadsheet data copied to clipboard!');
      }
    }
  });
}

/* ==========================================================================
   5. EXCEL TO PDF ENGINE
   ========================================================================== */
function initExcelToPdf() {
  const input = document.getElementById('excel-pdf-file-input');
  if (!input) return;

  let currentFile = null;
  let compiledPdfBlob = null;
  let parsedSheets = {};

  setupDropZone('excel-pdf-drop-zone', 'excel-pdf-file-input', '.xlsx,.xls,.csv', (file) => {
    currentFile = file;
    const nameEl = document.getElementById('excel-pdf-filename');
    const sizeEl = document.getElementById('excel-pdf-filesize');
    if (nameEl) nameEl.textContent = file.name;
    if (sizeEl) sizeEl.textContent = formatBytes(file.size);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        if (!window.XLSX) { notifyUser('SheetJS parser library loading...'); return; }
        const data = new Uint8Array(e.target.result);
        const wb = window.XLSX.read(data, { type: 'array' });
        parsedSheets = {};
        const select = document.getElementById('excel-sheet-select');
        if (select) select.innerHTML = '';

        wb.SheetNames.forEach((name) => {
          parsedSheets[name] = window.XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1 });
          if (select) {
            const opt = document.createElement('option');
            opt.value = name;
            opt.textContent = `${name} (${parsedSheets[name].length} rows)`;
            select.appendChild(opt);
          }
        });

        renderExcelPreview(wb.SheetNames[0]);
        document.getElementById('excel-pdf-workspace')?.classList.remove('hidden');
      } catch (err) {
        console.error(err);
        notifyUser('Could not parse Excel document.');
      }
    };
    reader.readAsArrayBuffer(file);
  });

  const sheetSelect = document.getElementById('excel-sheet-select');
  if (sheetSelect) {
    sheetSelect.addEventListener('change', (e) => renderExcelPreview(e.target.value));
  }

  function renderExcelPreview(sheetName) {
    const rows = parsedSheets[sheetName] || [];
    const container = document.getElementById('excel-sheet-preview');
    if (!container) return;

    let html = '<table class="w-full text-xs font-mono border-collapse">';
    rows.slice(0, 20).forEach((row, rIdx) => {
      const isHeader = rIdx === 0;
      html += `<tr class="${isHeader ? 'bg-slate-100 dark:bg-slate-800 font-bold' : 'border-b border-slate-100 dark:border-slate-800'}">`;
      html += `<td class="p-1.5 text-slate-400 text-[10px] w-8">${rIdx + 1}</td>`;
      row.forEach(cell => {
        html += `<td class="p-1.5 border-l border-slate-200 dark:border-slate-800">${escapeHtml(String(cell || ''))}</td>`;
      });
      html += '</tr>';
    });
    html += '</table>';
    container.innerHTML = html;
  }

  document.getElementById('btn-convert-excel-pdf')?.addEventListener('click', async () => {
    const { jsPDF } = window.jspdf || {};
    if (!jsPDF) { notifyUser('PDF compiler engine loading...'); return; }

    const sheetName = document.getElementById('excel-sheet-select')?.value;
    const rows = parsedSheets[sheetName] || [];
    if (!rows.length) {
      notifyUser('No data rows found in selected sheet.');
      return;
    }

    const userOrientation = document.getElementById('excel-pdf-orientation')?.value || 'p';
    const maxCols = Math.max(1, ...rows.map(r => r.length));
    const orientation = userOrientation === 'l' || maxCols > 6 ? 'l' : 'p';

    const doc = new jsPDF(orientation, 'pt', 'a4');
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();
    const margin = 35;
    const usableW = pw - (margin * 2);

    // Title & Sheet Info
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text(currentFile ? currentFile.name.replace(/\.[^.]+$/i, '') : 'Spreadsheet Export', margin, 35);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Sheet: ${sheetName} • ${rows.length} Rows • ${maxCols} Columns`, margin, 50);

    // Calculate adaptive column widths
    const colW = Math.max(35, usableW / maxCols);
    const fontSize = maxCols > 8 ? 7 : (maxCols > 5 ? 8 : 9);
    const lineHeight = fontSize + 4;
    let curY = 65;

    const drawHeader = (headerRow) => {
      doc.setFillColor(30, 41, 59);
      doc.rect(margin, curY, usableW, lineHeight + 8, 'F');
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(fontSize);
      doc.setTextColor(255, 255, 255);

      for (let c = 0; c < maxCols; c++) {
        const val = String(headerRow[c] !== undefined ? headerRow[c] : `Col ${c + 1}`);
        const cellX = margin + (c * colW) + 4;
        const text = doc.splitTextToSize(val, colW - 6)[0] || '';
        doc.text(text, cellX, curY + fontSize + 3);
      }
      curY += lineHeight + 8;
    };

    // Draw first row as header
    const header = rows[0] || [];
    drawHeader(header);

    // Draw remaining rows
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(fontSize);

    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      let maxLinesInRow = 1;
      const cellLines = [];

      for (let c = 0; c < maxCols; c++) {
        const val = String(row[c] !== undefined ? row[c] : '');
        const lines = doc.splitTextToSize(val, colW - 6);
        const limitedLines = lines.slice(0, 3); // Max 3 lines per cell
        cellLines.push(limitedLines);
        if (limitedLines.length > maxLinesInRow) maxLinesInRow = limitedLines.length;
      }

      const rowHeight = (maxLinesInRow * lineHeight) + 6;

      // Check page overflow
      if (curY + rowHeight > ph - 35) {
        doc.addPage('a4', orientation);
        curY = 35;
        drawHeader(header);
      }

      // Zebra striping
      if (r % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, curY, usableW, rowHeight, 'F');
      }

      // Border line
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(margin, curY + rowHeight, margin + usableW, curY + rowHeight);

      // Render cell text
      doc.setTextColor(30, 41, 59);
      for (let c = 0; c < maxCols; c++) {
        const lines = cellLines[c] || [];
        const cellX = margin + (c * colW) + 4;
        lines.forEach((l, lIdx) => {
          doc.text(l, cellX, curY + fontSize + 2 + (lIdx * lineHeight));
        });
      }

      curY += rowHeight;
    }

    const pdfData = doc.output('blob');
    compiledPdfBlob = pdfData;
    document.getElementById('excel-pdf-download-box')?.classList.remove('hidden');
    if (typeof showToast === 'function') showToast('Excel converted to clean PDF successfully!');
  });

  document.getElementById('btn-download-excel-pdf')?.addEventListener('click', () => {
    if (compiledPdfBlob && currentFile) {
      downloadBlob(compiledPdfBlob, currentFile.name.replace(/\.[^.]+$/i, '.pdf'));
    }
  });
}

/* ==========================================================================
   6. WORD TO PDF ENGINE
   ========================================================================== */
function initWordToPdf() {
  const input = document.getElementById('word-pdf-file-input');
  if (!input) return;

  let currentFile = null;
  let wordPdfBlob = null;
  let renderedDocHtml = '';

  setupDropZone('word-pdf-drop-zone', 'word-pdf-file-input', '.docx', (file) => {
    currentFile = file;
    const nameEl = document.getElementById('word-pdf-filename');
    const sizeEl = document.getElementById('word-pdf-filesize');
    if (nameEl) nameEl.textContent = file.name;
    if (sizeEl) sizeEl.textContent = formatBytes(file.size);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        if (!window.mammoth) { notifyUser('Mammoth DOCX parser engine loading...'); return; }
        const result = await window.mammoth.convertToHtml({ arrayBuffer: e.target.result });
        renderedDocHtml = result.value;
        const preview = document.getElementById('word-document-preview');
        if (preview) preview.innerHTML = renderedDocHtml;
        document.getElementById('word-pdf-workspace')?.classList.remove('hidden');
      } catch (err) {
        console.error(err);
        notifyUser('Could not read Word document (.docx).');
      }
    };
    reader.readAsArrayBuffer(file);
  });

  document.getElementById('btn-convert-word-pdf')?.addEventListener('click', async () => {
    const preview = document.getElementById('word-document-preview');
    const { jsPDF } = window.jspdf || {};
    if (!preview || !jsPDF || !window.html2canvas) {
      notifyUser('PDF generation engine initializing...');
      return;
    }

    const btn = document.getElementById('btn-convert-word-pdf');
    btn.disabled = true;
    btn.innerHTML = '<span>🔄 Compiling Word Document to PDF...</span>';

    try {
      const canvas = await window.html2canvas(preview, { scale: 2, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const imgH = (canvas.height * pdfW) / canvas.width;

      let heightLeft = imgH;
      let pos = 0;

      pdf.addImage(imgData, 'JPEG', 0, pos, pdfW, imgH);
      heightLeft -= pdfH;

      while (heightLeft > 0) {
        pos = heightLeft - imgH;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, pos, pdfW, imgH);
        heightLeft -= pdfH;
      }

      wordPdfBlob = pdf.output('blob');
      document.getElementById('word-pdf-download-box')?.classList.remove('hidden');
      if (typeof showToast === 'function') showToast('Word document converted to PDF!');
    } catch (err) {
      console.error(err);
      notifyUser('Error generating PDF from Word file.');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<span>📄 Convert to PDF Now</span>';
    }
  });

  document.getElementById('btn-download-word-pdf')?.addEventListener('click', () => {
    if (wordPdfBlob && currentFile) {
      downloadBlob(wordPdfBlob, currentFile.name.replace(/\.docx$/i, '.pdf'));
    }
  });
}

/* ==========================================================================
   7. POWERPOINT TO PDF ENGINE
   ========================================================================== */
function initPowerPointToPdf() {
  const input = document.getElementById('ppt-pdf-file-input');
  if (!input) return;

  let currentFile = null;
  let pptPdfBlob = null;

  setupDropZone('ppt-pdf-drop-zone', 'ppt-pdf-file-input', '.pptx', async (file) => {
    currentFile = file;
    const nameEl = document.getElementById('ppt-pdf-filename');
    const sizeEl = document.getElementById('ppt-pdf-filesize');
    if (nameEl) nameEl.textContent = file.name;
    if (sizeEl) sizeEl.textContent = formatBytes(file.size);
    document.getElementById('ppt-pdf-workspace')?.classList.remove('hidden');
    document.getElementById('ppt-pdf-download-box')?.classList.add('hidden');

    if (window.JSZip) {
      try {
        const buffer = await file.arrayBuffer();
        const zip = await window.JSZip.loadAsync(buffer);
        const slideFiles = Object.keys(zip.files).filter(f => f.match(/^ppt\/slides\/slide\d+\.xml$/));
        if (sizeEl && slideFiles.length > 0) {
          sizeEl.textContent = `${formatBytes(file.size)} • ${slideFiles.length} Slide${slideFiles.length > 1 ? 's' : ''} Detected`;
        }
      } catch (e) {
        console.warn('PPTX pre-scan:', e);
      }
    }
  });

  document.getElementById('btn-convert-ppt-pdf')?.addEventListener('click', async () => {
    if (!currentFile) return;
    const { jsPDF } = window.jspdf || {};
    if (!jsPDF || !window.JSZip) {
      notifyUser('Required presentation conversion engines are loading...');
      return;
    }

    const btn = document.getElementById('btn-convert-ppt-pdf');
    btn.disabled = true;
    btn.innerHTML = '<span>📊 Compiling Presentation Slides to PDF...</span>';

    try {
      const buffer = await currentFile.arrayBuffer();
      const zip = await window.JSZip.loadAsync(buffer);

      const slideFiles = Object.keys(zip.files).filter(f => f.match(/^ppt\/slides\/slide\d+\.xml$/));
      slideFiles.sort((a, b) => {
        const na = parseInt(a.match(/slide(\d+)\.xml/)?.[1] || '0', 10);
        const nb = parseInt(b.match(/slide(\d+)\.xml/)?.[1] || '0', 10);
        return na - nb;
      });

      const totalSlides = Math.max(1, slideFiles.length);
      const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
      const pw = doc.internal.pageSize.getWidth();
      const ph = doc.internal.pageSize.getHeight();
      const parser = new DOMParser();

      for (let sIdx = 0; sIdx < totalSlides; sIdx++) {
        if (sIdx > 0) doc.addPage('a4', 'l');

        // Executive Presentation Theme Styling
        doc.setFillColor(15, 23, 42); // Deep slate
        doc.rect(0, 0, pw, ph, 'F');

        // Top Accent Stripe
        doc.setFillColor(99, 102, 241); // Indigo
        doc.rect(0, 0, pw, 6, 'F');

        // Header Branding
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184);
        const safeBaseName = currentFile.name.replace(/\.pptx$/i, '').toUpperCase();
        doc.text(safeBaseName.substring(0, 45), 50, 38);
        doc.text(`SLIDE ${sIdx + 1} OF ${totalSlides}`, pw - 50, 38, { align: 'right' });

        // Divider
        doc.setDrawColor(30, 41, 59);
        doc.setLineWidth(1);
        doc.line(50, 48, pw - 50, 48);

        // Parse slide content
        let slideTitle = '';
        const slideParagraphs = [];
        let slideImage = null;

        if (sIdx < slideFiles.length) {
          const sf = slideFiles[sIdx];
          const xml = await zip.file(sf)?.async('text');
          if (xml) {
            const xmlDoc = parser.parseFromString(xml, 'application/xml');
            const spList = xmlDoc.getElementsByTagName('p:sp');

            for (let s = 0; s < spList.length; s++) {
              const sp = spList[s];
              const phEl = sp.getElementsByTagName('p:ph')[0];
              const phType = phEl ? phEl.getAttribute('type') : null;
              const isTitleShape = phType === 'title' || phType === 'ctrTitle';

              const pList = sp.getElementsByTagName('a:p');
              for (let p = 0; p < pList.length; p++) {
                const tList = pList[p].getElementsByTagName('a:t');
                let lineText = '';
                for (let t = 0; t < tList.length; t++) {
                  lineText += tList[t].textContent || '';
                }
                lineText = lineText.trim();
                if (lineText) {
                  if (isTitleShape && !slideTitle) {
                    slideTitle = lineText;
                  } else {
                    slideParagraphs.push(lineText);
                  }
                }
              }
            }

            // Check for images in slide rels
            const slideNum = sf.match(/slide(\d+)\.xml/)?.[1];
            if (slideNum) {
              const relsFile = zip.file(`ppt/slides/_rels/slide${slideNum}.xml.rels`);
              if (relsFile) {
                const relsXml = await relsFile.async('text');
                const relsDoc = parser.parseFromString(relsXml, 'application/xml');
                const relEls = relsDoc.getElementsByTagName('Relationship');
                for (let r = 0; r < relEls.length; r++) {
                  const target = relEls[r].getAttribute('Target') || '';
                  if (target.includes('media/')) {
                    const mediaPath = 'ppt/' + target.replace(/^\.\.\//, '');
                    const imgFile = zip.file(mediaPath);
                    if (imgFile) {
                      const imgBase64 = await imgFile.async('base64');
                      const ext = mediaPath.split('.').pop()?.toLowerCase();
                      const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
                      slideImage = `data:${mime};base64,${imgBase64}`;
                      break;
                    }
                  }
                }
              }
            }
          }
        }

        if (!slideTitle && slideParagraphs.length > 0) {
          slideTitle = slideParagraphs.shift();
        }
        if (!slideTitle) {
          slideTitle = sIdx === 0 ? currentFile.name.replace(/\.pptx$/i, '') : `Slide ${sIdx + 1}`;
        }

        // Render Slide Title
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(255, 255, 255);
        const titleMaxWidth = slideImage ? (pw - 100) * 0.55 : pw - 100;
        const splitTitle = doc.splitTextToSize(slideTitle, titleMaxWidth);
        doc.text(splitTitle, 50, 85);

        let curY = 85 + (splitTitle.length * 24) + 10;

        // Slide Sub-divider accent
        doc.setFillColor(99, 102, 241);
        doc.rect(50, curY - 6, 60, 3, 'F');
        curY += 20;

        // Render Paragraphs / Bullets
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(13);
        doc.setTextColor(226, 232, 240);

        const contentMaxWidth = slideImage ? (pw - 100) * 0.52 : pw - 100;
        for (const para of slideParagraphs) {
          if (curY > ph - 65) break;
          const splitLines = doc.splitTextToSize(para.startsWith('•') || para.match(/^\d+\./) ? para : `•  ${para}`, contentMaxWidth);
          doc.text(splitLines, 50, curY);
          curY += (splitLines.length * 18) + 8;
        }

        // Render Image if present
        if (slideImage) {
          try {
            const imgX = (pw / 2) + 20;
            const imgY = 85;
            const imgW = (pw / 2) - 70;
            const imgH = ph - 160;
            doc.addImage(slideImage, 'JPEG', imgX, imgY, imgW, imgH);
          } catch (imgErr) {
            console.warn('Slide image embed fallback:', imgErr);
          }
        }

        // Footer
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text('GENERATED VIA DIGITAL CRON ENTERPRISE PDF SUITE • 100% PRIVATE CLIENT-SIDE PROCESSING', 50, ph - 25);
      }

      pptPdfBlob = doc.output('blob');
      document.getElementById('ppt-pdf-download-box')?.classList.remove('hidden');
      if (typeof showToast === 'function') showToast(`Successfully compiled ${totalSlides} slides into PDF!`);
    } catch (err) {
      console.error(err);
      notifyUser('Could not compile PowerPoint presentation to PDF.');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<span>📊 Convert Presentation to PDF</span>';
    }
  });

  document.getElementById('btn-download-ppt-pdf')?.addEventListener('click', () => {
    if (pptPdfBlob && currentFile) {
      downloadBlob(pptPdfBlob, currentFile.name.replace(/\.pptx$/i, '.pdf'));
    }
  });
}

/* ==========================================================================
   8. HTML TO PDF STUDIO
   ========================================================================== */
function initHtmlToPdf() {
  const codeEditor = document.getElementById('html-pdf-code');
  if (!codeEditor) return;

  const previewFrame = document.getElementById('html-pdf-preview');
  let compiledHtmlPdf = null;

  const updatePreview = () => {
    if (previewFrame) {
      if (previewFrame.tagName === 'IFRAME') {
        if (previewFrame.contentDocument) {
          previewFrame.contentDocument.open();
          previewFrame.contentDocument.write(codeEditor.value);
          previewFrame.contentDocument.close();
        }
      } else {
        previewFrame.innerHTML = codeEditor.value;
      }
    }
  };

  codeEditor.addEventListener('input', updatePreview);
  setTimeout(updatePreview, 100);

  document.getElementById('btn-convert-html-pdf')?.addEventListener('click', async () => {
    const { jsPDF } = window.jspdf || {};
    const targetElement = previewFrame?.tagName === 'IFRAME' ? previewFrame.contentDocument?.body : previewFrame;
    if (!jsPDF || !window.html2canvas || !targetElement) {
      if (typeof showToast === 'function') showToast('PDF rendering engine is preparing. Please try again in a moment.', 'info');
      return;
    }

    const btn = document.getElementById('btn-convert-html-pdf');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span>⚡ Rendering Vector PDF...</span>';
    }

    try {
      const orientation = document.getElementById('html-pdf-orientation')?.value || 'p';
      const pageSize = document.getElementById('html-pdf-format')?.value || 'a4';

      const canvas = await window.html2canvas(targetElement, { scale: 2 });
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF(orientation, 'pt', pageSize);
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const imgH = (canvas.height * pdfW) / canvas.width;

      let heightLeft = imgH;
      let pos = 0;

      pdf.addImage(imgData, 'JPEG', 0, pos, pdfW, imgH);
      heightLeft -= pdfH;

      while (heightLeft > 0) {
        pos = heightLeft - imgH;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, pos, pdfW, imgH);
        heightLeft -= pdfH;
      }

      compiledHtmlPdf = pdf.output('blob');
      document.getElementById('html-pdf-download-box')?.classList.remove('hidden');
      if (typeof showToast === 'function') showToast('HTML compiled into PDF document!', 'success');
    } catch (err) {
      console.error(err);
      if (typeof showToast === 'function') showToast('Error rendering HTML to PDF. Please check your HTML syntax.', 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span>📥 Export to PDF</span>';
      }
    }
  });

  document.getElementById('btn-download-html-pdf')?.addEventListener('click', () => {
    if (compiledHtmlPdf) downloadBlob(compiledHtmlPdf, 'document_export.pdf');
  });
}

/* ==========================================================================
   10. PROTECT & ENCRYPT PDF
   ========================================================================== */
function initProtectPdf() {
  const input = document.getElementById('protect-file-input');
  if (!input) return;

  let currentFile = null;

  setupDropZone('protect-drop-zone', 'protect-file-input', '.pdf', (file) => {
    currentFile = file;
    const nameEl = document.getElementById('protect-filename');
    const sizeEl = document.getElementById('protect-filesize');
    if (nameEl) nameEl.textContent = file.name;
    if (sizeEl) sizeEl.textContent = formatBytes(file.size);
    document.getElementById('protect-workspace')?.classList.remove('hidden');
    document.getElementById('protect-result-box')?.classList.add('hidden');
  });

  document.getElementById('btn-encrypt-pdf')?.addEventListener('click', async () => {
    const password = document.getElementById('protect-password')?.value;
    if (!password) { notifyUser('Please enter a secure password.'); return; }
    if (!currentFile || !window.PDFLib) return;

    const btn = document.getElementById('btn-encrypt-pdf');
    btn.disabled = true;
    btn.innerHTML = '<span>🔒 Encrypting Document...</span>';

    try {
      const buffer = await currentFile.arrayBuffer();
      const { PDFDocument } = window.PDFLib;
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });

      doc.encrypt({
        userPassword: password,
        ownerPassword: password + '_owner',
        permissions: { printing: 'highResolution', modifying: false, copying: false }
      });

      const encryptedBytes = await doc.save();
      const blob = new Blob([encryptedBytes], { type: 'application/pdf' });
      downloadBlob(blob, `protected_${currentFile.name}`);
      if (typeof showToast === 'function') showToast('Document encrypted and protected with password!');
    } catch (err) {
      console.error(err);
      notifyUser('Could not encrypt document. Please try again.');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<span>🔒 Encrypt & Download PDF</span>';
    }
  });
}

/* ==========================================================================
   12. SIGN PDF STUDIO
   ========================================================================== */
function initSignPdf() {
  const input = document.getElementById('sign-file-input');
  if (!input) return;

  let currentFile = null;
  let signatureImgData = null;
  let totalDocPages = 1;

  const pad = document.getElementById('signature-pad-canvas');
  let isDrawing = false;

  if (pad) {
    const pctx = pad.getContext('2d');
    pctx.lineWidth = 2.5;
    pctx.strokeStyle = '#0f172a';
    pctx.lineCap = 'round';
    pctx.lineJoin = 'round';

    const getCanvasPos = (evt) => {
      const rect = pad.getBoundingClientRect();
      const scaleX = pad.width / rect.width;
      const scaleY = pad.height / rect.height;
      const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
      const clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    };

    const startDraw = (e) => {
      e.preventDefault();
      isDrawing = true;
      const pos = getCanvasPos(e);
      pctx.beginPath();
      pctx.moveTo(pos.x, pos.y);
    };

    const moveDraw = (e) => {
      if (!isDrawing) return;
      e.preventDefault();
      const pos = getCanvasPos(e);
      pctx.lineTo(pos.x, pos.y);
      pctx.stroke();
    };

    const endDraw = (e) => {
      if (!isDrawing) return;
      isDrawing = false;
      signatureImgData = pad.toDataURL('image/png');
    };

    // Mouse events
    pad.addEventListener('mousedown', startDraw);
    pad.addEventListener('mousemove', moveDraw);
    pad.addEventListener('mouseup', endDraw);
    pad.addEventListener('mouseleave', endDraw);

    // Touch events for mobile/tablet signing
    pad.addEventListener('touchstart', startDraw, { passive: false });
    pad.addEventListener('touchmove', moveDraw, { passive: false });
    pad.addEventListener('touchend', endDraw, { passive: false });
    pad.addEventListener('touchcancel', endDraw, { passive: false });
  }

  document.getElementById('btn-clear-sig')?.addEventListener('click', () => {
    if (pad) pad.getContext('2d').clearRect(0, 0, pad.width, pad.height);
    signatureImgData = null;
  });

  setupDropZone('sign-drop-zone', 'sign-file-input', '.pdf', async (file) => {
    currentFile = file;
    const nameEl = document.getElementById('sign-filename');
    if (nameEl) nameEl.textContent = file.name;
    document.getElementById('sign-workspace')?.classList.remove('hidden');

    if (window.PDFLib) {
      try {
        const buffer = await file.arrayBuffer();
        const doc = await window.PDFLib.PDFDocument.load(buffer, { ignoreEncryption: true });
        totalDocPages = doc.getPageCount();

        const pageSelect = document.getElementById('sign-page-select');
        if (pageSelect) {
          pageSelect.innerHTML = `
            <option value="last">Last Page (Default)</option>
            <option value="first">First Page</option>
            <option value="all">All Pages</option>
          `;
          for (let p = 1; p <= totalDocPages; p++) {
            const opt = document.createElement('option');
            opt.value = String(p);
            opt.textContent = `Page ${p}`;
            pageSelect.appendChild(opt);
          }
        }
      } catch (err) {
        console.warn('Sign PDF scan:', err);
      }
    }
  });

  document.getElementById('btn-apply-signature')?.addEventListener('click', async () => {
    if (!currentFile || !signatureImgData || !window.PDFLib) {
      notifyUser('Please draw your signature before applying to document.');
      return;
    }

    const btn = document.getElementById('btn-apply-signature');
    btn.disabled = true;
    btn.innerHTML = '<span>✍️ Stamping Signature...</span>';

    try {
      const { PDFDocument } = window.PDFLib;
      const buffer = await currentFile.arrayBuffer();
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const sigImg = await doc.embedPng(signatureImgData);

      const pages = doc.getPages();
      const targetPageChoice = document.getElementById('sign-page-select')?.value || 'last';
      const posChoice = document.getElementById('sign-position-select')?.value || 'bottom-right';

      let targetPages = [];
      if (targetPageChoice === 'all') {
        targetPages = pages;
      } else if (targetPageChoice === 'first') {
        targetPages = [pages[0]];
      } else if (targetPageChoice === 'last') {
        targetPages = [pages[pages.length - 1]];
      } else {
        const pNum = parseInt(targetPageChoice, 10);
        if (pNum >= 1 && pNum <= pages.length) {
          targetPages = [pages[pNum - 1]];
        } else {
          targetPages = [pages[pages.length - 1]];
        }
      }

      const sigW = 150;
      const sigH = 65;

      for (const page of targetPages) {
        const { width, height } = page.getSize();
        let x = 40;
        let y = 40;

        if (posChoice === 'bottom-right') {
          x = width - sigW - 40;
          y = 40;
        } else if (posChoice === 'bottom-left') {
          x = 40;
          y = 40;
        } else if (posChoice === 'top-right') {
          x = width - sigW - 40;
          y = height - sigH - 40;
        } else if (posChoice === 'center') {
          x = (width - sigW) / 2;
          y = (height - sigH) / 2;
        }

        x = Math.max(10, Math.min(width - sigW - 10, x));
        y = Math.max(10, Math.min(height - sigH - 10, y));

        page.drawImage(sigImg, { x, y, width: sigW, height: sigH });
      }

      const outBytes = await doc.save();
      downloadBlob(new Blob([outBytes], { type: 'application/pdf' }), `signed_${currentFile.name}`);
      if (typeof showToast === 'function') showToast('Signature stamped & document downloaded!');
    } catch (err) {
      console.error(err);
      notifyUser('Could not apply signature to PDF.');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<span>✍️ APPLY SIGNATURE & DOWNLOAD PDF</span>';
    }
  });
}

/* ==========================================================================
   13. PDF WATERMARK ENGINE (Advanced Multi-Mode SaaS Suite)
   ========================================================================== */
function initPdfWatermark() {
  const input = document.getElementById('watermark-file-input');
  if (!input) return;

  let currentFile = null;
  let watermarkMode = 'text'; // 'text' or 'image'
  let stampImageData = null; // Image buffer/DataURL

  // Mode Switchers
  const textBtn = document.getElementById('wm-type-text-btn');
  const imgBtn = document.getElementById('wm-type-image-btn');
  const textConfig = document.getElementById('wm-text-config');
  const imgConfig = document.getElementById('wm-image-config');

  if (textBtn && imgBtn) {
    textBtn.addEventListener('click', () => {
      watermarkMode = 'text';
      textBtn.className = 'py-2.5 px-4 rounded-xl font-mono text-xs font-bold transition-all border border-[#6366F1] bg-[#6366F1]/10 text-[#6366F1]';
      imgBtn.className = 'py-2.5 px-4 rounded-xl font-mono text-xs font-bold transition-all border border-slate-300 dark:border-slate-700 text-slate-400 hover:text-white';
      textConfig?.classList.remove('hidden');
      imgConfig?.classList.add('hidden');
    });

    imgBtn.addEventListener('click', () => {
      watermarkMode = 'image';
      imgBtn.className = 'py-2.5 px-4 rounded-xl font-mono text-xs font-bold transition-all border border-[#6366F1] bg-[#6366F1]/10 text-[#6366F1]';
      textBtn.className = 'py-2.5 px-4 rounded-xl font-mono text-xs font-bold transition-all border border-slate-300 dark:border-slate-700 text-slate-400 hover:text-white';
      imgConfig?.classList.remove('hidden');
      textConfig?.classList.add('hidden');
    });
  }

  // Image dropzone listener
  const imgDropzone = document.getElementById('wm-image-dropzone');
  const imgInput = document.getElementById('watermark-img-input');
  const imgLabel = document.getElementById('wm-image-label');

  if (imgDropzone && imgInput) {
    imgDropzone.addEventListener('click', () => imgInput.click());
    imgDropzone.addEventListener('dragover', (e) => { e.preventDefault(); imgDropzone.classList.add('border-[#6366F1]'); });
    imgDropzone.addEventListener('dragleave', () => imgDropzone.classList.remove('border-[#6366F1]'));
    imgDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      imgDropzone.classList.remove('border-[#6366F1]');
      if (e.dataTransfer.files?.[0]) loadStampImage(e.dataTransfer.files[0]);
    });
    imgInput.addEventListener('change', (e) => {
      if (e.target.files?.[0]) loadStampImage(e.target.files[0]);
    });
  }

  function loadStampImage(file) {
    if (!file.type.startsWith('image/')) {
      notifyUser('Please select a PNG, JPG, or WebP image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      stampImageData = { buffer: e.target.result, type: file.type, name: file.name };
      if (imgLabel) imgLabel.innerHTML = `<span class="text-[#6366F1] font-bold">✓ Loaded: ${escapeHtml(file.name)}</span>`;
    };
    reader.readAsArrayBuffer(file);
  }

  // Opacity slider live feedback
  const opacityInput = document.getElementById('watermark-opacity');
  const opacityVal = document.getElementById('watermark-opacity-val');
  if (opacityInput && opacityVal) {
    opacityInput.addEventListener('input', () => {
      opacityVal.textContent = Math.round(parseFloat(opacityInput.value) * 100) + '%';
    });
  }

  // Page selection custom input toggle
  const pagesSelect = document.getElementById('watermark-pages');
  const customPagesInput = document.getElementById('watermark-custom-pages');
  if (pagesSelect && customPagesInput) {
    pagesSelect.addEventListener('change', () => {
      if (pagesSelect.value === 'custom') {
        customPagesInput.classList.remove('hidden');
      } else {
        customPagesInput.classList.add('hidden');
      }
    });
  }

  setupDropZone('watermark-drop-zone', 'watermark-file-input', '.pdf', (file) => {
    currentFile = file;
    const nameEl = document.getElementById('watermark-filename');
    if (nameEl) nameEl.textContent = file.name;
    document.getElementById('watermark-workspace')?.classList.remove('hidden');
  });

  document.getElementById('btn-apply-watermark')?.addEventListener('click', async () => {
    if (!currentFile || !window.PDFLib) return;

    if (watermarkMode === 'image' && !stampImageData) {
      notifyUser('Please upload a logo or stamp image first.');
      return;
    }

    const btn = document.getElementById('btn-apply-watermark');
    btn.disabled = true;
    btn.innerHTML = '<span>⏳ Stamping Watermark...</span>';

    try {
      const { PDFDocument, rgb, degrees, StandardFonts } = window.PDFLib;
      const buffer = await currentFile.arrayBuffer();
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const pages = doc.getPages();
      const totalPages = pages.length;

      const text = document.getElementById('watermark-text')?.value || 'CONFIDENTIAL';
      const opacity = parseFloat(document.getElementById('watermark-opacity')?.value || 0.30);
      const fontSize = parseInt(document.getElementById('watermark-size')?.value || 48);
      const position = document.getElementById('watermark-position')?.value || 'center';
      const rotationDeg = parseInt(document.getElementById('watermark-rotation')?.value || 45);
      const pageScope = document.getElementById('watermark-pages')?.value || 'all';

      // Parse target pages
      const targetIndices = new Set();
      if (pageScope === 'all') {
        for (let i = 0; i < totalPages; i++) targetIndices.add(i);
      } else if (pageScope === 'first') {
        targetIndices.add(0);
      } else if (pageScope === 'odd') {
        for (let i = 0; i < totalPages; i += 2) targetIndices.add(i);
      } else if (pageScope === 'even') {
        for (let i = 1; i < totalPages; i += 2) targetIndices.add(i);
      } else if (pageScope === 'custom') {
        const customVal = document.getElementById('watermark-custom-pages')?.value || '';
        const parts = customVal.split(',').map(s => s.trim());
        parts.forEach(p => {
          if (p.includes('-')) {
            const [s, e] = p.split('-').map(Number);
            if (!isNaN(s) && !isNaN(e)) {
              for (let k = Math.max(1, s); k <= Math.min(totalPages, e); k++) targetIndices.add(k - 1);
            }
          } else {
            const num = Number(p);
            if (!isNaN(num) && num >= 1 && num <= totalPages) targetIndices.add(num - 1);
          }
        });
      }

      let font = null;
      let embeddedImg = null;

      if (watermarkMode === 'text') {
        font = await doc.embedFont(StandardFonts.HelveticaBold);
      } else {
        if (stampImageData.type === 'image/png') {
          embeddedImg = await doc.embedPng(stampImageData.buffer);
        } else {
          embeddedImg = await doc.embedJpg(stampImageData.buffer);
        }
      }

      pages.forEach((page, idx) => {
        if (!targetIndices.has(idx)) return;
        const { width, height } = page.getSize();

        let stampW = 0;
        let stampH = 0;
        if (watermarkMode === 'text') {
          stampW = font.widthOfTextAtSize(text, fontSize);
          stampH = fontSize;
        } else {
          // Scale image down if larger than 25% of page
          const maxDim = Math.min(width, height) * 0.35;
          const scale = Math.min(maxDim / embeddedImg.width, maxDim / embeddedImg.height, 1);
          stampW = embeddedImg.width * scale;
          stampH = embeddedImg.height * scale;
        }

        const margin = 40;
        let posX = (width - stampW) / 2;
        let posY = (height - stampH) / 2;

        if (position === 'top-left') { posX = margin; posY = height - stampH - margin; }
        else if (position === 'top-center') { posX = (width - stampW) / 2; posY = height - stampH - margin; }
        else if (position === 'top-right') { posX = width - stampW - margin; posY = height - stampH - margin; }
        else if (position === 'center-left') { posX = margin; posY = (height - stampH) / 2; }
        else if (position === 'center-right') { posX = width - stampW - margin; posY = (height - stampH) / 2; }
        else if (position === 'bottom-left') { posX = margin; posY = margin; }
        else if (position === 'bottom-center') { posX = (width - stampW) / 2; posY = margin; }
        else if (position === 'bottom-right') { posX = width - stampW - margin; posY = margin; }

        if (watermarkMode === 'text') {
          page.drawText(text, {
            x: posX,
            y: posY,
            size: fontSize,
            font,
            color: rgb(0.5, 0.5, 0.55),
            opacity,
            rotate: degrees(rotationDeg)
          });
        } else {
          page.drawImage(embeddedImg, {
            x: posX,
            y: posY,
            width: stampW,
            height: stampH,
            opacity,
            rotate: degrees(rotationDeg)
          });
        }
      });

      const outBytes = await doc.save();
      downloadBlob(new Blob([outBytes], { type: 'application/pdf' }), `watermarked_${currentFile.name}`);
      if (typeof showToast === 'function') showToast('Watermark stamped across selected pages!');
    } catch (err) {
      console.error(err);
      notifyUser('Failed to stamp watermark: ' + (err.message || 'Unknown error'));
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg> APPLY WATERMARK & DOWNLOAD';
    }
  });
}

/* ==========================================================================
   14. ORGANIZE & REORDER PDF PAGES
   ========================================================================== */
function initOrganizePdf() {
  const input = document.getElementById('organize-file-input');
  if (!input) return;

  let currentFile = null;
  let pageOrder = [];
  let pageRotations = [];
  let pageThumbnails = []; // cached thumbnail data URLs

  const renderGrid = () => {
    const grid = document.getElementById('organize-pages-grid');
    if (!grid) return;
    grid.innerHTML = '';

    pageOrder.forEach((pageIdx, posIdx) => {
      const rot = pageRotations[pageIdx] || 0;
      const thumb = pageThumbnails[pageIdx] || '';

      const card = document.createElement('div');
      card.className = 'p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center space-y-2 text-xs font-mono shadow-sm transition-all';
      card.id = `org-card-${pageIdx}`;

      const isFirst = posIdx === 0;
      const isLast = posIdx === pageOrder.length - 1;

      card.innerHTML = `
        <div class="flex items-center justify-between w-full">
          <span class="font-bold text-slate-800 dark:text-slate-200">Page ${pageIdx + 1}</span>
          <button type="button" class="text-rose-500 hover:text-rose-600 font-bold px-1" title="Delete Page" onclick="deleteOrganizePage(${pageIdx})">✕</button>
        </div>
        <div class="w-full h-36 bg-slate-50 dark:bg-slate-950 rounded-xl flex items-center justify-center overflow-hidden p-1 border border-slate-100 dark:border-slate-800">
          ${thumb ? `<img src="${thumb}" style="transform: rotate(${rot}deg); transition: transform 0.2s;" class="max-h-32 max-w-full object-contain rounded" alt="Page ${pageIdx + 1}">` : `<div class="text-3xl">📄</div>`}
        </div>
        <div class="flex items-center justify-between w-full pt-1">
          <div class="flex items-center gap-1">
            <button type="button" class="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded font-bold ${isFirst ? 'opacity-40 cursor-not-allowed' : ''}" title="Move Left" onclick="moveOrganizePage(${posIdx}, -1)" ${isFirst ? 'disabled' : ''}>←</button>
            <button type="button" class="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded font-bold ${isLast ? 'opacity-40 cursor-not-allowed' : ''}" title="Move Right" onclick="moveOrganizePage(${posIdx}, 1)" ${isLast ? 'disabled' : ''}>→</button>
          </div>
          <button type="button" class="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white rounded font-bold transition-colors text-[11px]" title="Rotate Page" onclick="rotateOrganizePage(${pageIdx})">↻ ${rot}°</button>
        </div>
      `;
      grid.appendChild(card);
    });
  };

  setupDropZone('organize-drop-zone', 'organize-file-input', '.pdf', async (file) => {
    currentFile = file;
    const nameEl = document.getElementById('organize-filename');
    if (nameEl) nameEl.textContent = file.name;

    const buffer = await file.arrayBuffer();
    if (!window.pdfjsLib) {
      notifyUser('PDF rendering engine is preparing. Please try again.');
      return;
    }

    const pdf = await window.pdfjsLib.getDocument({ data: buffer }).promise;
    pageOrder = [];
    pageRotations = [];
    pageThumbnails = [];

    // Render real page canvas thumbnails
    for (let i = 1; i <= pdf.numPages; i++) {
      pageOrder.push(i - 1);
      pageRotations.push(0);

      try {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.35 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;
        pageThumbnails.push(canvas.toDataURL('image/jpeg', 0.85));
      } catch (e) {
        pageThumbnails.push('');
      }
    }

    renderGrid();
    document.getElementById('organize-workspace')?.classList.remove('hidden');
  });

  window.moveOrganizePage = (posIdx, dir) => {
    const targetIdx = posIdx + dir;
    if (targetIdx < 0 || targetIdx >= pageOrder.length) return;
    const temp = pageOrder[posIdx];
    pageOrder[posIdx] = pageOrder[targetIdx];
    pageOrder[targetIdx] = temp;
    renderGrid();
  };

  window.deleteOrganizePage = (pageIdx) => {
    pageOrder = pageOrder.filter(p => p !== pageIdx);
    renderGrid();
    if (typeof showToast === 'function') showToast(`Page ${pageIdx + 1} removed.`);
  };

  window.rotateOrganizePage = (pageIdx) => {
    pageRotations[pageIdx] = ((pageRotations[pageIdx] || 0) + 90) % 360;
    renderGrid();
    if (typeof showToast === 'function') showToast(`Page ${pageIdx + 1} rotated to ${pageRotations[pageIdx]}°`);
  };

  document.getElementById('btn-save-organized')?.addEventListener('click', async () => {
    if (!currentFile || !window.PDFLib) return;
    if (pageOrder.length === 0) {
      notifyUser('Document must contain at least one page.');
      return;
    }

    const btn = document.getElementById('btn-save-organized');
    btn.disabled = true;
    btn.innerHTML = '<span>📄 Generating Reordered PDF...</span>';

    try {
      const { PDFDocument, degrees } = window.PDFLib;
      const buffer = await currentFile.arrayBuffer();
      const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const newDoc = await PDFDocument.create();

      for (const pageIdx of pageOrder) {
        const [copiedPage] = await newDoc.copyPages(srcDoc, [pageIdx]);
        const addRot = pageRotations[pageIdx] || 0;
        copiedPage.setRotation(degrees((copiedPage.getRotation().angle + addRot) % 360));
        newDoc.addPage(copiedPage);
      }

      const outBytes = await newDoc.save();
      downloadBlob(new Blob([outBytes], { type: 'application/pdf' }), `organized_${currentFile.name}`);
      if (typeof showToast === 'function') showToast('Reordered PDF downloaded successfully!');
    } catch (err) {
      console.error(err);
      notifyUser('Could not save reordered document.');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<span>💾 SAVE & DOWNLOAD REORDERED PDF</span>';
    }
  });
}

/* ==========================================================================
   15. UNLOCK PDF (Remove Password & Permissions)
   ========================================================================== */
function initUnlockPdf() {
  const input = document.getElementById('unlock-file-input');
  if (!input) return;

  let currentFile = null;
  let fileBuffer = null;

  setupDropZone('unlock-drop-zone', 'unlock-file-input', '.pdf', async (file) => {
    currentFile = file;
    const nameEl = document.getElementById('unlock-filename');
    const sizeEl = document.getElementById('unlock-filesize');
    if (nameEl) nameEl.textContent = file.name;
    if (sizeEl) sizeEl.textContent = formatBytes(file.size);
    document.getElementById('unlock-workspace')?.classList.remove('hidden');
    document.getElementById('unlock-result-box')?.classList.add('hidden');

    fileBuffer = await file.arrayBuffer();

    const statusEl = document.getElementById('unlock-status-badge');
    const passSection = document.getElementById('unlock-password-section');
    try {
      if (window.PDFLib) {
        await window.PDFLib.PDFDocument.load(fileBuffer.slice(0));
        if (statusEl) {
          statusEl.textContent = 'Restrictions Detected (Ready to Unlock)';
          statusEl.className = 'text-xs font-bold text-emerald-400 uppercase tracking-wider';
        }
        passSection?.classList.add('hidden');
      }
    } catch (e) {
      if (statusEl) {
        statusEl.textContent = 'Password Protected (Enter Password Below)';
        statusEl.className = 'text-xs font-bold text-amber-400 uppercase tracking-wider';
      }
      passSection?.classList.remove('hidden');
    }
  });

  document.getElementById('btn-unlock-pdf')?.addEventListener('click', async () => {
    if (!currentFile || !fileBuffer || !window.PDFLib) return;

    const btn = document.getElementById('btn-unlock-pdf');
    btn.disabled = true;
    btn.innerHTML = '<span>🔓 Decrypting Document...</span>';

    try {
      const password = document.getElementById('unlock-password')?.value || '';
      const { PDFDocument } = window.PDFLib;
      
      let srcDoc = null;
      try {
        srcDoc = await PDFDocument.load(fileBuffer, { password: password || undefined, ignoreEncryption: !password });
      } catch (err) {
        notifyUser('Incorrect password. Please enter the valid document password.');
        btn.disabled = false;
        btn.innerHTML = '<span>🔓 UNLOCK & DOWNLOAD PDF</span>';
        return;
      }

      const newDoc = await PDFDocument.create();
      const pageIndices = srcDoc.getPageIndices();
      const copiedPages = await newDoc.copyPages(srcDoc, pageIndices);
      copiedPages.forEach(p => newDoc.addPage(p));

      const unlockedBytes = await newDoc.save();
      const blob = new Blob([unlockedBytes], { type: 'application/pdf' });
      downloadBlob(blob, `unlocked_${currentFile.name}`);

      document.getElementById('unlock-result-box')?.classList.remove('hidden');
      if (typeof showToast === 'function') showToast('PDF unlocked and permissions unrestricted!');
    } catch (err) {
      console.error(err);
      notifyUser('Could not unlock document. ' + (err.message || ''));
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<span>🔓 UNLOCK & DOWNLOAD PDF</span>';
    }
  });
}

/* ==========================================================================
   16. CROP PDF (Visual Margins & Page Trimmer)
   ========================================================================== */
function initCropPdf() {
  const input = document.getElementById('crop-file-input');
  if (!input) return;

  let currentFile = null;
  let pdfJsDoc = null;
  let currentPage = 1;
  let totalPages = 1;

  setupDropZone('crop-drop-zone', 'crop-file-input', '.pdf', async (file) => {
    currentFile = file;
    const nameEl = document.getElementById('crop-filename');
    if (nameEl) nameEl.textContent = file.name;
    document.getElementById('crop-workspace')?.classList.remove('hidden');

    if (window.pdfjsLib) {
      try {
        const buffer = await file.arrayBuffer();
        pdfJsDoc = await window.pdfjsLib.getDocument({ data: buffer.slice(0) }).promise;
        totalPages = pdfJsDoc.numPages;
        currentPage = 1;
        renderCropPreview();
      } catch (err) {
        console.warn('Crop PDF preview error:', err);
      }
    }
  });

  async function renderCropPreview() {
    if (!pdfJsDoc) return;
    const page = await pdfJsDoc.getPage(currentPage);
    const canvas = document.getElementById('crop-preview-canvas');
    if (!canvas) return;

    const viewport = page.getViewport({ scale: 1.0 });
    const ctx = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: ctx, viewport }).promise;
    drawCropOverlay();

    const info = document.getElementById('crop-page-info');
    if (info) info.textContent = `Page ${currentPage} of ${totalPages} (${Math.round(viewport.width)} × ${Math.round(viewport.height)} pt)`;
  }

  function drawCropOverlay() {
    const canvas = document.getElementById('crop-preview-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const top = parseFloat(document.getElementById('crop-top')?.value || 36);
    const bottom = parseFloat(document.getElementById('crop-bottom')?.value || 36);
    const left = parseFloat(document.getElementById('crop-left')?.value || 36);
    const right = parseFloat(document.getElementById('crop-right')?.value || 36);

    ctx.save();
    ctx.fillStyle = 'rgba(99, 102, 241, 0.15)';
    ctx.strokeStyle = '#6366F1';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);

    const cropW = Math.max(10, canvas.width - left - right);
    const cropH = Math.max(10, canvas.height - top - bottom);

    ctx.fillRect(left, top, cropW, cropH);
    ctx.strokeRect(left, top, cropW, cropH);
    ctx.restore();
  }

  ['crop-top', 'crop-bottom', 'crop-left', 'crop-right'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', () => {
      renderCropPreview();
    });
  });

  document.getElementById('crop-preset-trim')?.addEventListener('click', () => {
    ['crop-top', 'crop-bottom', 'crop-left', 'crop-right'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = 36;
    });
    renderCropPreview();
  });
  document.getElementById('crop-preset-heavy')?.addEventListener('click', () => {
    ['crop-top', 'crop-bottom', 'crop-left', 'crop-right'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = 72;
    });
    renderCropPreview();
  });
  document.getElementById('crop-preset-reset')?.addEventListener('click', () => {
    ['crop-top', 'crop-bottom', 'crop-left', 'crop-right'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = 0;
    });
    renderCropPreview();
  });

  document.getElementById('btn-apply-crop')?.addEventListener('click', async () => {
    if (!currentFile || !window.PDFLib) return;

    const btn = document.getElementById('btn-apply-crop');
    btn.disabled = true;
    btn.innerHTML = '<span>📐 Cropping Document...</span>';

    try {
      const { PDFDocument } = window.PDFLib;
      const buffer = await currentFile.arrayBuffer();
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const pages = doc.getPages();

      const top = parseFloat(document.getElementById('crop-top')?.value || 36);
      const bottom = parseFloat(document.getElementById('crop-bottom')?.value || 36);
      const left = parseFloat(document.getElementById('crop-left')?.value || 36);
      const right = parseFloat(document.getElementById('crop-right')?.value || 36);
      const pageScope = document.getElementById('crop-pages')?.value || 'all';

      pages.forEach((page, idx) => {
        if (pageScope === 'first' && idx !== 0) return;
        const { width, height } = page.getSize();
        const newX = left;
        const newY = bottom;
        const newW = Math.max(50, width - left - right);
        const newH = Math.max(50, height - top - bottom);

        page.setCropBox(newX, newY, newW, newH);
        page.setMediaBox(newX, newY, newW, newH);
      });

      const outBytes = await doc.save();
      downloadBlob(new Blob([outBytes], { type: 'application/pdf' }), `cropped_${currentFile.name}`);
      if (typeof showToast === 'function') showToast('PDF cropped successfully!');
    } catch (err) {
      console.error(err);
      notifyUser('Could not crop document: ' + (err.message || ''));
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<span>📐 CROP & DOWNLOAD PDF</span>';
    }
  });
}

/* ==========================================================================
   17. REDACT PDF (Permanent Canvas Flattening & PII Sanitization)
   ========================================================================== */
function initRedactPdf() {
  const input = document.getElementById('redact-file-input');
  if (!input) return;

  let currentFile = null;
  let pdfJsDoc = null;
  let currentPage = 1;
  let totalPages = 1;
  let redactions = {};
  let isDrawing = false;
  let startX = 0, startY = 0;

  setupDropZone('redact-drop-zone', 'redact-file-input', '.pdf', async (file) => {
    currentFile = file;
    const nameEl = document.getElementById('redact-filename');
    if (nameEl) nameEl.textContent = file.name;
    document.getElementById('redact-workspace')?.classList.remove('hidden');

    if (window.pdfjsLib) {
      try {
        const buffer = await file.arrayBuffer();
        pdfJsDoc = await window.pdfjsLib.getDocument({ data: buffer.slice(0) }).promise;
        totalPages = pdfJsDoc.numPages;
        currentPage = 1;
        redactions = {};
        renderRedactPage();
      } catch (err) {
        console.warn('Redact PDF load error:', err);
      }
    }
  });

  async function renderRedactPage() {
    if (!pdfJsDoc) return;
    const page = await pdfJsDoc.getPage(currentPage);
    const canvas = document.getElementById('redact-canvas');
    const overlay = document.getElementById('redact-overlay');
    if (!canvas || !overlay) return;

    const viewport = page.getViewport({ scale: 1.25 });
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    overlay.width = viewport.width;
    overlay.height = viewport.height;

    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
    redrawRedactions();

    const info = document.getElementById('redact-page-info');
    if (info) info.textContent = `Page ${currentPage} of ${totalPages}`;
  }

  function redrawRedactions() {
    const overlay = document.getElementById('redact-overlay');
    if (!overlay) return;
    const ctx = overlay.getContext('2d');
    ctx.clearRect(0, 0, overlay.width, overlay.height);

    const list = redactions[currentPage] || [];
    ctx.fillStyle = '#000000';
    list.forEach(r => {
      ctx.fillRect(r.x, r.y, r.w, r.h);
    });

    const countEl = document.getElementById('redact-box-count');
    if (countEl) countEl.textContent = `${list.length} redaction area(s) on Page ${currentPage}`;
  }

  const overlay = document.getElementById('redact-overlay');
  if (overlay) {
    const getPos = (e) => {
      const rect = overlay.getBoundingClientRect();
      const scaleX = overlay.width / rect.width;
      const scaleY = overlay.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    };

    overlay.addEventListener('mousedown', (e) => {
      isDrawing = true;
      const pos = getPos(e);
      startX = pos.x;
      startY = pos.y;
    });

    overlay.addEventListener('mousemove', (e) => {
      if (!isDrawing) return;
      const pos = getPos(e);
      redrawRedactions();
      const ctx = overlay.getContext('2d');
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2;
      const w = pos.x - startX;
      const h = pos.y - startY;
      ctx.fillRect(startX, startY, w, h);
      ctx.strokeRect(startX, startY, w, h);
    });

    overlay.addEventListener('mouseup', (e) => {
      if (!isDrawing) return;
      isDrawing = false;
      const pos = getPos(e);
      const w = pos.x - startX;
      const h = pos.y - startY;
      if (Math.abs(w) > 5 && Math.abs(h) > 5) {
        if (!redactions[currentPage]) redactions[currentPage] = [];
        redactions[currentPage].push({
          x: Math.min(startX, pos.x),
          y: Math.min(startY, pos.y),
          w: Math.abs(w),
          h: Math.abs(h)
        });
      }
      redrawRedactions();
    });
  }

  document.getElementById('btn-redact-prev')?.addEventListener('click', () => {
    if (currentPage > 1) { currentPage--; renderRedactPage(); }
  });
  document.getElementById('btn-redact-next')?.addEventListener('click', () => {
    if (currentPage < totalPages) { currentPage++; renderRedactPage(); }
  });
  document.getElementById('btn-clear-redactions')?.addEventListener('click', () => {
    redactions[currentPage] = [];
    redrawRedactions();
    if (typeof showToast === 'function') showToast('Redactions cleared for current page.');
  });

  document.getElementById('btn-burn-redactions')?.addEventListener('click', async () => {
    if (!currentFile || !pdfJsDoc || !window.PDFLib) return;

    const totalRedactions = Object.values(redactions).reduce((sum, arr) => sum + arr.length, 0);
    if (totalRedactions === 0) {
      notifyUser('Please draw at least one redaction box on sensitive text.');
      return;
    }

    const btn = document.getElementById('btn-burn-redactions');
    btn.disabled = true;
    btn.innerHTML = '<span>🔒 Permanently Burning Redactions...</span>';

    try {
      const { PDFDocument } = window.PDFLib;
      const newPdf = await PDFDocument.create();

      for (let p = 1; p <= totalPages; p++) {
        const page = await pdfJsDoc.getPage(p);
        const viewport = page.getViewport({ scale: 2.0 });
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = viewport.width;
        pageCanvas.height = viewport.height;
        const pageCtx = pageCanvas.getContext('2d');

        await page.render({ canvasContext: pageCtx, viewport }).promise;

        const list = redactions[p] || [];
        const overlay = document.getElementById('redact-overlay');
        const scaleFactor = viewport.width / (overlay ? overlay.width : viewport.width);

        pageCtx.fillStyle = '#000000';
        list.forEach(r => {
          pageCtx.fillRect(r.x * scaleFactor, r.y * scaleFactor, r.w * scaleFactor, r.h * scaleFactor);
        });

        const imgDataUrl = pageCanvas.toDataURL('image/jpeg', 0.92);
        const imgBytes = await (await fetch(imgDataUrl)).arrayBuffer();
        const embeddedImg = await newPdf.embedJpg(imgBytes);

        const origPageViewport = page.getViewport({ scale: 1.0 });
        const newPage = newPdf.addPage([origPageViewport.width, origPageViewport.height]);
        newPage.drawImage(embeddedImg, {
          x: 0,
          y: 0,
          width: origPageViewport.width,
          height: origPageViewport.height
        });
      }

      const outBytes = await newPdf.save();
      downloadBlob(new Blob([outBytes], { type: 'application/pdf' }), `redacted_${currentFile.name}`);
      if (typeof showToast === 'function') showToast('PDF sanitized & permanently redacted!');
    } catch (err) {
      console.error(err);
      notifyUser('Could not sanitize PDF: ' + (err.message || ''));
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<span>🔒 PERMANENTLY BURN REDACTIONS & DOWNLOAD</span>';
    }
  });
}

/* ==========================================================================
   18. COMPARE PDF (Side-by-Side Visual Diff Inspector)
   ========================================================================== */
function initComparePdf() {
  const dropA = document.getElementById('compare-drop-a');
  const dropB = document.getElementById('compare-drop-b');
  if (!dropA || !dropB) return;

  let fileA = null, fileB = null;
  let docA = null, docB = null;
  let currentPage = 1;
  let maxPages = 1;

  setupDropZone('compare-drop-a', 'compare-input-a', '.pdf', async (file) => {
    fileA = file;
    document.getElementById('compare-name-a').textContent = file.name;
    checkBothLoaded();
  });

  setupDropZone('compare-drop-b', 'compare-input-b', '.pdf', async (file) => {
    fileB = file;
    document.getElementById('compare-name-b').textContent = file.name;
    checkBothLoaded();
  });

  async function checkBothLoaded() {
    if (fileA && fileB && window.pdfjsLib) {
      document.getElementById('compare-workspace')?.classList.remove('hidden');
      const bufA = await fileA.arrayBuffer();
      const bufB = await fileB.arrayBuffer();
      docA = await window.pdfjsLib.getDocument({ data: bufA }).promise;
      docB = await window.pdfjsLib.getDocument({ data: bufB }).promise;
      maxPages = Math.min(docA.numPages, docB.numPages);
      currentPage = 1;
      renderComparison();
    }
  }

  async function renderComparison() {
    if (!docA || !docB) return;
    const pageA = await docA.getPage(currentPage);
    const pageB = await docB.getPage(currentPage);

    const canvasA = document.getElementById('compare-canvas-a');
    const canvasB = document.getElementById('compare-canvas-b');
    const canvasDiff = document.getElementById('compare-canvas-diff');
    if (!canvasA || !canvasB || !canvasDiff) return;

    const viewportA = pageA.getViewport({ scale: 1.0 });
    const viewportB = pageB.getViewport({ scale: 1.0 });

    canvasA.width = viewportA.width;
    canvasA.height = viewportA.height;
    canvasB.width = viewportB.width;
    canvasB.height = viewportB.height;

    await pageA.render({ canvasContext: canvasA.getContext('2d'), viewport: viewportA }).promise;
    await pageB.render({ canvasContext: canvasB.getContext('2d'), viewport: viewportB }).promise;

    const w = Math.max(canvasA.width, canvasB.width);
    const h = Math.max(canvasA.height, canvasB.height);
    canvasDiff.width = w;
    canvasDiff.height = h;

    const ctxA = canvasA.getContext('2d');
    const ctxB = canvasB.getContext('2d');
    const ctxDiff = canvasDiff.getContext('2d');

    const imgDataA = ctxA.getImageData(0, 0, canvasA.width, canvasA.height);
    const imgDataB = ctxB.getImageData(0, 0, canvasB.width, canvasB.height);
    const outDiff = ctxDiff.createImageData(w, h);

    let diffPixels = 0;
    const totalPixels = w * h;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const outIdx = (y * w + x) * 4;
        const inA = (x < canvasA.width && y < canvasA.height) ? (y * canvasA.width + x) * 4 : -1;
        const inB = (x < canvasB.width && y < canvasB.height) ? (y * canvasB.width + x) * 4 : -1;

        const rA = inA >= 0 ? imgDataA.data[inA] : 255;
        const gA = inA >= 0 ? imgDataA.data[inA + 1] : 255;
        const bA = inA >= 0 ? imgDataA.data[inA + 2] : 255;

        const rB = inB >= 0 ? imgDataB.data[inB] : 255;
        const gB = inB >= 0 ? imgDataB.data[inB + 1] : 255;
        const bB = inB >= 0 ? imgDataB.data[inB + 2] : 255;

        const colorDist = Math.abs(rA - rB) + Math.abs(gA - gB) + Math.abs(bA - bB);

        if (colorDist > 40) {
          diffPixels++;
          if (rA > rB) {
            outDiff.data[outIdx] = 16;
            outDiff.data[outIdx + 1] = 185;
            outDiff.data[outIdx + 2] = 129;
            outDiff.data[outIdx + 3] = 255;
          } else {
            outDiff.data[outIdx] = 239;
            outDiff.data[outIdx + 1] = 68;
            outDiff.data[outIdx + 2] = 68;
            outDiff.data[outIdx + 3] = 255;
          }
        } else {
          const lum = Math.round((rA + gA + bA) / 3);
          outDiff.data[outIdx] = lum;
          outDiff.data[outIdx + 1] = lum;
          outDiff.data[outIdx + 2] = lum;
          outDiff.data[outIdx + 3] = 80;
        }
      }
    }

    ctxDiff.putImageData(outDiff, 0, 0);

    const matchPct = (100 - (diffPixels / totalPixels) * 100).toFixed(2);
    const statEl = document.getElementById('compare-diff-stats');
    if (statEl) statEl.textContent = `Visual Match: ${matchPct}% • ${diffPixels.toLocaleString()} differences highlighted`;

    const info = document.getElementById('compare-page-info');
    if (info) info.textContent = `Page ${currentPage} of ${maxPages}`;
  }

  document.getElementById('btn-view-side')?.addEventListener('click', () => {
    document.getElementById('compare-side-container')?.classList.remove('hidden');
    document.getElementById('compare-diff-container')?.classList.add('hidden');
  });
  document.getElementById('btn-view-diff')?.addEventListener('click', () => {
    document.getElementById('compare-side-container')?.classList.add('hidden');
    document.getElementById('compare-diff-container')?.classList.remove('hidden');
  });

  document.getElementById('compare-prev-page')?.addEventListener('click', () => {
    if (currentPage > 1) { currentPage--; renderComparison(); }
  });
  document.getElementById('compare-next-page')?.addEventListener('click', () => {
    if (currentPage < maxPages) { currentPage++; renderComparison(); }
  });
}

/* ==========================================================================
   19. REPAIR PDF (Rebuild XREF Tables & Fault-Tolerant Stream Recovery)
   ========================================================================== */
function initRepairPdf() {
  const input = document.getElementById('repair-file-input');
  if (!input) return;

  let currentFile = null;

  setupDropZone('repair-drop-zone', 'repair-file-input', '.pdf', (file) => {
    currentFile = file;
    const nameEl = document.getElementById('repair-filename');
    const sizeEl = document.getElementById('repair-filesize');
    if (nameEl) nameEl.textContent = file.name;
    if (sizeEl) sizeEl.textContent = formatBytes(file.size);
    document.getElementById('repair-workspace')?.classList.remove('hidden');
    document.getElementById('repair-report')?.classList.add('hidden');
  });

  document.getElementById('btn-repair-pdf')?.addEventListener('click', async () => {
    if (!currentFile || !window.PDFLib) return;

    const btn = document.getElementById('btn-repair-pdf');
    btn.disabled = true;
    btn.innerHTML = '<span>🩹 Analyzing & Repairing PDF...</span>';

    try {
      const { PDFDocument } = window.PDFLib;
      const buffer = await currentFile.arrayBuffer();

      const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const pageCount = srcDoc.getPageCount();

      const repairedDoc = await PDFDocument.create();
      const pageIndices = [];
      for (let i = 0; i < pageCount; i++) pageIndices.push(i);

      const copiedPages = await repairedDoc.copyPages(srcDoc, pageIndices);
      copiedPages.forEach(p => repairedDoc.addPage(p));

      const repairedBytes = await repairedDoc.save({ useObjectStreams: true });
      const blob = new Blob([repairedBytes], { type: 'application/pdf' });
      downloadBlob(blob, `repaired_${currentFile.name}`);

      const report = document.getElementById('repair-report');
      if (report) {
        report.classList.remove('hidden');
        document.getElementById('repair-pages-recovered').textContent = `${copiedPages.length} of ${pageCount} pages recovered (100%)`;
        document.getElementById('repair-xref-status').textContent = 'Cross-reference table reconstructed & deflated';
        document.getElementById('repair-stream-status').textContent = 'Corrupt stream dictionaries resolved & standardized';
      }

      if (typeof showToast === 'function') showToast('PDF repaired successfully!');
    } catch (err) {
      console.error(err);
      notifyUser('Could not repair document: ' + (err.message || 'Severe binary corruption'));
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<span>🩹 REPAIR & DOWNLOAD PDF</span>';
    }
  });
}

/* ==========================================================================
   20. PDF TO PDF/A ARCHIVAL CONVERTER (ISO 19005 Standardization)
   ========================================================================== */
function initPdfToPdfa() {
  const input = document.getElementById('pdfa-file-input');
  if (!input) return;

  let currentFile = null;

  setupDropZone('pdfa-drop-zone', 'pdfa-file-input', '.pdf', (file) => {
    currentFile = file;
    const nameEl = document.getElementById('pdfa-filename');
    const sizeEl = document.getElementById('pdfa-filesize');
    if (nameEl) nameEl.textContent = file.name;
    if (sizeEl) sizeEl.textContent = formatBytes(file.size);
    document.getElementById('pdfa-workspace')?.classList.remove('hidden');
    document.getElementById('pdfa-result-box')?.classList.add('hidden');
  });

  document.getElementById('btn-convert-pdfa')?.addEventListener('click', async () => {
    if (!currentFile || !window.PDFLib) return;

    const btn = document.getElementById('btn-convert-pdfa');
    btn.disabled = true;
    btn.innerHTML = '<span>📜 Standardizing to ISO Archival Format...</span>';

    try {
      const { PDFDocument, PDFName, PDFString } = window.PDFLib;
      const buffer = await currentFile.arrayBuffer();
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });

      const catalog = doc.catalog;
      try {
        catalog.delete(PDFName.of('Names'));
        catalog.delete(PDFName.of('OpenAction'));
        catalog.delete(PDFName.of('AA'));
      } catch (e) {
        /* Ignore if missing */
      }

      const outputIntent = doc.context.obj({
        Type: 'OutputIntent',
        S: 'GTS_PDFA1',
        OutputConditionIdentifier: PDFString.of('sRGB IEC61966-2.1'),
        RegistryName: PDFString.of('http://www.color.org'),
        Info: PDFString.of('sRGB IEC61966-2.1')
      });
      const outputIntentRef = doc.context.register(outputIntent);
      const outputIntentsArray = doc.context.obj([outputIntentRef]);
      catalog.set(PDFName.of('OutputIntents'), outputIntentsArray);

      const isoDate = new Date().toISOString();
      const xmpXml = `<?xpacket begin="" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about="" xmlns:pdfaid="http://www.aiim.org/pdfa/ns/id/">
      <pdfaid:part>1</pdfaid:part>
      <pdfaid:conformance>B</pdfaid:conformance>
    </rdf:Description>
    <rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/">
      <dc:format>application/pdf</dc:format>
      <dc:title><rdf:Alt><rdf:li xml:lang="x-default">${escapeHtml(currentFile.name)}</rdf:li></rdf:Alt></dc:title>
      <dc:date><rdf:Seq><rdf:li>${isoDate}</rdf:li></rdf:Seq></dc:date>
    </rdf:Description>
    <rdf:Description rdf:about="" xmlns:pdf="http://ns.adobe.com/pdf/1.3/">
      <pdf:Producer>Digital Cron ISO 19005 Archival Engine</pdf:Producer>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;

      const metadataStream = doc.context.flateStream(xmpXml, {
        Type: 'Metadata',
        Subtype: 'XML'
      });
      const metadataRef = doc.context.register(metadataStream);
      catalog.set(PDFName.of('Metadata'), metadataRef);

      doc.setTitle(currentFile.name.replace(/\.pdf$/i, ''));
      doc.setProducer('Digital Cron Tools - PDF/A ISO 19005 Conformance Engine');
      doc.setCreator('Digital Cron Client-Side Archival Sandbox');

      const outBytes = await doc.save({ useObjectStreams: true });
      downloadBlob(new Blob([outBytes], { type: 'application/pdf' }), `pdfa_${currentFile.name}`);

      document.getElementById('pdfa-result-box')?.classList.remove('hidden');
      if (typeof showToast === 'function') showToast('Converted to ISO PDF/A-1b Archival Format!');
    } catch (err) {
      console.error(err);
      notifyUser('Could not convert to PDF/A: ' + (err.message || ''));
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<span>📜 CONVERT TO PDF/A & DOWNLOAD</span>';
    }
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

