import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.medical.patient.app",
  appName: "Saúde+",
  webDir: "dist",
  bundledWebRuntime: false,
  server: {
    androidScheme: "https",
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
  },
};

export default config;
