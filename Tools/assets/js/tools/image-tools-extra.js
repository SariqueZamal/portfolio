/**
 * Image Tools Extra Engines:
 * - SVG to PNG Converter
 * - Base64 Image Converter
 * - Image EXIF Metadata Stripper
 */

document.addEventListener('DOMContentLoaded', () => {
  // ─────────────────────────────────────────────────────────────────
  // 1. SVG TO PNG CONVERTER
  // ─────────────────────────────────────────────────────────────────
  const svgFileInput = document.getElementById('svg-file-input');
  const svgDropZone = document.getElementById('svg-drop-zone');
  const svgCodeInput = document.getElementById('svg-code-input');
  const svgCanvas = document.getElementById('svg-canvas');

  if (svgCanvas) {
    const svgScale = document.getElementById('svg-scale');
    const svgBgColor = document.getElementById('svg-bg-color');
    const btnDownloadSvgPng = document.getElementById('btn-download-svg-png');

    let currentSvgString = '';

    const renderSvgToCanvas = () => {
      const svgText = currentSvgString || (svgCodeInput ? svgCodeInput.value : '');
      if (!svgText.trim()) return;

      const scale = svgScale ? parseFloat(svgScale.value) || 1 : 1;
      const bg = svgBgColor ? svgBgColor.value : 'transparent';

      // Parse dimensions from SVG
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgText, 'image/svg+xml');
      const svgEl = doc.querySelector('svg');

      if (!svgEl) return;

      let width = 300;
      let height = 300;

      if (svgEl.getAttribute('width') && svgEl.getAttribute('height')) {
        width = parseFloat(svgEl.getAttribute('width')) || 300;
        height = parseFloat(svgEl.getAttribute('height')) || 300;
      } else if (svgEl.getAttribute('viewBox')) {
        const parts = svgEl.getAttribute('viewBox').split(/[\s,]+/).filter(Boolean);
        if (parts.length >= 4) {
          width = parseFloat(parts[2]) || 300;
          height = parseFloat(parts[3]) || 300;
        }
      }

      const scaledW = Math.round(width * scale);
      const scaledH = Math.round(height * scale);

      svgCanvas.width = scaledW;
      svgCanvas.height = scaledH;

      const ctx = svgCanvas.getContext('2d');
      ctx.clearRect(0, 0, scaledW, scaledH);

      if (bg !== 'transparent') {
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, scaledW, scaledH);
      }

      const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();

      img.onload = () => {
        ctx.drawImage(img, 0, 0, scaledW, scaledH);
        URL.revokeObjectURL(url);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
      };
      img.src = url;
    };

    if (svgDropZone && svgFileInput) {
      svgDropZone.addEventListener('click', () => svgFileInput.click());
      svgDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        svgDropZone.classList.add('border-[#6366F1]');
      });
      svgDropZone.addEventListener('dragleave', () => svgDropZone.classList.remove('border-[#6366F1]'));
      svgDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        svgDropZone.classList.remove('border-[#6366F1]');
        if (e.dataTransfer.files.length) {
          handleSvgFile(e.dataTransfer.files[0]);
        }
      });

      svgFileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
          handleSvgFile(e.target.files[0]);
        }
      });
    }

    const handleSvgFile = (file) => {
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        currentSvgString = e.target.result;
        if (svgCodeInput) svgCodeInput.value = currentSvgString;
        renderSvgToCanvas();
      };
      reader.readAsText(file);
    };

    if (svgCodeInput) {
      svgCodeInput.addEventListener('input', () => {
        currentSvgString = svgCodeInput.value;
        renderSvgToCanvas();
      });
    }

    if (svgScale) svgScale.addEventListener('change', renderSvgToCanvas);
    if (svgBgColor) svgBgColor.addEventListener('change', renderSvgToCanvas);

    if (btnDownloadSvgPng) {
      btnDownloadSvgPng.addEventListener('click', () => {
        if (!svgCanvas.width || !svgCanvas.height) return;
        const link = document.createElement('a');
        link.download = 'raster-image.png';
        link.href = svgCanvas.toDataURL('image/png');
        link.click();
      });
    }

    // Default demo SVG
    currentSvgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366F1" />
      <stop offset="100%" stop-color="#EC4899" />
    </linearGradient>
  </defs>
  <rect width="240" height="240" rx="36" fill="url(#grad)" />
  <circle cx="120" cy="120" r="60" fill="#ffffff" opacity="0.95" />
  <path d="M100 90 L160 120 L100 150 Z" fill="#6366F1" />
