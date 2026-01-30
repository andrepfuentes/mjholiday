(function () {
  const SPLIDE_JS_SRC =
    'https://cdn.jsdelivr.net/npm/@splidejs/splide@4.1.3/dist/js/splide.min.js';
  const SPLIDE_CSS_SRC =
    'https://cdn.jsdelivr.net/npm/@splidejs/splide@4.1.3/dist/css/splide.min.css';

  const LOAD_TIMEOUT = 8000;

  /* ------------------------------------------------------------------
   * Loaders
   * ------------------------------------------------------------------ */

  function hasSplideJS() {
    return typeof window.Splide === 'function';
  }

  function hasSplideCSS() {
    return Array.from(document.styleSheets).some(
      (s) => s.href && s.href.includes('splide.min.css')
    );
  }

  function loadCSS(href) {
    return new Promise((resolve) => {
      if (hasSplideCSS()) return resolve();

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = resolve;
      document.head.appendChild(link);
    });
  }

  function loadJS(src) {
    return new Promise((resolve, reject) => {
      if (hasSplideJS()) return resolve();

      const script = document.createElement('script');
      script.src = src;
      script.defer = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function waitForSplide() {
    return new Promise((resolve, reject) => {
      const start = Date.now();

      (function tick() {
        if (hasSplideJS()) return resolve();
        if (Date.now() - start > LOAD_TIMEOUT) {
          return reject(new Error('[Carnet Splide] Timeout waiting for Splide'));
        }
        requestAnimationFrame(tick);
      })();
    });
  }

  /* ------------------------------------------------------------------
   * Slider logic (unchanged, just wrapped)
   * ------------------------------------------------------------------ */

  function initCarnetSlider() {
    const bigSlider = document.querySelector('.splide.is-carnet');

    // Empty CMS collection → remove whole section
    if (bigSlider && bigSlider.querySelector('.w-dyn-empty')) {
      const section = bigSlider.closest('section');
      if (section) {
        section.remove();
        console.log('[Carnet Splide] Section removed (empty CMS)');
      }
      return;
    }

    if (!bigSlider) {
      console.warn('[Carnet Splide] .splide.is-carnet not found');
      return;
    }

    const splideInstance = new Splide(bigSlider, {
      type: 'slide',
      perPage: 3,
      perMove: 1,
      focus: 'center',
      arrows: false,
      pagination: false,
      drag: true,
      gap: '1.25rem',
      breakpoints: {
        768: {
          autoWidth: true,
          gap: '0.75rem',
        },
      },
    });

    const prevArrow = document.querySelector('.carnet_button-arrow_left');
    const nextArrow = document.querySelector('.carnet_button-arrow_right');

    function toggleCustomArrows(isOverflow) {
      [prevArrow, nextArrow].filter(Boolean).forEach((btn) => {
        btn.classList.toggle('is-hidden', !isOverflow);
        btn.setAttribute('aria-hidden', String(!isOverflow));
        btn.tabIndex = isOverflow ? 0 : -1;
      });

      splideInstance.options = { drag: isOverflow };
    }

    if (prevArrow) prevArrow.addEventListener('click', () => splideInstance.go('<'));
    if (nextArrow) nextArrow.addEventListener('click', () => splideInstance.go('>'));

    splideInstance.on('overflow', toggleCustomArrows);

    splideInstance.mount();

    console.log('[Carnet Splide] Initialized');
  }

  /* ------------------------------------------------------------------
   * Boot
   * ------------------------------------------------------------------ */

  document.addEventListener('DOMContentLoaded', async () => {
    try {
      await loadCSS(SPLIDE_CSS_SRC);
      await loadJS(SPLIDE_JS_SRC);
      await waitForSplide();

      initCarnetSlider();
    } catch (err) {
      console.error('[Carnet Splide] Failed to load Splide', err);
    }
  });
})();
