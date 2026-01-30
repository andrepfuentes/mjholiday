/**
 * ---------------------------------------------------------------------------
 * NAV / DROPDOWNS — MOVE LINKS INTO MATCHING MENUS
 * ---------------------------------------------------------------------------
 * Purpose:
 * - For each element with `[mjholidays-dropdown="<key>"]`, move its dropdown links
 *   into the matching container: `[mjholidays-menu="<key>"]`.
 * - Special case:
 *     - When `<key>` is "resorts", also move `.modal-devis_option` elements into:
 *       `[mj-holiday-select="resort"]`.
 *
 * Behavior:
 * - Elements are MOVED (appendChild), not duplicated.
 * - Safe to run even if some dropdowns/targets are missing.
 *
 * Notes:
 * - Set DEBUG to true to enable console logs.
 * ---------------------------------------------------------------------------
 */

(function MjholidaysDropdownReparenting() {
  const DEBUG = false;

  const SELECTORS = {
    dropdown: '[mjholidays-dropdown]',
    menuByKey: (key) => `[mjholidays-menu="${key}"]`,
    dropdownLinks: '.navbar_menu_dropdown_link',

    resortSelectTarget: '[mj-holiday-select="resort"]',
    resortOptions: '.modal-devis_option',
  };

  const log = (...args) => DEBUG && console.log('[Mjholidays Menu]', ...args);
  const warn = (...args) => console.warn('[Mjholidays Menu]', ...args);

  document.addEventListener('DOMContentLoaded', () => {
    const dropdowns = Array.from(document.querySelectorAll(SELECTORS.dropdown));
    if (!dropdowns.length) {
      warn(`No dropdowns found (${SELECTORS.dropdown}).`);
      return;
    }

    dropdowns.forEach((dropdown) => {
      const key = dropdown.getAttribute('mjholidays-dropdown')?.trim();
      if (!key) return;

      // 1) Move dropdown links into matching menu
      const targetMenu = document.querySelector(SELECTORS.menuByKey(key));
      if (targetMenu) {
        const links = Array.from(dropdown.querySelectorAll(SELECTORS.dropdownLinks));
        links.forEach((link) => targetMenu.appendChild(link));
        log('Moved links', { key, count: links.length });
      } else {
        log('Target menu not found', { key });
      }

      // 2) Special case: "resorts" → move options into select target
      if (key === 'resorts') {
        const selectTarget = document.querySelector(SELECTORS.resortSelectTarget);
        if (!selectTarget) {
          log('Resort select target not found', { selector: SELECTORS.resortSelectTarget });
          return;
        }

        const options = Array.from(dropdown.querySelectorAll(SELECTORS.resortOptions));
        options.forEach((opt) => selectTarget.appendChild(opt));
        log('Moved resort options', { count: options.length });
      }
    });
  });
})();
