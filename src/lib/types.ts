export interface User {
  id: string;
  email: string;
  name?: string;
  fullName?: string;
  profession: "medico" | "paciente";
  crm?: string;
  city?: string;
  state?: string;
  specialty?: string;
  profileImage?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  profession: "medico" | "paciente";
  crm?: string;
  fullName?: string;
  city?: string;
  state?: string;
  specialty?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
