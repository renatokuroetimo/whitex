import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, X, Info } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContextHybrid";
import { indicatorAPI } from "@/lib/indicator-api";
import { toast } from "@/hooks/use-toast";

const StandardIndicators = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [indicators, setIndicators] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndicator, setSelectedIndicator] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleViewIndicator = (indicator: any) => {
    setSelectedIndicator(indicator);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedIndicator(null);
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
                        className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleViewIndicator(indicator)}
                        title="Clique para ver detalhes completos"
                      >
                        <td
                          className="py-3 px-4"
                          onClick={(e) => e.stopPropagation()}
                        >
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
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-900">
                              {indicator.parameter}
                            </span>
                            <Eye className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
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

      {/* Indicator Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Info className="h-5 w-5 text-blue-600" />
              Detalhes do Indicador Padrão
            </DialogTitle>
          </DialogHeader>

          {selectedIndicator && (
            <div className="space-y-6 mt-4">
              {/* Informações Básicas */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-200"
                  >
                    Padrão
                  </Badge>
                  Informações Básicas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Nome do Indicador
                    </Label>
                    <div className="mt-1 p-2 bg-white border border-gray-200 rounded-md">
                      <span className="text-sm text-gray-900">
                        {selectedIndicator.name || selectedIndicator.parameter}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Parâmetro
                    </Label>
                    <div className="mt-1 p-2 bg-white border border-gray-200 rounded-md">
                      <span className="text-sm text-gray-900">
                        {selectedIndicator.parameter}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Categoria
                    </Label>
                    <div className="mt-1 p-2 bg-white border border-gray-200 rounded-md">
                      <span className="text-sm text-gray-900">
                        {selectedIndicator.categoryName}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Subcategoria
                    </Label>
                    <div className="mt-1 p-2 bg-white border border-gray-200 rounded-md">
                      <span className="text-sm text-gray-900">
                        {selectedIndicator.subcategoryName}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Unidade de Medida
                    </Label>
                    <div className="mt-1 p-2 bg-white border border-gray-200 rounded-md">
                      <span className="text-sm text-gray-900">
                        {selectedIndicator.unitSymbol}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Tipo de Dado
                    </Label>
                    <div className="mt-1 p-2 bg-white border border-gray-200 rounded-md">
                      <span className="text-sm text-gray-900">
                        {selectedIndicator.dataType || "Número"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Definição Técnica */}
              {selectedIndicator.definition && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Definição Técnica
                  </h3>
                  <div className="p-3 bg-white border border-blue-200 rounded-md">
                    <p className="text-sm text-gray-900 leading-relaxed">
                      {selectedIndicator.definition}
                    </p>
                  </div>
                </div>
              )}

              {/* Metadados Científicos */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Metadados Científicos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Contexto de Aplicação
                    </Label>
                    <div className="mt-1 p-2 bg-white border border-gray-200 rounded-md">
                      <span className="text-sm text-gray-900">
                        {selectedIndicator.context || "Clinical"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Código Padrão (LOINC)
                    </Label>
                    <div className="mt-1 p-2 bg-white border border-gray-200 rounded-md">
                      <span className="text-sm text-gray-900 font-mono">
                        {selectedIndicator.standardId || "N/A"}
                      </span>
                    </div>
                  </div>
                  {selectedIndicator.source && (
                    <div className="md:col-span-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Fonte Científica
                      </Label>
                      <div className="mt-1 p-2 bg-white border border-gray-200 rounded-md">
                        <span className="text-sm text-gray-900">
                          {selectedIndicator.source}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Configurações de Uso */}
              <div className="bg-yellow-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Configurações de Uso
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                        selectedIndicator.isRequired
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {selectedIndicator.isRequired ? "✓" : "✗"}
                    </div>
                    <div className="mt-2 text-xs text-gray-600">
                      Obrigatório
                    </div>
                  </div>
                  <div className="text-center">
                    <div
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                        selectedIndicator.isConditional
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {selectedIndicator.isConditional ? "✓" : "✗"}
                    </div>
                    <div className="mt-2 text-xs text-gray-600">
                      Condicional
                    </div>
                  </div>
                  <div className="text-center">
                    <div
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                        selectedIndicator.isRepeatable
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {selectedIndicator.isRepeatable ? "✓" : "✗"}
                    </div>
                    <div className="mt-2 text-xs text-gray-600">Repetível</div>
                  </div>
                  <div className="text-center">
                    <div
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                        selectedIndicator.visible
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {selectedIndicator.visible ? "✓" : "✗"}
                    </div>
                    <div className="mt-2 text-xs text-gray-600">Visível</div>
                  </div>
                </div>
              </div>

              {/* Requisitos de Entrada */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Requisitos de Entrada
                </h3>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        selectedIndicator.requiresDate
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    ></div>
                    <span className="text-sm text-gray-700">Requer Data</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        selectedIndicator.requiresTime
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    ></div>
                    <span className="text-sm text-gray-700">
                      Requer Horário
                    </span>
                  </div>
                </div>
              </div>

              {/* Botão de Fechar */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <Button
                  onClick={handleCloseModal}
                  className="bg-gray-600 hover:bg-gray-700"
                >
                  Fechar Detalhes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StandardIndicators;
