import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContextHybrid";

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
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Acesso Restrito
          </h1>
          <p className="text-gray-600 mb-6">
            Este aplicativo é exclusivo para pacientes.
          </p>
          <button
            onClick={() => (window.location.href = "/login")}
            className="bg-[#00B1BB] text-white px-6 py-2 rounded-lg"
          >
            Fazer Login como Paciente
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRouteMobile;
