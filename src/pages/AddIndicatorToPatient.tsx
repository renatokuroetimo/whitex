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

  // Function to get readable data type label
  const getDataTypeLabel = (dataType: string): string => {
    const typeMap: { [key: string]: string } = {
      texto: "texto",
      numero: "número",
      data: "data",
      data_hora: "data e hora",
      booleano: "sim/não",
      lista: "lista",
      url: "URL",
      email: "email",
    };
    return typeMap[dataType] || "valor";
  };

  // Function to get input type based on data type
  const getInputType = (dataType: string): string => {
    const inputTypeMap: { [key: string]: string } = {
      texto: "text",
      numero: "number",
      data: "date",
      data_hora: "datetime-local",
      booleano: "text", // We'll handle boolean separately
      lista: "text",
      url: "url",
      email: "email",
    };
    return inputTypeMap[dataType] || "text";
  };
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
      console.log("🚀 Carregando dados para paciente:", patientId);

      // Load data with individual error handling
      let patientData = null;
      let standardIndicators = [];
      let customIndicators = [];

      try {
        patientData = await patientAPI.getPatientById(patientId);
      } catch (error) {
        console.error("❌ Erro ao buscar paciente:", error);
        toast({
          variant: "destructive",
          title: "Erro de Conexão",
          description:
            "Não foi possível carregar os dados do paciente. Verifique sua conexão.",
        });
        return;
      }

      try {
        standardIndicators = await indicatorAPI.getStandardIndicators();
      } catch (error) {
        console.error("❌ Erro ao buscar indicadores padrão:", error);
        // Continue mesmo se indicadores padrão falharem
      }

      try {
        customIndicators = await indicatorAPI.getIndicators(); // Load doctor's custom indicators
        console.log(
          "📊 Indicadores customizados carregados:",
          customIndicators.length,
        );
      } catch (error) {
        console.error("❌ Erro ao buscar indicadores customizados:", error);
        // Continue sem indicadores customizados se houver erro
        customIndicators = [];
      }

      if (!patientData) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Paciente não encontrado ou erro de conexão",
        });
        navigate("/pacientes");
        return;
      }

      setPatient(patientData);

      console.log("📊 DADOS CARREGADOS:");
      console.log("- Indicadores Padrão:", standardIndicators.length);
      console.log("- Indicadores Customizados:", customIndicators.length);

      // Filtrar indicadores customizados problemáticos (que não têm categoria correta)
      const validCustomIndicators = customIndicators.filter((ind) => {
        const hasValidCategory =
          ind.categoryName &&
          ind.categoryName !== "Categoria" &&
          ind.categoryName !== "Indicadores Gerais" &&
          !ind.categoryName.startsWith("cat");

        if (!hasValidCategory) {
          console.warn("❌ Indicador customizado inválido removido:", ind);
        }

        return hasValidCategory;
      });

      console.log(
        "✅ Indicadores customizados válidos:",
        validCustomIndicators.length,
      );

      // Combine standard and valid custom indicators
      const allIndicators = [
        ...standardIndicators.map((ind) => ({
          ...ind,
          isStandard: true,
          dataType: ind.dataType || "numero", // Default to number for standard indicators
          displayName: `${ind.categoryName} - ${ind.subcategoryName} - ${ind.parameter} (${ind.unitSymbol})`,
        })),
        ...validCustomIndicators.map((ind) => {
          console.log("🔍 DEBUG Valid Custom Indicator:", ind);

          const categoryName = ind.categoryName || "Indicadores Customizados";
          const subcategoryName =
            ind.subcategoryName || "Parâmetro Personalizado";
          const parameter = ind.parameter || ind.name || "Parâmetro";
          const unit = ind.unitSymbol || ind.unit_symbol || ind.unit || "un";
          const dataType = ind.dataType || "numero"; // Get dataType from indicator

          const finalDisplay = `${categoryName} - ${subcategoryName} - ${parameter} (${unit})`;
          console.log("🎯 FINAL CUSTOM DISPLAY:", finalDisplay);
          console.log("📊 DATA TYPE:", dataType);

          return {
            ...ind,
            isStandard: false,
            dataType: dataType,
            displayName: finalDisplay,
          };
        }),
      ];

      console.log("📋 TOTAL DE INDICADORES VÁLIDOS:", allIndicators.length);
      allIndicators.forEach((ind) => console.log("  -", ind.displayName));

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

    // Validate based on data type
    if (selectedIndicatorData?.dataType) {
      const dataType = selectedIndicatorData.dataType;

      if (dataType === "numero") {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
          toast({
            variant: "destructive",
            title: "Erro",
            description: "O valor deve ser um número válido",
          });
          return;
        }
      } else if (dataType === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          toast({
            variant: "destructive",
            title: "Erro",
            description: "Digite um email válido",
          });
          return;
        }
      } else if (dataType === "url") {
        try {
          new URL(value);
        } catch {
          toast({
            variant: "destructive",
            title: "Erro",
            description: "Digite uma URL válida",
          });
          return;
        }
      }
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
      const newIndicatorValue: any = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        patientId: patientId,
        indicatorId: selectedIndicator,
        value: value.trim(),
        categoryName: selectedIndicatorData?.categoryName || "Categoria",
        subcategoryName:
          selectedIndicatorData?.subcategoryName || "Subcategoria",
        parameter: selectedIndicatorData?.parameter || "Parâmetro",
        unitSymbol: selectedIndicatorData?.unitSymbol || "un",
        date: selectedIndicatorData?.requiresDate ? date : undefined,
        time: selectedIndicatorData?.requiresTime ? time : undefined,
        createdAt: new Date().toISOString(),
      };

      await patientIndicatorAPI.createPatientIndicatorValue(newIndicatorValue);

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
                        {selectedIndicatorData
                          ? `Valor - ${getDataTypeLabel(selectedIndicatorData.dataType || "numero")}`
                          : "Valor"}
                      </Label>
                      {selectedIndicatorData?.dataType === "booleano" ? (
                        <Select value={value} onValueChange={setValue}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma opção" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sim">Sim</SelectItem>
                            <SelectItem value="não">Não</SelectItem>
                            <SelectItem value="true">Verdadeiro</SelectItem>
                            <SelectItem value="false">Falso</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          type={
                            selectedIndicatorData
                              ? getInputType(
                                  selectedIndicatorData.dataType || "numero",
                                )
                              : "text"
                          }
                          step={
                            selectedIndicatorData?.dataType === "numero"
                              ? "any"
                              : undefined
                          }
                          value={value}
                          onChange={(e) => setValue(e.target.value)}
                          placeholder={
                            selectedIndicatorData
                              ? `Digite o ${getDataTypeLabel(selectedIndicatorData.dataType || "numero")}`
                              : "Digite o valor"
                          }
                          className="w-full"
                        />
                      )}
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
