import { useEffect } from "react";
import { StatusBar, Style } from "@capacitor/status-bar";
import { Capacitor } from "@capacitor/core";

export const useStatusBar = () => {
  useEffect(() => {
    const initStatusBar = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          // Configurar estilo da status bar para preto
          await StatusBar.setStyle({ style: Style.Light });

          // Definir cor de fundo (deve coincidir com a cor do header)
          await StatusBar.setBackgroundColor({ color: "#ffffff" });

          // Mostrar a status bar se estiver oculta
          await StatusBar.show();
        } catch (error) {
          console.warn("Erro ao configurar StatusBar:", error);
        }
      }
    };

    initStatusBar();
  }, []);
};
