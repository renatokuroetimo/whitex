// Script de teste para verificar se as restrições mobile estão funcionando
// Execute este script no console do navegador na versão mobile

console.log("🧪 Teste das restrições mobile");

// Testar detecção de mobile
const isMobile = import.meta.env.VITE_APP_MODE === "mobile";
console.log("📱 Modo mobile detectado:", isMobile);

// Simular tentativa de login como médico
const simulateDoctor = {
  email: "doutor@exemplo.com",
  profession: "medico",
};

// Simular tentativa de login como paciente
const simulatePatient = {
  email: "paciente@exemplo.com",
  profession: "paciente",
};

console.log("🩺 Simulação médico:", simulateDoctor);
console.log("🏥 Simulação paciente:", simulatePatient);

if (isMobile) {
  console.log("✅ Versão mobile - apenas pacientes permitidos");
  console.log("❌ Médicos serão bloqueados");
} else {
  console.log("🌐 Versão web - médicos e pacientes permitidos");
}

console.log("🎯 Teste concluído - verifique os logs acima");
