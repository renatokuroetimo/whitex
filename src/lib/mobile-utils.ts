/**
 * Utility functions for mobile app environment detection
 */

/**
 * Checks if the app is running in mobile mode (Capacitor)
 * Only returns true for actual mobile app (Capacitor), not mobile browsers
 */
export const isMobileApp = (): boolean => {
  // Only return true if actually running in Capacitor (native mobile app)
  const isCapacitor = !!(window as any).Capacitor;

  console.log("🔍 Mobile detection:", {
    hasCapacitor: isCapacitor,
    userAgent: navigator.userAgent,
    finalResult: isCapacitor,
  });

  // ONLY consider it mobile app if running in Capacitor (actual native app)
  // Do NOT rely on VITE_APP_MODE or user agent to avoid showing in browser
  return isCapacitor;
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
