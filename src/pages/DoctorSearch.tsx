import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowLeft, UserPlus, Users } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContextHybrid";
import { patientProfileAPI } from "@/lib/patient-profile-api";
import { Doctor } from "@/lib/patient-profile-types";
import { toast } from "@/hooks/use-toast";

const DoctorSearch = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Doctor[]>([]);
  const [sharedDoctors, setSharedDoctors] = useState<Doctor[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  useEffect(() => {
    if (user?.id && user.profession === "paciente") {
      // Clear any existing mock data and load only registered doctors
      patientProfileAPI.clearDoctorsData();
      patientProfileAPI.loadRegisteredDoctors().then(() => {
        loadSharedDoctors();
      });
    }
  }, [user]);

  const loadSharedDoctors = async () => {
    if (!user?.id) return;

    try {
      const doctors = await patientProfileAPI.getSharedDoctors(user.id);
      setSharedDoctors(doctors);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar médicos compartilhados",
      });
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Digite um nome ou CRM para buscar",
      });
      return;
    }

    setIsSearching(true);
    try {
      // Ensure registered doctors are loaded
      await patientProfileAPI.loadRegisteredDoctors();

      const results = await patientProfileAPI.searchDoctors(searchQuery);
      console.log("Search results:", results);

      // Filtrar médicos que já estão compartilhados
      const sharedDoctorIds = sharedDoctors.map((d) => d.id);
      const availableDoctors = results.filter(
        (doctor) => !sharedDoctorIds.includes(doctor.id),
      );

      setSearchResults(availableDoctors);

      if (availableDoctors.length === 0 && results.length > 0) {
        toast({
          title: "Aviso",
          description:
            "Todos os médicos encontrados já estão compartilhados com você",
        });
      } else if (availableDoctors.length === 0) {
        toast({
          title: "Nenhum resultado",
          description: `Nenhum médico encontrado para "${searchQuery}". Tente buscar por: João, Silva, 123456, 123456-SP, Cardiologia`,
        });
      } else {
        toast({
          title: "Busca realizada",
          description: `${availableDoctors.length} médico(s) encontrado(s)`,
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao buscar médicos",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
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

      // Atualizar listas
      await loadSharedDoctors();
      setSearchResults((prev) =>
        prev.filter((d) => d.id !== selectedDoctor.id),
      );

      setShowShareDialog(false);
      setSelectedDoctor(null);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao compartilhar dados",
      });
    }
  };

  const formatCRM = (crm: string, state: string) => {
    return `${crm}-${state}`;
  };

  useEffect(() => {
    if (user && user.profession !== "paciente") {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  if (!user || user.profession !== "paciente") {
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
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={() => navigate("/patient-profile")}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Buscar Médicos
                </h1>
                <p className="text-gray-600">
                  Encontre e compartilhe seus dados com médicos de sua confiança
                </p>
              </div>
            </div>

            {/* Search Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <div className="mb-4">
                <h2 className="text-lg font-medium text-gray-900 mb-2">
                  Buscar por Médico
                </h2>
                <p className="text-sm text-gray-600">
                  Digite o nome do médico ou CRM-UF (exemplo: João Silva ou
                  123456-SP)
                </p>
              </div>

              <div className="flex gap-3">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite o nome do médico ou CRM-UF"
                  className="flex-1"
                />
                <Button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="bg-[#00B1BB] hover:bg-[#01485E]"
                >
                  {isSearching ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  {!isSearching && <span className="ml-2">Buscar</span>}
                </Button>
                <Button
                  onClick={async () => {
                    setSearchQuery("");
                    setIsSearching(true);
                    try {
                      // Clear and load registered doctors only
                      patientProfileAPI.clearDoctorsData();
                      await patientProfileAPI.loadRegisteredDoctors();
                      const results = await patientProfileAPI.searchDoctors("");
                      console.log("All doctors:", results);
                      const sharedDoctorIds = sharedDoctors.map((d) => d.id);
                      const availableDoctors = results.filter(
                        (doctor) => !sharedDoctorIds.includes(doctor.id),
                      );
                      setSearchResults(availableDoctors);
                      toast({
                        title: "Médicos carregados",
                        description: `${availableDoctors.length} médico(s) disponível(is)`,
                      });
                    } catch (error) {
                      console.error("Error loading doctors:", error);
                      toast({
                        variant: "destructive",
                        title: "Erro",
                        description: "Erro ao carregar médicos",
                      });
                    } finally {
                      setIsSearching(false);
                    }
                  }}
                  variant="outline"
                  disabled={isSearching}
                >
                  Ver Todos
                </Button>
                <Button
                  onClick={() => {
                    toast({
                      title: "Como encontrar médicos",
                      description:
                        "Apenas médicos que se cadastraram no sistema aparecerão na busca. Para criar uma conta de médico, use a tela de registro.",
                    });
                  }}
                  variant="secondary"
                  size="sm"
                >
                  Como Funciona
                </Button>
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 mb-6">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    Resultados da Busca ({searchResults.length})
                  </h3>
                  <p className="text-sm text-gray-600">
                    Clique em um médico para compartilhar seus dados
                  </p>
                </div>

                <div className="divide-y divide-gray-200">
                  {searchResults.map((doctor) => (
                    <div
                      key={doctor.id}
                      className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => {
                        setSelectedDoctor(doctor);
                        setShowShareDialog(true);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-medium text-gray-900">
                              {doctor.name}
                            </h4>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>
                              CRM: {doctor.crm}
                              {doctor.state ? `-${doctor.state}` : ""}
                            </span>
                            <span>
                              •{" "}
                              {doctor.city && doctor.state
                                ? `${doctor.city}`
                                : "Sem cidade e estado cadastrado"}
                            </span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDoctor(doctor);
                            setShowShareDialog(true);
                          }}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Compartilhar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Shared Doctors Summary */}
            {sharedDoctors.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Médicos Compartilhados ({sharedDoctors.length})
                      </h3>
                      <p className="text-sm text-gray-600">
                        Seus dados estão sendo compartilhados com estes médicos
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => navigate("/patient-profile")}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Gerenciar
                    </Button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sharedDoctors.map((doctor) => (
                      <div
                        key={doctor.id}
                        className="p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <h5 className="font-medium text-gray-900">
                            {doctor.name}
                          </h5>
                        </div>
                        <p className="text-sm text-gray-600">
                          CRM: {doctor.crm}
                          {doctor.state ? `-${doctor.state}` : ""} •{" "}
                          {doctor.city && doctor.state
                            ? `${doctor.city}`
                            : "Sem cidade e estado cadastrado"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {searchResults.length === 0 && searchQuery === "" && (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Busque por Médicos Cadastrados
                </h3>
                <p className="text-gray-600 mb-6">
                  Apenas médicos que se cadastraram no sistema aparecerão na
                  busca. Use o campo acima para encontrar médicos pelo nome ou
                  CRM-UF.
                </p>
                <div className="max-w-md mx-auto">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Importante:</strong> Médicos precisam se cadastrar
                      primeiro no sistema para aparecerem na busca.
                    </p>
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Como buscar:
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Nome completo ou parcial</li>
                      <li>• Número do CRM</li>
                      <li>• CRM com estado (ex: 123456-SP)</li>
                      <li>• Especialidade médica</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Share Confirmation Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compartilhar dados com o médico?</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Ao confirmar, você autoriza o compartilhamento de todas as suas
              informações médicas registradas no sistema com este médico.
            </p>

            {selectedDoctor && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-gray-900 mb-1">
                  {selectedDoctor.name}
                </h4>
                <p className="text-sm text-gray-600">
                  CRM: {selectedDoctor.crm}
                  {selectedDoctor.state
                    ? `-${selectedDoctor.state}`
                    : ""} •{" "}
                  {selectedDoctor.city && selectedDoctor.state
                    ? `${selectedDoctor.city}`
                    : "Sem cidade e estado cadastrado"}
                </p>
              </div>
            )}

            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <strong>Importante:</strong> Você pode interromper o
                compartilhamento a qualquer momento através do seu perfil.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowShareDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleShareWithDoctor}
              className="bg-[#00B1BB] hover:bg-[#01485E]"
            >
              Confirmar Compartilhamento
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorSearch;
