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

interface DashboardStats {
  totalPatients: number;
  activePatients: number;
  totalIndicators: number;
  recentMeasurements: number;
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

interface PatientAlert {
  id: string;
  patientName: string;
  type: "high_pressure" | "missing_measurements" | "urgent_review";
  message: string;
  severity: "high" | "medium" | "low";
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    activePatients: 0,
    totalIndicators: 0,
    recentMeasurements: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    [],
  );
  const [patientAlerts, setPatientAlerts] = useState<PatientAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect patients to PatientDashboard
  useEffect(() => {
    if (user?.profession === "paciente") {
      navigate("/patient-dashboard", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user?.profession === "medico") {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Load patients data
      const patientsResponse = await patientAPI.getPatients();
      const patients = patientsResponse.patients;

      // Calculate stats
      const totalPatients = patients.length;
      const activePatients = patients.filter(
        (p) => p.status === "ativo",
      ).length;

      setStats({
        totalPatients,
        activePatients,
        totalIndicators: 15, // Mock data - replace with real API call
        recentMeasurements: 42, // Mock data - replace with real API call
      });

      // Generate recent activities (mock data)
      setRecentActivities([
        {
          id: "1",
          type: "patient_added",
          patientName: "Maria Silva",
          description: "Novo paciente adicionado",
          time: "há 2 horas",
          icon: UserPlus,
          color: "text-green-600",
        },
        {
          id: "2",
          type: "measurement_taken",
          patientName: "João Santos",
          description: "Pressão arterial registrada: 140/90 mmHg",
          time: "há 4 horas",
          icon: Heart,
          color: "text-red-600",
        },
        {
          id: "3",
          type: "indicator_added",
          patientName: "Ana Costa",
          description: "Novo indicador de temperatura adicionado",
          time: "há 6 horas",
          icon: ThermometerSun,
          color: "text-blue-600",
        },
      ]);

      // Generate patient alerts (mock data)
      setPatientAlerts([
        {
          id: "1",
          patientName: "João Santos",
          type: "high_pressure",
          message: "Pressão arterial elevada detectada (160/100)",
          severity: "high",
        },
        {
          id: "2",
          patientName: "Maria Silva",
          type: "missing_measurements",
          message: "Sem medições há 7 dias",
          severity: "medium",
        },
      ]);
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
    } finally {
      setIsLoading(false);
    }
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
            <p className="text-gray-600">Carregando dashboard...</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

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
              Bem-vindo, Dr. {user.fullName || user.email?.split("@")[0]}
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

        {/* Stats Cards */}
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
                <p className="text-sm text-blue-600 mt-1">Tipos criados</p>
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
                  {stats.recentMeasurements}
                </p>
                <p className="text-sm text-green-600 mt-1">+12% vs ontem</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Alertas</p>
                <p className="text-3xl font-bold text-gray-900">
                  {patientAlerts.length}
                </p>
                <p className="text-sm text-orange-600 mt-1">Requerem atenção</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activities */}
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
              {recentActivities.map((activity) => (
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
              ))}
            </div>
          </div>

          {/* Patient Alerts & Quick Actions */}
          <div className="space-y-6">
            {/* Alerts */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Alertas</h2>
                <Badge variant="destructive" className="text-xs">
                  {patientAlerts.length}
                </Badge>
              </div>
              <div className="space-y-3">
                {patientAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <p className="text-sm font-medium text-red-900">
                        {alert.patientName}
                      </p>
                    </div>
                    <p className="text-xs text-red-700">{alert.message}</p>
                  </div>
                ))}
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
