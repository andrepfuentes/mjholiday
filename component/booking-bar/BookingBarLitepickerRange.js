/**
 * ---------------------------------------------------------------------------
 * BOOKING BAR — LITEPICKER RANGE + UI SYNC (Webflow)
 * + Optional restriction: disable dates until October for a specific localisation
 * ---------------------------------------------------------------------------
 */

(function BookingBarLitepickerRange() {
  const DEBUG = false;

  const SELECTORS = {
    datepicker: '#datepicker',
    display: '.booking-bar_dropdown_dates',
    arrive: '#arrive',
    depart: '#depart',
    localisation: '#localisation',
  };

  const DATE_FORMAT = 'DD/MM/YYYY';
  const MOBILE_BREAKPOINT = 768;

  // If this localisation matches, disable all dates before Oct 1st (current year)
  const RESTRICTED_LOCALISATION_URL =
    'https://booking.mjholidays.com/premium/index2.html?id_stile=22444&lingua_int=eng&id_albergo=29785&dc=1820';

  const log = (...args) => DEBUG && console.log('[BookingBar Litepicker]', ...args);
  const warn = (...args) => console.warn('[BookingBar Litepicker]', ...args);

  function getLang() {
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

  function decodeHtmlEntities(str) {
    if (!str || typeof str !== 'string') return '';
    const textarea = document.createElement('textarea');
    textarea.innerHTML = str;
    return textarea.value;
  }

  function normalizeUrlForCompare(url) {
    // Decode entities and trim; also helps if Webflow gives &amp; in attributes.
    return decodeHtmlEntities(url).trim();
  }

  function getLocalisationValue() {
    const el = document.querySelector(SELECTORS.localisation);
    if (!el) return '';
    return normalizeUrlForCompare(el.value || '');
  }

  function isRestrictedLocalisation(localisationValue) {
    if (!localisationValue) return false;

    // Strict match first (best)
    if (localisationValue === RESTRICTED_LOCALISATION_URL) return true;

    // Defensive fallback: match by key params (in case ordering changes)
    // (Keeps this working if someone reorders query params.)
    try {
      const u = new URL(localisationValue);
      const p = u.searchParams;
      return (
        u.origin === 'https://booking.mjholidays.com' &&
        u.pathname.includes('/premium/index2.html') &&
        p.get('id_stile') === '22444' &&
        p.get('lingua_int') === 'eng' &&
        p.get('id_albergo') === '29785' &&
        p.get('dc') === '1820'
      );
    } catch (e) {
      // If URL() fails (some environments), fall back to substring checks
      return (
        localisationValue.includes('booking.mjholidays.com/premium/index2.html') &&
        localisationValue.includes('id_stile=22444') &&
        localisationValue.includes('lingua_int=eng') &&
        localisationValue.includes('id_albergo=29785') &&
        localisationValue.includes('dc=1820')
      );
    }
  }

  function getOctFirstMinDate(todayDayjs) {
    // Oct 1st of the current year
    const year = todayDayjs.year();
    // dayjs month is 0-indexed: 9 = October
    return dayjs(new Date(year, 9, 1, 0, 0, 0, 0));
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

    // --- Restriction logic (grey out / disable until October)
    const localisationValue = getLocalisationValue();
    const restricted = isRestrictedLocalisation(localisationValue);

    let minDateDayjs = today; // default: today
    if (restricted) {
      const octFirst = getOctFirstMinDate(today);
      // Only restrict if we're before Oct 1
      if (today.isBefore(octFirst, 'day')) {
        minDateDayjs = octFirst;
      }
      log('Restricted localisation detected:', localisationValue);
      log('Applying minDate:', minDateDayjs.format(DATE_FORMAT));
    }

    // Initial range: default is minDate + 1 day
    const initialStartDayjs = minDateDayjs;
    const initialEndDayjs = minDateDayjs.add(1, 'day');

    const initialStart = formatDayjs(initialStartDayjs);
    const initialEnd = formatDayjs(initialEndDayjs);

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

      // 👇 This is what greys-out (disables) everything before minDate
      minDate: minDateDayjs.toDate(),

      // Initial selection
      startDate: initialStartDayjs.toDate(),
      endDate: initialEndDayjs.toDate(),

      lang: lang,
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
