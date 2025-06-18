import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Users, BarChart3, LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path: string;
}

const getSidebarItems = (userProfession?: string): SidebarItem[] => {
  const dashboardPath =
    userProfession === "paciente" ? "/patient-dashboard" : "/dashboard";

  const baseItems = [
    {
      id: "inicio",
      label: "Início",
      icon: Home,
      path: dashboardPath,
    },
  ];

  if (userProfession === "medico") {
    return [
      ...baseItems,
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
  } else if (userProfession === "paciente") {
    return [
      ...baseItems,
      {
        id: "meus-dados",
        label: "Dados pessoais",
        icon: Users,
        path: "/patient-profile",
      },
      {
        id: "meus-indicadores",
        label: "Indicadores",
        icon: BarChart3,
        path: "/patient/indicadores",
      },
    ];
  }

  return baseItems;
};

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Carregar imagem de perfil do localStorage
  useEffect(() => {
    const loadProfileImage = () => {
      if (user?.id) {
        const savedImage = localStorage.getItem(`profile_image_${user.id}`);
        if (
          savedImage &&
          savedImage !== "null" &&
          savedImage !== "undefined" &&
          savedImage.startsWith("data:")
        ) {
          setProfileImage(savedImage);
        } else {
          setProfileImage(null);
        }
      } else {
        setProfileImage(null);
      }
    };

    loadProfileImage();
  }, [user?.id]);

  // Escutar mudanças na imagem de perfil
  useEffect(() => {
    const handleStorageChange = () => {
      if (user?.id) {
        const savedImage = localStorage.getItem(`profile_image_${user.id}`);
        if (
          savedImage &&
          savedImage !== "null" &&
          savedImage !== "undefined" &&
          savedImage.startsWith("data:")
        ) {
          setProfileImage(savedImage);
        } else {
          setProfileImage(null);
        }
      }
    };

    // Listen for custom event when profile image is updated
    const handleProfileImageUpdate = (event: CustomEvent) => {
      if (event.detail.userId === user?.id) {
        handleStorageChange();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(
      "profileImageUpdated",
      handleProfileImageUpdate as EventListener,
    );

    // Também escutar mudanças locais
    const interval = setInterval(handleStorageChange, 2000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "profileImageUpdated",
        handleProfileImageUpdate as EventListener,
      );
      clearInterval(interval);
    };
  }, [user?.id]);

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const sidebarItems = getSidebarItems(user?.profession);
  const profilePath =
    user?.profession === "paciente" ? "/patient-profile" : "/profile";
  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col sidebar-container">
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
      <div
        className="p-6 border-b border-gray-200 sidebar-profile-section"
        style={{
          backgroundColor: "white",
          background: "white",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center border border-gray-200">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Foto de perfil"
                  className="w-full h-full object-cover"
                  onError={() => {
                    setProfileImage(null);
                    if (user?.id) {
                      localStorage.removeItem(`profile_image_${user.id}`);
                    }
                  }}
                />
              ) : (
                <User className="w-4 h-4 text-gray-600" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">
                Meu Perfil
              </span>
              <span className="text-xs text-gray-500">
                {user?.profession === "medico" ? "Médico" : "Paciente"}
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate(profilePath)}
            className="text-xs text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition-colors"
            title="Ver perfil"
          >
            ▼
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? "!bg-blue-50 !text-blue-700 !border !border-blue-200"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
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
