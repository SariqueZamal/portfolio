/* ==========================================================================
   DigitalCron Tools - Business Tools Suite JavaScript Engine
   Supports Break-Even, Inventory Turnover, Business Expense, Employee Cost,
   Profit Margin, Customer LTV, Customer CAC & ROI Calculators
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initBusinessTools();
});

function initBusinessTools() {
  initBreakEvenCalculator();
  initInventoryTurnoverCalculator();
  initBusinessExpenseCalculator();
  initEmployeeCostCalculator();
  initProfitMarginCalculator();
  initCustomerLTVCalculator();
  initCustomerCACCalculator();
  initROICalculator();
}

/* Helper Currency Formatter */
function formatCurrency(val) {
  if (isNaN(val) || !isFinite(val)) return '$0.00';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(val);
}

function formatNum(val, decimals = 2) {
  if (isNaN(val) || !isFinite(val)) return '0';
  return Number(val.toFixed(decimals)).toLocaleString('en-US');
}

/* 1. Break-Even Point Calculator */
function initBreakEvenCalculator() {
  const container = document.getElementById('calc-break-even');
  if (!container) return;

  const fixedCostsInput = document.getElementById('be-fixed-costs');
  const unitPriceInput = document.getElementById('be-unit-price');
  const variableCostInput = document.getElementById('be-variable-cost');

  const update = () => {
    const fixedCosts = parseFloat(fixedCostsInput?.value) || 0;
    const unitPrice = parseFloat(unitPriceInput?.value) || 0;
    const variableCost = parseFloat(variableCostInput?.value) || 0;

    const contributionMargin = unitPrice - variableCost;
    let breakEvenUnits = 0;
    let breakEvenSales = 0;
    let marginRatio = 0;

    if (contributionMargin > 0) {
      breakEvenUnits = fixedCosts / contributionMargin;
      breakEvenSales = breakEvenUnits * unitPrice;
      marginRatio = (contributionMargin / unitPrice) * 100;
    }

    document.getElementById('res-be-units').innerText = formatNum(Math.ceil(breakEvenUnits), 0) + ' Units';
    document.getElementById('res-be-sales').innerText = formatCurrency(breakEvenSales);
    document.getElementById('res-be-cm').innerText = formatCurrency(contributionMargin);
    document.getElementById('res-be-ratio').innerText = formatNum(marginRatio, 1) + '%';
  };

  [fixedCostsInput, unitPriceInput, variableCostInput].forEach(el => el?.addEventListener('input', update));
  document.getElementById('btn-copy-be')?.addEventListener('click', () => {
    const units = document.getElementById('res-be-units').innerText;
    const sales = document.getElementById('res-be-sales').innerText;
    safeCopy(`Break-Even Point: ${units} (${sales})`, 'Break-even results copied to clipboard!');
  });

  update();
}

/* 2. Inventory Turnover Calculator */
function initInventoryTurnoverCalculator() {
  const container = document.getElementById('calc-inventory-turnover');
  if (!container) return;

  const cogsInput = document.getElementById('it-cogs');
  const beginInvInput = document.getElementById('it-begin-inv');
  const endInvInput = document.getElementById('it-end-inv');

  const update = () => {
    const cogs = parseFloat(cogsInput?.value) || 0;
    const beginInv = parseFloat(beginInvInput?.value) || 0;
    const endInv = parseFloat(endInvInput?.value) || 0;

    const avgInv = (beginInv + endInv) / 2;
    let turnoverRatio = 0;
    let dsi = 0;

    if (avgInv > 0) {
      turnoverRatio = cogs / avgInv;
      if (turnoverRatio > 0) {
        dsi = 365 / turnoverRatio;
      }
    }

    document.getElementById('res-it-ratio').innerText = formatNum(turnoverRatio, 2) + 'x';
    document.getElementById('res-it-dsi').innerText = formatNum(dsi, 1) + ' Days';
    document.getElementById('res-it-avg-inv').innerText = formatCurrency(avgInv);
  };

  [cogsInput, beginInvInput, endInvInput].forEach(el => el?.addEventListener('input', update));
  document.getElementById('btn-copy-it')?.addEventListener('click', () => {
    const ratio = document.getElementById('res-it-ratio').innerText;
    const dsi = document.getElementById('res-it-dsi').innerText;
    safeCopy(`Inventory Turnover Ratio: ${ratio}, Days Sales of Inventory: ${dsi}`, 'Inventory turnover results copied to clipboard!');
    if (typeof showToast === 'function') showToast('Inventory metrics copied!');
  });

  update();
}

