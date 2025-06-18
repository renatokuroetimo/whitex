import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, User, Plus, Search, Share2, X } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { patientProfileAPI } from "@/lib/patient-profile-api";
import { brazilStates, getCitiesByState } from "@/lib/brazil-locations";
import {
  PatientPersonalData,
  PatientMedicalData,
  Doctor,
  PatientPersonalFormData,
  PatientMedicalFormData,
} from "@/lib/patient-profile-types";
import { toast } from "@/hooks/use-toast";

const PatientProfile = () => {
  const { user, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados gerais
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("perfil");

  // Estados dos dados pessoais
  const [personalData, setPersonalData] = useState<PatientPersonalFormData>({
    fullName: "",
    birthDate: "",
    gender: "masculino",
    state: "",
    city: "",
    healthPlan: "",
  });

  // Estados dos dados médicos
  const [medicalData, setMedicalData] = useState<PatientMedicalFormData>({
    height: undefined,
    weight: undefined,
    smoker: false,
    highBloodPressure: false,
    physicalActivity: false,
    exerciseFrequency: undefined,
    healthyDiet: false,
  });

  // Estados para médicos compartilhados
  const [sharedDoctors, setSharedDoctors] = useState<Doctor[]>([]);
  const [searchDoctors, setSearchDoctors] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDoctorDialog, setShowAddDoctorDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  // Estados para dropdowns
  const [selectedState, setSelectedState] = useState("");
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  useEffect(() => {
    if (personalData.state) {
      setSelectedState(personalData.state);
      setAvailableCities(getCitiesByState(personalData.state));
    }
  }, [personalData.state]);

  const loadData = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      // First ensure registered doctors are loaded
      await patientProfileAPI.loadRegisteredDoctors();

      const [personal, medical, doctors] = await Promise.all([
        patientProfileAPI.getPatientPersonalData(user.id),
        patientProfileAPI.getPatientMedicalData(user.id),
        patientProfileAPI.getSharedDoctors(user.id),
      ]);

      if (personal) {
        setPersonalData({
          fullName: personal.fullName,
          birthDate: personal.birthDate,
          gender: personal.gender,
          state: personal.state,
          city: personal.city,
          healthPlan: personal.healthPlan || "",
        });
      }

      if (medical) {
        setMedicalData({
          height: medical.height,
          weight: medical.weight,
          smoker: medical.smoker,
          highBloodPressure: medical.highBloodPressure,
          physicalActivity: medical.physicalActivity,
          exerciseFrequency: medical.exerciseFrequency,
          healthyDiet: medical.healthyDiet,
        });
      }

      setSharedDoctors(doctors);

      // Carregar imagem de perfil
      const savedImage = localStorage.getItem(`profile_image_${user.id}`);
      if (savedImage) {
        setProfileImage(savedImage);
      }
    } catch (error) {
      console.error("Error loading PatientProfile data:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar dados do perfil",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePersonalDataSave = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      await patientProfileAPI.savePatientPersonalData(user.id, personalData);
      toast({
        title: "Sucesso",
        description: "Dados pessoais salvos com sucesso",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao salvar dados pessoais",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMedicalDataSave = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      await patientProfileAPI.savePatientMedicalData(user.id, medicalData);
      toast({
        title: "Sucesso",
        description: "Dados médicos salvos com sucesso",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao salvar dados médicos",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStateChange = (stateId: string) => {
    console.log("State changed to:", stateId);
    setSelectedState(stateId);
    const cities = getCitiesByState(stateId);
    console.log("Cities for state:", cities);
    setAvailableCities(cities);
    setPersonalData((prev) => ({
      ...prev,
      state: stateId,
      city: "", // Reset cidade quando muda estado
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "A imagem deve ter no máximo 5MB",
        });
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Por favor, selecione apenas arquivos de imagem",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfileImage(result);
        localStorage.setItem(`profile_image_${user?.id}`, result);

        // Dispatch custom event to notify sidebar
        window.dispatchEvent(
          new CustomEvent("profileImageUpdated", {
            detail: { userId: user?.id },
          }),
        );

        toast({
          title: "Sucesso!",
          description: "Imagem de perfil atualizada",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    if (!isViewingOtherPatient) {
      fileInputRef.current?.click();
    }
  };

  const searchForDoctors = async () => {
    try {
      const results = await patientProfileAPI.searchDoctors(searchQuery);
      setSearchDoctors(results);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao buscar médicos",
      });
    }
  };

  const handleShareWithDoctor = async () => {
    if (!selectedDoctor || !user?.id) return;

    try {
      await patientProfileAPI.shareDataWithDoctor(user.id, selectedDoctor.id);
      toast({
        title: "Sucesso",
        description: `Dados compartilhados com ${selectedDoctor.name}`,
      });

      // Recarregar lista de médicos compartilhados
      const updatedDoctors = await patientProfileAPI.getSharedDoctors(user.id);
      setSharedDoctors(updatedDoctors);

      setShowShareDialog(false);
      setShowAddDoctorDialog(false);
      setSelectedDoctor(null);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao compartilhar dados",
      });
    }
  };

  const handleStopSharing = async (doctor: Doctor) => {
    if (!user?.id) return;

    try {
      await patientProfileAPI.stopSharingWithDoctor(user.id, doctor.id);
      toast({
        title: "Sucesso",
        description: `Compartilhamento com ${doctor.name} interrompido`,
      });

      // Recarregar lista
      const updatedDoctors = await patientProfileAPI.getSharedDoctors(user.id);
      setSharedDoctors(updatedDoctors);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao parar compartilhamento",
      });
    }
  };

  if (!user) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-gray-600">Carregando usuário...</p>
        </div>
      </div>
    );
  }

  if (user.profession !== "paciente") {
    navigate("/dashboard");
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-semibold text-gray-900">
                {isViewingOtherPatient
                  ? "Perfil do Paciente"
                  : "Dados pessoais"}
              </h1>
              <button
                onClick={() =>
                  navigate(
                    isViewingOtherPatient ? "/pacientes" : "/patient-dashboard",
                  )
                }
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                ← Voltar
              </button>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList
                className={`grid w-full ${isViewingOtherPatient ? "grid-cols-2" : "grid-cols-3"}`}
              >
                <TabsTrigger value="perfil">Perfil</TabsTrigger>
                <TabsTrigger value="dados-medicos">Dados médicos</TabsTrigger>
                {!isViewingOtherPatient && (
                  <TabsTrigger value="medicos">Médicos</TabsTrigger>
                )}
              </TabsList>

              {/* Tab Perfil */}
              <TabsContent value="perfil" className="space-y-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="mb-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-1">
                      Preencha sua informação
                    </h2>
                  </div>

                  {/* Seção de imagem de perfil */}
                  <div className="mb-8 text-center">
                    <div className="relative inline-block">
                      <div
                        className={`w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 transition-colors ${
                          isViewingOtherPatient
                            ? "cursor-default"
                            : "cursor-pointer hover:border-blue-400"
                        }`}
                        onClick={handleImageClick}
                      >
                        {profileImage ? (
                          <img
                            src={profileImage}
                            alt="Foto de perfil"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      {!isViewingOtherPatient && (
                        <button
                          onClick={handleImageClick}
                          className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
                        >
                          <Camera className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="mt-3">
                      <p className="text-sm text-gray-600">Adicionar arquivo</p>
                      <p className="text-xs text-gray-500">
                        Ou arraste o arquivo aqui
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {/* Nome completo */}
                    <div className="sm:col-span-2">
                      <Label>Nome completo</Label>
                      <Input
                        value={personalData.fullName}
                        onChange={(e) =>
                          setPersonalData((prev) => ({
                            ...prev,
                            fullName: e.target.value,
                          }))
                        }
                        placeholder="Digite seu nome completo"
                        disabled={isViewingOtherPatient}
                      />
                    </div>

                    {/* Data de nascimento */}
                    <div>
                      <Label>Data de Nascimento</Label>
                      <Input
                        type="date"
                        value={personalData.birthDate}
                        onChange={(e) =>
                          setPersonalData((prev) => ({
                            ...prev,
                            birthDate: e.target.value,
                          }))
                        }
                        disabled={isViewingOtherPatient}
                      />
                    </div>

                    {/* Sexo */}
                    <div>
                      <Label>Sexo</Label>
                      <Select
                        value={personalData.gender}
                        onValueChange={(
                          value: "masculino" | "feminino" | "outro",
                        ) =>
                          setPersonalData((prev) => ({
                            ...prev,
                            gender: value,
                          }))
                        }
                        disabled={isViewingOtherPatient}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="masculino">Masculino</SelectItem>
                          <SelectItem value="feminino">Feminino</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Estado */}
                    <div>
                      <Label>Estado</Label>
                      <Select
                        value={personalData.state}
                        onValueChange={handleStateChange}
                        disabled={isViewingOtherPatient}
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
                      <Label>Cidade</Label>
                      <Select
                        value={personalData.city}
                        onValueChange={(value) =>
                          setPersonalData((prev) => ({
                            ...prev,
                            city: value,
                          }))
                        }
                        disabled={!selectedState || isViewingOtherPatient}
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

                    {/* Plano de Saúde */}
                    <div className="sm:col-span-2">
                      <Label>Plano de Saúde</Label>
                      <Input
                        value={personalData.healthPlan}
                        onChange={(e) =>
                          setPersonalData((prev) => ({
                            ...prev,
                            healthPlan: e.target.value,
                          }))
                        }
                        placeholder="Nome do plano de saúde (opcional)"
                        disabled={isViewingOtherPatient}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-8">
                    <Button variant="outline">Cancelar</Button>
                    {!isViewingOtherPatient && (
                      <Button
                        onClick={handlePersonalDataSave}
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isLoading ? "Salvando..." : "Salvar"}
                      </Button>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Tab Dados Médicos */}
              <TabsContent value="dados-medicos" className="space-y-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="mb-8">
                    <h2 className="text-lg font-medium text-gray-900 mb-1">
                      Preencha sua informação
                    </h2>
                  </div>

                  <div className="space-y-8">
                    {/* Seção de Medidas Físicas */}
                    <div>
                      <h3 className="text-base font-medium text-gray-900 mb-4">
                        Medidas Físicas
                      </h3>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Altura (cm)
                          </Label>
                          <Input
                            type="number"
                            value={medicalData.height || ""}
                            onChange={(e) =>
                              setMedicalData((prev) => ({
                                ...prev,
                                height: e.target.value
                                  ? parseInt(e.target.value)
                                  : undefined,
                              }))
                            }
                            placeholder="Ex: 170"
                            className="mt-1"
                            disabled={isViewingOtherPatient}
                          />
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Peso (kg)
                          </Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={medicalData.weight || ""}
                            onChange={(e) =>
                              setMedicalData((prev) => ({
                                ...prev,
                                weight: e.target.value
                                  ? parseFloat(e.target.value)
                                  : undefined,
                              }))
                            }
                            placeholder="Ex: 70.5"
                            className="mt-1"
                            disabled={isViewingOtherPatient}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Seção de Condições de Saúde */}
                    <div>
                      <h3 className="text-base font-medium text-gray-900 mb-4">
                        Condições de Saúde
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <Label className="text-sm font-medium text-gray-700">
                              Fumante
                            </Label>
                            <p className="text-xs text-gray-500 mt-1">
                              Você fuma cigarros regularmente?
                            </p>
                          </div>
                          <Switch
                            checked={medicalData.smoker}
                            onCheckedChange={(checked) =>
                              setMedicalData((prev) => ({
                                ...prev,
                                smoker: checked,
                              }))
                            }
                            disabled={isViewingOtherPatient}
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <Label className="text-sm font-medium text-gray-700">
                              Pressão alta
                            </Label>
                            <p className="text-xs text-gray-500 mt-1">
                              Você tem hipertensão arterial?
                            </p>
                          </div>
                          <Switch
                            checked={medicalData.highBloodPressure}
                            onCheckedChange={(checked) =>
                              setMedicalData((prev) => ({
                                ...prev,
                                highBloodPressure: checked,
                              }))
                            }
                            disabled={isViewingOtherPatient}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Seção de Estilo de Vida */}
                    <div>
                      <h3 className="text-base font-medium text-gray-900 mb-4">
                        Estilo de Vida
                      </h3>
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <Label className="text-sm font-medium text-gray-700">
                                Faz atividade física
                              </Label>
                              <p className="text-xs text-gray-500 mt-1">
                                Você pratica exercícios físicos?
                              </p>
                            </div>
                            <Switch
                              checked={medicalData.physicalActivity}
                              onCheckedChange={(checked) =>
                                setMedicalData((prev) => ({
                                  ...prev,
                                  physicalActivity: checked,
                                  exerciseFrequency: checked
                                    ? prev.exerciseFrequency
                                    : undefined,
                                }))
                              }
                              disabled={isViewingOtherPatient}
                            />
                          </div>

                          {medicalData.physicalActivity && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <Label className="text-sm font-medium text-gray-700">
                                Com qual frequência?
                              </Label>
                              <Select
                                value={medicalData.exerciseFrequency || ""}
                                onValueChange={(
                                  value:
                                    | "nunca"
                                    | "raramente"
                                    | "semanalmente"
                                    | "diariamente",
                                ) =>
                                  setMedicalData((prev) => ({
                                    ...prev,
                                    exerciseFrequency: value,
                                  }))
                                }
                                disabled={isViewingOtherPatient}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="Selecione a frequência" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="raramente">
                                    Raramente (1-2x por mês)
                                  </SelectItem>
                                  <SelectItem value="semanalmente">
                                    Semanalmente (1-3x por semana)
                                  </SelectItem>
                                  <SelectItem value="diariamente">
                                    Diariamente (4-7x por semana)
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <Label className="text-sm font-medium text-gray-700">
                              Dieta saudável
                            </Label>
                            <p className="text-xs text-gray-500 mt-1">
                              Você mantém uma alimentação equilibrada?
                            </p>
                          </div>
                          <Switch
                            checked={medicalData.healthyDiet}
                            onCheckedChange={(checked) =>
                              setMedicalData((prev) => ({
                                ...prev,
                                healthyDiet: checked,
                              }))
                            }
                            disabled={isViewingOtherPatient}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-8">
                    <Button variant="outline">Cancelar</Button>
                    {!isViewingOtherPatient && (
                      <Button
                        onClick={handleMedicalDataSave}
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isLoading ? "Salvando..." : "Salvar"}
                      </Button>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Tab Médicos */}
              <TabsContent value="medicos" className="space-y-6">
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-medium text-gray-900">
                          Médicos compartilhados
                        </h2>
                        <p className="text-sm text-gray-600">
                          Gerencie com quais médicos você compartilha seus dados
                        </p>
                      </div>
                      <Button
                        onClick={() => navigate("/patient/buscar-medicos")}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Buscar médicos
                      </Button>
                    </div>
                  </div>

                  {sharedDoctors.length === 0 ? (
                    <div className="p-8 text-center">
                      <Share2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Nenhum médico compartilhado
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Compartilhe seus dados médicos com profissionais de
                        saúde de sua confiança.
                      </p>
                      <Button
                        onClick={() => navigate("/patient/buscar-medicos")}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Buscar primeiro médico
                      </Button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Médico
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Especialidade
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              CRM
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Ações
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {sharedDoctors.map((doctor) => (
                            <tr key={doctor.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="checkbox"
                                  checked
                                  readOnly
                                  className="rounded"
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="font-medium text-gray-900">
                                  {doctor.name}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                {doctor.specialty}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                {doctor.crm}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <button className="text-blue-600 hover:text-blue-800 text-sm">
                                    Compartilhar dados
                                  </button>
                                  <button
                                    onClick={() => handleStopSharing(doctor)}
                                    className="text-red-600 hover:text-red-800 p-1"
                                    title="Parar compartilhamento"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 p-6">
                    <Button variant="outline">Cancelar</Button>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Salvar
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Dialog para adicionar médico */}
      <Dialog open={showAddDoctorDialog} onOpenChange={setShowAddDoctorDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Buscar médico</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Digite o nome do médico ou CRM-UF (ex: 123456-SP)"
                className="flex-1"
              />
              <Button onClick={searchForDoctors}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {searchDoctors.length > 0 && (
              <div className="max-h-64 overflow-y-auto border rounded-lg">
                {searchDoctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className="p-4 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setSelectedDoctor(doctor);
                      setShowShareDialog(true);
                    }}
                  >
                    <div className="font-medium">{doctor.name}</div>
                    <div className="text-sm text-gray-600">
                      {doctor.specialty} • CRM: {doctor.crm}-{doctor.state}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de compartilhamento */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compartilhar seus dados com o médico?</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Ao clicar em "Compartilhar", você autoriza o envio de suas
              informações médicas ao(à) médico(a) responsável. Isso inclui dados
              como resultados de exames, diagnósticos, tratamentos em andamento
              e histórico de saúde.
            </p>

            {selectedDoctor && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">{selectedDoctor.name}</p>
                <p className="text-sm text-gray-600">
                  {selectedDoctor.specialty} • CRM: {selectedDoctor.crm}-
                  {selectedDoctor.state}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowShareDialog(false)}>
              Voltar
            </Button>
            <Button
              onClick={handleShareWithDoctor}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Compartilhar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientProfile;
