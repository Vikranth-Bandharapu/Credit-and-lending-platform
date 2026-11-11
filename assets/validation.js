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
  },

  validateField(field) {
    const val = String(field.value || '').trim();
    const type = (field.getAttribute('type') || '').toLowerCase();
    const customMsg = field.getAttribute('data-error-msg');
    const minLen = parseInt(field.getAttribute('minlength') || '0', 10);
    const isRequired = field.hasAttribute('required');

    this.clearError(field);

    if (type === 'email') {
      if (!val || !this.isValidEmail(val)) {
        this.showError(field, customMsg || 'Please enter a valid email address.');
        return false;
      }
      return true;
    }

    if (type === 'tel') {
      if (!val || !this.isValidPhone(val)) {
        this.showError(field, customMsg || 'Please enter a valid phone number.');
        return false;
      }
      return true;
    }

    if (field.tagName.toLowerCase() === 'select') {
      if (isRequired && !val) {
        this.showError(field, customMsg || 'Please select an option.');
        return false;
      }
      return true;
    }

    if (minLen > 0 && val.length < minLen) {
      this.showError(field, customMsg || `Please enter at least ${minLen} characters.`);
      return false;
    }

    if (isRequired && !val) {
      this.showError(field, customMsg || 'This field is required.');
      return false;
    }

    return true;
  },

  initValidatedRedirectForms() {
    if (typeof document === 'undefined') return;
    const forms = document.querySelectorAll('form[data-validate-redirect]');
    forms.forEach(form => {
      if (form.dataset.validationBound === 'true') return;
      form.dataset.validationBound = 'true';

      const fields = Array.from(form.querySelectorAll('input, select, textarea')).filter(el => {
        const t = (el.getAttribute('type') || '').toLowerCase();
        return !el.disabled && t !== 'hidden' && t !== 'submit' && t !== 'button';
      });

      fields.forEach(field => {
        const evt = field.tagName.toLowerCase() === 'select' ? 'change' : 'input';
        field.addEventListener(evt, () => {
          if (field.classList.contains('is-invalid')) {
            this.validateField(field);
          }
        });
      });

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        let allValid = true;
        let firstInvalid = null;

        fields.forEach(field => {
          const ok = this.validateField(field);
          if (!ok) {
            allValid = false;
            if (!firstInvalid) firstInvalid = field;
          }
        });

        if (!allValid) {
          if (firstInvalid) firstInvalid.focus();
          if (typeof window.showToast === 'function') {
            window.showToast('Please enter valid details before submitting.', 'error');
          }
          return;
        }

        const redirectTarget = form.getAttribute('data-validate-redirect') || '404.html';
        window.location.href = redirectTarget;
      });
    });
  }
};

if (typeof window !== 'undefined') {
  window.ValidationUtils = ValidationUtils;
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
      ValidationUtils.initValidatedRedirectForms();
    });
  }
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ValidationUtils;
}

