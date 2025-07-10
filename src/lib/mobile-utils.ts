/**
 * Utility functions for mobile app environment detection
 */

/**
 * Checks if the app is running in mobile mode (Capacitor)
 */
export const isMobileApp = (): boolean => {
  return import.meta.env.VITE_APP_MODE === "mobile";
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
