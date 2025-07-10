import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Users, BarChart3, LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContextHybrid";
import { Button } from "@/components/ui/button";
import { profileImageAPI } from "@/lib/profile-image-api";
import { LogoutConfirmDialog } from "@/components/LogoutConfirmDialog";
import Logo from "@/components/Logo";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

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
      // Silencioso
    }

    return null;
  };

  const currentUser = getUserData();

  // Determinar profissão
  const userProfession = currentUser?.profession || "unknown";

  // Função para gerar itens da sidebar
  const generateSidebarItems = () => {
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
      return items;
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
    return fallbackItems;
  };

  const sidebarItems = generateSidebarItems();

  // Carregar imagem de perfil
  useEffect(() => {
    if (currentUser?.id) {
      profileImageAPI
        .getProfileImage(currentUser.id)
        .then((image) => {
          if (image && image.startsWith("data:")) {
            setProfileImage(image);
          }
        })
        .catch(() => {
          // Silencioso
        });
    }
  }, [currentUser?.id]);

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = async () => {
    setShowLogoutDialog(false);
    await logout();
    navigate("/login");
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const profilePath =
    userProfession === "paciente" ? "/patient-profile" : "/profile";

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* Header com timestamp para forçar atualização */}
      <div className="p-6 border-b border-gray-200">
        <Logo
          variant="primary"
          size="3xl"
          showText={false}
          className="justify-center"
        />
      </div>

      {/* User Profile */}
      <div className="p-6 border-b border-gray-200">
        <button
          onClick={() => navigate(profilePath)}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
            isActive(profilePath)
              ? "bg-brand-teal/10 text-brand-primary border border-brand-teal/20"
              : "text-gray-600 hover:bg-brand-light hover:text-brand-primary"
          }`}
        >
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
          <span className="text-sm">Meu Perfil</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <li key={`${item.id}-${Date.now()}`}>
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    active
                      ? "bg-brand-teal/10 text-brand-primary border border-brand-teal/20"
                      : "text-gray-600 hover:bg-brand-light hover:text-brand-primary"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

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

      <LogoutConfirmDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        onConfirm={confirmLogout}
        userType={userProfession === "paciente" ? "paciente" : "médico"}
      />
    </div>
  );
};

export default Sidebar;
