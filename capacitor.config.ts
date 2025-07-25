import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "br.com.timo.whitex",
  appName: "WhiteX",
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
      backgroundColor: "#00B2BA",
      showSpinner: false,
    },
    StatusBar: {
      style: "light",
      backgroundColor: "#000000",
    },
    Keyboard: {
      resize: "ionic",
    },
    Camera: {
      // Configurações para melhor funcionamento da câmera
    },
    // Configurações de rede importantes para produção
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
