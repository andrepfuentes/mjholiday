/**
 * ---------------------------------------------------------------------------
 * SEO — FAQPAGE JSON-LD INJECTION (WEBFLOW + FS ACCORDION)
 * ---------------------------------------------------------------------------
 * Purpose:
 * - Builds and injects a Schema.org `FAQPage` JSON-LD script based on
 *   FAQ accordion items rendered on the page.
 *
 * Source markup (expected):
 * - Container items:
 *     `.questions_list [fs-accordion-element="accordion"]`
 * - Question element:
 *     `.questions_list_item_header_label`
 * - Answer element:
 *     `.questions_list_item_content_body`
 *
 * Behavior:
 * - Extracts text content (uses `innerText` to strip HTML and keep readable text)
 * - Collapses whitespace for clean schema output
 * - Injects a single `<script type="application/ld+json">` into `<head>`
 *
 * Notes:
 * - Defensive: exits quietly if no valid Q/A pairs exist.
 * - Set DEBUG to true to enable console logs.
 * - If you might run this multiple times (AJAX), it de-dupes by removing a prior script.
 * ---------------------------------------------------------------------------
 */

(function FAQSchemaJsonLdInjection() {
  const DEBUG = false;

  const CONFIG = {
    itemSelector: '.questions_list [fs-accordion-element="accordion"]',
    questionSelector: '.questions_list_item_header_label',
    answerSelector: '.questions_list_item_content_body',
    scriptId: 'mjholidays-faq-schema',
  };

  const log = (...args) => DEBUG && console.log('[FAQ Schema]', ...args);
  const warn = (...args) => console.warn('[FAQ Schema]', ...args);

  function cleanText(value) {
    return String(value || '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function getAnswerText(el) {
    // innerText strips tags and respects user-visible text
    const raw = el.innerText || el.textContent || '';
    return cleanText(raw);
  }

  function buildFAQSchema() {
    const items = Array.from(document.querySelectorAll(CONFIG.itemSelector));
    if (!items.length) return null;

    const mainEntity = [];

    items.forEach((item) => {
      const qEl = item.querySelector(CONFIG.questionSelector);
      const aEl = item.querySelector(CONFIG.answerSelector);
      if (!qEl || !aEl) return;

      const question = cleanText(qEl.textContent);
      const answer = getAnswerText(aEl);

      if (!question || !answer) return;

      mainEntity.push({
        '@type': 'Question',
        name: question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: answer,
        },
      });
    });

    if (!mainEntity.length) return null;

    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity,
    };
  }

  function injectJsonLd(schema) {
    // De-dupe: replace existing script if present
    const existing = document.getElementById(CONFIG.scriptId);
    if (existing) existing.remove();

    const s = document.createElement('script');
    s.id = CONFIG.scriptId;
    s.type = 'application/ld+json';
    s.text = JSON.stringify(schema);
    document.head.appendChild(s);
  }

  document.addEventListener('DOMContentLoaded', () => {
    log('Looking for FAQ accordions…');

    const schema = buildFAQSchema();
    if (!schema) {
      warn('No valid FAQ items found. Skipping JSON-LD injection.');
      return;
    }

    injectJsonLd(schema);
    log('Injected FAQPage schema', { items: schema.mainEntity.length });
  });
})();
