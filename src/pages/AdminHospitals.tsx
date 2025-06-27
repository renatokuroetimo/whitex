import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Plus, Edit2, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { hospitalAPI } from "@/lib/hospital-api";
import { toast } from "@/hooks/use-toast";
import ConfirmDialog from "@/components/ConfirmDialog";

interface Hospital {
  id: string;
  name: string;
  createdAt: string;
}

const AdminHospitals = () => {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [hospitalToDelete, setHospitalToDelete] = useState<Hospital | null>(
    null,
  );
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    loadHospitals();
  }, []);

  const loadHospitals = async () => {
    try {
      setIsLoading(true);
      const data = await hospitalAPI.getHospitals();
      setHospitals(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar hospitais",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateHospital = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Nome do hospital é obrigatório",
      });
      return;
    }

    if (!formData.email.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Email é obrigatório",
      });
      return;
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Email inválido",
      });
      return;
    }

    try {
      await hospitalAPI.createHospital({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: "123456", // Senha padrão
      });

      toast({
        title: "Sucesso",
        description: "Hospital cadastrado com sucesso",
      });

      setFormData({ name: "", email: "" });
      setIsCreateDialogOpen(false);
      loadHospitals();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Erro ao cadastrar hospital",
      });
    }
  };

  const handleEditHospital = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingHospital || !formData.name.trim()) {
      return;
    }

    try {
      await hospitalAPI.updateHospital(editingHospital.id, {
        name: formData.name.trim(),
      });

      toast({
        title: "Sucesso",
        description: "Hospital atualizado com sucesso",
      });

      setFormData({ name: "" });
      setIsEditDialogOpen(false);
      setEditingHospital(null);
      loadHospitals();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Erro ao atualizar hospital",
      });
    }
  };

  const handleDeleteHospital = async () => {
    if (!hospitalToDelete) return;

    try {
      await hospitalAPI.deleteHospital(hospitalToDelete.id);

      toast({
        title: "Sucesso",
        description: "Hospital removido com sucesso",
      });

      setShowDeleteDialog(false);
      setHospitalToDelete(null);
      loadHospitals();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Erro ao remover hospital",
      });
    }
  };

  const openEditDialog = (hospital: Hospital) => {
    setEditingHospital(hospital);
    setFormData({ name: hospital.name });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (hospital: Hospital) => {
    setHospitalToDelete(hospital);
    setShowDeleteDialog(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate("/admin")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Painel
          </Button>

          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Gerenciar Hospitais e Clínicas
              </h1>
              <p className="text-gray-600">
                Cadastre e gerencie instituições médicas do sistema
              </p>
            </div>

            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Hospital
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cadastrar Hospital/Clínica</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateHospital} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome da Instituição</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Digite o nome do hospital ou clínica"
                      required
                    />
                  </div>
                  <div className="bg-blue-50 p-3 rounded-md">
                    <p className="text-sm text-blue-700">
                      <strong>Senha padrão:</strong> 123456
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      A instituição poderá alterar a senha após o primeiro login
                    </p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit">Cadastrar</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Hospitals Table */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-800">
                Instituições Cadastradas
              </h2>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="text-gray-500 mt-2">Carregando...</p>
              </div>
            ) : hospitals.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum hospital cadastrado
                </h3>
                <p className="text-gray-500">
                  Comece cadastrando a primeira instituição médica
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome da Instituição</TableHead>
                    <TableHead>Data de Cadastro</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hospitals.map((hospital) => (
                    <TableRow key={hospital.id}>
                      <TableCell className="font-medium">
                        {hospital.name}
                      </TableCell>
                      <TableCell>
                        {new Date(hospital.createdAt).toLocaleDateString(
                          "pt-BR",
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(hospital)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteDialog(hospital)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Hospital/Clínica</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditHospital} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nome da Instituição</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Digite o nome do hospital ou clínica"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          title="Remover Hospital"
          description={`Tem certeza que deseja remover "${hospitalToDelete?.name}"? Esta ação não pode ser desfeita.`}
          confirmText="Remover"
          cancelText="Cancelar"
          onConfirm={handleDeleteHospital}
          variant="destructive"
        />
      </div>
    </div>
  );
};

export default AdminHospitals;
