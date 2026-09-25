/* ==========================================================================
   DigitalCron Tools - E-commerce & Digital Marketing Suite JavaScript Engine
   Supports: Marketing ROI, CAC, Conversion Rate, CTR, CPM, CPC, CPA, ROAS,
   Break-Even ROAS, Selling Price, Inventory Value, Return Rate, & AOV Calculators.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initEcommerceMarketingTools();
});

function initEcommerceMarketingTools() {
  initMarketingROICalculator();
  initCACCalculator();
  initConversionRateCalculator();
  initCTRCalculator();
  initCPMCalculator();
  initCPCCalculator();
  initCPACalculator();
  initROASCalculator();
  initBreakEvenROASCalculator();
  initSellingPriceCalculator();
  initInventoryValueCalculator();
  initReturnRateCalculator();
  initAOVCalculator();
}

function formatCurrency(num) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num || 0);
}

function formatPercent(num) {
  return (num || 0).toFixed(2) + '%';
}

/* 1. Marketing ROI Calculator */
function initMarketingROICalculator() {
  const container = document.getElementById('calc-mktg-roi');
  if (!container) return;

  const revEl = document.getElementById('mroi-rev');
  const costEl = document.getElementById('mroi-cost');
  const roiVal = document.getElementById('mroi-val');
  const netVal = document.getElementById('mroi-net');

  const update = () => {
    const rev = parseFloat(revEl?.value || 0);
    const cost = parseFloat(costEl?.value || 0);
    const net = rev - cost;
    const roi = cost > 0 ? (net / cost) * 100 : 0;

    if (roiVal) roiVal.textContent = formatPercent(roi);
    if (netVal) netVal.textContent = formatCurrency(net);
  };

  [revEl, costEl].forEach(el => el?.addEventListener('input', update));
  update();
}

/* 2. Customer Acquisition Cost (CAC) Calculator */
function initCACCalculator() {
  const container = document.getElementById('calc-cac');
  if (!container) return;

  const costEl = document.getElementById('cac-cost');
  const custEl = document.getElementById('cac-cust');
  const cacVal = document.getElementById('cac-val');

  const update = () => {
    const cost = parseFloat(costEl?.value || 0);
    const cust = parseFloat(custEl?.value || 0);
    const cac = cust > 0 ? cost / cust : 0;

    if (cacVal) cacVal.textContent = formatCurrency(cac);
  };

  [costEl, custEl].forEach(el => el?.addEventListener('input', update));
  update();
}

/* 3. Conversion Rate Calculator */
function initConversionRateCalculator() {
  const container = document.getElementById('calc-conv-rate');
  if (!container) return;

  const visitorsEl = document.getElementById('cr-visitors');
  const convEl = document.getElementById('cr-conversions');
  const crVal = document.getElementById('cr-val');

  const update = () => {
    const visitors = parseFloat(visitorsEl?.value || 0);
    const conv = parseFloat(convEl?.value || 0);
    const rate = visitors > 0 ? (conv / visitors) * 100 : 0;

    if (crVal) crVal.textContent = formatPercent(rate);
  };

  [visitorsEl, convEl].forEach(el => el?.addEventListener('input', update));
  update();
}

/* 4. CTR Calculator */
function initCTRCalculator() {
  const container = document.getElementById('calc-ctr');
  if (!container) return;

  const impEl = document.getElementById('ctr-impressions');
  const clicksEl = document.getElementById('ctr-clicks');
  const ctrVal = document.getElementById('ctr-val');

  const update = () => {
    const imp = parseFloat(impEl?.value || 0);
    const clicks = parseFloat(clicksEl?.value || 0);
    const ctr = imp > 0 ? (clicks / imp) * 100 : 0;

    if (ctrVal) ctrVal.textContent = formatPercent(ctr);
  };

  [impEl, clicksEl].forEach(el => el?.addEventListener('input', update));
  update();
}

/* 5. CPM Calculator */
function initCPMCalculator() {
  const container = document.getElementById('calc-cpm');
  if (!container) return;

  const costEl = document.getElementById('cpm-cost');
  const impEl = document.getElementById('cpm-impressions');
  const cpmVal = document.getElementById('cpm-val');

  const update = () => {
    const cost = parseFloat(costEl?.value || 0);
    const imp = parseFloat(impEl?.value || 0);
    const cpm = imp > 0 ? (cost / imp) * 1000 : 0;

    if (cpmVal) cpmVal.textContent = formatCurrency(cpm);
  };

  [costEl, impEl].forEach(el => el?.addEventListener('input', update));
  update();
}

/* 6. CPC Calculator */
function initCPCCalculator() {
  const container = document.getElementById('calc-cpc');
  if (!container) return;

  const costEl = document.getElementById('cpc-cost');
  const clicksEl = document.getElementById('cpc-clicks');
  const cpcVal = document.getElementById('cpc-val');

  const update = () => {
    const cost = parseFloat(costEl?.value || 0);
    const clicks = parseFloat(clicksEl?.value || 0);
    const cpc = clicks > 0 ? cost / clicks : 0;

    if (cpcVal) cpcVal.textContent = formatCurrency(cpc);
  };

  [costEl, clicksEl].forEach(el => el?.addEventListener('input', update));
  update();
}

