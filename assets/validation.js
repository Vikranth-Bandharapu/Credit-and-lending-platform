/**
 * Credora Finance — Form Validation Suite
 * Provides robust client-side validation, password strength scoring, and inline error handling.
 */

const ValidationUtils = {
  isValidEmail(email) {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).trim());
  },

  isValidPhone(phone) {
    const digits = String(phone).replace(/\D/g, '');
    return digits.length >= 7 && digits.length <= 15;
  },

  evaluatePassword(pwd) {
    const minLength = pwd.length >= 6;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);

    let score = 0;
    if (pwd.length >= 8) score++;
    if (hasUpper) score++;
    if (hasLower) score++;
    if (hasNumber) score++;
    if (hasSpecial) score++;

    return {
      minLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial,
      isValid: pwd.length >= 6,
      score: Math.max(1, score)
    };
  },

  showError(inputElement, message) {
    inputElement.classList.add('is-invalid');
    inputElement.setAttribute('aria-invalid', 'true');
    const formGroup = inputElement.closest('.form-group');
    if (formGroup) {
      let errorSpan = formGroup.querySelector('.form-error');
      if (!errorSpan) {
        errorSpan = document.createElement('div');
        errorSpan.className = 'form-error visible';
        formGroup.appendChild(errorSpan);
      }
      errorSpan.textContent = message;
      errorSpan.classList.add('visible');
    }
  },

  clearError(inputElement) {
    inputElement.classList.remove('is-invalid');
    inputElement.removeAttribute('aria-invalid');
    const formGroup = inputElement.closest('.form-group');
    if (formGroup) {
      const errorSpan = formGroup.querySelector('.form-error');
      if (errorSpan) {
        errorSpan.textContent = '';
        errorSpan.classList.remove('visible');
      }
    }
  }
};

if (typeof window !== 'undefined') {
  window.ValidationUtils = ValidationUtils;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ValidationUtils;
}

