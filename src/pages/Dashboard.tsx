import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContextHybrid";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Activity,
  TrendingUp,
  Calendar,
  AlertTriangle,
  Clock,
  Plus,
  BarChart3,
  Heart,
  ThermometerSun,
  Weight,
  UserPlus,
  FileText,
  Target,
} from "lucide-react";
import MobileLayout from "@/components/MobileLayout";
import { patientAPI } from "@/lib/patient-api";
import { patientIndicatorAPI } from "@/lib/patient-indicator-api";
import { indicatorAPI } from "@/lib/indicator-api";
import { Patient } from "@/lib/patient-types";
import { PatientIndicatorValue } from "@/lib/patient-indicator-types";

interface DashboardStats {
  totalPatients: number;
  activePatients: number;
  totalIndicators: number;
  recentMeasurements: number;
  measurementsToday: number;
  measurementsYesterday: number;
}

interface RecentActivity {
  id: string;
  type: "patient_added" | "indicator_added" | "measurement_taken";
  patientName: string;
  description: string;
  time: string;
  icon: React.ComponentType<any>;
  color: string;
}

interface MedicalAlert {
  id: string;
  patientId: string;
  patientName: string;
  type:
    | "high_pressure"
    | "low_pressure"
    | "missing_measurements"
    | "urgent_review"
    | "abnormal_value";
  message: string;
  severity: "high" | "medium" | "low";
  value?: string;
  indicator?: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    activePatients: 0,
    totalIndicators: 0,
    recentMeasurements: 0,
    measurementsToday: 0,
    measurementsYesterday: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    [],
  );
  const [medicalAlerts, setMedicalAlerts] = useState<MedicalAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect patients to PatientDashboard
  useEffect(() => {
    if (user?.profession === "paciente") {
      navigate("/patient-dashboard", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user?.profession === "medico") {
      loadRealDashboardData();
    }
  }, [user]);

  const loadRealDashboardData = async () => {
    try {
      setIsLoading(true);

      // Load real patients data with error handling
      let patients: Patient[] = [];
      try {
        const patientsResponse = await patientAPI.getPatients();
        patients = patientsResponse.patients;
        console.log(`✅ Loaded ${patients.length} patients`);
      } catch (error) {
        console.error("❌ Failed to load patients:", error);
        patients = [];
      }

      // Load real indicators data with error handling
      let totalIndicators = 0;
      try {
        const [customIndicators, standardIndicators] = await Promise.allSettled(
          [indicatorAPI.getIndicators(), indicatorAPI.getStandardIndicators()],
        );

        const customCount =
          customIndicators.status === "fulfilled"
            ? customIndicators.value.length
            : 0;
        const standardCount =
          standardIndicators.status === "fulfilled"
            ? standardIndicators.value.length
            : 0;

        totalIndicators = customCount + standardCount;
        console.log(
          `✅ Loaded ${totalIndicators} indicators (${customCount} custom, ${standardCount} standard)`,
        );
      } catch (error) {
        console.error("❌ Failed to load indicators:", error);
        totalIndicators = 0;
      }

      // Load measurements for all patients with robust error handling
      const allMeasurements: PatientIndicatorValue[] = [];
      const patientMeasurements: {
        [patientId: string]: PatientIndicatorValue[];
      } = {};

      console.log(`📊 Loading measurements for ${patients.length} patients...`);

      // Process patients in smaller batches to avoid overwhelming the API
      const batchSize = 5;
      for (let i = 0; i < patients.length; i += batchSize) {
        const batch = patients.slice(i, i + batchSize);

        const batchPromises = batch.map(async (patient) => {
          try {
            const measurements =
              await patientIndicatorAPI.getPatientIndicatorValues(patient.id);
            return { patientId: patient.id, measurements, success: true };
          } catch (error) {
            console.warn(
              `⚠️ Could not load measurements for patient ${patient.name} (${patient.id}):`,
              error,
            );
            return { patientId: patient.id, measurements: [], success: false };
          }
        });

        const batchResults = await Promise.allSettled(batchPromises);

        batchResults.forEach((result) => {
          if (result.status === "fulfilled") {
            const { patientId, measurements, success } = result.value;
            allMeasurements.push(...measurements);
            patientMeasurements[patientId] = measurements;
            if (success && measurements.length > 0) {
              console.log(
                `✅ Loaded ${measurements.length} measurements for patient ${patientId}`,
              );
            }
          }
        });

        // Small delay between batches to avoid rate limiting
        if (i + batchSize < patients.length) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      console.log(`📊 Total measurements loaded: ${allMeasurements.length}`);

      // Calculate real stats with safe date handling
      let measurementsToday = 0;
      let measurementsYesterday = 0;
      let recentMeasurements = 0;

      try {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        measurementsToday = allMeasurements.filter((m) => {
          try {
            const measurementDate = new Date(m.createdAt);
            return (
              !isNaN(measurementDate.getTime()) &&
              measurementDate.toDateString() === today.toDateString()
            );
          } catch {
            return false;
          }
        }).length;

        measurementsYesterday = allMeasurements.filter((m) => {
          try {
            const measurementDate = new Date(m.createdAt);
            return (
              !isNaN(measurementDate.getTime()) &&
              measurementDate.toDateString() === yesterday.toDateString()
            );
          } catch {
            return false;
          }
        }).length;

        recentMeasurements = allMeasurements.filter((m) => {
          try {
            const measurementDate = new Date(m.createdAt);
            if (isNaN(measurementDate.getTime())) return false;

            const daysDiff =
              (today.getTime() - measurementDate.getTime()) /
              (1000 * 60 * 60 * 24);
            return daysDiff <= 7; // Last 7 days
          } catch {
            return false;
          }
        }).length;

        console.log(
          `📊 Stats calculated: ${measurementsToday} today, ${measurementsYesterday} yesterday, ${recentMeasurements} recent`,
        );
      } catch (error) {
        console.error("❌ Error calculating measurement stats:", error);
        // Keep default values (0) if calculation fails
      }

      // Set stats with safe values
      setStats({
        totalPatients: patients.length,
        activePatients: patients.filter((p) => p.status === "ativo").length,
        totalIndicators,
        recentMeasurements,
        measurementsToday,
        measurementsYesterday,
      });

      // Generate real recent activities with error handling
      try {
        const activities = generateRealActivities(patients, allMeasurements);
        setRecentActivities(activities);
        console.log(`📋 Generated ${activities.length} recent activities`);
      } catch (error) {
        console.error("❌ Error generating activities:", error);
        setRecentActivities([]);
      }

      // Generate intelligent medical alerts with error handling
      try {
        const alerts = generateMedicalAlerts(patients, patientMeasurements);
        setMedicalAlerts(alerts);
        console.log(`🚨 Generated ${alerts.length} medical alerts`);
      } catch (error) {
        console.error("❌ Error generating alerts:", error);
        setMedicalAlerts([]);
      }
    } catch (error) {
      console.error("💥 Critical error loading dashboard data:", error);

      // Set fallback stats so dashboard still shows something
      setStats({
        totalPatients: 0,
        activePatients: 0,
        totalIndicators: 0,
        recentMeasurements: 0,
        measurementsToday: 0,
        measurementsYesterday: 0,
      });
      setRecentActivities([]);
      setMedicalAlerts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateRealActivities = (
    patients: Patient[],
    measurements: PatientIndicatorValue[],
  ): RecentActivity[] => {
    const activities: RecentActivity[] = [];

    // Recent patients (last 7 days)
    const recentPatients = patients
      .filter((p) => {
        const createdDate = new Date(p.createdAt);
        const daysDiff =
          (new Date().getTime() - createdDate.getTime()) /
          (1000 * 60 * 60 * 24);
        return daysDiff <= 7;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 3);

    recentPatients.forEach((patient) => {
      activities.push({
        id: `patient_${patient.id}`,
        type: "patient_added",
        patientName: patient.name,
        description: "Novo paciente cadastrado",
        time: getRelativeTime(patient.createdAt),
        icon: UserPlus,
        color: "text-green-600",
      });
    });

    // Recent measurements (last 24 hours)
    const recentMeasurements = measurements
      .filter((m) => {
        const measurementDate = new Date(m.createdAt);
        const hoursDiff =
          (new Date().getTime() - measurementDate.getTime()) / (1000 * 60 * 60);
        return hoursDiff <= 24;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5);

    recentMeasurements.forEach((measurement, index) => {
      const patient = patients.find((p) => p.id === measurement.patientId);
      if (patient) {
        activities.push({
          id: `measurement_${measurement.id}_${measurement.patientId}_${index}`,
          type: "measurement_taken",
          patientName: patient.name,
          description: `${measurement.parameter}: ${measurement.value} ${measurement.unitSymbol}`,
          time: getRelativeTime(measurement.createdAt),
          icon: getIconForMeasurement(measurement.parameter),
          color: getColorForMeasurement(measurement.parameter),
        });
      }
    });

    return activities
      .sort((a, b) => getTimeInHours(a.time) - getTimeInHours(b.time))
      .slice(0, 6);
  };

  const generateMedicalAlerts = (
    patients: Patient[],
    patientMeasurements: { [patientId: string]: PatientIndicatorValue[] },
  ): MedicalAlert[] => {
    const alerts: MedicalAlert[] = [];

    patients.forEach((patient) => {
      const measurements = patientMeasurements[patient.id] || [];

      // Alert 1: High Blood Pressure (Pressão Arterial > 140/90)
      const pressureMeasurements = measurements.filter(
        (m) =>
          m.parameter.toLowerCase().includes("pressão") ||
          m.parameter.toLowerCase().includes("arterial"),
      );

      pressureMeasurements.forEach((measurement, index) => {
        const value = measurement.value;
        // Check for patterns like "150/95", "160/100", etc.
        const pressureMatch = value.match(/(\d+)\/(\d+)/);
        if (pressureMatch) {
          const systolic = parseInt(pressureMatch[1]);
          const diastolic = parseInt(pressureMatch[2]);

          if (systolic >= 140 || diastolic >= 90) {
            alerts.push({
              id: `pressure_${measurement.id}_${patient.id}_${index}`,
              patientId: patient.id,
              patientName: patient.name,
              type: "high_pressure",
              message: `Pressão arterial elevada: ${value} mmHg (Normal: <140/90)`,
              severity: systolic >= 160 || diastolic >= 100 ? "high" : "medium",
              value: value,
              indicator: "Pressão Arterial",
            });
          }
        }
      });

      // Alert 2: Missing Measurements (No measurements in last 7 days)
      const lastMeasurement = measurements.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )[0];

      if (lastMeasurement) {
        const daysSinceLastMeasurement =
          (new Date().getTime() -
            new Date(lastMeasurement.createdAt).getTime()) /
          (1000 * 60 * 60 * 24);

        if (daysSinceLastMeasurement > 7) {
          alerts.push({
            id: `missing_${patient.id}`,
            patientId: patient.id,
            patientName: patient.name,
            type: "missing_measurements",
            message: `Sem medições há ${Math.floor(daysSinceLastMeasurement)} dias`,
            severity: daysSinceLastMeasurement > 14 ? "high" : "medium",
            indicator: "Monitoramento",
          });
        }
      } else if (patient.status === "ativo") {
        // No measurements at all for active patient
        alerts.push({
          id: `no_measurements_${patient.id}`,
          patientId: patient.id,
          patientName: patient.name,
          type: "missing_measurements",
          message: "Paciente ativo sem nenhuma medição registrada",
          severity: "high",
          indicator: "Monitoramento",
        });
      }

      // Alert 3: Abnormal Temperature (< 35°C or > 38°C)
      const temperatureMeasurements = measurements.filter((m) =>
        m.parameter.toLowerCase().includes("temperatura"),
      );

      temperatureMeasurements.forEach((measurement, index) => {
        const temp = parseFloat(measurement.value);
        if (!isNaN(temp)) {
          if (temp < 35 || temp > 38) {
            alerts.push({
              id: `temp_${measurement.id}_${patient.id}_${index}`,
              patientId: patient.id,
              patientName: patient.name,
              type: "abnormal_value",
              message: `Temperatura ${temp < 35 ? "baixa" : "alta"}: ${temp}°C (Normal: 36-37.5°C)`,
              severity: temp < 34 || temp > 39 ? "high" : "medium",
              value: `${temp}°C`,
              indicator: "Temperatura",
            });
          }
        }
      });

      // Alert 4: Abnormal Heart Rate (< 60 or > 100 bpm)
      const heartRateMeasurements = measurements.filter(
        (m) =>
          m.parameter.toLowerCase().includes("frequência") &&
          m.parameter.toLowerCase().includes("cardíaca"),
      );

      heartRateMeasurements.forEach((measurement, index) => {
        const bpm = parseFloat(measurement.value);
        if (!isNaN(bpm)) {
          if (bpm < 60 || bpm > 100) {
            alerts.push({
              id: `hr_${measurement.id}_${patient.id}_${index}`,
              patientId: patient.id,
              patientName: patient.name,
              type: "abnormal_value",
              message: `Frequência cardíaca ${bpm < 60 ? "baixa" : "alta"}: ${bpm} bpm (Normal: 60-100)`,
              severity: bpm < 50 || bpm > 120 ? "high" : "medium",
              value: `${bpm} bpm`,
              indicator: "Frequência Cardíaca",
            });
          }
        }
      });
    });

    // Sort by severity (high first) and limit to 10 most important
    return alerts
      .sort((a, b) => {
        const severityOrder = { high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      })
      .slice(0, 10);
  };

  const getRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60);
      return `há ${minutes} min`;
    } else if (diffInHours < 24) {
      return `há ${Math.floor(diffInHours)} horas`;
    } else {
      const days = Math.floor(diffInHours / 24);
      return `há ${days} dias`;
    }
  };

  const getTimeInHours = (relativeTime: string): number => {
    if (relativeTime.includes("min")) {
      return parseFloat(relativeTime.match(/\d+/)?.[0] || "0") / 60;
    } else if (relativeTime.includes("horas")) {
      return parseFloat(relativeTime.match(/\d+/)?.[0] || "0");
    } else if (relativeTime.includes("dias")) {
      return parseFloat(relativeTime.match(/\d+/)?.[0] || "0") * 24;
    }
    return 0;
  };

  const getIconForMeasurement = (
    parameter: string,
  ): React.ComponentType<any> => {
    const param = parameter.toLowerCase();
    if (param.includes("pressão") || param.includes("arterial")) return Heart;
    if (param.includes("temperatura")) return ThermometerSun;
    if (param.includes("peso")) return Weight;
    if (param.includes("frequência")) return Activity;
    return Target;
  };

  const getColorForMeasurement = (parameter: string): string => {
    const param = parameter.toLowerCase();
    if (param.includes("pressão") || param.includes("arterial"))
      return "text-red-600";
    if (param.includes("temperatura")) return "text-orange-600";
    if (param.includes("peso")) return "text-blue-600";
    if (param.includes("frequência")) return "text-purple-600";
    return "text-gray-600";
  };

  const calculateTrend = (): { percentage: number; isPositive: boolean } => {
    if (stats.measurementsYesterday === 0) {
      return {
        percentage: stats.measurementsToday > 0 ? 100 : 0,
        isPositive: true,
      };
    }

    const percentage =
      ((stats.measurementsToday - stats.measurementsYesterday) /
        stats.measurementsYesterday) *
      100;
    return { percentage: Math.abs(percentage), isPositive: percentage >= 0 };
  };

  if (!user) {
    return null;
  }

  // Only show doctor dashboard for doctors
  if (user.profession !== "medico") {
    return null;
  }

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-gray-600">Carregando dados médicos...</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  const trend = calculateTrend();

  return (
    <MobileLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Dashboard Médico
            </h1>
            <p className="text-gray-600 mt-1">
              Bem-vindo, Dr. {user.fullName || "Doutor"}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => navigate("/pacientes/novo")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Paciente
            </Button>
          </div>
        </div>

        {/* Real Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Pacientes</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalPatients}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  {stats.activePatients} ativos
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Indicadores</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalIndicators}
                </p>
                <p className="text-sm text-blue-600 mt-1">Tipos disponíveis</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Medições Hoje</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.measurementsToday}
                </p>
                <p
                  className={`text-sm mt-1 ${trend.isPositive ? "text-green-600" : "text-red-600"}`}
                >
                  {trend.isPositive ? "+" : "-"}
                  {trend.percentage.toFixed(0)}% vs ontem
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Alertas Médicos</p>
                <p className="text-3xl font-bold text-gray-900">
                  {medicalAlerts.length}
                </p>
                <p className="text-sm text-orange-600 mt-1">
                  {medicalAlerts.filter((a) => a.severity === "high").length}{" "}
                  urgentes
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Real Recent Activities */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Atividades Recentes
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/pacientes")}
              >
                Ver Todas
              </Button>
            </div>
            <div className="space-y-4">
              {recentActivities.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Nenhuma atividade recente
                </p>
              ) : (
                recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <div
                      className={`p-2 bg-white rounded-full ${activity.color}`}
                    >
                      <activity.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.patientName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {activity.description}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500">{activity.time}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Real Medical Alerts & Quick Actions */}
          <div className="space-y-6">
            {/* Medical Alerts */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Alertas Médicos
                </h2>
                {medicalAlerts.length > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {medicalAlerts.filter((a) => a.severity === "high").length}
                  </Badge>
                )}
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {medicalAlerts.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Nenhum alerta médico
                  </p>
                ) : (
                  medicalAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-lg border ${
                        alert.severity === "high"
                          ? "bg-red-50 border-red-200"
                          : alert.severity === "medium"
                            ? "bg-orange-50 border-orange-200"
                            : "bg-yellow-50 border-yellow-200"
                      }`}
                      onClick={() => navigate(`/pacientes/${alert.patientId}`)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle
                          className={`h-4 w-4 ${
                            alert.severity === "high"
                              ? "text-red-600"
                              : alert.severity === "medium"
                                ? "text-orange-600"
                                : "text-yellow-600"
                          }`}
                        />
                        <p
                          className={`text-sm font-medium ${
                            alert.severity === "high"
                              ? "text-red-900"
                              : alert.severity === "medium"
                                ? "text-orange-900"
                                : "text-yellow-900"
                          }`}
                        >
                          {alert.patientName}
                        </p>
                      </div>
                      <p
                        className={`text-xs ${
                          alert.severity === "high"
                            ? "text-red-700"
                            : alert.severity === "medium"
                              ? "text-orange-700"
                              : "text-yellow-700"
                        }`}
                      >
                        {alert.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Ações Rápidas
              </h2>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate("/pacientes/novo")}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Cadastrar Paciente
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate("/indicadores/criar")}
                >
                  <Target className="h-4 w-4 mr-2" />
                  Criar Indicador
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate("/pacientes")}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Ver Relatórios
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Dashboard;
