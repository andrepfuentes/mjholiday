/**
 * ---------------------------------------------------------------------------
 * DATA LAYER — DEVIS FORM SUBMIT (WEBFLOW)
 * ---------------------------------------------------------------------------
 * Purpose:
 * - Pushes a `form_submit_success` event to `dataLayer` when the Devis form
 *   is successfully submitted.
 * - Safely collects selected values from the form fields.
 * - Supports both:
 *     - Native submit flow (valid form)
 *     - Webflow success states detected via MutationObserver
 *
 * Tracked fields:
 * - location
 * - number_of_adults
 * - number_of_children
 * - situation
 * - email
 *
 * Notes:
 * - Defensive: exits quietly if form or dataLayer is missing.
 * - Uses MutationObserver to catch async success states.
 * - Set DEBUG to true to enable console logs.
 * ---------------------------------------------------------------------------
 */

(function DevisFormDataLayer() {
  const DEBUG = false;

  const SELECTORS = {
    form: '#wf-form-Devis-Form',
    success: '.w-form-done, .success-message, [style*="display: block"]',

    fields: {
      location: 'select[name="Votre Resort"]',
      adults: 'select[name="Nombre D\'Adultes"]',
      children: 'select[name="Nombre D\'Enfant"]',
      situation: 'select[name="Vous Venez"]',
      email: 'input[name="Email"]',
    },
  };

  const log = (...args) => DEBUG && console.log('[DataLayer Devis]', ...args);
  const warn = (...args) => console.warn('[DataLayer Devis]', ...args);

  function getForm() {
    return document.querySelector(SELECTORS.form);
  }

  function getValue(form, selector) {
    const el = form.querySelector(selector);
    return el ? el.value : '';
  }

  function collectFormData(form) {
    try {
      return {
        location: getValue(form, SELECTORS.fields.location),
        number_of_adults: getValue(form, SELECTORS.fields.adults),
        number_of_children: getValue(form, SELECTORS.fields.children),
        situation: getValue(form, SELECTORS.fields.situation),
        email: getValue(form, SELECTORS.fields.email),
      };
    } catch (err) {
      warn('Failed to collect form data', err);
      return {};
    }
  }

  function pushDataLayer(payload) {
    if (typeof window.dataLayer === 'undefined') {
      warn('dataLayer not found. Skipping push.');
      return;
    }

    window.dataLayer.push({
      event: 'form_submit_success',
      ...payload,
    });

    log('dataLayer event pushed', payload);
  }

  function handleSubmit(form) {
    if (typeof form.checkValidity === 'function' && !form.checkValidity()) {
      log('Form invalid — skipping dataLayer push');
      return;
    }

    // Small delay to allow Webflow to update DOM/state
    window.setTimeout(() => {
      const data = collectFormData(form);
      pushDataLayer(data);
    }, 100);
  }

  function observeSuccess(form) {
    if (!('MutationObserver' in window)) return;

    const observer = new MutationObserver(() => {
      const successEl = form.querySelector(SELECTORS.success);
      if (successEl && successEl.offsetParent !== null) {
        log('Success state detected via MutationObserver');
        const data = collectFormData(form);
        pushDataLayer(data);
        observer.disconnect();
      }
    });

    observer.observe(form, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ['style', 'class'],
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const form = getForm();
    if (!form) {
      warn(`Form not found (${SELECTORS.form}).`);
      return;
    }

    log('Initialized');

    form.addEventListener('submit', () => handleSubmit(form));
    observeSuccess(form);
  });
})();
