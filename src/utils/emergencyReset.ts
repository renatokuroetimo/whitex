// Sistema de reset de emergência para corrigir problemas persistentes
export const emergencyReset = () => {
  console.log("🚨 EXECUTANDO RESET DE EMERGÊNCIA");

  // 1. Limpar TODOS os dados do localStorage
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.includes("medical_app")) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => {
    console.log("🗑️ Removendo:", key);
    localStorage.removeItem(key);
  });

  // 2. Forçar logout
  localStorage.removeItem("medical_app_current_user");

  // 3. Redirecionar para login
  console.log("🔄 Redirecionando para login...");
  window.location.href = "/login";
};

// Função para recriar usuário paciente de teste
export const createTestPatient = () => {
  console.log("👤 Criando usuário paciente de teste...");

  const testPatient = {
    id: "test_patient_" + Date.now(),
    email: "paciente@teste.com",
    profession: "paciente",
    createdAt: new Date().toISOString(),
  };

  // Salvar na lista de usuários
  const users = [testPatient];
  localStorage.setItem("medical_app_users", JSON.stringify(users));

  // Definir como usuário atual
  localStorage.setItem("medical_app_current_user", JSON.stringify(testPatient));

  console.log("✅ Usuário paciente criado:", testPatient);

  // Recarregar a página
  window.location.reload();
};

// Disponibilizar globalmente
if (typeof window !== "undefined") {
  (window as any).emergencyReset = emergencyReset;
  (window as any).createTestPatient = createTestPatient;

  console.log(`
🚨 FERRAMENTAS DE EMERGÊNCIA DISPONÍVEIS:
- Digite: emergencyReset() - Para reset completo
- Digite: createTestPatient() - Para criar usuário paciente de teste
  `);
}
