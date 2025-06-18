// Ferramenta de debug para verificar dados do usuário
export const debugUserData = () => {
  console.log("=== DEBUG DADOS DO USUÁRIO ===");

  // Verificar localStorage
  const currentUser = localStorage.getItem("medical_app_current_user");
  const allUsers = localStorage.getItem("medical_app_users");

  console.log("📱 Current user (raw):", currentUser);
  console.log("📚 All users (raw):", allUsers);

  try {
    if (currentUser) {
      const parsedUser = JSON.parse(currentUser);
      console.log("👤 Current user (parsed):", parsedUser);
      console.log("🏥 Profession:", parsedUser.profession);
      console.log("📧 Email:", parsedUser.email);
      console.log("🆔 ID:", parsedUser.id);
    } else {
      console.log("❌ No current user found");
    }
  } catch (error) {
    console.error("❌ Error parsing current user:", error);
  }

  try {
    if (allUsers) {
      const parsedUsers = JSON.parse(allUsers);
      console.log("👥 All users:", parsedUsers);
    }
  } catch (error) {
    console.error("❌ Error parsing all users:", error);
  }

  // Verificar URL atual
  console.log("🌐 Current URL:", window.location.pathname);

  console.log("=== FIM DEBUG ===");
};

// Executar automaticamente se estiver em desenvolvimento
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  // Adicionar ao objeto global para acesso fácil
  (window as any).debugUser = debugUserData;

  // Executar uma vez
  debugUserData();
}
