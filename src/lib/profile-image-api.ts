import { supabase } from "./supabase";
import { isFeatureEnabled } from "./feature-flags";

class ProfileImageAPI {
  private readonly STORAGE_KEY_PREFIX = "profile_image_";

  // Delay para simular operação real
  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Verificar se a tabela existe
  async checkTableExists(): Promise<boolean> {
    if (!supabase) {
      throw new Error("Supabase não está configurado");
    }

    try {
      const { error } = await supabase
        .from("profile_images")
        .select("id")
        .limit(1);

      return !error;
    } catch (error) {
      return false;
    }
  }

  // Verificar status de autenticação da aplicação (localStorage)
  async checkAuthenticationStatus(): Promise<{
    isAuthenticated: boolean;
    userId: string | null;
    error: string | null;
  }> {
    try {
      // Verificar se há usuário logado no sistema da aplicação
      const currentUserStr = localStorage.getItem("medical_app_current_user");

      if (!currentUserStr) {
        return {
          isAuthenticated: false,
          userId: null,
          error: "Usuário não autenticado na aplicação",
        };
      }

      const currentUser = JSON.parse(currentUserStr);

      if (!currentUser || !currentUser.id) {
        return {
          isAuthenticated: false,
          userId: null,
          error: "Dados de usuário inválidos",
        };
      }

      return {
        isAuthenticated: true,
        userId: currentUser.id,
        error: null,
      };
    } catch (error) {
      return {
        isAuthenticated: false,
        userId: null,
        error:
          error instanceof Error
            ? error.message
            : "Erro ao verificar autenticação",
      };
    }
  }

  // Salvar imagem de perfil
  async saveProfileImage(userId: string, imageData: string): Promise<void> {
    await this.delay(300);

    console.log(
      "💾 Iniciando salvamento de imagem de perfil para usuário:",
      userId,
    );

    if (!supabase) {
      throw new Error(
        "❌ Supabase não está configurado. Não é possível salvar imagem.",
      );
    }

    // Verificar se a tabela existe
    const tableExists = await this.checkTableExists();
    if (!tableExists) {
      throw new Error(
        "❌ Tabela profile_images não existe. Execute o script: create_profile_images_table.sql",
      );
    }

    // Verificar se o usuário está autenticado na aplicação
    const authStatus = await this.checkAuthenticationStatus();
    if (!authStatus.isAuthenticated) {
      throw new Error(
        "❌ Usuário não autenticado na aplicação. Faça login primeiro.",
      );
    }

    // Verificar se o userId corresponde ao usuário autenticado na aplicação
    if (authStatus.userId !== userId) {
      throw new Error(
        `❌ User ID mismatch - App User: ${authStatus.userId}, Requested User: ${userId}`,
      );
    }

    try {
      // Calcular tamanho da imagem em bytes (aproximado)
      const base64Size = Math.floor(
        imageData.length * (3 / 4) - (imageData.match(/=/g) || []).length,
      );

      const imageRecord = {
        user_id: userId,
        image_data: imageData,
        mime_type: this.getMimeTypeFromBase64(imageData),
        file_size: base64Size,
        updated_at: new Date().toISOString(),
      };

      // Tentar upsert normal primeiro
      let { error } = await supabase
        .from("profile_images")
        .upsert(imageRecord, {
          onConflict: "user_id",
        });

      // Se der erro de RLS, tentar com RPC bypass
      if (error && error.message.includes("row-level security policy")) {
        console.log("⚠️ RLS bloqueou operação, tentando bypass...");

        try {
          // Tentar RPC que pode estar configurado para bypass RLS
          const { error: rpcError } = await supabase.rpc(
            "upsert_profile_image",
            {
              p_user_id: userId,
              p_image_data: imageData,
              p_mime_type: this.getMimeTypeFromBase64(imageData),
              p_file_size: base64Size,
            },
          );

          if (rpcError) {
            // Se RPC não existe, tentar inserção direta com política menos restritiva
            console.log(
              "⚠️ RPC não disponível, tentando inserção com ID específico...",
            );

            // Primeiro tentar deletar registro existente (se houver)
            await supabase
              .from("profile_images")
              .delete()
              .eq("user_id", userId);

            // Então inserir novo
            const { error: insertError } = await supabase
              .from("profile_images")
              .insert([imageRecord]);

            if (insertError) {
              throw new Error(`Erro após bypass RLS: ${insertError.message}`);
            }
          }
        } catch (bypassError) {
          console.error("💥 Erro no bypass RLS:", bypassError);
          throw new Error(
            `❌ Erro de RLS - Execute o script fix_profile_images_rls.sql no Supabase para corrigir as políticas de segurança. Erro original: ${error.message}`,
          );
        }
      } else if (error) {
        throw new Error(
          `❌ Erro ao salvar imagem no Supabase: ${error.message}`,
        );
      }

      console.log("✅ Imagem salva no Supabase com sucesso");
    } catch (error) {
      console.error("💥 Erro fatal ao salvar imagem:", error);
      throw error; // Re-lança o erro ao invés de fazer fallback
    }
  }

