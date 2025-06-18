import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Edit, Trash2 } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { patientAPI } from "@/lib/patient-api";
import { patientProfileAPI } from "@/lib/patient-profile-api";
import { Patient } from "@/lib/patient-types";
import { PatientPersonalData } from "@/lib/patient-profile-types";
import { toast } from "@/hooks/use-toast";

const PatientDetailView = () => {
  const navigate = useNavigate();
  const { id: patientId } = useParams();
  const { user } = useAuth();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [personalData, setPersonalData] = useState<PatientPersonalData | null>(
    null,
  );
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
      // Carregar dados básicos do paciente
      const patients = await patientAPI.getPatients(user.id);
      const foundPatient = patients.patients.find((p) => p.id === patientId);

      if (foundPatient) {
        console.log("Found patient data:", foundPatient);
        setPatient(foundPatient);

        // Carregar dados pessoais detalhados
        const personal =
          await patientProfileAPI.getPatientPersonalData(patientId);
        console.log("Personal data:", personal);
        setPersonalData(personal);
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
      await patientAPI.deletePatients([patientId]);
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
                          Status
                        </th>
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
                      <tr className="border-b border-gray-100">
                        <td className="py-3">
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-800"
                          >
                            Atualizado
                          </Badge>
                        </td>
                        <td className="py-3 text-sm text-gray-600">
                          01/08/2024
                        </td>
                        <td className="py-3 text-sm text-gray-600">
                          Hipertensão
                        </td>
                        <td className="py-3 text-sm text-gray-600">I10.9</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3">
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-800"
                          >
                            Atualizado
                          </Badge>
                        </td>
                        <td className="py-3 text-sm text-gray-600">
                          05/03/2022
                        </td>
                        <td className="py-3 text-sm text-gray-600">
                          Pré-diabetes
                        </td>
                        <td className="py-3 text-sm text-gray-600">R73.0</td>
                      </tr>
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
                    Editar
                  </Button>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">
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
                        <strong>Altura:</strong> {personalData?.height || "N/A"}
                        cm
                      </p>
                      <p>
                        <strong>Peso:</strong>{" "}
                        {patient?.weight || personalData?.weight || "N/A"}kg
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">
                      Endereço
                    </h4>
                    <p className="text-sm text-gray-600">
                      {getPatientLocation()}
                    </p>
                  </div>

                  {(patient?.notes || personalData?.notes) && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-1">
                        Nota
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
                  onClick={handleDeletePatient}
                  className="w-full mt-4"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Deletar perfil
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
