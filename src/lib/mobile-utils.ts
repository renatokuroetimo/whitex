/**
 * Utility functions for mobile app environment detection
 */

/**
 * Checks if the app is running in mobile mode (native app built with mobile config)
 * Returns true only for the actual mobile app version, not mobile browsers
 */
export const isMobileApp = (): boolean => {
  // Use the VITE_APP_MODE environment variable set during mobile build
  const appMode = import.meta.env.VITE_APP_MODE;
  const isMobile = appMode === "mobile";

  console.log("🔍 Mobile detection:", {
    appMode,
    isMobile,
    env: import.meta.env.MODE,
  });

  return isMobile;
};

/**
 * Gets the app mode - returns "mobile" or "web"
 */
export const getAppMode = (): "mobile" | "web" => {
  return import.meta.env.VITE_APP_MODE === "mobile" ? "mobile" : "web";
};

/**
 * Checks if the current environment supports medical access
 * Mobile app is patient-only, web supports both doctors and patients
 */
export const supportsMedicalAccess = (): boolean => {
  return !isMobileApp();
};
