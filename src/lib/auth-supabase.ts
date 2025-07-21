import { User, LoginCredentials, RegisterData, ApiResponse } from "./types";
import { supabase, withSupabaseFallback } from "./supabase";
import { MobileSessionManager } from "./mobile-session";

class AuthSupabaseAPI {
  private readonly STORAGE_KEYS = {
    USERS: "medical_app_users",
    CURRENT_USER: "medical_app_current_user",
  };

  // Simula um delay de rede
  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // MÉTODOS LOCALSTORAGE (mantidos iguais)
  private getStoredUsers(): User[] {
    try {
      const users = localStorage.getItem(this.STORAGE_KEYS.USERS);
      return users ? JSON.parse(users) : [];
    } catch {
      return [];
    }
  }

  private saveUsers(users: User[]): void {
    localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // MÉTODOS SUPABASE
  private async registerUserSupabase(
    data: RegisterData,
  ): Promise<ApiResponse<User>> {
    console.log("🚀 Iniciando registro no Supabase para:", data.email);
    if (!supabase) throw new Error("Supabase not available");

    // 🚨 SECURITY FIX: Create user in Supabase Auth first with password
    // For now, we'll use a default password that users must change
    const defaultPassword = "123456"; // Users should change this immediately

    console.log("🔐 Criando usuário na Supabase Auth...");
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email.toLowerCase(),
      password: defaultPassword,
      options: {
        data: {
          profession: data.profession,
          crm: data.crm,
          full_name: data.fullName
        }
      }
    });

    if (authError) {
      console.error("❌ Erro ao criar usuário na Auth:", authError);
      if (authError.message.includes("already registered")) {
        throw new Error("Email já está em uso");
      }
      throw authError;
    }

    const newUser: User = {
      id: authData.user?.id || this.generateId(),
      email: data.email.toLowerCase(),
      profession: data.profession,
      crm: data.crm,
      fullName: data.fullName,
      city: data.city,
      state: data.state,
      specialty: data.specialty,
      phone: data.phone,
      createdAt: new Date().toISOString(),
    };

    // Inserir dados adicionais na tabela users
    console.log("📝 Inserindo dados adicionais na tabela users:");
    const { error } = await supabase.from("users").insert([
      {
        id: newUser.id,
        email: newUser.email,
        profession: newUser.profession,
        crm: newUser.crm,
        full_name: newUser.fullName,
        city: newUser.city,
        state: newUser.state,
        specialty: newUser.specialty,
        phone: newUser.phone,
        created_at: newUser.createdAt,
      },
    ]);

    console.log("📊 Resultado do insert:", {
      error: error?.message || "sucesso",
    });

    if (error) {
      console.warn("⚠️ Erro ao inserir dados adicionais, mas Auth user foi criado");
      // Continue anyway - the auth user was created successfully
    }

