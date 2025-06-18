import { supabase } from "./supabase";
import { isFeatureEnabled } from "./feature-flags";

class ProfileImageAPI {
  private readonly STORAGE_KEY_PREFIX = "profile_image_";

  // Simula delay de rede
  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Salvar imagem de perfil
  async saveProfileImage(userId: string, imageData: string): Promise<void> {
    await this.delay(300);

    if (isFeatureEnabled("useSupabaseIndicators") && supabase) {
      console.log("🚀 Salvando imagem de perfil no Supabase");

      try {
        // Calcular tamanho da imagem em bytes (aproximado)
        const base64Size =
          imageData.length * (3 / 4) - (imageData.match(/=/g) || []).length;

        // Tentar fazer upsert (insert ou update)
        const { error } = await supabase.from("profile_images").upsert(
          {
            user_id: userId,
            image_data: imageData,
            mime_type: this.getMimeTypeFromBase64(imageData),
            file_size: base64Size,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id",
          },
        );

        if (error) {
          console.error("❌ Erro ao salvar imagem no Supabase:", error);
          throw error;
        }

        console.log("✅ Imagem de perfil salva no Supabase");

        // Também salvar no localStorage como cache local
        localStorage.setItem(`${this.STORAGE_KEY_PREFIX}${userId}`, imageData);
      } catch (supabaseError) {
        console.error("💥 Erro no Supabase saveProfileImage:", supabaseError);
        // Fallback para localStorage
        localStorage.setItem(`${this.STORAGE_KEY_PREFIX}${userId}`, imageData);
      }
    } else {
      // Fallback para localStorage
      localStorage.setItem(`${this.STORAGE_KEY_PREFIX}${userId}`, imageData);
    }
  }

  // Carregar imagem de perfil
  async getProfileImage(userId: string): Promise<string | null> {
    await this.delay(200);

    if (isFeatureEnabled("useSupabaseIndicators") && supabase) {
      console.log("🚀 Carregando imagem de perfil do Supabase");

      try {
        const { data, error } = await supabase
          .from("profile_images")
          .select("image_data")
          .eq("user_id", userId)
          .single();

        if (error && error.code !== "PGRST116") {
          // PGRST116 = não encontrado
          console.error(
            "❌ Erro ao carregar imagem do Supabase:",
            JSON.stringify(
              {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code,
              },
              null,
              2,
            ),
          );
          // Se der erro, tentar localStorage como fallback
          return localStorage.getItem(`${this.STORAGE_KEY_PREFIX}${userId}`);
        }

        if (data?.image_data) {
          console.log("✅ Imagem carregada do Supabase");
          // Salvar no localStorage como cache
          localStorage.setItem(
            `${this.STORAGE_KEY_PREFIX}${userId}`,
            data.image_data,
          );
          return data.image_data;
        }

        // Se não encontrou no Supabase, tentar localStorage
        return localStorage.getItem(`${this.STORAGE_KEY_PREFIX}${userId}`);
      } catch (supabaseError) {
        console.error("💥 Erro no Supabase getProfileImage:", supabaseError);
        // Fallback para localStorage
        return localStorage.getItem(`${this.STORAGE_KEY_PREFIX}${userId}`);
      }
    } else {
      // Fallback para localStorage
      return localStorage.getItem(`${this.STORAGE_KEY_PREFIX}${userId}`);
    }
  }

  // Remover imagem de perfil
  async removeProfileImage(userId: string): Promise<void> {
    await this.delay(300);

    if (isFeatureEnabled("useSupabaseIndicators") && supabase) {
      console.log("🚀 Removendo imagem de perfil do Supabase");

      try {
        const { error } = await supabase
          .from("profile_images")
          .delete()
          .eq("user_id", userId);

        if (error) {
          console.error("❌ Erro ao remover imagem do Supabase:", error);
        } else {
          console.log("✅ Imagem removida do Supabase");
        }

        // Remover do localStorage também
        localStorage.removeItem(`${this.STORAGE_KEY_PREFIX}${userId}`);
      } catch (supabaseError) {
        console.error("💥 Erro no Supabase removeProfileImage:", supabaseError);
        // Mesmo com erro, remover do localStorage
        localStorage.removeItem(`${this.STORAGE_KEY_PREFIX}${userId}`);
      }
    } else {
      // Fallback para localStorage
      localStorage.removeItem(`${this.STORAGE_KEY_PREFIX}${userId}`);
    }
  }

  // Extrair MIME type do base64
  private getMimeTypeFromBase64(base64: string): string {
    if (base64.startsWith("data:image/png")) {
      return "image/png";
    } else if (
      base64.startsWith("data:image/jpeg") ||
      base64.startsWith("data:image/jpg")
    ) {
      return "image/jpeg";
    } else if (base64.startsWith("data:image/gif")) {
      return "image/gif";
    } else if (base64.startsWith("data:image/webp")) {
      return "image/webp";
    }
    return "image/jpeg"; // padrão
  }

  // Migrar imagens do localStorage para Supabase
  async migrateLocalImagesToSupabase(): Promise<void> {
    if (!isFeatureEnabled("useSupabaseIndicators") || !supabase) {
      return;
    }

    console.log("🔄 Migrando imagens de perfil para Supabase...");

    try {
      // Buscar todas as chaves do localStorage que são imagens de perfil
      const profileImageKeys = Object.keys(localStorage).filter((key) =>
        key.startsWith(this.STORAGE_KEY_PREFIX),
      );

      for (const key of profileImageKeys) {
        const userId = key.replace(this.STORAGE_KEY_PREFIX, "");
        const imageData = localStorage.getItem(key);

        if (imageData && imageData.startsWith("data:")) {
          try {
            // Verificar se já existe no Supabase
            const { data: existing } = await supabase
              .from("profile_images")
              .select("id")
              .eq("user_id", userId)
              .single();

            if (!existing) {
              // Não existe, migrar
              await this.saveProfileImage(userId, imageData);
              console.log(`✅ Imagem migrada para usuário ${userId}`);
            }
          } catch (migrationError) {
            console.warn(
              `⚠️ Erro ao migrar imagem do usuário ${userId}:`,
              migrationError,
            );
          }
        }
      }

      console.log("✅ Migração de imagens concluída");
    } catch (error) {
      console.error("💥 Erro na migração de imagens:", error);
    }
  }
}

export const profileImageAPI = new ProfileImageAPI();
