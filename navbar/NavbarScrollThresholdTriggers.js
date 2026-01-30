/**
 * ---------------------------------------------------------------------------
 * NAVBAR — SCROLL THRESHOLD TRIGGERS (INTO / OUT)
 * ---------------------------------------------------------------------------
 * Purpose:
 * - Uses scroll position to "fire" Webflow trigger elements by clicking:
 *     - `.navbar_trigger_into` when scrollY >= threshold
 *     - `.navbar_trigger_out`  when scrollY <  threshold
 *
 * Threshold:
 * - 10rem (converted to px using the root font-size)
 * - Recalculated on resize
 *
 * Init behavior:
 * - Runs once after DOM ready (+ small delay)
 * - Runs again on `load` and `pageshow` (handles bfcache / restored scroll)
 *
 * Performance:
 * - Scroll handler is rAF-throttled
 * - Scroll listener is passive
 *
 * Notes:
 * - Set DEBUG to true to enable logs.
 * ---------------------------------------------------------------------------
 */

(function NavbarScrollThresholdTriggers() {
  const DEBUG = false;

  const CONFIG = {
    thresholdRem: 10,
    selectors: {
      into: '.navbar_trigger_into',
      out: '.navbar_trigger_out',
    },
    initDelayMs: 100,
  };

  let thresholdPx = 0;
  let lastState = null; // 'into' | 'out'
  let ticking = false;

  const log = (...args) => DEBUG && console.log('[NavbarTrigger]', ...args);
  const warn = (...args) => console.warn('[NavbarTrigger]', ...args);

  function remToPx(rem) {
    const fs = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    return rem * fs;
  }

  function getScrollY() {
    return window.scrollY || window.pageYOffset || 0;
  }

  function stateFromScrollY(y) {
    return y >= thresholdPx ? 'into' : 'out';
  }

  function clickAll(selector) {
    const nodes = Array.from(document.querySelectorAll(selector));
    if (!nodes.length) {
      warn(`No elements found for selector: ${selector}`);
      return;
    }
    nodes.forEach((el) => el.click());
    log('Clicked', { selector, count: nodes.length });
  }

  function applyState(nextState, { force = false, source = 'scroll' } = {}) {
    if (!force && nextState === lastState) return;

    log('Evaluate', {
      source,
      scrollY: getScrollY(),
      thresholdPx,
      nextState,
      lastState,
      force,
    });

    // NOTE: Keeping your original behavior exactly:
    // - State 'into' triggers clicks on OUT selector
    // - State 'out' triggers clicks on INTO selector
    // (If this is inverted in your project, swap the selectors below.)
    if (nextState === 'into') {
      clickAll(CONFIG.selectors.out);
    } else {
      clickAll(CONFIG.selectors.into);
    }

    lastState = nextState;
  }

  function evaluate({ source = 'scroll', force = false } = {}) {
    const y = getScrollY();
    const next = stateFromScrollY(y);
    applyState(next, { force, source });
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(() => {
      evaluate({ source: 'scroll' });
      ticking = false;
    });
  }

  function onResize() {
    thresholdPx = remToPx(CONFIG.thresholdRem);
    log('Resize → recalculated threshold', { thresholdPx });
    evaluate({ source: 'resize' });
  }

  function init() {
    thresholdPx = remToPx(CONFIG.thresholdRem);
    evaluate({ source: 'init', force: true });
  }

  // Boot
  function scheduleInit(source) {
    window.setTimeout(() => init(), CONFIG.initDelayMs);
    log('Scheduled init', { source, delayMs: CONFIG.initDelayMs });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => scheduleInit('DOMContentLoaded'));
  } else {
    scheduleInit('readyState');
  }

  window.addEventListener('load', () => scheduleInit('load'));         // handles restored scroll
  window.addEventListener('pageshow', () => scheduleInit('pageshow')); // bfcache restores
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
})();
