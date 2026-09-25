/* ==========================================================================
   DigitalCron Tools Platform - Global JavaScript (assets/js/main.js)
   Theme Toggle, Active Nav Highlight, Mobile Navigation & Search (⌘K)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  renderBottomLeftThemeToggle();
  initMobileMenu();
  initSearchModal();
  initToastContainer();
  highlightActiveNavLink();
});

/* Dynamic Nav Active Highlight Engine */
function highlightActiveNavLink() {
  const currentPath = window.location.pathname.toLowerCase();
  const desktopLinks = document.querySelectorAll('header nav a');
  const mobileLinks = document.querySelectorAll('#mobile-nav a');

  const isToolPage = [
    'line-counter', 'word-counter', 'character-counter', 'paragraph-counter', 'sentence-counter',
    'remove-extra-spaces', 'remove-duplicate-lines', 'find-and-replace', 'number-lines', 'remove-line-numbers',
    'invoice-generator', 'privacy-policy-generator', 'qr-code-generator',
    'image-compressor', 'image-to-pdf', 'meta-tag-generator',
    'image-resizer', 'image-cropper', 'jpg-to-png', 'png-to-jpg', 'webp-to-jpg', 'jpg-to-webp',
    'png-to-webp', 'webp-to-png', 'image-quality-adjuster', 'image-border-generator',
    'image-aspect-ratio-checker', 'image-watermark-adder', 'image-splitter', 'image-merger', 'image-color-palette-extractor',
    'pdf-page-numbering', 'pdf-page-deleter', 'pdf-to-image', 'jpg-to-pdf', 'png-to-pdf',
    'pdf-blank-page-detector', 'pdf-text-extractor', 'pdf-color-page-detector', 'pdf-merger', 'pdf-splitter',
    'compress-pdf', 'pdf-to-word', 'pdf-to-powerpoint', 'pdf-to-excel', 'excel-to-pdf',
    'word-to-pdf', 'powerpoint-to-pdf', 'html-to-pdf', 'protect-pdf',
    'sign-pdf', 'pdf-watermark', 'organize-pdf',
    'unlock-pdf', 'crop-pdf', 'redact-pdf', 'compare-pdf', 'repair-pdf', 'pdf-to-pdfa',
    'length-converter', 'weight-converter', 'temperature-converter', 'area-converter', 'volume-converter',
    'speed-converter', 'time-converter', 'pressure-converter', 'power-converter', 'digital-storage-converter',
    'break-even-calculator', 'inventory-turnover-calculator', 'business-expense-calculator', 'employee-cost-calculator',
    'profit-margin-calculator', 'customer-ltv-calculator', 'customer-cac-calculator', 'roi-calculator',
    'json-formatter', 'css-formatter', 'html-formatter', 'js-formatter', 'uuid-generator',
    'password-generator', 'hex-color-generator', 'rgb-color-generator', 'css-gradient-generator',
    'box-shadow-generator', 'css-transform-generator', 'html-button-generator', 'css-animation-generator',
    'dummy-json-generator', 'cron-expression-generator', 'keyword-density-checker', 'robots-txt-generator', 'xml-sitemap-generator',
    'open-graph-generator', 'utm-builder', 'meta-length-checker', 'url-encoder-decoder',
    'htaccess-redirect-generator',
    'barcode-generator', 'code128-barcode-generator', 'ean-barcode-generator', 'upc-barcode-generator',
    'isbn-barcode-generator', 'barcode-text-generator',
    'daily-planner', 'weekly-planner', 'monthly-planner', 'focus-timer',
    'priority-matrix-tool', 'daily-schedule-generator',
    'marketing-roi-calculator', 'conversion-rate-calculator',
    'ctr-calculator', 'cpm-calculator', 'cpc-calculator', 'cpa-calculator',
    'roas-calculator', 'break-even-roas-calculator', 'selling-price-calculator',
    'inventory-value-calculator', 'return-rate-calculator', 'average-order-value-calculator',
    'image-to-text', 'screenshot-to-text', 'scanned-pdf-to-text', 'handwriting-to-text',
    'receipt-ocr', 'business-card-ocr', 'code-screenshot-to-text', 'table-ocr',
    'number-ocr', 'multilingual-ocr'
  ].some(tool => currentPath.includes(tool));

  desktopLinks.forEach(link => {
    const href = link.getAttribute('href') ? link.getAttribute('href').toLowerCase() : '';
    
    if (isToolPage && (href.includes('popular-tools') || href.includes('tools'))) {
      link.className = 'text-white border-b-2 border-[#6366F1] pb-1';
    } else if (currentPath.includes('about') && href.includes('about')) {
      link.className = 'text-white border-b-2 border-[#6366F1] pb-1';
    } else if (currentPath.includes('contact') && href.includes('contact')) {
      link.className = 'text-white border-b-2 border-[#6366F1] pb-1';
    } else if ((currentPath.endsWith('/') || currentPath.includes('index.html')) && (href === 'index.html' || href === '/')) {
      link.className = 'text-white border-b-2 border-[#6366F1] pb-1';
    } else {
      link.className = 'hover:text-white hover:border-b-2 hover:border-[#6366F1] pb-1 transition-all';
    }
  });

  mobileLinks.forEach(link => {
    const href = link.getAttribute('href') ? link.getAttribute('href').toLowerCase() : '';
    if (isToolPage && (href.includes('popular-tools') || href.includes('tools'))) {
      link.className = 'block text-[#6366F1] font-bold';
    } else if (currentPath.includes('about') && href.includes('about')) {
      link.className = 'block text-[#6366F1] font-bold';
    } else if (currentPath.includes('contact') && href.includes('contact')) {
      link.className = 'block text-[#6366F1] font-bold';
    } else if ((currentPath.endsWith('/') || currentPath.includes('index.html')) && (href === 'index.html' || href === '/')) {
      link.className = 'block text-[#6366F1] font-bold';
    } else {
      link.className = 'block hover:text-[#6366F1]';
    }
  });
}

