import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { indicatorAPI } from "@/lib/indicator-api";
import { IndicatorWithDetails } from "@/lib/indicator-types";
import { toast } from "@/hooks/use-toast";

const IndicadoresTest = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [indicators, setIndicators] = useState<IndicatorWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  console.log(
    "IndicadoresTest rendering with user:",
    user,
    "isAuthenticated:",
    isAuthenticated,
  );

  // Always render something, even if it's just debug info
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-8">
            Indicadores (Teste)
          </h1>

          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-lg font-medium mb-4">Debug Info:</h2>
            <div className="space-y-2 text-sm">
              <p>
                <strong>User:</strong>{" "}
                {user ? JSON.stringify(user, null, 2) : "null"}
              </p>
              <p>
                <strong>Is Authenticated:</strong>{" "}
                {isAuthenticated ? "true" : "false"}
              </p>
              <p>
                <strong>User Profession:</strong>{" "}
                {user?.profession || "undefined"}
              </p>
            </div>
          </div>

          {user?.profession === "medico" && (
            <div className="mt-6 space-y-4 max-w-2xl">
              {/* Criar indicadores */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-1">
                      Criar indicadores
                    </h2>
                    <p className="text-sm text-gray-600">
                      Crie novos indicadores personalizados para seus pacientes
                    </p>
                  </div>
                  <Button
                    onClick={() => navigate("/indicadores/criar")}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Criar
                  </Button>
                </div>
              </div>

              {/* Ver indicadores criados */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-1">
                      Ver indicadores criados
                    </h2>
                    <p className="text-sm text-gray-600">
                      {indicators.length} indicador(es) criado(s)
                    </p>
                  </div>
                  <Button
                    onClick={() => navigate("/indicadores/criados")}
                    variant="outline"
                    className="border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    Ver
                  </Button>
                </div>
              </div>

              {/* Indicadores Padrão */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-1">
                      Indicadores Padrão
                    </h2>
                    <p className="text-sm text-gray-600">
                      Visualize indicadores pré-definidos do sistema
                    </p>
                  </div>
                  <Button
                    onClick={() => navigate("/indicadores/padrao")}
                    variant="outline"
                    className="border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    Ver
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IndicadoresTest;
