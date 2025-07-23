import { useState } from "react";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Capacitor } from "@capacitor/core";
import { toast } from "@/hooks/use-toast";

export const useCamera = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const takePhoto = async (): Promise<string | null> => {
    setIsProcessing(true);

    try {
      // Verificar se está rodando em dispositivo nativo
      if (!Capacitor.isNativePlatform()) {
        // Fallback para web - usar input file
        return new Promise((resolve) => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/*";
          input.capture = "environment"; // Use camera if available

          input.onchange = (event) => {
            const file = (event.target as HTMLInputElement).files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (e) => {
                resolve(e.target?.result as string);
              };
              reader.onerror = () => {
                toast({
                  variant: "destructive",
                  title: "Erro",
                  description: "Erro ao ler o arquivo de imagem",
                });
                resolve(null);
              };
              reader.readAsDataURL(file);
            } else {
              resolve(null);
            }
          };

          input.click();
        });
      }

      // Para dispositivos nativos, usar o plugin do Capacitor
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt, // Permite escolher entre câmera e galeria
      });

      return image.dataUrl || null;
    } catch (error: any) {
      console.error("Erro ao acessar câmera:", error);

      // Tratar diferentes tipos de erro
      if (error?.message?.includes("User cancelled")) {
        // Usuário cancelou, não mostrar erro
        return null;
      }

      if (error?.message?.includes("permission")) {
        toast({
          variant: "destructive",
          title: "Permissão necessária",
          description:
            "É necessário permitir o acesso à câmera e galeria nas configurações do app",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erro na câmera",
          description: "Não foi possível acessar a câmera. Tente novamente.",
        });
      }

      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const pickFromGallery = async (): Promise<string | null> => {
    setIsProcessing(true);

    try {
      if (!Capacitor.isNativePlatform()) {
        // Fallback para web
        return new Promise((resolve) => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/*";

          input.onchange = (event) => {
            const file = (event.target as HTMLInputElement).files?.[0];
            if (file) {
              // Verificar tamanho do arquivo (máximo 5MB)
              if (file.size > 5 * 1024 * 1024) {
                toast({
                  variant: "destructive",
                  title: "Erro",
                  description: "A imagem deve ter no máximo 5MB",
                });
                resolve(null);
                return;
              }

              // Verificar tipo do arquivo
              if (!file.type.startsWith("image/")) {
                toast({
                  variant: "destructive",
                  title: "Erro",
                  description: "Por favor, selecione apenas arquivos de imagem",
                });
                resolve(null);
                return;
              }

              const reader = new FileReader();
              reader.onload = (e) => {
                resolve(e.target?.result as string);
              };
              reader.onerror = () => {
                toast({
                  variant: "destructive",
                  title: "Erro",
                  description: "Erro ao ler o arquivo de imagem",
                });
                resolve(null);
              };
              reader.readAsDataURL(file);
            } else {
              resolve(null);
            }
          };

          input.click();
        });
      }

      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos, // Apenas galeria
      });

      return image.dataUrl || null;
    } catch (error: any) {
      console.error("Erro ao acessar galeria:", error);

      if (error?.message?.includes("User cancelled")) {
        return null;
      }

      if (error?.message?.includes("permission")) {
        toast({
          variant: "destructive",
          title: "Permissão necessária",
          description:
            "É necessário permitir o acesso à galeria nas configurações do app",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erro na galeria",
          description: "Não foi possível acessar a galeria. Tente novamente.",
        });
      }

      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    takePhoto,
    pickFromGallery,
    isProcessing,
  };
};
