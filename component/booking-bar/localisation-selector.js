  /**
 * Booking Bar: Localisation Selector Logic
 * ----------------------------------------
 * This script handles the behavior of the localisation dropdown in the booking bar.
 *
 * Functionality:
 * 1. When a user clicks on an element with the class `.booking-bar_dropdown_localisation_text`:
 *    - The clicked element's text will be displayed in the element with `[localisation="title"]`.
 *    - If the clicked element has a `localisation-url` attribute, its value will be set in the hidden
 *      input field with `name="localisation"`.
 *
 * Requirements:
 * - A hidden input: <input name="localisation" />
 * - A display element: <div localisation="title">...</div>
 * - Clickable options: <div class="booking-bar_dropdown_localisation_text" localisation-url="...">...</div>
 */

  document.addEventListener('DOMContentLoaded', function () {
    console.log('[Booking Bar] Initializing localisation selection logic...');

    const localisationOptions = document.querySelectorAll('.booking-bar_dropdown_localisation_text');
    const titleDisplay = document.querySelector('[localisation="title"]');
    const hiddenInput = document.querySelector('input[name="localisation"]');

    if (!localisationOptions.length || !titleDisplay || !hiddenInput) {
      console.warn('[Booking Bar] Required elements not found.');
      return;
    }

    localisationOptions.forEach(option => {
      option.addEventListener('click', function () {
        const selectedText = option.textContent.trim();
        const selectedURL = option.getAttribute('localisation-url') || '';

        // Update the visible dropdown title
        titleDisplay.textContent = selectedText;
        console.log(`[Booking Bar] Selected title: ${selectedText}`);

        // Update the hidden input with the selected URL
        hiddenInput.value = selectedURL;
        console.log(`[Booking Bar] Hidden input set to: ${selectedURL}`);
      });
    });
  });
