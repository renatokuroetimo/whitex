import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, MoreHorizontal, Trash2 } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useAuth } from "@/contexts/AuthContext";
import { patientAPI } from "@/lib/patient-api";
import { Patient, PaginationData } from "@/lib/patient-types";
import { toast } from "@/hooks/use-toast";

const Pacientes = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Carregar pacientes
  const loadPatients = async (page: number = 1, search?: string) => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      // Inicializar dados mock se necessário
      patientAPI.initializeMockData(user.id);

      const result = await patientAPI.getPatients(user.id, page, 10, search);
      setPatients(result.patients);
      setPagination(result.pagination);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar pacientes",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, [user?.id]);

  // Busca com debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      loadPatients(1, searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Seleção de pacientes
  const handleSelectPatient = (patientId: string, checked: boolean) => {
    if (checked) {
      setSelectedPatients((prev) => [...prev, patientId]);
    } else {
      setSelectedPatients((prev) => prev.filter((id) => id !== patientId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPatients(patients.map((p) => p.id));
    } else {
      setSelectedPatients([]);
    }
  };

  // Deletar pacientes selecionados
  const handleDeleteSelected = async () => {
    try {
      await patientAPI.deletePatients(selectedPatients);
      setSelectedPatients([]);
      setShowDeleteDialog(false);
      loadPatients(pagination.currentPage, searchTerm);

      toast({
        title: "Sucesso",
        description: `${selectedPatients.length} paciente(s) deletado(s)`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao deletar pacientes",
      });
    }
  };

  // Paginação
  const handlePageChange = (page: number) => {
    loadPatients(page, searchTerm);
  };

  const renderPagination = () => {
    const pages = [];
    const { currentPage, totalPages } = pagination;

    // Primeira página
    if (currentPage > 1) {
      pages.push(
        <button
          key="prev"
          onClick={() => handlePageChange(currentPage - 1)}
          className="px-3 py-1 text-gray-500 hover:text-gray-700"
        >
          ←
        </button>,
      );
    }

    // Páginas numeradas
    for (let i = 1; i <= Math.min(totalPages, 6); i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 ${
            i === currentPage
              ? "text-blue-600 font-medium"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {i}
        </button>,
      );
    }

    // Reticências e última página
    if (totalPages > 6) {
      pages.push(
        <span key="dots" className="px-3 py-1 text-gray-400">
          ...
        </span>,
      );
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="px-3 py-1 text-gray-500 hover:text-gray-700"
        >
          {totalPages}
        </button>,
      );
    }

    // Próxima página
    if (currentPage < totalPages) {
      pages.push(
        <button
          key="next"
          onClick={() => handlePageChange(currentPage + 1)}
          className="px-3 py-1 text-gray-500 hover:text-gray-700"
        >
          →
        </button>,
      );
    }

    return pages;
  };

  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Pacientes</h1>
            <button
              onClick={() => navigate(-1)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              ← Voltar
            </button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200">
            {/* Search and Actions */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center gap-4">
                <div className="flex-1 max-w-md relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Pesquisar"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex items-center gap-3">
                  {selectedPatients.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Deletar ({selectedPatients.length})
                    </Button>
                  )}

                  <Button
                    size="sm"
                    onClick={() => navigate("/pacientes/novo")}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Criar paciente
                  </Button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="w-12 px-6 py-3 text-left">
                      <Checkbox
                        checked={
                          patients.length > 0 &&
                          selectedPatients.length === patients.length
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Paciente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        Carregando...
                      </td>
                    </tr>
                  ) : patients.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        {searchTerm
                          ? "Nenhum paciente encontrado"
                          : "Nenhum paciente cadastrado"}
                      </td>
                    </tr>
                  ) : (
                    patients.map((patient) => (
                      <tr key={patient.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <Checkbox
                            checked={selectedPatients.includes(patient.id)}
                            onCheckedChange={(checked) =>
                              handleSelectPatient(
                                patient.id,
                                checked as boolean,
                              )
                            }
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {patient.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-800"
                          >
                            {patient.status.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() =>
                                navigate(`/pacientes/${patient.id}`)
                              }
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Ver perfil
                            </button>
                            <button
                              onClick={() =>
                                navigate(`/pacientes/${patient.id}/editar`)
                              }
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Editar perfil
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Mostrando{" "}
                    {Math.min(pagination.itemsPerPage, pagination.totalItems)}{" "}
                    de {pagination.totalItems} pacientes
                  </div>
                  <div className="flex items-center space-x-1">
                    {renderPagination()}
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Action */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <Button
                onClick={() => navigate("/pacientes/novo")}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Criar novo paciente
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Deletar pacientes"
        description={`Tem certeza que deseja deletar ${selectedPatients.length} paciente(s)? Esta ação não pode ser desfeita.`}
        confirmText="Deletar"
        cancelText="Cancelar"
        onConfirm={handleDeleteSelected}
        variant="destructive"
      />
    </div>
  );
};

export default Pacientes;
