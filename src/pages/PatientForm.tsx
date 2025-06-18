import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, X } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContextHybrid";
import { patientAPI } from "@/lib/patient-api";
import { PatientFormData } from "@/lib/patient-types";
import { brazilStates, getCitiesByState } from "@/lib/brazil-locations";
import { toast } from "@/hooks/use-toast";

const PatientForm = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = Boolean(id);

  const [isLoading, setIsLoading] = useState(false);
  const [selectedState, setSelectedState] = useState("");
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [formData, setFormData] = useState<PatientFormData>({
    name: "",
    age: 0,
    city: "",
    state: "",
    weight: 0,
    status: "ativo",
    notes: "",
  });

  // Diagnosis form state
  const [diagnosisForm, setDiagnosisForm] = useState({
    cid: "",
    diagnosis: "",
  });
  const [isAddingDiagnosis, setIsAddingDiagnosis] = useState(false);

  useEffect(() => {
    if (isEditing && id) {
      loadPatientData();
    }
  }, [isEditing, id]);

  const loadPatientData = async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      const patient = await patientAPI.getPatientById(id);
      if (patient) {
        setFormData({
          name: patient.name,
          age: patient.age,
          city: patient.city,
          state: patient.state,
          weight: patient.weight,
          status: patient.status,
          notes: patient.notes || "",
        });
        setSelectedState(patient.state);
        setAvailableCities(getCitiesByState(patient.state));
      }
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

  const handleStateChange = (stateId: string) => {
    setSelectedState(stateId);
    setAvailableCities(getCitiesByState(stateId));
    setFormData((prev) => ({
      ...prev,
      state: stateId,
      city: "", // Reset cidade quando muda estado
    }));
  };

  const handleInputChange = (field: keyof PatientFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDiagnosisInputChange = (field: string, value: string) => {
    setDiagnosisForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddDiagnosis = async () => {
    if (!diagnosisForm.cid.trim() || !diagnosisForm.diagnosis.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "CID e Diagnóstico são obrigatórios",
      });
      return;
    }

    if (!id) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Salve o paciente primeiro para adicionar diagnósticos",
      });
      return;
    }

    setIsLoading(true);
    try {
      await patientAPI.addDiagnosis(id, {
        date: new Date().toLocaleDateString("pt-BR"),
        status: diagnosisForm.diagnosis,
        code: diagnosisForm.cid,
      });

      setDiagnosisForm({ cid: "", diagnosis: "" });
      setIsAddingDiagnosis(false);

      toast({
        title: "Sucesso",
        description: "Diagnóstico adicionado com sucesso",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao adicionar diagnóstico",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const cancelAddDiagnosis = () => {
    setDiagnosisForm({ cid: "", diagnosis: "" });
    setIsAddingDiagnosis(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Limpar console para focar nos logs importantes
    console.clear();
    console.log("🎯 === INICIANDO CRIAÇÃO DE PACIENTE ===");

    // Validações
    if (!formData.name.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Nome é obrigatório",
      });
      return;
    }

    if (formData.age <= 0) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Idade deve ser maior que 0",
      });
      return;
    }

    if (!formData.state) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Estado é obrigatório",
      });
      return;
    }

    if (!formData.city) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Cidade é obrigatória",
      });
      return;
    }

    if (formData.weight <= 0) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Peso deve ser maior que 0",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isEditing && id) {
        await patientAPI.updatePatient(id, formData);
        toast({
          title: "Sucesso",
          description: "Paciente atualizado com sucesso",
        });
        navigate(`/pacientes/${id}`);
      } else {
        if (!user?.id) return;
        const newPatient = await patientAPI.createPatient(user.id, formData);
        toast({
          title: "Sucesso",
          description: "Paciente criado com sucesso",
        });
        navigate(`/pacientes/${newPatient.id}`);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: isEditing
          ? "Erro ao atualizar paciente"
          : "Erro ao criar paciente",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (isEditing && id) {
      navigate(`/pacientes/${id}`);
    } else {
      navigate("/pacientes");
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <h1 className="text-2xl font-semibold text-gray-900">
                {isEditing ? "Editar Paciente" : "Novo Paciente"}
              </h1>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              ← Voltar
            </button>
          </div>

          <div className="max-w-2xl">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-1">
                  Dados do paciente
                </h2>
                <p className="text-sm text-gray-600">
                  Preencha as informações básicas do paciente
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                  {/* Nome */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome completo *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder="Digite o nome completo"
                      className="w-full"
                      required
                    />
                  </div>

                  {/* Idade */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Idade *
                    </label>
                    <Input
                      type="number"
                      value={formData.age || ""}
                      onChange={(e) =>
                        handleInputChange("age", parseInt(e.target.value) || 0)
                      }
                      placeholder="Idade"
                      className="w-full"
                      min="1"
                      max="120"
                      required
                    />
                  </div>

                  {/* Peso */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Peso (kg) *
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.weight || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "weight",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      placeholder="Peso em kg"
                      className="w-full"
                      min="1"
                      max="500"
                      required
                    />
                  </div>

                  {/* Estado */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado *
                    </label>
                    <Select
                      value={formData.state}
                      onValueChange={handleStateChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {brazilStates.map((state) => (
                          <SelectItem key={state.id} value={state.id}>
                            {state.name} ({state.abbreviation})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Cidade */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cidade *
                    </label>
                    <Select
                      value={formData.city}
                      onValueChange={(value) =>
                        handleInputChange("city", value)
                      }
                      disabled={!selectedState}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            selectedState
                              ? "Selecione a cidade"
                              : "Primeiro selecione o estado"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: "ativo" | "inativo") =>
                        handleInputChange("status", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="inativo">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Observações */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Observações
                    </label>
                    <Textarea
                      value={formData.notes || ""}
                      onChange={(e) =>
                        handleInputChange("notes", e.target.value)
                      }
                      placeholder="Adicione observações sobre o paciente (ex: precisa ficar em repouso)"
                      className="w-full"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading
                      ? isEditing
                        ? "Salvando..."
                        : "Criando..."
                      : isEditing
                        ? "Salvar alterações"
                        : "Criar paciente"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientForm;
