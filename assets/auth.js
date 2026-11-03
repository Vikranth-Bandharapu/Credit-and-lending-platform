/**
 * Credora Finance — Authentication & Role Router (Demo Simulation)
 * Strictly client-side demonstration. Never stores sensitive passwords in localStorage or cookies.
 */

document.addEventListener('DOMContentLoaded', () => {
  initSignupForm();
  initLoginForm();
});

/**
 * Sign Up Form Handler
 */
function initSignupForm() {
  const form = document.getElementById('signupForm');
  if (!form) return;

  const nameInput = document.getElementById('signupName');
  const emailInput = document.getElementById('signupEmail');
  const phoneInput = document.getElementById('signupPhone');
  const passwordInput = document.getElementById('signupPassword');
  const confirmPasswordInput = document.getElementById('signupConfirmPassword');
  const strengthBar = document.getElementById('passwordStrengthBar');
  const strengthLabel = document.getElementById('passwordStrengthLabel');

  // Password Strength Live Listener
  if (passwordInput && strengthBar && strengthLabel) {
    passwordInput.addEventListener('input', () => {
      const result = window.ValidationUtils.evaluatePassword(passwordInput.value);
      let width = '0%';
      let color = '#EF4444';
      let text = 'Too Weak';

      if (result.score === 1 || result.score === 2) {
        width = '40%';
        color = '#F59E0B';
        text = 'Moderate';
      } else if (result.score === 3 || result.score === 4) {
        width = '75%';
        color = '#3B82F6';
        text = 'Strong';
      } else if (result.score === 5) {
        width = '100%';
        color = '#10B981';
        text = 'Excellent';
      }

      strengthBar.style.width = width;
      strengthBar.style.backgroundColor = color;
      strengthLabel.textContent = text;
      strengthLabel.style.color = color;
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let hasError = false;

    // Reset errors
    [nameInput, emailInput, phoneInput, passwordInput, confirmPasswordInput].forEach(el => {
      if (el) window.ValidationUtils.clearError(el);
    });

    if (!nameInput.value.trim() || nameInput.value.trim().length < 2) {
      window.ValidationUtils.showError(nameInput, 'Please provide your full legal name');
      hasError = true;
    }

    if (!window.ValidationUtils.isValidEmail(emailInput.value)) {
      window.ValidationUtils.showError(emailInput, 'Please enter a valid email address');
      hasError = true;
    }

    if (!window.ValidationUtils.isValidPhone(phoneInput.value)) {
      window.ValidationUtils.showError(phoneInput, 'Please enter a valid phone number (min 7 digits)');
      hasError = true;
    }

    if (!passwordInput.value || passwordInput.value.length < 6) {
      window.ValidationUtils.showError(
        passwordInput,
        'Password must be at least 6 characters'
      );
      hasError = true;
    }

    if (confirmPasswordInput.value !== passwordInput.value) {
      window.ValidationUtils.showError(confirmPasswordInput, 'Passwords do not match');
      hasError = true;
    }

    if (hasError) {
      window.showToast('Please correct the highlighted errors before continuing.', 'error');
      return;
    }

    // Success simulation — save user profile
    sessionStorage.setItem('credora_demo_user', JSON.stringify({
      name: nameInput.value.trim(),
      email: emailInput.value.trim()
    }));

    window.showToast('Account registered successfully! Redirecting to login...', 'success');

    setTimeout(() => {
      window.location.href = 'login.html';
    }, 600);
  });
}

/**
 * Login Form Handler
 */
function initLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');
  const roleSelect = document.getElementById('loginRole');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let hasError = false;

    // Reset errors
    if (emailInput) window.ValidationUtils.clearError(emailInput);
    if (passwordInput) window.ValidationUtils.clearError(passwordInput);
    if (roleSelect) window.ValidationUtils.clearError(roleSelect);

    if (!window.ValidationUtils.isValidEmail(emailInput.value)) {
      window.ValidationUtils.showError(emailInput, 'Please enter a valid email address');
      hasError = true;
    }

    if (!passwordInput.value || passwordInput.value.trim().length < 6) {
      window.ValidationUtils.showError(passwordInput, 'Please enter your password (min 6 characters)');
      hasError = true;
    }

    if (roleSelect && (!roleSelect.value || (roleSelect.value !== 'Admin' && roleSelect.value !== 'Customer'))) {
      window.ValidationUtils.showError(roleSelect, 'Please select your role');
      hasError = true;
    }

    if (hasError) {
      window.showToast('Please correct the highlighted errors before continuing.', 'error');
      return;
    }

    // Role-based auto-detection
    const emailVal = emailInput.value.trim().toLowerCase();
    let role = 'Customer';

    if (roleSelect && roleSelect.value) {
      role = roleSelect.value;
    } else {
      const stored = sessionStorage.getItem('credora_demo_user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.email && parsed.email.toLowerCase() === emailVal && parsed.role) {
            role = parsed.role;
          }
        } catch (_) {}
      }
      if (emailVal.includes('admin')) {
        role = 'Admin';
      }
    }

    sessionStorage.setItem('credora_auth_role', role);
    sessionStorage.setItem('credora_auth_email', emailInput.value.trim());

    if (role === 'Admin') {
      window.showToast('Welcome, Administrator! Launching Operations Center...', 'success');
      setTimeout(() => {
        window.location.href = 'admin-dashboard.html';
      }, 700);
    } else {
      window.showToast('Welcome back! Opening your Financial Workspace...', 'success');
      setTimeout(() => {
        window.location.href = 'customer-dashboard.html';
      }, 700);
    }
  });
}
