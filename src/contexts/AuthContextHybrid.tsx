import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  ReactNode,
} from "react";
import { User, AuthState, LoginCredentials, RegisterData } from "@/lib/types";
import { authAPI } from "@/lib/auth-api";
import { authSupabaseAPI } from "@/lib/auth-supabase";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { isMobileApp } from "@/lib/mobile-utils";
import { toast } from "@/hooks/use-toast";

// Action types
type AuthAction =
  | { type: "AUTH_START" }
  | { type: "AUTH_SUCCESS"; payload: User }
  | { type: "AUTH_ERROR"; payload: string }
  | { type: "LOGOUT" }
  | { type: "CLEAR_ERROR" };

// Auth context interface
interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<boolean>;
  clearError: () => void;
}

// Initial state
const initialState: AuthState = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
};

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "AUTH_START":
      return {
        ...state,
        isLoading: true,
      };
    case "AUTH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        user: action.payload,
        isAuthenticated: true,
      };
    case "AUTH_ERROR":
      return {
        ...state,
        isLoading: false,
        user: null,
        isAuthenticated: false,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case "CLEAR_ERROR":
      return {
        ...state,
      };
    default:
      return state;
  }
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Escolher qual API usar baseado nas feature flags
  const getAuthAPI = () => {
    const useSupabase = isFeatureEnabled("useSupabaseAuth");
    console.log(
      `🔍 Auth API escolhida: ${useSupabase ? "Supabase" : "localStorage"}`,
    );
    return useSupabase ? authSupabaseAPI : authAPI;
  };

  // Check if user is already logged in on mount
  useEffect(() => {
    console.log("🔄 AuthContext useEffect - checking stored session...");

    let currentUser = null;
    try {
      currentUser = getAuthAPI().getCurrentUser();
      console.log("🔍 Initial auth check:", {
        currentUser: currentUser
          ? { email: currentUser.email, profession: currentUser.profession }
          : null,
        isMobile: isMobileApp(),
        hasUser: !!currentUser,
      });

      if (currentUser) {
        // On mobile app, only allow patients
        if (isMobileApp() && currentUser.profession === "medico") {
          console.log(
            "🚫 Initial load: blocking doctor on mobile, clearing session",
          );
          // Clear the session completely but don't show repeated toasts
          getAuthAPI().logout();
          return;
        }

        // For valid users (patients on mobile, or any user on web), restore session
        console.log("✅ Restoring user session:", currentUser.email);
        dispatch({ type: "AUTH_SUCCESS", payload: currentUser });
      } else {
        console.log("❌ No stored user session found");

        // Debug: check what's actually in localStorage
        const keys = Object.keys(localStorage);
        const relevantKeys = keys.filter(
          (key) => key.includes("medical_app") || key.includes("user"),
        );
        console.log("🔍 Relevant localStorage keys:", relevantKeys);
      }
    } catch (error) {
      console.error("❌ Error during session restoration:", error);
    }

    // Migrar dados existentes se Supabase estiver ativado
    if (isFeatureEnabled("useSupabaseAuth")) {
      authSupabaseAPI.migrateExistingUsers().then(() => {
        console.log("🔄 Migração de usuários concluída");
      });
    }

    // Add delayed session check for mobile (sometimes needed for timing)
    if (isMobileApp() && !currentUser) {
      console.log("📱 Mobile delayed session check scheduled...");
      setTimeout(() => {
        const delayedCheck = getAuthAPI().getCurrentUser();
        if (delayedCheck && !state.user) {
          console.log(
            "✅ Delayed session check found user:",
            delayedCheck.email,
          );
          if (delayedCheck.profession !== "medico") {
            dispatch({ type: "AUTH_SUCCESS", payload: delayedCheck });
          }
        }
      }, 500);
    }

    // Add listeners for app lifecycle events (mobile debugging)
    const handleVisibilityChange = () => {
      console.log(
        "👁️ App visibility changed:",
        document.hidden ? "hidden" : "visible",
      );
      if (!document.hidden) {
        // App became visible - check if session is still there
        const currentUser = getAuthAPI().getCurrentUser();
        console.log("👁️ Session check on app focus:", !!currentUser);
        if (currentUser && !state.user && currentUser.profession !== "medico") {
          dispatch({ type: "AUTH_SUCCESS", payload: currentUser });
        }
      }
    };

    const handlePageShow = () => {
      console.log("🔄 Page show event - checking session...");
      const currentUser = getAuthAPI().getCurrentUser();
      console.log("🔄 Session status:", !!currentUser);
      if (currentUser && !state.user && currentUser.profession !== "medico") {
        dispatch({ type: "AUTH_SUCCESS", payload: currentUser });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    dispatch({ type: "AUTH_START" });

    try {
      const authAPI = getAuthAPI();
      console.log(
        "���� Usando API para login:",
        authAPI === authSupabaseAPI ? "Supabase" : "localStorage",
      );
      const response = await authAPI.login(credentials);

      if (response.success && response.data) {
        dispatch({ type: "AUTH_SUCCESS", payload: response.data });

        // Debug: check what fields are available
        console.log("🔍 Response data fields:", Object.keys(response.data));
        console.log("👤 User data:", {
          fullName: response.data.fullName,
          full_name: response.data.full_name,
          name: response.data.name,
          email: response.data.email,
        });

        const displayName =
          response.data.fullName ||
          response.data.full_name ||
          response.data.name ||
          response.data.email;

        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo de volta, ${displayName}`,
        });
        return true;
      } else {
        dispatch({
          type: "AUTH_ERROR",
          payload: response.error || "Erro no login",
        });
        toast({
          variant: "destructive",
          title: "Erro no login",
          description: response.error || "Credenciais inválidas",
        });
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.message || "Erro de conexão";
      dispatch({ type: "AUTH_ERROR", payload: errorMessage });
      toast({
        variant: "destructive",
        title: "Erro no login",
        description: errorMessage,
      });
      return false;
    }
  };

  // Register function
  const register = async (data: RegisterData): Promise<boolean> => {
    dispatch({ type: "AUTH_START" });

    try {
      const authAPI = getAuthAPI();
      console.log(
        "🔍 Usando API para registro:",
        authAPI === authSupabaseAPI ? "Supabase" : "localStorage",
      );
      const response = await authAPI.register(data);

      if (response.success && response.data) {
        dispatch({ type: "AUTH_SUCCESS", payload: response.data });

        const apiType = isFeatureEnabled("useSupabaseAuth")
          ? "Supabase"
          : "localStorage";
        toast({
          title: "Conta criada com sucesso!",
          description: `Bem-vindo, ${response.data.email}! (${apiType})`,
        });
        return true;
      } else {
        dispatch({
          type: "AUTH_ERROR",
          payload: response.error || "Erro no registro",
        });
        toast({
          variant: "destructive",
          title: "Erro no registro",
          description: response.error || "Não foi possível criar a conta",
        });
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.message || "Erro de conexão";
      dispatch({ type: "AUTH_ERROR", payload: errorMessage });
      toast({
        variant: "destructive",
        title: "Erro no registro",
        description: errorMessage,
      });
      return false;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await getAuthAPI().logout();
      dispatch({ type: "LOGOUT" });
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro no logout",
        description: "Erro ao desconectar",
      });
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  // Delete account function
  const deleteAccount = async (): Promise<boolean> => {
    try {
      const response = await getAuthAPI().deleteAccount();

      if (response.success) {
        dispatch({ type: "LOGOUT" });
        toast({
          title: "Conta deletada",
          description: "Sua conta foi deletada com sucesso",
        });
        return true;
      } else {
        toast({
          variant: "destructive",
          title: "Erro ao deletar conta",
          description: response.error || "Não foi possível deletar a conta",
        });
        return false;
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao deletar conta",
        description: error.message || "Erro de conexão",
      });
      return false;
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    deleteAccount,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export { useAuth };
