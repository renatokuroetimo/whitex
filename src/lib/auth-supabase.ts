import { User, LoginCredentials, RegisterData, ApiResponse } from "./types";
import { supabase } from "./supabase";
import { MobileSessionManager } from "./mobile-session";

class AuthSupabaseAPI {
  // Simula um delay de rede
  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // REGISTRO DE USUÁRIO
  async register(
    data: RegisterData & { password: string },
  ): Promise<ApiResponse<User>> {
    await this.delay(500);

    if (!supabase) {
      throw new Error("Sistema de autenticação não disponível");
    }

    console.log("🚀 Iniciando registro para:", data.email);

    // Verificar se email já existe
    const { data: existingUsers, error: checkError } = await supabase
      .from("users")
      .select("email")
      .eq("email", data.email.toLowerCase())
      .limit(1);

    if (checkError) {
      throw new Error("Erro ao verificar email");
    }

    if (existingUsers && existingUsers.length > 0) {
      throw new Error("Email já está em uso");
    }

    const newUser: User = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
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

    // Inserir na tabela users (incluindo senha)
    const { error } = await supabase.from("users").insert([
      {
        id: newUser.id,
        email: newUser.email,
        password: data.password, // Armazenar senha (em produção, use hash)
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

    if (error) {
      console.error("❌ Erro ao criar usuário:", error);
      throw error;
    }

    // Salvar sessão ativa
    MobileSessionManager.saveSession(newUser);

    console.log("✅ Usuário criado com sucesso!");
    return { success: true, data: newUser };
  }

  // LOGIN DE USUÁRIO
  async login(credentials: LoginCredentials): Promise<ApiResponse<User>> {
    await this.delay(500);

    if (!supabase) {
      throw new Error("Sistema de autenticação não disponível");
    }

    console.log("🔍 Fazendo login para:", credentials.email);

    // Verificar se usuário existe na tabela users
    const { data: existingUsers, error: dbError } = await supabase
      .from("users")
      .select("*")
      .eq("email", credentials.email.toLowerCase())
      .limit(1);

    if (dbError) {
      console.error("❌ Erro ao buscar usuário:", dbError);
      throw new Error("Erro interno do sistema");
    }

    if (!existingUsers || existingUsers.length === 0) {
      throw new Error("Email não encontrado");
    }

    const userData = existingUsers[0];
    console.log("🔍 Campos disponíveis no usuário:", Object.keys(userData));

    // Validação de senha
    if (!credentials.password || credentials.password.length < 1) {
      throw new Error("Senha é obrigatória");
    }

    // Verificar se existe coluna de senha na tabela
    if (userData.password) {
      // Se existe coluna password, validar contra ela
      if (userData.password !== credentials.password) {
        throw new Error("Email ou senha incorretos");
      }
      console.log("✅ Senha validada contra coluna password");
    } else {
      // Se não existe coluna password, usar validação temporária
      // Esta é uma validação básica temporária para usuários sem senha cadastrada
      console.warn(
        "⚠️ Usuário sem senha cadastrada - usando validação temporária",
      );

      // Para usuários existentes sem senha, aceitar apenas senhas específicas
      const allowedPasswords = ["123456", "admin", "test"];
      if (!allowedPasswords.includes(credentials.password)) {
        throw new Error("Email ou senha incorretos");
      }
      console.log("⚠️ Login temporário aceito - usuário deve cadastrar senha");
    }

    // Converter formato para o sistema
    const convertedUser: User = {
      id: userData.id,
      email: userData.email,
      profession: userData.profession,
      crm: userData.crm,
      fullName: userData.full_name || userData.name,
      city: userData.city,
      state: userData.state,
      specialty: userData.specialty,
      phone: userData.phone,
      createdAt: userData.created_at,
    };

    // Salvar sessão ativa
    MobileSessionManager.saveSession(convertedUser);

    console.log("✅ Login realizado com sucesso:", convertedUser.email);
    return { success: true, data: convertedUser };
  }

  // LOGOUT
  async logout(): Promise<ApiResponse> {
    await this.delay(200);

    try {
      // Logout do Supabase Auth
      if (supabase) {
        await supabase.auth.signOut();
      }

      // Limpar sessão local
      MobileSessionManager.clearSession();

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: "Erro ao fazer logout",
      };
    }
  }

  // RECUPERAÇÃO DE SENHA (Sistema próprio - não usa Supabase Auth)
  async requestPasswordReset(email: string): Promise<ApiResponse<{ resetToken: string }>> {
    await this.delay(500);

    if (!supabase) {
      throw new Error("Sistema de recuperação de senha não disponível");
    }

    // Verificar se o usuário existe na nossa tabela
    const { data: users, error: queryError } = await supabase
      .from("users")
      .select("id, email, profession")
      .eq("email", email.toLowerCase())
      .limit(1);

    if (queryError) throw queryError;

    if (!users || users.length === 0) {
      throw new Error("Email não encontrado");
    }

    console.log("🔧 Gerando token de reset para:", email);

    // Gerar token de reset
    const resetToken = Math.random().toString(36).substring(2, 15) +
                      Math.random().toString(36).substring(2, 15) +
                      Date.now().toString(36);

    // Salvar token temporário na tabela users
    const { error: updateError } = await supabase
      .from("users")
      .update({
        reset_token: resetToken,
        reset_token_expires: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hora
      })
      .eq("email", email.toLowerCase());

    if (updateError) {
      console.error("❌ Erro ao salvar token:", updateError);
      throw new Error("Erro interno do sistema");
    }

    console.log("✅ Token de reset gerado com sucesso");
    console.log("🔗 Link de reset:", `${window.location.origin}/reset-password?token=${resetToken}`);

    return {
      success: true,
      data: { resetToken }
    };
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<ApiResponse> {
    await this.delay(500);

    if (!supabase) {
      throw new Error("Sistema de redefinição de senha não disponível");
    }

    console.log("🔍 Validando token de reset:", token);

    // Buscar usuário pelo token
    const { data: users, error: queryError } = await supabase
      .from("users")
      .select("id, email, reset_token, reset_token_expires")
      .eq("reset_token", token)
      .limit(1);

    if (queryError) {
      throw new Error("Erro ao validar token");
    }

    if (!users || users.length === 0) {
      throw new Error("Token inválido ou expirado");
    }

    const user = users[0];

    // Verificar se token não expirou
    if (user.reset_token_expires && new Date(user.reset_token_expires) < new Date()) {
      throw new Error("Token expirado");
    }

    // Atualizar senha e limpar token
    const { error: updateError } = await supabase
      .from("users")
      .update({
        password: newPassword,
        reset_token: null,
        reset_token_expires: null
      })
      .eq("id", user.id);

    if (updateError) {
      throw new Error("Erro ao redefinir senha");
    }

    console.log("✅ Senha redefinida com sucesso para:", user.email);
    return { success: true };
  }

  async validateResetToken(
    token: string,
  ): Promise<ApiResponse<{ email: string }>> {
    if (!supabase) {
      throw new Error("Sistema não disponível");
    }

    console.log("🔍 Validando token de reset:", token);

    const { data: users, error } = await supabase
      .from("users")
      .select("email, reset_token_expires")
      .eq("reset_token", token)
      .limit(1);

    if (error) {
      throw new Error("Erro ao validar token");
    }

    if (!users || users.length === 0) {
      throw new Error("Token inválido");
    }

    const user = users[0];

    // Verificar se token não expirou
    if (user.reset_token_expires && new Date(user.reset_token_expires) < new Date()) {
      throw new Error("Token expirado");
    }

    return { success: true, data: { email: user.email } };
  }

  // MÉTODOS DE SESSÃO
  getCurrentUser(): User | null {
    return MobileSessionManager.getSession();
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  // DEFINIR SENHA PARA USUÁRIO EXISTENTE
  async setPasswordForExistingUser(
    email: string,
    newPassword: string,
  ): Promise<ApiResponse> {
    await this.delay(300);

    if (!supabase) {
      throw new Error("Sistema não disponível");
    }

    console.log("🔐 Definindo senha para usuário existente:", email);

    // Verificar se usuário existe
    const { data: existingUsers, error: checkError } = await supabase
      .from("users")
      .select("id, email, password")
      .eq("email", email.toLowerCase())
      .limit(1);

    if (checkError) {
      throw new Error("Erro ao verificar usuário");
    }

    if (!existingUsers || existingUsers.length === 0) {
      throw new Error("Usuário não encontrado");
    }

    // Atualizar senha
    const { error } = await supabase
      .from("users")
      .update({ password: newPassword })
      .eq("email", email.toLowerCase());

    if (error) {
      console.error("❌ Erro ao definir senha:", error);
      throw new Error("Erro ao definir senha");
    }

    console.log("✅ Senha definida com sucesso para:", email);
    return { success: true };
  }

  // DELETE ACCOUNT
  async deleteAccount(): Promise<ApiResponse> {
    await this.delay(500);

    if (!supabase) {
      throw new Error("Sistema não disponível");
    }

    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      throw new Error("Usuário não encontrado");
    }

    // Deletar da tabela users
    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", currentUser.id);

    if (error) throw error;

    // Logout
    await this.logout();

    return { success: true };
  }

  // DEBUG FUNCTION - List all users in database
  async debugListUsers(): Promise<void> {
    if (!supabase) {
      console.log("❌ Supabase não disponível");
      return;
    }

    console.log("🔍 Listando usuários na tabela users...");

    const { data: users, error } = await supabase
      .from("users")
      .select("id, email, profession, full_name, created_at")
      .limit(10);

    if (error) {
      console.error("❌ Erro ao listar usuários:", error);
      return;
    }

    console.log("📋 Usuários encontrados:", users?.length || 0);
    if (users && users.length > 0) {
      console.table(users);
    } else {
      console.log("ℹ️ Nenhum usuário encontrado na tabela");
    }
  }
}

export const authSupabaseAPI = new AuthSupabaseAPI();

// Expose debug functions to global console in development
if (typeof window !== "undefined" && import.meta.env.DEV) {
  (window as any).debugAuth = {
    listUsers: () => authSupabaseAPI.debugListUsers(),
    testConnection: async () => {
      console.log("🔧 Testando conexão com Supabase...");
      try {
        const { data, error } = await supabase
          .from("users")
          .select("count")
          .limit(1);
        console.log("✅ Conexão OK:", { data, error });
      } catch (e) {
        console.error("❌ Erro de conexão:", e);
      }
    },
    setPassword: async (email: string, password: string) => {
      console.log("🔐 Definindo senha para:", email);
      try {
        const result = await authSupabaseAPI.setPasswordForExistingUser(
          email,
          password,
        );
        console.log("✅ Senha definida com sucesso");
        return result;
      } catch (e) {
        console.error("❌ Erro ao definir senha:", e);
        throw e;
      }
    },
  };
  console.log("🛠️ Debug functions available:");
  console.log("  - window.debugAuth.listUsers()");
  console.log("  - window.debugAuth.testConnection()");
  console.log("  - window.debugAuth.setPassword('email', 'senha')");
}
