/* =========================================================
   HW FanVL — animations.js
   Visual / decorative layer: parallax, cursor glow,
   hover-tilt defaults, floating elements.
   No external dependencies.
   ========================================================= */

(function () {
  'use strict';

  const doc = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isCoarse = window.matchMedia('(pointer: coarse)').matches;
  const canHover = window.matchMedia('(hover: hover)').matches;

  /* --------------------------------------------------------
     1. Parallax (transform only)
     -------------------------------------------------------- */
  const parallaxItems = document.querySelectorAll('[data-parallax]');
  if (parallaxItems.length && !reducedMotion) {
    let ticking = false;
    function updateParallax() {
      const vh = window.innerHeight;
      parallaxItems.forEach((el) => {
        const speed = parseFloat(el.getAttribute('data-parallax')) || 0.2;
        const rect = el.getBoundingClientRect();
        if (rect.bottom < -200 || rect.top > vh + 200) return;
        const center = rect.top + rect.height / 2;
        const offset = (center - vh / 2) * speed;
        el.style.setProperty('--py', `${offset.toFixed(2)}px`);
        el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
      });
      ticking = false;
    }
    function onScrollParallax() {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }
    window.addEventListener('scroll', onScrollParallax, { passive: true });
    window.addEventListener('resize', onScrollParallax, { passive: true });
    updateParallax();
  }


  /* --------------------------------------------------------
     2. Mouse-follow glow (large screens only)
     -------------------------------------------------------- */
  const cursorGlow = document.querySelector('[data-cursor-glow]');
  if (cursorGlow && canHover && !isCoarse && !reducedMotion) {
    let cx = window.innerWidth / 2;
    let cy = window.innerHeight / 2;
    let gx = cx, gy = cy;
    let raf = 0;
    document.addEventListener('mousemove', (e) => {
      cx = e.clientX;
      cy = e.clientY;
      cursorGlow.classList.add('is-active');
      if (!raf) raf = requestAnimationFrame(loop);
    });
    document.addEventListener('mouseleave', () => cursorGlow.classList.remove('is-active'));
    document.addEventListener('mouseenter', () => cursorGlow.classList.add('is-active'));
    function loop() {
      gx += (cx - gx) * 0.12;
      gy += (cy - gy) * 0.12;
      cursorGlow.style.transform = `translate3d(${gx}px, ${gy}px, 0) translate(-50%, -50%)`;
      if (Math.abs(cx - gx) > 0.1 || Math.abs(cy - gy) > 0.1) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = 0;
      }
    }
  }


  /* --------------------------------------------------------
     3. Cursor halo (precise pointer only)
     -------------------------------------------------------- */
  const cursorHalo = document.querySelector('[data-cursor-halo]');
  if (cursorHalo && canHover && !isCoarse && !reducedMotion) {
    let raf = 0, x = 0, y = 0, tx = 0, ty = 0;
    document.addEventListener('mousemove', (e) => {
      tx = e.clientX; ty = e.clientY;
      cursorHalo.classList.add('is-active');
      if (!raf) raf = requestAnimationFrame(loop);
    });
    document.addEventListener('mouseleave', () => cursorHalo.classList.remove('is-active'));
    function loop() {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      cursorHalo.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${cursorHalo.classList.contains('is-hover') ? 1.6 : 1})`;
      if (Math.abs(tx - x) > 0.1 || Math.abs(ty - y) > 0.1) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = 0;
      }
    }
    // enlarge halo over interactive elements
    document.querySelectorAll('a, button, [data-cursor="hover"]').forEach((el) => {
      el.addEventListener('mouseenter', () => cursorHalo.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => cursorHalo.classList.remove('is-hover'));
    });
  }


  /* --------------------------------------------------------
     4. Tilt-on-scroll (for hero visuals)
        Translates only when window scrolls.
     -------------------------------------------------------- */
  const tiltItems = document.querySelectorAll('[data-tilt-scroll]');
  if (tiltItems.length && !reducedMotion) {
    let ticking = false;
    function updateTilt() {
      const y = window.scrollY || 0;
      tiltItems.forEach((el) => {
        const max = parseFloat(el.getAttribute('data-tilt-scroll')) || 8;
        const r = Math.max(-1, Math.min(1, y / Math.max(window.innerHeight, 1)));
        const angle = r * max;
        el.style.transform = `perspective(1200px) rotateX(${angle * 0.4}deg) rotateY(${angle * 0.6}deg)`;
      });
      ticking = false;
    }
    function onScrollTilt() {
      if (!ticking) {
        requestAnimationFrame(updateTilt);
        ticking = true;
      }
    }
    window.addEventListener('scroll', onScrollTilt, { passive: true });
    updateTilt();
  }


  /* --------------------------------------------------------
     5. Float decorations (randomized delays for non-uniform motion)
     -------------------------------------------------------- */
  document.querySelectorAll('[data-float]').forEach((el, i) => {
    if (reducedMotion) return;
    const speed = el.getAttribute('data-float') || '5';
    const delay = (i % 6) * -0.7;
    el.style.animation = `float-y ${speed}s ease-in-out ${delay}s infinite`;
  });


  /* --------------------------------------------------------
     6. Auto-stagger helpers — applies stagger-children class
     -------------------------------------------------------- */
  document.querySelectorAll('[data-stagger]').forEach((el) => {
    el.classList.add('stagger-children');
  });


  /* --------------------------------------------------------
     7. Section split-reveal on first paint of section
     -------------------------------------------------------- */
  if ('IntersectionObserver' in window) {
    const splitObs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-active');
          splitObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    document.querySelectorAll('.split-reveal').forEach((el) => splitObs.observe(el));
  }


  /* --------------------------------------------------------
     8. Subtle background blob drift
     -------------------------------------------------------- */
  if (!reducedMotion) {
    document.querySelectorAll('.deco-blob').forEach((blob, i) => {
      const dur = 18 + (i % 4) * 4;
      const del = -1 * (i % 3) * 2;
      blob.style.animation = `float-rotate ${dur}s linear ${del}s infinite`;
    });
  }


  /* --------------------------------------------------------
     9. Animated border draw on hover
     -------------------------------------------------------- */
  // Implementation lives in CSS (.draw-border). Hook is here in case
  // we want to dispatch events when the border finishes drawing.
  document.querySelectorAll('.draw-border').forEach((el) => {
    el.addEventListener('mouseenter', () => el.classList.add('is-drawing'));
    el.addEventListener('mouseleave', () => el.classList.remove('is-drawing'));
  });


  /* --------------------------------------------------------
     10. Page-specific: contact page interactive demo cells
     -------------------------------------------------------- */
  document.querySelectorAll('[data-anim-bg]').forEach((el) => {
    if (reducedMotion) return;
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const px = ((e.clientX - r.left) / r.width) * 100;
      const py = ((e.clientY - r.top) / r.height) * 100;
      el.style.background = `radial-gradient(circle at ${px}% ${py}%, rgba(255,107,53,0.10) 0%, transparent 60%)`;
    });
    el.addEventListener('mouseleave', () => { el.style.background = ''; });
  });


  /* --------------------------------------------------------
     11. prefers-reduced-motion: gracefully disable everything
     -------------------------------------------------------- */
  if (reducedMotion) {
    document.documentElement.classList.add('is-no-anim');
  }

})();
