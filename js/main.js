/* =========================================================
   HW FanVL — main.js
   Core interactions: nav, mobile menu, smooth scroll,
   scroll reveal, back-to-top, form validation, counter.
   No external dependencies.
   ========================================================= */

(function () {
  'use strict';

  const doc = document.documentElement;
  const body = document.body;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isCoarse = window.matchMedia('(pointer: coarse)').matches;

  /* --------------------------------------------------------
     1. Nav: scroll state, mobile menu, active link
     -------------------------------------------------------- */
  const nav = document.querySelector('[data-nav]');
  const navProgress = document.querySelector('[data-nav-progress]');
  const navToggle = document.querySelector('[data-nav-toggle]');
  const mobileDrawer = document.querySelector('[data-mobile-drawer]');

  function updateNavOnScroll() {
    const y = window.scrollY || doc.scrollTop;
    if (!nav) return;
    nav.classList.toggle('nav--scrolled', y > 24);
    if (navProgress) {
      const max = (doc.scrollHeight - window.innerHeight) || 1;
      const pct = Math.min(100, Math.max(0, (y / max) * 100));
      navProgress.style.width = pct + '%';
    }
  }

  function toggleMobileMenu(force) {
    if (!navToggle || !mobileDrawer) return;
    const isOpen = typeof force === 'boolean' ? force : !mobileDrawer.classList.contains('is-open');
    mobileDrawer.classList.toggle('is-open', isOpen);
    navToggle.classList.toggle('is-open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    body.classList.toggle('no-scroll', isOpen);
  }

  if (navToggle) {
    navToggle.addEventListener('click', () => toggleMobileMenu());
  }
  if (mobileDrawer) {
    mobileDrawer.addEventListener('click', (e) => {
      if (e.target.closest('a')) toggleMobileMenu(false);
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileDrawer && mobileDrawer.classList.contains('is-open')) {
      toggleMobileMenu(false);
    }
  });

  // Active link highlight based on current URL
  (function highlightActiveLink() {
    if (!nav) return;
    const path = location.pathname.replace(/\/+$/, '') || '/';
    const file = path.split('/').pop() || 'index.html';
    nav.querySelectorAll('[data-nav-link]').forEach((link) => {
      const href = (link.getAttribute('href') || '').split('#')[0].split('/').pop();
      if (!href) return;
      if (href === file || (file === '' && href === 'index.html')) {
        link.classList.add('is-active');
        link.setAttribute('aria-current', 'page');
      }
    });
  })();

  // Scroll listener (passive, throttled via rAF)
  let scrollTick = false;
  function onScroll() {
    if (scrollTick) return;
    scrollTick = true;
    requestAnimationFrame(() => {
      updateNavOnScroll();
      updateBackToTop();
      scrollTick = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  updateNavOnScroll();


  /* --------------------------------------------------------
     2. Smooth scroll for in-page anchors
     -------------------------------------------------------- */
  function smoothScrollTo(target) {
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY - 70;
    window.scrollTo({ top, behavior: reducedMotion ? 'auto' : 'smooth' });
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || href === '#' || href.length < 2) return;
    const tgt = document.querySelector(href);
    if (!tgt) return;
    e.preventDefault();
    smoothScrollTo(tgt);
    if (mobileDrawer && mobileDrawer.classList.contains('is-open')) toggleMobileMenu(false);
  });


  /* --------------------------------------------------------
     3. Scroll reveal via IntersectionObserver
     -------------------------------------------------------- */
  const revealTargets = document.querySelectorAll(
    '.reveal, .reveal-up, .reveal-down, .reveal-left, .reveal-right, ' +
    '.reveal-scale, .reveal-fade, .reveal-stagger, [data-anim], ' +
    '.section-head, .footer'
  );
  if ('IntersectionObserver' in window && revealTargets.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          if (!entry.target.hasAttribute('data-reveal-repeat')) io.unobserve(entry.target);
        } else if (entry.target.hasAttribute('data-reveal-repeat')) {
          entry.target.classList.remove('is-visible');
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  }


  /* --------------------------------------------------------
     4. Back-to-top button
     -------------------------------------------------------- */
  const backTop = document.querySelector('[data-back-top]');
  function updateBackToTop() {
    if (!backTop) return;
    backTop.classList.toggle('is-visible', (window.scrollY || 0) > 600);
  }
  if (backTop) {
    backTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    });
  }


  /* --------------------------------------------------------
     5. Top scroll progress bar
     -------------------------------------------------------- */
  const scrollProgress = document.querySelector('[data-scroll-progress]');
  function updateScrollProgress() {
    if (!scrollProgress) return;
    const y = window.scrollY || 0;
    const max = (doc.scrollHeight - window.innerHeight) || 1;
    const pct = Math.min(100, Math.max(0, (y / max) * 100));
    scrollProgress.style.width = pct + '%';
  }
  if (scrollProgress) {
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress();
  }


  /* --------------------------------------------------------
     6. Counter / number ticker
     -------------------------------------------------------- */
  const counters = document.querySelectorAll('[data-counter]');
  function animateCounter(el) {
    const target = parseFloat(el.getAttribute('data-counter')) || 0;
    const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    const duration = parseInt(el.getAttribute('data-duration') || '1800', 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const startVal = 0;
    const startTime = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = startVal + (target - startVal) * eased;
      el.textContent = current.toFixed(decimals) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if ('IntersectionObserver' in window && counters.length) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          cio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    counters.forEach((c) => cio.observe(c));
  } else {
    counters.forEach((c) => (c.textContent = (c.getAttribute('data-counter') || '0') + (c.getAttribute('data-suffix') || '')));
  }


  /* --------------------------------------------------------
     7. Form validation
     -------------------------------------------------------- */
  const forms = document.querySelectorAll('[data-form]');
  forms.forEach((form) => {
    const status = form.querySelector('[data-form-status]');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;
      form.querySelectorAll('[required]').forEach((field) => {
        const wrap = field.closest('.form-group');
        if (!wrap) return;
        let ok = !!field.value.trim();
        if (field.type === 'email') ok = ok && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
        wrap.classList.toggle('is-error', !ok);
        if (!ok) valid = false;
      });
      if (!valid) {
        if (status) {
          status.className = 'form-status is-error';
          status.textContent = 'Please fill in all required fields with valid values.';
        }
        return;
      }
      const submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        const original = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="loading-dots" aria-label="Sending"><span></span><span></span><span></span></span>';
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = original;
          if (status) {
            status.className = 'form-status is-success';
            status.textContent = 'Thanks — your message is on its way. We reply within two business days.';
          }
          form.reset();
        }, 1100);
      }
    });

    form.querySelectorAll('input, textarea, select').forEach((field) => {
      field.addEventListener('input', () => {
        const wrap = field.closest('.form-group');
        if (wrap) wrap.classList.remove('is-error');
      });
    });
  });


  /* --------------------------------------------------------
     8. FAQ: progressive enhancement (works without <details>)
     -------------------------------------------------------- */
  document.querySelectorAll('.faq__item').forEach((item) => {
    if (item.tagName === 'DETAILS') return; // native behaviour is fine
    const summary = item.querySelector('summary');
    if (!summary) return;
    summary.addEventListener('click', (e) => {
      e.preventDefault();
      const wasOpen = item.classList.contains('is-open');
      item.classList.toggle('is-open', !wasOpen);
    });
  });


  /* --------------------------------------------------------
     9. Tabs
     -------------------------------------------------------- */
  document.querySelectorAll('.tabs').forEach((tabs) => {
    const btns = tabs.querySelectorAll('.tabs__btn');
    const panels = tabs.querySelectorAll('.tabs__panel');
    btns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-tab');
        btns.forEach((b) => b.classList.toggle('is-active', b === btn));
        panels.forEach((p) => p.classList.toggle('is-active', p.id === id));
      });
    });
  });


  /* --------------------------------------------------------
     10. Magnetic hover (only on devices with a precise pointer)
     -------------------------------------------------------- */
  if (!isCoarse) {
    document.querySelectorAll('[data-magnetic]').forEach((el) => {
      const strength = parseFloat(el.getAttribute('data-magnetic')) || 0.3;
      let rect = null;
      el.addEventListener('mouseenter', () => { rect = el.getBoundingClientRect(); });
      el.addEventListener('mousemove', (e) => {
        if (!rect) rect = el.getBoundingClientRect();
        const x = (e.clientX - (rect.left + rect.width / 2)) * strength;
        const y = (e.clientY - (rect.top + rect.height / 2)) * strength;
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
        rect = null;
      });
    });
  }


  /* --------------------------------------------------------
     11. Newsletter mini-form (footer)
     -------------------------------------------------------- */
  const newsletter = document.querySelector('[data-newsletter]');
  if (newsletter) {
    newsletter.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = newsletter.querySelector('input[type="email"]');
      const status = newsletter.querySelector('[data-form-status]');
      if (!input || !input.value.trim()) {
        if (status) {
          status.className = 'form-status is-error';
          status.textContent = 'Please enter a valid email.';
        }
        return;
      }
      if (status) {
        status.className = 'form-status is-success';
        status.textContent = 'Subscribed. Welcome aboard.';
      }
      newsletter.reset();
    });
  }


  /* --------------------------------------------------------
     12. Footer year
     -------------------------------------------------------- */
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });


  /* --------------------------------------------------------
     13. Mark page as loaded (for hero entrance choreography)
     -------------------------------------------------------- */
  window.addEventListener('load', () => {
    body.classList.add('is-loaded');
  });
  if (document.readyState === 'complete') body.classList.add('is-loaded');


  /* --------------------------------------------------------
     14. Hover-tilt for any [data-tilt] element
     -------------------------------------------------------- */
  if (!isCoarse) {
    document.querySelectorAll('[data-tilt]').forEach((el) => {
      const max = parseFloat(el.getAttribute('data-tilt-max')) || 6;
      let raf = 0;
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const rx = (0.5 - py) * max;
        const ry = (px - 0.5) * max;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
        });
      });
      el.addEventListener('mouseleave', () => {
        cancelAnimationFrame(raf);
        el.style.transform = '';
      });
    });
  }

})();
