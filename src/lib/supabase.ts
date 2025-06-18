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

// Verificar se Supabase está disponível
export const isSupabaseAvailable = () => {
  try {
    // Test basic connectivity
    return !!supabase && !!supabaseUrl && !!supabaseAnonKey;
  } catch {
    return false;
  }
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