/* Theme Initialization */
function initTheme() {
  const isDark = localStorage.getItem('dc_theme') === 'dark' ||
    (!('dc_theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

/* Floating Bottom-Left Theme Toggle */
function renderBottomLeftThemeToggle() {
  if (document.getElementById('dc-bottom-left-theme-toggle')) return;

  const btn = document.createElement('button');
  btn.id = 'dc-bottom-left-theme-toggle';
  btn.className = 'fixed bottom-5 left-5 z-50 p-3.5 rounded-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-amber-400 shadow-xl hover:shadow-2xl hover:scale-110 transition-all cursor-pointer flex items-center justify-center';
  btn.setAttribute('aria-label', 'Toggle Dark/Light Mode');
  
  const updateIcon = () => {
    const isDark = document.documentElement.classList.contains('dark');
    btn.innerHTML = isDark
      ? `<svg class="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>`
      : `<svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>`;
  };

  updateIcon();

  btn.addEventListener('click', () => {
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('dc_theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('dc_theme', 'dark');
    }
    updateIcon();
  });

  document.body.appendChild(btn);
}

/* Mobile Menu Toggle & Auto-Close Engine */
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileNav = document.getElementById('mobile-nav');

  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = mobileNav.classList.contains('hidden');
      mobileNav.classList.toggle('hidden');
      menuBtn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
    });

    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.add('hidden');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('click', (e) => {
      if (!mobileNav.classList.contains('hidden') && !mobileNav.contains(e.target) && !menuBtn.contains(e.target)) {
        mobileNav.classList.add('hidden');
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !mobileNav.classList.contains('hidden')) {
        mobileNav.classList.add('hidden');
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }
}

/* Toast Container System */
function initToastContainer() {
  if (!document.getElementById('toast-container')) {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none';
    document.body.appendChild(container);
  }
}

function showToast(message, type = 'success') {
  initToastContainer();
  const container = document.getElementById('toast-container');
  
  const toast = document.createElement('div');
  toast.className = `pointer-events-auto flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl text-xs font-mono font-semibold border transition-all duration-300 transform translate-y-2 opacity-0 ${
    type === 'success'
      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-emerald-500/40'
      : 'bg-rose-950 text-white border-rose-500/40'
  }`;

  toast.innerHTML = `
    <span>${type === 'success' ? '✓' : 'ℹ'}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  }, 10);

  setTimeout(() => {
    toast.classList.add('translate-y-2', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function copyToClipboard(text, msg = 'Copied to clipboard!') {
  if (!text) return;
  const onCopied = () => showToast(msg, 'success');
  const fallback = () => {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      ta.style.top = '0';
      ta.setAttribute('readonly', '');
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      if (ok) {
        onCopied();
      } else {
        showToast('Please copy text manually (Ctrl+C)', 'info');
      }
    } catch (e) {
      showToast('Please copy text manually (Ctrl+C)', 'info');
    }
  };

  if (navigator.clipboard && window.isSecureContext && typeof navigator.clipboard.writeText === 'function') {
    navigator.clipboard.writeText(text).then(onCopied).catch(fallback);
  } else {
    fallback();
  }
}

// Global safeCopy alias for backward-compatibility across suites
window.safeCopy = copyToClipboard;
window.copyToClipboard = copyToClipboard;

/* Search Modal Engine & Keyboard Shortcut (⌘K) */
const TOOLS_REGISTRY = [
  { name: 'Line Counter', url: 'line-counter.html', cat: 'Text', desc: 'Count total lines, non-empty lines & blank lines in real time' },
  { name: 'Word Counter', url: 'word-counter.html', cat: 'Text', desc: 'Real-time word, character, reading & speaking time calculator' },
  { name: 'Character Counter', url: 'character-counter.html', cat: 'Text', desc: 'Count characters with/without spaces, letters & social limits' },
  { name: 'Paragraph Counter', url: 'paragraph-counter.html', cat: 'Text', desc: 'Count paragraphs, average words per paragraph & density' },
  { name: 'Sentence Counter', url: 'sentence-counter.html', cat: 'Text', desc: 'Count sentences, readability score & sentence length' },
  { name: 'Remove Extra Spaces', url: 'remove-extra-spaces.html', cat: 'Text', desc: 'Clean duplicate spaces, leading/trailing whitespace & empty lines' },
  { name: 'Remove Duplicate Lines', url: 'remove-duplicate-lines.html', cat: 'Text', desc: 'Deduplicate lines instantly with case sensitivity options' },
  { name: 'Find & Replace Tool', url: 'find-and-replace.html', cat: 'Text', desc: 'Search and replace text or regex patterns instantly' },
  { name: 'Number Lines Tool', url: 'number-lines.html', cat: 'Text', desc: 'Add line numbers (1., 01., [1]) to plain text lists' },
  { name: 'Remove Line Numbers', url: 'remove-line-numbers.html', cat: 'Text', desc: 'Strip line numbers, prefixes and bullet points from text' },
  { name: 'Invoice Generator', url: 'invoice-generator.html', cat: 'Document', desc: 'Itemized invoices with logo & PDF export' },
  { name: 'Privacy Policy Generator', url: 'privacy-policy-generator.html', cat: 'Document', desc: 'GDPR, CCPA & AdSense privacy policies' },
  { name: 'QR Code Generator', url: 'qr-code-generator.html', cat: 'QR & Barcode', desc: 'PNG & SVG QR codes for URLs, WiFi & vCard' },
  { name: 'Barcode Generator', url: 'barcode-generator.html', cat: 'QR & Barcode', desc: 'Standard 1D linear barcodes for product labels' },
  { name: 'Code 128 Barcode Generator', url: 'code128-barcode-generator.html', cat: 'QR & Barcode', desc: 'High-density Code 128 barcodes for logistics' },
  { name: 'EAN Barcode Generator', url: 'ean-barcode-generator.html', cat: 'QR & Barcode', desc: 'European Article Number EAN-13 barcodes' },
  { name: 'UPC Barcode Generator', url: 'upc-barcode-generator.html', cat: 'QR & Barcode', desc: 'North American UPC-A retail barcodes' },
  { name: 'ISBN Barcode Generator', url: 'isbn-barcode-generator.html', cat: 'QR & Barcode', desc: 'Book publishing ISBN barcodes' },
  { name: 'Barcode Text Generator', url: 'barcode-text-generator.html', cat: 'QR & Barcode', desc: 'Alphanumeric SKU barcodes with custom text' },
  { name: 'Daily Planner', url: 'daily-planner.html', cat: 'Productivity', desc: 'Time-blocked daily tasks, priorities & progress tracker' },
  { name: 'Weekly Planner', url: 'weekly-planner.html', cat: 'Productivity', desc: '7-day sprint objectives, daily targets & weekly goal mapping' },
  { name: 'Monthly Planner', url: 'monthly-planner.html', cat: 'Productivity', desc: '30-day interactive calendar roadmap & project milestones' },
  { name: 'Priority Matrix Tool', url: 'priority-matrix-tool.html', cat: 'Productivity', desc: '4-quadrant Eisenhower Decision Matrix for task urgency' },
  { name: 'Daily Schedule Generator', url: 'daily-schedule-generator.html', cat: 'Productivity', desc: 'Auto-generate sequential time-stamped schedules from task lists' },
  { name: 'Marketing ROI Calculator', url: 'marketing-roi-calculator.html', cat: 'E-commerce & Marketing', desc: 'Net profit and return on investment (ROI %) across marketing campaigns' },
  { name: 'Conversion Rate Calculator', url: 'conversion-rate-calculator.html', cat: 'E-commerce & Marketing', desc: 'Website conversion percentages from sessions and goal conversions' },
  { name: 'CTR Calculator', url: 'ctr-calculator.html', cat: 'E-commerce & Marketing', desc: 'Ad Click-Through Rate (CTR %) from impressions and clicks' },
  { name: 'CPM Calculator', url: 'cpm-calculator.html', cat: 'E-commerce & Marketing', desc: 'Cost Per Mille (CPM) impressions pricing across ad networks' },
  { name: 'CPC Calculator', url: 'cpc-calculator.html', cat: 'E-commerce & Marketing', desc: 'Cost Per Click (CPC) across PPC advertising networks' },
  { name: 'CPA Calculator', url: 'cpa-calculator.html', cat: 'E-commerce & Marketing', desc: 'Cost Per Acquisition (CPA) across conversions and leads' },
  { name: 'ROAS Calculator', url: 'roas-calculator.html', cat: 'E-commerce & Marketing', desc: 'Return On Ad Spend (ROAS %) and revenue multiplier ratios' },
  { name: 'Break-Even ROAS Calculator', url: 'break-even-roas-calculator.html', cat: 'E-commerce & Marketing', desc: 'Minimum ROAS required for profit margins to break even' },
  { name: 'Selling Price Calculator', url: 'selling-price-calculator.html', cat: 'E-commerce & Marketing', desc: 'Retail selling prices and profit margins from COGS' },
  { name: 'Inventory Value Calculator', url: 'inventory-value-calculator.html', cat: 'E-commerce & Marketing', desc: 'Total inventory stock asset valuation' },
  { name: 'Return Rate Calculator', url: 'return-rate-calculator.html', cat: 'E-commerce & Marketing', desc: 'E-commerce product return rate percentages' },
  { name: 'Average Order Value Calculator', url: 'average-order-value-calculator.html', cat: 'E-commerce & Marketing', desc: 'Average revenue generated per transaction (AOV)' },
  { name: 'Image Compressor', url: 'image-compressor.html', cat: 'Image', desc: 'Client-side image compression for WebP, JPG, PNG' },
  { name: 'Meta Tag Generator', url: 'meta-tag-generator.html', cat: 'SEO', desc: 'Open Graph, Twitter Cards & Google snippet preview' },
  { name: 'Image Resizer', url: 'image-resizer.html', cat: 'Image', desc: 'Resize width, height & maintain aspect ratio' },
  { name: 'Image Cropper', url: 'image-cropper.html', cat: 'Image', desc: 'Crop photos with aspect ratio presets (1:1, 16:9, 4:3, 9:16)' },
  { name: 'JPG to PNG Converter', url: 'jpg-to-png.html', cat: 'Image', desc: 'Convert JPG images to lossless PNG format' },
  { name: 'PNG to JPG Converter', url: 'png-to-jpg.html', cat: 'Image', desc: 'Convert PNG files to JPG with custom background color' },
  { name: 'WebP to JPG Converter', url: 'webp-to-jpg.html', cat: 'Image', desc: 'Convert WebP images to universal JPG format' },
  { name: 'JPG to WebP Converter', url: 'jpg-to-webp.html', cat: 'Image', desc: 'Convert JPG files to modern lightweight WebP format' },
  { name: 'PNG to WebP Converter', url: 'png-to-webp.html', cat: 'Image', desc: 'Convert PNG files to WebP with transparency support' },
  { name: 'WebP to PNG Converter', url: 'webp-to-png.html', cat: 'Image', desc: 'Convert WebP files back to PNG format' },
  { name: 'Image Quality Adjuster', url: 'image-quality-adjuster.html', cat: 'Image', desc: 'Fine-tune image compression quality from 10% to 100%' },
  { name: 'Image Border Generator', url: 'image-border-generator.html', cat: 'Image', desc: 'Add custom colored frames, padding & rounded corners' },
  { name: 'Image Aspect Ratio Checker', url: 'image-aspect-ratio-checker.html', cat: 'Image', desc: 'Calculate aspect ratios, megapixels & resolution tags' },
  { name: 'Image Watermark Adder', url: 'image-watermark-adder.html', cat: 'Image', desc: 'Add text watermarks with opacity & positioning controls' },
  { name: 'Image Splitter', url: 'image-splitter.html', cat: 'Image', desc: 'Slice photos into equal grid rows and columns for Instagram' },
  { name: 'Image Merger', url: 'image-merger.html', cat: 'Image', desc: 'Combine multiple images side-by-side or stacked vertically' },
  { name: 'Image Color Palette Extractor', url: 'image-color-palette-extractor.html', cat: 'Image', desc: 'Extract top dominant HEX & RGB color swatches from photos' },
  { name: 'PDF Page Numbering Tool', url: 'pdf-page-numbering.html', cat: 'PDF', desc: 'Stamp page numbers (Page X of Y) with position controls' },
  { name: 'PDF Page Deleter', url: 'pdf-page-deleter.html', cat: 'PDF', desc: 'Visual thumbnail page selector to remove unwanted pages' },
  { name: 'PDF to Image Converter', url: 'pdf-to-image.html', cat: 'PDF', desc: 'Convert PDF document pages to PNG & JPG images' },
  { name: 'JPG to PDF Converter', url: 'jpg-to-pdf.html', cat: 'PDF', desc: 'Convert JPG & JPEG photos into a clean PDF document' },
  { name: 'Image to PDF Converter', url: 'image-to-pdf.html', cat: 'PDF', desc: 'Merge multiple images (JPG, PNG, WebP) into PDF' },
  { name: 'PNG to PDF Converter', url: 'png-to-pdf.html', cat: 'PDF', desc: 'Convert PNG graphics into formatted PDF pages' },
  { name: 'PDF Blank Page Detector', url: 'pdf-blank-page-detector.html', cat: 'PDF', desc: 'Scan & delete empty white pages automatically' },
  { name: 'PDF Text Extractor', url: 'pdf-text-extractor.html', cat: 'PDF', desc: 'Extract raw text stream with copy & .txt download' },
  { name: 'PDF Color Page Detector', url: 'pdf-color-page-detector.html', cat: 'PDF', desc: 'Classify PDF pages as Color vs Grayscale for print costs' },
  { name: 'PDF Merger', url: 'pdf-merger.html', cat: 'PDF', desc: 'Combine multiple PDF files into one master document' },
  { name: 'PDF Splitter', url: 'pdf-splitter.html', cat: 'PDF', desc: 'Extract specific pages or page ranges (e.g. 1-3, 5)' },
  { name: 'Compress PDF', url: 'compress-pdf.html', cat: 'PDF', desc: 'Reduce PDF file size in browser memory with zero upload' },
  { name: 'PDF to Word Converter', url: 'pdf-to-word.html', cat: 'PDF', desc: 'Convert PDF documents to editable Microsoft Word (.docx) files' },
  { name: 'PDF to PowerPoint Converter', url: 'pdf-to-powerpoint.html', cat: 'PDF', desc: 'Convert PDF pages to editable PowerPoint (.pptx) slides' },
  { name: 'PDF to Excel Converter', url: 'pdf-to-excel.html', cat: 'PDF', desc: 'Extract PDF tabular data directly to Excel (.xlsx) workbooks' },
  { name: 'Excel to PDF Converter', url: 'excel-to-pdf.html', cat: 'PDF', desc: 'Convert Excel spreadsheets (XLSX, XLS, CSV) into PDF documents' },
  { name: 'Word to PDF Converter', url: 'word-to-pdf.html', cat: 'PDF', desc: 'Convert Microsoft Word (.docx) documents to standardized PDF' },
  { name: 'PowerPoint to PDF Converter', url: 'powerpoint-to-pdf.html', cat: 'PDF', desc: 'Convert PowerPoint (.pptx) slides into PDF presentations' },
  { name: 'HTML to PDF Converter', url: 'html-to-pdf.html', cat: 'PDF', desc: 'Convert HTML markup and CSS styles into print-ready PDF files' },
  { name: 'Protect PDF (Password)', url: 'protect-pdf.html', cat: 'PDF', desc: 'Encrypt PDF files with secure passwords and access controls' },
  { name: 'Sign PDF (Digital Signature)', url: 'sign-pdf.html', cat: 'PDF', desc: 'Draw, inspect, and embed signatures directly into PDF documents' },
  { name: 'PDF Watermark', url: 'pdf-watermark.html', cat: 'PDF', desc: 'Add custom text watermarks across all PDF pages' },
  { name: 'Organize & Reorder PDF', url: 'organize-pdf.html', cat: 'PDF', desc: 'Reorder, rotate, delete, and rearrange PDF document pages' },
  { name: 'Unlock PDF', url: 'unlock-pdf.html', cat: 'PDF', desc: 'Remove PDF passwords and decrypt files client-side' },
  { name: 'Crop PDF', url: 'crop-pdf.html', cat: 'PDF', desc: 'Trim margins and crop PDF page bounding boxes' },
  { name: 'Redact PDF', url: 'redact-pdf.html', cat: 'PDF', desc: 'Permanently black out sensitive text, PII, and images' },
  { name: 'Compare PDF', url: 'compare-pdf.html', cat: 'PDF', desc: 'Side-by-side visual and structural page comparison' },
  { name: 'Repair PDF', url: 'repair-pdf.html', cat: 'PDF', desc: 'Rebuild corrupt xref tables and recover broken PDF files' },
  { name: 'PDF to PDF/A', url: 'pdf-to-pdfa.html', cat: 'PDF', desc: 'Convert PDF to ISO 19005 archival preservation format' },
  { name: 'Length Converter', url: 'length-converter.html', cat: 'Unit', desc: 'Convert meters, feet, miles, inches & nautical miles' },
  { name: 'Weight Converter', url: 'weight-converter.html', cat: 'Unit', desc: 'Convert kilograms, grams, pounds, ounces & stones' },
  { name: 'Temperature Converter', url: 'temperature-converter.html', cat: 'Unit', desc: 'Convert Celsius, Fahrenheit & Kelvin scales' },
  { name: 'Area Converter', url: 'area-converter.html', cat: 'Unit', desc: 'Convert sq meters, sq feet, acres & hectares' },
  { name: 'Volume Converter', url: 'volume-converter.html', cat: 'Unit', desc: 'Convert liters, gallons, pints, cups & fl oz' },
  { name: 'Speed Converter', url: 'speed-converter.html', cat: 'Unit', desc: 'Convert km/h, mph, knots, m/s & ft/s' },
  { name: 'Time Converter', url: 'time-converter.html', cat: 'Unit', desc: 'Convert seconds, hours, days, weeks & years' },
  { name: 'Pressure Converter', url: 'pressure-converter.html', cat: 'Unit', desc: 'Convert Pascal, Bar, PSI, Atm & Torr' },
  { name: 'Power Converter', url: 'power-converter.html', cat: 'Unit', desc: 'Convert Watts, Kilowatts, Horsepower & BTU/h' },
  { name: 'Digital Storage Converter', url: 'digital-storage-converter.html', cat: 'Unit', desc: 'Convert Bytes, KB, MB, GB, TB, PB & Bits' },
  { name: 'Break-Even Point Calculator', url: 'break-even-calculator.html', cat: 'Business', desc: 'Determine sales volume & revenue needed to cover fixed & variable costs' },
  { name: 'Inventory Turnover Calculator', url: 'inventory-turnover-calculator.html', cat: 'Business', desc: 'Calculate inventory turnover ratio & days sales of inventory (DSI)' },
  { name: 'Business Expense Calculator', url: 'business-expense-calculator.html', cat: 'Business', desc: 'Total monthly & annual operating costs, net income & expense ratio' },
  { name: 'Employee Cost Calculator', url: 'employee-cost-calculator.html', cat: 'Business', desc: 'Compute fully burdened employee cost including taxes, benefits & perks' },
  { name: 'Profit Margin Calculator', url: 'profit-margin-calculator.html', cat: 'Business', desc: 'Calculate gross profit margin, net margin & markup percentages' },
  { name: 'Customer Lifetime Value (LTV)', url: 'customer-ltv-calculator.html', cat: 'Business', desc: 'Compute gross lifetime revenue & net customer lifetime value (LTV)' },
  { name: 'Customer Acquisition Cost (CAC)', url: 'customer-cac-calculator.html', cat: 'Business', desc: 'Calculate fully blended customer acquisition cost across channels' },
  { name: 'ROI Calculator', url: 'roi-calculator.html', cat: 'Business', desc: 'Determine net gain, total ROI percentage & annualized yield (CAGR)' },
  { name: 'JSON Formatter', url: 'json-formatter.html', cat: 'Developer', desc: 'Format, validate, beautify, and minify JSON data payloads' },
  { name: 'CSS Formatter', url: 'css-formatter.html', cat: 'Developer', desc: 'Clean, indent, and compress CSS style rules' },
  { name: 'HTML Formatter', url: 'html-formatter.html', cat: 'Developer', desc: 'Format and minify HTML markup templates' },
  { name: 'JavaScript Formatter', url: 'js-formatter.html', cat: 'Developer', desc: 'Beautify and compress JavaScript source code' },
  { name: 'UUID Generator', url: 'uuid-generator.html', cat: 'Developer', desc: 'Generate cryptographically secure version-4 UUID / GUID strings' },
  { name: 'Secure Password Generator', url: 'password-generator.html', cat: 'Developer', desc: 'Generate high-entropy custom passwords with strength indicators' },
  { name: 'HEX Color Generator', url: 'hex-color-generator.html', cat: 'Developer', desc: 'Pick or randomize HEX colors with RGB & HSL conversions' },
  { name: 'RGB Color Generator', url: 'rgb-color-generator.html', cat: 'Developer', desc: 'Mix Red, Green, Blue & Alpha channel sliders visually' },
  { name: 'CSS Gradient Generator', url: 'css-gradient-generator.html', cat: 'Developer', desc: 'Design linear, radial & conic background gradients' },
  { name: 'Box Shadow Generator', url: 'box-shadow-generator.html', cat: 'Developer', desc: 'Design card elevation and inset shadow CSS properties' },
  { name: 'CSS Transform Generator', url: 'css-transform-generator.html', cat: 'Developer', desc: 'Rotate, scale, translate & skew elements visually' },
  { name: 'HTML Button Generator', url: 'html-button-generator.html', cat: 'Developer', desc: 'Design call-to-action web buttons with HTML & CSS export' },
  { name: 'CSS Animation Generator', url: 'css-animation-generator.html', cat: 'Developer', desc: 'Generate keyframe motion graphics (Pulse, Bounce, Spin, Flip)' },
  { name: 'Dummy JSON Generator', url: 'dummy-json-generator.html', cat: 'Developer', desc: 'Generate mock JSON arrays for users, products & posts' },
  { name: 'Cron Expression Generator', url: 'cron-expression-generator.html', cat: 'Developer', desc: 'Interactive schedule builder, cron syntax generator & human-readable explanation' },
  { name: 'Keyword Density Checker', url: 'keyword-density-checker.html', cat: 'SEO', desc: 'Analyze word frequency, density % & keyword stuffing warnings' },
  { name: 'Robots.txt Generator', url: 'robots-txt-generator.html', cat: 'SEO', desc: 'Generate search crawler directive files with crawl delays & sitemaps' },
  { name: 'XML Sitemap Generator', url: 'xml-sitemap-generator.html', cat: 'SEO', desc: 'Build Google-compliant XML sitemaps from site URL lists' },
  { name: 'Open Graph Generator', url: 'open-graph-generator.html', cat: 'SEO', desc: 'Generate Facebook & Twitter social card meta tags with live preview' },
  { name: 'UTM Campaign Builder', url: 'utm-builder.html', cat: 'SEO', desc: 'Add Google Analytics tracking query parameters to URLs' },
  { name: 'Meta Title & Desc Length Checker', url: 'meta-length-checker.html', cat: 'SEO', desc: 'Test title & description character counts and SERP pixel widths' },
  { name: 'URL Encoder / Decoder', url: 'url-encoder-decoder.html', cat: 'SEO', desc: 'Encode special characters into percent-encoded URLs and decode' },
  { name: '.htaccess Redirect Generator', url: 'htaccess-redirect-generator.html', cat: 'SEO', desc: 'Generate 301, 302, and HTTPS force rules for Apache servers' },
  { name: 'Case Converter', url: 'case-converter.html', cat: 'Text', desc: 'Convert text to UPPER, lower, camelCase, PascalCase, snake_case, kebab-case' },
  { name: 'URL Slug Generator', url: 'slug-generator.html', cat: 'Text', desc: 'Generate SEO-friendly URL slugs with stop words removal & custom delimiters' },
  { name: 'Lorem Ipsum Generator', url: 'lorem-ipsum-generator.html', cat: 'Text', desc: 'Generate custom placeholder text in paragraphs, sentences, words, and lists' },
  { name: 'SVG to PNG Converter', url: 'svg-to-png.html', cat: 'Image', desc: 'Rasterize SVG vector graphics into high-DPI transparent PNG images' },
  { name: 'Base64 Image Converter', url: 'base64-image-converter.html', cat: 'Image', desc: 'Encode images to Base64 data URIs or decode Base64 strings to images' },
  { name: 'Image EXIF Metadata Stripper', url: 'image-exif-remover.html', cat: 'Image', desc: 'Inspect and sanitize GPS and camera metadata tags from photos' },
  { name: 'PDF Page Rotator', url: 'pdf-page-rotator.html', cat: 'PDF', desc: 'Rotate individual or all PDF document pages permanently client-side' },
  { name: 'Text to PDF Converter', url: 'text-to-pdf.html', cat: 'PDF', desc: 'Convert plain text notes and code into formatted printable PDF documents' },
  { name: 'Freelance Hourly Rate Calculator', url: 'hourly-rate-calculator.html', cat: 'Business', desc: 'Calculate ideal freelance hourly and daily billable rates from net income' },
  { name: 'Salary to Hourly Calculator', url: 'salary-to-hourly-calculator.html', cat: 'Business', desc: 'Convert annual salary into hourly, weekly, bi-weekly, and monthly wages' },
  { name: 'Discount & Sale Price Calculator', url: 'discount-calculator.html', cat: 'Business', desc: 'Calculate stacked discounts, promo coupon codes, and localized sales tax' },
  { name: 'JWT Token Decoder & Inspector', url: 'jwt-decoder.html', cat: 'Developer', desc: 'Decode and debug JSON Web Tokens (JWT) algorithm headers and payload claims' },
  { name: 'Markdown to HTML Live Editor', url: 'markdown-to-html.html', cat: 'Developer', desc: 'Convert GitHub-flavored Markdown to clean semantic HTML with live preview' },
  { name: 'Google SERP Snippet Simulator', url: 'serp-simulator.html', cat: 'SEO', desc: 'Preview Google search result snippets on desktop and mobile with pixel meter' },
  { name: 'HTTP Status Code Explorer', url: 'http-status-checker.html', cat: 'SEO', desc: 'Comprehensive guide to IETF HTTP response status codes and SEO indexing impact' },
  { name: 'Pomodoro Focus Timer', url: 'pomodoro-timer.html', cat: 'Productivity', desc: 'Pomodoro 25-minute deep work intervals with audio chime alerts' },
  { name: '7-Day Habit Streak Tracker', url: 'habit-tracker.html', cat: 'Productivity', desc: 'Track daily habit streaks and weekly consistency with localStorage persistence' },
  { name: 'Weighted Decision Matrix', url: 'decision-matrix.html', cat: 'Productivity', desc: 'Make rational multi-criteria decisions with weighted scoring and rankings' },
  { name: 'Email Marketing ROI Calculator', url: 'email-marketing-roi-calculator.html', cat: 'Marketing', desc: 'Forecast email campaign ROI, conversion funnels, and revenue per subscriber' },
  { name: 'Amazon FBA Profit Calculator', url: 'amazon-fba-calculator.html', cat: 'E-commerce', desc: 'Calculate Amazon seller referral fees, FBA fulfillment fees, and net profit' },
  { name: 'SaaS Churn Rate Calculator', url: 'churn-rate-calculator.html', cat: 'Business', desc: 'Calculate SaaS customer churn, retention rate, customer lifetime, and LTV' },
  { name: 'Image to Text (Universal OCR)', url: 'image-to-text.html', cat: 'OCR', desc: 'Extract text from JPG, PNG, and WebP images with 100% client-side privacy' },
  { name: 'Screenshot to Text OCR', url: 'screenshot-to-text.html', cat: 'OCR', desc: 'Paste screenshots directly from clipboard (Ctrl+V) to extract editable text' },
  { name: 'Scanned PDF to Text OCR', url: 'scanned-pdf-to-text.html', cat: 'OCR', desc: 'Rasterize and extract searchable text from non-selectable scanned PDF documents' },
  { name: 'Handwriting to Text OCR', url: 'handwriting-to-text.html', cat: 'OCR', desc: 'Transcribe handwritten meeting notes, whiteboard snapshots, and cursive lettering' },
  { name: 'Receipt & Invoice OCR', url: 'receipt-ocr.html', cat: 'OCR', desc: 'Extract merchant, transaction date, tax, and total dollar amounts from receipts' },
  { name: 'Business Card to vCard OCR', url: 'business-card-ocr.html', cat: 'OCR', desc: 'Scan business cards and export Name, Email, Phone, and Company to .vcf contact' },
  { name: 'Code Screenshot to Text OCR', url: 'code-screenshot-to-text.html', cat: 'OCR', desc: 'Extract clean code from tutorial screenshots while preserving syntax & brackets' },
  { name: 'Table / Data to CSV OCR', url: 'table-ocr.html', cat: 'OCR', desc: 'Convert photo tables and spreadsheet printouts into structured CSV & HTML tables' },
  { name: 'Numbers & Digits Only OCR', url: 'number-ocr.html', cat: 'OCR', desc: 'High-accuracy numerical OCR restricted to digits for serial numbers and VINs' },
  { name: 'Multi-Language OCR Scanner', url: 'multilingual-ocr.html', cat: 'OCR', desc: 'Recognize foreign language documents in Spanish, French, German, Italian, and Portuguese' }
];

function initSearchModal() {
  if (!document.getElementById('search-modal')) {
    const modalDiv = document.createElement('div');
    modalDiv.id = 'search-modal';
    modalDiv.className = 'fixed inset-0 z-50 hidden items-start justify-center bg-slate-950/80 backdrop-blur-sm p-4 pt-16 md:pt-24 font-mono';
    modalDiv.innerHTML = `
      <div class="w-full max-w-2xl rounded-2xl bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div class="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <span class="mr-3 text-slate-400">🔍</span>
          <input type="text" id="search-modal-input" placeholder="Search tools (e.g. prompt, email, invoice, QR)..." class="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none text-sm font-mono" />
          <button id="search-modal-close" class="px-2 py-1 text-xs font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 rounded">ESC</button>
        </div>
        <div id="search-modal-results" class="p-3 overflow-y-auto space-y-1"></div>
      </div>
    `;
    document.body.appendChild(modalDiv);
  }

  const modal = document.getElementById('search-modal');
  const input = document.getElementById('search-modal-input');
  const resultsBox = document.getElementById('search-modal-results');
  const closeBtn = document.getElementById('search-modal-close');

  if (!modal) return;

  const openModal = () => {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    if (input) {
      input.value = '';
      input.focus();
      renderResults('');
    }
  };

  const closeModal = () => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  };

  document.querySelectorAll('.search-trigger-btn').forEach(btn => {
    btn.addEventListener('click', openModal);
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openModal();
    }
    if (e.key === 'Escape') closeModal();
  });

  if (input) {
    input.addEventListener('input', (e) => renderResults(e.target.value));
  }

  function renderResults(q) {
    if (!resultsBox) return;
    const query = q.toLowerCase().trim();
    const matches = TOOLS_REGISTRY.filter(t =>
      t.name.toLowerCase().includes(query) ||
      t.desc.toLowerCase().includes(query) ||
      t.cat.toLowerCase().includes(query)
    );

    if (matches.length === 0) {
      resultsBox.innerHTML = `<div class="p-6 text-center text-xs font-mono text-slate-500">No tools matching "${q}"</div>`;
      return;
    }

    resultsBox.innerHTML = matches.map(t => `
      <a href="${t.url}" class="flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors">
        <div>
          <div class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 font-mono">
            ${t.name}
            <span class="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold bg-[#6366F1]/10 text-[#6366F1] border border-[#6366F1]/20">${t.cat}</span>
          </div>
          <div class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">${t.desc}</div>
        </div>
        <span class="text-xs font-mono font-bold text-[#6366F1]">Open &rarr;</span>
      </a>
    `).join('');
  }
}
