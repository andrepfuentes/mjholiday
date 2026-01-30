(function () {
  const FINSWEET_SRC = "https://cdn.jsdelivr.net/npm/@finsweet/attributes@2/attributes.js";
  const FINSWEET_TIMEOUT_MS = 8000;

  const MOBILE_MAX = 767;

  // Debounce helper
  const debounce = (fn, ms = 120) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  };

  function hasFinsweetLoaded() {
    // fsAttributes is the most common global when Attributes v2 is present
    return !!window.fsAttributes;
  }

  function injectFinsweetScript() {
    return new Promise((resolve, reject) => {
      // If script already exists in DOM, wait for it to be ready
      const existing = document.querySelector(`script[src="${FINSWEET_SRC}"]`);
      if (existing) {
        // If already loaded, resolve; else wait a bit
        if (hasFinsweetLoaded()) return resolve();
        return waitForFinsweet(resolve, reject);
      }

      const s = document.createElement("script");
      s.type = "module";
      s.async = true;
      s.src = FINSWEET_SRC;

      // Optional: if you rely on specific attributes, keep them here
      s.setAttribute("fs-list", "");

      s.addEventListener("load", () => {
        if (hasFinsweetLoaded()) return resolve();
        waitForFinsweet(resolve, reject);
      });

      s.addEventListener("error", () => {
        reject(new Error("[Finsweet] Failed to load attributes.js"));
      });

      document.head.appendChild(s);
    });
  }

  function waitForFinsweet(resolve, reject) {
    const start = Date.now();

    (function tick() {
      if (hasFinsweetLoaded()) return resolve();
      if (Date.now() - start > FINSWEET_TIMEOUT_MS) {
        return reject(new Error("[Finsweet] attributes.js loaded but fsAttributes not available (timeout)"));
      }
      requestAnimationFrame(tick);
    })();
  }

  // -------------------------
  // Your existing logic
  // -------------------------
  function updateSlider(container) {
    const slides = container.querySelectorAll(".parole_slide.w-slide");
    if (!slides.length) return;

    // Desktop/tablet ≥ 768px: remove inline heights
    if (window.innerWidth > MOBILE_MAX) {
      slides.forEach((s) => (s.style.height = ""));
      return;
    }

    // Mobile: set all to 0px
    slides.forEach((s) => (s.style.height = "0px"));

    // Find active dot index
    const dots = container.querySelectorAll(".w-slider-nav .w-slider-dot");
    if (!dots.length) return;

    let activeIndex = -1;
    dots.forEach((dot, i) => {
      if (dot.classList.contains("w-active")) activeIndex = i;
    });

    if (activeIndex >= 0 && slides[activeIndex]) {
      slides[activeIndex].style.height = "auto";
    }
  }

  function hookSlider(container) {
    const update = () => updateSlider(container);

    // Initial update
    update();

    // On arrows/dots click
    container.addEventListener("click", (e) => {
      if (
        e.target.closest(".w-slider-arrow-left") ||
        e.target.closest(".w-slider-arrow-right") ||
        e.target.closest(".w-slider-nav .w-slider-dot")
      ) {
        requestAnimationFrame(() => setTimeout(update, 0));
      }
    });

    // Observe dot class changes (w-active)
    const nav = container.querySelector(".w-slider-nav");
    if (nav && "MutationObserver" in window) {
      const mo = new MutationObserver(() => update());
      mo.observe(nav, { attributes: true, subtree: true, attributeFilter: ["class"] });
    }
  }

  function run() {
    // Bind all parole sliders
    document.querySelectorAll(".parole_slider.w-slider").forEach(hookSlider);

    // Recompute on resize (debounced)
    window.addEventListener(
      "resize",
      debounce(() => {
        document.querySelectorAll(".parole_slider.w-slider").forEach(updateSlider);
      }, 150)
    );
  }

  // -------------------------
  // Boot sequence
  // -------------------------
  document.addEventListener("DOMContentLoaded", async () => {
    try {
      if (!hasFinsweetLoaded()) {
        console.log("[Finsweet] Not found — loading...");
        await injectFinsweetScript();
        console.log("[Finsweet] Loaded");
      } else {
        console.log("[Finsweet] Already loaded");
      }

      run();
    } catch (err) {
      console.warn("[Finsweet] Proceeding without Finsweet (loader failed):", err);
      // Your code doesn't strictly depend on Finsweet, so we can still run:
      run();
    }
  });
})();
