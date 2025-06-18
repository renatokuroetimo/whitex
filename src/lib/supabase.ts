import { createClient } from "@supabase/supabase-js";

// Configuração do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials not found. Using localStorage fallback.");
}

// Cliente Supabase (opcional durante migração)
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Verificar se Supabase está disponível
export const isSupabaseAvailable = () => {
  return supabase !== null;
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
