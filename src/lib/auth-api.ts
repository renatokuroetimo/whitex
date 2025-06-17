import { User, LoginCredentials, RegisterData, ApiResponse } from "./types";

// Simula uma API real - você pode substituir por chamadas HTTP reais
class AuthAPI {
  private readonly STORAGE_KEYS = {
    USERS: "medical_app_users",
    CURRENT_USER: "medical_app_current_user",
  };

  // Simula um delay de rede
  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Pega todos os usuários salvos
  private getStoredUsers(): User[] {
    try {
      const users = localStorage.getItem(this.STORAGE_KEYS.USERS);
      return users ? JSON.parse(users) : [];
    } catch {
      return [];
    }
  }

  // Salva usuários
  private saveUsers(users: User[]): void {
    localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  // Gera ID único
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Registro de usuário
  async register(data: RegisterData): Promise<ApiResponse<User>> {
    await this.delay(500); // Simula delay da rede

    try {
      const users = this.getStoredUsers();

      // Verifica se email já existe
      const existingUser = users.find(
        (user) => user.email.toLowerCase() === data.email.toLowerCase(),
      );
      if (existingUser) {
        return {
          success: false,
          error: "Email já está em uso",
        };
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

      return {
        success: true,
        data: newUser,
      };
    } catch (error) {
      return {
        success: false,
        error: "Erro interno do servidor",
      };
    }
  }

  // Login do usuário
  async login(credentials: LoginCredentials): Promise<ApiResponse<User>> {
    await this.delay(500); // Simula delay da rede

    try {
      const users = this.getStoredUsers();

      // Encontra usuário por email
      const user = users.find(
        (u) => u.email.toLowerCase() === credentials.email.toLowerCase(),
      );

      if (!user) {
        return {
          success: false,
          error: "Email não encontrado",
        };
      }

      // Em uma aplicação real, você verificaria a senha hash
      // Por simplicidade, assumimos que qualquer senha é válida para usuários existentes

      // Salva usuário atual
      localStorage.setItem(
        this.STORAGE_KEYS.CURRENT_USER,
        JSON.stringify(user),
      );

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        error: "Erro interno do servidor",
      };
    }
  }

  // Logout
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

  // Pega usuário atual
  getCurrentUser(): User | null {
    try {
      const user = localStorage.getItem(this.STORAGE_KEYS.CURRENT_USER);
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  }

  // Verifica se está autenticado
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }
}

export const authAPI = new AuthAPI();
