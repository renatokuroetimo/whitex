import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import ResponsiveSidebar from "@/components/ResponsiveSidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { brazilStates, getCitiesByState } from "@/lib/brazil-locations";
import { phoneMask, removeMask } from "@/lib/masks";

interface ProfileData {
  name: string;
  crm: string;
  state: string;
  city: string;
  phone: string;
  email: string;
}

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedState, setSelectedState] = useState("");
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [formData, setFormData] = useState<ProfileData>({
    name: "",
    crm: user?.crm || "",
    state: "",
    city: "",
    phone: "",
    email: user?.email || "",
  });

  // Carregar dados salvos do localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem(`profile_${user?.id}`);
    if (savedProfile) {
      const profileData = JSON.parse(savedProfile);
      setFormData(profileData);
      if (profileData.state) {
        setSelectedState(profileData.state);
        setAvailableCities(getCitiesByState(profileData.state));
      }
    }
  }, [user?.id]);

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

      // Salvar dados no localStorage (simular API)
      localStorage.setItem(`profile_${user?.id}`, JSON.stringify(formData));

      toast({
        title: "Sucesso!",
        description: "Dados salvos com sucesso",
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
    // Recarregar dados salvos
    const savedProfile = localStorage.getItem(`profile_${user?.id}`);
    if (savedProfile) {
      const profileData = JSON.parse(savedProfile);
      setFormData(profileData);
      if (profileData.state) {
        setSelectedState(profileData.state);
        setAvailableCities(getCitiesByState(profileData.state));
      }
    } else {
      // Reset para dados iniciais
      setFormData({
        name: "",
        crm: user?.crm || "",
        state: "",
        city: "",
        phone: "",
        email: user?.email || "",
      });
      setSelectedState("");
      setAvailableCities([]);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <ResponsiveSidebar>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Dados pessoais
            </h1>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-blue-600 mb-8">
              <span>Perfil</span>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
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
              <div className="flex justify-end gap-3 mt-8">
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
            </div>
          </div>
        </div>
      </div>
    </ResponsiveSidebar>
  );
};

export default ProfilePage;