/* 3. Business Expense Calculator */
function initBusinessExpenseCalculator() {
  const container = document.getElementById('calc-business-expense');
  if (!container) return;

  const payrollInput = document.getElementById('exp-payroll');
  const rentInput = document.getElementById('exp-rent');
  const techInput = document.getElementById('exp-tech');
  const marketingInput = document.getElementById('exp-marketing');
  const otherInput = document.getElementById('exp-other');
  const revenueInput = document.getElementById('exp-revenue');

  const update = () => {
    const payroll = parseFloat(payrollInput?.value) || 0;
    const rent = parseFloat(rentInput?.value) || 0;
    const tech = parseFloat(techInput?.value) || 0;
    const marketing = parseFloat(marketingInput?.value) || 0;
    const other = parseFloat(otherInput?.value) || 0;
    const revenue = parseFloat(revenueInput?.value) || 0;

    const totalMonthly = payroll + rent + tech + marketing + other;
    const totalAnnual = totalMonthly * 12;
    const netProfit = revenue - totalMonthly;
    const expRatio = revenue > 0 ? (totalMonthly / revenue) * 100 : 0;

    document.getElementById('res-exp-monthly').innerText = formatCurrency(totalMonthly);
    document.getElementById('res-exp-annual').innerText = formatCurrency(totalAnnual);
    document.getElementById('res-exp-net').innerText = formatCurrency(netProfit);
    document.getElementById('res-exp-ratio').innerText = formatNum(expRatio, 1) + '%';
  };

  [payrollInput, rentInput, techInput, marketingInput, otherInput, revenueInput].forEach(el => el?.addEventListener('input', update));
  document.getElementById('btn-copy-exp')?.addEventListener('click', () => {
    const monthly = document.getElementById('res-exp-monthly').innerText;
    const annual = document.getElementById('res-exp-annual').innerText;
    safeCopy(`Total Business Expenses: Monthly ${monthly} | Annual ${annual}`, 'Expense results copied to clipboard!');
    if (typeof showToast === 'function') showToast('Expense summary copied!');
  });

  update();
}

/* 4. Employee Cost Calculator */
function initEmployeeCostCalculator() {
  const container = document.getElementById('calc-employee-cost');
  if (!container) return;

  const salaryInput = document.getElementById('emp-salary');
  const healthInput = document.getElementById('emp-health');
  const taxPctInput = document.getElementById('emp-tax-pct');
  const retirementPctInput = document.getElementById('emp-ret-pct');
  const officeInput = document.getElementById('emp-office');
  const perksInput = document.getElementById('emp-perks');

  const update = () => {
    const salary = parseFloat(salaryInput?.value) || 0;
    const health = parseFloat(healthInput?.value) || 0;
    const taxPct = parseFloat(taxPctInput?.value) || 0;
    const retPct = parseFloat(retirementPctInput?.value) || 0;
    const office = parseFloat(officeInput?.value) || 0;
    const perks = parseFloat(perksInput?.value) || 0;

    const taxAmt = salary * (taxPct / 100);
    const retAmt = salary * (retPct / 100);

    const totalCost = salary + health + taxAmt + retAmt + office + perks;
    const burdenFactor = salary > 0 ? totalCost / salary : 1;
    const extraOverhead = totalCost - salary;

    document.getElementById('res-emp-total').innerText = formatCurrency(totalCost);
    document.getElementById('res-emp-burden').innerText = formatNum(burdenFactor, 2) + 'x Salary';
    document.getElementById('res-emp-overhead').innerText = formatCurrency(extraOverhead);
  };

  [salaryInput, healthInput, taxPctInput, retirementPctInput, officeInput, perksInput].forEach(el => el?.addEventListener('input', update));
  document.getElementById('btn-copy-emp')?.addEventListener('click', () => {
    const total = document.getElementById('res-emp-total').innerText;
    const burden = document.getElementById('res-emp-burden').innerText;
    safeCopy(`True Employee Cost: ${total} (Burden Factor: ${burden})`, 'Employee cost results copied to clipboard!');
    if (typeof showToast === 'function') showToast('Employee cost calculation copied!');
  });

  update();
}

/* 5. Profit Margin Calculator */
function initProfitMarginCalculator() {
  const container = document.getElementById('calc-profit-margin');
  if (!container) return;

  const revenueInput = document.getElementById('pm-revenue');
  const cogsInput = document.getElementById('pm-cogs');
  const opexInput = document.getElementById('pm-opex');

  const update = () => {
    const revenue = parseFloat(revenueInput?.value) || 0;
    const cogs = parseFloat(cogsInput?.value) || 0;
    const opex = parseFloat(opexInput?.value) || 0;

    const grossProfit = revenue - cogs;
    const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
    const netProfit = grossProfit - opex;
    const netMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
    const markup = cogs > 0 ? (grossProfit / cogs) * 100 : 0;

    document.getElementById('res-pm-gross-profit').innerText = formatCurrency(grossProfit);
    document.getElementById('res-pm-gross-margin').innerText = formatNum(grossMargin, 2) + '%';
    document.getElementById('res-pm-net-profit').innerText = formatCurrency(netProfit);
    document.getElementById('res-pm-net-margin').innerText = formatNum(netMargin, 2) + '%';
    document.getElementById('res-pm-markup').innerText = formatNum(markup, 2) + '%';
  };

  [revenueInput, cogsInput, opexInput].forEach(el => el?.addEventListener('input', update));
  document.getElementById('btn-copy-pm')?.addEventListener('click', () => {
    const grossM = document.getElementById('res-pm-gross-margin').innerText;
    const netM = document.getElementById('res-pm-net-margin').innerText;
    safeCopy(`Gross Profit Margin: ${grossM}, Net Profit Margin: ${netM}`, 'Profit margin results copied to clipboard!');
    if (typeof showToast === 'function') showToast('Profit margin results copied!');
  });

  update();
}

