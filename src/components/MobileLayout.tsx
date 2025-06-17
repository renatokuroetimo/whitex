import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Users, BarChart3, LogOut, User, Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path: string;
}

const sidebarItems: SidebarItem[] = [
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

interface MobileLayoutProps {
  children: React.ReactNode;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
    setIsMobileMenuOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-64 flex-col bg-white border-r border-gray-200">
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
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" />
              </div>
              <span className="text-sm text-gray-600 truncate">Meu Perfil</span>
            </div>
            <button
              onClick={() => navigate("/profile")}
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
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors ${
                      active
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
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
            className="w-full justify-start gap-3 text-gray-600 hover:text-gray-900 py-3"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="truncate">Sair</span>
          </Button>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
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

              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-900 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">W</span>
                </div>
                <span className="font-semibold text-gray-900">WHITEX</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
            <div className="w-64 h-full bg-white border-r border-gray-200 flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-900 rounded flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        W
                      </span>
                    </div>
                    <span className="font-semibold text-gray-900">WHITEX</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    ×
                  </Button>
                </div>
              </div>

              {/* User Profile */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <span className="text-sm text-gray-600 truncate">
                      Meu Perfil
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      navigate("/profile");
                      setIsMobileMenuOpen(false);
                    }}
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
                          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors ${
                            active
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          <Icon className="w-5 h-5 flex-shrink-0" />
                          <span className="truncate">{item.label}</span>
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
                  className="w-full justify-start gap-3 text-gray-600 hover:text-gray-900 py-3"
                >
                  <LogOut className="w-5 h-5 flex-shrink-0" />
                  <span className="truncate">Sair</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
};

export default MobileLayout;
