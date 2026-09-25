/* ==========================================================================
   DigitalCron Tools - Enterprise SaaS Invoice Studio Engine
   100% Client-Side — Live Preview, Multi-Template, Vector Multi-Page PDF,
   Line-Item CRUD & Reordering, Real-Time Calculations, Autosave & JSON Backup
   ========================================================================== */

// Default State Specification
const DEFAULT_INVOICE_STATE = {
  business: {
    name: 'DigitalCron Tech Studio Inc.',
    logo: '',
    address: 'Suite 400, 100 Innovation Way\nSan Francisco, CA 94107, USA',
    email: 'billing@digitalcron.com',
    phone: '+1 (555) 349-2810',
    taxId: 'US-EIN-98-7654321',
    website: 'tools.digitalcron.com'
  },
  client: {
    name: 'Sarah Jenkins',
    company: 'Acme Cloud Dynamics LLC',
    address: '742 Market Boulevard, Suite 1200\nSeattle, WA 98101, USA',
    shippingAddress: '',
    email: 'accounts@acmeclouddynamics.com',
    phone: '+1 (555) 892-1044',
    taxId: 'WA-TAX-883210'
  },
  invoice: {
    number: 'INV-2026-0842',
    date: new Date().toISOString().split('T')[0],
    dueDate: (function() {
      const d = new Date(); d.setDate(d.getDate() + 30);
      return d.toISOString().split('T')[0];
    })(),
    poNumber: 'PO-992384',
    paymentTerms: 'Net 30',
    status: 'draft'
  },
  items: [
    { id: 'item-1', desc: 'Next.js 14 Full-Stack Web Application Engineering', qty: 1, unitPrice: 3800, discountType: 'percent', discountValue: 0, taxRate: 0 },
    { id: 'item-2', desc: 'Core Web Vitals & Real-Time Performance Optimization', qty: 2, unitPrice: 750, discountType: 'percent', discountValue: 0, taxRate: 0 },
    { id: 'item-3', desc: 'Enterprise Cloud Infrastructure & SOC2 Security Audit', qty: 1, unitPrice: 1650, discountType: 'percent', discountValue: 0, taxRate: 0 }
  ],
  tax: {
    enabled: true,
    label: 'VAT / Tax',
    rate: 10,
    inclusive: false,
    secondaryEnabled: false,
    secondaryLabel: 'State / Local Tax',
    secondaryRate: 5
  },
  discount: {
    enabled: true,
    type: 'percent', // 'percent' or 'flat'
    value: 5
  },
  shipping: {
    enabled: false,
    value: 0
  },
  extraFee: {
    enabled: false,
    label: 'Handling Fee',
    value: 0
  },
  amountPaid: 0,
  currency: {
    code: 'USD',
    symbol: '$',
    position: 'prefix' // 'prefix' or 'suffix'
  },
  styling: {
    template: 'modern', // 'modern', 'corporate', 'creative', 'monochrome', 'emerald', 'minimalist', 'fintech', 'luxury'
    accentColor: '#6366F1',
    font: 'sans', // 'sans', 'outfit', 'grotesk', 'serif', 'cormorant', 'mono'
    fontSize: 'md', // 'sm', 'md', 'lg'
    tableStyle: 'striped', // 'striped', 'bordered', 'clean'
    margins: 'standard' // 'compact', 'standard', 'spacious'
  },
  payment: {
    bankName: 'Silicon Valley Commercial Bank',
    accountNumber: '****-****-****-8842',
    routingNumber: 'ROUT-021000021',
    swiftIban: 'US64SVBK12345678901234',
    notes: 'Thank you for your business! Please remit payment within agreed credit terms.',
    terms: 'Payment is due within 30 days of invoice date. Overdue invoices are subject to 1.5% interest per month.',
    signature: {
      enabled: true,
      name: 'Alex Vance',
      title: 'Chief Financial Officer',
      cursive: true
    }
  }
};

let invoiceState = JSON.parse(JSON.stringify(DEFAULT_INVOICE_STATE));
let currentZoom = 1.0;
let saveTimeout = null;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  loadDraft();
  initEventListeners();
  populateFormFromState();
  renderInvoicePreview();
});

/* ── Event Listener Initialization ──────────────────────────────────────── */
function initEventListeners() {
  // Navigation Tabs in control panel
  document.querySelectorAll('.invoice-nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.getAttribute('data-tab');
      switchControlTab(targetTab);
    });
  });

  // Template switchers in toolbar
  document.querySelectorAll('.invoice-template-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const template = btn.getAttribute('data-template');
      setTemplate(template);
    });
  });

  // Color preset swatches
  document.querySelectorAll('.color-swatch-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const color = chip.getAttribute('data-color');
      setAccentColor(color);
    });
  });

  // Color picker
  const colorInput = document.getElementById('inv-custom-color');
  if (colorInput) {
    colorInput.addEventListener('input', (e) => {
      setAccentColor(e.target.value);
    });
  }

  // Logo upload & removal
  const logoInput = document.getElementById('inv-logo-input');
  if (logoInput) {
    logoInput.addEventListener('change', handleLogoUpload);
  }
  const removeLogoBtn = document.getElementById('inv-remove-logo-btn');
  if (removeLogoBtn) {
    removeLogoBtn.addEventListener('click', removeLogo);
  }

  // Shipping Address Toggle
  const toggleShipping = document.getElementById('inv-toggle-shipping-addr');
  const shippingContainer = document.getElementById('inv-shipping-addr-container');
  if (toggleShipping && shippingContainer) {
    toggleShipping.addEventListener('change', () => {
      if (toggleShipping.checked) {
        shippingContainer.classList.remove('hidden');
      } else {
        shippingContainer.classList.add('hidden');
        invoiceState.client.shippingAddress = '';
        const shipInput = document.getElementById('inv-input-client-shipping-address');
        if (shipInput) shipInput.value = '';
      }
      triggerAutoSave();
      renderInvoicePreview();
    });
  }

  // Add Item Button
  const addItemBtn = document.getElementById('inv-add-item-btn');
  if (addItemBtn) {
    addItemBtn.addEventListener('click', addLineItem);
  }

  // Toolbar Action Buttons
  const sampleBtn = document.getElementById('btn-sample-data');
  if (sampleBtn) sampleBtn.addEventListener('click', loadSampleData);

  const clearBtn = document.getElementById('btn-clear-invoice');
  if (clearBtn) clearBtn.addEventListener('click', resetInvoice);

  const exportJsonBtn = document.getElementById('btn-export-json');
  if (exportJsonBtn) exportJsonBtn.addEventListener('click', exportInvoiceJson);

  const importJsonBtn = document.getElementById('btn-import-json');
  const importJsonInput = document.getElementById('inv-json-import-input');
  if (importJsonBtn && importJsonInput) {
    importJsonBtn.addEventListener('click', () => importJsonInput.click());
    importJsonInput.addEventListener('change', handleImportJson);
  }

  const exportPdfBtn = document.getElementById('btn-export-pdf');
  if (exportPdfBtn) exportPdfBtn.addEventListener('click', exportToPDF);

  const exportPngBtn = document.getElementById('btn-export-png');
  if (exportPngBtn) exportPngBtn.addEventListener('click', () => exportToImage('png'));

  const exportJpgBtn = document.getElementById('btn-export-jpg');
  if (exportJpgBtn) exportJpgBtn.addEventListener('click', () => exportToImage('jpg'));

  const printBtn = document.getElementById('btn-print-invoice');
  if (printBtn) printBtn.addEventListener('click', printInvoice);

  // Zoom Controls
  initZoomControls();

  // Mobile View Switcher Tabs
  initMobileViewTabs();

  // Dynamic Input Two-Way Binding
  bindInputSync();
}

/* ── Mobile View Tabs ───────────────────────────────────────────────────── */
function initMobileViewTabs() {
  const tabEdit = document.getElementById('mobile-tab-edit');
  const tabPreview = document.getElementById('mobile-tab-preview');
  const controlsPanel = document.getElementById('invoice-controls-panel');
  const previewPanel = document.getElementById('invoice-preview-panel');

  if (!tabEdit || !tabPreview || !controlsPanel || !previewPanel) return;

  tabEdit.addEventListener('click', () => {
    controlsPanel.classList.remove('hidden');
    previewPanel.classList.add('hidden');
    tabEdit.className = 'flex-1 py-2 text-center rounded-xl bg-[#6366F1] text-white shadow-sm transition-all';
    tabPreview.className = 'flex-1 py-2 text-center rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all';
  });

  tabPreview.addEventListener('click', () => {
    controlsPanel.classList.add('hidden');
    previewPanel.classList.remove('hidden');
    tabPreview.className = 'flex-1 py-2 text-center rounded-xl bg-[#6366F1] text-white shadow-sm transition-all';
    tabEdit.className = 'flex-1 py-2 text-center rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all';
    if (typeof window.autoFitInvoicePreview === 'function') {
      setTimeout(window.autoFitInvoicePreview, 60);
    }
  });

  // Handle desktop resize reset
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1280) { // xl breakpoint
      controlsPanel.classList.remove('hidden');
      previewPanel.classList.remove('hidden');
    }
  });
}

/* ── Zoom Controls ──────────────────────────────────────────────────────── */
function initZoomControls() {
  const canvasWrapper = document.getElementById('invoice-canvas-wrapper');
  const zoomLabel = document.getElementById('inv-zoom-label');
  const zoomInBtn = document.getElementById('btn-zoom-in');
  const zoomOutBtn = document.getElementById('btn-zoom-out');
  const zoomFitBtn = document.getElementById('btn-zoom-fit');
  const zoomResetBtn = document.getElementById('btn-zoom-reset');

  window.applyInvoiceZoom = (zoom) => {
    currentZoom = Math.min(1.75, Math.max(0.4, Math.round(zoom * 100) / 100));
    if (canvasWrapper) {
      canvasWrapper.style.transform = `scale(${currentZoom})`;
      canvasWrapper.style.transformOrigin = 'top center';
    }
    if (zoomLabel) {
      zoomLabel.textContent = `${Math.round(currentZoom * 100)}%`;
    }
  };

  window.autoFitInvoicePreview = () => {
    const stage = document.querySelector('.invoice-preview-stage');
    const paper = document.getElementById('invoice-printable-area');
    if (stage && paper) {
      const stageWidth = stage.clientWidth - 48;
      const paperWidth = paper.offsetWidth || 840;
      if (stageWidth > 0 && paperWidth > 0) {
        if (stageWidth < paperWidth) {
          const fitScale = Math.max(0.45, Math.min(1.0, stageWidth / paperWidth));
          window.applyInvoiceZoom(fitScale);
        } else {
          window.applyInvoiceZoom(1.0);
        }
      }
    }
  };

  if (zoomInBtn) {
    zoomInBtn.addEventListener('click', () => window.applyInvoiceZoom(currentZoom + 0.1));
  }
  if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', () => window.applyInvoiceZoom(currentZoom - 0.1));
  }
  if (zoomResetBtn) {
    zoomResetBtn.addEventListener('click', () => window.applyInvoiceZoom(1.0));
  }
  if (zoomFitBtn) {
    zoomFitBtn.addEventListener('click', window.autoFitInvoicePreview);
  }

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1280) {
      window.autoFitInvoicePreview();
    }
  });

  setTimeout(window.autoFitInvoicePreview, 150);
}

/* ── Tab Navigation ─────────────────────────────────────────────────────── */
function switchControlTab(tabName) {
  document.querySelectorAll('.invoice-nav-tab').forEach(tab => {
    if (tab.getAttribute('data-tab') === tabName) {
      tab.className = 'invoice-nav-tab invoice-tab-active flex-1 py-1.5 px-2 rounded-xl text-center transition-all bg-[#6366F1] text-white shadow-sm';
    } else {
      tab.className = 'invoice-nav-tab bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex-1 py-1.5 px-2 rounded-xl text-center transition-all hover:bg-slate-300 dark:hover:bg-slate-700';
    }
  });

  document.querySelectorAll('.invoice-tab-panel').forEach(panel => {
    if (panel.id === `tab-panel-${tabName}`) {
      panel.classList.remove('hidden');
    } else {
      panel.classList.add('hidden');
    }
  });
}

