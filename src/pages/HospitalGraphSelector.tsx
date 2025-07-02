import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, BarChart3, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { hospitalPatientAPI } from "@/lib/hospital-patient-api";
import { patientIndicatorAPI } from "@/lib/patient-indicator-api";
import { PatientIndicatorValue } from "@/lib/patient-indicator-types";
import { toast } from "@/hooks/use-toast";
import SupabaseStatus from "@/components/SupabaseStatus";

interface Hospital {
  id: string;
  name: string;
  email: string;
}

interface IndicatorSummary {
  categoryName: string;
  subcategoryName: string;
  parameter: string;
  unitSymbol: string;
  count: number;
  patientCount: number;
  latestValue: string;
  latestDate: string;
  firstIndicatorId: string;
}

const HospitalGraphSelector = () => {
  const navigate = useNavigate();
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [indicators, setIndicators] = useState<PatientIndicatorValue[]>([]);
  const [indicatorSummaries, setIndicatorSummaries] = useState<
    IndicatorSummary[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasConnectivityError, setHasConnectivityError] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Buscar dados do hospital logado
      const hospitalData = JSON.parse(
        localStorage.getItem("hospital_session") || "null",
      );
      if (!hospitalData) {
        toast({
          title: "Erro",
          description: "Dados do hospital não encontrados",
          variant: "destructive",
        });
        navigate("/gerenciamento");
        return;
      }
      setHospital(hospitalData);

      // Buscar todos os pacientes do hospital
      console.log("🔍 Carregando pacientes do hospital:", hospitalData.id);
      const patients = await hospitalPatientAPI.getPatientsByHospital(
        hospitalData.id,
      );
      console.log("✅ Pacientes carregados:", patients.length);

      // Buscar todos os indicadores de todos os pacientes
      const allIndicators: PatientIndicatorValue[] = [];
      for (const patient of patients) {
        try {
          const patientIndicators =
            await patientIndicatorAPI.getPatientIndicatorValues(patient.id);
          allIndicators.push(...patientIndicators);
        } catch (error) {
          console.log(`Erro ao buscar indicadores do paciente ${patient.id}`);
        }
      }
      setIndicators(allIndicators);

      // Agrupar indicadores por categoria/subcategoria/parâmetro
      const summaryMap = new Map<string, IndicatorSummary>();

      allIndicators.forEach((indicator) => {
        const key = `${indicator.categoryName}-${indicator.subcategoryName}-${indicator.parameter}`;

        if (!summaryMap.has(key)) {
          summaryMap.set(key, {
            categoryName: indicator.categoryName,
            subcategoryName: indicator.subcategoryName,
            parameter: indicator.parameter,
            unitSymbol: indicator.unitSymbol,
            count: 0,
            patientCount: 0,
            latestValue: indicator.value,
            latestDate: indicator.createdAt,
            firstIndicatorId: indicator.id,
          });
        }

        const summary = summaryMap.get(key)!;
        summary.count++;

        // Verificar se é o valor mais recente
        if (new Date(indicator.createdAt) > new Date(summary.latestDate)) {
          summary.latestValue = indicator.value;
          summary.latestDate = indicator.createdAt;
        }
      });

      // Contar pacientes únicos por indicador
      summaryMap.forEach((summary, key) => {
        const indicatorsForType = allIndicators.filter(
          (ind) =>
            `${ind.categoryName}-${ind.subcategoryName}-${ind.parameter}` ===
            key,
        );
        const uniquePatients = new Set(
          indicatorsForType.map((ind) => ind.patientId),
        );
        summary.patientCount = uniquePatients.size;
      });

      setIndicatorSummaries(Array.from(summaryMap.values()));
    } catch (error) {
      console.error("❌ Erro ao carregar dados do hospital:", error);

      let errorMessage = "Erro ao carregar dados dos indicadores";
      let isConnectivityError = false;

      if (error instanceof Error) {
        if (
          error.message.includes("conectividade") ||
          error.message.includes("Failed to fetch")
        ) {
          errorMessage = "Problema de conectividade com a base de dados.";
          isConnectivityError = true;
        } else if (error.message.includes("hospital")) {
          errorMessage = error.message;
        }
      }

      setHasConnectivityError(isConnectivityError);

      if (!isConnectivityError) {
        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive",
        });
      }

      // Set empty data to show empty state instead of infinite loading
      setIndicators([]);
      setIndicatorSummaries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewChart = (summary: IndicatorSummary) => {
    const params = new URLSearchParams({
      categoryName: summary.categoryName,
      subcategoryName: summary.subcategoryName,
      parameter: summary.parameter,
      unitSymbol: summary.unitSymbol,
    });

    navigate(`/gerenciamento/patients/graphs/view?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-gray-600">Carregando gráficos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate("/gerenciamento/patients")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar aos Pacientes
          </Button>

          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Gráficos - {hospital?.name}
              </h1>
              <p className="text-gray-600">
                Selecione um tipo de indicador para visualizar a evolução de
                todos os pacientes
              </p>
            </div>
          </div>
        </div>

        {/* Indicators Grid */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-lg">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-800">
                Indicadores Disponíveis ({indicatorSummaries.length})
              </h2>
            </div>

            {indicatorSummaries.length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum indicador encontrado
                </h3>
                <p className="text-gray-500">
                  Os indicadores aparecerão aqui quando os pacientes tiverem
                  dados registrados.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {indicatorSummaries.map((summary, index) => (
                  <div
                    key={`${summary.categoryName}-${summary.subcategoryName}-${summary.parameter}-${index}`}
                    className="group border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer bg-white"
                    onClick={() => handleViewChart(summary)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200 truncate">
                          {summary.parameter}
                        </h3>
                        <div className="flex flex-col gap-1 mt-1">
                          <Badge
                            variant="secondary"
                            className="text-xs w-fit bg-blue-50 text-blue-700"
                          >
                            {summary.categoryName}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-xs w-fit border-blue-200 text-blue-600"
                          >
                            {summary.subcategoryName}
                          </Badge>
                        </div>
                      </div>
                      <TrendingUp className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-200 flex-shrink-0 ml-2" />
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Pacientes:</span>
                        <span className="font-medium">
                          {summary.patientCount}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total registros:</span>
                        <span className="font-medium">{summary.count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Último valor:</span>
                        <span className="font-medium">
                          {summary.latestValue} {summary.unitSymbol}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Última atualização:</span>
                        <span className="font-medium">
                          {new Date(summary.latestDate).toLocaleDateString(
                            "pt-BR",
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          Clique para ver gráfico
                        </span>
                        <TrendingUp className="h-4 w-4 text-blue-500 group-hover:translate-x-1 transition-transform duration-200" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalGraphSelector;