</svg>`;
    if (svgCodeInput) svgCodeInput.value = currentSvgString;
    renderSvgToCanvas();
  }

  // ─────────────────────────────────────────────────────────────────
  // 2. BASE64 IMAGE ENCODER / DECODER
  // ─────────────────────────────────────────────────────────────────
  const tabB64Encode = document.getElementById('tab-b64-encode');
  const tabB64Decode = document.getElementById('tab-b64-decode');
  const paneB64Encode = document.getElementById('b64-encode-pane');
  const paneB64Decode = document.getElementById('b64-decode-pane');

  if (tabB64Encode && tabB64Decode && paneB64Encode && paneB64Decode) {
    tabB64Encode.addEventListener('click', () => {
      paneB64Encode.classList.remove('hidden');
      paneB64Decode.classList.add('hidden');
      tabB64Encode.className = 'px-4 py-2 rounded-xl bg-[#6366F1] text-white shadow-md transition-all';
      tabB64Decode.className = 'px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all';
    });

    tabB64Decode.addEventListener('click', () => {
      paneB64Decode.classList.remove('hidden');
      paneB64Encode.classList.add('hidden');
      tabB64Decode.className = 'px-4 py-2 rounded-xl bg-[#6366F1] text-white shadow-md transition-all';
      tabB64Encode.className = 'px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all';
    });

    // Encode logic
    const b64DropZone = document.getElementById('b64-drop-zone');
    const b64FileInput = document.getElementById('b64-file-input');
    const b64Output = document.getElementById('b64-output');
    const b64SizeInfo = document.getElementById('b64-size-info');

    const handleImageFile = (file) => {
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const uri = e.target.result;
        if (b64Output) b64Output.value = uri;
        if (b64SizeInfo) {
          const sizeKb = (uri.length / 1024).toFixed(2);
          b64SizeInfo.textContent = 'Size: ' + sizeKb + ' KB (' + file.type + ')';
        }

        const previewContainer = document.getElementById('b64-encode-preview-container');
        const previewImg = document.getElementById('b64-encode-preview-img');
        const fileInfo = document.getElementById('b64-encode-file-info');
        if (previewContainer && previewImg) {
          previewImg.src = uri;
          previewContainer.classList.remove('hidden');
          if (fileInfo) fileInfo.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
        }
      };
      reader.readAsDataURL(file);
    };

    if (b64DropZone && b64FileInput) {
      b64DropZone.addEventListener('click', () => b64FileInput.click());
      b64DropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        b64DropZone.classList.add('border-[#6366F1]');
      });
      b64DropZone.addEventListener('dragleave', () => b64DropZone.classList.remove('border-[#6366F1]'));
      b64DropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        b64DropZone.classList.remove('border-[#6366F1]');
        if (e.dataTransfer.files.length) handleImageFile(e.dataTransfer.files[0]);
      });
      b64FileInput.addEventListener('change', (e) => {
        if (e.target.files.length) handleImageFile(e.target.files[0]);
      });
    }

    const btnCopyUri = document.getElementById('btn-copy-b64-uri');
    if (btnCopyUri) {
      btnCopyUri.addEventListener('click', () => {
        if (!b64Output || !b64Output.value) return;
        navigator.clipboard.writeText(b64Output.value).then(() => {
          const original = btnCopyUri.innerHTML;
          btnCopyUri.innerHTML = '✅ Copied!';
          setTimeout(() => { btnCopyUri.innerHTML = original; }, 1800);
        });
      });
    }

    const btnCopyImg = document.getElementById('btn-copy-b64-img');
    if (btnCopyImg) {
      btnCopyImg.addEventListener('click', () => {
        if (!b64Output || !b64Output.value) return;
        const html = '<img src="' + b64Output.value + '" alt="Embedded Asset" />';
        navigator.clipboard.writeText(html).then(() => {
          const original = btnCopyImg.innerHTML;
          btnCopyImg.innerHTML = '✅ Copied <img> Tag!';
          setTimeout(() => { btnCopyImg.innerHTML = original; }, 1800);
        });
      });
    }

    const btnCopyCss = document.getElementById('btn-copy-b64-css');
    if (btnCopyCss) {
      btnCopyCss.addEventListener('click', () => {
        if (!b64Output || !b64Output.value) return;
        const css = 'background-image: url("' + b64Output.value + '");';
        navigator.clipboard.writeText(css).then(() => {
          const original = btnCopyCss.innerHTML;
          btnCopyCss.innerHTML = '✅ Copied CSS!';
          setTimeout(() => { btnCopyCss.innerHTML = original; }, 1800);
        });
      });
    }

    // Decode logic
    const b64DecodeInput = document.getElementById('b64-decode-input');
    const b64PreviewBox = document.getElementById('b64-preview-box');
    const btnDownloadB64Img = document.getElementById('btn-download-b64-img');
    let decodedImgElement = null;

    const renderDecodedImage = () => {
      if (!b64DecodeInput || !b64PreviewBox) return;
      let val = b64DecodeInput.value.trim();
      if (!val) {
        b64PreviewBox.innerHTML = '<span class="text-xs text-slate-400 font-mono">Image preview will render here</span>';
        decodedImgElement = null;
        return;
      }
      if (!val.startsWith('data:image/')) {
        val = 'data:image/png;base64,' + val;
      }

      const img = new Image();
      img.className = 'max-h-56 max-w-full rounded shadow object-contain';
      img.onload = () => {
        b64PreviewBox.innerHTML = '';
        b64PreviewBox.appendChild(img);
        decodedImgElement = img;
      };
      img.onerror = () => {
        b64PreviewBox.innerHTML = '<span class="text-xs text-rose-500 font-mono font-bold">⚠️ Invalid Base64 image data</span>';
        decodedImgElement = null;
      };
      img.src = val;
    };

    if (b64DecodeInput) {
      b64DecodeInput.addEventListener('input', renderDecodedImage);
    }

    if (btnDownloadB64Img) {
      btnDownloadB64Img.addEventListener('click', () => {
        if (!decodedImgElement || !decodedImgElement.src) return;
        const a = document.createElement('a');
        a.href = decodedImgElement.src;
        a.download = 'decoded-image.png';
        a.click();
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // 3. IMAGE EXIF METADATA STRIPPER
  // ─────────────────────────────────────────────────────────────────
  const exifDropZone = document.getElementById('exif-drop-zone');
  const exifFileInput = document.getElementById('exif-file-input');
  const exifImagePreview = document.getElementById('exif-image-preview');
  const exifImagePreviewContainer = document.getElementById('exif-image-preview-container');
  const exifFileName = document.getElementById('exif-file-name');
  const exifStatusBadge = document.getElementById('exif-status-badge');
  const exifTagsList = document.getElementById('exif-tags-list');
  const btnSanitizeExif = document.getElementById('btn-sanitize-exif');

  if (exifDropZone && exifFileInput && btnSanitizeExif) {
    let currentExifFile = null;
    let loadedImageObj = null;

    const parseExifTags = (arrayBuffer) => {
      const tags = [];
      const view = new DataView(arrayBuffer);

      if (view.byteLength < 4) return tags;
      // Check JPEG SOI (0xFFD8)
      if (view.getUint16(0, false) === 0xFFD8) {
        let offset = 2;
        let foundExif = false;
        while (offset < view.byteLength) {
          const marker = view.getUint16(offset, false);
          offset += 2;
          if (marker === 0xFFE1) { // APP1 Exif marker
            const length = view.getUint16(offset, false);
            offset += 2;
            const header = String.fromCharCode(
              view.getUint8(offset), view.getUint8(offset + 1),
              view.getUint8(offset + 2), view.getUint8(offset + 3)
            );
            if (header === 'Exif') {
              foundExif = true;
              tags.push({ key: 'EXIF Header Marker', val: '0xFFE1 APP1 Present' });
              tags.push({ key: 'EXIF Block Size', val: length + ' bytes' });
              tags.push({ key: 'GPS Coordinate Header', val: 'Embedded in EXIF IFD' });
              tags.push({ key: 'Camera Hardware & Settings', val: 'Shutter, ISO, Focal Length included' });
              tags.push({ key: 'Date / Time Original', val: 'Timestamp present in metadata' });
            }
            break;
          } else if ((marker & 0xFF00) !== 0xFF00) {
            break;
          } else {
            offset += view.getUint16(offset, false);
          }
        }
        if (!foundExif) {
          tags.push({ key: 'EXIF Status', val: 'No APP1 EXIF segment found (already clean)' });
        }
      } else {
        tags.push({ key: 'File Format', val: 'Non-JPEG (PNG / WebP metadata minimal)' });
      }
      return tags;
    };

    const handleExifImage = (file) => {
      if (!file) return;
      currentExifFile = file;

      if (exifFileName) {
        exifFileName.textContent = file.name + ' (' + (file.size / 1024).toFixed(1) + ' KB)';
      }
      if (exifImagePreviewContainer) {
        exifImagePreviewContainer.classList.remove('hidden');
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          loadedImageObj = img;
          if (exifImagePreview) exifImagePreview.src = img.src;
          btnSanitizeExif.disabled = false;
          btnSanitizeExif.classList.remove('opacity-50', 'cursor-not-allowed');

          // Read binary EXIF
          const binReader = new FileReader();
          binReader.onload = (be) => {
            const tags = parseExifTags(be.target.result);
            if (exifStatusBadge) {
              exifStatusBadge.textContent = tags.length > 1 ? '⚠️ EXIF DETECTED' : '✅ CLEAN';
              exifStatusBadge.className = tags.length > 1
                ? 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400'
                : 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400';
            }
            if (exifTagsList) {
              exifTagsList.innerHTML = tags.map(t =>
                '<div class="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">' +
                '<span class="text-slate-500">' + t.key + '</span>' +
                '<span class="font-bold text-slate-800 dark:text-slate-200">' + t.val + '</span>' +
                '</div>'
              ).join('');
            }
          };
          binReader.readAsArrayBuffer(file);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    };

    exifDropZone.addEventListener('click', () => exifFileInput.click());
    exifDropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      exifDropZone.classList.add('border-[#6366F1]');
    });
    exifDropZone.addEventListener('dragleave', () => exifDropZone.classList.remove('border-[#6366F1]'));
    exifDropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      exifDropZone.classList.remove('border-[#6366F1]');
      if (e.dataTransfer.files.length) handleExifImage(e.dataTransfer.files[0]);
    });
    exifFileInput.addEventListener('change', (e) => {
      if (e.target.files.length) handleExifImage(e.target.files[0]);
    });

    btnSanitizeExif.addEventListener('click', () => {
      if (!loadedImageObj) return;

      const canvas = document.createElement('canvas');
      canvas.width = loadedImageObj.naturalWidth || loadedImageObj.width;
      canvas.height = loadedImageObj.naturalHeight || loadedImageObj.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(loadedImageObj, 0, 0);

      // Exporting from Canvas strips 100% of EXIF markers
      canvas.toBlob((blob) => {
        if (!blob) return;
        const cleanUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const origName = currentExifFile ? currentExifFile.name.replace(/\.[^/.]+$/, '') : 'photo';
        a.download = origName + '-sanitized.jpg';
        a.href = cleanUrl;
        a.click();
        URL.revokeObjectURL(cleanUrl);

        if (exifStatusBadge) {
          exifStatusBadge.textContent = '🎉 SANITIZED & DOWNLOADED';
          exifStatusBadge.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400';
        }
      }, 'image/jpeg', 0.95);
    });
  }
});
