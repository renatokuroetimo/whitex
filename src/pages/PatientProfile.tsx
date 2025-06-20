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
import { useAuth } from "@/contexts/AuthContextHybrid";
import { patientProfileAPI } from "@/lib/patient-profile-api";
import { profileImageAPI } from "@/lib/profile-image-api";
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
  const [isSavingMedicalData, setIsSavingMedicalData] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("perfil");

  // Estados dos dados pessoais
  const [personalData, setPersonalData] = useState<PatientPersonalFormData>({
    fullName: "",
    email: "",
    birthDate: "",
    gender: "masculino",
    state: "",
    city: "",
    healthPlan: "",
  });

  // Estado adicional para telefone (não está no tipo PatientPersonalFormData)
  const [phone, setPhone] = useState("");

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
          email: personal.email || user?.email || "",
          birthDate: personal.birthDate,
          gender: personal.gender,
          state: personal.state,
          city: personal.city,
          healthPlan: personal.healthPlan || "",
        });
      } else if (user?.email) {
        // Se não há dados pessoais salvos, usar email do usuário atual
        setPersonalData((prev) => ({
          ...prev,
          email: user.email,
        }));
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

      // Carregar imagem de perfil do Supabase
      try {
        const savedImage = await profileImageAPI.getProfileImage(user.id);
        if (savedImage) {
          setProfileImage(savedImage);
        }
      } catch (imageError) {
        console.warn("Erro ao carregar imagem de perfil:", imageError);
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

    // Validações básicas
    if (!personalData.fullName.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Nome completo é obrigatório",
      });
      return;
    }

    if (!personalData.email.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "E-mail é obrigatório",
      });
      return;
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(personalData.email)) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, insira um e-mail válido",
      });
      return;
    }

    if (!personalData.birthDate) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Data de nascimento é obrigatória",
      });
      return;
    }

    if (!personalData.state) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Estado é obrigatório",
      });
      return;
    }

    if (!personalData.city) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Cidade é obrigatória",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log("🔥 INICIANDO SALVAMENTO - Dados pessoais:", {
        userId: user.id,
        personalData,
      });

      const result = await patientProfileAPI.savePatientPersonalData(
        user.id,
        personalData,
      );

      console.log("✅ RESULTADO DO SALVAMENTO:", result);

      toast({
        title: "Sucesso",
        description: "Dados pessoais salvos com sucesso",
      });
    } catch (error) {
      console.error("❌ ERRO AO SALVAR DADOS PESSOAIS:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: `Erro ao salvar dados pessoais: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveMedicalData = async () => {
    if (!user?.id) return;

    setIsSavingMedicalData(true);
    try {
      console.log("🔥 INICIANDO SALVAMENTO - Dados médicos:", {
        userId: user.id,
        medicalData,
      });

      const result = await patientProfileAPI.savePatientMedicalData(
        user.id,
        medicalData,
      );

      console.log("✅ RESULTADO DO SALVAMENTO MÉDICO:", result);

      toast({
        title: "Sucesso",
        description: "Dados médicos salvos com sucesso",
      });
    } catch (error) {
      console.error("❌ ERRO AO SALVAR DADOS MÉDICOS:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: `Erro ao salvar dados médicos: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
      });
    } finally {
      setIsSavingMedicalData(false);
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
      city: "", // Reset city when state changes
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    // Verificar tamanho do arquivo (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "A imagem deve ter no máximo 5MB",
      });
      event.target.value = "";
      return;
    }

    // Verificar tipo do arquivo
    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, selecione apenas arquivos de imagem",
      });
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = async (e) => {
      const result = e.target?.result as string;
      if (result) {
        setProfileImage(result);

        // Salvar no Supabase
        try {
          await profileImageAPI.saveProfileImage(user.id, result);
        } catch (saveError) {
          console.warn("Erro ao salvar imagem no Supabase:", saveError);
        }

        // Dispatch custom event to notify other components
        window.dispatchEvent(
          new CustomEvent("profileImageUpdated", {
            detail: { userId: user.id },
          }),
        );

        toast({
          title: "Sucesso!",
          description: "Imagem de perfil atualizada",
        });
      }
    };

    reader.onerror = () => {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao ler o arquivo de imagem",
      });
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const searchForDoctors = async () => {
    try {
      const results = await patientProfileAPI.getRegisteredDoctors();
      setSearchDoctors(results);
      setShowAddDoctorDialog(true);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao buscar médicos",
      });
    }
  };

  const handleShareData = async () => {
    if (!selectedDoctor || !user?.id) return;

    try {
      await patientProfileAPI.shareDataWithDoctor(user.id, selectedDoctor.id);
      setSharedDoctors((prev) => [...prev, selectedDoctor]);
      setShowShareDialog(false);
      setSelectedDoctor(null);
      toast({
        title: "Sucesso",
        description: `Dados compartilhados com Dr. ${selectedDoctor.name}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao compartilhar dados",
      });
    }
  };

  const handleRemoveDoctor = async (doctorId: string) => {
    if (!user?.id) return;

    console.log("🗑️ Removendo compartilhamento com médico:", doctorId);

    try {
      await patientProfileAPI.stopSharingWithDoctor(user.id, doctorId);

      // Atualizar lista local
      setSharedDoctors((prev) => prev.filter((d) => d.id !== doctorId));

      toast({
        title: "Sucesso",
        description: "Compartilhamento removido com sucesso",
      });

      console.log("✅ Compartilhamento removido da interface");
    } catch (error) {
      console.error("❌ Erro ao remover compartilhamento:", error);

      toast({
        variant: "destructive",
        title: "Erro",
        description: `Erro ao remover compartilhamento: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
      });
    }
  };

  const handleDeleteAccount = async () => {
    const success = await deleteAccount();
    if (success) {
      navigate("/login");
    }
  };

  if (!user) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        <div className="flex-1 flex items-center justify-center">
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
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-semibold text-gray-900">
                  Dados pessoais
                </h1>
              </div>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="perfil">Perfil</TabsTrigger>
                <TabsTrigger value="dados-medicos">Dados médicos</TabsTrigger>
                <TabsTrigger value="medicos">Médicos</TabsTrigger>
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
                        className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 cursor-pointer hover:border-blue-400 transition-colors"
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
                      <button
                        onClick={handleImageClick}
                        className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Clique para alterar sua foto
                    </p>
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
                      />
                    </div>

                    {/* E-mail */}
                    <div className="sm:col-span-2">
                      <Label>E-mail</Label>
                      <Input
                        type="email"
                        value={personalData.email}
                        onChange={(e) =>
                          setPersonalData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        placeholder="Digite seu e-mail"
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
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-8">
                    <Button
                      variant="outline"
                      onClick={() => navigate("/patient/dashboard")}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handlePersonalDataSave}
                      disabled={isLoading}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isLoading ? "Salvando..." : "Salvar"}
                    </Button>
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
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-8">
                    <Button
                      variant="outline"
                      onClick={() => navigate("/patient/dashboard")}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSaveMedicalData}
                      disabled={isSavingMedicalData}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isLoading ? "Salvando..." : "Salvar"}
                    </Button>
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
                        Buscar médico
                      </Button>
                    </div>
                  </div>

                  <div className="p-6">
                    {sharedDoctors.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <User className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Nenhum médico compartilhado
                        </h3>
                        <p className="text-gray-600 mb-6">
                          Você ainda não compartilhou seus dados com nenhum
                          médico.
                        </p>
                        <Button
                          onClick={() => navigate("/patient/buscar-medicos")}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Search className="h-4 w-4 mr-2" />
                          Buscar médico
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {sharedDoctors.map((doctor) => (
                          <div
                            key={doctor.id}
                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-600">
                                  Dr
                                </span>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  Dr. {doctor.name}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {doctor.specialty} • CRM {doctor.crm}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveDoctor(doctor.id)}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-white rounded-lg border border-red-200">
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-red-900 mb-2">
                      Zona de Perigo
                    </h3>
                    <p className="text-sm text-red-600 mb-4">
                      Estas ações são irreversíveis. Tenha cuidado.
                    </p>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Deletar conta permanentemente
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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Digite o nome ou CRM do médico"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="max-h-96 overflow-y-auto">
              {searchDoctors
                .filter(
                  (doctor) =>
                    doctor.name
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    doctor.crm.includes(searchQuery),
                )
                .map((doctor) => (
                  <div
                    key={doctor.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg mb-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-600">
                          Dr
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Dr. {doctor.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {doctor.specialty} • CRM {doctor.crm}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedDoctor(doctor);
                        setShowShareDialog(true);
                        setShowAddDoctorDialog(false);
                      }}
                      disabled={sharedDoctors.some((d) => d.id === doctor.id)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {sharedDoctors.some((d) => d.id === doctor.id) ? (
                        "Já compartilhado"
                      ) : (
                        <>
                          <Share2 className="h-3 w-3 mr-1" />
                          Compartilhar
                        </>
                      )}
                    </Button>
                  </div>
                ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de compartilhamento */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar compartilhamento</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-gray-600">
              Você está prestes a compartilhar seus dados pessoais e médicos
              com:
            </p>

            {selectedDoctor && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900">
                  Dr. {selectedDoctor.name}
                </h4>
                <p className="text-sm text-gray-600">
                  {selectedDoctor.specialty} • CRM {selectedDoctor.crm}
                </p>
              </div>
            )}

            <p className="text-sm text-gray-500">
              O médico poderá visualizar suas informações pessoais, dados
              médicos e histórico de indicadores. Você pode revogar este acesso
              a qualquer momento.
            </p>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowShareDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleShareData}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Confirmar compartilhamento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientProfile;
