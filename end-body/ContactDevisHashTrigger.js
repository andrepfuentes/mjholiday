/**
 * ---------------------------------------------------------------------------
 * CONTACT / DEVIS — HASH-BASED MODAL TRIGGER (WEBFLOW)
 * ---------------------------------------------------------------------------
 * Purpose:
 * - Handles automatic and user-initiated triggers for `#contact` and `#devis`.
 * - Simulates a click on matching anchors/buttons to open the modal.
 * - Prevents repeated re-triggering once a hash has already been handled.
 *
 * Behavior:
 * - On load (after Webflow ready): if URL hash is `#contact` or `#devis`,
 *   waits briefly, then triggers the corresponding action once.
 * - On user click: intercepts clicks to `#contact` / `#devis`, delays briefly,
 *   then triggers (only once per hash).
 *
 * Notes:
 * - Uses a Set to guarantee idempotency per hash.
 * - Set DEBUG to true to enable console logs.
 * ---------------------------------------------------------------------------
 */

(function ContactDevisHashTrigger() {
  const DEBUG = false;

  const CONFIG = {
    hashes: ['#contact', '#devis'],
    triggerDelayMs: 1000,
  };

  const log = (...args) => DEBUG && console.log('[Contact/Devis]', ...args);
  const warn = (...args) => console.warn('[Contact/Devis]', ...args);

  // Prevent multiple auto-triggers
  const triggeredHashes = new Set();

  function findTriggerForHash(hash) {
    return document.querySelector(`a[href="${hash}"], button[href="${hash}"]`);
  }

  function triggerHash(hash, source) {
    if (triggeredHashes.has(hash)) return;

    const el = findTriggerForHash(hash);
    if (!el) {
      warn(`No trigger found for ${hash}`);
      return;
    }

    log(`Triggering ${hash}`, { source, element: el });
    el.click();
    triggeredHashes.add(hash);
  }

  function delayedTriggerIfNeeded(hash, source) {
    if (window.location.hash !== hash) return;
    if (triggeredHashes.has(hash)) return;

    log(`Detected ${hash} — scheduling trigger`, { source });
    window.setTimeout(() => triggerHash(hash, source), CONFIG.triggerDelayMs);
  }

  document.addEventListener('DOMContentLoaded', () => {
    log('DOM ready');

    // Ensure Webflow queue exists
    window.Webflow ||= [];

    // After Webflow initialization
    window.Webflow.push(() => {
      log('Webflow ready');
      CONFIG.hashes.forEach((hash) =>
        delayedTriggerIfNeeded(hash, 'URL hash on load')
      );
    });

    // Handle manual user clicks
    document.addEventListener('click', (event) => {
      const target = event.target.closest(
        'a[href="#contact"], a[href="#devis"], #contact, #devis'
      );
      if (!target) return;

      const hash = target.getAttribute('href') || `#${target.id}`;
      if (!CONFIG.hashes.includes(hash)) return;

      event.preventDefault();
      log('User click intercepted', { hash, target });

      window.setTimeout(
        () => triggerHash(hash, 'User click'),
        CONFIG.triggerDelayMs
      );
    });
  });
})();
