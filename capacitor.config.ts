import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.medical.patient.app",
  appName: "Saúde+",
  webDir: "dist",
  server: {
    androidScheme: "https",
    iosScheme: "https",
    // Remove hostname para produção - permite acesso externo
  },
  ios: {
    contentInset: "never",
    allowsLinkPreview: false,
    handleApplicationNotifications: false,
    // Configurações importantes para produção
    preferredContentMode: "mobile",
    // Configurações para melhor suporte à safe area
    backgroundColor: "#ffffff",
    scrollEnabled: true,
  },
  android: {
    // Configurações importantes para produção
    allowMixedContent: true,
    captureInput: true,
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
    // Configurações de rede importantes para produção
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
