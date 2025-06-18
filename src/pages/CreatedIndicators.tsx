import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useAuth } from "@/contexts/AuthContext";
import { indicatorAPI } from "@/lib/indicator-api";
import { IndicatorWithDetails } from "@/lib/indicator-types";
import { toast } from "@/hooks/use-toast";

const CreatedIndicators = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [indicators, setIndicators] = useState<IndicatorWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [indicatorToDelete, setIndicatorToDelete] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (user?.id) {
      // Redirect patients to their indicators page
      if (user.profession === "paciente") {
        navigate("/patient/indicadores", { replace: true });
        return;
      }
      loadIndicators();
    }
  }, [user?.id, user?.profession, navigate]);

  const loadIndicators = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const result = await indicatorAPI.getIndicators(user.id);
      setIndicators(result);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar indicadores",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteIndicator = async () => {
    if (!indicatorToDelete) return;

    try {
      await indicatorAPI.deleteIndicator(indicatorToDelete);
      toast({
        title: "Sucesso",
        description: "Indicador deletado com sucesso",
      });
      loadIndicators();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao deletar indicador",
      });
    } finally {
      setShowDeleteDialog(false);
      setIndicatorToDelete(null);
    }
  };

  const confirmDelete = (indicatorId: string) => {
    setIndicatorToDelete(indicatorId);
    setShowDeleteDialog(true);
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
            <p className="text-gray-600">Carregando indicadores...</p>
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
                Indicadores Criados
              </h1>
            </div>
            <Button
              onClick={() => navigate("/indicadores/criar")}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Indicador
            </Button>
          </div>

          {/* Content */}
          {indicators.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum indicador criado
                </h3>
                <p className="text-gray-600 mb-6">
                  Você ainda não criou nenhum indicador. Crie seu primeiro
                  indicador para começar.
                </p>
                <Button
                  onClick={() => navigate("/indicadores/criar")}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Indicador
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Seus Indicadores ({indicators.length})
                  </h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
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
                        <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                          Ações
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
                              {indicator.unitOfMeasureSymbol}
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
                          <td className="py-3 px-4">
                            <button
                              onClick={() => confirmDelete(indicator.id)}
                              className="text-red-600 hover:text-red-800 p-1"
                              title="Deletar indicador"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Deletar Indicador"
        description="Tem certeza que deseja deletar este indicador? Esta ação não pode ser desfeita."
        confirmText="Deletar"
        cancelText="Cancelar"
        onConfirm={handleDeleteIndicator}
        variant="destructive"
      />
    </div>
  );
};

export default CreatedIndicators;
