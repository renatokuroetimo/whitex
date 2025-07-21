import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContextHybrid";
import MobileAccessRestricted from "./MobileAccessRestricted";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredProfession?: "paciente";
}

const ProtectedRouteMobile = ({
  children,
  requiredProfession,
}: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // No app móvel, apenas pacientes podem acessar
  if (requiredProfession && user.profession !== requiredProfession) {
    return <Navigate to="/login" replace />;
  }

  // Bloquear acesso de outros tipos de usuário
  if (user.profession !== "paciente") {
    return (
      <MobileAccessRestricted
        title="Acesso Restrito"
        message="Este aplicativo é exclusivo para pacientes."
        actionText="Fazer Login como Paciente"
        actionPath="/login"
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRouteMobile;
