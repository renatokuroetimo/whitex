import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect patients to PatientDashboard
  useEffect(() => {
    if (user?.profession === "paciente") {
      navigate("/patient-dashboard", { replace: true });
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  // Only show doctor dashboard for doctors
  if (user.profession !== "medico") {
    return null;
  }

  return (
    <MobileLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6 sm:mb-8">
          Dashboard
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-medium text-gray-900 mb-4">
              Informações da Conta
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Profissão:</strong>{" "}
                {user.profession === "medico" ? "Médico" : "Paciente"}
              </p>
              {user.crm && (
                <p>
                  <strong>CRM:</strong> {user.crm}
                </p>
              )}
              <p>
                <strong>Conta criada:</strong>{" "}
                {new Date(user.createdAt).toLocaleDateString("pt-BR")}
              </p>
            </div>
            <Button
              onClick={() => navigate("/profile")}
              variant="outline"
              className="w-full mt-4"
            >
              Completar Perfil
            </Button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-medium text-gray-900 mb-4">Pacientes</h3>
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm mb-4">
                Gerencie seus pacientes
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/pacientes")}
              >
                Ver Pacientes
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-medium text-gray-900 mb-4">Indicadores</h3>
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm mb-4">
                Gerencie seus indicadores
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/indicadores")}
              >
                Ver Indicadores
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Dashboard;
