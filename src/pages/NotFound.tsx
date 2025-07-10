import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContextHybrid";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
    console.log("📊 Debug info:", {
      pathname: location.pathname,
      search: location.search,
      isAuthenticated,
      userProfession: user?.profession,
      userId: user?.id,
    });
  }, [location.pathname, location.search, isAuthenticated, user]);

  const handleGoToDashboard = () => {
    if (isAuthenticated && user) {
      if (user.profession === "paciente") {
        navigate("/patient-dashboard", { replace: true });
      } else if (user.profession === "medico") {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/select-profession", { replace: true });
      }
    } else {
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center max-w-md mx-auto p-6">
        <h1 className="text-4xl font-bold mb-4 text-gray-800">404</h1>
        <p className="text-xl text-gray-600 mb-6">Página não encontrada</p>
        <p className="text-sm text-gray-500 mb-6">
          A página "{location.pathname}" não existe.
        </p>
        <div className="space-y-3">
          <Button
            onClick={handleGoToDashboard}
            className="w-full bg-[#00B1BB] hover:bg-[#01485E]"
          >
            {isAuthenticated && user
              ? user.profession === "paciente"
                ? "Ir para Dashboard do Paciente"
                : "Ir para Dashboard do Médico"
              : "Voltar ao Início"}
          </Button>
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="w-full"
          >
            Voltar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
