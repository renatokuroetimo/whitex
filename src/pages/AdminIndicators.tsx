import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  LogOut,
  Search,
  Filter,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { adminAPI } from "@/lib/admin-api";
import { IndicatorWithDetails } from "@/lib/indicator-types";
import ConfirmDialog from "@/components/ConfirmDialog";
import { toast } from "@/hooks/use-toast";

const AdminIndicators = () => {
  const navigate = useNavigate();
  const [indicators, setIndicators] = useState<IndicatorWithDetails[]>([]);
  const [filteredIndicators, setFilteredIndicators] = useState<
    IndicatorWithDetails[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [indicatorToDelete, setIndicatorToDelete] = useState<string | null>(
    null,
  );

  const currentAdmin = adminAPI.getCurrentAdmin();

  useEffect(() => {
    loadIndicators();
  }, []);

  useEffect(() => {
    filterIndicators();
  }, [indicators, searchTerm, selectedCategory]);

  const loadIndicators = async () => {
    try {
      setIsLoading(true);
      const data = await adminAPI.getStandardIndicators();
      setIndicators(data);
      console.log("✅ Indicadores padrão carregados:", data.length);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Erro ao carregar indicadores",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterIndicators = () => {
    let filtered = indicators;

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(
        (indicator) =>
          indicator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          indicator.parameter
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          indicator.categoryName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          indicator.subcategoryName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
    }

    // Filtrar por categoria
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (indicator) => indicator.categoryName === selectedCategory,
      );
    }

    setFilteredIndicators(filtered);
  };

  const handleLogout = () => {
    adminAPI.logout();
    navigate("/admin/login");
  };

  const handleEditIndicator = (id: string) => {
    navigate(`/admin/indicators/edit/${id}`);
  };

  const handleDeleteIndicator = async () => {
    if (!indicatorToDelete) return;

    try {
      await adminAPI.deleteStandardIndicator(indicatorToDelete);
      toast({
        title: "Sucesso",
        description: "Indicador padrão deletado com sucesso",
      });
      loadIndicators();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Erro ao deletar indicador",
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

  const getUniqueCategories = () => {
    const categories = [...new Set(indicators.map((ind) => ind.categoryName))];
    return categories.sort();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-slate-600">Carregando indicadores padrão...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">
                  Painel Administrativo
                </h1>
                <p className="text-sm text-slate-600">
                  Indicadores Padrão do Sistema
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600">
                Bem-vindo, {currentAdmin?.fullName || currentAdmin?.email}
              </span>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="text-slate-600"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Buscar por nome, parâmetro, categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">Todas as Categorias</option>
            {getUniqueCategories().map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <Button
            onClick={() => navigate("/admin/indicators/create")}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Indicador
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total de Indicadores</p>
                <p className="text-3xl font-bold text-slate-900">
                  {indicators.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Categorias</p>
                <p className="text-3xl font-bold text-slate-900">
                  {getUniqueCategories().length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Filter className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Filtrados</p>
                <p className="text-3xl font-bold text-slate-900">
                  {filteredIndicators.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Search className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Indicators Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">
              Indicadores Padrão ({filteredIndicators.length})
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Gerencie os indicadores padrão do sistema
            </p>
          </div>

          {filteredIndicators.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                Nenhum indicador encontrado
              </h3>
              <p className="text-slate-600 mb-6">
                {searchTerm || selectedCategory !== "all"
                  ? "Tente ajustar os filtros de busca"
                  : "Não há indicadores padrão cadastrados"}
              </p>
              {indicators.length === 0 && (
                <Button
                  onClick={() => navigate("/admin/indicators/create")}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Indicador
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left py-3 px-6 font-medium text-slate-700 text-sm">
                      Indicador
                    </th>
                    <th className="text-left py-3 px-6 font-medium text-slate-700 text-sm">
                      Categoria
                    </th>
                    <th className="text-left py-3 px-6 font-medium text-slate-700 text-sm">
                      Tipo de Dados
                    </th>
                    <th className="text-left py-3 px-6 font-medium text-slate-700 text-sm">
                      Obrigatoriedade
                    </th>
                    <th className="text-left py-3 px-6 font-medium text-slate-700 text-sm">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIndicators.map((indicator) => (
                    <tr
                      key={indicator.id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-medium text-slate-900">
                            {indicator.parameter}
                          </div>
                          <div className="text-sm text-slate-600">
                            {indicator.subcategoryName} • {indicator.unitSymbol}
                          </div>
                          {indicator.definition && (
                            <div className="text-xs text-slate-500 mt-1 max-w-xs truncate">
                              {indicator.definition}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant="secondary" className="text-xs">
                          {indicator.categoryName}
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-slate-600">
                          {indicator.dataType || "não definido"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-1">
                          {indicator.requiresDate && (
                            <Badge variant="outline" className="text-xs">
                              Data
                            </Badge>
                          )}
                          {indicator.requiresTime && (
                            <Badge variant="outline" className="text-xs">
                              Horário
                            </Badge>
                          )}
                          {indicator.isRequired && (
                            <Badge variant="destructive" className="text-xs">
                              Obrigatório
                            </Badge>
                          )}
                          {indicator.isConditional && (
                            <Badge
                              variant="outline"
                              className="text-xs border-orange-300 text-orange-700"
                            >
                              Condicional
                            </Badge>
                          )}
                          {!indicator.requiresDate &&
                            !indicator.requiresTime &&
                            !indicator.isRequired &&
                            !indicator.isConditional && (
                              <span className="text-xs text-slate-400">
                                Opcional
                              </span>
                            )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEditIndicator(indicator.id)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => confirmDelete(indicator.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Deletar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Deletar Indicador Padrão"
        description="Tem certeza que deseja deletar este indicador padrão? Esta ação não pode ser desfeita e pode afetar o sistema inteiro."
        confirmText="Deletar"
        cancelText="Cancelar"
        onConfirm={handleDeleteIndicator}
        variant="destructive"
      />
    </div>
  );
};

export default AdminIndicators;
