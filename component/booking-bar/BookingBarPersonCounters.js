/**
 * ---------------------------------------------------------------------------
 * BOOKING BAR — PERSON COUNTERS (Adults / Kids)
 * ---------------------------------------------------------------------------
 * Purpose:
 * - Handles increment/decrement logic for each `.booking-bar_person_block`.
 * - Ensures minimum values:
 *     - Adults (`name="adultes"`) cannot go below 1
 *     - Kids (anything else, e.g. `name="kids"`) cannot go below 0
 *
 * How it works:
 * - Each `.booking-bar_person_block` is scoped independently:
 *     - `.booking-bar_person_input`
 *     - `.booking-bar_person_up`
 *     - `.booking-bar_person_down`
 *
 * Notes:
 * - Defensive: safely exits if required elements are missing.
 * - Set DEBUG to true to enable console logs.
 * ---------------------------------------------------------------------------
 */

(function BookingBarPersonCounters() {
  const DEBUG = false;

  const SELECTORS = {
    block: '.booking-bar_person_block',
    input: '.booking-bar_person_input',
    up: '.booking-bar_person_up',
    down: '.booking-bar_person_down',
  };

  const log = (...args) => DEBUG && console.log('[BookingBar Counters]', ...args);
  const warn = (...args) => console.warn('[BookingBar Counters]', ...args);

  function toInt(value, fallback = 0) {
    const n = parseInt(value, 10);
    return Number.isFinite(n) ? n : fallback;
  }

  function getMinValueByName(inputName) {
    return inputName === 'adultes' ? 1 : 0;
  }

  function bindCounter(block) {
    const input = block.querySelector(SELECTORS.input);
    const btnUp = block.querySelector(SELECTORS.up);
    const btnDown = block.querySelector(SELECTORS.down);

    if (!input || !btnUp || !btnDown) {
      warn('Incomplete person block found. Skipping.', block);
      return;
    }

    const inputName = (input.getAttribute('name') || '').trim();
    const minValue = getMinValueByName(inputName);

    // Normalize initial value to respect min
    const initial = Math.max(toInt(input.value, minValue), minValue);
    input.value = String(initial);

    btnUp.addEventListener('click', (e) => {
      e.preventDefault();
      const current = toInt(input.value, minValue);
      const next = current + 1;
      input.value = String(next);
      log(`${inputName || 'counter'} increased`, { value: next });
    });

    btnDown.addEventListener('click', (e) => {
      e.preventDefault();
      const current = toInt(input.value, minValue);
      const next = Math.max(current - 1, minValue);
      input.value = String(next);

      if (next === current) {
        log(`${inputName || 'counter'} already at minimum`, { minValue });
      } else {
        log(`${inputName || 'counter'} decreased`, { value: next });
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const blocks = Array.from(document.querySelectorAll(SELECTORS.block));
    if (!blocks.length) {
      warn(`No person blocks found (${SELECTORS.block}).`);
      return;
    }

    log('Initializing person counters…', { blocks: blocks.length });
    blocks.forEach(bindCounter);
  });
})();
