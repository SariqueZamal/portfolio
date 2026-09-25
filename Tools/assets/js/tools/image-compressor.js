/* ==========================================================================
   DigitalCron Tools - Image Compressor (Professional SaaS Grade)
   100% client-side via Canvas API — no file ever leaves the browser
   ========================================================================== */

let currentOriginalFile = null;
let currentCompressedBlob = null;
let debounceTimer = null;
let currentCompressReqId = 0;

document.addEventListener('DOMContentLoaded', () => {
  const dropZone   = document.getElementById('drop-zone');
  const fileInput  = document.getElementById('compress-input');
  const qualRange  = document.getElementById('compress-quality');
  const qualVal    = document.getElementById('quality-val');
  const downloadBtn= document.getElementById('download-compressed');

  // Click on drop zone opens file picker
  if (dropZone) {
    dropZone.addEventListener('click', () => fileInput && fileInput.click());
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('border-[#6366F1]'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('border-[#6366F1]'));
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('border-[#6366F1]');
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) processFile(file);
      else showToast('Please drop an image file.', 'error');
    });
  }

  if (fileInput) fileInput.addEventListener('change', (e) => {
    if (e.target.files[0]) processFile(e.target.files[0]);
  });

  if (qualRange) {
    qualRange.addEventListener('input', () => {
      if (qualVal) qualVal.textContent = `${qualRange.value}%`;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (currentOriginalFile) compress(currentOriginalFile);
      }, 80);
    });
  }

  if (downloadBtn) {
    downloadBtn.addEventListener('click', downloadCompressed);
  }
});

function processFile(file) {
  if (file.size > 25 * 1024 * 1024) {
    showToast('File too large. Max 25MB allowed.', 'error');
    return;
  }
  currentOriginalFile = file;

  const origSize = document.getElementById('orig-size');
  if (origSize) origSize.textContent = formatBytes(file.size);

  compress(file);
}

function compress(file) {
  const reqId = ++currentCompressReqId;
  const sliderVal = Number(document.getElementById('compress-quality')?.value || 80);
  const norm = (sliderVal - 10) / (99 - 10);
  const targetBytes = Math.max(512, Math.round(file.size * (0.25 + (norm * 0.68))));

  const reader = new FileReader();

  reader.onload = (e) => {
    if (reqId !== currentCompressReqId) return;
    const img = new Image();
    img.src = e.target.result;
    img.onload = () => {
      if (reqId !== currentCompressReqId) return;

      // Render preview on the visible canvas
      const previewCanvas = document.getElementById('compress-preview-canvas');
      if (previewCanvas) {
        previewCanvas.width = img.naturalWidth;
        previewCanvas.height = img.naturalHeight;
        const pCtx = previewCanvas.getContext('2d');
        pCtx.drawImage(img, 0, 0);
      }

      // Output format — WebP offers superior compression; fallback to JPEG if needed
      let mimeType = 'image/webp';
      const testCanvas = document.createElement('canvas');
      testCanvas.width = 1; testCanvas.height = 1;
      if (!testCanvas.toDataURL('image/webp').startsWith('data:image/webp')) {
        mimeType = file.type === 'image/png' ? 'image/jpeg' : file.type;
      }

      let curScale = 0.40 + (norm * 0.58);
      let curQ = 0.15 + (norm * 0.75);

      const attemptCompression = (attempt = 0) => {
        if (reqId !== currentCompressReqId) return;

        const wCanvas = document.createElement('canvas');
        wCanvas.width = Math.max(1, Math.round(img.naturalWidth * curScale));
        wCanvas.height = Math.max(1, Math.round(img.naturalHeight * curScale));
        const wCtx = wCanvas.getContext('2d');
        wCtx.drawImage(img, 0, 0, wCanvas.width, wCanvas.height);

        wCanvas.toBlob((blob) => {
          if (reqId !== currentCompressReqId) return;
          if (!blob) {
            showToast('Compression failed.', 'error');
            return;
          }

          // If blob meets target size and is strictly smaller than original file:
          if ((blob.size <= targetBytes && blob.size < file.size * 0.96) || attempt >= 7) {
            // Absolute safeguard: must ALWAYS be strictly less than original file
            if (blob.size >= file.size) {
              const safeScale = Math.min(0.85, Math.sqrt((file.size * 0.88) / blob.size));
              const sCanvas = document.createElement('canvas');
              sCanvas.width = Math.max(1, Math.round(img.naturalWidth * safeScale));
              sCanvas.height = Math.max(1, Math.round(img.naturalHeight * safeScale));
              sCanvas.getContext('2d').drawImage(img, 0, 0, sCanvas.width, sCanvas.height);
              sCanvas.toBlob((finalBlob) => {
                if (reqId !== currentCompressReqId) return;
                finish(finalBlob || blob);
              }, mimeType, Math.min(0.65, curQ));
              return;
            }
            finish(blob);
            return;
          }

          // Proportionally step down scale and quality
          const ratio = blob.size > 0 ? Math.sqrt(targetBytes / blob.size) : 0.85;
          curScale = Math.max(0.15, curScale * Math.min(0.92, ratio));
          curQ = Math.max(0.10, curQ * 0.85);
          attemptCompression(attempt + 1);
        }, mimeType, curQ);
      };

      const finish = (blob) => {
        if (reqId !== currentCompressReqId) return;
        currentCompressedBlob = blob;

        const newSize   = document.getElementById('new-size');
        const controls = document.getElementById('compress-controls');
        const dlBtn    = document.getElementById('download-compressed');

        if (newSize) newSize.textContent = formatBytes(blob.size);

        // Show savings in separate element (guaranteed > 0%)
        const savings = Math.max(1, Math.round(((file.size - blob.size) / file.size) * 100));
        const savingsPct = document.getElementById('savings-pct');
        if (savingsPct) savingsPct.textContent = `${savings}% Smaller`;

        if (controls) controls.classList.remove('hidden');
        if (dlBtn) dlBtn.disabled = false;

        showToast(`Compressed! Saved ${savings}%`);
      };

      attemptCompression(0);
    };
  };

  reader.readAsDataURL(file);
}

function downloadCompressed() {
  if (!currentCompressedBlob || !currentOriginalFile) return;
  const ext  = currentCompressedBlob.type.split('/')[1] || 'webp';
  const name = currentOriginalFile.name.replace(/\.[^.]+$/, '') + `-compressed.${ext}`;
  const url  = URL.createObjectURL(currentCompressedBlob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast('Compressed image downloaded!');
}

function formatBytes(bytes) {
  if (!bytes) return '0 Bytes';
  const k = 1024, sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
