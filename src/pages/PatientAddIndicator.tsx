import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import MobileLayout from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContextHybrid";
import { indicatorAPI } from "@/lib/indicator-api";
import { patientIndicatorAPI } from "@/lib/patient-indicator-api";
import {
  PatientIndicatorFormData,
  PatientIndicatorValue,
} from "@/lib/patient-indicator-types";
import { toast } from "@/hooks/use-toast";

const PatientAddIndicator = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [indicators, setIndicators] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndicator, setSelectedIndicator] = useState("");
  const [selectedIndicatorData, setSelectedIndicatorData] = useState<any>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [value, setValue] = useState("");

  useEffect(() => {
    if (user?.id && user.profession === "paciente") {
      loadData();
    } else if (user && user.profession !== "paciente") {
      navigate("/dashboard");
    }
  }, [user, navigate]);

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
    setIsLoading(true);
    try {
      // Para pacientes, carregar TODOS os indicadores padrão (não apenas os visíveis)
      // Os pacientes devem ter acesso a todos os indicadores para registrar seus dados
      const standardIndicators = await indicatorAPI.getStandardIndicators();

      const mappedIndicators = standardIndicators.map((ind) => ({
        ...ind,
        isStandard: true,
        displayName: `${ind.categoryName} - ${ind.subcategoryName} - ${ind.parameter} (${ind.unitSymbol})`,
      }));

      console.log("📊 Indicadores carregados para paciente:", mappedIndicators);
      setIndicators(mappedIndicators);
    } catch (error) {
      console.error("❌ Erro ao carregar indicadores:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar indicadores",
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

    if (!user?.id) return;

    try {
      const newIndicatorValue: PatientIndicatorValue = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        patientId: user.id,
        indicatorId: selectedIndicator,
        indicatorType: "standard", // Pacientes só podem usar indicadores padrão
        categoryName: selectedIndicatorData?.categoryName || "Categoria",
        subcategoryName:
          selectedIndicatorData?.subcategoryName || "Subcategoria",
        parameter: selectedIndicatorData?.parameter || "Parâmetro",
        unitSymbol: selectedIndicatorData?.unitSymbol || "un",
        value: value.trim(),
        date: selectedIndicatorData?.requiresDate ? date : undefined,
        time: selectedIndicatorData?.requiresTime ? time : undefined,
        visibleToMedics: true, // Sempre visível para médicos para pacientes
        doctorId: user.id, // Para pacientes, doctorId = userId
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await patientIndicatorAPI.createPatientIndicatorValue(newIndicatorValue);

      toast({
        title: "Sucesso",
        description: "Indicador registrado com sucesso",
      });

      navigate("/patient/indicadores");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao registrar indicador",
      });
    }
  };

  const handleCancel = () => {
    navigate("/patient/indicadores");
  };

  if (!user || user.profession !== "paciente") {
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
            <p className="text-gray-600">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <MobileLayout>
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
              Registrar indicador
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
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-1">
                Registro de indicador de saúde
              </h2>
              <p className="text-sm text-gray-600">
                Registre um novo valor para acompanhar sua saúde
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Indicador */}
                <div className="sm:col-span-2">
                  <Label className="text-sm font-medium text-gray-700 mb-2">
                    Indicador *
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
                        <SelectItem key={indicator.id} value={indicator.id}>
                          {indicator.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Valor */}
                <div>
                  <Label className="text-sm text-gray-700 mb-2">Valor *</Label>
                  <Input
                    type="number"
                    step="any"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Digite o valor"
                    className="w-full"
                  />
                </div>

                {/* Data */}
                <div>
                  <Label className="text-sm text-gray-700 mb-2">Data</Label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    disabled={!selectedIndicatorData?.requiresDate}
                    className="w-full"
                  />
                </div>

                {/* Horário */}
                <div className="sm:col-span-2">
                  <Label className="text-sm text-gray-700 mb-2">Horário</Label>
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    disabled={!selectedIndicatorData?.requiresTime}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  💡 Seus registros serão automaticamente compartilhados com os
                  médicos que você autorizou em seu perfil.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-6">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-[#00B1BB] hover:bg-[#01485E]"
                >
                  Registrar
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default PatientAddIndicator;