/* 7. CPA Calculator */
function initCPACalculator() {
  const container = document.getElementById('calc-cpa');
  if (!container) return;

  const costEl = document.getElementById('cpa-cost');
  const convEl = document.getElementById('cpa-conversions');
  const cpaVal = document.getElementById('cpa-val');

  const update = () => {
    const cost = parseFloat(costEl?.value || 0);
    const conv = parseFloat(convEl?.value || 0);
    const cpa = conv > 0 ? cost / conv : 0;

    if (cpaVal) cpaVal.textContent = formatCurrency(cpa);
  };

  [costEl, convEl].forEach(el => el?.addEventListener('input', update));
  update();
}

/* 8. ROAS Calculator */
function initROASCalculator() {
  const container = document.getElementById('calc-roas');
  if (!container) return;

  const revEl = document.getElementById('roas-rev');
  const costEl = document.getElementById('roas-cost');
  const roasVal = document.getElementById('roas-val');
  const multVal = document.getElementById('roas-mult');

  const update = () => {
    const rev = parseFloat(revEl?.value || 0);
    const cost = parseFloat(costEl?.value || 0);
    const pct = cost > 0 ? (rev / cost) * 100 : 0;
    const mult = cost > 0 ? rev / cost : 0;

    if (roasVal) roasVal.textContent = formatPercent(pct);
    if (multVal) multVal.textContent = mult.toFixed(2) + 'x';
  };

  [revEl, costEl].forEach(el => el?.addEventListener('input', update));
  update();
}

/* 9. Break-Even ROAS Calculator */
function initBreakEvenROASCalculator() {
  const container = document.getElementById('calc-breakeven-roas');
  if (!container) return;

  const marginEl = document.getElementById('broas-margin');
  const broasVal = document.getElementById('broas-val');

  const update = () => {
    const marginPct = parseFloat(marginEl?.value || 0);
    const broas = marginPct > 0 ? (100 / marginPct) * 100 : 0;

    if (broasVal) broasVal.textContent = formatPercent(broas);
  };

  marginEl?.addEventListener('input', update);
  update();
}

/* 10. Selling Price Calculator */
function initSellingPriceCalculator() {
  const container = document.getElementById('calc-selling-price');
  if (!container) return;

  const costEl = document.getElementById('sp-cost');
  const marginEl = document.getElementById('sp-margin');
  const priceVal = document.getElementById('sp-price');
  const profitVal = document.getElementById('sp-profit');

  const update = () => {
    const cost = parseFloat(costEl?.value || 0);
    const margin = parseFloat(marginEl?.value || 0);
    const price = margin < 100 ? cost / (1 - (margin / 100)) : 0;
    const profit = price - cost;

    if (priceVal) priceVal.textContent = formatCurrency(price);
    if (profitVal) profitVal.textContent = formatCurrency(profit);
  };

  [costEl, marginEl].forEach(el => el?.addEventListener('input', update));
  update();
}

/* 11. Inventory Value Calculator */
function initInventoryValueCalculator() {
  const container = document.getElementById('calc-inventory-val');
  if (!container) return;

  const qtyEl = document.getElementById('inv-qty');
  const costEl = document.getElementById('inv-unit-cost');
  const invVal = document.getElementById('inv-val');

  const update = () => {
    const qty = parseFloat(qtyEl?.value || 0);
    const cost = parseFloat(costEl?.value || 0);
    const total = qty * cost;

    if (invVal) invVal.textContent = formatCurrency(total);
  };

  [qtyEl, costEl].forEach(el => el?.addEventListener('input', update));
  update();
}

/* 12. Return Rate Calculator */
function initReturnRateCalculator() {
  const container = document.getElementById('calc-return-rate');
  if (!container) return;

  const returnedEl = document.getElementById('rr-returned');
  const soldEl = document.getElementById('rr-sold');
  const rrVal = document.getElementById('rr-val');

  const update = () => {
    const returned = parseFloat(returnedEl?.value || 0);
    const sold = parseFloat(soldEl?.value || 0);
    const rate = sold > 0 ? (returned / sold) * 100 : 0;

    if (rrVal) rrVal.textContent = formatPercent(rate);
  };

  [returnedEl, soldEl].forEach(el => el?.addEventListener('input', update));
  update();
}

/* 13. Average Order Value (AOV) Calculator */
function initAOVCalculator() {
  const container = document.getElementById('calc-aov');
  if (!container) return;

  const revEl = document.getElementById('aov-rev');
  const ordersEl = document.getElementById('aov-orders');
  const aovVal = document.getElementById('aov-val');

  const update = () => {
    const rev = parseFloat(revEl?.value || 0);
    const orders = parseFloat(ordersEl?.value || 0);
    const aov = orders > 0 ? rev / orders : 0;

    if (aovVal) aovVal.textContent = formatCurrency(aov);
  };

  [revEl, ordersEl].forEach(el => el?.addEventListener('input', update));
  update();
}
