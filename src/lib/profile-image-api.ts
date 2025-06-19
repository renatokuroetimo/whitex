import { supabase } from "./supabase";
import { isFeatureEnabled } from "./feature-flags";

class ProfileImageAPI {
  private readonly STORAGE_KEY_PREFIX = "profile_image_";

  // Simula delay de rede
  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Verificar se a tabela profile_images existe
  async checkTableExists(): Promise<boolean> {
    if (!supabase) return false;

    try {
      const { error } = await supabase
        .from("profile_images")
        .select("id")
        .limit(1);

      return !error || error.code !== "PGRST204";
    } catch {
      return false;
    }
  }

  // Verificar status de autenticação do Supabase
  async checkAuthenticationStatus(): Promise<{
    isAuthenticated: boolean;
    userId: string | null;
    error: string | null;
  }> {
    if (!supabase) {
      return {
        isAuthenticated: false,
        userId: null,
        error: "Supabase not configured",
      };
    }

    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        return { isAuthenticated: false, userId: null, error: error.message };
      }

      return {
        isAuthenticated: !!user,
        userId: user?.id || null,
        error: null,
      };
    } catch (error) {
      return {
        isAuthenticated: false,
        userId: null,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Salvar imagem de perfil
  async saveProfileImage(userId: string, imageData: string): Promise<void> {
    await this.delay(300);

    if (isFeatureEnabled("useSupabaseIndicators") && supabase) {
      console.log("🚀 Salvando imagem de perfil no Supabase");

      // Verificar se a tabela existe na primeira vez
      const tableExists = await this.checkTableExists();
      if (!tableExists) {
        console.warn(
          "⚠️ Tabela profile_images não encontrada. Executando fallback para localStorage.",
        );
        console.info(
          "📋 Para habilitar o Supabase, execute o script: create_profile_images_table.sql",
        );
        localStorage.setItem(`${this.STORAGE_KEY_PREFIX}${userId}`, imageData);
        return;
      }

      // Verificar se o usuário está autenticado no Supabase
      const {
        data: { user: supabaseUser },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !supabaseUser) {
        console.warn(
          "⚠️ Usuário não autenticado no Supabase. Usando localStorage como fallback.",
        );
        console.info("🔑 Para usar o Supabase, faça login primeiro.");
        localStorage.setItem(`${this.STORAGE_KEY_PREFIX}${userId}`, imageData);
        return;
      }

      // Verificar se o userId corresponde ao usuário autenticado
      if (supabaseUser.id !== userId) {
        console.warn(
          "⚠️ User ID mismatch - Supabase User:",
          supabaseUser.id,
          "Requested User:",
          userId,
        );
        console.info("📝 Salvando no localStorage devido ao mismatch de IDs");
        localStorage.setItem(`${this.STORAGE_KEY_PREFIX}${userId}`, imageData);
        return;
      }

      try {
        // Calcular tamanho da imagem em bytes (aproximado)
        // Math.floor garante que o resultado seja um INTEGER (não decimal)
        const base64Size = Math.floor(
          imageData.length * (3 / 4) - (imageData.match(/=/g) || []).length,
        );

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
          if (error.code === "PGRST204") {
            console.warn(
              "⚠️ Tabela profile_images não existe no Supabase. Execute o script create_profile_images_table.sql",
            );
            console.log(
              "📁 Salvando imagem apenas no localStorage como fallback",
            );
            localStorage.setItem(
              `${this.STORAGE_KEY_PREFIX}${userId}`,
              imageData,
            );
            return;
          } else if (error.code === "42501") {
            console.warn(
              "⚠️ Violação de política RLS - usuário não autorizado a salvar esta imagem",
            );
            console.info(
              "🔑 Isso pode indicar que o usuário não está autenticado ou há mismatch de IDs",
            );
            console.log("📁 Salvando imagem no localStorage como fallback");
            localStorage.setItem(
              `${this.STORAGE_KEY_PREFIX}${userId}`,
              imageData,
            );
            return;
          } else {
            console.error(
              "❌ Erro ao salvar imagem no Supabase:",
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
            throw error;
          }
        }

        console.log("✅ Imagem de perfil salva no Supabase");

        // Também salvar no localStorage como cache local
        localStorage.setItem(`${this.STORAGE_KEY_PREFIX}${userId}`, imageData);
      } catch (supabaseError) {
        console.error(
          "💥 Erro no Supabase saveProfileImage:",
          JSON.stringify(
            {
              message:
                supabaseError instanceof Error
                  ? supabaseError.message
                  : "Unknown error",
              stack:
                supabaseError instanceof Error
                  ? supabaseError.stack
                  : undefined,
              error: supabaseError,
            },
            null,
            2,
          ),
        );
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
          // PGRST204 = tabela não existe
          // 42501 = violação de política RLS
          if (error.code === "PGRST204") {
            console.warn(
              "⚠️ Tabela profile_images não existe no Supabase. Execute o script create_profile_images_table.sql",
            );
          } else if (error.code === "42501") {
            console.warn(
              "⚠️ Violação de política RLS ao carregar imagem - usuário não autorizado",
            );
            console.info("🔑 Usando localStorage como fallback");
          } else {
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
          }
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
        console.error(
          "💥 Erro no Supabase getProfileImage:",
          JSON.stringify(
            {
              message:
                supabaseError instanceof Error
                  ? supabaseError.message
                  : "Unknown error",
              stack:
                supabaseError instanceof Error
                  ? supabaseError.stack
                  : undefined,
              error: supabaseError,
            },
            null,
            2,
          ),
        );
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
          console.error(
            "❌ Erro ao remover imagem do Supabase:",
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
        } else {
          console.log("✅ Imagem removida do Supabase");
        }

        // Remover do localStorage também
        localStorage.removeItem(`${this.STORAGE_KEY_PREFIX}${userId}`);
      } catch (supabaseError) {
        console.error(
          "💥 Erro no Supabase removeProfileImage:",
          JSON.stringify(
            {
              message:
                supabaseError instanceof Error
                  ? supabaseError.message
                  : "Unknown error",
              stack:
                supabaseError instanceof Error
                  ? supabaseError.stack
                  : undefined,
              error: supabaseError,
            },
            null,
            2,
          ),
        );
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
  }

  // Inicializar tabela se necessário (método manual para desenvolvimento)
  async initializeTable(): Promise<boolean> {
    if (!supabase) {
      console.warn("⚠️ Supabase não está configurado");
      return false;
    }

    const tableExists = await this.checkTableExists();
    if (tableExists) {
      console.log("✅ Tabela profile_images já existe");
      return true;
    }

    console.warn("❌ Tabela profile_images não existe.");
    console.info(
      "📋 Para criar a tabela, execute o SQL do arquivo: create_profile_images_table.sql",
    );
    console.info(
      "💡 Ou acesse o Supabase Dashboard > SQL Editor e execute o script",
    );
    return false;
  }

  // Debug method para testar autenticação (manual para desenvolvimento)
  async debugAuthentication(): Promise<void> {
    console.log("🔍 ===== DEBUG AUTENTICAÇÃO SUPABASE =====");

    const authStatus = await this.checkAuthenticationStatus();
    console.log("🔑 Status de autenticação:", authStatus);

    const tableExists = await this.checkTableExists();
    console.log("📊 Tabela profile_images existe:", tableExists);

    if (authStatus.isAuthenticated && authStatus.userId) {
      console.log("✅ Usuário autenticado:", authStatus.userId);
      console.log("💡 Pronto para salvar imagens no Supabase");
    } else {
      console.log("❌ Usuário não autenticado");
      console.log("💡 Imagens serão salvas no localStorage");
    }

    console.log("🔍 ===== FIM DEBUG =====");
  }

  // Diagnóstico completo do sistema de imagens
  async debugImageSystem(userId?: string): Promise<void> {
    console.log("🔍 ===== DIAGNÓSTICO COMPLETO DO SISTEMA DE IMAGENS =====");

    // 1. Verificar configuração básica
    console.log("1️⃣ CONFIGURAÇÃO BÁSICA:");
    console.log("   - Supabase configurado:", !!supabase);
    console.log(
      "   - Feature flag ativo:",
      isFeatureEnabled("useSupabaseIndicators"),
    );

    // 2. Verificar autenticação
    console.log("\n2️⃣ AUTENTICAÇÃO:");
    const authStatus = await this.checkAuthenticationStatus();
    console.log("   - Status:", authStatus);

    // 3. Verificar tabela
    console.log("\n3️⃣ TABELA SUPABASE:");
    const tableExists = await this.checkTableExists();
    console.log("   - Tabela profile_images existe:", tableExists);

    if (tableExists && authStatus.isAuthenticated) {
      try {
        const { data, error } = await supabase!
          .from("profile_images")
          .select("id, user_id, created_at")
          .limit(5);

        console.log("   - Registros na tabela:", data?.length || 0);
        console.log("   - Primeiros registros:", data);
        console.log("   - Erros:", error);
      } catch (error) {
        console.log("   - Erro ao consultar tabela:", error);
      }
    }

    // 4. Verificar localStorage
    console.log("\n4️⃣ LOCALSTORAGE:");
    const localStorageKeys = Object.keys(localStorage).filter((key) =>
      key.startsWith(this.STORAGE_KEY_PREFIX),
    );
    console.log("   - Imagens no localStorage:", localStorageKeys.length);
    console.log("   - Chaves encontradas:", localStorageKeys);

    // 5. Teste com usuário específico
    if (userId) {
      console.log(`\n5️⃣ TESTE COM USUÁRIO ${userId}:`);

      // Verificar localStorage
      const localImage = localStorage.getItem(
        `${this.STORAGE_KEY_PREFIX}${userId}`,
      );
      console.log("   - Imagem no localStorage:", localImage ? "SIM" : "NÃO");

      // Tentar carregar do Supabase
      if (tableExists && authStatus.isAuthenticated) {
        try {
          const { data, error } = await supabase!
            .from("profile_images")
            .select("image_data")
            .eq("user_id", userId)
            .single();

          console.log("   - Imagem no Supabase:", data ? "SIM" : "NÃO");
          console.log("   - Erro:", error);
        } catch (error) {
          console.log("   - Erro ao buscar no Supabase:", error);
        }
      }
    }

    // 6. Recomendações
    console.log("\n6️⃣ RECOMENDAÇÕES:");
    if (!tableExists) {
      console.log("   ❌ Execute o script: create_profile_images_table.sql");
    }
    if (!authStatus.isAuthenticated) {
      console.log("   ❌ Usuário precisa estar logado no Supabase");
    }
    if (
      localStorageKeys.length > 0 &&
      tableExists &&
      authStatus.isAuthenticated
    ) {
      console.log(
        "   💡 Execute: profileImageAPI.migrateLocalImagesToSupabase()",
      );
    }
    if (!isFeatureEnabled("useSupabaseIndicators")) {
      console.log(
        "   ❌ Feature flag 'useSupabaseIndicators' está desabilitada",
      );
    }

    console.log("\n🔍 ===== FIM DIAGNÓSTICO =====");
  }

  // Migrar imagens do localStorage para Supabase
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
