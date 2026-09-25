/**
 * E-commerce & Marketing Tools Extra Engines:
 * - Email Marketing ROI Calculator
 * - Amazon FBA Profit & Margin Calculator
 * - SaaS Churn Rate & Customer LTV Calculator
 */

document.addEventListener('DOMContentLoaded', () => {
  const formatMoney = (num) => {
    return '$' + (Math.round(num * 100) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // ─────────────────────────────────────────────────────────────────
  // 1. EMAIL MARKETING ROI CALCULATOR
  // ─────────────────────────────────────────────────────────────────
  const emRecipients = document.getElementById('em-recipients');
  if (emRecipients) {
    const emCost = document.getElementById('em-cost');
    const emOpen = document.getElementById('em-open-rate');
    const emCtr = document.getElementById('em-ctr');
    const emCvr = document.getElementById('em-cvr');
    const emAov = document.getElementById('em-aov');

    const resNetProfit = document.getElementById('em-net-profit');
    const resGrossRev = document.getElementById('em-gross-revenue');
    const resClicks = document.getElementById('em-total-clicks');
    const resOrders = document.getElementById('em-total-orders');
    const resRevPerEmail = document.getElementById('em-rev-per-email');
    const resRoiPct = document.getElementById('em-roi-percent');
    const badgeRoi = document.getElementById('em-roi-badge');

    const computeEmailRoi = () => {
      const recipients = Math.max(0, parseFloat(emRecipients.value) || 0);
      const cost = Math.max(0, parseFloat(emCost.value) || 0);
      const openRate = Math.max(0, Math.min(100, parseFloat(emOpen.value) || 0)) / 100;
      const ctr = Math.max(0, Math.min(100, parseFloat(emCtr.value) || 0)) / 100;
      const cvr = Math.max(0, Math.min(100, parseFloat(emCvr.value) || 0)) / 100;
      const aov = Math.max(0, parseFloat(emAov.value) || 0);

      // Clicks = recipients * ctr
      const totalClicks = recipients * ctr;
      // Orders = clicks * cvr
      const totalOrders = totalClicks * cvr;
      // Gross Revenue = orders * aov
      const grossRev = totalOrders * aov;
      // Net Profit = gross - cost
      const netProfit = grossRev - cost;
      // ROI % = (netProfit / cost) * 100
      const roiPct = cost > 0 ? ((netProfit / cost) * 100) : 0;
      const revPerEmail = recipients > 0 ? (grossRev / recipients) : 0;

      if (resNetProfit) resNetProfit.textContent = formatMoney(netProfit);
      if (resGrossRev) resGrossRev.textContent = `Gross Revenue: ${formatMoney(grossRev)}`;
      if (resClicks) resClicks.textContent = Math.round(totalClicks).toLocaleString();
      if (resOrders) resOrders.textContent = (Math.round(totalOrders * 10) / 10).toLocaleString();
      if (resRevPerEmail) resRevPerEmail.textContent = formatMoney(revPerEmail);
      if (resRoiPct) resRoiPct.textContent = `${roiPct >= 0 ? '+' : ''}${roiPct.toFixed(1)}%`;
      if (badgeRoi) {
        badgeRoi.textContent = `${roiPct >= 0 ? '+' : ''}${roiPct.toFixed(0)}% ROI`;
        badgeRoi.className = roiPct >= 0
          ? 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400'
          : 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-400';
      }
    };

    [emRecipients, emCost, emOpen, emCtr, emCvr, emAov].forEach(el => {
      if (el) el.addEventListener('input', computeEmailRoi);
    });

    computeEmailRoi();
  }

  // ─────────────────────────────────────────────────────────────────
  // 2. AMAZON FBA PROFIT & MARGIN CALCULATOR
  // ─────────────────────────────────────────────────────────────────
  const fbaPrice = document.getElementById('fba-price');
  if (fbaPrice) {
    const fbaCogs = document.getElementById('fba-cogs');
    const fbaShipping = document.getElementById('fba-shipping');
    const fbaReferral = document.getElementById('fba-referral-pct');
    const fbaFee = document.getElementById('fba-fee');

    const resNetProfit = document.getElementById('fba-net-profit');
    const resAmazonCut = document.getElementById('fba-amazon-cut-info');
    const resReferralFee = document.getElementById('fba-referral-fee');
    const resTotalCost = document.getElementById('fba-total-cost');
    const resRoiPct = document.getElementById('fba-roi-pct');
    const resMarginPct = document.getElementById('fba-margin-pct');
    const badgeMargin = document.getElementById('fba-margin-badge');

    const computeFba = () => {
      const price = Math.max(0, parseFloat(fbaPrice.value) || 0);
      const cogs = Math.max(0, parseFloat(fbaCogs.value) || 0);
      const ship = Math.max(0, parseFloat(fbaShipping.value) || 0);
      const refPct = Math.max(0, Math.min(100, parseFloat(fbaReferral.value) || 0)) / 100;
      const pickPackFee = Math.max(0, parseFloat(fbaFee.value) || 0);

      const referralFee = price * refPct;
      const totalAmazonFees = referralFee + pickPackFee;
      const productCostTotal = cogs + ship;
      const totalCostAllIn = productCostTotal + totalAmazonFees;

      const netProfit = price - totalCostAllIn;
      const marginPct = price > 0 ? ((netProfit / price) * 100) : 0;
      const roiPct = productCostTotal > 0 ? ((netProfit / productCostTotal) * 100) : 0;
      const amazonCutPct = price > 0 ? ((totalAmazonFees / price) * 100) : 0;

      if (resNetProfit) resNetProfit.textContent = formatMoney(netProfit);
      if (resAmazonCut) {
        resAmazonCut.textContent = `Amazon Takes: ${formatMoney(totalAmazonFees)} (${amazonCutPct.toFixed(1)}%)`;
      }
      if (resReferralFee) resReferralFee.textContent = formatMoney(referralFee);
      if (resTotalCost) resTotalCost.textContent = formatMoney(totalCostAllIn);
      if (resRoiPct) resRoiPct.textContent = `${roiPct.toFixed(1)}%`;
      if (resMarginPct) resMarginPct.textContent = `${marginPct.toFixed(1)}%`;
      if (badgeMargin) {
        badgeMargin.textContent = `${marginPct.toFixed(1)}% Margin`;
        badgeMargin.className = marginPct >= 20
          ? 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400'
          : 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400';
      }
    };

    [fbaPrice, fbaCogs, fbaShipping, fbaReferral, fbaFee].forEach(el => {
      if (el) el.addEventListener('input', computeFba);
    });

    computeFba();
  }

  // ─────────────────────────────────────────────────────────────────
  // 3. SAAS CHURN RATE & CUSTOMER LTV CALCULATOR
  // ─────────────────────────────────────────────────────────────────
  const churnStart = document.getElementById('churn-start-customers');
  if (churnStart) {
    const churnLost = document.getElementById('churn-lost-customers');
    const churnNew = document.getElementById('churn-new-customers');
    const churnArpu = document.getElementById('churn-arpu');

    const resLtv = document.getElementById('churn-ltv-display');
    const resLifetime = document.getElementById('churn-lifetime-months');
    const resChurnPct = document.getElementById('churn-pct-display');
    const resRetentionPct = document.getElementById('churn-retention-display');
    const resMrrLost = document.getElementById('churn-mrr-lost');
    const resNetGrowth = document.getElementById('churn-net-growth');
    const badgeChurn = document.getElementById('churn-rate-badge');

    const computeChurn = () => {
      const startUsers = Math.max(1, parseFloat(churnStart.value) || 1);
      const lostUsers = Math.max(0, parseFloat(churnLost.value) || 0);
      const newUsers = Math.max(0, parseFloat(churnNew.value) || 0);
      const arpu = Math.max(0, parseFloat(churnArpu.value) || 0);

      const churnRate = lostUsers / startUsers;
      const churnPct = churnRate * 100;
      const retentionPct = Math.max(0, 100 - churnPct);

      const avgLifetimeMonths = churnRate > 0 ? (1 / churnRate) : 120;
      const ltv = arpu * avgLifetimeMonths;

      const mrrLost = lostUsers * arpu;
      const netUserGrowth = newUsers - lostUsers;

      if (resLtv) resLtv.textContent = formatMoney(ltv);
      if (resLifetime) resLifetime.textContent = `Average Lifetime: ~${avgLifetimeMonths.toFixed(1)} months`;
      if (resChurnPct) resChurnPct.textContent = `${churnPct.toFixed(2)}%`;
      if (resRetentionPct) resRetentionPct.textContent = `${retentionPct.toFixed(2)}%`;
      if (resMrrLost) resMrrLost.textContent = formatMoney(mrrLost);
      if (resNetGrowth) {
        resNetGrowth.textContent = `${netUserGrowth >= 0 ? '+' : ''}${netUserGrowth} users`;
        resNetGrowth.className = netUserGrowth >= 0
          ? 'text-emerald-600 dark:text-emerald-400 text-base font-bold'
          : 'text-rose-500 text-base font-bold';
      }

      if (badgeChurn) {
        if (churnPct <= 3) {
          badgeChurn.textContent = `Low Churn (${churnPct.toFixed(1)}%)`;
          badgeChurn.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400';
        } else if (churnPct <= 7) {
          badgeChurn.textContent = `Moderate Churn (${churnPct.toFixed(1)}%)`;
          badgeChurn.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400';
        } else {
          badgeChurn.textContent = `High Churn (${churnPct.toFixed(1)}%)`;
          badgeChurn.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-400';
        }
      }
    };

    [churnStart, churnLost, churnNew, churnArpu].forEach(el => {
      if (el) el.addEventListener('input', computeChurn);
    });

    computeChurn();
  }
});
