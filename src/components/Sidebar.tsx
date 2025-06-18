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

  // Log para debug SEMPRE
  console.log("🚨 SIDEBAR RENDER - User:", user);
  console.log("🚨 SIDEBAR RENDER - Path:", location.pathname);

  // Obter dados do usuário com fallback duplo
  const getUserData = () => {
    // Primeiro: usar contexto
    if (user?.profession) {
      return { ...user, source: "context" };
    }

    // Segundo: usar localStorage
    try {
      const stored = localStorage.getItem("medical_app_current_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...parsed, source: "localStorage" };
      }
    } catch (e) {
      console.error("🚨 Erro localStorage:", e);
    }

    return null;
  };

  const currentUser = getUserData();
  console.log("🚨 CURRENT USER:", currentUser);

  // Determinar profissão SEMPRE
  const userProfession = currentUser?.profession || "unknown";
  console.log("🚨 USER PROFESSION:", userProfession);

  // Função para gerar itens da sidebar - SEMPRE
  const generateSidebarItems = () => {
    console.log("🚨 GENERATING ITEMS FOR:", userProfession);

    // FORÇAR items corretos baseado na profissão
    if (userProfession === "paciente") {
      const items = [
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
      console.log("🚨 RETURNING PACIENTE ITEMS:", items);
      return items;
    }

    if (userProfession === "medico") {
      const items = [
        {
          id: "inicio",
          label: "Início",
          icon: Home,
          path: "/dashboard",
        },
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
      console.log("🚨 RETURNING MEDICO ITEMS:", items);
      return items;
    }

    // Fallback
    const fallbackItems = [
      {
        id: "inicio",
        label: "Início",
        icon: Home,
        path: "/",
      },
    ];
    console.log("🚨 RETURNING FALLBACK ITEMS:", fallbackItems);
    return fallbackItems;
  };

  const sidebarItems = generateSidebarItems();

  // Carregar imagem de perfil
  useEffect(() => {
    if (currentUser?.id) {
      const savedImage = localStorage.getItem(
        `profile_image_${currentUser.id}`,
      );
      if (savedImage && savedImage.startsWith("data:")) {
        setProfileImage(savedImage);
      }
    }
  }, [currentUser?.id]);

  const handleNavigation = (path: string) => {
    console.log("🚨 NAVIGATING TO:", path);
    navigate(path);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path: string) => {
    const active = location.pathname === path;
    console.log(`🚨 IS ACTIVE: ${path} === ${location.pathname} = ${active}`);
    return active;
  };

  const profilePath =
    userProfession === "paciente" ? "/patient-profile" : "/profile";

  console.log("🚨 FINAL SIDEBAR ITEMS:", sidebarItems);

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* Header com timestamp para forçar atualização */}
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

            console.log(
              `🚨 RENDERING: ${item.label} (${item.path}) - Active: ${active}`,
            );

            return (
              <li key={`${item.id}-${Date.now()}`}>
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

      {/* FORÇAR DEBUG VISUAL */}
      <div className="p-2 bg-red-100 border-t border-red-300 text-xs text-red-800">
        <div>
          <strong>👤 Usuário:</strong> {currentUser?.email || "N/A"}
        </div>
        <div>
          <strong>🏥 Profissão:</strong> {userProfession}
        </div>
        <div>
          <strong>📍 URL:</strong> {location.pathname}
        </div>
        <div>
          <strong>📋 Itens:</strong> {sidebarItems.length}
        </div>
        <div>
          <strong>⏰ Render:</strong> {new Date().toLocaleTimeString()}
        </div>
      </div>

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