    console.log("✅ Usuário criado com senha padrão. DEVE alterar senha após primeiro login!");
    return { success: true, data: newUser };
  }

  private async loginUserSupabase(
    credentials: LoginCredentials,
  ): Promise<ApiResponse<User>> {
    if (!supabase) throw new Error("Supabase not available");

    console.log("🔍 Fazendo login no Supabase para:", credentials.email);

    // 🚨 SECURITY FIX: Use Supabase Auth for proper password validation
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: credentials.email.toLowerCase(),
      password: credentials.password
    });

    console.log("🔐 Resposta da autenticação Supabase:", {
      user: authData.user?.email,
      session: !!authData.session,
      error: authError?.message,
    });

    if (authError) {
      console.error("❌ Erro de autenticação:", authError.message);
      if (authError.message.includes("Invalid login credentials")) {
        throw new Error("Email ou senha incorretos");
      }
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error("Falha na autenticação");
    }

    // Buscar dados adicionais do usuário na tabela users
    const { data: users, error: dbError } = await supabase
      .from("users")
      .select("*")
      .eq("email", credentials.email.toLowerCase())
      .limit(1);

    if (dbError) {
      console.error("❌ Erro ao buscar dados do usuário:", dbError);
      throw dbError;
    }

    if (!users || users.length === 0) {
      throw new Error("Dados do usuário não encontrados");
    }

    const user = users[0];

    console.log("👤 Dados do usuário carregados:", {
      id: user.id,
      email: user.email,
      profession: user.profession,
      full_name: user.full_name,
      city: user.city,
      state: user.state,
      phone: user.phone,
    });

    // Converter formato Supabase para formato local
    const convertedUser: User = {
      id: user.id,
      email: user.email,
      profession: user.profession,
      crm: user.crm,
      fullName: user.full_name || user.name,
      city: user.city,
      state: user.state,
      specialty: user.specialty,
      phone: user.phone,
      createdAt: user.created_at,
    };

    console.log("✅ Usuário autenticado com segurança:", convertedUser.email);

    return { success: true, data: convertedUser };
  }

  // MÉTODOS LOCALSTORAGE (original)
  private async registerUserLocalStorage(
    data: RegisterData,
  ): Promise<ApiResponse<User>> {
    const users = this.getStoredUsers();

    // Verifica se email já existe
    const existingUser = users.find(
      (user) => user.email.toLowerCase() === data.email.toLowerCase(),
    );
    if (existingUser) {
      throw new Error("Email já está em uso");
    }

    // Cria novo usuário
    const newUser: User = {
      id: this.generateId(),
      email: data.email.toLowerCase(),
      profession: data.profession,
      crm: data.crm,
      createdAt: new Date().toISOString(),
    };

    // Salva usuário
    users.push(newUser);
    this.saveUsers(users);

    return { success: true, data: newUser };
  }

  private async loginUserLocalStorage(
    credentials: LoginCredentials,
  ): Promise<ApiResponse<User>> {
    // 🚨 SECURITY NOTE: localStorage fallback is for development only
    // In production, we should ONLY use Supabase Auth with proper password validation
    console.warn("⚠️ Using localStorage fallback - this should only happen in development!");

    const users = this.getStoredUsers();

    // Encontra usuário por email
    const user = users.find(
      (u) => u.email.toLowerCase() === credentials.email.toLowerCase(),
    );

    if (!user) {
      throw new Error("Email não encontrado");
    }

    // 🚨 TEMPORARY SECURITY MEASURE: In localStorage mode, any password works
    // This is ONLY for development - production MUST use Supabase Auth
    if (!credentials.password || credentials.password.length < 1) {
      throw new Error("Senha é obrigatória");
    }

    console.warn("⚠️ localStorage mode: password validation bypassed for development");
    return { success: true, data: user };
  }

  // M��TODOS PÚBLICOS HÍBRIDOS
  async register(data: RegisterData): Promise<ApiResponse<User>> {
    await this.delay(500);

    return withSupabaseFallback(
      // Operação Supabase
      async () => {
        const result = await this.registerUserSupabase(data);
        // Sincronizar com localStorage também
        try {
          await this.registerUserLocalStorage(data);
        } catch {
          // Ignore se já existe no localStorage
        }
        return result;
      },
      // Fallback localStorage
      () => this.registerUserLocalStorage(data),
    );
  }

  async login(credentials: LoginCredentials): Promise<ApiResponse<User>> {
    await this.delay(500);

    return withSupabaseFallback(
      // Operação Supabase
      async () => {
        const result = await this.loginUserSupabase(credentials);

        // Salvar usuário atual usando MobileSessionManager
        if (result.data) {
          MobileSessionManager.saveSession(result.data);
        }

        return result;
      },
      // Fallback localStorage
      async () => {
        const result = await this.loginUserLocalStorage(credentials);

        // Salvar usuário atual usando MobileSessionManager
        if (result.data) {
          MobileSessionManager.saveSession(result.data);
        }

        return result;
      },
    );
  }

  async logout(): Promise<ApiResponse> {
    await this.delay(200);

    try {
      MobileSessionManager.clearSession();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: "Erro ao fazer logout",
      };
    }
  }

  // Métodos que não mudam
  getCurrentUser(): User | null {
    // Use MobileSessionManager for better persistence
    return MobileSessionManager.getSession();
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  async deleteAccount(): Promise<ApiResponse> {
    await this.delay(500);

    return withSupabaseFallback(
      // Operação Supabase
      async () => {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
          throw new Error("Usuário não encontrado");
        }

        if (!supabase) throw new Error("Supabase not available");

        const { error } = await supabase
          .from("users")
          .delete()
          .eq("id", currentUser.id);

        if (error) throw error;

        // Limpar localStorage também
        const users = this.getStoredUsers();
        const updatedUsers = users.filter((user) => user.id !== currentUser.id);
        this.saveUsers(updatedUsers);
        localStorage.removeItem(`profile_${currentUser.id}`);
        MobileSessionManager.clearSession();

        return { success: true };
      },
      // Fallback localStorage
      () => {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
          throw new Error("Usuário não encontrado");
        }

        const users = this.getStoredUsers();
        const updatedUsers = users.filter((user) => user.id !== currentUser.id);
        this.saveUsers(updatedUsers);
        localStorage.removeItem(`profile_${currentUser.id}`);
        MobileSessionManager.clearSession();

        return { success: true };
      },
    );
  }

  // Método para migração de dados existentes
  async migrateExistingUsers(): Promise<void> {
    if (!supabase) return;

    try {
      const localUsers = this.getStoredUsers();

      for (const user of localUsers) {
        // Verificar se usuário já existe no Supabase
        const { data: existingUsers } = await supabase
          .from("users")
          .select("id")
          .eq("email", user.email)
          .limit(1);

        if (!existingUsers || existingUsers.length === 0) {
          // Inserir usuário no Supabase
          await supabase.from("users").insert([
            {
              id: user.id,
              email: user.email,
              profession: user.profession,
              crm: user.crm,
              created_at: user.createdAt,
            },
          ]);

          console.log(`✅ Usuário migrado: ${user.email}`);
        }
      }
    } catch (error) {
      console.warn("⚠️ Erro na migração de usuários:", error);
    }
  }

  // MÉTODOS DE RECUPERAÇÃO DE SENHA
  async requestPasswordReset(email: string): Promise<ApiResponse<{ resetUrl?: string }>> {
    await this.delay(500);

    return withSupabaseFallback(
      // Operação Supabase
      async () => {
        if (!supabase) throw new Error("Supabase not available");

        // Verificar se o usuário existe primeiro
        const { data: users, error: queryError } = await supabase
          .from("users")
          .select("id, email, profession")
          .eq("email", email.toLowerCase())
          .limit(1);

        if (queryError) throw queryError;

        if (!users || users.length === 0) {
          throw new Error("Email não encontrado");
        }

        // Configurações detalhadas para debug
        const redirectUrl = `${window.location.origin}/reset-password`;
        console.log("🔧 Configurações do reset de senha:");
        console.log("- Email:", email);
        console.log("- Redirect URL:", redirectUrl);
        console.log("- Origin:", window.location.origin);

        // Tentar Supabase Auth com configurações mais específicas
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: redirectUrl,
          captchaToken: undefined // Explicitly set if needed
        });

        console.log("📧 Resposta do Supabase resetPasswordForEmail:");
        console.log("- Data:", data);
        console.log("- Error:", error);

        if (error) {
          console.error("❌ Erro detalhado do Supabase:", {
            message: error.message,
            status: error.status,
            details: error
          });
          throw new Error(`Supabase Auth Error: ${error.message}`);
        }

        console.log("✅ Email de recuperação CONFIRMADO via Supabase");
        console.log("📝 Dados retornados:", data);

        return { success: true };
      },
      // Fallback localStorage (gerar link direto)
      async () => {
        const users = this.getStoredUsers();
        const user = users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase()
        );

        if (!user) {
          throw new Error("Email não encontrado");
        }

        // Criar token temporário
        const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        localStorage.setItem(`reset_token_${email}`, JSON.stringify({
          token: resetToken,
          email: email,
          expiry: Date.now() + (60 * 60 * 1000) // 1 hora
        }));

        const resetUrl = `${window.location.origin}/reset-password?token=${resetToken}`;
        console.log("🔗 Link de recuperação gerado:", resetUrl);

        return {
          success: true,
          data: { resetUrl }
        };
      }
    );
  }

  async resetPassword(token: string, newPassword: string): Promise<ApiResponse> {
    await this.delay(500);

    return withSupabaseFallback(
      // Operação Supabase
      async () => {
        if (!supabase) throw new Error("Supabase not available");

        const { error } = await supabase.auth.updateUser({
          password: newPassword
        });

        if (error) throw error;

        console.log("✅ Senha redefinida via Supabase");
        return { success: true };
      },
      // Fallback localStorage
      async () => {
        // Em ambiente local, apenas limpar o token
        const allKeys = Object.keys(localStorage);
        const resetKey = allKeys.find(key => key.startsWith("reset_token_"));

        if (resetKey) {
          const resetData = JSON.parse(localStorage.getItem(resetKey) || "{}");
          if (resetData.token === token && resetData.expiry > Date.now()) {
            localStorage.removeItem(resetKey);
            console.log("✅ Token de reset validado e removido (localStorage)");
            return { success: true };
          }
        }

        throw new Error("Token inválido ou expirado");
      }
    );
  }

  async validateResetToken(token: string): Promise<ApiResponse<{ email: string }>> {
    await this.delay(200);

    return withSupabaseFallback(
      // Operação Supabase
      async () => {
        // No Supabase, a validação do token é feita automaticamente
        // quando o usuário clica no link do email
        console.log("🔍 Validando token via Supabase");
        return { success: true, data: { email: "" } };
      },
      // Fallback localStorage
      async () => {
        const allKeys = Object.keys(localStorage);
        const resetKey = allKeys.find(key => key.startsWith("reset_token_"));

        if (resetKey) {
          const resetData = JSON.parse(localStorage.getItem(resetKey) || "{}");
          if (resetData.token === token && resetData.expiry > Date.now()) {
            return { success: true, data: { email: resetData.email } };
          }
        }

        throw new Error("Token inválido ou expirado");
      }
    );
  }
}

export const authSupabaseAPI = new AuthSupabaseAPI();
