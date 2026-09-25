/**
 * Digital Cron Tools - Image Tools Client-Side Engine
 * 100% Private, Canvas & FileReader driven image processing.
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
  // Utility: Format File Size
  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  // Utility: Setup Drag & Drop Zone
  function setupDropZone(dropZoneId, fileInputId, onFileLoaded) {
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
        handleFile(e.dataTransfer.files[0]);
      }
    });
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleFile(e.target.files[0]);
      }
    });

    function handleFile(file) {
      if (!file.type.startsWith('image/')) {
        notifyUser('Please select a valid image file (JPG, PNG, WebP, GIF, etc.).');
        return;
      }
      const reader = new FileReader();
      reader.onload = (evt) => {
        const img = new Image();
        img.onload = () => onFileLoaded(img, file);
        img.src = evt.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // 1. IMAGE RESIZER
  const resizerInput = document.getElementById('resizer-file-input');
  if (resizerInput) {
    let originalImg = null;
    let originalFile = null;

    setupDropZone('resizer-drop-zone', 'resizer-file-input', (img, file) => {
      originalImg = img;
      originalFile = file;

      document.getElementById('resizer-controls').classList.remove('hidden');
      document.getElementById('resizer-width').value = img.width;
      document.getElementById('resizer-height').value = img.height;
      document.getElementById('resizer-orig-info').textContent = `${img.width} × ${img.height} px (${formatBytes(file.size)})`;

      updateResizerPreview();
    });

    const widthInput = document.getElementById('resizer-width');
    const heightInput = document.getElementById('resizer-height');
    const lockRatio = document.getElementById('resizer-lock-ratio');
    const presetSelect = document.getElementById('resizer-presets');

    if (widthInput && heightInput) {
      widthInput.addEventListener('input', () => {
        if (!originalImg) return;
        if (lockRatio && lockRatio.checked) {
          const ratio = originalImg.height / originalImg.width;
          heightInput.value = Math.round(widthInput.value * ratio);
        }
        updateResizerPreview();
      });

      heightInput.addEventListener('input', () => {
        if (!originalImg) return;
        if (lockRatio && lockRatio.checked) {
          const ratio = originalImg.width / originalImg.height;
          widthInput.value = Math.round(heightInput.value * ratio);
        }
        updateResizerPreview();
      });
    }

    if (presetSelect) {
      presetSelect.addEventListener('change', (e) => {
        if (!originalImg || !e.target.value) return;
        const [w, h] = e.target.value.split('x').map(Number);
        if (w && h) {
          widthInput.value = w;
          heightInput.value = h;
          updateResizerPreview();
        }
      });
    }

    function updateResizerPreview() {
      if (!originalImg) return;
      const targetW = parseInt(widthInput.value) || originalImg.width;
      const targetH = parseInt(heightInput.value) || originalImg.height;

      const previewCanvas = document.getElementById('resizer-preview-canvas');
      if (previewCanvas) {
        previewCanvas.width = targetW;
        previewCanvas.height = targetH;
        const pCtx = previewCanvas.getContext('2d');
        pCtx.drawImage(originalImg, 0, 0, targetW, targetH);
      }

      document.getElementById('resizer-new-info').textContent = `${targetW} × ${targetH} px`;
    }

    const downloadBtn = document.getElementById('resizer-download-btn');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        if (!originalImg) return;
        const targetW = parseInt(widthInput.value) || originalImg.width;
        const targetH = parseInt(heightInput.value) || originalImg.height;

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(originalImg, 0, 0, targetW, targetH);

        const mime = originalFile.type || 'image/png';
        const ext = mime.split('/')[1] || 'png';
        const a = document.createElement('a');
        a.href = canvas.toDataURL(mime, 0.92);
        a.download = `resized-${targetW}x${targetH}.${ext}`;
        a.click();
      });
    }
  }

  // 2. IMAGE CROPPER
  const cropperInput = document.getElementById('cropper-file-input');
  if (cropperInput) {
    let cropImg = null;
    let cropFile = null;

    setupDropZone('cropper-drop-zone', 'cropper-file-input', (img, file) => {
      cropImg = img;
      cropFile = file;
      document.getElementById('cropper-controls').classList.remove('hidden');
      renderCropper();
    });

    const aspectSelect = document.getElementById('cropper-aspect-ratio');
    if (aspectSelect) {
      aspectSelect.addEventListener('change', () => renderCropper());
    }

    function renderCropper() {
      if (!cropImg) return;
      const canvas = document.getElementById('cropper-preview-canvas');
      if (!canvas) return;
      
      const aspectVal = aspectSelect ? aspectSelect.value : 'free';
      let cropW = cropImg.width;
      let cropH = cropImg.height;
      let cropX = 0;
      let cropY = 0;

      if (aspectVal !== 'free') {
        const [rw, rh] = aspectVal.split(':').map(Number);
        const targetRatio = rw / rh;
        const currentRatio = cropImg.width / cropImg.height;

        if (currentRatio > targetRatio) {
          cropW = cropImg.height * targetRatio;
          cropX = (cropImg.width - cropW) / 2;
        } else {
          cropH = cropImg.width / targetRatio;
          cropY = (cropImg.height - cropH) / 2;
        }
      }

      canvas.width = cropW;
      canvas.height = cropH;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(cropImg, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

      document.getElementById('cropper-info').textContent = `${Math.round(cropW)} × ${Math.round(cropH)} px`;
    }

    const cropDownloadBtn = document.getElementById('cropper-download-btn');
    if (cropDownloadBtn) {
      cropDownloadBtn.addEventListener('click', () => {
        const canvas = document.getElementById('cropper-preview-canvas');
        if (!canvas) return;
        const a = document.createElement('a');
        a.href = canvas.toDataURL(cropFile?.type || 'image/png', 0.95);
        a.download = `cropped-image.png`;
        a.click();
      });
    }
  }

  // 3-8. IMAGE FORMAT CONVERTERS (JPG, PNG, WEBP)
  const converterInput = document.getElementById('converter-file-input');
  if (converterInput) {
    let sourceImg = null;
    let sourceFile = null;
    const targetFormat = converterInput.getAttribute('data-target-format') || 'png';
    const targetMime = targetFormat === 'jpg' ? 'image/jpeg' : (targetFormat === 'webp' ? 'image/webp' : 'image/png');

    setupDropZone('converter-drop-zone', 'converter-file-input', (img, file) => {
      sourceImg = img;
      sourceFile = file;

      document.getElementById('converter-controls').classList.remove('hidden');
      document.getElementById('converter-orig-info').textContent = `${file.name} (${formatBytes(file.size)})`;

      // Render Canvas Preview
      const canvas = document.getElementById('converter-preview-canvas');
      if (canvas) {
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (targetFormat === 'jpg') {
          const bgBg = document.getElementById('converter-bg-color')?.value || '#ffffff';
          ctx.fillStyle = bgBg;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            document.getElementById('converter-new-info').textContent = `${formatBytes(blob.size)}`;
          }
        }, targetMime, 0.92);
      }
    });

    const downloadConvertedBtn = document.getElementById('converter-download-btn');
    if (downloadConvertedBtn) {
      downloadConvertedBtn.addEventListener('click', () => {
        if (!sourceImg) return;
        const canvas = document.createElement('canvas');
        canvas.width = sourceImg.width;
        canvas.height = sourceImg.height;
        const ctx = canvas.getContext('2d');
        if (targetFormat === 'jpg') {
          const bgBg = document.getElementById('converter-bg-color')?.value || '#ffffff';
          ctx.fillStyle = bgBg;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(sourceImg, 0, 0);

        const a = document.createElement('a');
        const baseName = sourceFile.name.substring(0, sourceFile.name.lastIndexOf('.')) || 'converted';
        a.href = canvas.toDataURL(targetMime, 0.92);
        a.download = `${baseName}.${targetFormat}`;
        a.click();
      });
    }
  }

  // 9. IMAGE QUALITY ADJUSTER
  const qualityInput = document.getElementById('quality-file-input');
  if (qualityInput) {
    let qImg = null;
    let qFile = null;

    setupDropZone('quality-drop-zone', 'quality-file-input', (img, file) => {
      qImg = img;
      qFile = file;

      document.getElementById('quality-controls').classList.remove('hidden');
      document.getElementById('quality-orig-size').textContent = formatBytes(file.size);
      updateQualityOutput();
    });

    const qSlider = document.getElementById('quality-slider');
    const qValueDisplay = document.getElementById('quality-val-display');

    if (qSlider) {
      qSlider.addEventListener('input', () => {
        if (qValueDisplay) qValueDisplay.textContent = `${qSlider.value}%`;
        updateQualityOutput();
      });
    }

    function updateQualityOutput() {
      if (!qImg) return;
      const canvas = document.createElement('canvas');
      canvas.width = qImg.width;
      canvas.height = qImg.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(qImg, 0, 0);

      // Render visible preview canvas
      const previewCanvas = document.getElementById('quality-preview-canvas');
      if (previewCanvas) {
        previewCanvas.width = qImg.width;
        previewCanvas.height = qImg.height;
        const pCtx = previewCanvas.getContext('2d');
        pCtx.drawImage(qImg, 0, 0);
      }

      const quality = (parseInt(qSlider.value) || 80) / 100;
      canvas.toBlob((blob) => {
        if (blob) {
          document.getElementById('quality-new-size').textContent = formatBytes(blob.size);
          const savedPct = Math.max(0, Math.round((1 - blob.size / qFile.size) * 100));
          document.getElementById('quality-saved-pct').textContent = `${savedPct}% Saved`;
        }
      }, 'image/jpeg', quality);
    }

    const qDownloadBtn = document.getElementById('quality-download-btn');
    if (qDownloadBtn) {
      qDownloadBtn.addEventListener('click', () => {
        if (!qImg) return;
        const canvas = document.createElement('canvas');
        canvas.width = qImg.width;
        canvas.height = qImg.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(qImg, 0, 0);

        const quality = (parseInt(qSlider.value) || 80) / 100;
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/jpeg', quality);
        a.download = `adjusted-quality-${qSlider.value}pct.jpg`;
        a.click();
      });
    }
  }

  // 10. IMAGE BORDER GENERATOR
  const borderInput = document.getElementById('border-file-input');
  if (borderInput) {
    let bImg = null;
    let bFile = null;

    setupDropZone('border-drop-zone', 'border-file-input', (img, file) => {
      bImg = img;
      bFile = file;
      document.getElementById('border-controls').classList.remove('hidden');
      updateBorderCanvas();
    });

    ['border-color', 'border-width', 'border-padding', 'border-radius'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', () => updateBorderCanvas());
    });

    function updateBorderCanvas() {
      if (!bImg) return;
      const color = document.getElementById('border-color')?.value || '#6366F1';
      const width = parseInt(document.getElementById('border-width')?.value || 20);
      const padding = parseInt(document.getElementById('border-padding')?.value || 10);
      const radius = parseInt(document.getElementById('border-radius')?.value || 0);

      const canvas = document.getElementById('border-preview-canvas');
      if (!canvas) return;

      const totalW = bImg.width + (width + padding) * 2;
      const totalH = bImg.height + (width + padding) * 2;
      canvas.width = totalW;
      canvas.height = totalH;
      const ctx = canvas.getContext('2d');

      // Draw border frame
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, totalW, totalH);

      // Draw padded inner area
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(width, width, totalW - width * 2, totalH - width * 2);

      // Draw original image inside
      const imgX = width + padding;
      const imgY = width + padding;
      
      if (radius > 0) {
        ctx.save();
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(imgX, imgY, bImg.width, bImg.height, radius);
        } else {
          ctx.rect(imgX, imgY, bImg.width, bImg.height);
        }
        ctx.clip();
        ctx.drawImage(bImg, imgX, imgY);
        ctx.restore();
      } else {
        ctx.drawImage(bImg, imgX, imgY);
      }
    }

    const bDownloadBtn = document.getElementById('border-download-btn');
    if (bDownloadBtn) {
      bDownloadBtn.addEventListener('click', () => {
        const canvas = document.getElementById('border-preview-canvas');
        if (!canvas) return;
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = 'image-with-border.png';
        a.click();
      });
    }
  }

  // 11. IMAGE ASPECT RATIO CHECKER
  const ratioInput = document.getElementById('ratio-file-input');
  if (ratioInput) {
    setupDropZone('ratio-drop-zone', 'ratio-file-input', (img, file) => {
      document.getElementById('ratio-controls').classList.remove('hidden');

      function gcd(a, b) {
        return b === 0 ? a : gcd(b, a % b);
      }

      const divisor = gcd(img.width, img.height);
      const aspectW = img.width / divisor;
      const aspectH = img.height / divisor;
      const decimalRatio = (img.width / img.height).toFixed(2);
      const megapixels = ((img.width * img.height) / 1000000).toFixed(2);

      let standardTag = 'Custom Ratio';
      if (Math.abs(decimalRatio - 1.78) < 0.05) standardTag = '16:9 (Widescreen / Full HD)';
      else if (Math.abs(decimalRatio - 1.33) < 0.05) standardTag = '4:3 (Standard Photo / Tablet)';
      else if (Math.abs(decimalRatio - 1.0) < 0.05) standardTag = '1:1 (Square / Instagram Post)';
      else if (Math.abs(decimalRatio - 0.56) < 0.05) standardTag = '9:16 (Vertical Story / Reels)';
      else if (Math.abs(decimalRatio - 1.5) < 0.05) standardTag = '3:2 (DSLR Standard)';

      document.getElementById('ratio-resolution').textContent = `${img.width} × ${img.height} px`;
      document.getElementById('ratio-simplified').textContent = `${aspectW}:${aspectH} (${decimalRatio}:1)`;
      document.getElementById('ratio-megapixels').textContent = `${megapixels} MP`;
      document.getElementById('ratio-standard-name').textContent = standardTag;

      const previewCanvas = document.getElementById('ratio-preview-canvas');
      if (previewCanvas) {
        previewCanvas.width = img.width;
        previewCanvas.height = img.height;
        const ctx = previewCanvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
      }
    });
  }

  // 12. IMAGE WATERMARK ADDER
  const watermarkInput = document.getElementById('watermark-file-input');
  if (watermarkInput) {
    let wImg = null;

    setupDropZone('watermark-drop-zone', 'watermark-file-input', (img, file) => {
      wImg = img;
      document.getElementById('watermark-controls').classList.remove('hidden');
      updateWatermarkCanvas();
    });

    ['watermark-text', 'watermark-position', 'watermark-size', 'watermark-opacity', 'watermark-color'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', () => updateWatermarkCanvas());
    });

    function updateWatermarkCanvas() {
      if (!wImg) return;
      const text = document.getElementById('watermark-text')?.value || 'Digital Cron Watermark';
      const pos = document.getElementById('watermark-position')?.value || 'center';
      const fontSize = parseInt(document.getElementById('watermark-size')?.value || 32);
      const opacity = parseFloat(document.getElementById('watermark-opacity')?.value || 0.5);
      const color = document.getElementById('watermark-color')?.value || '#ffffff';

      const canvas = document.getElementById('watermark-preview-canvas');
      if (!canvas) return;

      canvas.width = wImg.width;
      canvas.height = wImg.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(wImg, 0, 0);

      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.fillStyle = color;
      ctx.textBaseline = 'middle';

      const textMetrics = ctx.measureText(text);
      const textW = textMetrics.width;

      let x = canvas.width / 2 - textW / 2;
      let y = canvas.height / 2;

      if (pos.includes('top')) y = fontSize + 20;
      if (pos.includes('bottom')) y = canvas.height - fontSize - 20;
      if (pos.includes('left')) x = 30;
      if (pos.includes('right')) x = canvas.width - textW - 30;

      ctx.fillText(text, x, y);
      ctx.restore();
    }

    const wDownloadBtn = document.getElementById('watermark-download-btn');
    if (wDownloadBtn) {
      wDownloadBtn.addEventListener('click', () => {
        const canvas = document.getElementById('watermark-preview-canvas');
        if (!canvas) return;
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = 'watermarked-image.png';
        a.click();
      });
    }
  }

  // 13. IMAGE SPLITTER
  const splitterInput = document.getElementById('splitter-file-input');
  if (splitterInput) {
    let sImg = null;

    setupDropZone('splitter-drop-zone', 'splitter-file-input', (img, file) => {
      sImg = img;
      document.getElementById('splitter-controls').classList.remove('hidden');
      updateSplitter();
    });

    ['splitter-rows', 'splitter-cols'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', () => updateSplitter());
    });

    function updateSplitter() {
      if (!sImg) return;
      const rows = parseInt(document.getElementById('splitter-rows')?.value || 2);
      const cols = parseInt(document.getElementById('splitter-cols')?.value || 2);
      const gridContainer = document.getElementById('splitter-grid-preview');
      if (!gridContainer) return;

      gridContainer.innerHTML = '';
      gridContainer.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;

      const sliceW = sImg.width / cols;
      const sliceH = sImg.height / rows;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const sliceCanvas = document.createElement('canvas');
          sliceCanvas.width = sliceW;
          sliceCanvas.height = sliceH;
          const sCtx = sliceCanvas.getContext('2d');
          sCtx.drawImage(sImg, c * sliceW, r * sliceH, sliceW, sliceH, 0, 0, sliceW, sliceH);

          const wrapper = document.createElement('div');
          wrapper.className = 'p-2 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-2';
          
          const imgEl = document.createElement('img');
          imgEl.src = sliceCanvas.toDataURL('image/png');
          imgEl.className = 'w-full rounded-lg border border-slate-700';

          const dlBtn = document.createElement('button');
          dlBtn.className = 'w-full py-1.5 text-xs font-bold text-white bg-[#6366F1] rounded-lg hover:bg-indigo-600';
          dlBtn.textContent = `Download Part ${r * cols + c + 1}`;
          dlBtn.onclick = () => {
            const a = document.createElement('a');
            a.href = sliceCanvas.toDataURL('image/png');
            a.download = `slice-r${r+1}-c${c+1}.png`;
            a.click();
          };

          wrapper.appendChild(imgEl);
          wrapper.appendChild(dlBtn);
          gridContainer.appendChild(wrapper);
        }
      }
    }
  }

  // 14. IMAGE MERGER
  const mergerInput = document.getElementById('merger-file-input');
  if (mergerInput) {
    let mergedImages = [];

    mergerInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      if (!files.length) return;

      mergedImages = [];
      let loaded = 0;

      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const img = new Image();
          img.onload = () => {
            mergedImages.push(img);
            loaded++;
            if (loaded === files.length) {
              document.getElementById('merger-controls').classList.remove('hidden');
              renderMerger();
            }
          };
          img.src = evt.target.result;
        };
        reader.readAsDataURL(file);
      });
    });

    const directionSelect = document.getElementById('merger-direction');
    if (directionSelect) {
      directionSelect.addEventListener('change', () => renderMerger());
    }

    function renderMerger() {
      if (!mergedImages.length) return;
      const isHorizontal = (directionSelect?.value || 'horizontal') === 'horizontal';
      
      let totalW = 0;
      let totalH = 0;

      if (isHorizontal) {
        totalW = mergedImages.reduce((sum, img) => sum + img.width, 0);
        totalH = Math.max(...mergedImages.map(img => img.height));
      } else {
        totalW = Math.max(...mergedImages.map(img => img.width));
        totalH = mergedImages.reduce((sum, img) => sum + img.height, 0);
      }

      const canvas = document.getElementById('merger-preview-canvas');
      if (!canvas) return;
      canvas.width = totalW;
      canvas.height = totalH;
      const ctx = canvas.getContext('2d');

      let currentX = 0;
      let currentY = 0;

      mergedImages.forEach(img => {
        ctx.drawImage(img, currentX, currentY);
        if (isHorizontal) currentX += img.width;
        else currentY += img.height;
      });

      document.getElementById('merger-info').textContent = `${totalW} × ${totalH} px (${mergedImages.length} images combined)`;
    }

    const mDownloadBtn = document.getElementById('merger-download-btn');
    if (mDownloadBtn) {
      mDownloadBtn.addEventListener('click', () => {
        const canvas = document.getElementById('merger-preview-canvas');
        if (!canvas) return;
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = 'merged-image.png';
        a.click();
      });
    }
  }

  // 15. IMAGE COLOR PALETTE EXTRACTOR
  const paletteInput = document.getElementById('palette-file-input');
  if (paletteInput) {
    setupDropZone('palette-drop-zone', 'palette-file-input', (img, file) => {
      document.getElementById('palette-controls').classList.remove('hidden');

      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, 100, 100);

      const imageData = ctx.getImageData(0, 0, 100, 100).data;
      const colorCounts = {};

      for (let i = 0; i < imageData.length; i += 16) {
        const r = Math.round(imageData[i] / 32) * 32;
        const g = Math.round(imageData[i+1] / 32) * 32;
        const b = Math.round(imageData[i+2] / 32) * 32;
        const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
        colorCounts[hex] = (colorCounts[hex] || 0) + 1;
      }

      const sortedColors = Object.keys(colorCounts)
        .sort((a, b) => colorCounts[b] - colorCounts[a])
        .slice(0, 6);

      const container = document.getElementById('palette-swatches');
      if (container) {
        container.innerHTML = '';
        sortedColors.forEach(hex => {
          const card = document.createElement('div');
          card.className = 'p-4 rounded-2xl border border-slate-800 bg-slate-900 text-center space-y-3 cursor-pointer hover:border-[#6366F1] transition-all';
          
          const swatch = document.createElement('div');
          swatch.className = 'w-full h-16 rounded-xl shadow-md';
          swatch.style.backgroundColor = hex;

          const label = document.createElement('div');
          label.className = 'font-mono text-sm font-extrabold text-white';
          label.textContent = hex.toUpperCase();

          const copyHint = document.createElement('div');
          copyHint.className = 'text-[10px] text-slate-400 font-mono';
          copyHint.textContent = 'Click to Copy';

          card.onclick = () => {
            safeCopy(hex.toUpperCase(), 'Color hex code copied to clipboard!');
            copyHint.textContent = '✓ Copied!';
            setTimeout(() => copyHint.textContent = 'Click to Copy', 2000);
          };

          card.appendChild(swatch);
          card.appendChild(label);
          card.appendChild(copyHint);
          container.appendChild(card);
        });
      }

      const previewCanvas = document.getElementById('palette-preview-canvas');
      if (previewCanvas) {
        previewCanvas.width = img.width;
        previewCanvas.height = img.height;
        const pCtx = previewCanvas.getContext('2d');
        pCtx.drawImage(img, 0, 0);
      }
    });
  }
});
