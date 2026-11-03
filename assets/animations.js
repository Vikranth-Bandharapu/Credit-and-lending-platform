/**
 * Credora Finance — Animation & 3D Interactive Engine
 * Uses AOS, GSAP & ScrollTrigger, with prefers-reduced-motion support
 */

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Initialize AOS if available and not reduced motion
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: prefersReducedMotion ? 0 : 750,
      easing: 'ease-out-cubic',
      once: true,
      offset: 40,
      disable: prefersReducedMotion
    });
  }

  // Initialize 3D Card Tilt effects
  if (!prefersReducedMotion) {
    init3DTilt();
  }

  // Initialize GSAP animations if available
  if (typeof gsap !== 'undefined' && !prefersReducedMotion) {
    initGsapEffects();
  } else {
    // Fallback: immediately show counters without animation
    document.querySelectorAll('[data-counter]').forEach(el => {
      el.textContent = el.getAttribute('data-counter');
    });
  }
});

/**
 * 3D Interactive Mouse-Follow Card Tilt
 */
function init3DTilt() {
  const tiltCards = document.querySelectorAll('.tilt-card');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
      card.style.transition = 'transform 0.4s ease';
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'none';
    });
  });
}

/**
 * GSAP & ScrollTrigger Motion Suite
 */
function initGsapEffects() {
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  // Hero 3D Board Floating Parallax
  const heroBoard = document.querySelector('.hero-3d-board');
  if (heroBoard) {
    gsap.to(heroBoard, {
      y: -18,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  }

  // Number Counter Animation via ScrollTrigger
  const counterElements = document.querySelectorAll('[data-counter]');
  counterElements.forEach(counter => {
    const rawTarget = counter.getAttribute('data-counter');
    const prefix = counter.getAttribute('data-prefix') || '';
    const suffix = counter.getAttribute('data-suffix') || '';
    const numericTarget = parseFloat(rawTarget.replace(/[^0-9.]/g, ''));

    if (isNaN(numericTarget)) {
      counter.textContent = rawTarget;
      return;
    }

    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.create({
        trigger: counter,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          const obj = { val: 0 };
          gsap.to(obj, {
            val: numericTarget,
            duration: 1.8,
            ease: 'power2.out',
            onUpdate: () => {
              if (rawTarget.includes('.')) {
                counter.textContent = prefix + obj.val.toFixed(1) + suffix;
              } else {
                counter.textContent = prefix + Math.floor(obj.val).toLocaleString() + suffix;
              }
            }
          });
        }
      });
    } else {
      counter.textContent = rawTarget;
    }
  });
}
