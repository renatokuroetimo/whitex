import { User, LoginCredentials, RegisterData, ApiResponse } from "./types";
import { supabase } from "./supabase";
import { MobileSessionManager } from "./mobile-session";

class AuthSupabaseAPI {
  // Simula um delay de rede
  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // REGISTRO DE USUÁRIO
  async register(data: RegisterData & { password: string }): Promise<ApiResponse<User>> {
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
      // Se não existe coluna password, usar valida��ão temporária
      // Esta é uma validação básica temporária para usuários sem senha cadastrada
      console.warn("⚠️ Usuário sem senha cadastrada - usando validação temporária");

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

  // RECUPERAÇÃO DE SENHA
  async requestPasswordReset(email: string): Promise<ApiResponse> {
    await this.delay(500);

    if (!supabase) {
      throw new Error("Sistema de recuperação de senha não disponível");
    }

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
    
    // Solicitar reset via Supabase Auth
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      console.error("❌ Erro detalhado do Supabase:", error);
      throw new Error(`Erro ao enviar email: ${error.message}`);
    }

    console.log("✅ Email de recuperação enviado via Supabase");
    return { success: true };
  }

  async resetPassword(token: string, newPassword: string): Promise<ApiResponse> {
    await this.delay(500);

    if (!supabase) {
      throw new Error("Sistema de redefinição de senha não disponível");
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;

    console.log("✅ Senha redefinida via Supabase");
    return { success: true };
  }

  async validateResetToken(token: string): Promise<ApiResponse<{ email: string }>> {
    // No Supabase, a validação do token é feita automaticamente
    console.log("🔍 Validando token via Supabase");
    return { success: true, data: { email: "" } };
  }

  // MÉTODOS DE SESSÃO
  getCurrentUser(): User | null {
    return MobileSessionManager.getSession();
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
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
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as any).debugAuth = {
    listUsers: () => authSupabaseAPI.debugListUsers(),
    testConnection: async () => {
      console.log("🔧 Testando conexão com Supabase...");
      try {
        const { data, error } = await supabase.from("users").select("count").limit(1);
        console.log("✅ Conexão OK:", { data, error });
      } catch (e) {
        console.error("❌ Erro de conexão:", e);
      }
    }
  };
  console.log("🛠️ Debug functions: window.debugAuth.listUsers(), window.debugAuth.testConnection()");
}
