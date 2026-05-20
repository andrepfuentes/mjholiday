/**
* ---------------------------------------------------------------------------
* BOOKING BAR — LITEPICKER RANGE + UI SYNC (Webflow)
* + Reacts to localisation input changes (MutationObserver + polling fallback)
* + For one specific localisation URL (Eko Savannah): disable dates before Jan 15, 2027
* ---------------------------------------------------------------------------
*/

(function BookingBarLitepickerRange() {
const DEBUG = false;

const SELECTORS = {
  datepicker: "#datepicker",
  display: ".booking-bar_dropdown_dates",
  arrive: "#arrive",
  depart: "#depart",
  localisation: "#localisation",
};

const DATE_FORMAT = "DD/MM/YYYY";
const MOBILE_BREAKPOINT = 768;

const log = (...args) => DEBUG && console.log("[BookingBar Litepicker]", ...args);
const warn = (...args) => console.warn("[BookingBar Litepicker]", ...args);

function getLang() {
  const raw = document.documentElement.lang || "en";
  return raw.split("-")[0].toLowerCase();
}

function getWeekdayOverrides() {
  const shortWeekdaysEN = ["S", "M", "T", "W", "T", "F", "S"];
  return {
    en: { weekdays: shortWeekdaysEN },
    fr: { weekdays: ["D", "L", "M", "M", "J", "V", "S"] },
    pt: { weekdays: ["D", "S", "T", "Q", "Q", "S", "S"] },
    de: { weekdays: ["S", "M", "D", "M", "D", "F", "S"] },
    es: { weekdays: ["D", "L", "M", "X", "J", "V", "S"] },
    _default: { weekdays: shortWeekdaysEN },
  };
}

function decodeHtmlEntities(str) {
  if (!str || typeof str !== "string") return "";
  const textarea = document.createElement("textarea");
  textarea.innerHTML = str;
  return textarea.value;
}

function normalizeUrlForCompare(url) {
  return decodeHtmlEntities(url).trim();
}

function getLocalisationValue() {
  const el = document.querySelector(SELECTORS.localisation);
  if (!el) return "";
  // Prefer .value (what matters in forms); normalize HTML entities either way
  return normalizeUrlForCompare(el.value || "");
}

function isRestrictedLocalisation(localisationValue) {
  if (!localisationValue) return false;

  try {
    const u = new URL(localisationValue);
    const p = u.searchParams;

    return (
      u.origin === "https://booking.mjholidays.com" &&
      u.pathname.includes("/premium/index2.html") &&
      p.get("id_stile") === "22444" &&
      p.get("id_albergo") === "29785" &&
      p.get("dc") === "1820"
      // 🚫 lingua_int intentionally ignored
    );
  } catch (e) {
    // Fallback if URL() fails
    return (
      localisationValue.includes("booking.mjholidays.com/premium/index2.html") &&
      localisationValue.includes("id_stile=22444") &&
      localisationValue.includes("id_albergo=29785") &&
      localisationValue.includes("dc=1820")
      // 🚫 no lingua_int check
    );
  }
}
  
function computeMinDateDayjs(todayDayjs, localisationValue) {
  const restricted = isRestrictedLocalisation(localisationValue);
  if (!restricted) return todayDayjs;

  const ekoOpen = dayjs(new Date(2027, 0, 15, 0, 0, 0, 0)); // Jan 15, 2027
  if (todayDayjs.isBefore(ekoOpen, "day")) return ekoOpen;
  return todayDayjs;
}

function setInitialValues({ displayEl, arriveEl, departEl, startStr, endStr }) {
  if (displayEl) displayEl.textContent = `${startStr} - ${endStr}`;
  if (arriveEl) arriveEl.value = startStr;
  if (departEl) departEl.value = endStr;
}

document.addEventListener("DOMContentLoaded", function onReady() {
  if (!window.dayjs) {
    warn("dayjs not found. Aborting.");
    return;
  }
  if (!window.Litepicker) {
    warn("Litepicker not found. Aborting.");
    return;
  }

  const datepickerEl = document.querySelector(SELECTORS.datepicker);
  if (!datepickerEl) {
    warn(`Missing ${SELECTORS.datepicker}. Aborting.`);
    return;
  }

  const displayEl = document.querySelector(SELECTORS.display);
  const arriveEl = document.querySelector(SELECTORS.arrive);
  const departEl = document.querySelector(SELECTORS.depart);
  const localisationEl = document.querySelector(SELECTORS.localisation);

  const lang = getLang();
  const weekdayOverrides = getWeekdayOverrides();
  const i18nConfig = weekdayOverrides[lang] || weekdayOverrides._default;

  let picker = null;
  let lastLocalisationValue = null;

  function buildPicker() {
    const today = dayjs();
    const localisationValue = getLocalisationValue();
    const minDateDayjs = computeMinDateDayjs(today, localisationValue);

    // Initial selection snaps to minDate
    const startDayjs = minDateDayjs;
    const endDayjs = minDateDayjs.add(1, "day");

    const startStr = startDayjs.format(DATE_FORMAT);
    const endStr = endDayjs.format(DATE_FORMAT);

    // Sync UI + hidden inputs
    setInitialValues({
      displayEl,
      arriveEl,
      departEl,
      startStr,
      endStr,
    });

    const isMobile = window.innerWidth < MOBILE_BREAKPOINT;

    picker = new Litepicker({
      element: datepickerEl,
      singleMode: false,
      numberOfMonths: isMobile ? 1 : 2,
      numberOfColumns: isMobile ? 1 : 2,
      format: DATE_FORMAT,
      autoApply: true,
      mobileFriendly: true,

      // ✅ Greys out / disables everything before this
      minDate: minDateDayjs.toDate(),

      // Initial range
      startDate: startDayjs.toDate(),
      endDate: endDayjs.toDate(),

      lang: lang,
      i18n: {
        [lang]: { ...i18nConfig },
      },

      setup: (pickerInstance) => {
        pickerInstance.on("selected", (startDate, endDate) => {
          const startStr2 = startDate.format(DATE_FORMAT);
          const endStr2 = endDate.format(DATE_FORMAT);

          setInitialValues({
            displayEl,
            arriveEl,
            departEl,
            startStr: startStr2,
            endStr: endStr2,
          });

          log("User selected:", { arrival: startStr2, departure: endStr2 });
        });
      },
    });

    log("Picker built. minDate =", minDateDayjs.format(DATE_FORMAT), "localisation =", localisationValue);
  }

  function destroyPicker() {
    if (!picker) return;
    try {
      // Litepicker supports destroy() in most versions
      picker.destroy();
      log("Picker destroyed.");
    } catch (e) {
      warn("Failed to destroy picker cleanly:", e);
    } finally {
      picker = null;
    }
  }

  function rebuildPickerIfNeeded() {
    const current = getLocalisationValue();
    if (!current) return; // ignore empty
    if (current === lastLocalisationValue) return;

    lastLocalisationValue = current;
    log("Localisation changed => rebuilding picker:", current);

    destroyPicker();
    buildPicker();
  }

  // --- Initial mount
  lastLocalisationValue = getLocalisationValue() || null;
  buildPicker();

  // --- Watch localisation changes
  if (localisationEl) {
    // 1) MutationObserver for attribute changes (setAttribute('value', ...))
    const mo = new MutationObserver(() => rebuildPickerIfNeeded());
    mo.observe(localisationEl, {
      attributes: true,
      attributeFilter: ["value"],
    });

    // 2) Polling fallback for .value assignment (input.value = '...')
    // Light interval; only does string compare and exits quickly.
    const POLL_MS = 250;
    setInterval(() => rebuildPickerIfNeeded(), POLL_MS);

    log("Watching #localisation changes (mutation + polling).");
  } else {
    warn("No #localisation input found; restriction-by-localisation won't react to changes.");
  }
});
})();
