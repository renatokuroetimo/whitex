import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContextHybrid";
import { patientAPI } from "@/lib/patient-api";
import { patientIndicatorAPI } from "@/lib/patient-indicator-api";
import { Patient } from "@/lib/patient-types";
import { PatientIndicatorValue } from "@/lib/patient-indicator-types";
import { toast } from "@/hooks/use-toast";

const EditPatientIndicator = () => {
  const navigate = useNavigate();
  const { patientId, indicatorId } = useParams<{
    patientId: string;
    indicatorId: string;
  }>();
  const { user } = useAuth();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [indicator, setIndicator] = useState<PatientIndicatorValue | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [value, setValue] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [visibleToMedics, setVisibleToMedics] = useState(true);

  useEffect(() => {
    if (patientId && indicatorId) {
      loadData();
    }
  }, [patientId, indicatorId]);

  const loadData = async () => {
    if (!patientId || !indicatorId) return;

    setIsLoading(true);
    try {
      const [patientData, indicatorData] = await Promise.all([
        patientAPI.getPatientById(patientId),
        patientIndicatorAPI.getPatientIndicatorValueById(indicatorId),
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

      if (!indicatorData) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Indicador não encontrado",
        });
        navigate(`/pacientes/${patientId}/indicadores`);
        return;
      }

      setPatient(patientData);
      setIndicator(indicatorData);

      // Preencher formulário
      setValue(indicatorData.value);
      setDate(indicatorData.date || "");
      setTime(indicatorData.time || "");
      setVisibleToMedics(indicatorData.visibleToMedics);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar dados",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!value.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Digite um valor",
      });
      return;
    }

    if (!indicatorId) return;

    setIsSaving(true);

    try {
      await patientIndicatorAPI.updatePatientIndicatorValue(indicatorId, {
        value: value.trim(),
        date: date || undefined,
        time: time || undefined,
        visibleToMedics,
      });

      toast({
        title: "Sucesso",
        description: "Indicador atualizado com sucesso",
      });

      navigate(`/pacientes/${patientId}/indicadores`);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao atualizar indicador",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/pacientes/${patientId}/indicadores`);
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

  if (!patient || !indicator) {
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
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Editar indicador
                </h1>
                <p className="text-sm text-gray-600">
                  {patient.name} • {indicator.categoryName} -{" "}
                  {indicator.subcategoryName} - {indicator.parameter}
                </p>
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              ← Voltar
            </button>
          </div>

          {/* Form */}
          <div className="max-w-2xl">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2">
                        Indicador
                      </Label>
                      <div className="p-3 bg-gray-50 rounded-md">
                        <p className="text-sm font-medium text-gray-900">
                          {indicator.categoryName} - {indicator.subcategoryName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {indicator.parameter} ({indicator.unitSymbol})
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm text-gray-600 mb-2">
                        Valor *
                      </Label>
                      <Input
                        type="number"
                        step="any"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="Digite o valor"
                        className="w-full"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Data */}
                      <div>
                        <Label className="text-sm text-gray-600 mb-2">
                          Data
                        </Label>
                        <Input
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="w-full"
                        />
                      </div>

                      {/* Horário */}
                      <div>
                        <Label className="text-sm text-gray-600 mb-2">
                          Horário
                        </Label>
                        <Input
                          type="time"
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-4">
                        Visível para
                      </Label>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm text-gray-700">Médicos</Label>
                        <Switch
                          checked={visibleToMedics}
                          onCheckedChange={setVisibleToMedics}
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2">
                        Informações
                      </Label>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>
                          <strong>Criado em:</strong>{" "}
                          {new Date(indicator.createdAt).toLocaleString(
                            "pt-BR",
                          )}
                        </p>
                        <p>
                          <strong>Última atualização:</strong>{" "}
                          {new Date(indicator.updatedAt).toLocaleString(
                            "pt-BR",
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSaving ? "Salvando..." : "Salvar alterações"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPatientIndicator;
