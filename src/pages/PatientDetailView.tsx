import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Edit, Trash2 } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContextHybrid";
import { patientAPI } from "@/lib/patient-api";
import { patientProfileAPI } from "@/lib/patient-profile-api";
import { Patient, Diagnosis } from "@/lib/patient-types";
import {
  PatientPersonalData,
  PatientMedicalData,
} from "@/lib/patient-profile-types";
import { toast } from "@/hooks/use-toast";

const PatientDetailView = () => {
  const navigate = useNavigate();
  const { id: patientId } = useParams();
  const { user } = useAuth();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [personalData, setPersonalData] = useState<PatientPersonalData | null>(
    null,
  );
  const [medicalData, setMedicalData] = useState<PatientMedicalData | null>(
    null,
  );
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Detectar se está sendo acessado pelo sistema hospitalar
  const isHospitalContext =
    window.location.pathname.includes("/gerenciamento/");
  const backPath = isHospitalContext ? "/gerenciamento/patients" : "/pacientes";

  useEffect(() => {
    if (patientId && user?.id) {
      loadPatientData();
    }
  }, [patientId, user?.id]);

  const loadPatientData = async () => {
    if (!patientId || !user?.id) return;

    setIsLoading(true);
    try {
      // Carregar dados básicos do paciente (usando getPatientById para incluir observações médicas)
      console.log("🔍 ===== PATIENT DETAIL VIEW DEBUG =====");
      console.log("🔍 Patient ID da URL:", patientId);
      console.log("🔍 Médico logado ID:", user.id);
      console.log("🔍 Médico logado email:", user.email);
      console.log("🔍 Chamando patientAPI.getPatientById...");

      const foundPatient = await patientAPI.getPatientById(patientId);

      console.log("📊 RESULTADO do getPatientById:", foundPatient);

      if (foundPatient) {
        setPatient(foundPatient);
        console.log("✅ Paciente carregado:", foundPatient);

        // SEMPRE buscar dados complementares das tabelas auxiliares (tanto para criados pelo médico quanto compartilhados)
        console.log("🔍 Buscando dados auxiliares para o paciente...");

        // Carregar dados pessoais das tabelas auxiliares
        try {
          console.log("🔍 Carregando dados pessoais...");
          const personal =
            await patientProfileAPI.getPatientPersonalData(patientId);
          console.log("📊 Dados pessoais carregados:", personal);
          setPersonalData(personal);
        } catch (error) {
          console.log("⚠️ Erro ao carregar dados pessoais:", error);
          setPersonalData(null);
        }

        // Carregar dados médicos das tabelas auxiliares
        try {
          console.log("🔍 Carregando dados médicos...");
          const medical =
            await patientProfileAPI.getPatientMedicalData(patientId);
          console.log("📊 Dados médicos carregados:", medical);
          setMedicalData(medical);
        } catch (error) {
          console.log("⚠️ Erro ao carregar dados médicos:", error);
          setMedicalData(null);
        }

        // Carregar histórico de diagnósticos
        console.log("🔍 Carregando diagnósticos...");
        const patientDiagnoses = await patientAPI.getDiagnoses(patientId);
        console.log("📊 Diagnósticos carregados:", patientDiagnoses);
        setDiagnoses(patientDiagnoses);
      } else {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Paciente não encontrado",
        });
        navigate(backPath);
      }
    } catch (error) {
      console.error("Error loading patient data:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar dados do paciente",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePatient = async () => {
    if (!patientId) return;

    try {
      await patientAPI.deletePatient(patientId);
      toast({
        title: "Sucesso",
        description: "Paciente deletado com sucesso",
      });
      navigate(backPath);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao deletar paciente",
      });
    }
  };

  const handleRemoveSharing = async () => {
    if (!patientId || !user?.id) return;

    try {
      await patientAPI.removePatientSharing(patientId);
      toast({
        title: "Sucesso",
        description: "Compartilhamento removido com sucesso",
      });
      navigate(backPath);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao remover compartilhamento",
      });
    }
  };

  const getPatientAge = () => {
    // Try personal data first, then fall back to patient age
    if (personalData?.birthDate) {
      try {
        const today = new Date();
        const birthDate = new Date(personalData.birthDate);

        // Validar se a data é válida
        if (isNaN(birthDate.getTime())) {
          return "Não informado";
        }

        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
          return age - 1;
        }
        return age;
      } catch (error) {
        console.error("Erro ao calcular idade:", error);
        return "Não informado";
      }
    }

    // Fall back to patient.age if available
    if (patient?.age && patient.age > 0) {
      return patient.age;
    }

    return "Não informado";
  };

  const getPatientLocation = () => {
    // Try personal data first, then fall back to patient city/state
    if (personalData?.city && personalData?.state) {
      const city = personalData.city.trim();
      const state = personalData.state.trim();
      if (city && state && city !== "N/A" && state !== "N/A") {
        return `${city}-${state}`;
      }
    }

    // Fall back to patient location
    if (patient?.city && patient?.state) {
      const city = patient.city.trim();
      const state = patient.state.trim();
      if (city && state && city !== "N/A" && state !== "N/A") {
        return `${city}-${state}`;
      }
    }

    return "Não informado";
  };

  // Function to format age and location in a user-friendly way
  const getPatientInfo = () => {
    const age = getPatientAge();
    const location = getPatientLocation();

    const ageStr = age === "Não informado" ? null : `${age} anos`;
    const locationStr = location === "Não informado" ? null : location;

    // Handle different combinations
    if (ageStr && locationStr) {
      return `${ageStr}, ${locationStr}`;
    } else if (ageStr) {
      return ageStr;
    } else if (locationStr) {
      return locationStr;
    } else {
      return "Informações de idade e localização indisponíveis";
    }
  };

  // Function to format date from yyyy-mm-dd to dd/mm/yyyy
  const formatDiagnosisDate = (dateStr: string) => {
    if (!dateStr) return "-";

    try {
      // If it's already in yyyy-mm-dd format, parse and reformat
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("pt-BR");
      }
      return dateStr; // Return as-is if parsing fails
    } catch (error) {
      console.warn("Error formatting diagnosis date:", error);
      return dateStr;
    }
  };

  const getPatientInitial = () => {
    if (!patient?.name) return "P";
    return patient.name.charAt(0).toUpperCase();
  };

  // Função helper para interpretar valores booleanos vindos do banco
  const getBooleanValue = (value: any): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      const lowerValue = value.toLowerCase().trim();
      return (
        lowerValue === "true" ||
        lowerValue === "1" ||
        lowerValue === "sim" ||
        lowerValue === "yes"
      );
    }
    if (typeof value === "number") return value > 0;
    return false;
  };

  // Função helper para formatar altura
  const getFormattedHeight = (height: any): string => {
    if (!height) return "Não informado";
    const numHeight = typeof height === "string" ? parseFloat(height) : height;
    if (isNaN(numHeight) || numHeight <= 0 || numHeight > 300) {
      return "Não informado";
    }
    return `${numHeight} cm`;
  };

  // Função helper para formatar peso
  const getFormattedWeight = (weight: any): string => {
    if (!weight) return "Não informado";
    const numWeight = typeof weight === "string" ? parseFloat(weight) : weight;
    if (isNaN(numWeight) || numWeight <= 0 || numWeight > 1000) {
      return "Não informado";
    }
    return `${numWeight} kg`;
  };

  // Função helper para calcular IMC
  const getCalculatedIMC = (height: any, weight: any): string | null => {
    if (!height || !weight) return null;

    const numHeight = typeof height === "string" ? parseFloat(height) : height;
    const numWeight = typeof weight === "string" ? parseFloat(weight) : weight;

    if (
      isNaN(numHeight) ||
      isNaN(numWeight) ||
      numHeight <= 0 ||
      numWeight <= 0
    ) {
      return null;
    }

    if (numHeight > 300 || numWeight > 1000) {
      return null;
    }

    const heightInMeters = numHeight / 100;
    const imc = numWeight / Math.pow(heightInMeters, 2);

    if (isNaN(imc) || imc < 5 || imc > 100) {
      return null;
    }

    return imc.toFixed(1);
  };

  if (!user || user.profession !== "medico") {
    navigate("/dashboard");
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-gray-600">Carregando dados do paciente...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Paciente não encontrado</p>
            <Button onClick={() => navigate(backPath)} className="mt-4">
              Voltar para lista
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/pacientes")}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <h1 className="text-2xl font-semibold text-gray-900">
                {patient.name}
              </h1>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Patient Info */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-semibold text-blue-600">
                      {getPatientInitial()}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {patient.name}
                    </h2>
                    <p className="text-gray-600">{getPatientInfo()}</p>
                  </div>
                </div>

                <Button
                  onClick={() =>
                    navigate(`/pacientes/${patient.id}/indicadores`)
                  }
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Ver indicadores
                </Button>
              </div>

              {/* Dados Médicos Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Dados Médicos
                  </h3>
                  {!patient?.isShared && !medicalData && (
                    <Button
                      onClick={() =>
                        navigate(`/pacientes/${patient.id}/editar`)
                      }
                      variant="outline"
                      size="sm"
                      className="text-blue-600 border-blue-600 hover:bg-blue-50"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Preencher dados
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Medidas Físicas */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 border-b border-gray-100 pb-2">
                      Medidas Físicas
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Altura:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {getFormattedHeight(medicalData?.height)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Peso:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {getFormattedWeight(patient?.weight)}
                        </span>
                      </div>
                      {getCalculatedIMC(
                        medicalData?.height,
                        patient?.weight,
                      ) && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">IMC:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {getCalculatedIMC(
                              medicalData?.height,
                              medicalData?.weight,
                            )}{" "}
                            kg/m²
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Condições de Saúde */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 border-b border-gray-100 pb-2">
                      Condições de Saúde
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Fumante:</span>
                        <div className="flex items-center">
                          <div
                            className={`w-3 h-3 rounded-full mr-2 ${getBooleanValue(medicalData?.smoker) ? "bg-red-500" : "bg-green-500"}`}
                          ></div>
                          <span className="text-sm font-medium text-gray-900">
                            {getBooleanValue(medicalData?.smoker)
                              ? "Sim"
                              : "Não"}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Pressão alta:
                        </span>
                        <div className="flex items-center">
                          <div
                            className={`w-3 h-3 rounded-full mr-2 ${getBooleanValue(medicalData?.highBloodPressure) ? "bg-red-500" : "bg-green-500"}`}
                          ></div>
                          <span className="text-sm font-medium text-gray-900">
                            {getBooleanValue(medicalData?.highBloodPressure)
                              ? "Sim"
                              : "Não"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Estilo de Vida */}
                  <div className="md:col-span-2">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 border-b border-gray-100 pb-2">
                      Estilo de Vida
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Faz atividade física:
                        </span>
                        <div className="flex items-center">
                          <div
                            className={`w-3 h-3 rounded-full mr-2 ${getBooleanValue(medicalData?.physicalActivity) ? "bg-green-500" : "bg-gray-400"}`}
                          ></div>
                          <span className="text-sm font-medium text-gray-900">
                            {getBooleanValue(medicalData?.physicalActivity)
                              ? "Sim"
                              : "Não"}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Dieta saudável:
                        </span>
                        <div className="flex items-center">
                          <div
                            className={`w-3 h-3 rounded-full mr-2 ${getBooleanValue(medicalData?.healthyDiet) ? "bg-green-500" : "bg-gray-400"}`}
                          ></div>
                          <span className="text-sm font-medium text-gray-900">
                            {getBooleanValue(medicalData?.healthyDiet)
                              ? "Sim"
                              : "Não"}
                          </span>
                        </div>
                      </div>
                      {medicalData?.exerciseFrequency && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            Frequência de exercícios:
                          </span>
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {medicalData.exerciseFrequency}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {!medicalData && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm mb-4">
                      {patient?.isShared
                        ? "Dados médicos não compartilhados ou não preenchidos pelo paciente"
                        : "Dados médicos não preenchidos."}
                    </p>
                    {!patient?.isShared && (
                      <Button
                        onClick={() =>
                          navigate(`/pacientes/${patient.id}/editar`)
                        }
                        variant="outline"
                        size="sm"
                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Preencher dados médicos
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Diagnósticos Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Diagnósticos
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 text-sm font-medium text-gray-500">
                          Data
                        </th>
                        <th className="text-left py-3 text-sm font-medium text-gray-500">
                          Diagnóstico
                        </th>
                        <th className="text-left py-3 text-sm font-medium text-gray-500">
                          CID
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {diagnoses.length === 0 ? (
                        <tr>
                          <td
                            colSpan={3}
                            className="py-8 text-center text-gray-500"
                          >
                            Nenhum diagnóstico registrado
                          </td>
                        </tr>
                      ) : (
                        diagnoses.map((diagnosis) => (
                          <tr
                            key={diagnosis.id}
                            className="border-b border-gray-100"
                          >
                            <td className="py-3 text-sm text-gray-600">
                              {formatDiagnosisDate(diagnosis.date)}
                            </td>
                            <td className="py-3 text-sm text-gray-900">
                              {diagnosis.diagnosis}
                            </td>
                            <td className="py-3 text-sm text-gray-600">
                              {diagnosis.code}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Delete Button */}
              <Button
                variant="destructive"
                size="sm"
                onClick={
                  patient.status === "compartilhado"
                    ? handleRemoveSharing
                    : handleDeletePatient
                }
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {patient.status === "compartilhado"
                  ? "Remover compartilhamento"
                  : "Deletar perfil"}
              </Button>

              {/* Add Indicator Button */}
              <Button
                onClick={() =>
                  navigate(`/pacientes/${patient.id}/adicionar-indicador`)
                }
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar indicador
              </Button>

              {/* Instructions for doctor-created profiles */}
              {patient.status !== "compartilhado" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Acesso para o paciente:</strong>
                    <br />
                    Caso queira fornecer acesso deste perfil ao seu paciente,
                    informe o e-mail de cadastro e senha "123456".
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetailView;
