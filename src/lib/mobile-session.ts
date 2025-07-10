/**
 * Mobile session management utilities
 * Ensures localStorage persistence in Capacitor apps
 */

import { isMobileApp } from "./mobile-utils";

/**
 * Enhanced localStorage for mobile apps
 * Some mobile environments may clear localStorage, so we add extra persistence
 */
export class MobileSessionManager {
  private static readonly SESSION_KEY = "medical_app_current_user";
  private static readonly BACKUP_KEY = "medical_app_session_backup";

  /**
   * Save user session with backup for mobile
   */
  static saveSession(user: any): void {
    try {
      const userData = JSON.stringify(user);
      console.log(
        "💾 Saving session for user:",
        user.email,
        "isMobile:",
        isMobileApp(),
      );

      // Primary storage
      localStorage.setItem(this.SESSION_KEY, userData);

      // Backup storage for mobile
      if (isMobileApp()) {
        localStorage.setItem(this.BACKUP_KEY, userData);
        // Also try sessionStorage as additional backup
        sessionStorage.setItem(this.SESSION_KEY, userData);
        console.log("📱 Mobile session saved with backup for:", user.email);
      } else {
        console.log("💻 Web session saved for:", user.email);
      }
    } catch (error) {
      console.error("❌ Error saving session:", error);
    }
  }

  /**
   * Get user session with fallback recovery
   */
  static getSession(): any | null {
    try {
      // Try primary storage first
      let userData = localStorage.getItem(this.SESSION_KEY);

      // If mobile and primary failed, try backup
      if (!userData && isMobileApp()) {
        console.log("📱 Primary session not found, trying backup...");
        userData =
          localStorage.getItem(this.BACKUP_KEY) ||
          sessionStorage.getItem(this.SESSION_KEY);

        // If we recovered from backup, restore primary
        if (userData) {
          localStorage.setItem(this.SESSION_KEY, userData);
          console.log("📱 Session recovered from backup");
        }
      }

      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error getting mobile session:", error);
      return null;
    }
  }

  /**
   * Clear all session data
   */
  static clearSession(): void {
    try {
      localStorage.removeItem(this.SESSION_KEY);
      sessionStorage.removeItem(this.SESSION_KEY);

      if (isMobileApp()) {
        localStorage.removeItem(this.BACKUP_KEY);
        console.log("📱 Mobile session cleared completely");
      }
    } catch (error) {
      console.error("Error clearing mobile session:", error);
    }
  }

  /**
   * Check if session exists
   */
  static hasSession(): boolean {
    return this.getSession() !== null;
  }

  /**
   * Validate session integrity
   */
  static validateSession(): boolean {
    const session = this.getSession();
    return session && session.id && session.email && session.profession;
  }
}
