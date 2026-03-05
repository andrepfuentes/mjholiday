/**
 * ---------------------------------------------------------------------------
 * NAV / DROPDOWNS — CLONE LINKS INTO MATCHING MENUS
 * ---------------------------------------------------------------------------
 * Purpose:
 * - For each element with `[mjholidays-dropdown="<key>"]`, read all
 *   `.navbar_dropdown_link-text` links inside it.
 * - Clone those links and append them into the matching container:
 *     `[mjholidays-menu="<key>"]`.
 *
 * - While cloning, the link class is normalized:
 *     - All existing classes are removed
 *     - The class `navbar_menu_dropdown_link` is applied
 *
 * - Special case:
 *     - When `<key>` is "resorts", `.modal-devis_option` elements are MOVED
 *       into `[mj-holiday-select="resort"]`.
 *
 * Behavior:
 * - Dropdown links are CLONED (not moved).
 * - Each target menu receives its own set of clones.
 * - Existing `.navbar_menu_dropdown_link` elements inside the menu are removed
 *   before inserting the new ones to avoid duplication.
 *
 * Safety:
 * - Script fails gracefully if dropdowns or target menus are missing.
 *
 * Notes:
 * - Set DEBUG to true to enable console logs.
 * ---------------------------------------------------------------------------
 */

(function MjholidaysDropdownReparenting() {
  const DEBUG = false;

  const SELECTORS = {
    dropdown: "[mjholidays-dropdown]",
    menusByKey: (key) => `[mjholidays-menu="${key}"]`,

    dropdownLinkText: ".navbar_dropdown_link-text",
    menuLinkText: ".navbar_menu_dropdown_link",

    resortSelectTarget: '[mj-holiday-select="resort"]',
    resortOptions: ".modal-devis_option",
  };

  const log = (...args) => DEBUG && console.log("[Mjholidays Menu]", ...args);
  const warn = (...args) => console.warn("[Mjholidays Menu]", ...args);

  function syncKey(key, dropdownEl) {
    const targetMenus = Array.from(document.querySelectorAll(SELECTORS.menusByKey(key)));
    if (!targetMenus.length) {
      log("No target menus found", { key });
      return;
    }

    const sourceLinks = Array.from(dropdownEl.querySelectorAll(SELECTORS.dropdownLinkText));
    if (!sourceLinks.length) {
      log("No source links found inside dropdown", { key });
      return;
    }

    targetMenus.forEach((menu, menuIndex) => {
      // Remove existing generated links
      Array.from(menu.querySelectorAll(SELECTORS.menuLinkText)).forEach((n) => n.remove());

      sourceLinks.forEach((link) => {
        const clone = link.cloneNode(true);

        // Normalize classes
        clone.className = "";
        clone.classList.add("navbar_menu_dropdown_link");

        menu.appendChild(clone);
      });

      log("Synced menu", { key, menuIndex, count: sourceLinks.length });
    });
  }

  function syncResortsOptions(dropdownEl) {
    const selectTarget = document.querySelector(SELECTORS.resortSelectTarget);
    if (!selectTarget) return;

    const options = Array.from(dropdownEl.querySelectorAll(SELECTORS.resortOptions));
    options.forEach((opt) => selectTarget.appendChild(opt));

    log("Moved resort options", { count: options.length });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const dropdowns = Array.from(document.querySelectorAll(SELECTORS.dropdown));
    if (!dropdowns.length) {
      warn(`No dropdowns found (${SELECTORS.dropdown}).`);
      return;
    }

    dropdowns.forEach((dropdownEl) => {
      const key = dropdownEl.getAttribute("mjholidays-dropdown")?.trim();
      if (!key) return;

      syncKey(key, dropdownEl);

      if (key === "resorts") {
        syncResortsOptions(dropdownEl);
      }
    });
  });
})();
