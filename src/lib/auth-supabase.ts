import { User, LoginCredentials, RegisterData, ApiResponse } from "./types";
import { supabase, withSupabaseFallback } from "./supabase";

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

    const newUser: User = {
      id: this.generateId(),
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

    // Inserir no Supabase
    console.log("📝 Inserindo no Supabase:", {
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
    });

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
      // Se email já existe
      if (error.code === "23505") {
        throw new Error("Email já está em uso");
      }
      throw error;
    }

    return { success: true, data: newUser };
  }

  private async loginUserSupabase(
    credentials: LoginCredentials,
  ): Promise<ApiResponse<User>> {
    if (!supabase) throw new Error("Supabase not available");

    console.log("🔍 Fazendo login no Supabase para:", credentials.email);

    const { data: users, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", credentials.email.toLowerCase())
      .limit(1);

    console.log("📊 Resposta do login Supabase:", {
      users: users?.length,
      error,
    });

    if (error) throw error;

    if (!users || users.length === 0) {
      throw new Error("Email não encontrado");
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

    // Converter formato Supabase para formato local com TODOS os campos
    const convertedUser: User = {
      id: user.id,
      email: user.email,
      profession: user.profession,
      crm: user.crm,
      fullName: user.full_name,
      city: user.city,
      state: user.state,
      specialty: user.specialty,
      phone: user.phone, // Incluir telefone
      createdAt: user.created_at,
    };

    console.log("✅ Usuário convertido para o contexto:", convertedUser);

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
    const users = this.getStoredUsers();

    // Encontra usuário por email
    const user = users.find(
      (u) => u.email.toLowerCase() === credentials.email.toLowerCase(),
    );

    if (!user) {
      throw new Error("Email não encontrado");
    }

    return { success: true, data: user };
  }

  // MÉTODOS PÚBLICOS HÍBRIDOS
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

        // Salvar usuário atual
        if (result.data) {
          localStorage.setItem(
            this.STORAGE_KEYS.CURRENT_USER,
            JSON.stringify(result.data),
          );
        }

        return result;
      },
      // Fallback localStorage
      async () => {
        const result = await this.loginUserLocalStorage(credentials);

        // Salvar usuário atual
        if (result.data) {
          localStorage.setItem(
            this.STORAGE_KEYS.CURRENT_USER,
            JSON.stringify(result.data),
          );
        }

        return result;
      },
    );
  }

  async logout(): Promise<ApiResponse> {
    await this.delay(200);

    try {
      localStorage.removeItem(this.STORAGE_KEYS.CURRENT_USER);
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
    try {
      const user = localStorage.getItem(this.STORAGE_KEYS.CURRENT_USER);
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
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
        localStorage.removeItem(this.STORAGE_KEYS.CURRENT_USER);

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
        localStorage.removeItem(this.STORAGE_KEYS.CURRENT_USER);

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
}

export const authSupabaseAPI = new AuthSupabaseAPI();
