import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl font-semibold text-gray-900">
              Dashboard Médico
            </h1>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="text-gray-700"
            >
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Bem-vindo ao seu painel
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-gray-900">
                Informações da Conta
              </h3>
              <div className="mt-2 space-y-1 text-sm text-gray-600">
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
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-gray-900">Ações Rápidas</h3>
              <div className="mt-2 space-y-2">
                <Button variant="outline" className="w-full">
                  Ver Pacientes
                </Button>
                <Button variant="outline" className="w-full">
                  Agendar Consulta
                </Button>
                <Button variant="outline" className="w-full">
                  Relatórios
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
