import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useAuth } from "@/contexts/AuthContextHybrid";
import { indicatorAPI } from "@/lib/indicator-api";
import {
  Category,
  Subcategory,
  UnitOfMeasure,
  IndicatorFormData,
} from "@/lib/indicator-types";
import {
  metadataOptionsAPI,
  MetadataContext,
  MetadataDataType,
} from "@/lib/metadata-options-api";
import { toast } from "@/hooks/use-toast";

const CreateIndicator = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const isEditMode = !!id;

  // Redirect patients to their indicators page
  useEffect(() => {
    if (user?.profession === "paciente") {
      navigate("/patient/indicadores", { replace: true });
    }
  }, [user, navigate]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingIndicator, setIsLoadingIndicator] = useState(isEditMode);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [allSubcategories, setAllSubcategories] = useState<Subcategory[]>([]);
  const [units, setUnits] = useState<UnitOfMeasure[]>([]);
  const [contexts, setContexts] = useState<MetadataContext[]>([]);
  const [dataTypes, setDataTypes] = useState<MetadataDataType[]>([]);

  const [formData, setFormData] = useState<IndicatorFormData>({
    categoryId: "",
    subcategoryId: "",
    parameter: "",
    unitOfMeasureId: "",
    requiresTime: false,
    requiresDate: false,
    // Metadata fields
    definition: "",
    context: "",
    dataType: "",
    isRequired: false,
    isConditional: false,
    isRepeatable: false,
    standardId: "",
    source: "",
  });

  useEffect(() => {
    loadInitialData();
    if (isEditMode && id) {
      loadIndicatorData(id);
    }
  }, []);

  const loadIndicatorData = async (indicatorId: string) => {
    try {
      setIsLoadingIndicator(true);
      const indicator = await indicatorAPI.getIndicatorById(indicatorId);

      if (!indicator) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Indicador não encontrado",
        });
        navigate("/indicadores/criados");
        return;
      }

      // Verificar se o indicador pertence ao usuário atual
      if (indicator.doctorId !== user?.id) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Você não tem permissão para editar este indicador",
        });
        navigate("/indicadores/criados");
        return;
      }

      // Preencher o formulário com os dados do indicador
      setFormData({
        categoryId: indicator.categoryId || "",
        subcategoryId: indicator.subcategoryId || "",
        parameter: indicator.parameter || "",
        unitOfMeasureId: indicator.unitId || "",
        requiresTime: indicator.requiresTime || false,
        requiresDate: indicator.requiresDate || false,
        // Metadata fields
        definition: indicator.definition || "",
        context: indicator.context || "",
        dataType: indicator.dataType || "",
        isRequired: indicator.isRequired || false,
        isConditional: indicator.isConditional || false,
        isRepeatable: indicator.isRepeatable || false,
        standardId: indicator.standardId || "",
        source: indicator.source || "",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar dados do indicador",
      });
      navigate("/indicadores/criados");
    } finally {
      setIsLoadingIndicator(false);
    }
  };

  useEffect(() => {
    if (formData.categoryId) {
      loadSubcategories();
    } else {
      setSubcategories([]);
    }
  }, [formData.categoryId, allSubcategories]);

  const loadInitialData = async () => {
    try {
      const [
        categoriesData,
        subcategoriesData,
        unitsData,
        contextsData,
        dataTypesData,
      ] = await Promise.all([
        indicatorAPI.getCategories(),
        indicatorAPI.getSubcategories(),
        indicatorAPI.getUnits(),
        metadataOptionsAPI.getContexts(),
        metadataOptionsAPI.getDataTypes(),
      ]);

      setCategories(categoriesData);
      setAllSubcategories(subcategoriesData);
      setUnits(unitsData);
      setContexts(contextsData);
      setDataTypes(dataTypesData);
    } catch (error) {
      console.error("❌ Erro ao carregar dados iniciais:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar dados iniciais",
      });
    }
  };
  const loadSubcategories = () => {
    const filtered = allSubcategories.filter(
      (sub) => sub.categoryId === formData.categoryId,
    );
    setSubcategories(filtered);
    // Reset subcategory if it doesn't belong to selected category
    if (
      formData.subcategoryId &&
      !filtered.find((sub) => sub.id === formData.subcategoryId)
    ) {
      setFormData((prev) => ({ ...prev, subcategoryId: "" }));
    }
  };

  const handleInputChange = (field: keyof IndicatorFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações básicas
    if (!formData.categoryId) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Categoria é obrigatória",
      });
      return;
    }

    if (!formData.subcategoryId) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Subcategoria é obrigatória",
      });
      return;
    }

    if (!formData.parameter.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Parâmetro é obrigatório",
      });
      return;
    }

    if (!formData.unitOfMeasureId) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Unidade de medida é obrigatória",
      });
      return;
    }

    if (!user?.id) return;

    setIsLoading(true);

    try {
      if (isEditMode && id) {
        console.log("🎯 === ATUALIZANDO INDICADOR ===");
        console.log("🔍 FormData enviado:", formData);
        console.log("🔍 Indicator ID:", id);

        await indicatorAPI.updateIndicator(id, formData);
        toast({
          title: "Sucesso",
          description: "Indicador atualizado com sucesso",
        });
      } else {
        console.log("🎯 === CRIANDO INDICADOR ===");
        console.log("🔍 FormData enviado:", formData);
        console.log("🔍 User ID:", user.id);

        await indicatorAPI.createIndicator(formData);
        toast({
          title: "Sucesso",
          description: "Indicador criado com sucesso",
        });
      }
      navigate("/indicadores/criados");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: isEditMode
          ? "Erro ao atualizar indicador"
          : "Erro ao criar indicador",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/indicadores/criados");
  };

  if (isLoadingIndicator) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-gray-600">Carregando dados do indicador...</p>
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
                {isEditMode ? "Editar Indicador" : "Criar novo Indicador"}
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
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Informações Básicas */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Informações Básicas
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                    {/* Categoria Principal */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2">
                        Categoria Principal *
                      </Label>
                      <Select
                        value={formData.categoryId}
                        onValueChange={(value) =>
                          handleInputChange("categoryId", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Subcategoria */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2">
                        Subcategoria *
                      </Label>
                      <Select
                        value={formData.subcategoryId}
                        onValueChange={(value) =>
                          handleInputChange("subcategoryId", value)
                        }
                        disabled={!formData.categoryId}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              formData.categoryId
                                ? "Selecione uma subcategoria"
                                : "Primeiro selecione uma categoria"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {subcategories.map((subcategory) => (
                            <SelectItem
                              key={subcategory.id}
                              value={subcategory.id}
                            >
                              {subcategory.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Parâmetro */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2">
                        Parâmetro *
                      </Label>
                      <Input
                        value={formData.parameter}
                        onChange={(e) =>
                          handleInputChange("parameter", e.target.value)
                        }
                        placeholder="Digite o parâmetro"
                        className="w-full"
                      />
                    </div>

                    {/* Contexto */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2">
                        Contexto
                      </Label>
                      <Select
                        value={formData.context || ""}
                        onValueChange={(value) =>
                          handleInputChange("context", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o contexto" />
                        </SelectTrigger>
                        <SelectContent>
                          {contexts.map((context) => (
                            <SelectItem key={context.id} value={context.name}>
                              {context.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Metadados */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Metadados
                  </h3>
                  <div className="space-y-4">
                    {/* Definição */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2">
                        Definição
                      </Label>
                      <Textarea
                        value={formData.definition || ""}
                        onChange={(e) =>
                          handleInputChange("definition", e.target.value)
                        }
                        placeholder="Definição clara do significado do metadado"
                        className="w-full h-20"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                      {/* Unidade de medida */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2">
                          Unidade de medida *
                        </Label>
                        <Select
                          value={formData.unitOfMeasureId}
                          onValueChange={(value) =>
                            handleInputChange("unitOfMeasureId", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma unidade" />
                          </SelectTrigger>
                          <SelectContent>
                            {units.map((unit) => (
                              <SelectItem key={unit.id} value={unit.id}>
                                {unit.name} ({unit.symbol})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {/* Tipo de Dado */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2">
                          Tipo de Dado
                        </Label>
                        <Select
                          value={formData.dataType || ""}
                          onValueChange={(value) =>
                            handleInputChange("dataType", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            {dataTypes.map((dataType) => (
                              <SelectItem
                                key={dataType.id}
                                value={dataType.value}
                              >
                                {dataType.name}
                                {dataType.description && (
                                  <span className="text-gray-500 text-xs ml-2">
                                    - {dataType.description}
                                  </span>
                                )}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {/* Standard ID */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2">
                          Standard ID
                        </Label>
                        <Input
                          value={formData.standardId || ""}
                          onChange={(e) =>
                            handleInputChange("standardId", e.target.value)
                          }
                          placeholder="ex: Dublin Core, MPEG-7"
                          className="w-full"
                        />
                      </div>

                      {/* Fonte/Origem */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2">
                          Fonte/Origem
                        </Label>
                        <Input
                          value={formData.source || ""}
                          onChange={(e) =>
                            handleInputChange("source", e.target.value)
                          }
                          placeholder="Fonte ou origem do metadado"
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Configurações */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Configurações
                  </h3>
                  <div className="space-y-4">
                    {/* Obrigatoriedade Básica */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-3 block">
                        Requisitos de Dados
                      </Label>
                      <div className="flex gap-8">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="requiresTime"
                            checked={formData.requiresTime}
                            onCheckedChange={(checked) =>
                              handleInputChange("requiresTime", !!checked)
                            }
                          />
                          <Label
                            htmlFor="requiresTime"
                            className="text-sm text-gray-700"
                          >
                            Requer Horário
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="requiresDate"
                            checked={formData.requiresDate}
                            onCheckedChange={(checked) =>
                              handleInputChange("requiresDate", !!checked)
                            }
                          />
                          <Label
                            htmlFor="requiresDate"
                            className="text-sm text-gray-700"
                          >
                            Requer Data
                          </Label>
                        </div>
                      </div>
                    </div>

                    {/* Obrigatoriedade de Metadados */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-3 block">
                        Obrigatoriedade
                      </Label>
                      <div className="flex gap-8">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="isRequired"
                            checked={formData.isRequired || false}
                            onCheckedChange={(checked) =>
                              handleInputChange("isRequired", !!checked)
                            }
                          />
                          <Label
                            htmlFor="isRequired"
                            className="text-sm text-gray-700"
                          >
                            É Obrigatório
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="isConditional"
                            checked={formData.isConditional || false}
                            onCheckedChange={(checked) =>
                              handleInputChange("isConditional", !!checked)
                            }
                          />
                          <Label
                            htmlFor="isConditional"
                            className="text-sm text-gray-700"
                          >
                            Obrigatório Condicional
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="isRepeatable"
                            checked={formData.isRepeatable || false}
                            onCheckedChange={(checked) =>
                              handleInputChange("isRepeatable", !!checked)
                            }
                          />
                          <Label
                            htmlFor="isRepeatable"
                            className="text-sm text-gray-700"
                          >
                            Repetível
                          </Label>
                        </div>
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
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading
                      ? isEditMode
                        ? "Atualizando..."
                        : "Salvando..."
                      : isEditMode
                        ? "Atualizar"
                        : "Salvar"}
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

export default CreateIndicator;
