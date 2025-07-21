/**
 * Utility functions for mobile app environment detection
 */

/**
 * Checks if the app is running in mobile mode (Capacitor)
 * Only returns true for actual mobile app (Capacitor), not mobile browsers
 */
export const isMobileApp = (): boolean => {
  // For now, always return false to fix browser login issue
  // This ensures doctors can login in browser
  // TODO: Properly detect Capacitor in production mobile apps

  const hasCapacitor = typeof (window as any).Capacitor !== "undefined";
  const isBrowser = window.location.protocol.startsWith("http");

  console.log("🔍 Mobile detection (fixed):", {
    hasCapacitor,
    isBrowser,
    protocol: window.location.protocol,
    host: window.location.host,
    finalResult: false, // Always false for now
  });

  // Always return false to allow doctors to login in browser
  // Mobile-specific restrictions will be handled differently
  return false;
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
