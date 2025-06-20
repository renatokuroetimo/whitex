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
  const [isSharedPatient, setIsSharedPatient] = useState(false);
  const [formData, setFormData] = useState<PatientFormData>({
    name: "",
    age: 0,
    city: "",
    state: "",
    weight: 0,
    status: "ativo",
    notes: "",
    email: "",
    phone: "",
    birthDate: "",
    gender: "",
    healthPlan: "",
    height: 0,
    smoker: false,
    highBloodPressure: false,
    physicalActivity: false,
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

    try {
      setIsLoading(true);
      const patient = await patientAPI.getPatientById(id);

      if (patient) {
        // Carregar dados básicos
        setFormData({
          name: patient.name || "",
          age: patient.age || 0,
          city: patient.city || "",
          state: patient.state || "",
          weight: patient.weight || 0,
          status: patient.status as "ativo" | "inativo",
          notes: patient.notes || "",
          email: patient.email || "",
          phone: "",
          birthDate: "",
          gender: "",
          healthPlan: "",
          height: 0,
          smoker: false,
          highBloodPressure: false,
          physicalActivity: false,
        });

        // Carregar dados pessoais adicionais do banco
        try {
          const { data: personalData } = await patientAPI.supabase
            ?.from("patient_personal_data")
            .select("*")
            .eq("user_id", id)
            .single();

          const { data: medicalData } = await patientAPI.supabase
            ?.from("patient_medical_data")
            .select("*")
            .eq("user_id", id)
            .single();

          if (personalData || medicalData) {
            setFormData((prev) => ({
              ...prev,
              email: personalData?.email || prev.email,
              phone: personalData?.phone || prev.phone,
              birthDate: personalData?.birth_date || prev.birthDate,
              gender: personalData?.gender || prev.gender,
              healthPlan: personalData?.health_plan || prev.healthPlan,
              city: personalData?.city || prev.city,
              state: personalData?.state || prev.state,
              height: medicalData?.height || prev.height,
              weight: medicalData?.weight || prev.weight,
              smoker: medicalData?.smoker || prev.smoker,
              highBloodPressure:
                medicalData?.high_blood_pressure || prev.highBloodPressure,
              physicalActivity:
                medicalData?.physical_activity || prev.physicalActivity,
            }));

            if (personalData?.state) {
              setSelectedState(personalData.state);
              const cities = getCitiesByState(personalData.state);
              setAvailableCities(cities);
            }
          }
        } catch (error) {
          console.warn("Aviso: erro ao carregar dados complementares:", error);
        }

        if (patient.state) {
          setSelectedState(patient.state);
          const cities = getCitiesByState(patient.state);
          setAvailableCities(cities);
        }

        // Check if this is a shared patient
        setIsSharedPatient(patient.isShared || false);
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

  const handleInputChange = (field: keyof PatientFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleStateChange = (stateId: string) => {
    setSelectedState(stateId);
    setFormData((prev) => ({ ...prev, state: stateId }));
    const cities = getCitiesByState(stateId);
    setAvailableCities(cities);
    // Reset city when state changes
    setFormData((prev) => ({ ...prev, city: "" }));
  };

  const handleDiagnosisInputChange = (field: string, value: string) => {
    setDiagnosisForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddDiagnosis = async () => {
    if (!diagnosisForm.cid || !diagnosisForm.diagnosis || !id) return;

    try {
      setIsLoading(true);
      await patientAPI.addDiagnosis(id, {
        date: new Date().toISOString().split("T")[0],
        diagnosis: diagnosisForm.diagnosis,
        code: diagnosisForm.cid,
        status: diagnosisForm.diagnosis,
      });

      toast({
        title: "Sucesso",
        description: "Diagnóstico adicionado com sucesso",
      });

      // Reset form
      setDiagnosisForm({ cid: "", diagnosis: "" });
      setIsAddingDiagnosis(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Erro ao adicionar diagnóstico",
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

    // Validation for non-shared patients
    if (!isSharedPatient) {
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
    }

    setIsLoading(true);

    try {
      if (isEditing && id) {
        const result = await patientAPI.updatePatient(id, formData);

        if (!result) {
          throw new Error("Operação retornou resultado vazio");
        }

        toast({
          title: "Sucesso",
          description: "Paciente atualizado com sucesso",
        });
        navigate(`/pacientes/${id}`);
      } else {
        if (!user?.id) return;
        const newPatient = await patientAPI.createPatient(formData);
        toast({
          title: "Sucesso",
          description: "Paciente criado com sucesso",
        });
        navigate(`/pacientes/${newPatient.id}`);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Erro ao processar operação",
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

  const handleDeletePatient = async () => {
    if (!id) return;

    const confirmed = window.confirm(
      `Tem certeza que deseja apagar o paciente "${formData.name}"? Esta ação não pode ser desfeita.`,
    );

    if (!confirmed) return;

    try {
      setIsLoading(true);
      await patientAPI.deletePatients([id]);
      toast({
        title: "Sucesso",
        description: "Paciente removido com sucesso",
      });
      navigate("/pacientes");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao remover paciente",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <h1 className="text-2xl font-semibold text-gray-900">
                {isEditing
                  ? isSharedPatient
                    ? "Adicionar Diagnósticos"
                    : "Editar Paciente"
                  : "Novo Paciente"}
              </h1>
            </div>
          </div>

          <div className="max-w-2xl">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-1">
                  {isSharedPatient
                    ? "Diagnósticos e Observações"
                    : "Dados do paciente"}
                </h2>
                <p className="text-sm text-gray-600">
                  {isSharedPatient
                    ? "Adicione diagnósticos e observações para este paciente compartilhado"
                    : "Preencha as informações básicas do paciente"}
                </p>
                {isSharedPatient && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Paciente Compartilhado:</strong> Você pode apenas
                      adicionar diagnósticos e observações. Os dados pessoais
                      são gerenciados pelo paciente.
                    </p>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                  {/* Dados pessoais - ocultos para pacientes compartilhados */}
                  {!isSharedPatient && (
                    <>
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
                            handleInputChange(
                              "age",
                              parseInt(e.target.value) || 0,
                            )
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
                                {state.name}
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
                            <SelectValue placeholder="Selecione a cidade" />
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

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <Input
                          type="email"
                          value={formData.email || ""}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                          placeholder="email@exemplo.com"
                          className="w-full"
                        />
                      </div>

                      {/* Telefone */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Telefone
                        </label>
                        <Input
                          value={formData.phone || ""}
                          onChange={(e) =>
                            handleInputChange("phone", e.target.value)
                          }
                          placeholder="(11) 99999-9999"
                          className="w-full"
                        />
                      </div>

                      {/* Data de Nascimento */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Data de Nascimento *
                        </label>
                        <Input
                          type="date"
                          value={formData.birthDate || ""}
                          onChange={(e) =>
                            handleInputChange("birthDate", e.target.value)
                          }
                          className="w-full"
                          required
                        />
                      </div>

                      {/* Gênero */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Gênero
                        </label>
                        <Select
                          value={formData.gender || ""}
                          onValueChange={(value) =>
                            handleInputChange("gender", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o gênero" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="masculino">Masculino</SelectItem>
                            <SelectItem value="feminino">Feminino</SelectItem>
                            <SelectItem value="outro">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Plano de Saúde */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Plano de Saúde
                        </label>
                        <Input
                          value={formData.healthPlan || ""}
                          onChange={(e) =>
                            handleInputChange("healthPlan", e.target.value)
                          }
                          placeholder="Nome do plano de saúde"
                          className="w-full"
                        />
                      </div>

                      {/* Altura */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Altura (cm)
                        </label>
                        <Input
                          type="number"
                          value={formData.height || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "height",
                              parseInt(e.target.value) || 0,
                            )
                          }
                          placeholder="Altura em cm"
                          className="w-full"
                          min="50"
                          max="250"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                          Condições Médicas
                        </h3>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                          {/* Fumante */}
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="smoker"
                              checked={formData.smoker || false}
                              onChange={(e) =>
                                handleInputChange("smoker", e.target.checked)
                              }
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label
                              htmlFor="smoker"
                              className="text-sm font-medium text-gray-700"
                            >
                              Fumante
                            </label>
                          </div>

                          {/* Pressão Alta */}
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="highBloodPressure"
                              checked={formData.highBloodPressure || false}
                              onChange={(e) =>
                                handleInputChange(
                                  "highBloodPressure",
                                  e.target.checked,
                                )
                              }
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label
                              htmlFor="highBloodPressure"
                              className="text-sm font-medium text-gray-700"
                            >
                              Pressão Alta
                            </label>
                          </div>

                          {/* Atividade Física */}
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="physicalActivity"
                              checked={formData.physicalActivity || false}
                              onChange={(e) =>
                                handleInputChange(
                                  "physicalActivity",
                                  e.target.checked,
                                )
                              }
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label
                              htmlFor="physicalActivity"
                              className="text-sm font-medium text-gray-700"
                            >
                              Pratica Atividade Física
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Status
                        </label>
                        <Select
                          value={formData.status}
                          onValueChange={(value) =>
                            handleInputChange(
                              "status",
                              value as "ativo" | "inativo",
                            )
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
                    </>
                  )}

                  {/* Diagnósticos - apenas para pacientes compartilhados */}
                  {isSharedPatient && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Diagnósticos
                      </label>

                      {!isAddingDiagnosis && (
                        <Button
                          type="button"
                          onClick={() => setIsAddingDiagnosis(true)}
                          className="mb-4"
                          size="sm"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Adicionar Diagnóstico
                        </Button>
                      )}

                      {isAddingDiagnosis && (
                        <div className="border border-gray-200 rounded-lg p-4 mb-4">
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  CID-10
                                </label>
                                <Input
                                  value={diagnosisForm.cid}
                                  onChange={(e) =>
                                    handleDiagnosisInputChange(
                                      "cid",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Ex: I10"
                                  className="w-full"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Diagnóstico
                                </label>
                                <Input
                                  value={diagnosisForm.diagnosis}
                                  onChange={(e) =>
                                    handleDiagnosisInputChange(
                                      "diagnosis",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Ex: Hipertensão arterial"
                                  className="w-full"
                                />
                              </div>
                            </div>

                            {/* Botões do diagnóstico */}
                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={cancelAddDiagnosis}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Cancelar
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                onClick={handleAddDiagnosis}
                                disabled={isLoading}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Adicionar
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {!isAddingDiagnosis && (
                        <p className="text-sm text-gray-500">
                          Os diagnósticos são exibidos no histórico do paciente
                          após serem adicionados.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Observações */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {isSharedPatient ? "Observações Médicas" : "Observações"}
                    </label>
                    <Textarea
                      value={formData.notes || ""}
                      onChange={(e) =>
                        handleInputChange("notes", e.target.value)
                      }
                      placeholder={
                        isSharedPatient
                          ? "Adicione observações médicas sobre o paciente..."
                          : "Adicione observações sobre o paciente (ex: precisa ficar em repouso)"
                      }
                      className="w-full"
                      rows={isSharedPatient ? 4 : 3}
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
                        ? isSharedPatient
                          ? "Salvar diagnósticos"
                          : "Salvar alterações"
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