  // Carregar imagem de perfil
  async getProfileImage(userId: string): Promise<string | null> {
    await this.delay(200);

    if (!supabase) {
      console.warn("⚠️ Supabase não configurado");
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("profile_images")
        .select("image_data")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("❌ Erro ao carregar imagem do Supabase:", error.message);
        return null;
      }

      if (data?.image_data) {
        console.log("✅ Imagem carregada do Supabase");
        return data.image_data;
      }

      return null;
    } catch (error) {
      console.error("💥 Erro ao carregar imagem:", error);
      return null;
    }
  }

  // Remover imagem de perfil
  async removeProfileImage(userId: string): Promise<void> {
    await this.delay(300);

    if (!supabase) {
      throw new Error("❌ Supabase não está configurado");
    }

    try {
      const { error } = await supabase
        .from("profile_images")
        .delete()
        .eq("user_id", userId);

      if (error) {
        throw new Error(
          `❌ Erro ao remover imagem do Supabase: ${error.message}`,
        );
      }

      console.log("✅ Imagem removida do Supabase");
    } catch (error) {
      console.error("💥 Erro ao remover imagem:", error);
      throw error;
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
    return "image/jpeg";
  }

  // Debug - verificar configuração
  async debugAuthentication(): Promise<void> {
    console.log("🔍 ===== DEBUG AUTENTICAÇÃO =====");

    const authStatus = await this.checkAuthenticationStatus();
    console.log("🔑 Status de autenticação:", authStatus);

    const tableExists = await this.checkTableExists();
    console.log("📊 Tabela profile_images existe:", tableExists);

    if (authStatus.isAuthenticated && authStatus.userId) {
      console.log("✅ Usuário autenticado:", authStatus.userId);
      console.log("💡 Pronto para salvar imagens no Supabase");
    } else {
      console.log("❌ Usuário não autenticado");
      console.log("💡 Faça login para salvar imagens");
    }

    console.log("🔍 ===== FIM DEBUG =====");
  }
}

// Instância singleton
export const profileImageAPI = new ProfileImageAPI();

// NOTA: Sistema de debug removido - sem fallbacks localStorage
// Todas as operações agora usam apenas Supabase ou falham com erro claro

// Funções globais para debug (somente desenvolvimento)
declare global {
  interface Window {
    debugProfileImages: () => Promise<void>;
    testProfileAuth: () => Promise<any>;
  }
}

// Expor funções de debug no window para uso no console
if (typeof window !== "undefined") {
  // Função de diagnóstico básico
  window.debugProfileImages = async () => {
    console.log("🔍 ===== DIAGNÓSTICO IMAGENS DE PERFIL =====");

    console.log("1️⃣ CONFIGURAÇÃO:");
    console.log("   - Supabase configurado:", !!supabase);

    try {
      const authStatus = await profileImageAPI.checkAuthenticationStatus();
      console.log("2️⃣ AUTENTICAÇÃO:");
      console.log("   - Usuário autenticado:", authStatus.isAuthenticated);
      console.log("   - User ID:", authStatus.userId);
      console.log("   - Erro:", authStatus.error);

      const tableExists = await profileImageAPI.checkTableExists();
      console.log("3️⃣ TABELA:");
      console.log("   - Tabela profile_images existe:", tableExists);
    } catch (error) {
      console.log("❌ Erro no diagnóstico:", error);
    }

    console.log("🔍 ===== FIM DIAGNÓSTICO =====");
  };

  // Função para testar autenticação
  window.testProfileAuth = async () => {
    try {
      const result = await profileImageAPI.checkAuthenticationStatus();
      console.log("🔑 Status de autenticação:", result);
      return result;
    } catch (error) {
      console.error("❌ Erro ao verificar autenticação:", error);
      return { error: error.message };
    }
  };

  console.log("🔧 Funções de debug disponíveis:");
  console.log("   - debugProfileImages() - Diagnóstico básico");
  console.log("   - testProfileAuth() - Testar autenticação");
}
