/**
 * Splide Loader + Big Slider Init
 * - Loads Splide CSS/JS only if not already present
 * - Safe to run multiple times
 */

(function () {
  const SPLIDE_CSS =
    'https://cdn.jsdelivr.net/npm/@splidejs/splide@4.1.3/dist/css/splide.min.css';
  const SPLIDE_JS =
    'https://cdn.jsdelivr.net/npm/@splidejs/splide@4.1.3/dist/js/splide.min.js';

  function loadCSS(href) {
    return new Promise((resolve) => {
      // already loaded?
      if ([...document.styleSheets].some(s => s.href && s.href.includes(href))) {
        resolve();
        return;
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = resolve;
      document.head.appendChild(link);
    });
  }

  function loadJS(src) {
    return new Promise((resolve, reject) => {
      // already loaded?
      if (window.Splide) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.defer = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function initBigSlider() {
    const bigSlider = document.querySelector('.splide.is-big-slider');

    if (!bigSlider) {
      console.warn('[Big Slider] .is-big-slider not found');
      return;
    }

    new Splide(bigSlider, {
      type: 'loop',
      autoWidth: true,
      focus: 'center',
      arrows: false,
      pagination: false,
      drag: true,
      gap: '1.25rem',
      breakpoints: {
        768: {
          gap: '0.625rem',
        },
      },
    }).mount();

    console.log('[Big Slider] Initialized');
  }

  document.addEventListener('DOMContentLoaded', async () => {
    try {
      await loadCSS(SPLIDE_CSS);
      await loadJS(SPLIDE_JS);

      if (typeof Splide === 'undefined') {
        console.warn('[Big Slider] Splide failed to load');
        return;
      }

      initBigSlider();
    } catch (err) {
      console.error('[Big Slider] Error loading Splide', err);
    }
  });
})();
