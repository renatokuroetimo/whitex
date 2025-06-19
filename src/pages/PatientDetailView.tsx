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
      console.log("🔍 Carregando dados do paciente ID:", patientId);
      const foundPatient = await patientAPI.getPatientById(patientId);

      if (foundPatient) {
        console.log("✅ ===== PACIENTE CARREGADO NA PÁGINA DE DETALHES =====");
        console.log("✅ ID:", foundPatient.id);
        console.log("✅ Nome:", foundPatient.name);
        console.log("✅ Status:", foundPatient.status);
        console.log("✅ Observações (notes):", foundPatient.notes);
        console.log("✅ Objeto completo:", foundPatient);
        setPatient(foundPatient);

        // Carregar dados pessoais detalhados
        const personal =
          await patientProfileAPI.getPatientPersonalData(patientId);
        setPersonalData(personal);

        // Carregar dados médicos detalhados
        const medical =
          await patientProfileAPI.getPatientMedicalData(patientId);
        setMedicalData(medical);

        // Carregar histórico de diagnósticos
        const patientDiagnoses = await patientAPI.getDiagnoses(patientId);
        setDiagnoses(patientDiagnoses);
      } else {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Paciente não encontrado",
        });
        navigate("/pacientes");
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
      navigate("/pacientes");
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
      navigate("/pacientes");
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
      const today = new Date();
      const birthDate = new Date(personalData.birthDate);
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        return age - 1;
      }
      return age;
    }

    // Fall back to patient.age if available
    if (patient?.age) {
      return patient.age;
    }

    return "N/A";
  };

  const getPatientLocation = () => {
    // Try personal data first, then fall back to patient city/state
    if (personalData?.city && personalData?.state) {
      return `${personalData.city}-${personalData.state}`;
    }

    // Fall back to patient location
    if (patient?.city && patient?.state) {
      return `${patient.city}-${patient.state}`;
    }

    return "N/A";
  };

  const getPatientInitial = () => {
    if (!patient?.name) return "P";
    return patient.name.charAt(0).toUpperCase();
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
            <Button onClick={() => navigate("/pacientes")} className="mt-4">
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
                    <p className="text-gray-600">
                      {getPatientAge()} anos, {getPatientLocation()}
                    </p>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Dados Médicos
                </h3>

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
                          {medicalData?.height
                            ? `${medicalData.height} cm`
                            : "Não informado"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Peso:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {medicalData?.weight
                            ? `${medicalData.weight} kg`
                            : "Não informado"}
                        </span>
                      </div>
                      {medicalData?.height && medicalData?.weight && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">IMC:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {(
                              medicalData.weight /
                              Math.pow(medicalData.height / 100, 2)
                            ).toFixed(1)}{" "}
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
                            className={`w-3 h-3 rounded-full mr-2 ${medicalData?.smoker ? "bg-red-500" : "bg-green-500"}`}
                          ></div>
                          <span className="text-sm font-medium text-gray-900">
                            {medicalData?.smoker ? "Sim" : "Não"}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Pressão alta:
                        </span>
                        <div className="flex items-center">
                          <div
                            className={`w-3 h-3 rounded-full mr-2 ${medicalData?.highBloodPressure ? "bg-red-500" : "bg-green-500"}`}
                          ></div>
                          <span className="text-sm font-medium text-gray-900">
                            {medicalData?.highBloodPressure ? "Sim" : "Não"}
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
                            className={`w-3 h-3 rounded-full mr-2 ${medicalData?.physicalActivity ? "bg-green-500" : "bg-gray-400"}`}
                          ></div>
                          <span className="text-sm font-medium text-gray-900">
                            {medicalData?.physicalActivity ? "Sim" : "Não"}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Dieta saudável:
                        </span>
                        <div className="flex items-center">
                          <div
                            className={`w-3 h-3 rounded-full mr-2 ${medicalData?.healthyDiet ? "bg-green-500" : "bg-gray-400"}`}
                          ></div>
                          <span className="text-sm font-medium text-gray-900">
                            {medicalData?.healthyDiet ? "Sim" : "Não"}
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
                    <p className="text-gray-500 text-sm">
                      Dados médicos não compartilhados ou não preenchidos pelo
                      paciente
                    </p>
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
                              {diagnosis.date}
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
              {/* Profile Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Perfil
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/pacientes/${patient.id}/editar`)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    {patient.status === "compartilhado"
                      ? "Adicionar diagnósticos"
                      : "Editar"}
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Dados pessoais
                    </h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <strong>Nome:</strong> {patient.name}
                      </p>
                      <p>
                        <strong>Idade:</strong> {getPatientAge()} anos
                      </p>
                      <p>
                        <strong>Sexo:</strong>{" "}
                        {personalData?.gender
                          ? personalData.gender.charAt(0).toUpperCase() +
                            personalData.gender.slice(1)
                          : "N/A"}
                      </p>
                      {personalData?.email && (
                        <p>
                          <strong>Email:</strong> {personalData.email}
                        </p>
                      )}
                      {personalData?.healthPlan && (
                        <p>
                          <strong>Plano de saúde:</strong>{" "}
                          {personalData.healthPlan}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Medidas físicas
                    </h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <strong>Altura:</strong>{" "}
                        {medicalData?.height
                          ? `${medicalData.height} cm`
                          : "N/A"}
                      </p>
                      <p>
                        <strong>Peso:</strong>{" "}
                        {medicalData?.weight
                          ? `${medicalData.weight} kg`
                          : patient?.weight
                            ? `${patient.weight} kg`
                            : "N/A"}
                      </p>
                      {medicalData?.height && medicalData?.weight && (
                        <p>
                          <strong>IMC:</strong>{" "}
                          {(
                            medicalData.weight /
                            Math.pow(medicalData.height / 100, 2)
                          ).toFixed(1)}{" "}
                          kg/m²
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Condições médicas
                    </h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center justify-between">
                        <span>Fumante:</span>
                        <div className="flex items-center">
                          <div
                            className={`w-2 h-2 rounded-full mr-1 ${medicalData?.smoker ? "bg-red-500" : "bg-green-500"}`}
                          ></div>
                          <span>{medicalData?.smoker ? "Sim" : "Não"}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Pressão alta:</span>
                        <div className="flex items-center">
                          <div
                            className={`w-2 h-2 rounded-full mr-1 ${medicalData?.highBloodPressure ? "bg-red-500" : "bg-green-500"}`}
                          ></div>
                          <span>
                            {medicalData?.highBloodPressure ? "Sim" : "Não"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Atividade física:</span>
                        <div className="flex items-center">
                          <div
                            className={`w-2 h-2 rounded-full mr-1 ${medicalData?.physicalActivity ? "bg-green-500" : "bg-gray-400"}`}
                          ></div>
                          <span>
                            {medicalData?.physicalActivity ? "Sim" : "Não"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Localização
                    </h4>
                    <p className="text-sm text-gray-600">
                      {getPatientLocation()}
                    </p>
                  </div>

                  {(patient?.notes || personalData?.notes) && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Observações
                      </h4>
                      <p className="text-sm text-gray-600">
                        {patient?.notes || personalData?.notes}
                      </p>
                    </div>
                  )}
                </div>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={
                    patient.status === "compartilhado"
                      ? handleRemoveSharing
                      : handleDeletePatient
                  }
                  className="w-full mt-4"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  {patient.status === "compartilhado"
                    ? "Remover compartilhamento"
                    : "Deletar perfil"}
                </Button>
              </div>

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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetailView;
