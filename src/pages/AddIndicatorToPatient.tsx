import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContextHybrid";
import { indicatorAPI } from "@/lib/indicator-api";
import { patientAPI } from "@/lib/patient-api";
import { patientIndicatorAPI } from "@/lib/patient-indicator-api";
import { Patient } from "@/lib/patient-types";
import { PatientIndicatorFormData } from "@/lib/patient-indicator-types";
import { toast } from "@/hooks/use-toast";

const AddIndicatorToPatient = () => {
  const navigate = useNavigate();
  const { patientId } = useParams<{ patientId: string }>();
  const { user } = useAuth();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [indicators, setIndicators] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndicator, setSelectedIndicator] = useState("");
  const [selectedIndicatorData, setSelectedIndicatorData] = useState<any>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [value, setValue] = useState("");
  const [visibleToMedics, setVisibleToMedics] = useState(true);

  useEffect(() => {
    if (patientId) {
      loadData();
    }
  }, [patientId]);

  useEffect(() => {
    if (selectedIndicator) {
      const indicator = indicators.find((ind) => ind.id === selectedIndicator);
      setSelectedIndicatorData(indicator);

      // Auto-fill current date if date is required
      if (indicator?.requiresDate) {
        const today = new Date().toISOString().split("T")[0];
        setDate(today);
      }

      // Auto-fill current time if time is required
      if (indicator?.requiresTime) {
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5);
        setTime(currentTime);
      }
    }
  }, [selectedIndicator, indicators]);

  const loadData = async () => {
    if (!patientId || !user?.id) return;

    setIsLoading(true);
    try {
      const [patientData, standardIndicators, customIndicators] =
        await Promise.all([
          patientAPI.getPatientById(patientId),
          indicatorAPI.getStandardIndicators(), // Médicos veem todos os indicadores padrão ao adicionar para pacientes
          indicatorAPI.getIndicators(user.id),
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

      // Combine standard and custom indicators
      const allIndicators = [
        ...standardIndicators.map((ind) => ({
          ...ind,
          isStandard: true,
          displayName: `${ind.categoryName} - ${ind.subcategoryName} - ${ind.parameter} (${ind.unitSymbol})`,
        })),
        ...customIndicators.map((ind) => ({
          ...ind,
          isStandard: false,
          displayName: `${ind.categoryName} - ${ind.subcategoryName} - ${ind.parameter} (${ind.unitOfMeasureSymbol})`,
        })),
      ];

      setIndicators(allIndicators);
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

    if (!selectedIndicator) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Selecione um indicador",
      });
      return;
    }

    if (!value.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Digite um valor",
      });
      return;
    }

    if (selectedIndicatorData?.requiresDate && !date) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Data é obrigatória para este indicador",
      });
      return;
    }

    if (selectedIndicatorData?.requiresTime && !time) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Horário é obrigatório para este indicador",
      });
      return;
    }

    if (!patientId || !user?.id) return;

    try {
      const formData: PatientIndicatorFormData = {
        indicatorId: selectedIndicator,
        indicatorType:
          selectedIndicatorData?.isStandard === true ? "standard" : "custom",
        value: value.trim(),
        date: selectedIndicatorData?.requiresDate ? date : undefined,
        time: selectedIndicatorData?.requiresTime ? time : undefined,
        visibleToMedics,
      };

      await patientIndicatorAPI.createPatientIndicatorValue(
        patientId,
        user.id,
        formData,
      );

      toast({
        title: "Sucesso",
        description: "Indicador adicionado com sucesso",
      });

      // Redirecionar para a lista de indicadores do paciente com timestamp para forçar reload
      navigate(`/pacientes/${patientId}/indicadores?refresh=${Date.now()}`);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao adicionar indicador",
      });
    }
  };

  const handleCancel = () => {
    navigate(`/pacientes/${patientId}`);
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
              <h1 className="text-2xl font-semibold text-gray-900">
                Adicionar indicador
              </h1>
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
                        Adicionar
                      </Label>
                      <div>
                        <Label className="text-sm text-gray-600 mb-2">
                          O que você vai adicionar agora?
                        </Label>
                        <Select
                          value={selectedIndicator}
                          onValueChange={setSelectedIndicator}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um indicador" />
                          </SelectTrigger>
                          <SelectContent>
                            {indicators.map((indicator) => (
                              <SelectItem
                                key={indicator.id}
                                value={indicator.id}
                              >
                                {indicator.displayName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm text-gray-600 mb-2">
                        Valor
                      </Label>
                      <Input
                        type="number"
                        step="any"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="Digite o valor"
                        className="w-full"
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
                          disabled={!selectedIndicatorData?.requiresDate}
                          className="w-full"
                          placeholder="dd/mm/aaaa"
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
                          disabled={!selectedIndicatorData?.requiresTime}
                          className="w-full"
                          placeholder="00:00"
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
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Salvar
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

export default AddIndicatorToPatient;
