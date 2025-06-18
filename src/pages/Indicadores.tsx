import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { indicatorAPI } from "@/lib/indicator-api";
import { IndicatorWithDetails } from "@/lib/indicator-types";
import { toast } from "@/hooks/use-toast";

const Indicadores = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [indicators, setIndicators] = useState<IndicatorWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("Indicadores useEffect - user:", user);

    if (user) {
      // Redirect patients to their indicators page
      if (user.profession === "paciente") {
        console.log("Redirecting patient to /patient/indicadores");
        navigate("/patient/indicadores", { replace: true });
        return;
      }
      if (user.profession === "medico") {
        console.log("Loading indicators for doctor");
        loadIndicators();
      }
    } else {
      console.log("No user found, setting loading to false");
      setIsLoading(false);
    }
  }, [user, navigate]);

  const loadIndicators = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const result = await indicatorAPI.getIndicators(user.id);
      setIndicators(result);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar indicadores",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateIndicator = () => {
    navigate("/indicadores/criar");
  };

  const handleViewCreatedIndicators = () => {
    navigate("/indicadores/criados");
  };

  const handleStandardIndicators = () => {
    navigate("/indicadores/padrao");
  };

  console.log("Rendering Indicadores - user:", user, "isLoading:", isLoading);

  // Show loading while user is being fetched
  if (!user && isLoading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-gray-600">Carregando usuário...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if no user
  if (!user) {
    navigate("/login", { replace: true });
    return null;
  }

  // Patients are redirected in useEffect - show loading briefly
  if (user.profession === "paciente") {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-gray-600">Redirecionando...</p>
        </div>
      </div>
    );
  }

  // Only doctors should see this page
  if (user.profession !== "medico") {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">
            Acesso não autorizado para: {user.profession}
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-4 text-blue-600"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">
              Indicadores
            </h1>
            <button
              onClick={() => navigate("/dashboard")}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              ← Voltar
            </button>
          </div>

          {/* Content Cards */}
          <div className="space-y-4 max-w-2xl">
            {/* Criar indicadores */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-1">
                    Criar indicadores
                  </h2>
                  <p className="text-sm text-gray-600">
                    Crie novos indicadores personalizados para seus pacientes
                  </p>
                </div>
                <Button
                  onClick={handleCreateIndicator}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Criar
                </Button>
              </div>
            </div>

            {/* Ver indicadores criados */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-1">
                    Ver indicadores criados
                  </h2>
                  <p className="text-sm text-gray-600">
                    {isLoading
                      ? "Carregando..."
                      : `${indicators.length} indicador(es) criado(s)`}
                  </p>
                </div>
                <Button
                  onClick={handleViewCreatedIndicators}
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  Ver
                </Button>
              </div>
            </div>

            {/* Indicadores Padrão */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-1">
                    Indicadores Padrão
                  </h2>
                  <p className="text-sm text-gray-600">
                    Visualize indicadores pré-definidos do sistema
                  </p>
                </div>
                <Button
                  onClick={handleViewStandardIndicators}
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  Ver
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Indicadores;
