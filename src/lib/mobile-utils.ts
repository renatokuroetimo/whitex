/**
 * Utility functions for mobile app environment detection
 */

/**
 * Checks if the app is running in mobile mode (Capacitor)
 * Only returns true for actual mobile app (Capacitor), not mobile browsers
 */
export const isMobileApp = (): boolean => {
  const mode = import.meta.env.VITE_APP_MODE;
  const isCapacitor = !!(window as any).Capacitor;

  console.log("🔍 Mobile detection:", {
    VITE_APP_MODE: mode,
    hasCapacitor: isCapacitor,
    isWebBrowser: !isCapacitor && !mode,
    finalResult: mode === "mobile" || isCapacitor,
  });

  // Only consider it mobile app if explicitly set to mobile mode OR running in Capacitor
  // Do NOT use user agent detection as it would affect mobile browsers
  return mode === "mobile" || isCapacitor;
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
