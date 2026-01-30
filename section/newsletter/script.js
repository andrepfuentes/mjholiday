
  function initLabelToggle() {
    const inputs = document.querySelectorAll(".form-line .form-input");

    inputs.forEach((input) => {
      const wrapper = input.closest(".form-line");
      const label = wrapper.querySelector("label");
      if (!label) return;

      input.addEventListener("focus", () => {
        label.style.display = "none";
      });

      input.addEventListener("blur", () => {
        label.style.display = input.value.trim() === "" ? "inline" : "none";
      });

      if (input.value.trim() !== "") {
        label.style.display = "none";
      }
    });
  }

  // Observe DOM for form injection
  const observer = new MutationObserver(() => {
    if (document.querySelector(".form-line .form-input")) {
      observer.disconnect();
      initLabelToggle();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
