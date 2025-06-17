import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Activity,
  Filter,
  TrendingUp,
  Edit,
  Trash2,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { patientAPI } from "@/lib/patient-api";
import { patientIndicatorAPI } from "@/lib/patient-indicator-api";
import { Patient } from "@/lib/patient-types";
import { PatientIndicatorValue } from "@/lib/patient-indicator-types";
import { toast } from "@/hooks/use-toast";

const PatientIndicators = () => {
  const navigate = useNavigate();
  const { patientId } = useParams<{ patientId: string }>();
  const { user } = useAuth();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [indicators, setIndicators] = useState<PatientIndicatorValue[]>([]);
  const [filteredIndicators, setFilteredIndicators] = useState<
    PatientIndicatorValue[]
  >([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [indicatorToDelete, setIndicatorToDelete] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (patientId) {
      loadData();
    }
  }, [patientId]);

  useEffect(() => {
    filterIndicators();
  }, [selectedCategory, indicators]);

  const filterIndicators = () => {
    if (selectedCategory === "all") {
      setFilteredIndicators(indicators);
    } else {
      setFilteredIndicators(
        indicators.filter(
          (indicator) => indicator.categoryName === selectedCategory,
        ),
      );
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleEditIndicator = (indicatorId: string) => {
    navigate(`/pacientes/${patientId}/indicadores/${indicatorId}/editar`);
  };

  const handleDeleteConfirm = (indicatorId: string) => {
    setIndicatorToDelete(indicatorId);
    setShowDeleteDialog(true);
  };

  const handleDeleteIndicator = async () => {
    if (!indicatorToDelete) return;

    try {
      await patientIndicatorAPI.deletePatientIndicatorValue(indicatorToDelete);
      toast({
        title: "Sucesso",
        description: "Indicador removido com sucesso",
      });
      // Recarregar dados
      loadData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao remover indicador",
      });
    } finally {
      setShowDeleteDialog(false);
      setIndicatorToDelete(null);
    }
  };

  const loadData = async () => {
    if (!patientId) return;

    setIsLoading(true);
    try {
      const [patientData, indicatorValues, indicatorCategories] =
        await Promise.all([
          patientAPI.getPatientById(patientId),
          patientIndicatorAPI.getPatientIndicatorValues(patientId),
          patientIndicatorAPI.getPatientIndicatorCategories(patientId),
        ]);

      if (!patientData) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Paciente não encontrado",
        });
        navigate("/pacientes");
        return;
      }

      setPatient(patientData);
      setIndicators(indicatorValues);
      setFilteredIndicators(indicatorValues);
      setCategories(indicatorCategories);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar dados do paciente",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddIndicator = () => {
    navigate(`/pacientes/${patientId}/adicionar-indicador`);
  };

  const handleBack = () => {
    navigate(`/pacientes/${patientId}`);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR");
  };

  const formatDateTime = (dateStr: string, timeStr?: string) => {
    const date = new Date(dateStr).toLocaleDateString("pt-BR");
    return timeStr ? `${date} às ${timeStr}` : date;
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

  if (!patient) {
    return null;
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
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Indicadores de {patient.name}
                </h1>
                <p className="text-sm text-gray-600">
                  {patient.age} anos • {patient.city}, {patient.state}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => navigate(`/pacientes/${patientId}/graficos`)}
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Ver Gráficos
              </Button>
              <Button
                onClick={handleAddIndicator}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Indicador
              </Button>
            </div>
          </div>

          {/* Filtro */}
          {indicators.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Filtrar por categoria:
                  </span>
                </div>
                <Select
                  value={selectedCategory}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="text-sm text-gray-500">
                  Mostrando {filteredIndicators.length} de {indicators.length}{" "}
                  indicadores
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          {indicators.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum indicador registrado
                </h3>
                <p className="text-gray-600 mb-6">
                  {patient.name} ainda não possui indicadores registrados.
                  Comece adicionando o primeiro indicador para acompanhar a
                  saúde do paciente.
                </p>
                <Button
                  onClick={handleAddIndicator}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Indicador
                </Button>
              </div>
            </div>
          ) : (
            /* Indicators List */
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {selectedCategory === "all"
                      ? `Indicadores Registrados (${indicators.length})`
                      : `${selectedCategory} (${filteredIndicators.length})`}
                  </h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                          Indicador
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                          Valor
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                          Data/Hora
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                          Visibilidade
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                          Registrado em
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredIndicators.map((indicator) => (
                        <tr
                          key={indicator.id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-3 px-4">
                            <div>
                              <span className="text-sm font-medium text-gray-900">
                                {indicator.categoryName} -{" "}
                                {indicator.subcategoryName}
                              </span>
                              <p className="text-xs text-gray-600">
                                {indicator.parameter}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm font-medium text-gray-900">
                              {indicator.value} {indicator.unitSymbol}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-600">
                              {indicator.date && indicator.time
                                ? formatDateTime(indicator.date, indicator.time)
                                : indicator.date
                                  ? formatDate(indicator.date)
                                  : "Não informado"}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              variant={
                                indicator.visibleToMedics
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {indicator.visibleToMedics
                                ? "Médicos"
                                : "Privado"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-600">
                              {formatDate(indicator.createdAt)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  handleEditIndicator(indicator.id)
                                }
                                className="text-blue-600 hover:text-blue-800 p-1"
                                title="Editar indicador"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteConfirm(indicator.id)
                                }
                                className="text-red-600 hover:text-red-800 p-1"
                                title="Remover indicador"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
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
        title="Remover Indicador"
        description="Tem certeza que deseja remover este registro de indicador? Esta ação não pode ser desfeita."
        confirmText="Remover"
        cancelText="Cancelar"
        onConfirm={handleDeleteIndicator}
        variant="destructive"
      />
    </div>
  );
};

export default PatientIndicators;
