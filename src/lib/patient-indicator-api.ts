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

  // Buscar um valor de indicador específico por ID
  async getPatientIndicatorValueById(
    id: string,
  ): Promise<PatientIndicatorValue | null> {
    await this.delay(200);
    const values = this.getStoredIndicatorValues();
    return values.find((value) => value.id === id) || null;
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
