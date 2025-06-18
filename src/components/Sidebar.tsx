import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Users, BarChart3, LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userProfession, setUserProfession] = useState<string>("");

  // Função para detectar a profissão do usuário de forma mais robusta
  useEffect(() => {
    const detectUserProfession = () => {
      // Primeiro, tentar pelo contexto
      if (user?.profession) {
        console.log("✅ Profissão detectada pelo contexto:", user.profession);
        setUserProfession(user.profession);
        return;
      }

      // Segundo, tentar pelo localStorage
      try {
        const storedUser = localStorage.getItem("medical_app_current_user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser?.profession) {
            console.log(
              "✅ Profissão detectada pelo localStorage:",
              parsedUser.profession,
            );
            setUserProfession(parsedUser.profession);
            return;
          }
        }
      } catch (error) {
        console.error("❌ Erro ao ler localStorage:", error);
      }

      // Terceiro, tentar detectar pela URL atual
      const path = location.pathname;
      if (path.includes("/patient")) {
        console.log("✅ Profissão detectada pela URL (paciente):", path);
        setUserProfession("paciente");
        return;
      }

      if (path.includes("/dashboard") && !path.includes("patient")) {
        console.log("✅ Profissão detectada pela URL (médico):", path);
        setUserProfession("medico");
        return;
      }

      console.log("❌ Não foi possível detectar a profissão");
    };

    detectUserProfession();

    // Verificar novamente a cada segundo
    const interval = setInterval(detectUserProfession, 1000);

    return () => clearInterval(interval);
  }, [user, location.pathname]);

  // Função para obter itens da sidebar
  const getSidebarItems = () => {
    console.log("🔍 Gerando itens para profissão:", userProfession);

    if (userProfession === "medico") {
      return [
        { id: "inicio", label: "Início", icon: Home, path: "/dashboard" },
        {
          id: "pacientes",
          label: "Pacientes",
          icon: Users,
          path: "/pacientes",
        },
        {
          id: "indicadores",
          label: "Indicadores",
          icon: BarChart3,
          path: "/indicadores",
        },
      ];
    }

    if (userProfession === "paciente") {
      return [
        {
          id: "inicio",
          label: "Início",
          icon: Home,
          path: "/patient-dashboard",
        },
        {
          id: "dados",
          label: "Dados pessoais",
          icon: Users,
          path: "/patient-profile",
        },
        {
          id: "indicadores",
          label: "Indicadores",
          icon: BarChart3,
          path: "/patient/indicadores",
        },
      ];
    }

    // Fallback
    return [{ id: "inicio", label: "Início", icon: Home, path: "/" }];
  };

  // Carregar imagem de perfil
  useEffect(() => {
    const loadProfileImage = () => {
      const userId = user?.id;
      if (userId) {
        const savedImage = localStorage.getItem(`profile_image_${userId}`);
        if (savedImage && savedImage.startsWith("data:")) {
          setProfileImage(savedImage);
        } else {
          setProfileImage(null);
        }
      }
    };

    loadProfileImage();
    const interval = setInterval(loadProfileImage, 2000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const handleNavigation = (path: string) => {
    console.log("🔍 Navegando para:", path);
    navigate(path);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path: string) => {
    const isMatch = location.pathname === path;
    console.log(
      `🔍 Verificando ativo: ${path} === ${location.pathname} = ${isMatch}`,
    );
    return isMatch;
  };

  const sidebarItems = getSidebarItems();
  const profilePath =
    userProfession === "paciente" ? "/patient-profile" : "/profile";

  console.log("🔍 Itens finais da sidebar:", sidebarItems);
  console.log("🔍 Caminho do perfil:", profilePath);

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-900 rounded flex items-center justify-center">
            <span className="text-white text-sm font-semibold">W</span>
          </div>
          <span className="font-semibold text-gray-900">WHITEX</span>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center border border-gray-200">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Foto de perfil"
                  className="w-full h-full object-cover"
                  onError={() => setProfileImage(null)}
                />
              ) : (
                <User className="w-4 h-4 text-gray-600" />
              )}
            </div>
            <span className="text-sm text-gray-600">Meu Perfil</span>
          </div>
          <button
            onClick={() => navigate(profilePath)}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            ▼
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    active
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Debug Info */}
      {process.env.NODE_ENV === "development" && (
        <div className="p-3 border-t border-red-200 bg-red-50 text-xs">
          <div className="text-red-700">
            <div>
              <strong>Email:</strong> {user?.email || "N/A"}
            </div>
            <div>
              <strong>Profissão:</strong> {userProfession || "N/A"}
            </div>
            <div>
              <strong>URL:</strong> {location.pathname}
            </div>
            <div>
              <strong>Itens:</strong> {sidebarItems.length}
            </div>
          </div>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="mt-2 px-2 py-1 bg-red-200 text-red-800 rounded text-xs"
          >
            🧹 Limpar Cache
          </button>
        </div>
      )}

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start gap-3 text-gray-600 hover:text-gray-900"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
