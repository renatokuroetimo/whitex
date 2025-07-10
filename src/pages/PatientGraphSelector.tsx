import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, TrendingUp, BarChart3, Plus } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import MobileLayout from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContextHybrid";
import { patientAPI } from "@/lib/patient-api";
import { patientIndicatorAPI } from "@/lib/patient-indicator-api";
import { Patient } from "@/lib/patient-types";
import { PatientIndicatorValue } from "@/lib/patient-indicator-types";
import { toast } from "@/hooks/use-toast";

interface IndicatorSummary {
  categoryName: string;
  subcategoryName: string;
  parameter: string;
  unitSymbol: string;
  count: number;
  latestValue: string;
  latestDate: string;
  firstIndicatorId: string;
}

const PatientGraphSelector = () => {
  const navigate = useNavigate();
  const { patientId } = useParams<{ patientId: string }>();
  const { user } = useAuth();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [indicators, setIndicators] = useState<PatientIndicatorValue[]>([]);
  const [indicatorSummaries, setIndicatorSummaries] = useState<
    IndicatorSummary[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  // Detectar se está sendo acessado pelo sistema hospitalar
  const isHospitalContext =
    window.location.pathname.includes("/gerenciamento/");

  useEffect(() => {
    if (
      patientId ||
      (user?.profession === "paciente" && user?.id) ||
      (isHospitalContext && patientId)
    ) {
      loadData();
    }
  }, [patientId, user]);

  const loadData = async () => {
    // Determinar qual ID usar - patientId da URL ou ID do usuário logado
    const targetPatientId = patientId || user?.id;
    if (!targetPatientId) return;

    // Em contexto hospitalar, verificar se há sessão hospitalar
    if (isHospitalContext) {
      const hospitalData = localStorage.getItem("hospital_session");
      if (!hospitalData) return;
    }

    setIsLoading(true);
    try {
      // Se é paciente próprio, não precisa carregar dados do paciente
      const shouldLoadPatientData =
        !!patientId && (user?.profession === "medico" || isHospitalContext);

      const [patientData, indicatorValues] = await Promise.all([
        shouldLoadPatientData
          ? isHospitalContext
            ? patientAPI.getPatientByIdForHospital(targetPatientId)
            : patientAPI.getPatientById(targetPatientId)
          : Promise.resolve(null),
        patientIndicatorAPI.getPatientIndicatorValues(targetPatientId),
      ]);

      // Só verificar se paciente não foi encontrado quando estamos carregando dados de outro paciente
      if (shouldLoadPatientData && !patientData) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Paciente não encontrado",
        });
        navigate(isHospitalContext ? "/gerenciamento/patients" : "/pacientes");
        return;
      }

      if (shouldLoadPatientData) {
        setPatient(patientData);
      }
      setIndicators(indicatorValues);

      // Agrupar indicadores por tipo
      const summaries = groupIndicatorsByType(indicatorValues);
      setIndicatorSummaries(summaries);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar dados do paciente",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const groupIndicatorsByType = (
    indicators: PatientIndicatorValue[],
  ): IndicatorSummary[] => {
    const groups: { [key: string]: PatientIndicatorValue[] } = {};

    // Agrupar por categoria + subcategoria + parâmetro
    indicators.forEach((indicator) => {
      const key = `${indicator.categoryName}|${indicator.subcategoryName}|${indicator.parameter}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(indicator);
    });

    // Criar sumários
    const summaries: IndicatorSummary[] = Object.entries(groups).map(
      ([key, indicatorGroup]) => {
        const [categoryName, subcategoryName, parameter] = key.split("|");

        // Ordenar por data/hora mais recente
        const sorted = indicatorGroup.sort((a, b) => {
          const aDateTime = new Date(
            `${a.date || "1970-01-01"} ${a.time || "00:00"}`,
          );
          const bDateTime = new Date(
            `${b.date || "1970-01-01"} ${b.time || "00:00"}`,
          );
          return bDateTime.getTime() - aDateTime.getTime();
        });

        const latest = sorted[0];

        return {
          categoryName,
          subcategoryName,
          parameter,
          unitSymbol: latest.unitSymbol,
          count: indicatorGroup.length,
          latestValue: latest.value,
          latestDate: latest.date || "Não informado",
          firstIndicatorId: latest.id,
        };
      },
    );

    // Ordenar por categoria e depois por subcategoria
    return summaries.sort((a, b) => {
      if (a.categoryName !== b.categoryName) {
        return a.categoryName.localeCompare(b.categoryName);
      }
      return a.subcategoryName.localeCompare(b.subcategoryName);
    });
  };

  const handleViewGraph = (summary: IndicatorSummary) => {
    const params = new URLSearchParams({
      category: summary.categoryName,
      subcategory: summary.subcategoryName,
      parameter: summary.parameter,
      unit: summary.unitSymbol,
    });

    if (patientId) {
      if (isHospitalContext) {
        // Hospital visualizando gráfico de paciente
        navigate(
          `/gerenciamento/patients/${patientId}/graficos/visualizar?${params.toString()}`,
        );
      } else {
        // Médico visualizando gráfico de paciente
        navigate(
          `/pacientes/${patientId}/graficos/visualizar?${params.toString()}`,
        );
      }
    } else {
      // Paciente visualizando próprio gráfico
      navigate(`/patient/graficos/visualizar?${params.toString()}`);
    }
  };

  const handleBack = () => {
    if (patientId) {
      if (isHospitalContext) {
        // Hospital voltando para indicadores do paciente
        navigate(`/gerenciamento/patients/${patientId}/indicadores`);
      } else {
        // Médico voltando para indicadores do paciente
        navigate(`/pacientes/${patientId}/indicadores`);
      }
    } else {
      // Paciente voltando para próprios indicadores
      navigate("/patient/indicadores");
    }
  };

  const formatDate = (dateStr: string) => {
    if (dateStr === "Não informado") return dateStr;
    return new Date(dateStr).toLocaleDateString("pt-BR");
  };

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-gray-600">Carregando gráficos...</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  // Só mostrar erro se esperávamos carregar dados do paciente mas não conseguimos
  if (patientId && !patient) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      {!isHospitalContext && (
        <div className="hidden lg:block">
          <Sidebar />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {patientId
                    ? `Gráficos de ${patient?.name || "Paciente"}`
                    : "Meus Gráficos"}
                </h1>
                <p className="text-sm text-gray-600">
                  Selecione um tipo de indicador para visualizar a progressão
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          {indicatorSummaries.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum gráfico disponível
                </h3>
                <p className="text-gray-600 mb-6">
                  {patientId
                    ? `${patient?.name || "Este paciente"} precisa ter pelo menos um indicador registrado para visualizar gráficos de progressão.`
                    : "Você precisa ter pelo menos um indicador registrado para visualizar gráficos de progressão."}
                </p>
                <Button
                  onClick={() =>
                    patientId
                      ? navigate(`/pacientes/${patientId}/adicionar-indicador`)
                      : navigate("/patient/adicionar-indicador")
                  }
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Indicador
                </Button>
              </div>
            </div>
          ) : (
            /* Indicators Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {indicatorSummaries.map((summary, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">
                        {summary.subcategoryName}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {summary.parameter}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {summary.categoryName}
                      </Badge>
                    </div>
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Registros:</span>
                      <span className="font-medium">{summary.count}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Último valor:</span>
                      <span className="font-medium">
                        {summary.latestValue} {summary.unitSymbol}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Última data:</span>
                      <span className="font-medium">
                        {formatDate(summary.latestDate)}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleViewGraph(summary)}
                    className="w-full bg-[#00B1BB] hover:bg-[#01485E] text-white"
                    disabled={summary.count < 2}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    {summary.count < 2
                      ? "Precisa de 2+ registros"
                      : "Ver Gráfico"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientGraphSelector;
