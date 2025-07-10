import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { brazilStates, getCitiesByState } from "@/lib/brazil-locations";
import { phoneMask, removeMask } from "@/lib/masks";
import { toast } from "@/hooks/use-toast";
import { doctorAPI } from "@/lib/doctor-api";

interface Hospital {
  id: string;
  name: string;
  createdAt: string;
}

interface DoctorFormData {
  name: string;
  crm: string;
  specialty: string;
  state: string;
  city: string;
  phone: string;
  email: string;
}

const HospitalCreateDoctor = () => {
  const navigate = useNavigate();
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedState, setSelectedState] = useState("");
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [formData, setFormData] = useState<DoctorFormData>({
    name: "",
    crm: "",
    specialty: "",
    state: "",
    city: "",
    phone: "",
    email: "",
  });

  const specialties = [
    "Cardiologia",
    "Dermatologia",
    "Endocrinologia",
    "Gastroenterologia",
    "Ginecologia",
    "Neurologia",
    "Oftalmologia",
    "Ortopedia",
    "Pediatria",
    "Psiquiatria",
    "Radiologia",
    "Urologia",
    "Clínica Geral",
    "Medicina Interna",
    "Cirurgia Geral",
    "Anestesiologia",
    "Patologia",
    "Medicina de Família",
    "Geriatria",
    "Oncologia",
  ];

  useEffect(() => {
    const hospitalData = localStorage.getItem("hospital_session");
    if (!hospitalData) {
      navigate("/gerenciamento", { replace: true });
      return;
    }

    try {
      const parsedHospital = JSON.parse(hospitalData);
      setHospital(parsedHospital);
    } catch (error) {
      navigate("/gerenciamento", { replace: true });
    }
  }, [navigate]);

  const handleInputChange = (field: keyof DoctorFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleStateChange = (value: string) => {
    setSelectedState(value);
    setFormData((prev) => ({
      ...prev,
      state: value,
      city: "", // Reset city when state changes
    }));
    setAvailableCities(getCitiesByState(value));
  };

  const handlePhoneChange = (value: string) => {
    const phoneNumber = removeMask(value);
    const maskedPhone = phoneMask(phoneNumber);
    setFormData((prev) => ({
      ...prev,
      phone: maskedPhone,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Nome é obrigatório",
      });
      return false;
    }

    if (!formData.crm.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "CRM é obrigatório",
      });
      return false;
    }

    if (!formData.specialty) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Especialidade é obrigatória",
      });
      return false;
    }

    if (!formData.state) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Estado é obrigatório",
      });
      return false;
    }

    if (!formData.city) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Cidade é obrigatória",
      });
      return false;
    }

    if (!formData.email.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "E-mail é obrigatório",
      });
      return false;
    }

    // Validar formato do e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "E-mail inválido",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !hospital) return;

    setIsLoading(true);

    try {
      console.log("🚀 Iniciando cadastro de médico...");

      await doctorAPI.createDoctor({
        ...formData,
        hospitalId: hospital.id,
      });

      toast({
        title: "Sucesso",
        description: "Médico cadastrado com sucesso",
      });

      navigate("/gerenciamento/dashboard");
    } catch (error: any) {
      console.error("❌ Erro no cadastro de médico:", error);

      let errorMessage = "Erro ao cadastrar médico";

      // Melhor tratamento da mensagem de erro
      if (error && typeof error === "object") {
        if (error.message && typeof error.message === "string") {
          errorMessage = error.message;
        } else if (error.error && typeof error.error === "string") {
          errorMessage = error.error;
        } else {
          console.log("🔍 Erro detalhado:", JSON.stringify(error, null, 2));
          errorMessage =
            "Erro interno do sistema. Verifique os dados e tente novamente.";
        }
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      toast({
        variant: "destructive",
        title: "Erro no Cadastro",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!hospital) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="outline"
              onClick={() => navigate("/gerenciamento/dashboard")}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>

            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Cadastrar Médico
            </h1>
            <p className="text-gray-600">
              Adicione um novo médico à {hospital.name}
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-lg">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-medium text-gray-900">
                    Dados do Médico
                  </h2>
                  <p className="text-sm text-gray-600">
                    Preencha as informações do médico
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                {/* Nome */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Digite o nome completo do médico"
                    className="w-full"
                    required
                  />
                </div>

                {/* CRM */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CRM *
                  </label>
                  <Input
                    value={formData.crm}
                    onChange={(e) => handleInputChange("crm", e.target.value)}
                    placeholder="Número do CRM"
                    className="w-full"
                    required
                  />
                </div>

                {/* Especialidade */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Especialidade *
                  </label>
                  <Select
                    value={formData.specialty}
                    onValueChange={(value) =>
                      handleInputChange("specialty", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a especialidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {specialties.map((specialty) => (
                        <SelectItem key={specialty} value={specialty}>
                          {specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                      {availableCities.map((city, index) => (
                        <SelectItem key={`${city}-${index}`} value={city}>
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
                    E-mail *
                  </label>
                  <Input
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="medico@email.com"
                    type="email"
                    className="w-full"
                    required
                  />
                </div>
              </div>

              {/* Login Info */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-700 text-sm">
                  <strong>Acesso:</strong> O médico poderá fazer login usando o
                  e-mail cadastrado
                </p>
                <p className="text-blue-600 text-xs mt-1">
                  O sistema de autenticação será configurado automaticamente
                </p>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/gerenciamento/dashboard")}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-[#00B1BB] hover:bg-[#01485E]"
                >
                  {isLoading ? "Cadastrando..." : "Cadastrar Médico"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalCreateDoctor;
