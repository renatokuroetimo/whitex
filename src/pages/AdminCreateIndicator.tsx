import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Plus } from "lucide-react";
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
import { adminAPI } from "@/lib/admin-api";
import { indicatorAPI } from "@/lib/indicator-api";
import {
  metadataOptionsAPI,
  MetadataContext,
  MetadataDataType,
} from "@/lib/metadata-options-api";
import {
  Category,
  Subcategory,
  UnitOfMeasure,
  IndicatorFormData,
} from "@/lib/indicator-types";
import { toast } from "@/hooks/use-toast";

const AdminCreateIndicator = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Form data
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

  // Options data
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [allSubcategories, setAllSubcategories] = useState<Subcategory[]>([]);
  const [units, setUnits] = useState<UnitOfMeasure[]>([]);
  const [contexts, setContexts] = useState<MetadataContext[]>([]);
  const [dataTypes, setDataTypes] = useState<MetadataDataType[]>([]);

  const currentAdmin = adminAPI.getCurrentAdmin();

  useEffect(() => {
    loadInitialData();
  }, []);

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
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // Business rules for metadata obligation based on metastandard specification
      // "É Obrigatório" and "Obrigatório Condicional" are mutually exclusive
      if (field === "isRequired" && value === true) {
        // If setting as required, disable conditional requirement
        newData.isConditional = false;
      } else if (field === "isConditional" && value === true) {
        // If setting as conditional, disable required
        newData.isRequired = false;
      }

      return newData;
    });
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

    setIsLoading(true);

    try {
      await adminAPI.createStandardIndicator(formData);
      toast({
        title: "Sucesso",
        description: "Indicador padrão criado com sucesso",
      });
      navigate("/admin/indicators");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Erro ao criar indicador",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/indicators");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-slate-600" />
              </button>
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">
                  Criar Indicador Padrão
                </h1>
                <p className="text-sm text-slate-600">
                  Adicionar novo indicador ao sistema
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600">
                {currentAdmin?.fullName || currentAdmin?.email}
              </span>
              <button
                onClick={handleCancel}
                className="text-sm text-purple-600 hover:text-purple-800"
              >
                ← Voltar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg border border-slate-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Novo Indicador Padrão
              </h2>
              <p className="text-sm text-slate-600">
                Configure os metadados do novo indicador
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Informações Básicas */}
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-4">
                Informações Básicas
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                {/* Categoria Principal */}
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2">
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
                  <Label className="text-sm font-medium text-slate-700 mb-2">
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
                        <SelectItem key={subcategory.id} value={subcategory.id}>
                          {subcategory.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Parâmetro */}
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2">
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
                  <Label className="text-sm font-medium text-slate-700 mb-2">
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
              <h3 className="text-lg font-medium text-slate-900 mb-4">
                Metadados
              </h3>
              <div className="space-y-4">
                {/* Definição */}
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2">
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
                    <Label className="text-sm font-medium text-slate-700 mb-2">
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
                    <Label className="text-sm font-medium text-slate-700 mb-2">
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
                          <SelectItem key={dataType.id} value={dataType.value}>
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
                    <Label className="text-sm font-medium text-slate-700 mb-2">
                      Standard ID
                    </Label>
                    <Input
                      value={formData.standardId || ""}
                      onChange={(e) =>
                        handleInputChange("standardId", e.target.value)
                      }
                      placeholder="ex: Dublin Core, MPEG-7, HL7 FHIR"
                      className="w-full"
                    />
                  </div>

                  {/* Fonte/Origem */}
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-2">
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
              <h3 className="text-lg font-medium text-slate-900 mb-4">
                Configurações
              </h3>
              <div className="space-y-4">
                {/* Requisitos de Dados */}
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-3 block">
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
                        className="text-sm text-slate-700"
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
                        className="text-sm text-slate-700"
                      >
                        Requer Data
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Obrigatoriedade de Metadados */}
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-3 block">
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
                        className="text-sm text-slate-700"
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
                        className="text-sm text-slate-700"
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
                        className="text-sm text-slate-700"
                      >
                        Repetível
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
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
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? "Criando..." : "Criar Indicador Padrão"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminCreateIndicator;
