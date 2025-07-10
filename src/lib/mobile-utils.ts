/**
 * Utility functions for mobile app environment detection
 */

/**
 * Checks if the app is running in mobile mode (Capacitor)
 */
export const isMobileApp = (): boolean => {
  const mode = import.meta.env.VITE_APP_MODE;
  const isCapacitor = !!(window as any).Capacitor;
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobileUA = /android|ios|iphone|ipad|mobile/.test(userAgent);

  console.log("🔍 Mobile detection:", {
    VITE_APP_MODE: mode,
    hasCapacitor: isCapacitor,
    mobileUserAgent: isMobileUA,
    userAgent: userAgent.substring(0, 50) + "...",
  });

  // Consider it mobile if any of these conditions are true
  return mode === "mobile" || isCapacitor || isMobileUA;
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