function setTemplate(template) {
  invoiceState.styling.template = template;
  document.querySelectorAll('.invoice-template-btn').forEach(btn => {
    if (btn.getAttribute('data-template') === template) {
      btn.classList.add('bg-[#6366F1]', 'text-white');
      btn.classList.remove('bg-slate-200', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-300');
    } else {
      btn.classList.remove('bg-[#6366F1]', 'text-white');
      btn.classList.add('bg-slate-200', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-300');
    }
  });
  triggerAutoSave();
  renderInvoicePreview();
}

function setAccentColor(color) {
  invoiceState.styling.accentColor = color;
  const colorInput = document.getElementById('inv-custom-color');
  if (colorInput) colorInput.value = color;

  document.querySelectorAll('.color-swatch-chip').forEach(chip => {
    if (chip.getAttribute('data-color').toLowerCase() === color.toLowerCase()) {
      chip.classList.add('active');
    } else {
      chip.classList.remove('active');
    }
  });
  triggerAutoSave();
  renderInvoicePreview();
}

function handleLogoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    showToast('Please select a valid image file (PNG, JPG, SVG, WebP).', 'error');
    return;
  }
  const reader = new FileReader();
  reader.onload = function(evt) {
    const rawDataUrl = evt.target.result;
    
    // Auto-resize logo to optimal high-DPI compact dimensions (max 320px width, max 120px height)
    // preserving exact aspect ratio and visual clarity with high quality smoothing
    const img = new Image();
    img.onload = function() {
      const maxW = 320;
      const maxH = 120;
      let w = img.naturalWidth || img.width;
      let h = img.naturalHeight || img.height;

      if (w > maxW || h > maxH) {
        const ratio = Math.min(maxW / w, maxH / h);
        w = Math.max(1, Math.round(w * ratio));
        h = Math.max(1, Math.round(h * ratio));
      }

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, w, h);

      // Keep PNG format for crisp vector/raster transparency
      const resizedDataUrl = canvas.toDataURL('image/png', 0.95);

      invoiceState.business.logo = resizedDataUrl;
      invoiceState.business.logoAspect = w / h;

      updateLogoDisplay();
      triggerAutoSave();
      renderInvoicePreview();
      showToast('Logo auto-resized & fitted to top-left!');
    };

    img.onerror = function() {
      invoiceState.business.logo = rawDataUrl;
      updateLogoDisplay();
      triggerAutoSave();
      renderInvoicePreview();
    };

    img.src = rawDataUrl;
  };
  reader.readAsDataURL(file);
}

function removeLogo() {
  invoiceState.business.logo = '';
  const input = document.getElementById('inv-logo-input');
  if (input) input.value = '';
  updateLogoDisplay();
  triggerAutoSave();
  renderInvoicePreview();
  showToast('Logo removed.');
}

function updateLogoDisplay() {
  const previewImg = document.getElementById('inv-logo-preview-thumb');
  const removeBtn = document.getElementById('inv-remove-logo-btn');
  if (invoiceState.business.logo) {
    if (previewImg) {
      previewImg.src = invoiceState.business.logo;
      previewImg.classList.remove('hidden');
    }
    if (removeBtn) removeBtn.classList.remove('hidden');
  } else {
    if (previewImg) previewImg.classList.add('hidden');
    if (removeBtn) removeBtn.classList.add('hidden');
  }
}

/* ── Dynamic Input Binding ──────────────────────────────────────────────── */
function bindInputSync() {
  const mappings = [
    // Business
    { id: 'inv-input-biz-name', obj: invoiceState.business, key: 'name' },
    { id: 'inv-input-biz-address', obj: invoiceState.business, key: 'address' },
    { id: 'inv-input-biz-email', obj: invoiceState.business, key: 'email' },
    { id: 'inv-input-biz-phone', obj: invoiceState.business, key: 'phone' },
    { id: 'inv-input-biz-taxid', obj: invoiceState.business, key: 'taxId' },
    { id: 'inv-input-biz-website', obj: invoiceState.business, key: 'website' },

    // Client
    { id: 'inv-input-client-name', obj: invoiceState.client, key: 'name' },
    { id: 'inv-input-client-company', obj: invoiceState.client, key: 'company' },
    { id: 'inv-input-client-address', obj: invoiceState.client, key: 'address' },
    { id: 'inv-input-client-shipping-address', obj: invoiceState.client, key: 'shippingAddress' },
    { id: 'inv-input-client-email', obj: invoiceState.client, key: 'email' },
    { id: 'inv-input-client-phone', obj: invoiceState.client, key: 'phone' },
    { id: 'inv-input-client-taxid', obj: invoiceState.client, key: 'taxId' },

    // Invoice Meta
    { id: 'inv-input-status', obj: invoiceState.invoice, key: 'status' },
    { id: 'inv-input-num', obj: invoiceState.invoice, key: 'number' },
    { id: 'inv-input-date', obj: invoiceState.invoice, key: 'date' },
    { id: 'inv-input-due-date', obj: invoiceState.invoice, key: 'dueDate' },
    { id: 'inv-input-po', obj: invoiceState.invoice, key: 'poNumber' },

    // Tax & Discount
    { id: 'inv-input-tax-label', obj: invoiceState.tax, key: 'label' },
    { id: 'inv-input-tax-rate', obj: invoiceState.tax, key: 'rate', type: 'float' },
    { id: 'inv-input-tax-inclusive', obj: invoiceState.tax, key: 'inclusive', type: 'bool' },
    { id: 'inv-input-tax-enable', obj: invoiceState.tax, key: 'enabled', type: 'bool' },
    { id: 'inv-input-sec-tax-enable', obj: invoiceState.tax, key: 'secondaryEnabled', type: 'bool' },
    { id: 'inv-input-sec-tax-label', obj: invoiceState.tax, key: 'secondaryLabel' },
    { id: 'inv-input-sec-tax-rate', obj: invoiceState.tax, key: 'secondaryRate', type: 'float' },

    { id: 'inv-input-discount-enable', obj: invoiceState.discount, key: 'enabled', type: 'bool' },
    { id: 'inv-input-discount-type', obj: invoiceState.discount, key: 'type' },
    { id: 'inv-input-discount-val', obj: invoiceState.discount, key: 'value', type: 'float' },

    { id: 'inv-input-shipping-enable', obj: invoiceState.shipping, key: 'enabled', type: 'bool' },
    { id: 'inv-input-shipping-val', obj: invoiceState.shipping, key: 'value', type: 'float' },

    // Extra Fee / Surcharge & Amount Paid
    { id: 'inv-input-extra-fee-enable', obj: invoiceState.extraFee, key: 'enabled', type: 'bool' },
    { id: 'inv-input-extra-fee-label', obj: invoiceState.extraFee, key: 'label' },
    { id: 'inv-input-extra-fee-val', obj: invoiceState.extraFee, key: 'value', type: 'float' },
    { id: 'inv-input-amount-paid', obj: invoiceState, key: 'amountPaid', type: 'float' },

    // Currency
    { id: 'inv-input-currency-pos', obj: invoiceState.currency, key: 'position' },

    // Styling
    { id: 'inv-input-font', obj: invoiceState.styling, key: 'font' },
    { id: 'inv-input-font-size', obj: invoiceState.styling, key: 'fontSize' },
    { id: 'inv-input-table-style', obj: invoiceState.styling, key: 'tableStyle' },
    { id: 'inv-input-margins', obj: invoiceState.styling, key: 'margins' },

    // Payment & Notes
    { id: 'inv-input-bank-name', obj: invoiceState.payment, key: 'bankName' },
    { id: 'inv-input-account-num', obj: invoiceState.payment, key: 'accountNumber' },
    { id: 'inv-input-routing', obj: invoiceState.payment, key: 'routingNumber' },
    { id: 'inv-input-swift-iban', obj: invoiceState.payment, key: 'swiftIban' },
    { id: 'inv-input-notes', obj: invoiceState.payment, key: 'notes' },
    { id: 'inv-input-terms', obj: invoiceState.payment, key: 'terms' },
    { id: 'inv-input-sign-enable', obj: invoiceState.payment.signature, key: 'enabled', type: 'bool' },
    { id: 'inv-input-sign-cursive', obj: invoiceState.payment.signature, key: 'cursive', type: 'bool' },
    { id: 'inv-input-sign-name', obj: invoiceState.payment.signature, key: 'name' },
    { id: 'inv-input-sign-title', obj: invoiceState.payment.signature, key: 'title' }
  ];

  mappings.forEach(m => {
    const el = document.getElementById(m.id);
    if (!el) return;
    const evt = (el.type === 'checkbox' || el.tagName === 'SELECT') ? 'change' : 'input';
    el.addEventListener(evt, () => {
      if (m.type === 'bool') {
        m.obj[m.key] = el.checked;
      } else if (m.type === 'float') {
        m.obj[m.key] = parseFloat(el.value) || 0;
      } else {
        m.obj[m.key] = el.value;
      }
      triggerAutoSave();
      renderInvoicePreview();
    });
  });

  // Currency select handler
  const currencySelect = document.getElementById('inv-input-currency');
  if (currencySelect) {
    currencySelect.addEventListener('change', () => {
      const selectedOption = currencySelect.options[currencySelect.selectedIndex];
      invoiceState.currency.code = currencySelect.value;
      invoiceState.currency.symbol = selectedOption.getAttribute('data-symbol') || currencySelect.value;
      triggerAutoSave();
      renderInvoicePreview();
    });
  }

  // Due date preset buttons
  document.querySelectorAll('.due-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const days = parseInt(btn.getAttribute('data-days'), 10);
      const issueDateStr = invoiceState.invoice.date || new Date().toISOString().split('T')[0];
      const issueDate = new Date(issueDateStr);
      issueDate.setDate(issueDate.getDate() + days);
      const dueDateStr = issueDate.toISOString().split('T')[0];
      invoiceState.invoice.dueDate = dueDateStr;
      const dueDateInput = document.getElementById('inv-input-due-date');
      if (dueDateInput) dueDateInput.value = dueDateStr;
      triggerAutoSave();
      renderInvoicePreview();
    });
  });
}

function populateFormFromState() {
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val ?? '';
  };
  const setChecked = (id, checked) => {
    const el = document.getElementById(id);
    if (el) el.checked = !!checked;
  };

  // Business
  setVal('inv-input-biz-name', invoiceState.business.name);
  setVal('inv-input-biz-address', invoiceState.business.address);
  setVal('inv-input-biz-email', invoiceState.business.email);
  setVal('inv-input-biz-phone', invoiceState.business.phone);
  setVal('inv-input-biz-taxid', invoiceState.business.taxId);
  setVal('inv-input-biz-website', invoiceState.business.website);

  // Client
  setVal('inv-input-client-name', invoiceState.client.name);
  setVal('inv-input-client-company', invoiceState.client.company);
  setVal('inv-input-client-address', invoiceState.client.address);
  setVal('inv-input-client-shipping-address', invoiceState.client.shippingAddress || '');
  setVal('inv-input-client-email', invoiceState.client.email);
  setVal('inv-input-client-phone', invoiceState.client.phone);
  setVal('inv-input-client-taxid', invoiceState.client.taxId);

  const toggleShipping = document.getElementById('inv-toggle-shipping-addr');
  const shippingContainer = document.getElementById('inv-shipping-addr-container');
  if (toggleShipping && shippingContainer) {
    const hasShipping = !!(invoiceState.client.shippingAddress && invoiceState.client.shippingAddress.trim());
    toggleShipping.checked = hasShipping;
    if (hasShipping) {
      shippingContainer.classList.remove('hidden');
    } else {
      shippingContainer.classList.add('hidden');
    }
  }

  // Invoice Meta
  setVal('inv-input-status', invoiceState.invoice.status || 'draft');
  setVal('inv-input-num', invoiceState.invoice.number);
  setVal('inv-input-date', invoiceState.invoice.date);
  setVal('inv-input-due-date', invoiceState.invoice.dueDate);
  setVal('inv-input-po', invoiceState.invoice.poNumber);

  // Tax & Discount
  setChecked('inv-input-tax-enable', invoiceState.tax.enabled);
  setVal('inv-input-tax-label', invoiceState.tax.label);
  setVal('inv-input-tax-rate', invoiceState.tax.rate);
  setChecked('inv-input-tax-inclusive', invoiceState.tax.inclusive);
  setChecked('inv-input-sec-tax-enable', invoiceState.tax.secondaryEnabled);
  setVal('inv-input-sec-tax-label', invoiceState.tax.secondaryLabel);
  setVal('inv-input-sec-tax-rate', invoiceState.tax.secondaryRate);

  setChecked('inv-input-discount-enable', invoiceState.discount.enabled);
  setVal('inv-input-discount-type', invoiceState.discount.type);
  setVal('inv-input-discount-val', invoiceState.discount.value);

  setChecked('inv-input-shipping-enable', invoiceState.shipping.enabled);
  setVal('inv-input-shipping-val', invoiceState.shipping.value);

  // Extra Fee & Amount Paid
  if (!invoiceState.extraFee) {
    invoiceState.extraFee = { enabled: false, label: 'Handling Fee', value: 0 };
  }
  setChecked('inv-input-extra-fee-enable', invoiceState.extraFee.enabled);
  setVal('inv-input-extra-fee-label', invoiceState.extraFee.label || 'Handling Fee');
  setVal('inv-input-extra-fee-val', invoiceState.extraFee.value || 0);
  setVal('inv-input-amount-paid', invoiceState.amountPaid || 0);

  // Currency
  setVal('inv-input-currency', invoiceState.currency.code);
  setVal('inv-input-currency-pos', invoiceState.currency.position);

  // Styling
  setTemplate(invoiceState.styling.template || 'modern');
  setAccentColor(invoiceState.styling.accentColor || '#6366F1');
  setVal('inv-input-font', invoiceState.styling.font);
  setVal('inv-input-font-size', invoiceState.styling.fontSize);
  setVal('inv-input-table-style', invoiceState.styling.tableStyle);
  setVal('inv-input-margins', invoiceState.styling.margins);

  // Payment
  setVal('inv-input-bank-name', invoiceState.payment.bankName);
  setVal('inv-input-account-num', invoiceState.payment.accountNumber);
  setVal('inv-input-routing', invoiceState.payment.routingNumber);
  setVal('inv-input-swift-iban', invoiceState.payment.swiftIban);
  setVal('inv-input-notes', invoiceState.payment.notes);
  setVal('inv-input-terms', invoiceState.payment.terms);
  setChecked('inv-input-sign-enable', invoiceState.payment.signature.enabled);
  setChecked('inv-input-sign-cursive', invoiceState.payment.signature.cursive !== false);
  setVal('inv-input-sign-name', invoiceState.payment.signature.name);
  setVal('inv-input-sign-title', invoiceState.payment.signature.title);

  updateLogoDisplay();
  renderItemsTableInForm();
}

