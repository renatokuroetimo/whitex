import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Activity, TrendingUp, Calendar, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { patientIndicatorAPI } from "@/lib/patient-indicator-api";
import { PatientIndicatorValue } from "@/lib/patient-indicator-types";
import MobileLayout from "@/components/MobileLayout";
import { toast } from "@/hooks/use-toast";

const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentIndicators, setRecentIndicators] = useState<
    PatientIndicatorValue[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id && user.profession === "paciente") {
      loadRecentIndicators();
    }
  }, [user]);

  const loadRecentIndicators = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const allIndicators = await patientIndicatorAPI.getPatientIndicatorValues(
        user.id,
      );
      // Pegar os 6 registros mais recentes
      const recent = allIndicators.slice(0, 6);
      setRecentIndicators(recent);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar indicadores recentes",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const handleViewAllIndicators = () => {
    navigate("/patient/indicadores");
  };

  const handleAddIndicator = () => {
    navigate("/patient/adicionar-indicador");
  };

  const handleViewProfile = () => {
    navigate("/patient-profile");
  };

  if (!user) {
    return null;
  }

  return (
    <MobileLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6 sm:mb-8">
          Dashboard - Paciente
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Informações da Conta */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-medium text-gray-900 mb-4">
              Informações da Conta
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Tipo:</strong> Paciente
              </p>
              <p>
                <strong>Conta criada:</strong>{" "}
                {new Date(user.createdAt).toLocaleDateString("pt-BR")}
              </p>
            </div>
            <Button
              onClick={handleViewProfile}
              variant="outline"
              className="w-full mt-4"
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver Perfil Completo
            </Button>
          </div>

          {/* Ver Todos os Indicadores */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-medium text-gray-900 mb-4">Meus Indicadores</h3>
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-gray-500 text-sm mb-4">
                Visualize todo seu histórico
              </p>
              <Button
                onClick={handleViewAllIndicators}
                variant="outline"
                className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                Ver Indicadores
              </Button>
            </div>
          </div>
        </div>

        {/* Registros Recentes */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Registros Recentes
            </h2>
            {recentIndicators.length > 0 && (
              <Button
                onClick={handleViewAllIndicators}
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-800"
              >
                Ver todos
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-gray-600">Carregando registros...</p>
            </div>
          ) : recentIndicators.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum registro ainda
              </h3>
              <p className="text-gray-600 mb-6">
                Comece registrando seus primeiros indicadores de saúde.
              </p>
              <Button
                onClick={handleAddIndicator}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Registro
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentIndicators.map((indicator) => (
                <div
                  key={indicator.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={handleViewAllIndicators}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">
                        {indicator.categoryName}
                      </h4>
                      <p className="text-xs text-gray-600">
                        {indicator.subcategoryName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {indicator.unitSymbol}
                      </Badge>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-xs text-gray-600 mb-1">
                      {indicator.parameter}
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {indicator.value} {indicator.unitSymbol}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {indicator.date
                          ? formatDate(indicator.date)
                          : formatDate(indicator.createdAt)}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1 text-blue-600 hover:text-blue-800"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewAllIndicators();
                      }}
                    >
                      <TrendingUp className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
};

export default PatientDashboard;
