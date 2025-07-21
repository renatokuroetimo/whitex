/**
 * Utility functions for mobile app environment detection
 */

/**
 * Checks if the app is running in mobile mode (Capacitor)
 * Only returns true for actual mobile app (Capacitor), not mobile browsers
 */
export const isMobileApp = (): boolean => {
  // Check for Capacitor object - only exists in native mobile app
  const hasCapacitor = typeof (window as any).Capacitor !== 'undefined' && (window as any).Capacitor;

  // Additional check for Capacitor platform - more reliable
  const isCapacitorNative = hasCapacitor && (window as any).Capacitor?.isNativePlatform?.();

  // Check if we're NOT in a browser environment
  const isNotBrowser = !window.location.protocol.startsWith('http');

  const result = hasCapacitor && (isCapacitorNative || isNotBrowser);

  console.log("🔍 Mobile detection:", {
    hasCapacitor,
    isCapacitorNative,
    isNotBrowser,
    protocol: window.location.protocol,
    userAgent: navigator.userAgent,
    finalResult: result,
  });

  // ONLY return true if we're definitely in a Capacitor native app
  return result;
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
