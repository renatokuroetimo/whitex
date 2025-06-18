import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
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

  // Parâmetros da URL
  const category = searchParams.get("category") || "";
  const subcategory = searchParams.get("subcategory") || "";
  const parameter = searchParams.get("parameter") || "";
  const unit = searchParams.get("unit") || "";

  useEffect(() => {
    if (
      (patientId || (user?.profession === "paciente" && user?.id)) &&
      category &&
      subcategory &&
      parameter &&
      unit
    ) {
      loadData();
    }
  }, [patientId, user, category, subcategory, parameter, unit]);

  useEffect(() => {
    if (indicators.length > 0) {
      processChartData();
    }
  }, [indicators, timeRange]);

  const loadData = async () => {
    const targetPatientId = patientId || user?.id;
    if (!targetPatientId) return;

    setIsLoading(true);
    try {
      const shouldLoadPatientData =
        !!patientId && user?.profession === "medico";

      const [patientData, indicatorValues] = await Promise.all([
        shouldLoadPatientData
          ? patientAPI.getPatientById(targetPatientId)
          : Promise.resolve(null),
        patientIndicatorAPI.getPatientIndicatorValues(targetPatientId),
      ]);

      if (shouldLoadPatientData && !patientData) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Paciente não encontrado",
        });
        navigate("/pacientes");
        return;
      }

      if (shouldLoadPatientData) {
        setPatient(patientData);
      }

      // Filtrar indicadores pelo tipo selecionado
      const filteredIndicators = indicatorValues.filter(
        (indicator) =>
          indicator.categoryName === category &&
          indicator.subcategoryName === subcategory &&
          indicator.parameter === parameter,
      );

      setIndicators(filteredIndicators);
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

  const processChartData = () => {
    let filteredIndicators = [...indicators];

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

      filteredIndicators = filteredIndicators.filter((indicator) => {
        if (!indicator.date) return false;
        const indicatorDate = new Date(indicator.date);
        return indicatorDate >= cutoffDate;
      });
    }

    // Converter para dados do gráfico
    const data: ChartDataPoint[] = filteredIndicators
      .filter((indicator) => indicator.date) // Só incluir com data
      .map((indicator) => {
        const date = new Date(indicator.date!);
        const value = parseFloat(indicator.value);

        return {
          date: indicator.date!,
          value: isNaN(value) ? 0 : value,
          formattedDate: date.toLocaleDateString("pt-BR"),
          originalDate: indicator.date!,
          time: indicator.time,
        };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Ordenar por data

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
      navigate(`/pacientes/${patientId}/graficos`);
    } else {
      navigate("/patient/graficos");
    }
  };

  const trend = calculateTrend();
  const stats = getStatistics();

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-gray-600">Carregando gráfico...</p>
          </div>
        </div>
      </div>
    );
  }

  // Só verificar paciente se esperávamos carregá-lo
  if (patientId && !patient) {
    return null;
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
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {subcategory} - {parameter}
                </h1>
                <p className="text-sm text-gray-600">
                  {patientId
                    ? `${patient?.name || "Paciente"} • ${category}`
                    : `Seus dados • ${category}`}
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
            </div>
          </div>

          {chartData.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <div className="max-w-md mx-auto">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum dado no período selecionado
                </h3>
                <p className="text-gray-600 mb-6">
                  Não há registros de {parameter} para o período selecionado.
                  Tente selecionar um período maior ou adicione mais registros.
                </p>
                <Button
                  onClick={() =>
                    navigate(`/pacientes/${patientId}/adicionar-indicador`)
                  }
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Adicionar Registro
                </Button>
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
                        {stats.latest.toFixed(1)} {unit}
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
                    {stats.max.toFixed(1)} {unit}
                  </p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <p className="text-sm text-gray-600">Mínimo</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.min.toFixed(1)} {unit}
                  </p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <p className="text-sm text-gray-600">Média</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.avg.toFixed(1)} {unit}
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
                    Visualização dos valores de {parameter} em {unit}
                  </p>
                </div>

                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="formattedDate"
                        stroke="#666"
                        fontSize={12}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis
                        stroke="#666"
                        fontSize={12}
                        tick={{ fontSize: 12 }}
                        label={{
                          value: unit,
                          angle: -90,
                          position: "insideLeft",
                        }}
                      />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload as ChartDataPoint;
                            return (
                              <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                                <p className="font-medium">{label}</p>
                                {data.time && (
                                  <p className="text-sm text-gray-600">
                                    Horário: {data.time}
                                  </p>
                                )}
                                <p className="text-blue-600 font-semibold">
                                  {payload[0].value} {unit}
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
      </div>
    </div>
  );
};

export default PatientGraphView;
