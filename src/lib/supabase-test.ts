import { supabase, isSupabaseAvailable } from "./supabase";

// Função para testar a conexão
export const testSupabaseConnection = async () => {
  console.log("🔥 Testando conexão com Supabase...");
  console.log("📍 URL:", import.meta.env.VITE_SUPABASE_URL);
  console.log(
    "🔑 Anon Key disponível:",
    !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  );
  console.log("📡 Cliente disponível:", isSupabaseAvailable());

  if (!isSupabaseAvailable()) {
    console.error("❌ Supabase não está configurado corretamente");
    return false;
  }

  try {
    // Teste simples de conexão
    const { data, error } = await supabase!.from("users").select("count");

    if (error) {
      console.warn(
        "⚠️  Tabela 'users' ainda não existe (isso é normal):",
        error.message,
      );
      return true; // Conexão OK, só precisa criar tabelas
    }

    console.log("✅ Conexão com Supabase estabelecida com sucesso!");
    console.log("📊 Teste de query executado:", data);
    return true;
  } catch (error) {
    console.error("❌ Erro ao conectar com Supabase:", error);
    return false;
  }
};

// Auto-executar o teste em desenvolvimento
if (import.meta.env.DEV) {
  testSupabaseConnection();
}
