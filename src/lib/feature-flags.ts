// Sistema de Feature Flags para migração gradual
import { isSupabaseConfigured } from "./supabase";

interface FeatureFlags {
  useSupabaseAuth: boolean;
  useSupabasePatients: boolean;
  useSupabaseIndicators: boolean;
  useSupabaseProfiles: boolean;
  enableDataMigration: boolean;
}

// Flags padrão (migração gradual)
const defaultFlags: FeatureFlags = {
  useSupabaseAuth: false, // Começar com localStorage
  useSupabasePatients: false,
  useSupabaseIndicators: false,
  useSupabaseProfiles: false,
  enableDataMigration: false,
};

// Carregar flags do localStorage (para persistir configurações)
const getStoredFlags = (): Partial<FeatureFlags> => {
  try {
    const stored = localStorage.getItem("medical_app_feature_flags");
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

// Salvar flags no localStorage
const saveFlags = (flags: FeatureFlags): void => {
  localStorage.setItem("medical_app_feature_flags", JSON.stringify(flags));
};

// Obter flags atuais
export const getFeatureFlags = (): FeatureFlags => {
  const stored = getStoredFlags();
  return { ...defaultFlags, ...stored };
};

// Atualizar uma flag específica
export const setFeatureFlag = (
  flag: keyof FeatureFlags,
  value: boolean,
): void => {
  const currentFlags = getFeatureFlags();
  const newFlags = { ...currentFlags, [flag]: value };
  saveFlags(newFlags);

  console.log(`🏁 Feature flag atualizada: ${flag} = ${value}`);
};

// Verificar se uma feature está habilitada
export const isFeatureEnabled = (flag: keyof FeatureFlags): boolean => {
  const flags = getFeatureFlags();
  const isEnabled = flags[flag] && isSupabaseConfigured();

  // Log para debug
  if (import.meta.env.DEV) {
    console.log(
      `🔍 Feature check: ${flag} = ${isEnabled} (flag: ${flags[flag]}, supabase: ${isSupabaseConfigured()})`,
    );
  }

  return isEnabled;
};

// Ativar migração em lote (apenas para admin/dev)
export const enableSupabaseMigration = (): void => {
  console.log("🚀 Ativando migração para Supabase...");

  setFeatureFlag("useSupabaseAuth", true);
  setFeatureFlag("useSupabasePatients", true);
  setFeatureFlag("useSupabaseIndicators", true);
  setFeatureFlag("useSupabaseProfiles", true);
  setFeatureFlag("enableDataMigration", true);

  console.log("✅ Migração ativada!");

  // Notificar que precisa recarregar, mas não forçar
  if (typeof window !== "undefined") {
    // Disparar evento customizado para o painel reagir
    window.dispatchEvent(new CustomEvent("migrationChanged"));
  }
};

// Voltar para localStorage (rollback)
export const disableSupabaseMigration = (): void => {
  console.log("🔄 Voltando para localStorage...");

  setFeatureFlag("useSupabaseAuth", false);
  setFeatureFlag("useSupabasePatients", false);
  setFeatureFlag("useSupabaseIndicators", false);
  setFeatureFlag("useSupabaseProfiles", false);
  setFeatureFlag("enableDataMigration", false);

  console.log("✅ Rollback concluído! Recarregue a página.");
};

// Status da migração
export const getMigrationStatus = () => {
  const flags = getFeatureFlags();
  return {
    supabaseAvailable: isSupabaseConfigured(),
    authMigrated: flags.useSupabaseAuth,
    patientsMigrated: flags.useSupabasePatients,
    indicatorsMigrated: flags.useSupabaseIndicators,
    profilesMigrated: flags.useSupabaseProfiles,
    migrationEnabled: flags.enableDataMigration,
    overallProgress: [
      flags.useSupabaseAuth,
      flags.useSupabasePatients,
      flags.useSupabaseIndicators,
      flags.useSupabaseProfiles,
    ].filter(Boolean).length,
  };
};

// Funções globais para console (desenvolvimento)
if (import.meta.env.DEV && typeof window !== "undefined") {
  (window as any).enableSupabaseMigration = enableSupabaseMigration;
  (window as any).disableSupabaseMigration = disableSupabaseMigration;
  (window as any).getMigrationStatus = getMigrationStatus;
  (window as any).setFeatureFlag = setFeatureFlag;

  console.log(`
🔧 COMANDOS DE MIGRAÇÃO DISPONÍVEIS:
- enableSupabaseMigration() - Ativar Supabase
- disableSupabaseMigration() - Voltar para localStorage
- getMigrationStatus() - Ver status da migração
- setFeatureFlag('flagName', true/false) - Ativar flag específica
  `);
}
