// Sistema simplificado - sempre usar Supabase
import { isSupabaseConfigured } from "./supabase";

// Verificar se Supabase está configurado e disponível
export const isFeatureEnabled = (flag: string): boolean => {
  // Sempre retorna true se Supabase estiver configurado
  // Se não estiver configurado, deixa falhar com erro
  return isSupabaseConfigured();
};

// Funções para compatibilidade (não fazem nada, sempre Supabase)
export const setFeatureFlag = (flag: string, value: boolean): void => {
  console.log(`⚠️ Feature flags removidas - sempre usando Supabase`);
};

export const getFeatureFlags = () => {
  return {
    useSupabaseAuth: true,
    useSupabasePatients: true,
    useSupabaseIndicators: true,
    useSupabaseProfiles: true,
    enableDataMigration: true,
  };
};

export const getMigrationStatus = () => {
  return {
    supabaseAvailable: isSupabaseConfigured(),
    authMigrated: true,
    patientsMigrated: true,
    indicatorsMigrated: true,
    profilesMigrated: true,
    migrationEnabled: true,
    overallProgress: 4,
  };
};

// Funções obsoletas - mantidas para compatibilidade mas não fazem nada
export const enableSupabaseMigration = (): void => {
  console.log("✅ Sistema sempre usa Supabase - feature flags removidas");
};

export const disableSupabaseMigration = (): void => {
  console.log(
    "❌ Não é possível desabilitar Supabase - feature flags removidas",
  );
};
