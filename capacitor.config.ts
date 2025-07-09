import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.medical.patient.app",
  appName: "Saúde+",
  webDir: "dist",
  server: {
    androidScheme: "https",
    iosScheme: "https",
    hostname: "localhost",
  },
  ios: {
    contentInset: "automatic",
    allowsLinkPreview: false,
    handleApplicationNotifications: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#4285f4",
      showSpinner: false,
    },
    StatusBar: {
      style: "dark",
      backgroundColor: "#4285f4",
    },
    Keyboard: {
      resize: "ionic",
    },
  },
};

export default config;
