import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Activity, TrendingUp } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { indicatorAPI } from "@/lib/indicator-api";
import { patientIndicatorAPI } from "@/lib/patient-indicator-api";
import { PatientIndicatorValue } from "@/lib/patient-indicator-types";
import { toast } from "@/hooks/use-toast";

const PatientIndicators = () => {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const { user } = useAuth();
  const [indicators, setIndicators] = useState<PatientIndicatorValue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadIndicators();
    }
  }, [user, patientId]);

  const loadIndicators = async () => {
    if (!user?.id) return;

    // Determinar qual ID de paciente usar
    const targetPatientId = patientId || user.id;

    setIsLoading(true);
    try {
      const indicatorValues =
        await patientIndicatorAPI.getPatientIndicatorValues(targetPatientId);
      setIndicators(indicatorValues);
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

  const handleAddIndicator = () => {
    if (isViewingOtherPatient) {
      navigate(`/pacientes/${patientId}/adicionar-indicador`);
    } else {
      navigate("/patient/adicionar-indicador");
    }
  };

  const handleViewGraphs = () => {
    if (isViewingOtherPatient) {
      navigate(`/pacientes/${patientId}/graficos`);
    } else {
      navigate("/patient/graficos");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR");
  };

  // Determinar contexto de visualização
  const isViewingOtherPatient = patientId && user?.profession === "medico";
  const isOwnIndicators = !patientId && user?.profession === "paciente";

  // Redirecionar se acesso inválido
  if (!isViewingOtherPatient && !isOwnIndicators) {
    if (user?.profession === "medico") {
      navigate("/pacientes");
    } else if (user?.profession === "paciente") {
      navigate("/patient-dashboard");
    } else {
      navigate("/dashboard");
    }
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-gray-600">Carregando indicadores...</p>
          </div>
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
            <div className="flex items-center gap-4">
              <button
                onClick={() =>
                  navigate(
                    isViewingOtherPatient
                      ? `/pacientes/${patientId}`
                      : "/patient-dashboard",
                  )
                }
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <h1 className="text-2xl font-semibold text-gray-900">
                {isViewingOtherPatient
                  ? "Indicadores do Paciente"
                  : "Meus Indicadores"}
              </h1>
            </div>
            <div className="flex gap-3">
              {indicators.length > 0 && (
                <Button
                  onClick={handleViewGraphs}
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Ver Gráficos
                </Button>
              )}
              {!isViewingOtherPatient && (
                <Button
                  onClick={handleAddIndicator}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Registro
                </Button>
              )}
            </div>
          </div>

          {/* Content */}
          {indicators.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum indicador registrado
                </h3>
                <p className="text-gray-600 mb-6">
                  {isViewingOtherPatient
                    ? "Este paciente ainda não registrou nenhum indicador."
                    : "Comece a registrar seus indicadores de saúde para acompanhar sua evolução e compartilhar com seus médicos."}
                </p>
                {!isViewingOtherPatient && (
                  <Button
                    onClick={handleAddIndicator}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Registrar Primeiro Indicador
                  </Button>
                )}
              </div>
            </div>
          ) : (
            /* Indicators List */
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Registros de Indicadores ({indicators.length})
                  </h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                          Indicador
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                          Valor
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                          Data
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                          Registrado em
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {indicators.map((indicator) => (
                        <tr
                          key={indicator.id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-3 px-4">
                            <div>
                              <span className="text-sm font-medium text-gray-900">
                                {indicator.categoryName} -{" "}
                                {indicator.subcategoryName}
                              </span>
                              <p className="text-xs text-gray-600">
                                {indicator.parameter}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm font-medium text-gray-900">
                              {indicator.value} {indicator.unitSymbol}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-600">
                              {indicator.date
                                ? formatDate(indicator.date)
                                : "Não informado"}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-600">
                              {formatDate(indicator.createdAt)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientIndicators;
