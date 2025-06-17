import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit } from "lucide-react";
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
    } catch (error) {
      console.error("Error loading patient data:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar dados do paciente",
      });
      navigate("/pacientes");
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Hipertensão":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            Hipertensão
          </Badge>
        );
      case "Pré-diabetes":
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
            Pré-diabetes
          </Badge>
        );
      case "Diabetes":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
            Diabetes
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
            {status}
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="hidden lg:block">
          <Sidebar />
        </div>
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
      {/* Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header with back button */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate("/pacientes")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm">Voltar</span>
            </button>
          </div>

          {/* Patient Name Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">
              {patient.name}
            </h1>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Patient Info */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                {/* Patient Avatar and Basic Info */}
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-semibold mx-auto mb-4">
                    {getInitials(patient.name)}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {patient.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-1">
                    {patient.age} anos
                  </p>
                  <p className="text-sm text-gray-600">
                    {patient.city}, {patient.state}
                  </p>
                </div>

                {/* Ver Indicadores Button */}
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Ver indicadores
                </Button>
              </div>
            </div>

            {/* Right Column - Profile Details and Actions */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                {/* Profile Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Perfil
                  </h2>
                  <button
                    onClick={() => navigate(`/pacientes/${patient.id}/editar`)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Editar
                  </button>
                </div>

                {/* Profile Details */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Dados pessoais
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Nome: </span>
                      <span className="text-gray-900">{patient.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Idade: </span>
                      <span className="text-gray-900">{patient.age} anos</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Altura: </span>
                      <span className="text-gray-900">180cm</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Peso: </span>
                      <span className="text-gray-900">{patient.weight}kg</span>
                    </div>
                  </div>
                </div>

                {/* Endereço */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Endereço
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-900">
                        {patient.city}, {patient.state}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Nota */}
                {patient.notes && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      Nota
                    </h3>
                    <p className="text-sm text-gray-600">{patient.notes}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Deletar perfil
                  </button>
                </div>

                {/* Adicionar Indicador Button */}
                <div className="mt-6">
                  <Button
                    onClick={() =>
                      navigate(`/pacientes/${patient.id}/adicionar-indicador`)
                    }
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    Adicionar indicador
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Diagnósticos Section */}
          <div className="mt-8">
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Diagnósticos
                </h2>

                {diagnoses.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                            Status
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                            Data
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                            Condição
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                            Código
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {diagnoses.map((diagnosis) => (
                          <tr
                            key={diagnosis.id}
                            className="border-b border-gray-100"
                          >
                            <td className="py-3 px-4">
                              <span className="text-sm text-gray-600">
                                Atualizado
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-gray-900">
                                {diagnosis.date}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {getStatusBadge(diagnosis.status)}
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-gray-900">
                                {diagnosis.code}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">
                      Nenhum diagnóstico registrado
                    </p>
                  </div>
                )}
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
