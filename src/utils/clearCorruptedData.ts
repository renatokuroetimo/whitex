// Ferramenta para limpar dados corrompidos
export const clearCorruptedData = () => {
  console.log("🧹 Limpando dados corrompidos...");

  try {
    // Verificar se os dados do usuário atual estão consistentes
    const currentUserRaw = localStorage.getItem("medical_app_current_user");

    if (currentUserRaw) {
      const currentUser = JSON.parse(currentUserRaw);
      console.log("🔍 Usuário atual:", currentUser);

      // Verificar se a profissão está válida
      if (
        !currentUser.profession ||
        (currentUser.profession !== "medico" &&
          currentUser.profession !== "paciente")
      ) {
        console.log("❌ Profissão inválida detectada:", currentUser.profession);
        console.log("🧹 Removendo usuário corrompido...");
        localStorage.removeItem("medical_app_current_user");
        window.location.href = "/login";
        return;
      }

      console.log("✅ Dados do usuário parecem válidos");
    } else {
      console.log("❌ Nenhum usuário atual encontrado");
      window.location.href = "/login";
    }
  } catch (error) {
    console.error("❌ Erro ao verificar dados:", error);
    console.log("🧹 Limpando todos os dados...");
    localStorage.removeItem("medical_app_current_user");
    window.location.href = "/login";
  }
};

// Adicionar ao objeto global para acesso fácil
if (typeof window !== "undefined") {
  (window as any).clearCorruptedData = clearCorruptedData;
}
