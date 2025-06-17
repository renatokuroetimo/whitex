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
      <div className="p-4">
        <button
          onClick={() => navigate("/pacientes")}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-medium text-gray-900 mb-2">
              {patient.name}
            </h1>
            <p className="text-sm text-gray-600">
              {patient.age} anos • {patient.city}, {patient.state}
            </p>
          </div>

          {/* Patient Avatar */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
              <span className="text-white text-xl font-semibold">
                {getInitials(patient.name)}
              </span>
            </div>
          </div>

          {/* Patient Details Form */}
          <div className="space-y-4 mb-6">
            {/* Weight Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Peso
              </label>
              <input
                type="text"
                value={`${patient.weight} kg`}
                readOnly
                className="w-full h-12 px-3 border border-gray-300 rounded-md bg-gray-50 text-gray-900"
              />
            </div>

            {/* Age Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Idade
              </label>
              <input
                type="text"
                value={`${patient.age} anos`}
                readOnly
                className="w-full h-12 px-3 border border-gray-300 rounded-md bg-gray-50 text-gray-900"
              />
            </div>
          </div>

          {/* Main Action Button */}
          <Button className="w-full h-12 bg-brand-blue hover:bg-blue-600 text-white font-medium rounded-md transition-colors">
            Ver indicadores
          </Button>

          {/* Status text */}
          <p className="text-xs text-gray-500 text-center mt-4 mb-6">
            Status do paciente:{" "}
            <span className="text-green-600 font-medium">{patient.status}</span>
          </p>

          {/* Divider */}
          <div className="my-6">
            <p className="text-sm text-gray-500 text-center">
              Ou gerencie o perfil usando:
            </p>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            {/* Edit Profile button */}
            <Button
              onClick={() => navigate(`/pacientes/${patient.id}/editar`)}
              variant="outline"
              className="w-full h-12 border border-gray-300 hover:bg-gray-50 text-gray-700 font-normal flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
              Editar perfil do paciente
            </Button>

            {/* Add Indicator button */}
            <Button
              variant="outline"
              className="w-full h-12 border border-gray-300 hover:bg-gray-50 text-gray-700 font-normal flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
              Adicionar indicador
            </Button>
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
