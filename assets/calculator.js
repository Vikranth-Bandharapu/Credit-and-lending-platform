/**
 * Credora Finance — Interactive EMI & Loan Calculator Engine
 * Reducing-Balance Formula: EMI = [P * r * (1+r)^n] / [(1+r)^n - 1]
 * Special Case: If r === 0, EMI = P / n
 */

document.addEventListener('DOMContentLoaded', () => {
  initLoanCalculator();
});

function initLoanCalculator() {
  const amountSlider = document.getElementById('calcAmountSlider');
  const amountInput = document.getElementById('calcAmountInput');
  const rateSlider = document.getElementById('calcRateSlider');
  const rateInput = document.getElementById('calcRateInput');
  const tenureSlider = document.getElementById('calcTenureSlider');
  const tenureInput = document.getElementById('calcTenureInput');
  const tenureUnitYears = document.getElementById('tenureUnitYears');
  const tenureUnitMonths = document.getElementById('tenureUnitMonths');
  const resetBtn = document.getElementById('calcResetBtn');

  // Outputs
  const monthlyEmiDisplay = document.getElementById('calcMonthlyEmi');
  const principalDisplay = document.getElementById('calcPrincipalDisplay');
  const totalInterestDisplay = document.getElementById('calcTotalInterestDisplay');
  const totalRepaymentDisplay = document.getElementById('calcTotalRepaymentDisplay');
  const chartCanvas = document.getElementById('emiBreakdownChart');
  const amortizationTableBody = document.getElementById('amortizationTableBody');

  if (!amountSlider || !monthlyEmiDisplay) return;

  let emiChart = null;

  // Sync Slider <-> Input helper
  function setupSync(slider, input, isFloat = false) {
    slider.addEventListener('input', () => {
      input.value = slider.value;
      calculateEmi();
    });
    input.addEventListener('input', () => {
      let val = isFloat ? parseFloat(input.value) : parseInt(input.value, 10);
      const min = isFloat ? parseFloat(slider.min) : parseInt(slider.min, 10);
      const max = isFloat ? parseFloat(slider.max) : parseInt(slider.max, 10);

      if (!isNaN(val)) {
        if (val < min) val = min;
        if (val > max) val = max;
        slider.value = val;
        calculateEmi();
      }
    });
  }

  setupSync(amountSlider, amountInput);
  setupSync(rateSlider, rateInput, true);
  setupSync(tenureSlider, tenureInput);

  // Tenure Unit Toggle
  if (tenureUnitYears && tenureUnitMonths) {
    tenureUnitYears.addEventListener('change', () => {
      tenureSlider.min = 1;
      tenureSlider.max = 30;
      if (parseInt(tenureInput.value, 10) > 30) {
        tenureInput.value = Math.min(30, Math.ceil(parseInt(tenureInput.value, 10) / 12));
      }
      tenureSlider.value = tenureInput.value;
      calculateEmi();
    });

    tenureUnitMonths.addEventListener('change', () => {
      tenureSlider.min = 6;
      tenureSlider.max = 360;
      if (parseInt(tenureInput.value, 10) <= 30) {
        tenureInput.value = parseInt(tenureInput.value, 10) * 12;
      }
      tenureSlider.value = tenureInput.value;
      calculateEmi();
    });
  }

  // Reset Button
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      amountSlider.value = 50000;
      amountInput.value = 50000;
      rateSlider.value = 8.5;
      rateInput.value = 8.5;
      if (tenureUnitYears) tenureUnitYears.checked = true;
      tenureSlider.min = 1;
      tenureSlider.max = 30;
      tenureSlider.value = 5;
      tenureInput.value = 5;
      calculateEmi();
      if (window.showToast) window.showToast('Calculator reset to default values', 'info');
    });
  }

  function calculateEmi() {
    const P = parseFloat(amountInput.value) || 0;
    const annualRate = parseFloat(rateInput.value) || 0;
    const isYears = tenureUnitYears ? tenureUnitYears.checked : true;
    const rawTenure = parseFloat(tenureInput.value) || 1;
    const n = Math.round(isYears ? rawTenure * 12 : rawTenure);

    let monthlyEmi = 0;
    let totalRepayment = 0;
    let totalInterest = 0;

    if (P > 0 && n > 0) {
      if (annualRate <= 0) {
        // Zero-interest condition
        monthlyEmi = P / n;
        totalInterest = 0;
        totalRepayment = P;
      } else {
        const r = (annualRate / 12) / 100;
        const rateFactor = Math.pow(1 + r, n);
        monthlyEmi = (P * r * rateFactor) / (rateFactor - 1);
        totalRepayment = monthlyEmi * n;
        totalInterest = totalRepayment - P;
      }
    }

    // Update Text Displays
    monthlyEmiDisplay.textContent = `$${Math.round(monthlyEmi).toLocaleString()}`;
    if (principalDisplay) principalDisplay.textContent = `$${Math.round(P).toLocaleString()}`;
    if (totalInterestDisplay) totalInterestDisplay.textContent = `$${Math.round(totalInterest).toLocaleString()}`;
    if (totalRepaymentDisplay) totalRepaymentDisplay.textContent = `$${Math.round(totalRepayment).toLocaleString()}`;

    // Update or Create Chart
    updateChart(P, totalInterest);

    // Update Amortization Preview Table
    updateAmortization(P, annualRate, n, monthlyEmi);
  }

  function updateChart(principal, interest) {
    if (!chartCanvas || typeof Chart === 'undefined') return;

    const ctx = chartCanvas.getContext('2d');
    const data = [Math.round(principal), Math.max(0, Math.round(interest))];

    if (!emiChart) {
      emiChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Principal Amount', 'Total Interest'],
          datasets: [{
            data: data,
            backgroundColor: ['#10B981', '#3B82F6'],
            borderColor: '#0F1A36',
            borderWidth: 4,
            hoverOffset: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: '#CBD5E1',
                font: { family: 'Plus Jakarta Sans', size: 12 },
                padding: 16
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return ` ${context.label}: $${context.raw.toLocaleString()}`;
                }
              }
            }
          },
          cutout: '70%'
        }
      });
    } else {
      emiChart.data.datasets[0].data = data;
      emiChart.update();
    }
  }

  function updateAmortization(P, annualRate, totalMonths, emi) {
    if (!amortizationTableBody) return;

    amortizationTableBody.innerHTML = '';
    const r = (annualRate / 12) / 100;
    let balance = P;

    const sampleMonths = [1, 2, 3, 6, 12, Math.min(24, totalMonths), totalMonths];
    const uniqueMonths = [...new Set(sampleMonths.filter(m => m <= totalMonths))].sort((a,b) => a - b);

    let currentBalance = P;
    const rowMap = {};

    for (let m = 1; m <= totalMonths; m++) {
      let interestPart = annualRate > 0 ? currentBalance * r : 0;
      let principalPart = emi - interestPart;
      currentBalance -= principalPart;
      if (currentBalance < 0) currentBalance = 0;

      if (uniqueMonths.includes(m)) {
        rowMap[m] = {
          month: m,
          emi: emi,
          principal: principalPart,
          interest: interestPart,
          balance: currentBalance
        };
      }
    }

    uniqueMonths.forEach(m => {
      const data = rowMap[m];
      if (!data) return;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="font-semibold text-white">Month ${data.month}</td>
        <td>$${Math.round(data.emi).toLocaleString()}</td>
        <td class="text-emerald">$${Math.round(data.principal).toLocaleString()}</td>
        <td class="text-info">$${Math.round(data.interest).toLocaleString()}</td>
        <td class="font-semibold text-slate-300">$${Math.round(data.balance).toLocaleString()}</td>
      `;
      amortizationTableBody.appendChild(tr);
    });
  }

  // Initial Calculation
  calculateEmi();
}
