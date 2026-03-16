/* =============================================================
   main.js — GSAP scroll animations + section entrance effects
   ============================================================= */

(function () {
  'use strict';

  /* ── Reduced-motion guard ────────────────────────────────── */
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (typeof gsap === 'undefined') return;

  /* ── Register ScrollTrigger ──────────────────────────────── */
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  if (reducedMotion) {
    // Just make everything visible without animation (EC-009)
    document.querySelectorAll('.benefit-card--reveal').forEach(function (el) {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  /* ── Hero text entrance ──────────────────────────────────── */
  var heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  heroTl
    .from('.hero__eyebrow', { opacity: 0, y: 20, duration: 0.6, delay: 0.2 })
    .from('.hero__headline', { opacity: 0, y: 30, duration: 0.7 }, '-=0.3')
    .from('.hero__sub',      { opacity: 0, y: 20, duration: 0.6 }, '-=0.4')
    .from('.hero__cta-group .btn', {
      opacity: 0, y: 16, duration: 0.5, stagger: 0.12,
    }, '-=0.3')
    .from('.hero__canvas-wrap', { opacity: 0, scale: 0.95, duration: 0.8 }, '-=0.8');

  /* ── Nav fade-in ─────────────────────────────────────────── */
  gsap.from('.nav', { opacity: 0, y: -20, duration: 0.5, ease: 'power2.out', delay: 0.1 });

  /* ── Benefit cards stagger on scroll ─────────────────────── */
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.to('.benefit-card--reveal', {
      opacity:   1,
      y:         0,
      duration:  0.65,
      ease:      'power3.out',
      stagger:   0.12,
      scrollTrigger: {
        trigger:  '.benefits__grid',
        start:    'top 78%',
        toggleActions: 'play none none none',
      },
    });

    /* ── Benefits heading ─────────────────────────────────── */
    gsap.from('.benefits .section-title, .benefits .section-sub', {
      opacity: 0,
      y: 24,
      duration: 0.6,
      stagger: 0.15,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.benefits',
        start:   'top 80%',
      },
    });

    /* ── Form section heading ─────────────────────────────── */
    gsap.from('.form-section .section-title, .form-section .section-sub', {
      opacity: 0,
      y: 24,
      duration: 0.6,
      stagger: 0.15,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.form-section',
        start:   'top 80%',
      },
    });

    /* ── Form fields slide up ─────────────────────────────── */
    gsap.from('.form-group', {
      opacity:  0,
      y:        20,
      duration: 0.45,
      stagger:  0.08,
      ease:     'power2.out',
      scrollTrigger: {
        trigger: '.interest-form',
        start:   'top 82%',
      },
    });
  }

  /* ── Ticker: ensure content is wide enough for seamless loop ── */
  (function () {
    var track = document.querySelector('.ticker__track');
    if (!track) return;

    // Pause animation while we manipulate the DOM
    track.style.animationPlayState = 'paused';

    // Clone the original set until one set exceeds the viewport width
    var originalHTML = track.innerHTML;
    while (track.scrollWidth < window.innerWidth + 1) {
      track.innerHTML += originalHTML;
    }

    // Duplicate the full set so -50% animation loops back to the start seamlessly
    track.innerHTML = track.innerHTML + track.innerHTML;
    track.style.animationPlayState = '';
  }());

}());
