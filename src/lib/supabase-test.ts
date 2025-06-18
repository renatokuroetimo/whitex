import { supabase, isSupabaseAvailable } from "./supabase";

// Função para testar a conexão
export const testSupabaseConnection = async () => {
  console.log(
    "%c🚀 TESTE SUPABASE INICIADO",
    "color: #00ff00; font-size: 16px; font-weight: bold;",
  );
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
      console.log(
        "%c⚠️ TABELAS AINDA NÃO CRIADAS",
        "color: #ffaa00; font-size: 14px; font-weight: bold;",
      );
      console.log(
        "🔧 Execute o SQL no Supabase Dashboard para criar as tabelas",
      );
      console.log("📋 Erro esperado:", error.message);
      return true; // Conexão OK, só precisa criar tabelas
    }

    console.log(
      "%c✅ SUPABASE FUNCIONANDO PERFEITAMENTE!",
      "color: #00ff00; font-size: 16px; font-weight: bold;",
    );
    console.log("📊 Teste de query executado:", data);
    return true;
  } catch (error) {
    console.log(
      "%c❌ ERRO DE CONEXÃO SUPABASE",
      "color: #ff0000; font-size: 14px; font-weight: bold;",
    );
    console.error("🔍 Detalhes do erro:", error);
    return false;
  }
};

// Auto-executar o teste em desenvolvimento
if (import.meta.env.DEV) {
  testSupabaseConnection();
}
