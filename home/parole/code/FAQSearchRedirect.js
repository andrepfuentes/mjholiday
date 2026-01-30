/**
 * ---------------------------------------------------------------------------
 * FAQ — SEARCH REDIRECT (WEBFLOW)
 * ---------------------------------------------------------------------------
 * Purpose:
 * - Intercepts a custom FAQ search form and redirects the user to the FAQ page
 *   with a `_contain` query parameter based on the input value.
 *
 * Behavior:
 * - Prevents native form submission (Enter key or submit).
 * - On button click:
 *     - Reads the input value
 *     - Redirects to `/faq?_contain=<query>`
 * - On Enter key inside the input:
 *     - Triggers the same behavior as clicking the button.
 *
 * Requirements:
 * - Form attribute: `mj-holiday="faq-search"`
 * - Input name: `Nom`
 * - Button selector: `a.button`
 *
 * Notes:
 * - Defensive: exits quietly if required elements are missing.
 * - Set DEBUG to true to enable console logs.
 * ---------------------------------------------------------------------------
 */

(function FAQSearchRedirect() {
  const DEBUG = false;

  const CONFIG = {
    formSelector: 'form[mj-holiday="faq-search"]',
    inputSelector: 'input[name="Nom"]',
    buttonSelector: 'a.button',
    targetUrl: 'https://mj-holidays.webflow.io/faq',
    queryParam: '_contain',
  };

  const log = (...args) => DEBUG && console.log('[FAQ Redirect]', ...args);
  const warn = (...args) => console.warn('[FAQ Redirect]', ...args);

  function buildUrl(query) {
    const params = new URLSearchParams({
      [CONFIG.queryParam]: query,
    });
    return `${CONFIG.targetUrl}?${params.toString()}`;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector(CONFIG.formSelector);
    const input = form?.querySelector(CONFIG.inputSelector);
    const button = form?.querySelector(CONFIG.buttonSelector);

    if (!form || !input || !button) {
      warn('Required elements not found.', {
        form: !!form,
        input: !!input,
        button: !!button,
      });
      return;
    }

    log('Initialized');

    // Prevent native form submission (Enter key, etc.)
    form.addEventListener('submit', (event) => {
      event.preventDefault();
    });

    function handleRedirect() {
      const query = (input.value || '').trim();
      if (!query) {
        warn('Input is empty. Aborting redirect.');
        return;
      }

      const url = buildUrl(query);
      log('Redirecting to FAQ', { url });

      window.location.href = url;
    }

    // Button click
    button.addEventListener('click', (event) => {
      event.preventDefault();
      handleRedirect();
    });

    // Enter key inside input → same behavior
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleRedirect();
      }
    });
  });
})();
