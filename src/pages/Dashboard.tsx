import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="flex-1 overflow-auto">
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
                <Button variant="outline" className="w-full">
                  Ver Pacientes
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-medium text-gray-900 mb-4">Relatórios</h3>
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm mb-4">
                  Visualize indicadores
                </p>
                <Button variant="outline" className="w-full">
                  Ver Indicadores
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
