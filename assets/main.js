/**
 * Credora Finance — Core JavaScript
 * Fictional Demo Financial Platform
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initAccordions();
  initCtaAudit();
  initBackToTop();
});

// Initialize Page Preloader immediately
initPageLoader();

/**
 * High-Tech Fintech Page Preloader Controller
 */
function initPageLoader() {
  function handleDismiss() {
    const loader = document.getElementById('pageLoader');
    if (!loader || loader.classList.contains('loaded')) return;
    loader.classList.add('loaded');
    setTimeout(() => {
      loader.style.display = 'none';
    }, 520);
  }

  // Dismiss on full window load with graceful minimum display
  if (document.readyState === 'complete') {
    setTimeout(handleDismiss, 250);
  } else {
    window.addEventListener('load', () => {
      setTimeout(handleDismiss, 320);
    });
  }

  // Failsafe timer (guarantees loader disappears within 1.2s under all conditions)
  setTimeout(handleDismiss, 1200);
}

/**
 * Navigation Bar Scroll & Mobile Menu Handler
 */
function initNavbar() {
  const header = document.querySelector('.site-header');
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  if (mobileToggle && navMenu) {
    let backdrop = document.querySelector('.nav-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'nav-backdrop';
      document.body.appendChild(backdrop);
    }

    function openMenu() {
      mobileToggle.classList.add('active');
      navMenu.classList.add('open');
      backdrop.classList.add('active');
      document.body.classList.add('menu-open');
      document.documentElement.classList.add('menu-open');
      mobileToggle.setAttribute('aria-expanded', 'true');
    }

    function closeMenu() {
      mobileToggle.classList.remove('active');
      navMenu.classList.remove('open');
      backdrop.classList.remove('active');
      document.body.classList.remove('menu-open');
      document.documentElement.classList.remove('menu-open');
      mobileToggle.setAttribute('aria-expanded', 'false');
    }

    window.closeNavMenu = closeMenu;

    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (navMenu.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    backdrop.addEventListener('click', closeMenu);
    backdrop.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

    // Close when clicking outside or on a link
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target) && navMenu.classList.contains('open')) {
        closeMenu();
      }
    });

    navMenu.querySelectorAll('.nav-link, .btn-header-login, .btn-header-signup').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 1024 && navMenu.classList.contains('open')) {
        closeMenu();
      }
    });
  }
}

/**
 * Accordion Component Handler
 */
function initAccordions() {
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const parentItem = header.closest('.accordion-item');
      const accordion = parentItem.parentElement;
      const isOpen = parentItem.classList.contains('active');

      // Close siblings if in standard accordion
      accordion.querySelectorAll('.accordion-item').forEach(item => {
        item.classList.remove('active');
      });

      if (!isOpen) {
        parentItem.classList.add('active');
      }
    });
  });
}

/**
 * Toast Notification System
 */
window.showToast = function(message, type = 'info', duration = 3500) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let iconClass = 'fa-info-circle';
  if (type === 'success') iconClass = 'fa-check-circle text-emerald';
  if (type === 'error') iconClass = 'fa-exclamation-triangle text-danger';

  toast.innerHTML = `
    <i class="fas ${iconClass}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, duration);
};

/**
 * Mandatory CTA Rule Enforcement
 * "EVERY NORMAL CTA BUTTON MUST REDIRECT TO '404.html'."
 * Exceptions: Header navigation, Login/Signup, Calculator, Application wizard, Dashboard, 404 recovery.
 */
function initCtaAudit() {
  // Select all links with empty or '#' or marked as generic cta
  document.querySelectorAll('a').forEach(anchor => {
    const href = anchor.getAttribute('href');
    if (!href || href === '#' || href === 'javascript:void(0)') {
      // If it has a specific action data attribute, let it be handled by action listeners
      if (!anchor.hasAttribute('data-action') && !anchor.hasAttribute('data-role')) {
        anchor.setAttribute('href', '404.html');
      }
    }
  });

  // Any marketing CTA button that doesn't have an explicit destination
  document.querySelectorAll('button.btn-cta, a.btn-cta').forEach(el => {
    el.addEventListener('click', (e) => {
      if (el.tagName.toLowerCase() === 'button') {
        e.preventDefault();
        window.location.href = '404.html';
      }
    });
  });
}

/**
 * Back to top helper
 */
function initBackToTop() {
  const backToTopBtn = document.querySelector('.back-to-top');
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 500) {
        backToTopBtn.style.opacity = '1';
        backToTopBtn.style.pointerEvents = 'auto';
      } else {
        backToTopBtn.style.opacity = '0';
        backToTopBtn.style.pointerEvents = 'none';
      }
    });
    backToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}
