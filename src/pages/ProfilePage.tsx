import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContextHybrid";
import { profileImageAPI } from "@/lib/profile-image-api";
import { brazilStates, getCitiesByState } from "@/lib/brazil-locations";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { brazilStates, getCitiesByState } from "@/lib/brazil-locations";
import { phoneMask, removeMask } from "@/lib/masks";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useNavigate } from "react-router-dom";
import { Camera, User } from "lucide-react";

interface ProfileData {
  name: string;
  crm: string;
  state: string;
  city: string;
  phone: string;
  email: string;
}

const ProfilePage: React.FC = () => {
  const { user, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedState, setSelectedState] = useState("");
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<ProfileData>({
    name: "",
    crm: user?.crm || "",
    state: "",
    city: "",
    phone: "",
    email: user?.email || "",
  });

  // Carregar dados do usuário do contexto do Supabase
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.fullName || "",
        crm: user.crm || "",
        state: user.state || "",
        city: user.city || "",
        phone: user.phone || "", // Carregar telefone do contexto
        email: user.email || "",
      });

      if (user.state) {
        setSelectedState(user.state);
        setAvailableCities(getCitiesByState(user.state));
      }
    }

    // Carregar imagem de perfil do Supabase
    if (user?.id) {
      profileImageAPI
        .getProfileImage(user.id)
        .then((image) => {
          if (image && image.startsWith("data:")) {
            setProfileImage(image);
          }
        })
        .catch((error) => {
          console.warn("Erro ao carregar imagem de perfil:", error);
        });
    }
  }, [user]);

  const handleStateChange = (stateId: string) => {
    setSelectedState(stateId);
    setAvailableCities(getCitiesByState(stateId));
    setFormData((prev) => ({
      ...prev,
      state: stateId,
      city: "", // Reset cidade quando muda estado
    }));
  };

  const handlePhoneChange = (value: string) => {
    const maskedValue = phoneMask(value);
    setFormData((prev) => ({
      ...prev,
      phone: maskedValue,
    }));
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      // Validações básicas
      if (!formData.name.trim()) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Nome é obrigatório",
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

      // Salvar dados no Supabase primeiro, fallback para localStorage
      const updateData = {
        full_name: formData.name,
        city: formData.city,
        state: formData.state,
        crm: formData.crm,
        phone: removeMask(formData.phone), // Remove mask before saving
      };

      // SALVAR APENAS NO SUPABASE - SEM FALLBACK PARA LOCALSTORAGE
      const { supabase } = await import("@/lib/supabase");

      if (!supabase) {
        throw new Error(
          "Supabase não está configurado. Verifique a configuração.",
        );
      }

      if (!user?.id) {
        throw new Error("Usuário não identificado. Faça login novamente.");
      }

      console.log("🚀 Atualizando perfil no Supabase:", updateData);

      const { data, error } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", user.id);

      console.log("📊 Resultado da atualização:", { data, error });

      if (error) {
        console.error(
          "❌ Erro ao atualizar no Supabase:",
          JSON.stringify(
            {
              message: error.message,
              details: error.details,
              hint: error.hint,
              code: error.code,
            },
            null,
            2,
          ),
        );

        throw new Error(`Erro ao salvar dados: ${error.message}`);
      }

      console.log("✅ Perfil atualizado no Supabase com sucesso!");

      toast({
        title: "Sucesso!",
        description: "Dados salvos e sincronizados com sucesso",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao salvar dados",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset para dados originais do usuário
    if (user) {
      setFormData({
        name: user.fullName || "",
        crm: user.crm || "",
        state: user.state || "",
        city: user.city || "",
        phone: user.phone || "",
        email: user.email || "",
      });

      if (user.state) {
        setSelectedState(user.state);
        setAvailableCities(getCitiesByState(user.state));
      } else {
        setSelectedState("");
        setAvailableCities([]);
      }
    }
  };

  const handleDeleteAccount = async () => {
    const success = await deleteAccount();
    if (success) {
      navigate("/"); // Redireciona para a página de criar conta
    }
    setShowDeleteDialog(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Verificar tamanho do arquivo (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "A imagem deve ter no máximo 5MB",
      });
      // Limpar o input para permitir re-seleção do mesmo arquivo
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
      // Limpar o input para permitir re-seleção do mesmo arquivo
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result && user?.id) {
        setProfileImage(result);
        localStorage.setItem(`profile_image_${user.id}`, result);

        // Dispatch custom event to notify sidebar
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

    // Só fazer uma chamada para readAsDataURL
    reader.readAsDataURL(file);

    // Limpar o input para permitir re-seleção do mesmo arquivo
    event.target.value = "";
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const removeProfileImage = () => {
    setProfileImage(null);
    localStorage.removeItem(`profile_image_${user?.id}`);
    toast({
      title: "Sucesso!",
      description: "Imagem de perfil removida",
    });
  };

  if (!user) {
    return null;
  }

  // Redirecionar pacientes para sua página específica
  if (user.profession === "paciente") {
    navigate("/patient-profile");
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-semibold text-gray-900 mb-8">
              Dados pessoais
            </h1>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
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
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-2">
                    Clique na imagem para alterar sua foto de perfil
                  </p>
                  {profileImage && (
                    <button
                      onClick={removeProfileImage}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      Remover foto
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-1">
                  Detalhes do perfil
                </h2>
                <p className="text-sm text-gray-600">
                  Preencha com suas informações
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                {/* Nome */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Digite seu nome completo"
                    className="w-full"
                  />
                </div>

                {/* CRM */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CRM
                  </label>
                  <Input
                    value={formData.crm}
                    onChange={(e) => handleInputChange("crm", e.target.value)}
                    placeholder="Número do CRM"
                    className="w-full"
                    disabled
                  />
                </div>

                {/* Estado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
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
                    Cidade
                  </label>
                  <Select
                    value={formData.city}
                    onValueChange={(value) => handleInputChange("city", value)}
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

                {/* Telefone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone
                  </label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="(00) 00000-0000"
                    className="w-full"
                    maxLength={15}
                  />
                </div>

                {/* E-mail */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-mail
                  </label>
                  <Input
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="seu@email.com"
                    type="email"
                    className="w-full"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-4 mt-8">
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? "Salvando..." : "Salvar"}
                  </Button>
                </div>

                {/* Seção Zona de Perigo */}
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Zona de perigo
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Esta ação é irreversível. Todos os seus dados serão
                    permanentemente removidos.
                  </p>
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteDialog(true)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Apagar conta
                  </Button>
                </div>
              </div>
            </div>

            {/* Dialog de confirmação */}
            <ConfirmDialog
              open={showDeleteDialog}
              onOpenChange={setShowDeleteDialog}
              onConfirm={handleDeleteAccount}
              title="Apagar conta"
              description="Tem certeza que deseja apagar sua conta? Esta ação não pode ser desfeita e todos os seus dados serão perdidos permanentemente."
              confirmText="Sim, apagar conta"
              cancelText="Cancelar"
              variant="destructive"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
