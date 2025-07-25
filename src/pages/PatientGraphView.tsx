import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  Stethoscope,
  Loader2,
  X,
} from "lucide-react";
import MobileLayout from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { FormattedChatGPTText } from "@/lib/markdown-formatter";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useAuth } from "@/contexts/AuthContextHybrid";
import { patientAPI } from "@/lib/patient-api";
import { patientIndicatorAPI } from "@/lib/patient-indicator-api";
import { Patient } from "@/lib/patient-types";
import { PatientIndicatorValue } from "@/lib/patient-indicator-types";
import { toast } from "@/hooks/use-toast";

interface ChartDataPoint {
  date: string;
  value: number;
  formattedDate: string;
  originalDate: string;
  time?: string;
}

const PatientGraphView = () => {
  const navigate = useNavigate();
  const { patientId } = useParams<{ patientId: string }>();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [indicators, setIndicators] = useState<PatientIndicatorValue[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [timeRange, setTimeRange] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  // Detectar se está sendo acessado pelo sistema hospitalar
  const isHospitalContext =
    window.location.pathname.includes("/gerenciamento/");

  // Diagnosis modal state
  const [showDiagnosisModal, setShowDiagnosisModal] = useState(false);
  const [diagnosisQuestion, setDiagnosisQuestion] = useState("");
  const [isDiagnosisLoading, setIsDiagnosisLoading] = useState(false);
  const [showDiagnosisResult, setShowDiagnosisResult] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState("");
  const [hasLoadingError, setHasLoadingError] = useState(false);

  // Get parameters from localStorage (mobile-friendly) or URL fallback
  const [graphParams, setGraphParams] = useState({
    category: "",
    subcategory: "",
    parameter: "",
    unit: "",
  });

  // Load graph parameters
  React.useEffect(() => {
    // Try to get from localStorage first (mobile compatibility)
    try {
      const storedParams = localStorage.getItem("currentGraphParams");
      if (storedParams) {
        const parsed = JSON.parse(storedParams);
        setGraphParams({
          category: parsed.category || "",
          subcategory: parsed.subcategory || "",
          parameter: parsed.parameter || "",
          unit: parsed.unit || "",
        });
        console.log("📱 Loaded graph params from localStorage:", parsed);
        return;
      }
    } catch (error) {
      console.warn("Failed to parse stored graph params:", error);
    }

    // Fallback to URL parameters
    const urlCategory = searchParams.get("category") || "";
    const urlSubcategory = searchParams.get("subcategory") || "";
    const urlParameter = searchParams.get("parameter") || "";
    const urlUnit = searchParams.get("unit") || "";

    if (urlCategory || urlSubcategory || urlParameter || urlUnit) {
      setGraphParams({
        category: urlCategory,
        subcategory: urlSubcategory,
        parameter: urlParameter,
        unit: urlUnit,
      });
      console.log("🔗 Loaded graph params from URL:", {
        category: urlCategory,
        subcategory: urlSubcategory,
        parameter: urlParameter,
        unit: urlUnit,
      });
    }
  }, [searchParams]);

  // Debug parameters
  React.useEffect(() => {
    console.log("🔍 PatientGraphView current params:", {
      fullURL: window.location.href,
      searchParams: Object.fromEntries(searchParams.entries()),
      graphParams,
    });
  }, [searchParams, graphParams]);

  useEffect(() => {
    console.log("🔍 PatientGraphView useEffect triggered:", {
      patientId,
      userProfession: user?.profession,
      userId: user?.id,
      isHospitalContext,
      graphParams,
    });

    const hasValidPatient =
      patientId ||
      (user?.profession === "paciente" && user?.id) ||
      (isHospitalContext && patientId);

    const hasAllParams =
      graphParams.category &&
      graphParams.subcategory &&
      graphParams.parameter &&
      graphParams.unit;

    console.log("📊 Graph load conditions:", {
      hasValidPatient,
      hasAllParams,
      willLoad: hasValidPatient && hasAllParams,
    });

    if (hasValidPatient && hasAllParams) {
      console.log("✅ Loading graph data...");
      loadData();
    } else {
      console.log("��� Not loading - missing conditions");
    }
  }, [patientId, user, graphParams, isHospitalContext]);

  useEffect(() => {
    if (indicators.length > 0) {
      processChartData();
    }
  }, [indicators, timeRange]);

  // Retry function for network errors
  const retryIndicatorValues = async (
    patientId: string,
    maxRetries: number = 3,
  ) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(
          `🔄 Tentativa ${attempt} de ${maxRetries} para carregar indicadores`,
        );
        return await patientIndicatorAPI.getPatientIndicatorValues(patientId);
      } catch (error) {
        console.warn(`❌ Tentativa ${attempt} falhou:`, error);

        if (attempt === maxRetries) {
          throw error; // Re-throw on final attempt
        }

        // Wait before retry (exponential backoff)
        const waitTime = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  };

  const loadData = async () => {
    const targetPatientId = patientId || user?.id;
    console.log("🔄 Starting loadData:", {
      targetPatientId,
      isHospitalContext,
    });

    if (!targetPatientId) {
      console.log("❌ No target patient ID found");
      return;
    }

    // Em contexto hospitalar, verificar se há sessão hospitalar
    if (isHospitalContext) {
      const hospitalData = localStorage.getItem("hospital_session");
      if (!hospitalData) {
        console.log("❌ No hospital session found");
        return;
      }
    }

    setIsLoading(true);
    setHasLoadingError(false);
    console.log("🔄 Loading patient and indicator data...");
    try {
      const shouldLoadPatientData =
        !!patientId && (user?.profession === "medico" || isHospitalContext);

      const [patientData, indicatorValues] = await Promise.all([
        shouldLoadPatientData
          ? isHospitalContext
            ? patientAPI.getPatientByIdForHospital(targetPatientId)
            : patientAPI.getPatientById(targetPatientId)
          : Promise.resolve(null),
        retryIndicatorValues(targetPatientId),
      ]);

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

      // Filtrar indicadores pelo tipo selecionado
      const filteredIndicators = indicatorValues.filter(
        (indicator) =>
          indicator.categoryName === graphParams.category &&
          indicator.subcategoryName === graphParams.subcategory &&
          indicator.parameter === graphParams.parameter,
      );

      setIndicators(filteredIndicators);
    } catch (error) {
      console.error("❌ Erro ao carregar dados:", error);
      setHasLoadingError(true);

      let errorMessage = "Erro ao carregar dados do paciente";

      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes("Failed to fetch")) {
          errorMessage =
            "Erro de conexão. Verifique sua internet e tente novamente.";
        } else if (error.message.includes("Supabase não está configurado")) {
          errorMessage = "Erro de configuração do sistema. Contate o suporte.";
        } else {
          errorMessage = `Erro: ${error.message}`;
        }
      }

      toast({
        variant: "destructive",
        title: "Erro",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const processChartData = () => {
    console.log("🔍 === DEBUG GRAPH DATA ===");
    console.log("📊 Total indicators loaded:", indicators.length);
    console.log("📊 Sample indicator:", indicators[0]);

    let filteredIndicators = [...indicators];

    // Debug: check what dates we have
    const indicatorsWithDates = filteredIndicators.filter(
      (indicator) => indicator.date,
    );
    const indicatorsWithoutDates = filteredIndicators.filter(
      (indicator) => !indicator.date,
    );

    console.log("📅 Indicators with dates:", indicatorsWithDates.length);
    console.log("❌ Indicators without dates:", indicatorsWithoutDates.length);
    console.log(
      "📅 Sample dates:",
      indicatorsWithDates.slice(0, 3).map((i) => i.date),
    );

    // Filtrar por período se não for "all"
    if (timeRange !== "all") {
      const now = new Date();
      const cutoffDate = new Date();

      switch (timeRange) {
        case "7d":
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case "30d":
          cutoffDate.setDate(now.getDate() - 30);
          break;
        case "90d":
          cutoffDate.setDate(now.getDate() - 90);
          break;
        case "1y":
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      console.log("📅 Filtering from date:", cutoffDate.toISOString());

      const beforeFilter = filteredIndicators.length;
      filteredIndicators = filteredIndicators.filter((indicator) => {
        // If no date, use createdAt as fallback
        const dateToUse = indicator.date || indicator.createdAt;
        if (!dateToUse) return false;

        const indicatorDate = new Date(dateToUse);
        const isValid = !isNaN(indicatorDate.getTime());
        const isInRange = isValid && indicatorDate >= cutoffDate;

        return isInRange;
      });

      console.log(
        "📅 After time filter:",
        beforeFilter,
        "→",
        filteredIndicators.length,
      );
    }

    // Converter para dados do gráfico
    const data: ChartDataPoint[] = filteredIndicators
      .map((indicator) => {
        // Use date if available, otherwise use createdAt
        const dateToUse = indicator.date || indicator.createdAt;
        if (!dateToUse) return null;

        const date = new Date(dateToUse);
        if (isNaN(date.getTime())) return null; // Skip invalid dates

        const value = parseFloat(indicator.value);

        return {
          date: dateToUse,
          value: isNaN(value) ? 0 : value,
          formattedDate: date.toLocaleDateString("pt-BR"),
          originalDate: dateToUse,
          time: indicator.time,
        };
      })
      .filter((item): item is ChartDataPoint => item !== null) // Remove null entries
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Ordenar por data

    console.log("📊 Final chart data points:", data.length);
    console.log("📊 Sample chart data:", data.slice(0, 3));

    setChartData(data);
  };

  const calculateTrend = () => {
    if (chartData.length < 2) return { type: "neutral", percentage: 0 };

    const firstValue = chartData[0].value;
    const lastValue = chartData[chartData.length - 1].value;

    if (firstValue === 0) return { type: "neutral", percentage: 0 };

    const percentage = ((lastValue - firstValue) / firstValue) * 100;

    if (percentage > 5) return { type: "up", percentage };
    if (percentage < -5) return { type: "down", percentage };
    return { type: "neutral", percentage };
  };

  const getStatistics = () => {
    if (chartData.length === 0) {
      return { min: 0, max: 0, avg: 0, latest: 0 };
    }

    const values = chartData.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const latest = values[values.length - 1];

    return { min, max, avg, latest };
  };

  const handleBack = () => {
    if (patientId) {
      if (isHospitalContext) {
        navigate(`/gerenciamento/patients/${patientId}/graficos`);
      } else {
        navigate(`/pacientes/${patientId}/graficos`);
      }
    } else {
      navigate("/patient/graficos");
    }
  };

  const handleDiagnosis = async () => {
    if (!diagnosisQuestion.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, digite uma pergunta.",
      });
      return;
    }

    if (chartData.length === 0) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não há dados disponíveis para análise.",
      });
      return;
    }

    setIsDiagnosisLoading(true);

    try {
      // Prepare data for API
      const tipoDado = `${graphParams.category} ${graphParams.subcategory} em ${graphParams.unit}`;
      const leituras = chartData.map((point) => ({
        data: point.originalDate.split("T")[0], // Extract date part only
        valor: point.value,
      }));

      const requestBody = {
        tipo_dado: tipoDado,
        pergunta: diagnosisQuestion,
        leituras: leituras,
      };

      console.log("Sending diagnosis request:", requestBody);

      const response = await fetch(
        "https://ai.timo.com.br/webhook/avaliar-leituras",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Diagnosis response:", result);

      // Extract the content from the response structure
      const content =
        result.choices?.[0]?.message?.content ||
        result.resposta ||
        "Resposta não encontrada";

      setDiagnosisResult(content);
      setShowDiagnosisModal(false);
      setShowDiagnosisResult(true);
      setDiagnosisQuestion("");
    } catch (error) {
      console.error("Diagnosis error:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao realizar diagnóstico. Tente novamente.",
      });
    } finally {
      setIsDiagnosisLoading(false);
    }
  };

  const handleOpenDiagnosisModal = () => {
    if (chartData.length === 0) {
      toast({
        variant: "destructive",
        title: "Sem dados",
        description: "Não há dados disponíveis para realizar diagnóstico.",
      });
      return;
    }
    setShowDiagnosisModal(true);
  };

  const trend = calculateTrend();
  const stats = getStatistics();

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-gray-600">Carregando gráfico...</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  // Só verificar paciente se esperávamos carregá-lo
  if (patientId && !patient) {
    return null;
  }

  return (
    <MobileLayout>
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
                {graphParams.subcategory} - {graphParams.parameter}
              </h1>
              <p className="text-sm text-gray-600">
                {patientId
                  ? `${patient?.name || "Paciente"} • ${graphParams.category}`
                  : `Seus dados • ${graphParams.category}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo período</SelectItem>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
                <SelectItem value="90d">Últimos 90 dias</SelectItem>
                <SelectItem value="1y">Último ano</SelectItem>
              </SelectContent>
            </Select>

            {/* Diagnosis button - only show for doctors */}
            {user?.profession === "medico" && (
              <Button
                onClick={handleOpenDiagnosisModal}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={chartData.length === 0}
              >
                <Stethoscope className="h-4 w-4 mr-2" />
                Realizar diagnóstico
              </Button>
            )}
          </div>
        </div>

        {chartData.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="max-w-md mx-auto">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {hasLoadingError
                  ? "Erro ao carregar dados"
                  : "Nenhum dado no período selecionado"}
              </h3>
              <p className="text-gray-600 mb-6">
                {hasLoadingError
                  ? "Houve um problema ao carregar os dados. Tente novamente ou verifique sua conexão."
                  : `Não há registros de ${graphParams.parameter} para o período selecionado. Tente selecionar um período maior ou adicione mais registros.`}
              </p>
              <div className="flex gap-3 justify-center">
                {hasLoadingError ? (
                  <Button
                    onClick={loadData}
                    className="bg-[#00B1BB] hover:bg-[#01485E] text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? "Carregando..." : "Tentar novamente"}
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      const addIndicatorPath = isHospitalContext
                        ? `/gerenciamento/patients/${patientId}/adicionar-indicador`
                        : `/pacientes/${patientId}/adicionar-indicador`;
                      navigate(addIndicatorPath);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Adicionar Registro
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Último Valor</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.latest.toFixed(1)} {graphParams.unit}
                    </p>
                  </div>
                  <div
                    className={`p-2 rounded-full ${
                      trend.type === "up"
                        ? "bg-green-100"
                        : trend.type === "down"
                          ? "bg-red-100"
                          : "bg-gray-100"
                    }`}
                  >
                    {trend.type === "up" && (
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    )}
                    {trend.type === "down" && (
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    )}
                    {trend.type === "neutral" && (
                      <Minus className="h-5 w-5 text-gray-600" />
                    )}
                  </div>
                </div>
                {trend.type !== "neutral" && (
                  <p
                    className={`text-xs mt-1 ${
                      trend.type === "up" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {trend.percentage > 0 ? "+" : ""}
                    {trend.percentage.toFixed(1)}% vs início
                  </p>
                )}
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-sm text-gray-600">Máximo</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.max.toFixed(1)} {graphParams.unit}
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-sm text-gray-600">Mínimo</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.min.toFixed(1)} {graphParams.unit}
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-sm text-gray-600">Média</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.avg.toFixed(1)} {graphParams.unit}
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-sm text-gray-600">Total de Registros</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {chartData.length}
                </p>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Progressão ao Longo do Tempo
                </h3>
                <p className="text-sm text-gray-600">
                  Visualização dos valores de {graphParams.parameter} em{" "}
                  {graphParams.unit}
                </p>
              </div>

              <div className="h-64 md:h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 20, left: 15, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="formattedDate"
                      stroke="#666"
                      fontSize={11}
                      tick={{ fontSize: 11 }}
                      angle={-45}
                      textAnchor="end"
                      height={50}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      stroke="#666"
                      fontSize={11}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload as ChartDataPoint;
                          return (
                            <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-2 md:p-3 text-xs md:text-sm max-w-48">
                              <p className="font-medium text-xs md:text-sm">
                                {label}
                              </p>
                              {data.time && (
                                <p className="text-gray-600 text-xs">
                                  Horário: {data.time}
                                </p>
                              )}
                              <p className="text-sm md:text-base text-blue-600 font-semibold">
                                {payload[0].value} {graphParams.unit}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: "#3b82f6" }}
                    />
                    {/* Linha de referência da média */}
                    <ReferenceLine
                      y={stats.avg}
                      stroke="#6b7280"
                      strokeDasharray="5 5"
                      label={{
                        value: `Média: ${stats.avg.toFixed(1)}`,
                        position: "topRight",
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Diagnosis Question Modal */}
      <Dialog open={showDiagnosisModal} onOpenChange={setShowDiagnosisModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-green-600" />
              Faça sua pergunta:
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Digite sua pergunta sobre os dados do gráfico..."
              value={diagnosisQuestion}
              onChange={(e) => setDiagnosisQuestion(e.target.value)}
              className="min-h-[100px]"
              disabled={isDiagnosisLoading}
            />
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDiagnosisModal(false)}
                disabled={isDiagnosisLoading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleDiagnosis}
                className="bg-green-600 hover:bg-green-700"
                disabled={isDiagnosisLoading || !diagnosisQuestion.trim()}
              >
                {isDiagnosisLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Realizando diagnóstico...
                  </>
                ) : (
                  "Enviar pergunta"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diagnosis Result Modal */}
      <Dialog open={showDiagnosisResult} onOpenChange={setShowDiagnosisResult}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-green-600" />
              Resultado do Diagnóstico
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <FormattedChatGPTText text={diagnosisResult} />
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => setShowDiagnosisResult(false)}
                className="bg-green-600 hover:bg-green-700"
              >
                OK
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
};

export default PatientGraphView;
