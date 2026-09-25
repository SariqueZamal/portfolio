/**
 * Business Tools Extra Engines:
 * - Freelance Hourly Rate Calculator
 * - Salary to Hourly Calculator
 * - Discount & Sale Price Calculator
 */

document.addEventListener('DOMContentLoaded', () => {
  const formatMoney = (num) => {
    return '$' + (Math.round(num * 100) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // ─────────────────────────────────────────────────────────────────
  // 1. FREELANCE HOURLY RATE CALCULATOR
  // ─────────────────────────────────────────────────────────────────
  const netIncomeInput = document.getElementById('rate-net-income');
  if (netIncomeInput) {
    const expensesInput = document.getElementById('rate-expenses');
    const taxRateInput = document.getElementById('rate-tax-rate');
    const vacationInput = document.getElementById('rate-vacation-weeks');
    const billableInput = document.getElementById('rate-billable-pct');

    const resHourly = document.getElementById('res-hourly-rate');
    const resDaily = document.getElementById('res-daily-rate');
    const resGross = document.getElementById('res-gross-revenue');
    const resHours = document.getElementById('res-billable-hours');
    const resTax = document.getElementById('res-tax-bill');

    const computeFreelanceRate = () => {
      const net = Math.max(0, parseFloat(netIncomeInput.value) || 0);
      const expenses = Math.max(0, parseFloat(expensesInput.value) || 0);
      const taxRate = Math.max(0, Math.min(60, parseFloat(taxRateInput.value) || 0)) / 100;
      const vacationWeeks = Math.max(0, Math.min(50, parseFloat(vacationInput.value) || 0));
      const billableHoursPerWeek = Math.max(1, Math.min(80, parseFloat(billableInput.value) || 25));

      // Net income after tax = Gross Revenue - Expenses - (Gross Revenue - Expenses) * taxRate
      // Net = (Gross - Expenses) * (1 - taxRate)
      // Gross - Expenses = Net / (1 - taxRate)
      // Gross = Expenses + (Net / (1 - taxRate))
      const taxableRequired = (1 - taxRate) > 0 ? (net / (1 - taxRate)) : net;
      const grossRevenue = taxableRequired + expenses;
      const estimatedTax = taxableRequired * taxRate;

      const workingWeeks = Math.max(1, 52 - vacationWeeks);
      const annualBillableHours = workingWeeks * billableHoursPerWeek;

      const hourlyRate = annualBillableHours > 0 ? (grossRevenue / annualBillableHours) : 0;
      const dailyRate = hourlyRate * 8;

      if (resHourly) resHourly.textContent = formatMoney(hourlyRate);
      if (resDaily) resDaily.textContent = formatMoney(dailyRate);
      if (resGross) resGross.textContent = formatMoney(grossRevenue);
      if (resHours) resHours.textContent = Math.round(annualBillableHours).toLocaleString() + ' hrs';
      if (resTax) resTax.textContent = formatMoney(estimatedTax);
    };

    [netIncomeInput, expensesInput, taxRateInput, vacationInput, billableInput].forEach(el => {
      if (el) el.addEventListener('input', computeFreelanceRate);
    });

    computeFreelanceRate();
  }

  // ─────────────────────────────────────────────────────────────────
  // 2. SALARY TO HOURLY CALCULATOR
  // ─────────────────────────────────────────────────────────────────
  const salAmountInput = document.getElementById('sal-amount');
  if (salAmountInput) {
    const hoursPerWeekInput = document.getElementById('sal-hours-per-week');
    const daysPerWeekInput = document.getElementById('sal-days-per-week');
    const ptoDaysInput = document.getElementById('sal-pto-days');
    const overtimeRateSelect = document.getElementById('sal-overtime-rate');

    const resSalHourly = document.getElementById('sal-res-hourly');
    const resSalOvertime = document.getElementById('sal-res-overtime');
    const resSalDaily = document.getElementById('sal-res-daily');
    const resSalWeekly = document.getElementById('sal-res-weekly');
    const resSalBiweekly = document.getElementById('sal-res-biweekly');
    const resSalMonthly = document.getElementById('sal-res-monthly');

    const computeSalaryBreakdown = () => {
      const salary = Math.max(0, parseFloat(salAmountInput.value) || 0);
      const hoursPerWeek = Math.max(1, Math.min(100, parseFloat(hoursPerWeekInput.value) || 40));
      const daysPerWeek = Math.max(1, Math.min(7, parseFloat(daysPerWeekInput.value) || 5));
      const overtimeMult = parseFloat(overtimeRateSelect.value) || 1.5;

      // 52 weeks standard
      const totalHoursYear = hoursPerWeek * 52;
      const hourly = totalHoursYear > 0 ? (salary / totalHoursYear) : 0;
      const overtimeHourly = hourly * overtimeMult;

      const weekly = salary / 52;
      const biweekly = salary / 26;
      const monthly = salary / 12;

      const hoursPerDay = hoursPerWeek / daysPerWeek;
      const daily = hourly * hoursPerDay;

      if (resSalHourly) resSalHourly.textContent = formatMoney(hourly);
      if (resSalOvertime) resSalOvertime.textContent = formatMoney(overtimeHourly) + ' / hr';
      if (resSalDaily) resSalDaily.textContent = formatMoney(daily);
      if (resSalWeekly) resSalWeekly.textContent = formatMoney(weekly);
      if (resSalBiweekly) resSalBiweekly.textContent = formatMoney(biweekly);
      if (resSalMonthly) resSalMonthly.textContent = formatMoney(monthly);
    };

    [salAmountInput, hoursPerWeekInput, daysPerWeekInput, ptoDaysInput].forEach(el => {
      if (el) el.addEventListener('input', computeSalaryBreakdown);
    });
    if (overtimeRateSelect) overtimeRateSelect.addEventListener('change', computeSalaryBreakdown);

    computeSalaryBreakdown();
  }

  // ─────────────────────────────────────────────────────────────────
  // 3. DISCOUNT & SALE PRICE CALCULATOR
  // ─────────────────────────────────────────────────────────────────
  const origPriceInput = document.getElementById('disc-orig-price');
  if (origPriceInput) {
    const discPctInput = document.getElementById('disc-pct');
    const discExtraPctInput = document.getElementById('disc-extra-pct');
    const discTaxPctInput = document.getElementById('disc-tax-pct');

    const resFinalPrice = document.getElementById('disc-final-price');
    const resSubtotalInfo = document.getElementById('disc-subtotal-info');
    const resTotalSaved = document.getElementById('disc-total-saved');
    const resEffectivePct = document.getElementById('disc-effective-pct');
    const badgeSavings = document.getElementById('disc-badge-savings');

    const computeDiscount = () => {
      const orig = Math.max(0, parseFloat(origPriceInput.value) || 0);
      const disc1 = Math.max(0, Math.min(100, parseFloat(discPctInput.value) || 0)) / 100;
      const disc2 = Math.max(0, Math.min(100, parseFloat(discExtraPctInput.value) || 0)) / 100;
      const taxRate = Math.max(0, Math.min(50, parseFloat(discTaxPctInput.value) || 0)) / 100;

      // Compounding discount
      const priceAfterDisc1 = orig * (1 - disc1);
      const discountedSubtotal = priceAfterDisc1 * (1 - disc2);

      const taxAmount = discountedSubtotal * taxRate;
      const finalPrice = discountedSubtotal + taxAmount;

      const totalSavingsPreTax = orig - discountedSubtotal;
      const effectiveDiscountPct = orig > 0 ? ((totalSavingsPreTax / orig) * 100) : 0;

      if (resFinalPrice) resFinalPrice.textContent = formatMoney(finalPrice);
      if (resSubtotalInfo) {
        resSubtotalInfo.textContent = `Subtotal: ${formatMoney(discountedSubtotal)} + Tax: ${formatMoney(taxAmount)}`;
      }
      if (resTotalSaved) resTotalSaved.textContent = formatMoney(totalSavingsPreTax);
      if (resEffectivePct) resEffectivePct.textContent = effectiveDiscountPct.toFixed(2) + '%';
      if (badgeSavings) badgeSavings.textContent = `Save ${effectiveDiscountPct.toFixed(1)}%`;
    };

    [origPriceInput, discPctInput, discExtraPctInput, discTaxPctInput].forEach(el => {
      if (el) el.addEventListener('input', computeDiscount);
    });

    computeDiscount();
  }
});