/* 6. Customer Lifetime Value (LTV) Calculator */
function initCustomerLTVCalculator() {
  const container = document.getElementById('calc-customer-ltv');
  if (!container) return;

  const aovInput = document.getElementById('ltv-aov');
  const freqInput = document.getElementById('ltv-freq');
  const lifespanInput = document.getElementById('ltv-lifespan');
  const marginPctInput = document.getElementById('ltv-margin');

  const update = () => {
    const aov = parseFloat(aovInput?.value) || 0;
    const freq = parseFloat(freqInput?.value) || 0;
    const lifespan = parseFloat(lifespanInput?.value) || 0;
    const marginPct = parseFloat(marginPctInput?.value) || 100;

    const annualRevenue = aov * freq;
    const lifetimeRevenue = annualRevenue * lifespan;
    const ltv = lifetimeRevenue * (marginPct / 100);

    document.getElementById('res-ltv-val').innerText = formatCurrency(ltv);
    document.getElementById('res-ltv-rev').innerText = formatCurrency(lifetimeRevenue);
    document.getElementById('res-ltv-annual').innerText = formatCurrency(annualRevenue);
  };

  [aovInput, freqInput, lifespanInput, marginPctInput].forEach(el => el?.addEventListener('input', update));
  document.getElementById('btn-copy-ltv')?.addEventListener('click', () => {
    const ltv = document.getElementById('res-ltv-val').innerText;
    safeCopy(`Customer Lifetime Value (LTV): ${ltv}`, 'LTV results copied to clipboard!');
    if (typeof showToast === 'function') showToast('LTV result copied!');
  });

  update();
}

/* 7. Customer Acquisition Cost (CAC) Calculator */
function initCustomerCACCalculator() {
  const container = document.getElementById('calc-customer-cac');
  if (!container) return;

  const adSpendInput = document.getElementById('cac-ad-spend');
  const salariesInput = document.getElementById('cac-salaries');
  const toolsInput = document.getElementById('cac-tools');
  const newCustInput = document.getElementById('cac-new-cust');

  const update = () => {
    const adSpend = parseFloat(adSpendInput?.value) || 0;
    const salaries = parseFloat(salariesInput?.value) || 0;
    const tools = parseFloat(toolsInput?.value) || 0;
    const newCust = parseFloat(newCustInput?.value) || 0;

    const totalSpend = adSpend + salaries + tools;
    const cac = newCust > 0 ? totalSpend / newCust : 0;

    document.getElementById('res-cac-val').innerText = formatCurrency(cac);
    document.getElementById('res-cac-total').innerText = formatCurrency(totalSpend);
  };

  [adSpendInput, salariesInput, toolsInput, newCustInput].forEach(el => el?.addEventListener('input', update));
  document.getElementById('btn-copy-cac')?.addEventListener('click', () => {
    const cac = document.getElementById('res-cac-val').innerText;
    safeCopy(`Customer Acquisition Cost (CAC): ${cac}`, 'CAC results copied to clipboard!');
    if (typeof showToast === 'function') showToast('CAC result copied!');
  });

  update();
}

/* 8. Return on Investment (ROI) Calculator */
function initROICalculator() {
  const container = document.getElementById('calc-roi');
  if (!container) return;

  const initialInput = document.getElementById('roi-initial');
  const returnInput = document.getElementById('roi-return');
  const yearsInput = document.getElementById('roi-years');

  const update = () => {
    const initial = parseFloat(initialInput?.value) || 0;
    const totalReturn = parseFloat(returnInput?.value) || 0;
    const years = parseFloat(yearsInput?.value) || 1;

    const netGain = totalReturn - initial;
    const totalRoi = initial > 0 ? (netGain / initial) * 100 : 0;

    let annualizedRoi = 0;
    if (initial > 0 && totalReturn > 0 && years > 0) {
      annualizedRoi = (Math.pow(totalReturn / initial, 1 / years) - 1) * 100;
    }

    document.getElementById('res-roi-net').innerText = formatCurrency(netGain);
    document.getElementById('res-roi-total').innerText = formatNum(totalRoi, 2) + '%';
    document.getElementById('res-roi-annual').innerText = formatNum(annualizedRoi, 2) + '%';
  };

  [initialInput, returnInput, yearsInput].forEach(el => el?.addEventListener('input', update));
  document.getElementById('btn-copy-roi')?.addEventListener('click', () => {
    const roiPct = document.getElementById('res-roi-total').innerText;
    const netGain = document.getElementById('res-roi-net').innerText;
    safeCopy(`Return on Investment: ${roiPct} (Net Gain: ${netGain})`, 'ROI results copied to clipboard!');
    if (typeof showToast === 'function') showToast('ROI results copied!');
  });

  update();
}
