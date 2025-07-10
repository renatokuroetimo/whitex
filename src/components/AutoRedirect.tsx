import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContextHybrid";
import { isMobileApp } from "@/lib/mobile-utils";

interface AutoRedirectProps {
  children: React.ReactNode;
}

const AutoRedirect: React.FC<AutoRedirectProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("🔄 AutoRedirect useEffect:", {
      isLoading,
      isAuthenticated,
      userEmail: user?.email,
      profession: user?.profession,
      pathname: location.pathname,
      isMobile: isMobileApp(),
    });

    // Só redireciona se não estiver carregando e estiver na página inicial
    if (!isLoading && location.pathname === "/") {
      if (isAuthenticated && user) {
        console.log("✅ User is authenticated, checking redirect logic");

        // Mobile app: handle doctor access but don't logout here to avoid session issues
        if (isMobileApp() && user.profession === "medico") {
          console.log("🚫 Mobile app: doctor detected, staying on main page");
          // Just don't redirect, let them see the mobile notice on the main page
          // Don't logout here as it interferes with session persistence
          return;
        }

        // Redireciona para o dashboard apropriado baseado na profissão
        if (user.profession === "paciente") {
          console.log("🏠 Redirecting patient to dashboard");
          navigate("/patient-dashboard", { replace: true });
        } else if (user.profession === "medico") {
          console.log("🏥 Redirecting doctor to dashboard");
          navigate("/dashboard", { replace: true });
        } else {
          console.log("❓ User has no profession defined");
          // Se tem usuário mas sem profissão definida
          if (isMobileApp()) {
            // Mobile: força cadastro como paciente
            console.log("📱 Mobile: staying on registration page");
            navigate("/", { replace: true });
          } else {
            // Web: vai para seleção de profissão
            console.log("💻 Web: redirecting to profession selection");
            navigate("/select-profession", { replace: true });
          }
        }
      } else {
        console.log("❌ User not authenticated or no user data");
      }
      // Se não está autenticado, permanece na página de cadastro (/)
    } else {
      console.log("⏭️ Skipping redirect:", {
        reason: isLoading ? "still loading" : "not on home page",
        pathname: location.pathname,
      });
    }
  }, [isAuthenticated, isLoading, user, navigate, location.pathname]);

  // Enquanto está verificando a autenticação na página inicial, mostra loading
  if (isLoading && location.pathname === "/") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-light via-white to-brand-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-brand-teal border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-brand-primary">Verificando sessão...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AutoRedirect;
