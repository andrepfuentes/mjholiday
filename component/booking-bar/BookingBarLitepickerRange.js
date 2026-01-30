/**
 * ---------------------------------------------------------------------------
 * BOOKING BAR — LITEPICKER RANGE + UI SYNC (Webflow)
 * ---------------------------------------------------------------------------
 * Purpose:
 * - Initializes Litepicker as a date range picker (arrival/departure).
 * - Syncs selected dates to:
 *     - Display element: `.booking-bar_dropdown_dates`
 *     - Hidden/real inputs: `#arrive`, `#depart`
 * - Defaults to today + tomorrow on first load.
 * - Applies single-letter weekday labels per locale.
 *
 * Requirements:
 * - Litepicker loaded globally (window.Litepicker)
 * - dayjs loaded globally (window.dayjs)
 * - An element with id `datepicker`
 *
 * Notes:
 * - Designed to be safe and idempotent-ish (won't crash if elements are missing).
 * - Set DEBUG to true to enable console logs.
 * ---------------------------------------------------------------------------
 */

(function BookingBarLitepickerRange() {
  const DEBUG = false;

  const SELECTORS = {
    datepicker: '#datepicker',
    display: '.booking-bar_dropdown_dates',
    arrive: '#arrive',
    depart: '#depart',
  };

  const DATE_FORMAT = 'DD/MM/YYYY';
  const MOBILE_BREAKPOINT = 768;

  const log = (...args) => DEBUG && console.log('[BookingBar Litepicker]', ...args);
  const warn = (...args) => console.warn('[BookingBar Litepicker]', ...args);

  function getLang() {
    // Normalize to short lang like "fr" from "fr-FR"
    const raw = document.documentElement.lang || 'en';
    return raw.split('-')[0].toLowerCase();
  }

  function getWeekdayOverrides() {
    const shortWeekdaysEN = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    return {
      en: { weekdays: shortWeekdaysEN },
      fr: { weekdays: ['D', 'L', 'M', 'M', 'J', 'V', 'S'] },
      pt: { weekdays: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'] },
      de: { weekdays: ['S', 'M', 'D', 'M', 'D', 'F', 'S'] },
      es: { weekdays: ['D', 'L', 'M', 'X', 'J', 'V', 'S'] },
      _default: { weekdays: shortWeekdaysEN },
    };
  }

  function formatDayjs(d) {
    return d.format(DATE_FORMAT);
  }

  function setInitialValues({ displayEl, arriveEl, departEl, startStr, endStr }) {
    if (displayEl) displayEl.textContent = `${startStr} - ${endStr}`;
    if (arriveEl) arriveEl.value = startStr;
    if (departEl) departEl.value = endStr;
  }

  document.addEventListener('DOMContentLoaded', function onReady() {
    // Guard: required globals
    if (!window.dayjs) {
      warn('dayjs not found. Aborting.');
      return;
    }
    if (!window.Litepicker) {
      warn('Litepicker not found. Aborting.');
      return;
    }

    const lang = getLang();
    const weekdayOverrides = getWeekdayOverrides();
    const i18nConfig = weekdayOverrides[lang] || weekdayOverrides._default;

    const datepickerEl = document.querySelector(SELECTORS.datepicker);
    if (!datepickerEl) {
      warn(`Missing ${SELECTORS.datepicker}. Aborting.`);
      return;
    }

    const displayEl = document.querySelector(SELECTORS.display);
    const arriveEl = document.querySelector(SELECTORS.arrive);
    const departEl = document.querySelector(SELECTORS.depart);

    const today = dayjs();
    const tomorrow = today.add(1, 'day');

    const initialStart = formatDayjs(today);
    const initialEnd = formatDayjs(tomorrow);

    log('DOM loaded. Initializing…');
    log('Detected language:', lang);

    // Initial UI + inputs
    setInitialValues({
      displayEl,
      arriveEl,
      departEl,
      startStr: initialStart,
      endStr: initialEnd,
    });

    const isMobile = window.innerWidth < MOBILE_BREAKPOINT;

    const picker = new Litepicker({
      element: datepickerEl,
      singleMode: false,
      numberOfMonths: isMobile ? 1 : 2,
      numberOfColumns: isMobile ? 1 : 2,
      format: DATE_FORMAT,
      autoApply: true,
      mobileFriendly: true,
      minDate: today.toDate(),
      startDate: today.toDate(),
      endDate: tomorrow.toDate(),
      lang: lang,

      // Litepicker i18n structure supports per-lang dictionary
      i18n: {
        [lang]: { ...i18nConfig },
      },

      setup: (pickerInstance) => {
        pickerInstance.on('selected', (startDate, endDate) => {
          const startStr = startDate.format(DATE_FORMAT);
          const endStr = endDate.format(DATE_FORMAT);

          setInitialValues({
            displayEl,
            arriveEl,
            departEl,
            startStr,
            endStr,
          });

          log('User selected:', { arrival: startStr, departure: endStr });
        });
      },
    });

    log('Initialized.', picker);
  });
})();
