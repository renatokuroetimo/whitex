import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Loader2,
} from "lucide-react";
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
import { hospitalPatientAPI } from "@/lib/hospital-patient-api";
import { patientIndicatorAPI } from "@/lib/patient-indicator-api";
import { PatientIndicatorValue } from "@/lib/patient-indicator-types";
import { toast } from "@/hooks/use-toast";

interface Hospital {
  id: string;
  name: string;
  email: string;
}

interface ChartDataPoint {
  date: string;
  dateFormatted: string;
  [patientName: string]: string | number;
}

interface PatientData {
  id: string;
  name: string;
  color: string;
  data: { date: string; value: number }[];
}

// Cores para diferentes pacientes
const PATIENT_COLORS = [
  "#3B82F6", // Blue
  "#EF4444", // Red
  "#10B981", // Green
  "#F59E0B", // Yellow
  "#8B5CF6", // Purple
  "#06B6D4", // Cyan
  "#F97316", // Orange
  "#84CC16", // Lime
  "#EC4899", // Pink
  "#6B7280", // Gray
];

const HospitalGraphView = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [indicators, setIndicators] = useState<PatientIndicatorValue[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [patientData, setPatientData] = useState<PatientData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState("6months");
  const [isLoading, setIsLoading] = useState(true);

  // Parâmetros do indicador
  const categoryName = searchParams.get("categoryName") || "";
  const subcategoryName = searchParams.get("subcategoryName") || "";
  const parameter = searchParams.get("parameter") || "";
  const unitSymbol = searchParams.get("unitSymbol") || "";

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Buscar dados do hospital
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
      const patients = await hospitalPatientAPI.getPatientsByHospital(
        hospitalData.id,
      );

      // Buscar indicadores específicos de todos os pacientes
      const allIndicators: PatientIndicatorValue[] = [];
      for (const patient of patients) {
        try {
          const patientIndicators = await patientIndicatorAPI.getIndicators(
            patient.id,
          );
          const filteredIndicators = patientIndicators.filter(
            (ind) =>
              ind.categoryName === categoryName &&
              ind.subcategoryName === subcategoryName &&
              ind.parameter === parameter,
          );
          allIndicators.push(...filteredIndicators);
        } catch (error) {
          console.log(`Erro ao buscar indicadores do paciente ${patient.id}`);
        }
      }

      // Filtrar por período
      const now = new Date();
      const cutoffDate = new Date();
      switch (selectedPeriod) {
        case "1month":
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case "3months":
          cutoffDate.setMonth(now.getMonth() - 3);
          break;
        case "6months":
          cutoffDate.setMonth(now.getMonth() - 6);
          break;
        case "1year":
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          cutoffDate.setMonth(now.getMonth() - 6);
      }

      const filteredIndicators = allIndicators.filter(
        (ind) => new Date(ind.createdAt) >= cutoffDate,
      );

      setIndicators(filteredIndicators);

      // Agrupar por paciente
      const patientMap = new Map<string, PatientData>();
      filteredIndicators.forEach((indicator, index) => {
        const patientName =
          patients.find((p) => p.id === indicator.patientId)?.name ||
          `Paciente ${indicator.patientId.slice(0, 8)}`;

        if (!patientMap.has(indicator.patientId)) {
          patientMap.set(indicator.patientId, {
            id: indicator.patientId,
            name: patientName,
            color: PATIENT_COLORS[patientMap.size % PATIENT_COLORS.length],
            data: [],
          });
        }

        const patient = patientMap.get(indicator.patientId)!;
        const numericValue = parseFloat(indicator.value);
        if (!isNaN(numericValue)) {
          patient.data.push({
            date: indicator.createdAt,
            value: numericValue,
          });
        }
      });

      // Ordenar dados por data para cada paciente
      patientMap.forEach((patient) => {
        patient.data.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );
      });

      const patients_data = Array.from(patientMap.values());
      setPatientData(patients_data);

      // Criar dados do gráfico
      createChartData(patients_data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do gráfico",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createChartData = (patients: PatientData[]) => {
    // Coletar todas as datas únicas
    const allDates = new Set<string>();
    patients.forEach((patient) => {
      patient.data.forEach((point) => {
        allDates.add(point.date.split("T")[0]); // Apenas a data, sem hora
      });
    });

    // Ordenar datas
    const sortedDates = Array.from(allDates).sort();

    // Criar estrutura do gráfico
    const data: ChartDataPoint[] = sortedDates.map((date) => {
      const dataPoint: ChartDataPoint = {
        date,
        dateFormatted: new Date(date).toLocaleDateString("pt-BR"),
      };

      // Para cada paciente, buscar o valor mais próximo da data
      patients.forEach((patient) => {
        const patientValues = patient.data.filter((point) =>
          point.date.startsWith(date),
        );
        if (patientValues.length > 0) {
          // Se há valores para esta data, usar o último
          dataPoint[patient.name] =
            patientValues[patientValues.length - 1].value;
        }
      });

      return dataPoint;
    });

    setChartData(data);
  };

  const calculateTrend = () => {
    if (patientData.length === 0) return null;

    let totalTrend = 0;
    let patientsWithTrend = 0;

    patientData.forEach((patient) => {
      if (patient.data.length >= 2) {
        const firstValue = patient.data[0].value;
        const lastValue = patient.data[patient.data.length - 1].value;
        const trend = ((lastValue - firstValue) / firstValue) * 100;
        totalTrend += trend;
        patientsWithTrend++;
      }
    });

    if (patientsWithTrend === 0) return null;

    const avgTrend = totalTrend / patientsWithTrend;
    return {
      value: avgTrend,
      direction: avgTrend > 0 ? "up" : avgTrend < 0 ? "down" : "stable",
    };
  };

  const trend = calculateTrend();

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-gray-600">Carregando gráfico...</p>
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
            onClick={() => navigate("/gerenciamento/patients/graphs")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar aos Gráficos
          </Button>

          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {parameter}
              </h1>
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge className="bg-blue-100 text-blue-800">
                  {categoryName}
                </Badge>
                <Badge
                  variant="outline"
                  className="border-blue-200 text-blue-600"
                >
                  {subcategoryName}
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-gray-100 text-gray-800"
                >
                  {unitSymbol}
                </Badge>
              </div>
              <p className="text-gray-600">
                Evolução de {patientData.length} paciente(s) - {hospital?.name}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-40">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1month">Último mês</SelectItem>
                  <SelectItem value="3months">3 meses</SelectItem>
                  <SelectItem value="6months">6 meses</SelectItem>
                  <SelectItem value="1year">1 ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pacientes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {patientData.length}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total de Registros
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {indicators.length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Tendência Média
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {trend
                    ? `${trend.value > 0 ? "+" : ""}${trend.value.toFixed(1)}%`
                    : "N/A"}
                </p>
              </div>
              {trend?.direction === "up" && (
                <TrendingUp className="h-8 w-8 text-green-600" />
              )}
              {trend?.direction === "down" && (
                <TrendingDown className="h-8 w-8 text-red-600" />
              )}
              {trend?.direction === "stable" && (
                <Minus className="h-8 w-8 text-gray-600" />
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Período</p>
                <p className="text-2xl font-bold text-gray-900">
                  {selectedPeriod === "1month" && "1m"}
                  {selectedPeriod === "3months" && "3m"}
                  {selectedPeriod === "6months" && "6m"}
                  {selectedPeriod === "1year" && "1a"}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-lg">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Evolução Temporal - Todos os Pacientes
            </h3>

            {chartData.length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum dado encontrado
                </h3>
                <p className="text-gray-500">
                  Não há dados suficientes para gerar o gráfico no período
                  selecionado.
                </p>
              </div>
            ) : (
              <>
                {/* Legend */}
                <div className="flex flex-wrap gap-3 mb-6">
                  {patientData.map((patient) => (
                    <div key={patient.id} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: patient.color }}
                      ></div>
                      <span className="text-sm text-gray-600">
                        {patient.name}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Chart */}
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="dateFormatted"
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        label={{
                          value: unitSymbol,
                          angle: -90,
                          position: "insideLeft",
                        }}
                      />
                      <Tooltip
                        labelFormatter={(label) => `Data: ${label}`}
                        formatter={(value: any, name: string) => [
                          `${value} ${unitSymbol}`,
                          name,
                        ]}
                      />
                      {patientData.map((patient) => (
                        <Line
                          key={patient.id}
                          type="monotone"
                          dataKey={patient.name}
                          stroke={patient.color}
                          strokeWidth={2}
                          dot={{ fill: patient.color, strokeWidth: 2, r: 4 }}
                          connectNulls={false}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalGraphView;
