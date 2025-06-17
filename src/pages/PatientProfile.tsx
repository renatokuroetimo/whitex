import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useAuth } from "@/contexts/AuthContext";
import { patientAPI } from "@/lib/patient-api";
import { Patient, Diagnosis } from "@/lib/patient-types";
import { toast } from "@/hooks/use-toast";

const PatientProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (id) {
      loadPatientData();
    }
  }, [id]);

  const loadPatientData = async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      try {
        const [patientData, diagnosesData] = await Promise.all([
          patientAPI.getPatientById(id),
          patientAPI.getPatientDiagnoses(id),
        ]);

        if (!patientData) {
          toast({
            variant: "destructive",
            title: "Erro",
            description: "Paciente não encontrado",
          });
          navigate("/pacientes");
          return;
        }

        setPatient(patientData);
        setDiagnoses(diagnosesData);
      } catch (apiError) {
        console.error("Error loading patient data:", apiError);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Erro ao carregar dados do paciente",
        });
        navigate("/pacientes");
        return;
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

  const handleDeletePatient = async () => {
    if (!patient) return;

    try {
      await patientAPI.deletePatients([patient.id]);
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Hipertensão":
        return "bg-green-100 text-green-800";
      case "Pré-diabetes":
        return "bg-orange-100 text-orange-800";
      case "Diabetes":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-gray-600">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/pacientes")}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <h1 className="text-2xl font-semibold text-gray-900">
                {patient.name}
              </h1>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              ← Voltar
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Left Column - Patient Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Patient Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl font-semibold">
                      {getInitials(patient.name)}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {patient.name}
                    </h2>
                    <p className="text-gray-600">{patient.age} anos</p>
                    <p className="text-gray-600">
                      {patient.city}, {patient.state}
                    </p>
                  </div>
                </div>

                <Button className="w-full bg-blue-600 hover:bg-blue-700 mb-4">
                  Ver indicadores
                </Button>
              </div>

              {/* Diagnoses */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Diagnósticos
                  </h3>
                </div>

                {diagnoses.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Nenhum diagnóstico registrado</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Data
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Código
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {diagnoses.map((diagnosis) => (
                          <tr key={diagnosis.id}>
                            <td className="px-4 py-3">
                              <Badge
                                className={getStatusColor(diagnosis.status)}
                              >
                                {diagnosis.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {diagnosis.date}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {diagnosis.code}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Profile Details */}
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Perfil
                  </h3>
                  <button
                    onClick={() => navigate(`/pacientes/${patient.id}/editar`)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Editar
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Dados pessoais</p>
                    <div className="mt-2 space-y-2 text-sm">
                      <p>
                        <strong>Nome:</strong> {patient.name}
                      </p>
                      <p>
                        <strong>Idade:</strong> {patient.age} anos
                      </p>
                      <p>
                        <strong>Altura:</strong> 160cm
                      </p>
                      <p>
                        <strong>Peso:</strong> {patient.weight}kg
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Endereço</p>
                    <div className="mt-2 text-sm">
                      <p>
                        {patient.city}, {patient.state}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Nota</p>
                    <div className="mt-2 text-sm text-gray-600">
                      <p>Paciente precisa ficar em repouso.</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Deletar perfil
                  </button>
                </div>
              </div>

              {/* Add Indicator Button */}
              <Button className="w-full bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar indicador
              </Button>
            </div>
          </div>
        </div>

        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Deletar paciente"
        description={`Tem certeza que deseja deletar o paciente ${patient.name}? Esta ação não pode ser desfeita.`}
        confirmText="Deletar"
        cancelText="Cancelar"
        onConfirm={handleDeletePatient}
        variant="destructive"
      />
    </div>
  );
};

export default PatientProfile;