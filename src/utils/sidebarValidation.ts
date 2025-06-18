// Validation script for Sidebar component
export const validateSidebarFunctionality = () => {
  const results = {
    profileSectionConsistent: false,
    noConditionalText: false,
    navigationHighlight: false,
    profileNavigation: false,
  };

  // Check if profile section always shows "Meu Perfil" without profession text
  const checkProfileSection = () => {
    const profileElements = document.querySelectorAll(
      '[data-testid="profile-section"]',
    );
    if (profileElements.length === 0) {
      // Try alternative selector
      const profileTexts = Array.from(document.querySelectorAll("span")).filter(
        (el) => el.textContent === "Meu Perfil",
      );
      if (profileTexts.length > 0) {
        results.profileSectionConsistent = true;

        // Check if there's no "Médico" or "Paciente" text
        const parent = profileTexts[0].closest("div");
        if (
          parent &&
          !parent.textContent?.includes("Médico") &&
          !parent.textContent?.includes("Paciente")
        ) {
          results.noConditionalText = true;
        }
      }
    }
  };

  // Check if navigation items can be highlighted
  const checkNavigationHighlight = () => {
    const navButtons = document.querySelectorAll("nav button");
    const hasActiveButton = Array.from(navButtons).some(
      (button) =>
        button.classList.contains("bg-blue-50") ||
        button.classList.contains("text-blue-700"),
    );
    results.navigationHighlight = hasActiveButton;
  };

  // Check profile navigation
  const checkProfileNavigation = () => {
    const profileButtons = Array.from(
      document.querySelectorAll("button"),
    ).filter((button) => button.textContent?.includes("▼"));
    results.profileNavigation = profileButtons.length > 0;
  };

  // Run all checks
  checkProfileSection();
  checkNavigationHighlight();
  checkProfileNavigation();

  return results;
};

// Console logging for manual verification
export const logSidebarValidation = () => {
  const results = validateSidebarFunctionality();

  console.group("🧪 Sidebar Validation Results");
  console.log(
    "✅ Profile section consistent:",
    results.profileSectionConsistent,
  );
  console.log(
    "✅ No conditional text (Médico/Paciente):",
    results.noConditionalText,
  );
  console.log("✅ Navigation highlight working:", results.navigationHighlight);
  console.log("✅ Profile navigation working:", results.profileNavigation);

  const allPassed = Object.values(results).every(Boolean);
  console.log(
    "\n🎯 Overall Result:",
    allPassed ? "✅ ALL TESTS PASSED" : "❌ SOME TESTS FAILED",
  );
  console.groupEnd();

  return allPassed;
};

// Auto-run validation when this module is imported in development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  // Run validation after a short delay to ensure DOM is ready
  setTimeout(() => {
    logSidebarValidation();
  }, 1000);
}
