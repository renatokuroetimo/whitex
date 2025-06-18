import {
  PatientIndicatorValue,
  PatientIndicatorFormData,
} from "./patient-indicator-types";
import { indicatorAPI } from "./indicator-api";
import { supabase } from "./supabase";
import { isFeatureEnabled } from "./feature-flags";

class PatientIndicatorAPI {
  private readonly STORAGE_KEY = "medical_app_patient_indicators";

  // Simula delay de rede
  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Gera ID único
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Pega todos os valores de indicadores salvos
  private getStoredIndicatorValues(): PatientIndicatorValue[] {
    try {
      const values = localStorage.getItem(this.STORAGE_KEY);
      return values ? JSON.parse(values) : [];
    } catch {
      return [];
    }
  }

  // Salva valores de indicadores
  private saveIndicatorValues(values: PatientIndicatorValue[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(values));
  }

  // Criar valor de indicador para paciente
  async createPatientIndicatorValue(
    patientId: string,
    doctorId: string,
    data: PatientIndicatorFormData,
  ): Promise<PatientIndicatorValue> {
    await this.delay(500);

    // Buscar detalhes do indicador
    let indicatorDetails: any = null;

    if (data.indicatorType === "standard") {
      const standardIndicators = await indicatorAPI.getStandardIndicators();
      indicatorDetails = standardIndicators.find(
        (ind) => ind.id === data.indicatorId,
      );
    } else {
      const customIndicators = await indicatorAPI.getIndicators(doctorId);
      indicatorDetails = customIndicators.find(
        (ind) => ind.id === data.indicatorId,
      );
    }

    if (!indicatorDetails) {
      throw new Error("Indicador não encontrado");
    }

    const newValue: PatientIndicatorValue = {
      id: this.generateId(),
      patientId,
      indicatorId: data.indicatorId,
      indicatorType: data.indicatorType,
      categoryName: indicatorDetails.categoryName,
      subcategoryName: indicatorDetails.subcategoryName,
      parameter: indicatorDetails.parameter,
      unitSymbol:
        data.indicatorType === "standard"
          ? indicatorDetails.unitSymbol
          : indicatorDetails.unitOfMeasureSymbol,
      value: data.value,
      date: data.date,
      time: data.time,
      visibleToMedics: data.visibleToMedics,
      doctorId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log("🔥 CRIANDO VALOR INDICADOR:", newValue);

    // Se Supabase estiver ativo, usar Supabase
    if (isFeatureEnabled("useSupabaseIndicators") && supabase) {
      console.log("🚀 Criando valor indicador no Supabase");

      try {
        const insertData = {
          id: newValue.id,
          patient_id: newValue.patientId,
          indicator_id: newValue.indicatorId,
          value: newValue.value,
          date: newValue.date,
          created_at: newValue.createdAt,
        };

        console.log("📝 Dados do valor indicador:", insertData);

        const { data: supabaseData, error } = await supabase
          .from("patient_indicator_values")
          .insert([insertData]);

        console.log("📊 Resposta do Supabase:", { data: supabaseData, error });

        if (error) {
          console.error(
            "❌ Erro ao criar valor indicador:",
            JSON.stringify(
              {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code,
              },
              null,
              2,
            ),
          );
          throw error; // Forçar fallback
        } else {
          console.log("✅ Valor indicador criado no Supabase!");
          return newValue;
        }
      } catch (supabaseError) {
        console.error(
          "💥 Erro no Supabase valor indicador:",
          JSON.stringify(
            {
              message:
                supabaseError instanceof Error
                  ? supabaseError.message
                  : "Unknown error",
              stack:
                supabaseError instanceof Error
                  ? supabaseError.stack
                  : undefined,
              error: supabaseError,
            },
            null,
            2,
          ),
        );
        // Continuar para fallback
      }
    } else {
      console.log("⚠️ Supabase indicadores não ativo para valores");
    }

    console.log("📁 Salvando valor indicador no localStorage");
    const values = this.getStoredIndicatorValues();
    values.push(newValue);
    this.saveIndicatorValues(values);

    return newValue;
  }

  // Buscar valores de indicadores de um paciente
  async getPatientIndicatorValues(
    patientId: string,
  ): Promise<PatientIndicatorValue[]> {
    await this.delay(300);
    const values = this.getStoredIndicatorValues();
    return values
      .filter((value) => value.patientId === patientId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }

  // Buscar valores de indicadores de um paciente
  async getPatientIndicatorValues(
    patientId: string,
  ): Promise<PatientIndicatorValue[]> {
    await this.delay(300);

    console.log(
      "🔍 getPatientIndicatorValues chamado para patientId:",
      patientId,
    );

    // Se Supabase estiver ativo, usar Supabase
    if (isFeatureEnabled("useSupabaseIndicators") && supabase) {
      console.log("🚀 Buscando valores indicadores no Supabase");

      try {
        const { data: supabaseValues, error } = await supabase
          .from("patient_indicator_values")
          .select("*")
          .eq("patient_id", patientId);

        console.log("📊 Valores indicadores do Supabase:", {
          data: supabaseValues,
          error,
        });

        if (error) {
          console.error("❌ Erro ao buscar valores indicadores:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
          });
          // Fallback para localStorage
        } else {
          // Converter dados do Supabase para formato local
          const values = (supabaseValues || []).map(
            (val: any): PatientIndicatorValue => ({
              id: val.id,
              patientId: val.patient_id,
              indicatorId: val.indicator_id,
              indicatorType: "custom", // Default, será melhorado depois
              categoryName: "Categoria", // Default, será melhorado depois
              subcategoryName: "Subcategoria", // Default, será melhorado depois
              parameter: "Parâmetro", // Default, será melhorado depois
              unitSymbol: "un", // Default, será melhorado depois
              value: val.value,
              date: val.date,
              time: "00:00", // Default
              visibleToMedics: true, // Default
              doctorId: "", // Será melhorado depois
              createdAt: val.created_at,
              updatedAt: val.updated_at || val.created_at,
            }),
          );

          console.log("✅ Valores indicadores convertidos:", values);
          return values;
        }
      } catch (supabaseError) {
        console.error(
          "💥 Erro no Supabase getPatientIndicatorValues:",
          supabaseError,
        );
        // Continuar para fallback localStorage
      }
    }

    console.log("⚠️ Usando localStorage para valores indicadores");
    const allValues = this.getStoredIndicatorValues();
    return allValues.filter((value) => value.patientId === patientId);
  }

  // Buscar valores de indicadores de um paciente por categoria
  async getPatientIndicatorValuesByCategory(
    patientId: string,
    categoryName?: string,
  ): Promise<PatientIndicatorValue[]> {
    const values = await this.getPatientIndicatorValues(patientId);

    if (!categoryName || categoryName === "all") {
      return values;
    }

    return values.filter((value) => value.categoryName === categoryName);
  }

  // Obter categorias únicas dos indicadores de um paciente
  async getPatientIndicatorCategories(patientId: string): Promise<string[]> {
    const values = await this.getPatientIndicatorValues(patientId);
    const categories = [...new Set(values.map((value) => value.categoryName))];
    return categories.sort();
  }

  // Obter subcategorias únicas dos indicadores de um paciente
  async getPatientIndicatorSubcategories(
    patientId: string,
    categoryName?: string,
  ): Promise<string[]> {
    const values = await this.getPatientIndicatorValues(patientId);

    let filteredValues = values;
    if (categoryName && categoryName !== "all") {
      filteredValues = values.filter(
        (value) => value.categoryName === categoryName,
      );
    }

    const subcategories = [
      ...new Set(filteredValues.map((value) => value.subcategoryName)),
    ];
    return subcategories.sort();
  }

  // Buscar valores de indicadores de um paciente por categoria e subcategoria
  async getPatientIndicatorValuesByFilters(
    patientId: string,
    categoryName?: string,
    subcategoryName?: string,
  ): Promise<PatientIndicatorValue[]> {
    const values = await this.getPatientIndicatorValues(patientId);

    let filteredValues = values;

    if (categoryName && categoryName !== "all") {
      filteredValues = filteredValues.filter(
        (value) => value.categoryName === categoryName,
      );
    }

    if (subcategoryName && subcategoryName !== "all") {
      filteredValues = filteredValues.filter(
        (value) => value.subcategoryName === subcategoryName,
      );
    }

    return filteredValues;
  }

  // Atualizar valor de indicador
  async updatePatientIndicatorValue(
    id: string,
    updateData: Partial<PatientIndicatorFormData>,
  ): Promise<PatientIndicatorValue | null> {
    await this.delay(500);

    const values = this.getStoredIndicatorValues();
    const index = values.findIndex((value) => value.id === id);

    if (index === -1) {
      throw new Error("Valor de indicador não encontrado");
    }

    // Atualizar apenas os campos fornecidos
    const updatedValue: PatientIndicatorValue = {
      ...values[index],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    values[index] = updatedValue;
    this.saveIndicatorValues(values);

    return updatedValue;
  }

  // Deletar valor de indicador
  async deletePatientIndicatorValue(id: string): Promise<void> {
    await this.delay(300);
    const values = this.getStoredIndicatorValues();
    const filteredValues = values.filter((value) => value.id !== id);
    this.saveIndicatorValues(filteredValues);
  }

  // Limpar todos os dados
  clearAllData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

export const patientIndicatorAPI = new PatientIndicatorAPI();
