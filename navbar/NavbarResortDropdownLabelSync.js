/**
 * ---------------------------------------------------------------------------
 * NAVBAR — RESORT DROPDOWN TOGGLE LABEL SYNC (w--current)
 * ---------------------------------------------------------------------------
 * Purpose:
 * - Keeps the resort dropdown toggle label in sync with the currently active
 *   navbar link (`.navbar_wrapper2_link.w--current`).
 *
 * Behavior:
 * - On load: sets the toggle label based on the current active link (if any).
 * - Then watches navbar links for class changes and updates when a link gains
 *   `w--current`.
 *
 * Notes:
 * - Set DEBUG to true to enable console logs.
 * - Uses MutationObserver (supported by all modern browsers).
 * ---------------------------------------------------------------------------
 */

(function NavbarResortDropdownLabelSync() {
  const DEBUG = false;

  const SELECTORS = {
    toggleText: '.navbar_resort_dropdown_toggle_text',
    navLink: '.navbar_wrapper2_link',
    currentLink: '.navbar_wrapper2_link.w--current',
  };

  const log = (...args) => DEBUG && console.log('[Navbar Resort Label]', ...args);
  const warn = (...args) => console.warn('[Navbar Resort Label]', ...args);

  function setToggleText(toggleEl, text) {
    const clean = (text || '').trim();
    if (!clean) return;
    toggleEl.textContent = clean;
    log('Updated toggle text', { text: clean });
  }

  function findCurrentLinkText() {
    const current = document.querySelector(SELECTORS.currentLink);
    return current ? current.textContent : '';
  }

  document.addEventListener('DOMContentLoaded', () => {
    const toggleTextEl = document.querySelector(SELECTORS.toggleText);
    if (!toggleTextEl) {
      warn(`Missing toggle text element (${SELECTORS.toggleText}).`);
      return;
    }

    // Initial sync
    setToggleText(toggleTextEl, findCurrentLinkText());

    const links = Array.from(document.querySelectorAll(SELECTORS.navLink));
    if (!links.length) return;

    // Observe class changes: when a link becomes current, sync label
    links.forEach((link) => {
      const observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
          if (m.type !== 'attributes' || m.attributeName !== 'class') continue;
          if (!link.classList.contains('w--current')) continue;

          setToggleText(toggleTextEl, link.textContent);
          break;
        }
      });

      observer.observe(link, { attributes: true, attributeFilter: ['class'] });
    });
  });
})();
