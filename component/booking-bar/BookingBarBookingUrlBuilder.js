/**
* ---------------------------------------------------------------------------
* BOOKING BAR — BOOKING URL BUILDER + LOCALISATION PICKER
* ---------------------------------------------------------------------------
* Purpose:
* - Stores the selected booking base URL when the user clicks any element
*   with `[localisation-url]`.
* - On "Book" button click, builds a booking URL with query params:
*     - Dates (arrival/departure) from DD/MM/YYYY
*     - Adults / Kids
*     - Nights calculation
*     - Language mapping (html lang → lingua_int)
*     - Optional promo code
* - Uses a fallback base URL from:
*     `[mjholidays-element="book-nav"]` (href)
* - If no selected URL and no fallback, shows an inline error message.
*
* Notes:
* - Defensive: safely exits if required elements are missing.
* - Set DEBUG to true to enable console logs.
* ---------------------------------------------------------------------------
*/

(function BookingBarBookingUrlBuilder() {
const DEBUG = false;

const SELECTORS = {
  bookingButton: '[holiday-code="international"], [holiday-code="local"]',
  bookingTrigger: '.button.is-booking',
  localisationInput: '#localisation',
  localisationError: '.booking-bar_localisation_error',
  localisationTriggers: '[localisation-url]',
  buttonInteraction: '.button_interaction',
  fallbackBookLink: '[mjholidays-element="book-nav"]',
  navbarBookTrigger: '[mjholiday-element="book-nav"]',

  arrive: '#arrive',
  depart: '#depart',
  adultes: '#adultes',
  kids: '#kids',
  codePromo: '#code-promo',
};

const LANGUAGE_MAP = {
  en: 'eng',
  fr: 'fra',
};

const log = (...args) => DEBUG && console.log('[BookingBar Booking]', ...args);
const warn = (...args) => console.warn('[BookingBar Booking]', ...args);

function $(sel, root = document) {
  return root.querySelector(sel);
}

function toInt(value, fallback) {
  const n = parseInt(String(value ?? ''), 10);
  return Number.isFinite(n) ? n : fallback;
}

function getLangCode() {
  const raw = (document.documentElement.lang || 'en').toLowerCase();
  const base = raw.split('-')[0];
  return LANGUAGE_MAP[base] || 'eng';
}

function parseDDMMYYYY(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;

  const [dd, mm, yyyy] = parts.map((p) => (p || '').trim());
  if (!dd || !mm || !yyyy) return null;
  return { dd, mm, yyyy };
}

function computeNights(arrive, depart) {
  const start = new Date(`${arrive.yyyy}-${arrive.mm}-${arrive.dd}`);
  const end = new Date(`${depart.yyyy}-${depart.mm}-${depart.dd}`);
  const diffMs = end.getTime() - start.getTime();
  const nights = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(1, nights);
}

function showLocalisationError(el) {
  if (!el) return;
  el.style.display = 'block';
  window.setTimeout(() => {
    el.style.display = 'none';
  }, 2000);
}

function buildFinalUrl(baseUrl, params) {
  const connector = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${connector}${params.toString()}`;
}

document.addEventListener('DOMContentLoaded', () => {
  const bookingButtons = document.querySelectorAll(SELECTORS.bookingButton);
  if (!bookingButtons.length) {
    warn(`Booking buttons not found (${SELECTORS.bookingButton}).`);
    return;
  }

  const localisationInput = $(SELECTORS.localisationInput);
  const localisationError = $(SELECTORS.localisationError);
  const buttonInteraction = $(SELECTORS.buttonInteraction);

  const fallbackBaseUrl = $(SELECTORS.fallbackBookLink)?.getAttribute('href')?.trim() || '';
  log('Initialized', { fallbackBaseUrl });

  // 1) Localisation selection: write chosen URL into hidden input + reveal interaction button
  document.querySelectorAll(SELECTORS.localisationTriggers).forEach((el) => {
    el.addEventListener('click', () => {
      const url = el.getAttribute('localisation-url')?.trim();
      if (!url) return;

      if (localisationInput) localisationInput.value = url;
      if (buttonInteraction) buttonInteraction.style.display = 'block';
      log('Localisation set', { url });
    });
  });

  // 2) Pre-flight guard on .button.is-booking: block if no destination selected
  const bookingTrigger = $(SELECTORS.bookingTrigger);
  if (bookingTrigger) {
    bookingTrigger.addEventListener('click', (e) => {
      const hasDestination = !!(localisationInput?.value?.trim());
      if (!hasDestination) {
        e.preventDefault();
        e.stopPropagation();
        const navbarBook = $(SELECTORS.navbarBookTrigger);
        if (navbarBook) {
          navbarBook.click();
        } else {
          showLocalisationError(localisationError);
          warn('No destination selected and [mjholiday-element="book-nav"] not found.');
        }
      }
    });
  }

  // 3) Booking CTA: build URL and open in new tab
  bookingButtons.forEach((bookingButton) => {
    bookingButton.addEventListener('click', (e) => {
      e.preventDefault();

      const isLocal = e.currentTarget.getAttribute('holiday-code') === 'local';

      const userBaseUrl = localisationInput?.value?.trim() || '';
      const finalBaseUrl = userBaseUrl || fallbackBaseUrl;

      if (!finalBaseUrl) {
        showLocalisationError(localisationError);
        warn('No base URL detected (no localisation + no fallback).');
        return;
      }

      const arriveStr = $(SELECTORS.arrive)?.value || '';
      const departStr = $(SELECTORS.depart)?.value || '';

      const arrive = parseDDMMYYYY(arriveStr);
      const depart = parseDDMMYYYY(departStr);

      if (!arrive || !depart) {
        warn('Missing or invalid arrival/departure dates.', { arriveStr, departStr });
        return;
      }

      const adultes = toInt($(SELECTORS.adultes)?.value, 1);
      const kids = toInt($(SELECTORS.kids)?.value, 0);
      const codePromo = isLocal ? 'LOCAL' : ($(SELECTORS.codePromo)?.value?.trim() || '');
      const linguaInt = getLangCode();

      const nights = computeNights(arrive, depart);

      const params = new URLSearchParams({
        tot_camere: '1',
        tot_adulti: String(adultes),
        tot_bambini: String(kids),

        gg: arrive.dd,
        mm: arrive.mm,
        aa: arrive.yyyy,

        ggf: depart.dd,
        mmf: depart.mm,
        aaf: depart.yyyy,

        notti_1: String(nights),
        adulti1: String(adultes),
        bambini1: String(kids),

        lingua_int: linguaInt,
      });

      if (codePromo) params.append('generic_codice', codePromo);

      const finalUrl = buildFinalUrl(finalBaseUrl, params);
      log('Redirecting', { finalUrl });

      window.open(finalUrl, '_blank');
    });
  });
});
})();
