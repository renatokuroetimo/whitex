import { createClient } from "@supabase/supabase-js";

// Configuração do Supabase com fallback
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://ogyvioeeaknagslworyz.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9neXZpb2VlYWtuYWdzbHdvcnl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNDg0MTMsImV4cCI6MjA2NTgyNDQxM30.tvWZHrK-OwIPjHgjAq8PA1Wr95OFmfPi89X6gmDB5Lw";

console.log("🔧 Supabase Configuration Debug:");
console.log(
  "- URL from env:",
  import.meta.env.VITE_SUPABASE_URL ? "✅ SET" : "❌ NOT SET",
);
console.log(
  "- Key from env:",
  import.meta.env.VITE_SUPABASE_ANON_KEY ? "✅ SET" : "❌ NOT SET",
);
console.log("- Final URL:", supabaseUrl);
console.log("- Key length:", supabaseAnonKey?.length || 0);

if (!import.meta.env.VITE_SUPABASE_URL) {
  console.log("Using fallback Supabase configuration");
}

// Cliente Supabase (sempre disponível agora)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test connectivity function
export const testSupabaseConnectivity = async (): Promise<{
  success: boolean;
  error?: string;
  details?: any;
}> => {
  try {
    console.log("🔍 Testing Supabase connectivity to:", supabaseUrl);

    // Simple test query
    const { data, error } = await supabase
      .from("users")
      .select("count", { count: "exact", head: true });

    if (error) {
      console.error("❌ Supabase test failed:", error);
      return {
        success: false,
        error: error.message,
        details: error,
      };
    }

    console.log("✅ Supabase connectivity test passed");
    return { success: true };
  } catch (error) {
    console.error("❌ Supabase connectivity test error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      details: error,
    };
  }
};

// Verificar se Supabase está disponível (sem teste de rede)
export const isSupabaseAvailable = (): boolean => {
  return !!supabase && !!supabaseUrl && !!supabaseAnonKey;
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
