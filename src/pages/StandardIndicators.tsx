import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContextHybrid";
import { indicatorAPI } from "@/lib/indicator-api";
import { toast } from "@/hooks/use-toast";

const StandardIndicators = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [indicators, setIndicators] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Redirect patients to their indicators page
    if (user?.profession === "paciente") {
      navigate("/patient/indicadores", { replace: true });
      return;
    }
    loadStandardIndicators();
  }, [user, navigate]);

  const loadStandardIndicators = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      // Carregar indicadores com configuração específica do médico
      const result = await indicatorAPI.getStandardIndicators(user.id);
      setIndicators(result);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar indicadores padrão",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVisibilityChange = async (id: string, visible: boolean) => {
    if (!user?.id) return;

    try {
      // Atualizar visibilidade apenas para este médico
      await indicatorAPI.updateStandardIndicatorVisibility(
        id,
        visible,
        user.id,
      );
      setIndicators((prev) =>
        prev.map((ind) => (ind.id === id ? { ...ind, visible } : ind)),
      );
      toast({
        title: "Sucesso",
        description: `Indicador ${visible ? "ativado" : "desativado"} apenas para você`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao atualizar indicador",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-gray-600">Carregando indicadores padrão...</p>
          </div>
        </div>
      </div>
    );
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
                onClick={() => navigate("/indicadores")}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <h1 className="text-2xl font-semibold text-gray-900">
                Indicadores Padrão
              </h1>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Indicadores do Sistema ({indicators.length})
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                        Visível
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                        Categoria
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                        Subcategoria
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                        Parâmetro
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                        Unidade
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                        Obrigatoriedade
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {indicators.map((indicator) => (
                      <tr
                        key={indicator.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          <Checkbox
                            checked={indicator.visible}
                            onCheckedChange={(checked) =>
                              handleVisibilityChange(indicator.id, !!checked)
                            }
                          />
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-medium text-gray-900">
                            {indicator.categoryName}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-600">
                            {indicator.subcategoryName}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-900">
                            {indicator.parameter}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-600">
                            {indicator.unitSymbol}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1">
                            {indicator.requiresDate && (
                              <Badge variant="secondary" className="text-xs">
                                Data
                              </Badge>
                            )}
                            {indicator.requiresTime && (
                              <Badge variant="secondary" className="text-xs">
                                Horário
                              </Badge>
                            )}
                            {!indicator.requiresDate &&
                              !indicator.requiresTime && (
                                <span className="text-xs text-gray-400">
                                  Nenhuma
                                </span>
                              )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StandardIndicators;
