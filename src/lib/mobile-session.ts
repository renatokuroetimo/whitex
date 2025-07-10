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
  private static readonly OLD_KEY = "user"; // Legacy key for compatibility

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

      // Legacy key for compatibility
      localStorage.setItem(this.OLD_KEY, userData);

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
      console.log("🔍 Getting session... isMobile:", isMobileApp());

      // Try primary storage first
      let userData = localStorage.getItem(this.SESSION_KEY);
      console.log(
        "�� Primary storage result:",
        userData ? "found" : "not found",
      );

      // If not found, try legacy key (for existing users)
      if (!userData) {
        userData = localStorage.getItem(this.OLD_KEY);
        if (userData) {
          console.log("📱 Found session in legacy key, migrating...");
          localStorage.setItem(this.SESSION_KEY, userData);
        }
      }

      // If mobile and still not found, try backup
      if (!userData && isMobileApp()) {
        console.log("📱 Trying backup storage...");
        userData =
          localStorage.getItem(this.BACKUP_KEY) ||
          sessionStorage.getItem(this.SESSION_KEY);

        // If we recovered from backup, restore primary
        if (userData) {
          localStorage.setItem(this.SESSION_KEY, userData);
          console.log("✅ Session recovered from backup");
        } else {
          console.log("❌ No backup session found");
        }
      }

      const result = userData ? JSON.parse(userData) : null;
      console.log(
        "🔍 Session result:",
        result ? `Found user: ${result.email}` : "No session",
      );
      return result;
    } catch (error) {
      console.error("❌ Error getting session:", error);
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
