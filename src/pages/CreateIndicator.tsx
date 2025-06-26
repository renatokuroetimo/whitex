import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { toast } from "@/hooks/use-toast";

const CreateIndicator = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect patients to their indicators page
  useEffect(() => {
    if (user?.profession === "paciente") {
      navigate("/patient/indicadores", { replace: true });
    }
  }, [user, navigate]);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [allSubcategories, setAllSubcategories] = useState<Subcategory[]>([]);
  const [units, setUnits] = useState<UnitOfMeasure[]>([]);
  const [existingIndicators, setExistingIndicators] = useState<any[]>([]);

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
    parentMetadataId: "",
    extendsMetadataId: "",
    standardId: "",
    source: "",
  });

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
      const [categoriesData, subcategoriesData, unitsData] = await Promise.all([
        indicatorAPI.getCategories(),
        indicatorAPI.getSubcategories(),
        indicatorAPI.getUnits(),
      ]);

      setCategories(categoriesData);
      setAllSubcategories(subcategoriesData);
      setUnits(unitsData);
    } catch (error) {
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

    // Validações
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
      console.log("🎯 === CRIANDO INDICADOR ===");
      console.log("🔍 FormData enviado:", formData);
      console.log("🔍 User ID:", user.id);

      await indicatorAPI.createIndicator(formData);
      toast({
        title: "Sucesso",
        description: "Indicador criado com sucesso",
      });
      navigate("/indicadores");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao criar indicador",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/indicadores");
  };

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
                Criar novo Indicador
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
                </div>

                {/* Obrigatoriedade */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Obrigatoriedade
                  </h3>
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
                        Horário
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
                        Data
                      </Label>
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
                    {isLoading ? "Salvando..." : "Salvar"}
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
