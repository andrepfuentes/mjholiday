/**
 * Syncs the active state of .home-resorts_left_image-link elements
 * with the currently "center-visible" .home-resorts_item.
 */

document.addEventListener("DOMContentLoaded", function () {
  const resortItems = Array.from(document.querySelectorAll(".home-resorts_item"));
  const imageLinks  = Array.from(document.querySelectorAll(".home-resorts_left_image-link"));

  if (!resortItems.length || !imageLinks.length) return;

  function setActiveImageLinkById(activeId) {
    imageLinks.forEach(link => {
      link.classList.toggle("is-active", link.id === activeId);
    });
  }

  function getFirstCenterVisibleId() {
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const bandTop = vh * 0.25;
    const bandBot = vh * 0.75;

    for (const el of resortItems) {
      const r = el.getBoundingClientRect();
      const mid = r.top + r.height / 2;
      if (mid >= bandTop && mid <= bandBot) return el.id;
    }

    return resortItems[0]?.id;
  }

  setActiveImageLinkById(getFirstCenterVisibleId());

  const observer = new IntersectionObserver(entries => {
    const candidates = entries
      .filter(e => e.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

    if (candidates.length) {
      setActiveImageLinkById(candidates[0].target.id);
    }
  }, {
    rootMargin: "-35% 0px -35% 0px",
    threshold: 0.01
  });

  resortItems.forEach(el => observer.observe(el));

  window.addEventListener("resize", () => {
    setActiveImageLinkById(getFirstCenterVisibleId());
  }, { passive: true });
});