/* ── Items CRUD in Form ─────────────────────────────────────────────────── */
function renderItemsTableInForm() {
  const container = document.getElementById('inv-form-items-list');
  if (!container) return;

  container.innerHTML = invoiceState.items.map((item, idx) => {
    const qty = item.qty || 0;
    const price = item.unitPrice !== undefined ? item.unitPrice : (item.price || 0);
    const base = qty * price;
    let disc = 0;
    if (item.discountValue > 0) {
      disc = item.discountType === 'percent' ? base * (item.discountValue / 100) : item.discountValue;
    }
    const net = Math.max(0, base - disc);
    const tax = item.taxRate > 0 ? net * (item.taxRate / 100) : 0;
    const lineTotal = net + tax;

    return `
      <div class="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 transition-all hover:border-slate-300 dark:hover:border-slate-700">
        <!-- Item Row Top Bar -->
        <div class="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono font-bold text-[10px] text-slate-600 dark:text-slate-300">#${idx + 1}</span>
            <span class="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">${formatMoney(lineTotal)}</span>
          </div>
          <!-- Action Buttons: Duplicate, Up, Down, Remove -->
          <div class="flex items-center gap-1">
            <button type="button" onclick="moveLineItem(${idx}, 'up')" ${idx === 0 ? 'disabled' : ''} class="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors" title="Move Up">
              ▲
            </button>
            <button type="button" onclick="moveLineItem(${idx}, 'down')" ${idx === invoiceState.items.length - 1 ? 'disabled' : ''} class="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors" title="Move Down">
              ▼
            </button>
            <button type="button" onclick="duplicateLineItem(${idx})" class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-[#6366F1] hover:text-white text-[10px] font-bold text-slate-600 dark:text-slate-300 transition-colors" title="Duplicate Item">
              📋 Copy
            </button>
            <button type="button" onclick="removeLineItem(${idx})" class="text-rose-500 hover:text-rose-700 text-xs font-bold px-2 py-0.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors" title="Remove Item">
              ✕
            </button>
          </div>
        </div>

        <!-- Description Input -->
        <div>
          <label class="block text-[9px] font-bold uppercase text-slate-400 mb-1">Description / Deliverable</label>
          <textarea rows="2" placeholder="Item description, specifications, or milestone details"
            oninput="updateLineItem(${idx}, 'desc', this.value)"
            class="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0c0c0e] text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-[#6366F1] focus:outline-none resize-none">${escHtml(item.desc || '')}</textarea>
        </div>

        <!-- Numbers Grid: Qty, Unit Price, Line Discount -->
        <div class="grid grid-cols-3 gap-2">
          <div>
            <label class="block text-[9px] font-bold uppercase text-slate-400 mb-0.5">Quantity</label>
            <input type="number" min="0" step="any" value="${item.qty}"
              oninput="updateLineItem(${idx}, 'qty', this.value)"
              class="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0c0c0e] text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-[#6366F1] focus:outline-none" />
          </div>
          <div>
            <label class="block text-[9px] font-bold uppercase text-slate-400 mb-0.5">Unit Price</label>
            <input type="number" min="0" step="any" value="${price}"
              oninput="updateLineItem(${idx}, 'unitPrice', this.value)"
              class="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0c0c0e] text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-[#6366F1] focus:outline-none text-right font-mono" />
          </div>
          <div>
            <label class="block text-[9px] font-bold uppercase text-slate-400 mb-0.5">Line Disc.</label>
            <div class="flex gap-1">
              <select onchange="updateLineItem(${idx}, 'discountType', this.value)" class="w-10 px-1 py-1 text-[10px] rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0c0c0e] text-slate-900 dark:text-white">
                <option value="percent" ${item.discountType === 'percent' ? 'selected' : ''}>%</option>
                <option value="flat" ${item.discountType === 'flat' ? 'selected' : ''}>$</option>
              </select>
              <input type="number" min="0" step="any" value="${item.discountValue || 0}"
                oninput="updateLineItem(${idx}, 'discountValue', this.value)"
                class="w-full px-2 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0c0c0e] text-slate-900 dark:text-white text-right" />
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function addLineItem() {
  const newId = 'item-' + Date.now();
  invoiceState.items.push({
    id: newId,
    desc: 'Professional Service / Product Deliverable',
    qty: 1,
    unitPrice: 100,
    discountType: 'percent',
    discountValue: 0,
    taxRate: 0
  });
  renderItemsTableInForm();
  triggerAutoSave();
  renderInvoicePreview();
}

function removeLineItem(idx) {
  if (invoiceState.items.length <= 1) {
    showToast('At least one line item is required.', 'error');
    return;
  }
  invoiceState.items.splice(idx, 1);
  renderItemsTableInForm();
  triggerAutoSave();
  renderInvoicePreview();
}

function duplicateLineItem(idx) {
  const orig = invoiceState.items[idx];
  const copy = Object.assign({}, orig, {
    id: 'item-' + Date.now(),
    desc: orig.desc ? `${orig.desc} (Copy)` : 'Copy of Item'
  });
  invoiceState.items.splice(idx + 1, 0, copy);
  renderItemsTableInForm();
  triggerAutoSave();
  renderInvoicePreview();
  showToast('Item duplicated.');
}

function moveLineItem(idx, direction) {
  if (direction === 'up' && idx > 0) {
    const temp = invoiceState.items[idx];
    invoiceState.items[idx] = invoiceState.items[idx - 1];
    invoiceState.items[idx - 1] = temp;
  } else if (direction === 'down' && idx < invoiceState.items.length - 1) {
    const temp = invoiceState.items[idx];
    invoiceState.items[idx] = invoiceState.items[idx + 1];
    invoiceState.items[idx + 1] = temp;
  }
  renderItemsTableInForm();
  triggerAutoSave();
  renderInvoicePreview();
}

function updateLineItem(idx, field, val) {
  if (field === 'desc' || field === 'discountType') {
    invoiceState.items[idx][field] = val;
  } else {
    invoiceState.items[idx][field] = parseFloat(val) || 0;
  }
  triggerAutoSave();
  renderInvoicePreview();
}

/* ── Financial Calculations ─────────────────────────────────────────────── */
function calculateInvoiceTotals() {
  const items = invoiceState.items || [];
  let subtotal = 0;

  // Compute item line totals
  items.forEach(item => {
    const qty = item.qty || 0;
    const unitPrice = item.unitPrice !== undefined ? item.unitPrice : (item.price || 0);
    const base = qty * unitPrice;
    let disc = 0;
    if (item.discountValue > 0) {
      disc = item.discountType === 'percent' ? base * (item.discountValue / 100) : item.discountValue;
    }
    const net = Math.max(0, base - disc);
    subtotal += net;
  });

  // Global Invoice Discount
  let discountAmt = 0;
  if (invoiceState.discount.enabled && invoiceState.discount.value > 0) {
    if (invoiceState.discount.type === 'percent') {
      discountAmt = (subtotal * invoiceState.discount.value) / 100;
    } else {
      discountAmt = invoiceState.discount.value;
    }
  }
  discountAmt = Math.min(subtotal, Math.max(0, discountAmt));

  const baseForTax = Math.max(0, subtotal - discountAmt);

  // Primary Tax (VAT/GST/Sales Tax)
  let taxAmt = 0;
  if (invoiceState.tax.enabled && invoiceState.tax.rate > 0) {
    if (invoiceState.tax.inclusive) {
      taxAmt = baseForTax - (baseForTax / (1 + (invoiceState.tax.rate / 100)));
    } else {
      taxAmt = (baseForTax * invoiceState.tax.rate) / 100;
    }
  }

  // Secondary Tax
  let secTaxAmt = 0;
  if (invoiceState.tax.secondaryEnabled && invoiceState.tax.secondaryRate > 0) {
    secTaxAmt = (baseForTax * invoiceState.tax.secondaryRate) / 100;
  }

  // Shipping Fee
  const shippingAmt = invoiceState.shipping.enabled ? Math.max(0, invoiceState.shipping.value || 0) : 0;

  // Extra Fee / Surcharge
  const extraFeeAmt = (invoiceState.extraFee && invoiceState.extraFee.enabled)
    ? Math.max(0, invoiceState.extraFee.value || 0)
    : 0;

  // Grand Total
  let grandTotal = baseForTax + shippingAmt + extraFeeAmt;
  if (!invoiceState.tax.inclusive) {
    grandTotal += taxAmt + secTaxAmt;
  }

  // Amount Paid & Balance Due
  const amountPaid = Math.max(0, invoiceState.amountPaid || 0);
  const balanceDue = Math.max(0, grandTotal - amountPaid);

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discountAmt: Math.round(discountAmt * 100) / 100,
    taxAmt: Math.round(taxAmt * 100) / 100,
    secTaxAmt: Math.round(secTaxAmt * 100) / 100,
    shippingAmt: Math.round(shippingAmt * 100) / 100,
    extraFeeAmt: Math.round(extraFeeAmt * 100) / 100,
    grandTotal: Math.round(grandTotal * 100) / 100,
    amountPaid: Math.round(amountPaid * 100) / 100,
    balanceDue: Math.round(balanceDue * 100) / 100
  };
}

function formatMoney(amount) {
  const sym = invoiceState.currency.symbol || '$';
  const pos = invoiceState.currency.position || 'prefix';
  const isJpy = invoiceState.currency.code === 'JPY';
  const formattedNum = Number(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: isJpy ? 0 : 2,
    maximumFractionDigits: isJpy ? 0 : 2
  });

  return pos === 'suffix' ? `${formattedNum} ${sym}` : `${sym}${formattedNum}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (e) {
    return dateStr;
  }
}

/* ── Live Preview Rendering ─────────────────────────────────────────────── */
function renderInvoicePreview() {
  const paper = document.getElementById('invoice-printable-area');
  if (!paper) return;

  const totals = calculateInvoiceTotals();
  const template = invoiceState.styling.template || 'modern';
  const accent = invoiceState.styling.accentColor || '#6366F1';
  let fontClass = 'font-sans';
  if (invoiceState.styling.font === 'outfit') fontClass = 'font-outfit';
  else if (invoiceState.styling.font === 'grotesk') fontClass = 'font-grotesk';
  else if (invoiceState.styling.font === 'serif') fontClass = 'font-serif';
  else if (invoiceState.styling.font === 'cormorant') fontClass = 'font-cormorant';
  else if (invoiceState.styling.font === 'mono') fontClass = 'font-mono';

  // Margins
  let marginPadding = 'p-8 sm:p-12';
  if (invoiceState.styling.margins === 'compact') marginPadding = 'p-6 sm:p-8';
  if (invoiceState.styling.margins === 'spacious') marginPadding = 'p-10 sm:p-16';

  // Base paper setup
  paper.className = `invoice-paper mx-auto ${marginPadding} ${fontClass} rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-800 bg-white`;
  paper.style.fontSize = invoiceState.styling.fontSize === 'sm' ? '12px' : (invoiceState.styling.fontSize === 'lg' ? '15px' : '13.5px');

  let templateHtml = '';
  switch (template) {
    case 'corporate':
      templateHtml = generateCorporateTemplate(totals, accent);
      break;
    case 'creative':
      templateHtml = generateCreativeTemplate(totals, accent);
      break;
    case 'monochrome':
      templateHtml = generateMonochromeTemplate(totals);
      break;
    case 'emerald':
      templateHtml = generateEmeraldTemplate(totals);
      break;
    case 'minimalist':
      templateHtml = generateMinimalistTemplate(totals, accent);
      break;
    case 'fintech':
    case 'tech':
      templateHtml = generateFintechTemplate(totals, accent);
      break;
    case 'luxury':
      templateHtml = generateLuxuryTemplate(totals);
      break;
    case 'modern':
    default:
      templateHtml = generateModernTemplate(totals, accent);
      break;
  }

  paper.innerHTML = templateHtml;
}

/* ── Helper: Logo & Top-Left Placeholder Generator ──────────────────────── */
function generateLogoHtml(theme = 'light') {
  const hasLogo = !!invoiceState.business.logo;
  
  if (hasLogo) {
    const isMono = theme === 'monochrome';
    return `
      <div class="invoice-logo-container mb-2 flex items-center justify-start">
        <img src="${invoiceState.business.logo}" 
             alt="Company Logo" 
             class="invoice-logo-img h-9 sm:h-10 max-h-10 max-w-[120px] w-auto object-contain object-left rounded transition-all ${isMono ? 'filter grayscale' : ''}" />
      </div>
    `;
  }

  // Small, professional top-left placeholder when no logo is uploaded
  const isDark = theme === 'dark';
  const isLux = theme === 'luxury';
  let borderClass = 'border-dashed border-slate-300 dark:border-slate-700 text-slate-400 hover:border-[#6366F1] hover:text-[#6366F1] bg-slate-50/70 dark:bg-slate-900/40';
  if (isDark) {
    borderClass = 'border-dashed border-white/30 text-white/70 hover:border-white hover:text-white bg-white/5';
  } else if (isLux) {
    borderClass = 'border-dashed border-amber-300/80 text-amber-800/80 hover:border-amber-600 hover:text-amber-900 bg-amber-50/50';
  }

  return `
    <div class="invoice-logo-placeholder-wrapper mb-2 print:hidden">
      <button type="button" 
              onclick="document.getElementById('inv-logo-input').click()" 
              class="invoice-logo-placeholder group flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-mono font-bold tracking-tight transition-all cursor-pointer ${borderClass}" 
              title="Click to upload company logo">
        <span class="text-xs group-hover:scale-110 transition-transform">🏢</span>
        <span>+ LOGO</span>
      </button>
    </div>
  `;
}

/* ── Helper: Ship-To Block for HTML Preview ─────────────────────────────── */
function generateShipToHtml() {
  if (!invoiceState.client.shippingAddress || !invoiceState.client.shippingAddress.trim()) {
    return '';
  }
  return `
    <div class="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-1">
      <span class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">Shipped To (Delivery)</span>
      <div class="font-extrabold text-sm text-slate-900">${escHtml(invoiceState.client.name || '')}</div>
      <div class="text-slate-600 whitespace-pre-line leading-relaxed text-[11.5px]">${escHtml(invoiceState.client.shippingAddress)}</div>
    </div>
  `;
}

/* ── Template 1: Modern SaaS (Default) ──────────────────────────────────── */
function generateModernTemplate(totals, accent) {
  const logoHtml = generateLogoHtml('light');

  const hasShipTo = !!(invoiceState.client.shippingAddress && invoiceState.client.shippingAddress.trim());

  return `
    <!-- TOP BRANDING HEADER -->
    <div class="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6 border-b-2 border-slate-100">
      <div class="space-y-1.5">
        ${logoHtml}
        <h2 class="text-2xl font-extrabold tracking-tight" style="color: ${accent}">${escHtml(invoiceState.business.name || 'Your Company')}</h2>
        <div class="text-slate-500 whitespace-pre-line leading-relaxed text-xs">${escHtml(invoiceState.business.address || '')}</div>
        ${invoiceState.business.taxId ? `<div class="text-[11px] font-bold text-slate-600">Tax ID: ${escHtml(invoiceState.business.taxId)}</div>` : ''}
        ${invoiceState.business.email ? `<div class="text-[11px] text-slate-500">${escHtml(invoiceState.business.email)} ${invoiceState.business.phone ? '• ' + escHtml(invoiceState.business.phone) : ''}</div>` : ''}
      </div>

      <div class="sm:text-right space-y-2">
        <div class="flex items-center sm:justify-end gap-2">
          <span class="inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider text-white shadow-sm" style="background-color: ${accent}">
            INVOICE
          </span>
          ${generateStatusBadgeHtml()}
        </div>
        <div class="text-2xl font-extrabold text-slate-900 tracking-tight font-mono">${escHtml(invoiceState.invoice.number || 'INV-001')}</div>
        <div class="text-xs text-slate-500 font-medium">Issue Date: <strong class="text-slate-800">${formatDate(invoiceState.invoice.date)}</strong></div>
      </div>
    </div>

    <!-- METADATA SCHEDULE BAR -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 my-6 text-xs shadow-sm">
      <div class="space-y-0.5">
        <span class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Invoice Number</span>
        <span class="font-mono font-extrabold text-slate-900 text-sm">${escHtml(invoiceState.invoice.number || 'INV-001')}</span>
      </div>
      <div class="space-y-0.5">
        <span class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Date of Issue</span>
        <span class="font-bold text-slate-800">${formatDate(invoiceState.invoice.date)}</span>
      </div>
      <div class="space-y-0.5">
        <span class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Payment Due Date</span>
        <span class="font-extrabold text-slate-900">${formatDate(invoiceState.invoice.dueDate)}</span>
      </div>
      <div class="space-y-0.5">
        <span class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Credit Terms / PO</span>
        <span class="font-bold text-slate-800">${escHtml(invoiceState.invoice.paymentTerms || 'Net 30')} ${invoiceState.invoice.poNumber ? `(${escHtml(invoiceState.invoice.poNumber)})` : ''}</span>
      </div>
    </div>

    <!-- CLIENT BILL TO & SHIP TO DUAL CARDS -->
    <div class="grid grid-cols-1 ${hasShipTo ? 'sm:grid-cols-2' : 'sm:grid-cols-2'} gap-4 mb-6 text-xs">
      <div class="p-4 rounded-2xl bg-slate-50/50 border border-slate-200/70 space-y-1">
        <span class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">Billed To (Invoice Recipient)</span>
        <div class="font-extrabold text-sm text-slate-900">${escHtml(invoiceState.client.name || 'Valued Client')}</div>
        ${invoiceState.client.company ? `<div class="font-bold text-slate-700">${escHtml(invoiceState.client.company)}</div>` : ''}
        <div class="text-slate-500 whitespace-pre-line leading-relaxed text-[11.5px]">${escHtml(invoiceState.client.address || '')}</div>
        ${invoiceState.client.taxId ? `<div class="text-[11px] text-slate-600 font-semibold">VAT/Tax ID: ${escHtml(invoiceState.client.taxId)}</div>` : ''}
        ${invoiceState.client.email ? `<div class="text-[11px] text-slate-500">${escHtml(invoiceState.client.email)}</div>` : ''}
      </div>

      ${hasShipTo ? generateShipToHtml() : `
        <div class="p-4 rounded-2xl bg-slate-50/50 border border-slate-200/70 space-y-1">
          <span class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">Payment Terms</span>
          <div class="font-bold text-sm text-slate-900">${escHtml(invoiceState.invoice.paymentTerms || 'Net 30')}</div>
          <div class="text-slate-500 text-[11.5px]">Due: ${formatDate(invoiceState.invoice.dueDate)}</div>
          ${invoiceState.payment.bankName ? `<div class="text-[11px] text-slate-600">Bank: ${escHtml(invoiceState.payment.bankName)}</div>` : ''}
        </div>
      `}
    </div>

    <!-- ITEMIZATION TABLE -->
    ${generateTableHtml(accent, 'modern')}

    <!-- BALANCED CARDS: PAYMENT ON LEFT, TOTALS ON RIGHT -->
    <div class="invoice-bottom-grid">
      ${generatePaymentAndSignatureHtml(accent, 'modern')}
      ${generateTotalsHtml(totals, accent, 'modern')}
    </div>

    <!-- FULL-WIDTH NOTES & TERMS -->
    ${generateFullWidthNotesHtml('modern')}
  `;
}

/* ── Template 2: Corporate ──────────────────────────────────────────────── */
function generateCorporateTemplate(totals, accent) {
  const logoHtml = generateLogoHtml('light');

  return `
    <div class="border-b-2 border-slate-900 pb-6 mb-6">
      <div class="flex justify-between items-start">
        <div>
          ${logoHtml}
          <h1 class="text-2xl font-bold tracking-tight text-slate-900 uppercase">${escHtml(invoiceState.business.name || 'Your Company')}</h1>
          <p class="text-slate-600 whitespace-pre-line text-xs mt-1 leading-normal">${escHtml(invoiceState.business.address || '')}</p>
          <p class="text-slate-500 text-xs">${escHtml(invoiceState.business.email || '')} ${invoiceState.business.phone ? '• ' + escHtml(invoiceState.business.phone) : ''}</p>
        </div>
        <div class="text-right">
          <div class="flex items-center justify-end gap-2 mb-1">
            <div class="text-3xl font-extrabold text-slate-900 tracking-wider">INVOICE</div>
            ${generateStatusBadgeHtml()}
          </div>
          <table class="mt-3 text-xs text-left ml-auto border border-slate-300">
            <tr><th class="p-1.5 bg-slate-100 font-bold border-r border-slate-300">Invoice #</th><td class="p-1.5 font-bold">${escHtml(invoiceState.invoice.number)}</td></tr>
            <tr><th class="p-1.5 bg-slate-100 font-bold border-r border-slate-300">Date</th><td class="p-1.5">${formatDate(invoiceState.invoice.date)}</td></tr>
            <tr><th class="p-1.5 bg-slate-100 font-bold border-r border-slate-300">Due Date</th><td class="p-1.5 font-bold">${formatDate(invoiceState.invoice.dueDate)}</td></tr>
            ${invoiceState.invoice.poNumber ? `<tr><th class="p-1.5 bg-slate-100 font-bold border-r border-slate-300">PO #</th><td class="p-1.5">${escHtml(invoiceState.invoice.poNumber)}</td></tr>` : ''}
          </table>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4 mb-6 text-xs">
      <div class="p-4 border border-slate-300 bg-slate-50/50">
        <div class="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1">Invoice Recipient (Bill To):</div>
        <div class="font-bold text-slate-900">${escHtml(invoiceState.client.name)}</div>
        ${invoiceState.client.company ? `<div class="font-semibold">${escHtml(invoiceState.client.company)}</div>` : ''}
        <div class="text-slate-600 whitespace-pre-line leading-relaxed">${escHtml(invoiceState.client.address)}</div>
        ${invoiceState.client.taxId ? `<div class="mt-1 text-slate-500">VAT/Tax ID: ${escHtml(invoiceState.client.taxId)}</div>` : ''}
      </div>
      <div class="p-4 border border-slate-300 bg-slate-50/50 flex flex-col justify-between">
        <div>
          <div class="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1">Remittance & Terms:</div>
          <div>Payment Terms: <span class="font-bold">${escHtml(invoiceState.invoice.paymentTerms || 'Net 30')}</span></div>
          ${invoiceState.payment.bankName ? `<div>Bank: <span class="font-bold">${escHtml(invoiceState.payment.bankName)}</span></div>` : ''}
          ${invoiceState.payment.accountNumber ? `<div>Account: <span class="font-mono">${escHtml(invoiceState.payment.accountNumber)}</span></div>` : ''}
        </div>
        <div class="text-[11px] text-slate-500">All transactions governed by commercial trade terms.</div>
      </div>
    </div>

    ${generateTableHtml(accent, 'corporate')}

    <div class="invoice-bottom-grid">
      ${generatePaymentAndSignatureHtml(accent, 'corporate')}
      ${generateTotalsHtml(totals, accent, 'corporate')}
    </div>

    ${generateFullWidthNotesHtml('corporate')}
  `;
}

/* ── Template 3: Creative Studio ────────────────────────────────────────── */
function generateCreativeTemplate(totals, accent) {
  const logoHtml = generateLogoHtml('dark');

  return `
    <div class="p-6 rounded-2xl mb-6 text-white" style="background-color: ${accent}">
      <div class="flex justify-between items-center">
        <div>
          ${logoHtml}
          <div class="text-xs uppercase font-bold tracking-widest opacity-80">CREATIVE STUDIO INVOICE</div>
          <div class="text-3xl font-black tracking-tight mt-1">${escHtml(invoiceState.business.name || 'Creative Studio')}</div>
          <div class="text-xs opacity-90 mt-1">${escHtml(invoiceState.business.website || '')}</div>
        </div>
        <div class="text-right">
          <div class="text-3xl font-mono font-bold">${escHtml(invoiceState.invoice.number)}</div>
          <div class="text-xs opacity-90 mt-1">Due: ${formatDate(invoiceState.invoice.dueDate)}</div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4 pb-4 mb-6 border-b border-slate-200 text-xs">
      <div>
        <span class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Created For:</span>
        <div class="text-base font-bold text-slate-900 mt-1">${escHtml(invoiceState.client.name)}</div>
        <div class="font-semibold text-slate-700">${escHtml(invoiceState.client.company || '')}</div>
        <div class="text-slate-500 whitespace-pre-line mt-1">${escHtml(invoiceState.client.address || '')}</div>
      </div>
      <div class="text-right">
        <span class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Project Terms:</span>
        <div class="font-bold text-slate-800 mt-1">${escHtml(invoiceState.invoice.paymentTerms || 'Net 30')}</div>
        <div class="text-slate-500 mt-1">PO: ${escHtml(invoiceState.invoice.poNumber || 'None')}</div>
      </div>
    </div>

    ${generateTableHtml(accent, 'creative')}

    <div class="invoice-bottom-grid">
      ${generatePaymentAndSignatureHtml(accent, 'creative')}
      ${generateTotalsHtml(totals, accent, 'creative')}
    </div>

    ${generateFullWidthNotesHtml('creative')}
  `;
}

/* ── Template 4: Monochrome ────────────────────────────────────────────── */
function generateMonochromeTemplate(totals) {
  const logoHtml = generateLogoHtml('monochrome');

  return `
    <div class="border-b-4 border-black pb-4 mb-6 flex justify-between items-end">
      <div>
        ${logoHtml}
        <div class="text-3xl font-black tracking-tighter uppercase">${escHtml(invoiceState.business.name || 'Company')}</div>
        <div class="text-xs font-mono text-neutral-600 mt-1">${escHtml(invoiceState.business.email || '')}</div>
      </div>
      <div class="text-right font-mono">
        <div class="text-xl font-bold uppercase">INVOICE</div>
        <div class="text-sm font-bold text-neutral-800">${escHtml(invoiceState.invoice.number)}</div>
        <div class="text-xs text-neutral-500">${formatDate(invoiceState.invoice.date)}</div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-6 pb-4 mb-6 border-b border-black text-xs font-mono">
      <div>
        <span class="uppercase font-bold tracking-widest text-neutral-400 block mb-1">CLIENT</span>
        <div class="font-bold text-sm text-black">${escHtml(invoiceState.client.name)}</div>
        <div class="text-neutral-700">${escHtml(invoiceState.client.company || '')}</div>
        <div class="text-neutral-600 whitespace-pre-line mt-1">${escHtml(invoiceState.client.address || '')}</div>
      </div>
      <div class="text-right">
        <span class="uppercase font-bold tracking-widest text-neutral-400 block mb-1">SETTLEMENT</span>
        <div>Terms: <strong class="text-black">${escHtml(invoiceState.invoice.paymentTerms || 'Due on Receipt')}</strong></div>
        <div>Due: <strong class="text-black">${formatDate(invoiceState.invoice.dueDate)}</strong></div>
      </div>
    </div>

    ${generateTableHtml('#000000', 'monochrome')}

    <div class="invoice-bottom-grid">
      ${generatePaymentAndSignatureHtml('#000000', 'monochrome')}
      ${generateTotalsHtml(totals, '#000000', 'monochrome')}
    </div>

    ${generateFullWidthNotesHtml('monochrome')}
  `;
}

/* ── Template 5: Emerald ────────────────────────────────────────────────── */
function generateEmeraldTemplate(totals) {
  const accent = '#10B981';
  const logoHtml = generateLogoHtml('light');

  return `
    <div class="flex justify-between items-start pb-6 mb-6 border-b-2 border-emerald-500">
      <div>
        ${logoHtml}
        <h1 class="text-2xl font-extrabold text-emerald-800 tracking-tight">${escHtml(invoiceState.business.name || 'Company')}</h1>
        <p class="text-xs text-emerald-600 font-medium">${escHtml(invoiceState.business.website || '')}</p>
        <p class="text-xs text-slate-500 whitespace-pre-line mt-1">${escHtml(invoiceState.business.address || '')}</p>
      </div>
      <div class="text-right">
        <span class="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full text-xs uppercase mb-1">INVOICE</span>
        <div class="text-2xl font-bold font-mono text-slate-900">${escHtml(invoiceState.invoice.number)}</div>
        <div class="text-xs text-slate-500">Due: <strong>${formatDate(invoiceState.invoice.dueDate)}</strong></div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4 pb-4 mb-6 border-b border-emerald-100 text-xs">
      <div class="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
        <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Client / Bill To</span>
        <div class="font-bold text-slate-900 text-sm mt-0.5">${escHtml(invoiceState.client.name)}</div>
        <div class="text-slate-600">${escHtml(invoiceState.client.company || '')}</div>
        <div class="text-slate-500 whitespace-pre-line mt-1">${escHtml(invoiceState.client.address || '')}</div>
      </div>
      <div class="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-right">
        <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Arrangement</span>
        <div class="font-bold text-slate-900 text-sm mt-0.5">${escHtml(invoiceState.invoice.paymentTerms || 'Net 30')}</div>
        <div class="text-slate-500 mt-1">PO: ${escHtml(invoiceState.invoice.poNumber || 'None')}</div>
      </div>
    </div>

    ${generateTableHtml(accent, 'emerald')}

    <div class="invoice-bottom-grid">
      ${generatePaymentAndSignatureHtml(accent, 'emerald')}
      ${generateTotalsHtml(totals, accent, 'emerald')}
    </div>

    ${generateFullWidthNotesHtml('emerald')}
  `;
}

/* ── Template 6: Minimalist ─────────────────────────────────────────────── */
function generateMinimalistTemplate(totals, accent) {
  const logoHtml = generateLogoHtml('light');

  return `
    <div class="flex justify-between items-baseline pb-8 mb-6 border-b border-slate-200">
      <div>
        ${logoHtml}
        <div class="text-xl font-bold tracking-tight text-slate-900">${escHtml(invoiceState.business.name || 'Studio')}</div>
        <div class="text-xs text-slate-400 mt-1">${escHtml(invoiceState.business.email || '')}</div>
      </div>
      <div class="text-right">
        <div class="text-xs font-mono uppercase tracking-widest text-slate-400">Invoice</div>
        <div class="text-lg font-mono font-bold text-slate-900">${escHtml(invoiceState.invoice.number)}</div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-6 pb-6 mb-6 text-xs text-slate-600">
      <div>
        <div class="text-[10px] uppercase tracking-widest text-slate-400 mb-1">To:</div>
        <div class="font-bold text-slate-900">${escHtml(invoiceState.client.name)}</div>
        <div>${escHtml(invoiceState.client.company || '')}</div>
        <div class="text-slate-500 whitespace-pre-line mt-1">${escHtml(invoiceState.client.address || '')}</div>
      </div>
      <div class="text-right">
        <div class="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Terms:</div>
        <div class="font-bold text-slate-900">${escHtml(invoiceState.invoice.paymentTerms || 'Net 30')}</div>
        <div class="text-slate-500 mt-1">Due: ${formatDate(invoiceState.invoice.dueDate)}</div>
      </div>
    </div>

    ${generateTableHtml(accent, 'minimalist')}

    <div class="invoice-bottom-grid">
      ${generatePaymentAndSignatureHtml(accent, 'minimalist')}
      ${generateTotalsHtml(totals, accent, 'minimalist')}
    </div>

    ${generateFullWidthNotesHtml('minimalist')}
  `;
}

/* ── Template 7: FinTech Elite ──────────────────────────────────────────── */
function generateFintechTemplate(totals, accent) {
  const logoHtml = generateLogoHtml('dark');

  return `
    <div class="p-6 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white mb-6 shadow-md">
      <div class="flex justify-between items-center">
        <div>
          ${logoHtml}
          <div class="text-[10px] font-mono tracking-widest uppercase text-blue-300">INSTITUTIONAL SETTLEMENT</div>
          <div class="text-2xl font-bold tracking-tight mt-0.5">${escHtml(invoiceState.business.name || 'FinTech Platform')}</div>
          <div class="text-xs text-blue-200 mt-1 font-mono">${escHtml(invoiceState.business.taxId ? 'ID: ' + invoiceState.business.taxId : '')}</div>
        </div>
        <div class="text-right">
          <span class="inline-block px-2.5 py-1 bg-blue-500/30 border border-blue-400/40 text-blue-200 text-xs font-mono font-bold rounded-lg mb-1">
            ${escHtml(invoiceState.invoice.number)}
          </span>
          <div class="text-xs text-blue-200">Due: <strong class="text-white">${formatDate(invoiceState.invoice.dueDate)}</strong></div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4 pb-4 mb-6 border-b border-slate-200 text-xs font-mono">
      <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
        <span class="text-[10px] font-bold text-slate-400 uppercase">Counterparty Recipient</span>
        <div class="font-bold text-slate-900 text-sm mt-0.5">${escHtml(invoiceState.client.name)}</div>
        <div class="text-slate-600">${escHtml(invoiceState.client.company || '')}</div>
        <div class="text-slate-500 whitespace-pre-line mt-1">${escHtml(invoiceState.client.address || '')}</div>
      </div>
      <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-right">
        <span class="text-[10px] font-bold text-slate-400 uppercase">Settlement Protocol</span>
        <div class="font-bold text-slate-900 text-sm mt-0.5">${escHtml(invoiceState.invoice.paymentTerms || 'Immediate')}</div>
        <div class="text-slate-500 mt-1">Ref PO: ${escHtml(invoiceState.invoice.poNumber || 'None')}</div>
      </div>
    </div>

    ${generateTableHtml(accent, 'fintech')}

    <div class="invoice-bottom-grid">
      ${generatePaymentAndSignatureHtml(accent, 'fintech')}
      ${generateTotalsHtml(totals, accent, 'fintech')}
    </div>

    ${generateFullWidthNotesHtml('fintech')}
  `;
}

/* ── Template 8: Luxury Gold ────────────────────────────────────────────── */
function generateLuxuryTemplate(totals) {
  const accent = '#d97706'; // Gold
  const logoHtml = generateLogoHtml('luxury');

  return `
    <div class="border-b border-amber-300 pb-6 mb-6">
      <div class="flex justify-between items-start">
        <div>
          ${logoHtml}
          <div class="text-[10px] font-serif tracking-widest uppercase text-amber-800">ATELIER &amp; MAISON</div>
          <h1 class="text-2xl font-serif font-bold text-stone-900 tracking-wide mt-1">${escHtml(invoiceState.business.name || 'Luxury House')}</h1>
          <p class="text-xs text-stone-600 whitespace-pre-line mt-1 font-light leading-relaxed">${escHtml(invoiceState.business.address || '')}</p>
        </div>
        <div class="text-right">
          <div class="text-xs font-serif uppercase tracking-widest text-amber-800">Statement of Fees</div>
          <div class="text-2xl font-serif font-bold text-stone-900 mt-0.5">${escHtml(invoiceState.invoice.number)}</div>
          <div class="text-xs text-stone-700 font-medium">Due Date: <strong>${formatDate(invoiceState.invoice.dueDate)}</strong></div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4 pb-4 mb-6 border-b border-stone-200 text-xs">
      <div>
        <span class="text-[10px] font-bold uppercase tracking-widest text-amber-800">Invoiced Recipient</span>
        <div class="font-serif font-bold text-stone-900 text-base mt-1">${escHtml(invoiceState.client.name)}</div>
        <div class="font-medium text-stone-700">${escHtml(invoiceState.client.company || '')}</div>
        <div class="text-stone-500 whitespace-pre-line mt-1">${escHtml(invoiceState.client.address || '')}</div>
      </div>
      <div class="text-right">
        <span class="text-[10px] font-bold uppercase tracking-widest text-amber-800">Arrangement</span>
        <div class="font-bold text-stone-800 mt-1">${escHtml(invoiceState.invoice.paymentTerms || 'Discretionary')}</div>
        ${invoiceState.invoice.poNumber ? `<div class="text-stone-500 mt-1">Ref PO: ${escHtml(invoiceState.invoice.poNumber)}</div>` : ''}
      </div>
    </div>

    ${generateTableHtml(accent, 'luxury')}

    <div class="invoice-bottom-grid">
      ${generatePaymentAndSignatureHtml(accent, 'luxury')}
      ${generateTotalsHtml(totals, accent, 'luxury')}
    </div>

    ${generateFullWidthNotesHtml('luxury')}
  `;
}

/* ── Item Table HTML Generator ──────────────────────────────────────────── */
function generateTableHtml(accent, tpl) {
  const isStriped = invoiceState.styling.tableStyle === 'striped';
  const isBordered = invoiceState.styling.tableStyle === 'bordered';

  const rows = invoiceState.items.map((item, idx) => {
    const qty = item.qty || 0;
    const price = item.unitPrice !== undefined ? item.unitPrice : (item.price || 0);
    const base = qty * price;
    let disc = 0;
    if (item.discountValue > 0) {
      disc = item.discountType === 'percent' ? base * (item.discountValue / 100) : item.discountValue;
    }
    const net = Math.max(0, base - disc);
    const tax = item.taxRate > 0 ? net * (item.taxRate / 100) : 0;
    const lineTotal = net + tax;

    const bgClass = (isStriped && idx % 2 === 1) ? 'bg-slate-50/80' : 'bg-white';
    const borderClass = isBordered ? 'border border-slate-200' : 'border-b border-slate-100';

    return `
      <tr class="${bgClass} ${borderClass} invoice-avoid-break">
        <td class="p-3 text-slate-500 text-center font-mono w-10 whitespace-nowrap">${idx + 1}</td>
        <td class="p-3 text-slate-800 font-medium">
          <div>${escHtml(item.desc || '')}</div>
          ${disc > 0 ? `<div class="text-[10px] text-rose-500 font-normal">Discount: -${formatMoney(disc)}</div>` : ''}
        </td>
        <td class="p-3 text-center text-slate-600 font-mono whitespace-nowrap">${qty}</td>
        <td class="p-3 text-right text-slate-600 font-mono whitespace-nowrap">${formatMoney(price)}</td>
        <td class="p-3 text-right font-bold text-slate-900 font-mono whitespace-nowrap">${formatMoney(lineTotal)}</td>
      </tr>
    `;
  }).join('');

  let theadStyle = `background-color: ${accent}; color: #ffffff;`;
  if (tpl === 'monochrome') theadStyle = `background-color: #000000; color: #ffffff;`;
  if (tpl === 'minimalist') theadStyle = `background-color: transparent; color: #0f172a; border-bottom: 2px solid #0f172a;`;
  if (tpl === 'fintech' || tpl === 'tech') theadStyle = `background-color: #1e40af; color: #ffffff; border-bottom: 2px solid #1d4ed8;`;
  if (tpl === 'luxury') theadStyle = `background: linear-gradient(135deg, #1c1917 0%, #292524 100%); color: #f59e0b; border-bottom: 2px solid #d97706;`;

  return `
    <div class="overflow-x-auto rounded-xl ${isBordered ? 'border border-slate-200' : ''} mb-6">
      <table class="w-full text-left text-xs border-collapse table-fixed">
        <thead>
          <tr style="${theadStyle}">
            <th class="p-3 font-bold uppercase tracking-wider text-[10px] w-[8%] text-center whitespace-nowrap">#</th>
            <th class="p-3 font-bold uppercase tracking-wider text-[10px] w-[46%]">Description</th>
            <th class="p-3 font-bold uppercase tracking-wider text-[10px] w-[12%] text-center whitespace-nowrap">Qty</th>
            <th class="p-3 font-bold uppercase tracking-wider text-[10px] w-[17%] text-right whitespace-nowrap">Price</th>
            <th class="p-3 font-bold uppercase tracking-wider text-[10px] w-[17%] text-right whitespace-nowrap">Total</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

/* ── Payment & Signature Card (Left Column) ─────────────────────────────── */
function generatePaymentAndSignatureHtml(accent, tpl) {
  const isDarkCard = tpl === 'luxury';
  const cardBg = isDarkCard 
    ? 'border border-amber-200/90 bg-amber-50/40 text-stone-900' 
    : (tpl === 'fintech' 
        ? 'border border-blue-200/80 bg-blue-50/30 text-slate-800' 
        : 'border border-slate-200 bg-slate-50/70 text-slate-800');

  const bankName = invoiceState.payment.bankName;
  const accNum = invoiceState.payment.accountNumber;
  const routing = invoiceState.payment.routingNumber;
  const swift = invoiceState.payment.swiftIban;

  return `
    <div class="invoice-notes-block">
      <div class="invoice-payment-card ${cardBg}">
        <div class="space-y-2 text-xs">
          <div class="flex items-center justify-between border-b border-slate-200/80 pb-2 mb-2">
            <span class="font-extrabold uppercase tracking-wider text-[10px]" style="color: ${accent}">Payment Remittance</span>
            <span class="text-[10px] font-bold text-slate-400">Direct Settlement</span>
          </div>
          ${bankName ? `<div class="font-extrabold text-sm text-slate-900">${escHtml(bankName)}</div>` : '<div class="text-slate-400 italic">No bank details specified</div>'}
          ${accNum ? `<div class="flex items-center justify-between text-[11px]"><span class="text-slate-500 font-medium">Account / IBAN:</span> <span class="font-mono font-bold text-slate-900">${escHtml(accNum)}</span></div>` : ''}
          ${routing ? `<div class="flex items-center justify-between text-[11px]"><span class="text-slate-500 font-medium">Routing / IFSC:</span> <span class="font-mono text-slate-700 font-semibold">${escHtml(routing)}</span></div>` : ''}
          ${swift ? `<div class="flex items-center justify-between text-[11px]"><span class="text-slate-500 font-medium">SWIFT / BIC / ID:</span> <span class="font-mono text-slate-700 font-semibold">${escHtml(swift)}</span></div>` : ''}
        </div>

        <div class="pt-3 border-t border-slate-200/70 mt-3">
          ${generateSignatureHtml()}
        </div>
      </div>
    </div>
  `;
}

/* ── Totals Card (Right Column) ─────────────────────────────────────────── */
function generateTotalsHtml(totals, accent, tpl) {
  const isDarkCard = tpl === 'luxury';
  const cardBg = isDarkCard 
    ? 'border border-amber-200/90 bg-amber-50/40 text-stone-900' 
    : (tpl === 'fintech' 
        ? 'border border-blue-200/80 bg-blue-50/30 text-slate-800' 
        : 'border border-slate-200 bg-slate-50/70 text-slate-800');

  return `
    <div class="invoice-totals-block">
      <div class="invoice-totals-card ${cardBg}">
        <div class="space-y-2 text-xs">
          <div class="flex items-center justify-between border-b border-slate-200/80 pb-2 mb-1">
            <span class="font-extrabold uppercase tracking-wider text-[10px] text-slate-500">Summary &amp; Breakdown</span>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">${escHtml(invoiceState.currency.code || 'USD')}</span>
          </div>

          <div class="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span class="font-bold text-slate-800 font-mono">${formatMoney(totals.subtotal)}</span>
          </div>

          ${invoiceState.discount.enabled && totals.discountAmt > 0 ? `
            <div class="flex justify-between text-rose-600 font-medium">
              <span>Discount ${invoiceState.discount.type === 'percent' ? `(${invoiceState.discount.value}%)` : ''}</span>
              <span class="font-mono">-${formatMoney(totals.discountAmt)}</span>
            </div>
          ` : ''}

          ${invoiceState.tax.enabled && totals.taxAmt > 0 ? `
            <div class="flex justify-between text-slate-600">
              <span>${escHtml(invoiceState.tax.label || 'Tax')} (${invoiceState.tax.rate}%)${invoiceState.tax.inclusive ? ' (incl.)' : ''}</span>
              <span class="font-bold text-slate-800 font-mono">${formatMoney(totals.taxAmt)}</span>
            </div>
          ` : ''}

          ${invoiceState.tax.secondaryEnabled && totals.secTaxAmt > 0 ? `
            <div class="flex justify-between text-slate-600">
              <span>${escHtml(invoiceState.tax.secondaryLabel || 'Tax 2')} (${invoiceState.tax.secondaryRate}%)</span>
              <span class="font-bold text-slate-800 font-mono">${formatMoney(totals.secTaxAmt)}</span>
            </div>
          ` : ''}

          ${invoiceState.shipping.enabled && totals.shippingAmt > 0 ? `
            <div class="flex justify-between text-slate-600">
              <span>Shipping &amp; Handling</span>
              <span class="font-bold text-slate-800 font-mono">${formatMoney(totals.shippingAmt)}</span>
            </div>
          ` : ''}

          ${invoiceState.extraFee && invoiceState.extraFee.enabled && totals.extraFeeAmt > 0 ? `
            <div class="flex justify-between text-slate-600">
              <span>${escHtml(invoiceState.extraFee.label || 'Extra Fee')}</span>
              <span class="font-bold text-slate-800 font-mono">${formatMoney(totals.extraFeeAmt)}</span>
            </div>
          ` : ''}
        </div>

        <div class="flex justify-between items-center pt-3 border-t-2 border-slate-300 mt-3">
          <div>
            <div class="font-extrabold text-xs uppercase tracking-wider text-slate-900">Grand Total</div>
            <div class="text-[10px] text-slate-500">Invoice payable amount</div>
          </div>
          <span class="font-extrabold text-xl tracking-tight font-mono" style="color: ${accent}">${formatMoney(totals.grandTotal)}</span>
        </div>

        ${totals.amountPaid > 0 ? `
          <div class="pt-2 border-t border-slate-200/80 mt-2 space-y-1">
            <div class="flex justify-between text-emerald-600 text-xs font-semibold">
              <span>Amount Paid</span>
              <span class="font-mono">-${formatMoney(totals.amountPaid)}</span>
            </div>
            <div class="flex justify-between text-slate-900 font-extrabold text-sm pt-1 border-t border-slate-200">
              <span>Balance Due</span>
              <span class="font-mono text-rose-600">${formatMoney(totals.balanceDue)}</span>
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

/* ── Full-Width Notes & Terms ───────────────────────────────────────────── */
function generateFullWidthNotesHtml(tpl) {
  if (!invoiceState.payment.notes && !invoiceState.payment.terms) return '';

  const isLuxury = tpl === 'luxury';
  const boxBg = isLuxury ? 'border border-amber-200/70 bg-amber-50/30' : 'border border-slate-200/80 bg-slate-50/60';

  return `
    <div class="invoice-fullwidth-section invoice-avoid-break">
      ${invoiceState.payment.notes ? `
        <div class="invoice-fullwidth-box ${boxBg}">
          <div class="font-extrabold uppercase tracking-wider text-[10px] text-slate-500 mb-1">Note to Client</div>
          <p class="text-slate-700 text-xs leading-relaxed whitespace-pre-line">${escHtml(invoiceState.payment.notes)}</p>
        </div>
      ` : ''}
      ${invoiceState.payment.terms ? `
        <div class="invoice-fullwidth-box ${boxBg}">
          <div class="font-extrabold uppercase tracking-wider text-[10px] text-slate-500 mb-1">Terms &amp; Conditions</div>
          <p class="text-slate-600 text-xs leading-relaxed whitespace-pre-line">${escHtml(invoiceState.payment.terms)}</p>
        </div>
      ` : ''}
    </div>
  `;
}

function generateStatusBadgeHtml() {
  const status = (invoiceState.invoice.status || 'draft').toLowerCase();
  if (status === 'paid') {
    return `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm"><span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> PAID</span>`;
  } else if (status === 'pending') {
    return `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300 shadow-sm"><span class="w-1.5 h-1.5 rounded-full bg-amber-600"></span> PENDING</span>`;
  } else if (status === 'overdue') {
    return `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300 shadow-sm"><span class="w-1.5 h-1.5 rounded-full bg-rose-600"></span> OVERDUE</span>`;
  } else {
    return `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-300 shadow-sm"><span class="w-1.5 h-1.5 rounded-full bg-slate-500"></span> DRAFT</span>`;
  }
}

function generateSignatureHtml() {
  if (!invoiceState.payment.signature || !invoiceState.payment.signature.enabled) return '';
  const isCursive = invoiceState.payment.signature.cursive !== false;
  const signerName = escHtml(invoiceState.payment.signature.name || 'Authorized Signer');
  const signerTitle = escHtml(invoiceState.payment.signature.title || 'Authorized Signature');

  return `
    <div class="pt-2 text-left invoice-avoid-break">
      <div class="inline-block border-t-2 border-slate-400 pt-1 pr-6 min-w-[220px]">
        ${isCursive ? `<div class="signature-cursive-text">${signerName}</div>` : ''}
        <div class="font-bold text-slate-900 text-xs mt-0.5">${signerName}</div>
        <div class="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">${signerTitle}</div>
      </div>
    </div>
  `;
}

/* ── Vector Multi-Page PDF Engine (via jsPDF & autoTable) ────────────────── */
function exportToPDF() {
  const { jsPDF } = window.jspdf || {};
  if (!jsPDF) {
    showToast('PDF generator engine is initializing. Please try again in a moment.', 'error');
    return;
  }

  showToast('Compiling high-precision vector PDF document...');

  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const marginLeft = 14;
    const marginRight = 14;
    const contentWidth = pageWidth - marginLeft - marginRight; // 182mm

    const accentHex = invoiceState.styling.accentColor || '#6366F1';
    const accentRgb = hexToRgb(accentHex);

    let currentY = 16;

    // 1. HEADER (Logo on Top-Left, Business Info below it, Invoice Title & Meta on Right)
    const logo = invoiceState.business.logo;
    let bizY = currentY;

    if (logo) {
      try {
        const logoFormat = logo.startsWith('data:image/png') ? 'PNG' : 'JPEG';
        // Auto-proportional logo sizing: Max width 28mm, Max height 10mm (small and professional in top-left corner)
        let maxLogoW = 28;
        let maxLogoH = 10;
        let logoW = maxLogoW;
        let logoH = maxLogoH;

        if (invoiceState.business.logoAspect) {
          const aspect = invoiceState.business.logoAspect;
          if (aspect > (maxLogoW / maxLogoH)) {
            logoW = maxLogoW;
            logoH = Math.round((maxLogoW / aspect) * 10) / 10;
          } else {
            logoH = maxLogoH;
            logoW = Math.round((maxLogoH * aspect) * 10) / 10;
          }
        }

        doc.addImage(logo, logoFormat, marginLeft, currentY, logoW, logoH, undefined, 'FAST');
        bizY = currentY + logoH + 2.5;
      } catch (e) {
        console.warn('Could not embed logo in PDF:', e);
      }
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(accentRgb[0], accentRgb[1], accentRgb[2]);
    doc.text(invoiceState.business.name || 'Your Company', marginLeft, bizY + 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    bizY += 8;
    if (invoiceState.business.address) {
      const addrLines = doc.splitTextToSize(invoiceState.business.address, 75);
      doc.text(addrLines, marginLeft, bizY);
      bizY += (addrLines.length * 3.5);
    }
    if (invoiceState.business.email || invoiceState.business.phone) {
      const contact = [invoiceState.business.email, invoiceState.business.phone].filter(Boolean).join(' • ');
      doc.text(contact, marginLeft, bizY);
      bizY += 3.5;
    }
    if (invoiceState.business.taxId) {
      doc.text(`Tax ID: ${invoiceState.business.taxId}`, marginLeft, bizY);
      bizY += 3.5;
    }

    // Invoice Meta on Right Side
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(30, 41, 59);
    doc.text('INVOICE', pageWidth - marginRight, currentY + 5, { align: 'right' });

    doc.setFontSize(10);
    doc.setTextColor(accentRgb[0], accentRgb[1], accentRgb[2]);
    doc.text(invoiceState.invoice.number || 'INV-001', pageWidth - marginRight, currentY + 11, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Issue Date: ${formatDate(invoiceState.invoice.date)}`, pageWidth - marginRight, currentY + 16, { align: 'right' });
    doc.text(`Due Date: ${formatDate(invoiceState.invoice.dueDate)}`, pageWidth - marginRight, currentY + 20, { align: 'right' });
    if (invoiceState.invoice.poNumber) {
      doc.text(`PO Ref: ${invoiceState.invoice.poNumber}`, pageWidth - marginRight, currentY + 24, { align: 'right' });
    }

    // Status Pill
    const status = (invoiceState.invoice.status || 'draft').toUpperCase();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    let pillBg = [241, 245, 249];
    let pillText = [71, 85, 105];
    if (status === 'PAID') { pillBg = [220, 252, 231]; pillText = [22, 101, 52]; }
    else if (status === 'PENDING') { pillBg = [254, 243, 199]; pillText = [146, 64, 14]; }
    else if (status === 'OVERDUE') { pillBg = [254, 226, 226]; pillText = [153, 27, 27]; }

    doc.setFillColor(pillBg[0], pillBg[1], pillBg[2]);
    doc.roundedRect(pageWidth - marginRight - 22, currentY + 27, 22, 5, 1, 1, 'F');
    doc.setTextColor(pillText[0], pillText[1], pillText[2]);
    doc.text(status, pageWidth - marginRight - 11, currentY + 30.5, { align: 'center' });

    currentY = Math.max(bizY + 5, currentY + 36);

    // Accent line divider
    doc.setDrawColor(accentRgb[0], accentRgb[1], accentRgb[2]);
    doc.setLineWidth(0.5);
    doc.line(marginLeft, currentY, pageWidth - marginRight, currentY);
    currentY += 4;

    // 2. CLIENT BILL TO & SHIP TO CARDS
    const hasShipping = !!(invoiceState.client.shippingAddress && invoiceState.client.shippingAddress.trim());
    const colWidth = hasShipping ? (contentWidth - 6) / 2 : contentWidth;

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.roundedRect(marginLeft, currentY, colWidth, 24, 2, 2, 'FD');
    if (hasShipping) {
      doc.roundedRect(marginLeft + colWidth + 6, currentY, colWidth, 24, 2, 2, 'FD');
    }

    // Bill To Content
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(accentRgb[0], accentRgb[1], accentRgb[2]);
    doc.text('BILLED TO (CLIENT)', marginLeft + 4, currentY + 4.5);

    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(invoiceState.client.name || 'Valued Client', marginLeft + 4, currentY + 9);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    let cardY = currentY + 13;
    if (invoiceState.client.company) {
      doc.text(invoiceState.client.company, marginLeft + 4, cardY);
      cardY += 3.5;
    }
    if (invoiceState.client.address) {
      const addr1Line = invoiceState.client.address.split('\n')[0];
      doc.text(addr1Line, marginLeft + 4, cardY);
      cardY += 3.5;
    }
    if (invoiceState.client.taxId || invoiceState.client.email) {
      const clientContact = [invoiceState.client.email, invoiceState.client.taxId ? `VAT: ${invoiceState.client.taxId}` : ''].filter(Boolean).join(' | ');
      doc.text(clientContact, marginLeft + 4, cardY);
    }

    // Ship To Content
    if (hasShipping) {
      const shipX = marginLeft + colWidth + 6;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(accentRgb[0], accentRgb[1], accentRgb[2]);
      doc.text('SHIPPED TO (DELIVERY)', shipX + 4, currentY + 4.5);

      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(invoiceState.client.name || '', shipX + 4, currentY + 9);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      const shipLines = doc.splitTextToSize(invoiceState.client.shippingAddress, colWidth - 8);
      doc.text(shipLines, shipX + 4, currentY + 13);
    }

    currentY += 28;

    // 3. AUTOTABLE FOR LINE ITEMS
    const tableHeaders = [['#', 'Description', 'Qty', 'Unit Price', 'Total']];
    const tableData = invoiceState.items.map((item, idx) => {
      const qty = item.qty || 0;
      const price = item.unitPrice !== undefined ? item.unitPrice : (item.price || 0);
      let base = qty * price;
      let discAmt = 0;
      if (item.discountValue > 0) {
        discAmt = item.discountType === 'percent' ? base * (item.discountValue / 100) : item.discountValue;
      }
      let lineTot = Math.max(0, base - discAmt);
      if (item.taxRate > 0) {
        lineTot += lineTot * (item.taxRate / 100);
      }
      let descText = item.desc || '';
      if (discAmt > 0) {
        descText += ` (Disc: -${formatMoney(discAmt)})`;
      }
      return [
        String(idx + 1),
        descText,
        String(qty),
        formatMoney(price),
        formatMoney(lineTot)
      ];
    });

    doc.autoTable({
      startY: currentY,
      head: tableHeaders,
      body: tableData,
      theme: invoiceState.styling.tableStyle === 'clean' ? 'plain' : 'striped',
      headStyles: {
        fillColor: [accentRgb[0], accentRgb[1], accentRgb[2]],
        textColor: [255, 255, 255],
        font: 'helvetica',
        fontStyle: 'bold',
        fontSize: 8,
        cellPadding: 3
      },
      bodyStyles: {
        textColor: [30, 41, 59],
        fontSize: 8,
        cellPadding: 3,
        overflow: 'linebreak'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 'auto', halign: 'left' },
        2: { cellWidth: 18, halign: 'center' },
        3: { cellWidth: 28, halign: 'right' },
        4: { cellWidth: 32, halign: 'right', fontStyle: 'bold' }
      },
      margin: { left: marginLeft, right: marginRight },
      showHead: 'everyPage', // Repeats table headers on page 2+
      pageBreak: 'auto'      // Never slices rows across pages
    });

    let finalY = doc.lastAutoTable.finalY + 6;

    // Check remaining vertical space for totals and remittance card
    if (pageHeight - finalY < 65) {
      doc.addPage();
      finalY = 18;
    }

    // 4. POST-TABLE: PAYMENT REMITTANCE (LEFT) & TOTALS BREAKDOWN (RIGHT)
    const totals = calculateInvoiceTotals();
    const halfWidth = (contentWidth - 6) / 2;

    // Payment Remittance Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.roundedRect(marginLeft, finalY, halfWidth, 42, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(accentRgb[0], accentRgb[1], accentRgb[2]);
    doc.text('PAYMENT REMITTANCE', marginLeft + 4, finalY + 4.5);

    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(invoiceState.payment.bankName || 'Bank Settlement', marginLeft + 4, finalY + 9.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    let payY = finalY + 14;
    if (invoiceState.payment.accountNumber) {
      doc.text(`Account / IBAN: ${invoiceState.payment.accountNumber}`, marginLeft + 4, payY);
      payY += 4;
    }
    if (invoiceState.payment.routingNumber) {
      doc.text(`Routing / IFSC: ${invoiceState.payment.routingNumber}`, marginLeft + 4, payY);
      payY += 4;
    }
    if (invoiceState.payment.swiftIban) {
      doc.text(`SWIFT / BIC / PayPal: ${invoiceState.payment.swiftIban}`, marginLeft + 4, payY);
      payY += 4;
    }
    doc.text(`Terms: ${invoiceState.invoice.paymentTerms || 'Net 30'}`, marginLeft + 4, payY);

    // Totals Breakdown Box
    const totalsHeight = totals.amountPaid > 0 ? 46 : 42;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.roundedRect(marginLeft + halfWidth + 6, finalY, halfWidth, totalsHeight, 2, 2, 'FD');

    const rX = marginLeft + halfWidth + 6 + 4;
    const rValX = pageWidth - marginRight - 4;

    let tY = finalY + 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);

    // Subtotal
    doc.text('Subtotal:', rX, tY);
    doc.text(formatMoney(totals.subtotal), rValX, tY, { align: 'right' });
    tY += 4;

    // Discount
    if (invoiceState.discount.enabled && totals.discountAmt > 0) {
      doc.setTextColor(225, 29, 72);
      doc.text(`Discount (${invoiceState.discount.value}${invoiceState.discount.type === 'percent' ? '%' : ''}):`, rX, tY);
      doc.text(`-${formatMoney(totals.discountAmt)}`, rValX, tY, { align: 'right' });
      doc.setTextColor(100, 116, 139);
      tY += 4;
    }

    // Primary Tax
    if (invoiceState.tax.enabled && totals.taxAmt > 0) {
      doc.text(`${invoiceState.tax.label || 'Tax'} (${invoiceState.tax.rate}%):`, rX, tY);
      doc.text(formatMoney(totals.taxAmt), rValX, tY, { align: 'right' });
      tY += 4;
    }

    // Secondary Tax
    if (invoiceState.tax.secondaryEnabled && totals.secTaxAmt > 0) {
      doc.text(`${invoiceState.tax.secondaryLabel || 'Tax 2'} (${invoiceState.tax.secondaryRate}%):`, rX, tY);
      doc.text(formatMoney(totals.secTaxAmt), rValX, tY, { align: 'right' });
      tY += 4;
    }

    // Shipping
    if (invoiceState.shipping.enabled && totals.shippingAmt > 0) {
      doc.text('Shipping & Handling:', rX, tY);
      doc.text(formatMoney(totals.shippingAmt), rValX, tY, { align: 'right' });
      tY += 4;
    }

    // Extra Fee
    if (invoiceState.extraFee && invoiceState.extraFee.enabled && totals.extraFeeAmt > 0) {
      doc.text(`${invoiceState.extraFee.label || 'Extra Fee'}:`, rX, tY);
      doc.text(formatMoney(totals.extraFeeAmt), rValX, tY, { align: 'right' });
      tY += 4;
    }

    // Separator line
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.line(marginLeft + halfWidth + 8, tY, pageWidth - marginRight - 4, tY);
    tY += 4;

    // Grand Total
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(accentRgb[0], accentRgb[1], accentRgb[2]);
    doc.text('Grand Total:', rX, tY);
    doc.text(formatMoney(totals.grandTotal), rValX, tY, { align: 'right' });
    tY += 4;

    // Amount Paid & Balance Due
    if (totals.amountPaid > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(16, 185, 129);
      doc.text('Amount Paid:', rX, tY);
      doc.text(`-${formatMoney(totals.amountPaid)}`, rValX, tY, { align: 'right' });
      tY += 4;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(225, 29, 72);
      doc.text('Balance Due:', rX, tY);
      doc.text(formatMoney(totals.balanceDue), rValX, tY, { align: 'right' });
      tY += 4;
    }

    finalY += Math.max(44, totalsHeight + 4);

    // 5. NOTES & SIGNATURE
    if (invoiceState.payment.notes || (invoiceState.payment.signature && invoiceState.payment.signature.enabled)) {
      if (pageHeight - finalY < 30) {
        doc.addPage();
        finalY = 18;
      }

      if (invoiceState.payment.notes) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(accentRgb[0], accentRgb[1], accentRgb[2]);
        doc.text('CLIENT NOTE:', marginLeft, finalY + 4);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        const noteLines = doc.splitTextToSize(invoiceState.payment.notes, contentWidth - 55);
        doc.text(noteLines, marginLeft, finalY + 8);
      }

      if (invoiceState.payment.signature && invoiceState.payment.signature.enabled) {
        const sigX = pageWidth - marginRight - 50;
        doc.setDrawColor(148, 163, 184);
        doc.setLineWidth(0.4);
        doc.line(sigX, finalY + 12, pageWidth - marginRight, finalY + 12);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(15, 23, 42);
        doc.text(invoiceState.payment.signature.name || 'Authorized Signer', sigX, finalY + 16);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(100, 116, 139);
        doc.text(invoiceState.payment.signature.title || 'Authorized Signature', sigX, finalY + 19.5);
      }
    }

    // 6. MULTI-PAGE PAGE NUMBERING LOOP (Page X of Y on all pages)
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);

      // Bottom left notice
      doc.text('Generated via Digital Cron Tools — 100% Client-Side Private Engine', marginLeft, pageHeight - 8);

      // Bottom right: Page X of Y
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - marginRight, pageHeight - 8, { align: 'right' });
    }

    const fileName = `${sanitizeFilename(invoiceState.invoice.number || 'Invoice')}.pdf`;
    doc.save(fileName);
    showToast('Vector PDF successfully generated and downloaded!');
  } catch (err) {
    console.error('Vector PDF generation error:', err);
    showToast('Failed to compile vector PDF. Falling back to print export.', 'error');
    printInvoice();
  }
}

/* ── High-DPI Image Export (PNG / JPG) ──────────────────────────────────── */
function exportToImage(format) {
  const paper = document.getElementById('invoice-printable-area');
  if (!paper || typeof html2canvas === 'undefined') {
    showToast('Image generator engine is initializing. Please try again in a moment.', 'error');
    return;
  }

  showToast(`Generating high-resolution ${format.toUpperCase()} invoice...`);

  const canvasWrapper = document.getElementById('invoice-canvas-wrapper');
  const origTransform = canvasWrapper ? canvasWrapper.style.transform : '';
  if (canvasWrapper) canvasWrapper.style.transform = 'none';

  // Temporarily hide the placeholder during image export
  const placeholders = paper.querySelectorAll('.invoice-logo-placeholder-wrapper');
  placeholders.forEach(el => el.style.display = 'none');
  const restorePlaceholders = () => {
    placeholders.forEach(el => el.style.display = '');
  };

  html2canvas(paper, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff'
  }).then(canvas => {
    restorePlaceholders();
    if (canvasWrapper) canvasWrapper.style.transform = origTransform;
    const mime = format === 'png' ? 'image/png' : 'image/jpeg';
    const dataUrl = canvas.toDataURL(mime, 0.95);
    const link = document.createElement('a');
    link.download = `${sanitizeFilename(invoiceState.invoice.number || 'invoice')}.${format}`;
    link.href = dataUrl;
    link.click();
    showToast(`Invoice downloaded as ${format.toUpperCase()}!`);
  }).catch(err => {
    restorePlaceholders();
    console.error(err);
    if (canvasWrapper) canvasWrapper.style.transform = origTransform;
    showToast('Failed to generate invoice image.', 'error');
  });
}

/* ── Print Handler ──────────────────────────────────────────────────────── */
function printInvoice() {
  const paper = document.getElementById('invoice-printable-area');
  if (!paper) {
    window.print();
    return;
  }

  showToast('Opening print dialog...');

  const canvasWrapper = document.getElementById('invoice-canvas-wrapper');
  const origTransform = canvasWrapper ? canvasWrapper.style.transform : '';
  if (canvasWrapper) canvasWrapper.style.transform = 'none';

  const restoreTransform = () => {
    if (canvasWrapper) canvasWrapper.style.transform = origTransform;
    window.removeEventListener('afterprint', restoreTransform);
  };
  window.addEventListener('afterprint', restoreTransform);

  try {
    window.print();
  } catch (err) {
    console.warn('Native window.print failed, attempting iframe print fallback:', err);
    printViaIframe();
  }

  setTimeout(() => {
    if (canvasWrapper && canvasWrapper.style.transform === 'none') {
      canvasWrapper.style.transform = origTransform;
    }
  }, 1000);
}

function printViaIframe() {
  const paper = document.getElementById('invoice-printable-area');
  if (!paper) return;

  let frame = document.getElementById('invoice-hidden-print-frame');
  if (!frame) {
    frame = document.createElement('iframe');
    frame.id = 'invoice-hidden-print-frame';
    frame.style.position = 'fixed';
    frame.style.right = '0';
    frame.style.bottom = '0';
    frame.style.width = '0';
    frame.style.height = '0';
    frame.style.border = '0';
    frame.style.visibility = 'hidden';
    document.body.appendChild(frame);
  }

  const doc = frame.contentWindow.document;
  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${sanitizeFilename(invoiceState.invoice.number || 'Invoice')}</title>
      <link rel="stylesheet" href="assets/css/style.css" />
      <style>
        @page { size: A4 portrait; margin: 8mm; }
        * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        html, body { margin: 0 !important; padding: 0 !important; background: #ffffff !important; color: #0f172a !important; font-size: 11.5px !important; }
        .invoice-paper { box-shadow: none !important; border: none !important; width: 100% !important; max-width: 100% !important; margin: 0 !important; padding: 0 !important; min-height: auto !important; }
        .invoice-logo-placeholder-wrapper { display: none !important; }
      </style>
    </head>
    <body>
      <div class="${paper.className}">
        ${paper.innerHTML}
      </div>
    </body>
    </html>
  `);
  doc.close();

  frame.contentWindow.focus();
  try {
    frame.contentWindow.print();
  } catch (e) {
    console.error('Iframe print error:', e);
  }
}

/* ── JSON Backup & Restore ──────────────────────────────────────────────── */
function exportInvoiceJson() {
  try {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(invoiceState, null, 2));
    const downloadAnchor = document.createElement('a');
    const fileName = `${sanitizeFilename(invoiceState.invoice.number || 'invoice')}-backup.json`;
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', fileName);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Invoice JSON backup downloaded.');
  } catch (e) {
    console.error('Error exporting JSON:', e);
    showToast('Failed to export invoice JSON.', 'error');
  }
}

function handleImportJson(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const parsed = JSON.parse(evt.target.result);
      if (!parsed || !parsed.invoice || !Array.isArray(parsed.items)) {
        throw new Error('Invalid invoice schema.');
      }
      invoiceState = Object.assign({}, DEFAULT_INVOICE_STATE, parsed);
      // Normalize items
      invoiceState.items.forEach((item, i) => {
        if (!item.id) item.id = 'item-' + i;
        if (item.unitPrice === undefined && item.price !== undefined) item.unitPrice = item.price;
        if (item.discountType === undefined) item.discountType = 'percent';
        if (item.discountValue === undefined) item.discountValue = 0;
        if (item.taxRate === undefined) item.taxRate = 0;
      });
      populateFormFromState();
      triggerAutoSave();
      renderInvoicePreview();
      showToast('Invoice successfully restored from backup!');
    } catch (err) {
      console.error('Error importing JSON:', err);
      showToast('Invalid JSON backup file.', 'error');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

/* ── Autosave & Local Storage ───────────────────────────────────────────── */
function triggerAutoSave() {
  const statusEl = document.getElementById('inv-save-status');
  if (statusEl) {
    statusEl.className = 'inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full';
    statusEl.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span><span>SAVING...</span>';
  }

  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveDraft();
    if (statusEl) {
      statusEl.className = 'inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full';
      statusEl.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span><span>DRAFT SAVED</span>';
    }
  }, 400);
}

function saveDraft() {
  try {
    localStorage.setItem('digitalcron_invoice_draft_v3', JSON.stringify(invoiceState));
  } catch (e) {
    console.warn('Unable to save draft to localStorage:', e);
  }
}

function loadDraft() {
  try {
    const saved = localStorage.getItem('digitalcron_invoice_draft_v3') || localStorage.getItem('digitalcron_invoice_draft_v2');
    if (saved) {
      const parsed = JSON.parse(saved);
      invoiceState = Object.assign({}, DEFAULT_INVOICE_STATE, parsed);
      // Normalize items if legacy format
      if (Array.isArray(invoiceState.items)) {
        invoiceState.items.forEach((item, i) => {
          if (!item.id) item.id = 'item-' + i;
          if (item.unitPrice === undefined && item.price !== undefined) item.unitPrice = item.price;
          if (item.discountType === undefined) item.discountType = 'percent';
          if (item.discountValue === undefined) item.discountValue = 0;
          if (item.taxRate === undefined) item.taxRate = 0;
        });
      }
    }
    const urlParams = new URLSearchParams(window.location.search);
    const qTemplate = urlParams.get('template');
    if (qTemplate) {
      invoiceState.styling.template = qTemplate;
    }
  } catch (e) {
    console.warn('Unable to load draft from localStorage:', e);
  }
}

function loadSampleData() {
  invoiceState = JSON.parse(JSON.stringify(DEFAULT_INVOICE_STATE));
  populateFormFromState();
  triggerAutoSave();
  renderInvoicePreview();
  showToast('Loaded enterprise demo invoice template.');
}

function resetInvoice() {
  if (!confirm('Are you sure you want to reset all invoice fields to create a blank invoice?')) return;
  invoiceState = {
    business: { name: '', logo: '', address: '', email: '', phone: '', taxId: '', website: '' },
    client: { name: '', company: '', address: '', shippingAddress: '', email: '', phone: '', taxId: '' },
    invoice: {
      number: 'INV-001',
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0],
      poNumber: '',
      paymentTerms: 'Due on Receipt',
      status: 'draft'
    },
    items: [{ id: 'item-1', desc: 'Consulting / Engineering Service', qty: 1, unitPrice: 100, discountType: 'percent', discountValue: 0, taxRate: 0 }],
    tax: { enabled: true, label: 'Tax', rate: 10, inclusive: false, secondaryEnabled: false, secondaryLabel: '', secondaryRate: 0 },
    discount: { enabled: false, type: 'percent', value: 0 },
    shipping: { enabled: false, value: 0 },
    extraFee: { enabled: false, label: 'Handling Fee', value: 0 },
    amountPaid: 0,
    currency: { code: 'USD', symbol: '$', position: 'prefix' },
    styling: { template: 'modern', accentColor: '#6366F1', font: 'sans', fontSize: 'md', tableStyle: 'striped', margins: 'standard' },
    payment: { bankName: '', accountNumber: '', routingNumber: '', swiftIban: '', notes: '', terms: '', signature: { enabled: false, name: '', title: '', cursive: true } }
  };
  populateFormFromState();
  triggerAutoSave();
  renderInvoicePreview();
  showToast('Invoice cleared.');
}

/* ── Utilities ──────────────────────────────────────────────────────────── */
function hexToRgb(hex) {
  if (!hex) return [99, 102, 241];
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  if (isNaN(num)) return [99, 102, 241];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function sanitizeFilename(name) {
  return String(name).replace(/[^a-zA-Z0-9_-]/g, '_');
}

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
