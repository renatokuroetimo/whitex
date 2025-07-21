import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";

interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export const useSafeArea = () => {
  const [safeAreaInsets, setSafeAreaInsets] = useState<SafeAreaInsets>({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  });

  useEffect(() => {
    const updateSafeArea = () => {
      if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === "ios") {
        // Para iOS nativo, usar CSS env() values
        const computedStyle = getComputedStyle(document.documentElement);
        
        // Aplicar CSS variables para safe area
        document.documentElement.style.setProperty(
          '--safe-area-inset-top',
          'env(safe-area-inset-top, 0px)'
        );
        document.documentElement.style.setProperty(
          '--safe-area-inset-bottom',
          'env(safe-area-inset-bottom, 0px)'
        );
        document.documentElement.style.setProperty(
          '--safe-area-inset-left',
          'env(safe-area-inset-left, 0px)'
        );
        document.documentElement.style.setProperty(
          '--safe-area-inset-right',
          'env(safe-area-inset-right, 0px)'
        );

        // Adicionar classe ao body para indicar que é iOS
        document.body.classList.add('ios-device');
        
        // Forçar recálculo de safe area
        const rootElement = document.getElementById('root');
        if (rootElement) {
          rootElement.style.paddingTop = 'env(safe-area-inset-top, 0px)';
          rootElement.style.paddingBottom = 'env(safe-area-inset-bottom, 0px)';
        }
      } else {
        // Para web ou Android, remover safe area
        document.body.classList.remove('ios-device');
      }
    };

    // Aplicar safe area imediatamente
    updateSafeArea();

    // Escutar mudanças de orientação
    const handleOrientationChange = () => {
      setTimeout(updateSafeArea, 100);
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', updateSafeArea);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', updateSafeArea);
    };
  }, []);

  return {
    safeAreaInsets,
    isIOS: Capacitor.isNativePlatform() && Capacitor.getPlatform() === "ios",
  };
};
