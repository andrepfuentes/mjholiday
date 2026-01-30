/**
 * ---------------------------------------------------------------------------
 * DATEPICKER — FLATPICKR RANGE + LENIS (Webflow)
 * ---------------------------------------------------------------------------
 * Purpose:
 * - Initializes Flatpickr on `#custom-datepicker` (range mode)
 * - Formats the input value as `DD/MM/YYYY - DD/MM/YYYY` once both dates are selected
 * - Loads Flatpickr only if it's not already present on the page
 * - Runs Lenis only outside the Webflow editor
 *
 * Notes:
 * - Does NOT require jQuery (removes dependency on `$`)
 * - Set DEBUG to true to enable logs
 * ---------------------------------------------------------------------------
 */

(function FlatpickrRangeWithLenis() {
  const DEBUG = false;

  const CONFIG = {
    flatpickrSrc: 'https://cdn.jsdelivr.net/npm/flatpickr@4.6.13/dist/flatpickr.min.js',
    inputSelector: '#custom-datepicker',
    formatInput: 'd/m/Y',
    showMonths: 2,
    loadTimeoutMs: 8000,
  };

  const log = (...args) => DEBUG && console.log('[Flatpickr]', ...args);
  const warn = (...args) => console.warn('[Flatpickr]', ...args);

  function hasFlatpickr() {
    return typeof window.flatpickr === 'function';
  }

  function injectScript(src) {
    return new Promise((resolve, reject) => {
      if (hasFlatpickr()) return resolve();

      // If already present in DOM, just wait for it
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) return waitForFlatpickr(resolve, reject);

      const s = document.createElement('script');
      s.src = src;
      s.defer = true;
      s.onload = () => waitForFlatpickr(resolve, reject);
      s.onerror = () => reject(new Error('[Flatpickr] Failed to load script'));
      document.head.appendChild(s);
    });
  }

  function waitForFlatpickr(resolve, reject) {
    const start = Date.now();

    (function tick() {
      if (hasFlatpickr()) return resolve();
      if (Date.now() - start > CONFIG.loadTimeoutMs) {
        return reject(new Error('[Flatpickr] Timeout waiting for flatpickr global'));
      }
      requestAnimationFrame(tick);
    })();
  }

  function getLang() {
    const raw = (document.documentElement.lang || 'en').toLowerCase();
    // Flatpickr locale expects specific objects; passing a string works only if locale is loaded.
    // We'll safely fall back to default if not available.
    return raw.split('-')[0];
  }

  function isWebflowEditor() {
    try {
      return typeof Webflow !== 'undefined' && typeof Webflow.env === 'function' && Webflow.env('editor') !== undefined;
    } catch {
      return false;
    }
  }

  function initFlatpickr() {
    const input = document.querySelector(CONFIG.inputSelector);
    if (!input) {
      warn(`Input not found (${CONFIG.inputSelector}).`);
      return;
    }

    const lang = getLang();

    // NOTE: Flatpickr locale strings only work if you also load the locale pack.
    // We'll apply it only if it exists, otherwise use default.
    const localeCandidate =
      (window.flatpickr?.l10ns && (window.flatpickr.l10ns[lang] || window.flatpickr.l10ns.default)) ||
      undefined;

    window.flatpickr(input, {
      minDate: 'today',
      shorthandCurrentMonth: true,
      monthSelectorType: 'static',
      mode: 'range',
      inline: false,
      dateFormat: 'Y-m-d',
      showMonths: CONFIG.showMonths,
      ...(localeCandidate ? { locale: localeCandidate } : {}),

      onChange: function (selectedDates) {
        if (!Array.isArray(selectedDates) || selectedDates.length !== 2) return;

        const startDate = window.flatpickr.formatDate(selectedDates[0], CONFIG.formatInput);
        const endDate = window.flatpickr.formatDate(selectedDates[1], CONFIG.formatInput);

        input.value = `${startDate} - ${endDate}`;
        log('Updated input value', { value: input.value });
      },
    });

    log('Initialized', { selector: CONFIG.inputSelector, lang });
  }

  function initLenisIfAllowed() {
    if (isWebflowEditor()) {
      log('Webflow editor detected — not running Lenis');
      return;
    }

    if (typeof window.Lenis !== 'function') {
      warn('Lenis not found. Skipping.');
      return;
    }

    log('Running Lenis');

    const lenis = new window.Lenis();
    lenis.on('scroll', () => { /* no-op */ });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  document.addEventListener('DOMContentLoaded', async () => {
    try {
      if (!hasFlatpickr()) {
        log('Flatpickr not found — loading…');
        await injectScript(CONFIG.flatpickrSrc);
        log('Flatpickr loaded');
      } else {
        log('Flatpickr already loaded');
      }

      initFlatpickr();
    } catch (err) {
      console.error('[Flatpickr] Failed to initialize', err);
    }

    initLenisIfAllowed();
  });
})();
