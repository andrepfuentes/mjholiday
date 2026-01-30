/**
 * Hide Section if CMS is Empty (with Debug Logs)
 * ==============================================
 * This script checks if the `.section_parole` contains a `.w-dyn-empty`
 * element (Webflow's "No items found" state).
 * 
 * - If `.w-dyn-empty` exists → hide the entire `.section_parole`.
 * - Logs detailed steps to console for easier debugging.
 * - Runs once on DOMContentLoaded.
 */

document.addEventListener("DOMContentLoaded", () => {
  console.group("[FAQ Debug] Checking section_parole state...");

  const section = document.querySelector(".section_parole");
  if (!section) {
    console.warn("[FAQ Debug] .section_parole not found in DOM.");
    console.groupEnd();
    return;
  }
  console.log("[FAQ Debug] Found .section_parole");

  const emptyState = section.querySelector(".w-dyn-empty");
  if (emptyState) {
    console.log("[FAQ Debug] Found .w-dyn-empty → hiding section.");
    section.style.display = "none";
  } else {
    console.log("[FAQ Debug] No .w-dyn-empty found → section remains visible.");
  }

  console.groupEnd();
});
