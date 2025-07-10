import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Plus, Activity, TrendingUp, Filter } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import MobileLayout from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContextHybrid";
import { indicatorAPI } from "@/lib/indicator-api";
import { patientIndicatorAPI } from "@/lib/patient-indicator-api";
import { PatientIndicatorValue } from "@/lib/patient-indicator-types";
import { toast } from "@/hooks/use-toast";

const PatientIndicators = () => {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [indicators, setIndicators] = useState<PatientIndicatorValue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("all");

  useEffect(() => {
    const isHospitalContext =
      window.location.pathname.includes("/gerenciamento/");
    if (user?.id || (isHospitalContext && patientId)) {
      loadIndicators();
    }
  }, [user, patientId]);

  // Detectar parâmetro refresh e recarregar dados
  useEffect(() => {
    const refreshParam = searchParams.get("refresh");
    if (refreshParam && user?.id) {
      console.log("🔄 Parâmetro refresh detectado - recarregando indicadores");
      loadIndicators();
      // Limpar o parâmetro da URL
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("refresh");
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, user?.id]);

  // Recarregar quando a página ganha foco (útil para quando volta de outras páginas)
  useEffect(() => {
    const handleFocus = () => {
      if (user?.id) {
        console.log("🔄 Página ganhou foco - recarregando indicadores");
        loadIndicators();
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [user?.id]);

  const loadIndicators = async () => {
    const isHospitalContext =
      window.location.pathname.includes("/gerenciamento/");

    // Em contexto hospitalar, verificar se há sessão hospitalar e patientId
    if (isHospitalContext) {
      const hospitalData = localStorage.getItem("hospital_session");
      if (!hospitalData || !patientId) return;
    } else if (!user?.id) {
      return;
    }

    // Determinar qual ID de paciente usar
    const targetPatientId = patientId || user?.id;

    setIsLoading(true);
    try {
      const indicatorValues =
        await patientIndicatorAPI.getPatientIndicatorValues(targetPatientId);
      console.log("🔍 ===== INDICADORES CARREGADOS =====");
      console.log("📊 Quantidade:", indicatorValues.length);
      console.log("📋 Primeiro indicador:", indicatorValues[0]);
      console.log("📋 Estrutura completa:", indicatorValues);
      setIndicators(indicatorValues);
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

  const handleAddIndicator = () => {
    if (isHospitalContext) {
      navigate(`/gerenciamento/patients/${patientId}/adicionar-indicador`);
    } else if (isViewingOtherPatient) {
      navigate(`/pacientes/${patientId}/adicionar-indicador`);
    } else {
      navigate("/patient/adicionar-indicador");
    }
  };

  const handleViewGraphs = () => {
    if (isHospitalContext) {
      navigate(`/gerenciamento/patients/${patientId}/graficos`);
    } else if (isViewingOtherPatient) {
      navigate(`/pacientes/${patientId}/graficos`);
    } else {
      navigate("/patient/graficos");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR");
  };

  // Extrair categorias e subcategorias únicas
  const uniqueCategories = useMemo(() => {
    const categories = new Set(indicators.map((ind) => ind.categoryName));
    return Array.from(categories).sort();
  }, [indicators]);

  const uniqueSubcategories = useMemo(() => {
    const subcategories = new Set(indicators.map((ind) => ind.subcategoryName));
    return Array.from(subcategories).sort();
  }, [indicators]);

  // Filtrar indicadores baseado nos filtros selecionados
  const filteredIndicators = useMemo(() => {
    return indicators.filter((indicator) => {
      const categoryMatch =
        selectedCategory === "all" ||
        indicator.categoryName === selectedCategory;
      const subcategoryMatch =
        selectedSubcategory === "all" ||
        indicator.subcategoryName === selectedSubcategory;
      return categoryMatch && subcategoryMatch;
    });
  }, [indicators, selectedCategory, selectedSubcategory]);

  // Reset subcategory when category changes
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setSelectedSubcategory("all");
  };

  // Detectar se está sendo acessado pelo sistema hospitalar
  const isHospitalContext =
    window.location.pathname.includes("/gerenciamento/");

  // Determinar contexto de visualização
  const isViewingOtherPatient = patientId && user?.profession === "medico";
  const isOwnIndicators = !patientId && user?.profession === "paciente";
  const isHospitalViewing = patientId && isHospitalContext;

  // Redirecionar se acesso inválido
  if (!isViewingOtherPatient && !isOwnIndicators && !isHospitalViewing) {
    if (user?.profession === "medico") {
      navigate("/pacientes");
    } else if (user?.profession === "paciente") {
      navigate("/patient-dashboard");
    } else if (isHospitalContext) {
      navigate("/gerenciamento/patients");
    } else {
      navigate("/dashboard");
    }
    return null;
  }

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-gray-600">Carregando indicadores...</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          {/* Mobile Header */}
          <div className="block md:hidden">
            <div className="flex items-center mb-4">
              <h1 className="text-lg font-semibold text-gray-900 flex-1">
                {isHospitalViewing || isViewingOtherPatient
                  ? "Indicadores do Paciente"
                  : "Meus Indicadores"}
              </h1>
            </div>

            {/* Mobile Action Buttons */}
            <div className="flex flex-col gap-2">
              {indicators.length > 0 && (
                <Button
                  onClick={handleViewGraphs}
                  variant="outline"
                  className="border-[#00B1BB] text-[#00B1BB] hover:bg-[#00B1BB]/10 w-full"
                  size="sm"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Ver Gráficos
                </Button>
              )}
              {(isViewingOtherPatient || isHospitalViewing) && (
                <Button
                  onClick={handleAddIndicator}
                  className="bg-green-600 hover:bg-green-700 text-white w-full"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar indicador
                </Button>
              )}
              {!isViewingOtherPatient && !isHospitalViewing && (
                <Button
                  onClick={handleAddIndicator}
                  className="bg-green-600 hover:bg-green-700 text-white w-full"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Registro
                </Button>
              )}
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-2xl font-semibold text-gray-900">
                {isHospitalViewing || isViewingOtherPatient
                  ? "Indicadores do Paciente"
                  : "Meus Indicadores"}
              </h1>
            </div>
            <div className="flex gap-3">
              {indicators.length > 0 && (
                <Button
                  onClick={handleViewGraphs}
                  variant="outline"
                  className="border-[#00B1BB] text-[#00B1BB] hover:bg-[#00B1BB]/10"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Ver Gráficos
                </Button>
              )}
              {(isViewingOtherPatient || isHospitalViewing) && (
                <Button
                  onClick={handleAddIndicator}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar indicador
                </Button>
              )}
              {!isViewingOtherPatient && !isHospitalViewing && (
                <Button
                  onClick={handleAddIndicator}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Registro
                </Button>
              )}
            </div>
          </div>
        </div>

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
                {isViewingOtherPatient || isHospitalViewing
                  ? "Este paciente ainda não registrou nenhum indicador de saúde."
                  : "Comece a registrar seus indicadores de saúde para acompanhar sua evolução e compartilhar com seus médicos."}
              </p>
              <Button
                onClick={handleAddIndicator}
                className="bg-[#00B1BB] hover:bg-[#01485E] text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                {isViewingOtherPatient || isHospitalViewing
                  ? "Adicionar Indicador"
                  : "Registrar Primeiro Indicador"}
              </Button>
            </div>
          </div>
        ) : (
          /* Indicators List */
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Registros de Indicadores ({filteredIndicators.length})
                </h2>
              </div>

              {/* Filters */}
              {indicators.length > 0 && (
                <div className="mb-6 p-3 md:p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Filter className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Filtros
                    </span>
                  </div>
                  <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
                    {/* Category Filter */}
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Categoria
                      </label>
                      <Select
                        value={selectedCategory}
                        onValueChange={handleCategoryChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Todas as categorias" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            Todas as categorias
                          </SelectItem>
                          {uniqueCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Subcategory Filter */}
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Subcategoria
                      </label>
                      <Select
                        value={selectedSubcategory}
                        onValueChange={setSelectedSubcategory}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Todas as subcategorias" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            Todas as subcategorias
                          </SelectItem>
                          {uniqueSubcategories.map((subcategory) => (
                            <SelectItem key={subcategory} value={subcategory}>
                              {subcategory}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Clear Filters */}
                  {(selectedCategory !== "all" ||
                    selectedSubcategory !== "all") && (
                    <div className="mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCategory("all");
                          setSelectedSubcategory("all");
                        }}
                        className="text-gray-600 border-gray-300 w-full md:w-auto"
                      >
                        Limpar filtros
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile view - Cards */}
              <div className="block md:hidden space-y-3">
                {filteredIndicators.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">
                    Nenhum indicador encontrado com os filtros selecionados
                  </div>
                ) : (
                  filteredIndicators.map((indicator) => (
                    <div
                      key={indicator.id}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm">
                            {indicator.categoryName || "Categoria"} -{" "}
                            {indicator.subcategoryName || "Subcategoria"}
                          </h4>
                          <p className="text-xs text-gray-600 mt-1">
                            {indicator.parameter || "Parâmetro"}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-semibold text-[#00B1BB]">
                            {indicator.value} {indicator.unitSymbol}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-gray-500">Data:</span>
                          <p className="text-gray-700 font-medium">
                            {indicator.date
                              ? formatDate(indicator.date)
                              : "Não informado"}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Horário:</span>
                          <p className="text-gray-700 font-medium">
                            {indicator.time || "Não informado"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <span className="text-xs text-gray-500">
                          Registrado em: {formatDate(indicator.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Desktop view - Table */}
              <div className="hidden md:block overflow-x-auto">
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
                        Data
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                        Horário
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                        Registrado em
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIndicators.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-8 text-center text-gray-500"
                        >
                          Nenhum indicador encontrado com os filtros
                          selecionados
                        </td>
                      </tr>
                    ) : (
                      filteredIndicators.map((indicator) => (
                        <tr
                          key={indicator.id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-3 px-4">
                            <div>
                              <span className="text-sm font-medium text-gray-900">
                                {indicator.categoryName || "Categoria"} -{" "}
                                {indicator.subcategoryName || "Subcategoria"}
                              </span>
                              <p className="text-xs text-gray-600">
                                {indicator.parameter || "Parâmetro"}
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
                              {indicator.date
                                ? formatDate(indicator.date)
                                : "Não informado"}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-600">
                              {indicator.time || "Não informado"}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-600">
                              {formatDate(indicator.createdAt)}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default PatientIndicators;
