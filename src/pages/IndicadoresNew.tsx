import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { indicatorAPI } from "@/lib/indicator-api";
import { IndicatorWithDetails } from "@/lib/indicator-types";
import { toast } from "@/hooks/use-toast";
import { Plus, BarChart3, Eye } from "lucide-react";

const IndicadoresNew = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [indicators, setIndicators] = useState<IndicatorWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Redirect patients immediately
    if (user?.profession === "paciente") {
      navigate("/patient/indicadores", { replace: true });
      return;
    }

    // Load indicators for doctors
    if (user?.profession === "medico") {
      loadIndicators();
    } else {
      setIsLoading(false);
    }
  }, [user, navigate]);

  const loadIndicators = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      const result = await indicatorAPI.getIndicators(user.id);
      setIndicators(result);
    } catch (error) {
      console.error("Error loading indicators:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar indicadores",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render anything for patients (they get redirected)
  if (user?.profession === "paciente") {
    return null;
  }

  // Show unauthorized for non-doctors
  if (user && user.profession !== "medico") {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Acesso não autorizado
          </h2>
          <p className="text-gray-600 mb-4">
            Esta página é apenas para médicos.
          </p>
          <Button onClick={() => navigate("/dashboard")}>
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Show loading while authenticating
  if (!user) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-gray-600">Carregando...</p>
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
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Plus className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-1">
                      Criar indicadores
                    </h2>
                    <p className="text-sm text-gray-600">
                      Crie novos indicadores personalizados para seus pacientes
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate("/indicadores/criar")}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Criar
                </Button>
              </div>
            </div>

            {/* Ver indicadores criados */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Eye className="w-6 h-6 text-green-600" />
                  </div>
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
                </div>
                <Button
                  onClick={() => navigate("/indicadores/criados")}
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-50"
                >
                  Ver
                </Button>
              </div>
            </div>

            {/* Indicadores Padrão */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-1">
                      Indicadores Padrão
                    </h2>
                    <p className="text-sm text-gray-600">
                      Visualize indicadores pré-definidos do sistema
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate("/indicadores/padrao")}
                  variant="outline"
                  className="border-purple-600 text-purple-600 hover:bg-purple-50"
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

export default IndicadoresNew;
