import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Users, BarChart3, LogOut, User, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContextHybrid";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { profileImageAPI } from "@/lib/profile-image-api";
import { LogoutConfirmDialog } from "@/components/LogoutConfirmDialog";
import { useStatusBar } from "@/hooks/use-status-bar";
import { useSafeArea } from "@/hooks/use-safe-area";
import Logo from "@/components/Logo";
import ConnectivityStatus from "@/components/ConnectivityStatus";
import SafeImage from "@/components/SafeImage";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path: string;
}

const getSidebarItems = (userProfession?: string): SidebarItem[] => {
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
  }

  // Fallback
  const fallback = [
    {
      id: "inicio",
      label: "Início",
      icon: Home,
      path: "/",
    },
  ];
  return fallback;
};

interface MobileLayoutProps {
  children: React.ReactNode;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Configurar StatusBar e Safe Area para mobile
  useStatusBar();
  const { isIOS } = useSafeArea();

  // Obter dados do usuário com fallback
  const getUserData = () => {
    if (user?.profession) {
      return user;
    }

    try {
      const stored = localStorage.getItem("medical_app_current_user");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("🚨 MOBILE LAYOUT - Erro localStorage:", e);
    }

    return null;
  };

  const currentUser = getUserData();
  const userProfession = currentUser?.profession || "médico";
  const sidebarItems = getSidebarItems(currentUser?.profession);

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
        .catch((error) => {
          console.warn(
            "⚠️ Erro ao carregar imagem de perfil (usando fallback localStorage):",
            error?.message || error,
          );
        });
    }
  }, [currentUser?.id]);

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = async () => {
    setShowLogoutDialog(false);
    await logout();
    navigate("/login");
    setIsMobileMenuOpen(false);
  };

  const isActive = (path: string) => {
    const active = location.pathname === path;
    return active;
  };

  const profilePath =
    currentUser?.profession === "paciente" ? "/profile" : "/profile";

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-64 flex-col bg-white border-r border-gray-200 pt-8">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          {/* Header da sidebar - removido WhiteX */}
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
                <SafeImage
                  src={profileImage}
                  alt="Foto de perfil"
                  className="w-full h-full object-cover"
                  onError={() => setProfileImage(null)}
                  placeholder={<User className="w-4 h-4 text-gray-600" />}
                />
              ) : (
                <User className="w-4 h-4 text-gray-600" />
              )}
            </div>
            <span className="text-sm truncate">Meu Perfil</span>
          </button>
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
                        ? "bg-brand-teal/10 text-brand-primary border border-brand-teal/20"
                        : "text-gray-600 hover:bg-brand-light hover:text-brand-primary"
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Connectivity Status */}
        <div className="p-4 border-t border-gray-200">
          <ConnectivityStatus className="justify-center" showDetails={true} />
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start gap-3 text-gray-600 hover:text-gray-900 py-2"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Sair</span>
          </Button>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="mobile-header block lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="p-2"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menu</span>
              </Button>
              <Logo
                variant="primary"
                size="md"
                showText={false}
                className="flex items-center"
              />
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
            <div className="w-64 h-full bg-white border-r border-gray-200 flex flex-col pt-8">
              {/* Header */}
              <div className="p-3 border-b border-gray-200">
                {/* Header do menu lateral - removido WhiteX */}
              </div>

              {/* User Profile */}
              <div className="p-6 border-b border-gray-200">
                <button
                  onClick={() => {
                    navigate(profilePath);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive(profilePath)
                      ? "bg-brand-teal/10 text-brand-primary border border-brand-teal/20"
                      : "text-gray-600 hover:bg-brand-light hover:text-brand-primary"
                  }`}
                >
                  <div className="w-8 h-8 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center border border-gray-200">
                    {profileImage ? (
                      <SafeImage
                        src={profileImage}
                        alt="Foto de perfil"
                        className="w-full h-full object-cover"
                        onError={() => setProfileImage(null)}
                        placeholder={<User className="w-4 h-4 text-gray-600" />}
                      />
                    ) : (
                      <User className="w-4 h-4 text-gray-600" />
                    )}
                  </div>
                  <span className="text-sm truncate">Meu Perfil</span>
                </button>
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
                              ? "bg-brand-teal/10 text-brand-primary border border-brand-teal/20"
                              : "text-gray-600 hover:bg-brand-light hover:text-brand-primary"
                          }`}
                        >
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              {/* Connectivity Status */}
              <div className="p-4 border-t border-gray-200">
                <ConnectivityStatus
                  className="justify-center"
                  showDetails={false}
                />
              </div>

              {/* Logout */}
              <div className="p-4 border-t border-gray-200">
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="w-full justify-start gap-3 text-gray-600 hover:text-gray-900 py-2"
                >
                  <LogOut className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Sair</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-auto mobile-content mobile-page-content">
          <div className="ios-safe-content">{children}</div>
        </div>

        <LogoutConfirmDialog
          open={showLogoutDialog}
          onOpenChange={setShowLogoutDialog}
          onConfirm={confirmLogout}
          userType={userProfession === "paciente" ? "paciente" : "médico"}
        />
      </div>
    </div>
  );
};

export default MobileLayout;
