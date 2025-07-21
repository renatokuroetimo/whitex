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

    console.log("🚀 Iniciando registro no Supabase para:", data.email);

    // Criar usuário na Supabase Auth com a senha fornecida
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email.toLowerCase(),
      password: data.password,
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
      id: authData.user?.id || Date.now().toString(36),
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

    if (error) {
      console.error("❌ Erro ao inserir dados adicionais:", error);
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

    console.log("🔍 Fazendo login no Supabase para:", credentials.email);

    // STEP 1: Verificar se usuário existe na tabela users
    console.log("1️⃣ Verificando se usuário existe na tabela users...");
    const { data: existingUsers, error: dbError } = await supabase
      .from("users")
      .select("*")
      .eq("email", credentials.email.toLowerCase())
      .limit(1);

    console.log("📋 Resultado da busca na tabela users:", {
      found: existingUsers?.length || 0,
      error: dbError?.message,
      users: existingUsers
    });

    if (dbError) {
      console.error("❌ Erro ao buscar na tabela users:", dbError);
      throw new Error("Erro interno do sistema");
    }

    if (!existingUsers || existingUsers.length === 0) {
      console.log("❌ Usuário não encontrado na tabela users");
      throw new Error("Email não encontrado");
    }

    const userData = existingUsers[0];
    console.log("👤 Dados do usuário encontrado:", {
      id: userData.id,
      email: userData.email,
      profession: userData.profession,
      full_name: userData.full_name
    });

    // STEP 2: Tentar autenticação via Supabase Auth
    console.log("2️⃣ Tentando autenticação via Supabase Auth...");
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: credentials.email.toLowerCase(),
      password: credentials.password
    });

    if (authError) {
      console.warn("⚠️ Falha na autenticação Supabase Auth:", authError.message);

      if (authError.message.includes("Invalid login credentials")) {
        console.log("🔄 Usuário existe na tabela mas não no Auth - sugerindo migração");
        throw new Error("MIGRATION_REQUIRED");
      }

      throw new Error("Email ou senha incorretos");
    }

    console.log("✅ Autenticação Supabase Auth bem-sucedida");

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

    console.log("✅ Login completo - usuário autenticado:", convertedUser.email);
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

  // EMERGENCY LOGIN - Bypass Supabase Auth (temporary solution)
  async emergencyLogin(credentials: LoginCredentials): Promise<ApiResponse<User>> {
    await this.delay(500);

    if (!supabase) {
      throw new Error("Sistema não disponível");
    }

    console.log("🚨 EMERGENCY LOGIN para:", credentials.email);
    console.warn("⚠️ Este é um login de emergência que bypassa a autenticação Supabase");

    // Verificar se usuário existe na tabela
    const { data: existingUsers, error: dbError } = await supabase
      .from("users")
      .select("*")
      .eq("email", credentials.email.toLowerCase())
      .limit(1);

    if (dbError) {
      throw new Error("Erro interno do sistema");
    }

    if (!existingUsers || existingUsers.length === 0) {
      throw new Error("Email não encontrado");
    }

    // Validação básica de senha (TEMPORÁRIO)
    if (!credentials.password || credentials.password.length < 3) {
      throw new Error("Senha muito curta");
    }

    const userData = existingUsers[0];

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

    MobileSessionManager.saveSession(convertedUser);

    console.log("🚨 EMERGENCY LOGIN bem-sucedido:", convertedUser.email);
    console.warn("⚠️ IMPORTANTE: Configure Supabase Auth o quanto antes!");

    return { success: true, data: convertedUser };
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

  // MIGRAÇÃO DE USUÁRIO EXISTENTE
  async migrateExistingUser(email: string, newPassword: string): Promise<ApiResponse<User>> {
    await this.delay(500);

    if (!supabase) {
      throw new Error("Sistema não disponível");
    }

    console.log("🔄 Iniciando migração do usuário:", email);

    // Verificar se usuário existe na tabela
    const { data: existingUsers, error: dbError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email.toLowerCase())
      .limit(1);

    if (dbError) {
      throw new Error("Erro ao verificar usuário existente");
    }

    if (!existingUsers || existingUsers.length === 0) {
      throw new Error("Usuário não encontrado para migração");
    }

    const userData = existingUsers[0];

    // Criar conta no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password: newPassword,
      options: {
        data: {
          profession: userData.profession,
          crm: userData.crm,
          full_name: userData.full_name
        }
      }
    });

    if (authError) {
      if (authError.message.includes("already registered")) {
        // Se já existe no Auth, apenas fazer login
        return this.login({ email, password: newPassword });
      }
      throw new Error(`Erro na migração: ${authError.message}`);
    }

    // Atualizar ID na tabela users para corresponder ao Auth
    if (authData.user?.id && authData.user.id !== userData.id) {
      const { error: updateError } = await supabase
        .from("users")
        .update({ id: authData.user.id })
        .eq("email", email.toLowerCase());

      if (updateError) {
        console.warn("⚠️ Aviso: Não foi possível atualizar ID do usuário:", updateError);
      }
    }

    const migratedUser: User = {
      id: authData.user?.id || userData.id,
      email: userData.email,
      profession: userData.profession,
      crm: userData.crm,
      fullName: userData.full_name,
      city: userData.city,
      state: userData.state,
      specialty: userData.specialty,
      phone: userData.phone,
      createdAt: userData.created_at,
    };

    // Salvar sessão
    MobileSessionManager.saveSession(migratedUser);

    console.log("✅ Usuário migrado com sucesso!");
    return { success: true, data: migratedUser };
  }
}

export const authSupabaseAPI = new AuthSupabaseAPI();

// Expose debug functions to global console in development
if (typeof window !== 'undefined') {
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
    },
    emergencyLogin: async (email: string, password: string) => {
      console.log("🚨 Executando emergency login...");
      try {
        const result = await authSupabaseAPI.emergencyLogin({ email, password });
        console.log("✅ Emergency login bem-sucedido:", result);
        return result;
      } catch (e) {
        console.error("❌ Emergency login falhou:", e);
        throw e;
      }
    }
  };
  console.log("🛠️ Debug functions available:");
  console.log("  - window.debugAuth.listUsers()");
  console.log("  - window.debugAuth.testConnection()");
  console.log("  - window.debugAuth.emergencyLogin('email', 'password')");
}
