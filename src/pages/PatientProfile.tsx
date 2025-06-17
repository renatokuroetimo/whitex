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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header with back arrow */}
      <div className="p-4 sm:p-6">
        <button
          onClick={() => navigate("/pacientes")}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-start justify-center px-4 sm:px-6">
        <div className="w-full max-w-lg mx-auto">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              {patient.name}
            </h1>
            <p className="text-sm text-gray-600">
              {patient.age} anos, {patient.city} - {patient.state}
            </p>
          </div>

          {/* Patient Avatar */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-semibold">
                {getInitials(patient.name)}
              </span>
            </div>
          </div>

          {/* Main Actions */}
          <div className="space-y-4 mb-8">
            <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md">
              Ver indicadores
            </Button>
          </div>

          {/* Patient Information Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Informações do Paciente
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Nome:</span>
                <span className="font-medium text-gray-900">
                  {patient.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Idade:</span>
                <span className="font-medium text-gray-900">
                  {patient.age} anos
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cidade:</span>
                <span className="font-medium text-gray-900">
                  {patient.city}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estado:</span>
                <span className="font-medium text-gray-900">
                  {patient.state}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Peso:</span>
                <span className="font-medium text-gray-900">
                  {patient.weight}kg
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <Badge className="bg-green-100 text-green-800">
                  {patient.status.toUpperCase()}
                </Badge>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => navigate(`/pacientes/${patient.id}/editar`)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Editar perfil
              </button>
            </div>
          </div>

          {/* Diagnoses Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Diagnósticos
            </h3>

            {diagnoses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhum diagnóstico registrado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {diagnoses.map((diagnosis) => (
                  <div
                    key={diagnosis.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <Badge className={getStatusColor(diagnosis.status)}>
                        {diagnosis.status}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-1">
                        {diagnosis.date}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {diagnosis.code}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3 mb-8">
            <Button className="w-full bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar indicador
            </Button>

            <div className="text-center">
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Deletar perfil
              </button>
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
