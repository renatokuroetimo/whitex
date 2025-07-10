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
    // Só redireciona se não estiver carregando e estiver na página inicial
    if (!isLoading && location.pathname === "/") {
      if (isAuthenticated && user) {
        // Redireciona para o dashboard apropriado baseado na profissão
        if (user.profession === "paciente") {
          navigate("/patient-dashboard", { replace: true });
        } else if (user.profession === "medico") {
          navigate("/dashboard", { replace: true });
        } else {
          // Se tem usuário mas sem profissão definida, vai para seleção
          navigate("/select-profession", { replace: true });
        }
      }
      // Se não está autenticado, permanece na página de cadastro (/)
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
