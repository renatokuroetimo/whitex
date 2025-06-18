import { createClient } from "@supabase/supabase-js";

// Configuração do Supabase com fallback
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://ogyvioeeaknagslworyz.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9neXZpb2VlYWtuYWdzbHdvcnl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNDg0MTMsImV4cCI6MjA2NTgyNDQxM30.tvWZHrK-OwIPjHgjAq8PA1Wr95OFmfPi89X6gmDB5Lw";

if (!import.meta.env.VITE_SUPABASE_URL) {
  console.log("Using fallback Supabase configuration");
}

// Cliente Supabase (sempre disponível agora)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Verificar se Supabase está disponível com teste de conectividade
export const isSupabaseAvailable = async (): Promise<boolean> => {
  try {
    if (!supabase || !supabaseUrl || !supabaseAnonKey) {
      return false;
    }

    // Teste básico de conectividade usando uma tabela que sabemos que existe
    const { error } = await supabase.from("users").select("id").limit(0);

    // Se não houve erro de conectividade/auth, consideramos disponível
    // Erros de tabela são normais se não existir, mas conexão está OK
    return !error || error.code !== "PGRST301"; // PGRST301 = connection failed
  } catch (error) {
    console.warn("Supabase connection test failed:", error);
    return false;
  }
};

// Versão síncrona para uso imediato (sem teste de rede)
export const isSupabaseConfigured = (): boolean => {
  return !!supabase && !!supabaseUrl && !!supabaseAnonKey;
};

// Utility para migração gradual
export const withSupabaseFallback = async <T>(
  supabaseOperation: () => Promise<T>,
  localStorageOperation: () => T,
): Promise<T> => {
  if (isSupabaseAvailable()) {
    try {
      return await supabaseOperation();
    } catch (error) {
      console.warn(
        "Supabase operation failed, falling back to localStorage:",
        error,
      );
      return localStorageOperation();
    }
  }
  return localStorageOperation();
};
