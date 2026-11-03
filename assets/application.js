/**
 * Credora Finance — Multi-Step Loan Application Engine
 * 5-Step Demonstrative Loan Onboarding Flow
 */

document.addEventListener('DOMContentLoaded', () => {
  initLoanApplicationWizard();
});

function initLoanApplicationWizard() {
  const wizardContainer = document.getElementById('loanApplicationWizard');
  if (!wizardContainer) return;

  let currentStep = 1;
  const totalSteps = 5;

  const appData = {
    personal: {},
    employment: {},
    loan: {},
    financial: {}
  };

  // Selectors
  const stepPanels = document.querySelectorAll('.wizard-step-panel');
  const stepIndicators = document.querySelectorAll('.step-indicator-item');
  const progressBar = document.getElementById('wizardProgressBar');
  const progressText = document.getElementById('wizardProgressText');

  // Step 1 Inputs
  const fullName = document.getElementById('appFullName');
  const dob = document.getElementById('appDob');
  const email = document.getElementById('appEmail');
  const phone = document.getElementById('appPhone');
  const address = document.getElementById('appAddress');

  // Step 2 Inputs
  const empType = document.getElementById('appEmpType');
  const employerName = document.getElementById('appEmployerName');
  const monthlyIncome = document.getElementById('appMonthlyIncome');
  const empDuration = document.getElementById('appEmpDuration');

  // Step 3 Inputs
  const loanCategory = document.getElementById('appLoanCategory');
  const loanAmount = document.getElementById('appLoanAmount');
  const loanTenure = document.getElementById('appLoanTenure');
  const loanPurpose = document.getElementById('appLoanPurpose');

  // Step 4 Inputs
  const existingObligations = document.getElementById('appExistingObligations');
  const repaymentPref = document.getElementById('appRepaymentPref');
  const additionalRemarks = document.getElementById('appRemarks');

  // Step 5 Review Elements
  const termsCheckbox = document.getElementById('appTermsCheck');
  const reviewContainer = document.getElementById('applicationReviewSummary');
  const successModal = document.getElementById('applicationSuccessModal');
  const successRefNumber = document.getElementById('generatedAppRef');

  function updateWizardUI() {
    stepPanels.forEach((panel, idx) => {
      panel.classList.toggle('active', idx + 1 === currentStep);
    });

    stepIndicators.forEach((ind, idx) => {
      const stepNum = idx + 1;
      ind.classList.remove('active', 'completed');
      if (stepNum === currentStep) {
        ind.classList.add('active');
      } else if (stepNum < currentStep) {
        ind.classList.add('completed');
      }
    });

    const percent = Math.round((currentStep / totalSteps) * 100);
    if (progressBar) progressBar.style.width = `${percent}%`;
    if (progressText) progressText.textContent = `Step ${currentStep} of ${totalSteps} (${percent}%)`;

    // Populate review if on step 5
    if (currentStep === 5) {
      populateReview();
    }

    window.scrollTo({ top: wizardContainer.offsetTop - 100, behavior: 'smooth' });
  }

  // Step 1 Validation
  function validateStep1() {
    let valid = true;
    [fullName, dob, email, phone, address].forEach(el => window.ValidationUtils.clearError(el));

    if (!fullName.value.trim() || fullName.value.trim().length < 3) {
      window.ValidationUtils.showError(fullName, 'Please enter your full legal name');
      valid = false;
    }
    if (!dob.value) {
      window.ValidationUtils.showError(dob, 'Please provide your date of birth');
      valid = false;
    }
    if (!window.ValidationUtils.isValidEmail(email.value)) {
      window.ValidationUtils.showError(email, 'Please enter a valid email');
      valid = false;
    }
    if (!window.ValidationUtils.isValidPhone(phone.value)) {
      window.ValidationUtils.showError(phone, 'Please provide a valid contact number');
      valid = false;
    }
    if (!address.value.trim() || address.value.trim().length < 5) {
      window.ValidationUtils.showError(address, 'Please provide your residential address');
      valid = false;
    }

    if (valid) {
      appData.personal = {
        name: fullName.value.trim(),
        dob: dob.value,
        email: email.value.trim(),
        phone: phone.value.trim(),
        address: address.value.trim()
      };
    }
    return valid;
  }

  // Step 2 Validation
  function validateStep2() {
    let valid = true;
    [empType, employerName, monthlyIncome, empDuration].forEach(el => window.ValidationUtils.clearError(el));

    if (!empType.value) {
      window.ValidationUtils.showError(empType, 'Please select your employment status');
      valid = false;
    }
    if (!employerName.value.trim()) {
      window.ValidationUtils.showError(employerName, 'Please specify employer or registered business name');
      valid = false;
    }
    const incomeVal = parseFloat(monthlyIncome.value);
    if (isNaN(incomeVal) || incomeVal <= 0) {
      window.ValidationUtils.showError(monthlyIncome, 'Please enter a valid monthly net income');
      valid = false;
    }
    if (!empDuration.value) {
      window.ValidationUtils.showError(empDuration, 'Please select duration in current role');
      valid = false;
    }

    if (valid) {
      appData.employment = {
        type: empType.value,
        employer: employerName.value.trim(),
        income: incomeVal,
        duration: empDuration.value
      };
    }
    return valid;
  }

  // Step 3 Validation
  function validateStep3() {
    let valid = true;
    [loanCategory, loanAmount, loanTenure, loanPurpose].forEach(el => window.ValidationUtils.clearError(el));

    if (!loanCategory.value) {
      window.ValidationUtils.showError(loanCategory, 'Please select a loan product category');
      valid = false;
    }
    const amt = parseFloat(loanAmount.value);
    if (isNaN(amt) || amt < 500) {
      window.ValidationUtils.showError(loanAmount, 'Requested amount must be at least $500');
      valid = false;
    }
    if (!loanTenure.value) {
      window.ValidationUtils.showError(loanTenure, 'Please select desired tenure');
      valid = false;
    }
    if (!loanPurpose.value.trim() || loanPurpose.value.trim().length < 4) {
      window.ValidationUtils.showError(loanPurpose, 'Please briefly describe the purpose of the loan');
      valid = false;
    }

    if (valid) {
      appData.loan = {
        category: loanCategory.value,
        amount: amt,
        tenure: loanTenure.value,
        purpose: loanPurpose.value.trim()
      };
    }
    return valid;
  }

  // Step 4 Validation
  function validateStep4() {
    let valid = true;
    [existingObligations, repaymentPref].forEach(el => window.ValidationUtils.clearError(el));

    const obligations = parseFloat(existingObligations.value);
    if (isNaN(obligations) || obligations < 0) {
      window.ValidationUtils.showError(existingObligations, 'Please enter existing monthly debt service ($0 if none)');
      valid = false;
    }
    if (!repaymentPref.value) {
      window.ValidationUtils.showError(repaymentPref, 'Please select preferred payment frequency');
      valid = false;
    }

    if (valid) {
      appData.financial = {
        obligations: obligations,
        repaymentPref: repaymentPref.value,
        remarks: additionalRemarks ? additionalRemarks.value.trim() : ''
      };
    }
    return valid;
  }

  function populateReview() {
    if (!reviewContainer) return;
    reviewContainer.innerHTML = `
      <div class="review-grid grid-2">
        <div class="card card-glass">
          <div class="d-flex justify-between align-center mb-2">
            <h5 class="text-white"><i class="fas fa-user text-emerald mr-2"></i> Personal Details</h5>
            <button type="button" class="btn btn-sm btn-outline-emerald jump-step-btn" data-target-step="1">Edit</button>
          </div>
          <p class="text-sm text-slate-300"><strong>Name:</strong> ${appData.personal.name || '-'}</p>
          <p class="text-sm text-slate-300"><strong>Email:</strong> ${appData.personal.email || '-'}</p>
          <p class="text-sm text-slate-300"><strong>Phone:</strong> ${appData.personal.phone || '-'}</p>
          <p class="text-sm text-slate-300"><strong>DOB:</strong> ${appData.personal.dob || '-'}</p>
          <p class="text-sm text-slate-300"><strong>Address:</strong> ${appData.personal.address || '-'}</p>
        </div>

        <div class="card card-glass">
          <div class="d-flex justify-between align-center mb-2">
            <h5 class="text-white"><i class="fas fa-briefcase text-emerald mr-2"></i> Employment Details</h5>
            <button type="button" class="btn btn-sm btn-outline-emerald jump-step-btn" data-target-step="2">Edit</button>
          </div>
          <p class="text-sm text-slate-300"><strong>Status:</strong> ${appData.employment.type || '-'}</p>
          <p class="text-sm text-slate-300"><strong>Employer:</strong> ${appData.employment.employer || '-'}</p>
          <p class="text-sm text-slate-300"><strong>Monthly Net:</strong> $${(appData.employment.income || 0).toLocaleString()}</p>
          <p class="text-sm text-slate-300"><strong>Tenure at Role:</strong> ${appData.employment.duration || '-'}</p>
        </div>

        <div class="card card-glass">
          <div class="d-flex justify-between align-center mb-2">
            <h5 class="text-white"><i class="fas fa-hand-holding-usd text-emerald mr-2"></i> Loan Request</h5>
            <button type="button" class="btn btn-sm btn-outline-emerald jump-step-btn" data-target-step="3">Edit</button>
          </div>
          <p class="text-sm text-slate-300"><strong>Category:</strong> ${appData.loan.category || '-'}</p>
          <p class="text-sm text-slate-300"><strong>Requested Amount:</strong> $${(appData.loan.amount || 0).toLocaleString()}</p>
          <p class="text-sm text-slate-300"><strong>Requested Tenure:</strong> ${appData.loan.tenure || '-'}</p>
          <p class="text-sm text-slate-300"><strong>Purpose:</strong> ${appData.loan.purpose || '-'}</p>
        </div>

        <div class="card card-glass">
          <div class="d-flex justify-between align-center mb-2">
            <h5 class="text-white"><i class="fas fa-wallet text-emerald mr-2"></i> Financial Profile</h5>
            <button type="button" class="btn btn-sm btn-outline-emerald jump-step-btn" data-target-step="4">Edit</button>
          </div>
          <p class="text-sm text-slate-300"><strong>Existing Obligations:</strong> $${(appData.financial.obligations || 0).toLocaleString()} /mo</p>
          <p class="text-sm text-slate-300"><strong>Repayment Channel:</strong> ${appData.financial.repaymentPref || '-'}</p>
          <p class="text-sm text-slate-300"><strong>Remarks:</strong> ${appData.financial.remarks || 'None'}</p>
        </div>
      </div>
    `;

    // Hook up jump buttons
    reviewContainer.querySelectorAll('.jump-step-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = parseInt(btn.getAttribute('data-target-step'), 10);
        if (target >= 1 && target <= 4) {
          currentStep = target;
          updateWizardUI();
        }
      });
    });
  }

  // Next Step Handlers
  wizardContainer.querySelectorAll('.btn-wizard-next').forEach(btn => {
    btn.addEventListener('click', () => {
      let isValid = false;
      if (currentStep === 1) isValid = validateStep1();
      else if (currentStep === 2) isValid = validateStep2();
      else if (currentStep === 3) isValid = validateStep3();
      else if (currentStep === 4) isValid = validateStep4();

      if (isValid) {
        currentStep++;
        updateWizardUI();
      } else {
        window.showToast('Please fulfill all required fields for this stage.', 'error');
      }
    });
  });

  // Previous Step Handlers
  wizardContainer.querySelectorAll('.btn-wizard-prev').forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentStep > 1) {
        currentStep--;
        updateWizardUI();
      }
    });
  });

  // Allow clicking on previous completed step indicators
  stepIndicators.forEach((ind, idx) => {
    ind.addEventListener('click', () => {
      const targetStep = idx + 1;
      if (targetStep < currentStep) {
        currentStep = targetStep;
        updateWizardUI();
      }
    });
  });

  // Final Demo Submit
  const submitBtn = document.getElementById('btnSubmitApplicationDemo');
  if (submitBtn) {
    submitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (!termsCheckbox || !termsCheckbox.checked) {
        window.showToast('Please confirm and acknowledge the demonstration terms before submitting.', 'error');
        return;
      }

      // Generate Fictional Demo Reference Number
      const randomRef = 'CRD-DEMO-' + Math.floor(100000 + Math.random() * 900000);
      if (successRefNumber) successRefNumber.textContent = randomRef;

      // Save to sessionStorage for dashboard reference
      sessionStorage.setItem('last_submitted_loan', JSON.stringify({
        ref: randomRef,
        amount: appData.loan.amount,
        category: appData.loan.category,
        date: new Date().toLocaleDateString(),
        status: 'Under Review'
      }));

      // Display Success Modal
      if (successModal) {
        successModal.style.display = 'flex';
        successModal.classList.add('show');
      }
      window.showToast('Demo application submitted for simulated underwriting!', 'success');
    });
  }

  // Initialize
  updateWizardUI();
}
