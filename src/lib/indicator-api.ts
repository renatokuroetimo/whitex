import {
  Category,
  Subcategory,
  UnitOfMeasure,
  Indicator,
  IndicatorFormData,
  IndicatorWithDetails,
} from "./indicator-types";
import { supabase } from "./supabase";
import { isFeatureEnabled } from "./feature-flags";

class IndicatorAPI {
  private readonly STORAGE_KEYS = {
    CATEGORIES: "medical_app_categories",
    SUBCATEGORIES: "medical_app_subcategories",
    UNITS: "medical_app_units",
    INDICATORS: "medical_app_indicators",
    STANDARD_INDICATORS: "medical_app_standard_indicators",
  };

  // Simula delay de rede
  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Mapear ID de categoria para nome real
  private mapCategoryIdToName(categoryId: string): string {
    const categoryMap: { [key: string]: string } = {
      'cat1': 'Sinais Vitais',
      'cat2': 'Exames Laboratoriais',
      'cat3': 'Medidas Antropométricas',
      'cat4': 'Medicamentos',
      'cat5': 'Sintomas',
    };
    return categoryMap[categoryId] || categoryId || 'Categoria';
  }

  // Mapear ID de subcategoria para nome real
  private mapSubcategoryIdToName(subcategoryId: string): string {
    const subcategoryMap: { [key: string]: string } = {
      'sub1': 'Pressão Arterial',
      'sub2': 'Frequência Cardíaca',
      'sub3': 'Temperatura',
      'sub4': 'Glicemia',
      'sub5': 'Colesterol',
      'sub6': 'Peso',
      'sub7': 'Altura',
      'sub8': 'IMC',
    };
    return subcategoryMap[subcategoryId] || subcategoryId || 'Subcategoria';
  }

  // Gera ID único
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // === CATEGORIES ===
  private getStoredCategories(): Category[] {
    try {
      const categories = localStorage.getItem(this.STORAGE_KEYS.CATEGORIES);
      return categories ? JSON.parse(categories) : [];
    } catch {
      return [];
    }
  }

  private saveCategories(categories: Category[]): void {
    localStorage.setItem(
      this.STORAGE_KEYS.CATEGORIES,
      JSON.stringify(categories),
    );
  }

  async getCategories(): Promise<Category[]> {
    await this.delay(200);
    let categories = this.getStoredCategories();

    // Inicializar com categorias padrão se não existir
    if (categories.length === 0) {
      categories = [
        {
          id: "cat1",
          name: "Sinais Vitais",
          createdAt: new Date().toISOString(),
        },
        {
          id: "cat2",
          name: "Exames Laboratoriais",
          createdAt: new Date().toISOString(),
        },
        {
          id: "cat3",
          name: "Medidas Antropométricas",
          createdAt: new Date().toISOString(),
        },
        {
          id: "cat4",
          name: "Medicamentos",
          createdAt: new Date().toISOString(),
        },
      ];
      this.saveCategories(categories);
    }

    return categories;
  }

  async createCategory(name: string): Promise<Category> {
    await this.delay(300);
    const newCategory: Category = {
      id: this.generateId(),
      name,
      createdAt: new Date().toISOString(),
    };

    const categories = this.getStoredCategories();
    categories.push(newCategory);
    this.saveCategories(categories);

    return newCategory;
  }

  // === SUBCATEGORIES ===
  private getStoredSubcategories(): Subcategory[] {
    try {
      const subcategories = localStorage.getItem(
        this.STORAGE_KEYS.SUBCATEGORIES,
      );
      return subcategories ? JSON.parse(subcategories) : [];
    } catch {
      return [];
    }
  }

  private saveSubcategories(subcategories: Subcategory[]): void {
    localStorage.setItem(
      this.STORAGE_KEYS.SUBCATEGORIES,
      JSON.stringify(subcategories),
    );
  }

  async getSubcategories(): Promise<Subcategory[]> {
    await this.delay(200);
    let subcategories = this.getStoredSubcategories();

    // Inicializar com subcategorias padrão se não existir
    if (subcategories.length === 0) {
      subcategories = [
        {
          id: "sub1",
          name: "Pressão Arterial",
          categoryId: "cat1",
          createdAt: new Date().toISOString(),
        },
        {
          id: "sub2",
          name: "Frequência Cardíaca",
          categoryId: "cat1",
          createdAt: new Date().toISOString(),
        },
        {
          id: "sub3",
          name: "Temperatura",
          categoryId: "cat1",
          createdAt: new Date().toISOString(),
        },
        {
          id: "sub4",
          name: "Glicemia",
          categoryId: "cat2",
          createdAt: new Date().toISOString(),
        },
        {
          id: "sub5",
          name: "Colesterol",
          categoryId: "cat2",
          createdAt: new Date().toISOString(),
        },
        {
          id: "sub6",
          name: "Peso",
          categoryId: "cat3",
          createdAt: new Date().toISOString(),
        },
        {
          id: "sub7",
          name: "Altura",
          categoryId: "cat3",
          createdAt: new Date().toISOString(),
        },
      ];
      this.saveSubcategories(subcategories);
    }

    return subcategories;
  }

  async getSubcategoriesByCategory(categoryId: string): Promise<Subcategory[]> {
    const subcategories = await this.getSubcategories();
    return subcategories.filter((sub) => sub.categoryId === categoryId);
  }

  async createSubcategory(
    name: string,
    categoryId: string,
  ): Promise<Subcategory> {
    await this.delay(300);
    const newSubcategory: Subcategory = {
      id: this.generateId(),
      name,
      categoryId,
      createdAt: new Date().toISOString(),
    };

    const subcategories = this.getStoredSubcategories();
    subcategories.push(newSubcategory);
    this.saveSubcategories(subcategories);

    return newSubcategory;
  }

  // === UNITS OF MEASURE ===
  private getStoredUnits(): UnitOfMeasure[] {
    try {
      const units = localStorage.getItem(this.STORAGE_KEYS.UNITS);
      return units ? JSON.parse(units) : [];
    } catch {
      return [];
    }
  }

  private saveUnits(units: UnitOfMeasure[]): void {
    localStorage.setItem(this.STORAGE_KEYS.UNITS, JSON.stringify(units));
  }

  async getUnitsOfMeasure(): Promise<UnitOfMeasure[]> {
    await this.delay(200);
    let units = this.getStoredUnits();

    // Inicializar com unidades padrão se não existir
    if (units.length === 0) {
      units = [
        { id: "unit1", name: "Milímetros de Mercúrio", symbol: "mmHg" },
        { id: "unit2", name: "Batimentos por Minuto", symbol: "bpm" },
        { id: "unit3", name: "Graus Celsius", symbol: "°C" },
        { id: "unit4", name: "Graus Fahrenheit", symbol: "°F" },
        { id: "unit5", name: "Quilograma", symbol: "kg" },
        { id: "unit6", name: "Grama", symbol: "g" },
        { id: "unit7", name: "Metro", symbol: "m" },
        { id: "unit8", name: "Centímetro", symbol: "cm" },
        { id: "unit9", name: "Miligramas por Decilitro", symbol: "mg/dL" },
        { id: "unit10", name: "Gramas por Decilitro", symbol: "g/dL" },
        { id: "unit11", name: "Mililitro", symbol: "mL" },
        { id: "unit12", name: "Litro", symbol: "L" },
        { id: "unit13", name: "Porcentagem", symbol: "%" },
        { id: "unit14", name: "Unidade", symbol: "un" },
        { id: "unit15", name: "Comprimido", symbol: "cp" },
        { id: "unit16", name: "Miliequivalente", symbol: "mEq" },
      ];
      this.saveUnits(units);
    }

    return units;
  }

  // === INDICATORS ===
  private getStoredIndicators(): Indicator[] {
    try {
      const indicators = localStorage.getItem(this.STORAGE_KEYS.INDICATORS);
      return indicators ? JSON.parse(indicators) : [];
    } catch {
      return [];
    }
  }

  private saveIndicators(indicators: Indicator[]): void {
    localStorage.setItem(
      this.STORAGE_KEYS.INDICATORS,
      JSON.stringify(indicators),
    );
  }

  async getIndicators(doctorId: string): Promise<IndicatorWithDetails[]> {
    await this.delay(300);

    console.log("🔍 getIndicators chamado para doctorId:", doctorId);

    let indicators: Indicator[] = [];

    // Se Supabase estiver ativo, usar Supabase
    if (isFeatureEnabled("useSupabaseIndicators") && supabase) {
      console.log("🚀 Buscando indicadores no Supabase");

      try {
        // Query específica com colunas que sabemos que existem + campos de obrigatoriedade
        const { data: supabaseIndicators, error } = await supabase
          .from("indicators")
          .select("id, name, unit, type, category, subcategory, parameter, unit_symbol, requires_date, requires_time, doctor_id, is_standard, created_at")
          .eq("doctor_id", doctorId);

        console.log("📊 Indicadores do Supabase:", { data: supabaseIndicators, error });

        if (error) {
          console.error("❌ Erro detalhado ao buscar indicadores:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
            fullError: error
          });
          // Fallback para localStorage
        } else {
          // Retornar dados do Supabase diretamente como IndicatorWithDetails
          const indicatorsWithDetails: IndicatorWithDetails[] = (supabaseIndicators || []).map((ind: any): IndicatorWithDetails => ({
            id: ind.id,
            categoryId: ind.categoryId || ind.category || "",
            subcategoryId: ind.subcategory || "",
            parameter: ind.parameter || ind.name || "",
            unitOfMeasureId: ind.unit_symbol || ind.unit || "",
            requiresTime: Boolean(ind.requires_time),
            requiresDate: Boolean(ind.requires_date),
            visible: true,
            visibleToMedics: true,
            doctorId: ind.doctor_id,
            createdAt: ind.created_at,
            updatedAt: ind.updated_at || ind.created_at,
            // Campos específicos de IndicatorWithDetails - mapear IDs para nomes reais
            categoryName: this.mapCategoryIdToName(ind.categoryId || ind.category || ""),
            subcategoryName: this.mapSubcategoryIdToName(ind.subcategory || ""),
            unitOfMeasureName: ind.unit_symbol || ind.unit || "Unidade",
            unitOfMeasureSymbol: ind.unit_symbol || ind.unit || "",
          }));

          console.log("✅ Indicadores convertidos diretamente:", indicatorsWithDetails);
          return indicatorsWithDetails; // Retornar diretamente sem processamento adicional
        }
      } catch (supabaseError: any) {
        console.error("💥 Erro no Supabase getIndicators:", {
          message: supabaseError?.message || "Erro desconhecido",
          stack: supabaseError?.stack,
          fullError: supabaseError
        });
        // Continuar para fallback localStorage
      }
    }

    // Fallback para localStorage se Supabase não funcionou
    if (indicators.length === 0) {
      console.log("⚠️ Usando localStorage para indicadores");
      indicators = this.getStoredIndicators().filter(
        (ind) => ind.doctorId === doctorId,
      );
    }

    const categories = await this.getCategories();
    const subcategories = await this.getSubcategories();
    const units = await this.getUnitsOfMeasure();

    return indicators.map((indicator) => {
      // Para todos os indicadores, usar lookup nas tabelas quando possível
      const category = categories.find(
        (cat) => cat.id === indicator.categoryId,
      );
      const subcategory = subcategories.find(
        (sub) => sub.id === indicator.subcategoryId,
      );
      const unit = units.find((u) => u.id === indicator.unitOfMeasureId);

      const indicatorWithDetails: IndicatorWithDetails = {
        ...indicator,
        categoryName: category?.name || this.mapCategoryIdToName(indicator.categoryId) || "Categoria",
        subcategoryName: subcategory?.name || this.mapSubcategoryIdToName(indicator.subcategoryId) || "Subcategoria",
        unitOfMeasureName: unit?.name || indicator.unitOfMeasureId || "Unidade",
        unitOfMeasureSymbol: unit?.symbol || indicator.unitOfMeasureId || "",
      };

      console.log("🔄 Mapeamento universal:", indicatorWithDetails);
      return indicatorWithDetails;
      } else {
        // Dados do localStorage - usar lookup nas tabelas
        const category = categories.find(
          (cat) => cat.id === indicator.categoryId,
        );
        const subcategory = subcategories.find(
          (sub) => sub.id === indicator.subcategoryId,
        );
        const unit = units.find((u) => u.id === indicator.unitOfMeasureId);

        const indicatorWithDetails: IndicatorWithDetails = {
          ...indicator,
          categoryName: category?.name || "Categoria não encontrada",
          subcategoryName: subcategory?.name || "Subcategoria não encontrada",
          unitOfMeasureName: unit?.name || "Unidade não encontrada",
          unitOfMeasureSymbol: unit?.symbol || "",
        };

        console.log("🔄 Mapeamento localStorage:", indicatorWithDetails);
        return indicatorWithDetails;
      }
    });
  }

  async createIndicator(
    doctorId: string,
    data: IndicatorFormData,
  ): Promise<Indicator> {
    await this.delay(500);

    const newIndicator: Indicator = {
      id: this.generateId(),
      categoryId: data.categoryId,
      subcategoryId: data.subcategoryId,
      parameter: data.parameter,
      unitOfMeasureId: data.unitOfMeasureId,
      requiresTime: data.requiresTime,
      requiresDate: data.requiresDate,
      visible: data.visible,
      visibleToMedics: data.visibleToMedics,
      doctorId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log("🔥 CRIANDO INDICADOR:", newIndicator);
    console.log("🔧 Feature flag useSupabaseIndicators:", isFeatureEnabled("useSupabaseIndicators"));
    console.log("🔗 Supabase client:", !!supabase);

    // Se Supabase estiver ativo, usar Supabase
    if (isFeatureEnabled("useSupabaseIndicators") && supabase) {
      console.log("🚀 Criando indicador no Supabase");

      try {
        // Buscar detalhes da unidade para obter símbolo
        const units = await this.getUnitsOfMeasure();
        const unit = units.find(u => u.id === newIndicator.unitOfMeasureId);

        const insertData = {
          id: newIndicator.id,
          name: newIndicator.parameter, // Mapear parameter -> name
          unit: unit?.symbol || "un",   // Mapear unitOfMeasureId -> unit symbol
          type: "numeric",              // Tipo padrão
          category: newIndicator.categoryId,
          subcategory: newIndicator.subcategoryId,
          parameter: newIndicator.parameter,
          unit_symbol: unit?.symbol || "un",
          requires_date: newIndicator.requiresDate,
          requires_time: newIndicator.requiresTime,
          doctor_id: newIndicator.doctorId,
          is_standard: false,
          created_at: newIndicator.createdAt,
        };

        console.log("📝 Dados do indicador:", insertData);

        const { data: supabaseData, error } = await supabase.from("indicators").insert([insertData]);

        console.log("📊 Resposta do Supabase:", { data: supabaseData, error });

        if (error) {
          console.error("❌ Erro detalhado ao criar indicador:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          throw error; // Forçar fallback
        } else {
          console.log("✅ Indicador criado no Supabase!");
          return newIndicator;
        }
      } catch (supabaseError) {
        console.error("💥 Erro no Supabase indicador:", JSON.stringify({
          message: supabaseError instanceof Error ? supabaseError.message : 'Unknown error',
          stack: supabaseError instanceof Error ? supabaseError.stack : undefined,
          error: supabaseError
        }, null, 2));
        // Continuar para fallback
      }
    } else {
      console.log("⚠️ Supabase indicadores não ativo");
    }

    console.log("📁 Salvando no localStorage");
    const indicators = this.getStoredIndicators();
    indicators.push(newIndicator);
    this.saveIndicators(indicators);

    return newIndicator;
  }

  async deleteIndicator(id: string): Promise<void> {
    await this.delay(300);

    console.log("🗑️ DELETANDO INDICADOR:", id);

    // Se Supabase estiver ativo, usar Supabase
    if (isFeatureEnabled("useSupabaseIndicators") && supabase) {
      console.log("🚀 Deletando indicador no Supabase");

      try {
        const { error } = await supabase
          .from("indicators")
          .delete()
          .eq("id", id);

        console.log("📊 Resultado da deleção no Supabase:", { error });

        if (error) {
          console.error("❌ Erro ao deletar indicador:", JSON.stringify({
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          }, null, 2));
          throw error; // Forçar fallback
        } else {
          console.log("✅ Indicador deletado no Supabase!");

          // Sincronizar com localStorage também
          try {
            const indicators = this.getStoredIndicators();
            const filteredIndicators = indicators.filter((ind) => ind.id !== id);
            this.saveIndicators(filteredIndicators);
            console.log("✅ Sincronizado remoção com localStorage");
          } catch (syncError) {
            console.warn("⚠️ Erro ao sincronizar remoção com localStorage:", syncError);
          }

          return;
        }
      } catch (supabaseError) {
        console.error("💥 Erro no Supabase deleteIndicator:", JSON.stringify({
          message: supabaseError instanceof Error ? supabaseError.message : 'Unknown error',
          stack: supabaseError instanceof Error ? supabaseError.stack : undefined,
          error: supabaseError
        }, null, 2));
        // Continuar para fallback
      }
    } else {
      console.log("⚠️ Supabase não ativo para deleção de indicadores");
    }

    console.log("📁 Deletando indicador do localStorage");
    const indicators = this.getStoredIndicators();
    const filteredIndicators = indicators.filter((ind) => ind.id !== id);
    this.saveIndicators(filteredIndicators);
    console.log("✅ Indicador deletado do localStorage");
  }

  // === STANDARD INDICATORS ===
  private getStoredStandardIndicators(): any[] {
    try {
      const indicators = localStorage.getItem(this.STORAGE_KEYS.STANDARD_INDICATORS);
      return indicators ? JSON.parse(indicators) : [];
    } catch {
      return [];
    }
  }

  private saveStandardIndicators(indicators: any[]): void {
    localStorage.setItem(
      this.STORAGE_KEYS.STANDARD_INDICATORS,
      JSON.stringify(indicators),
    );
  }

  async getStandardIndicators(): Promise<any[]> {
    await this.delay(200);
    let indicators = this.getStoredStandardIndicators();

    // Inicializar com indicadores padrão se não existir
    if (indicators.length === 0) {
      indicators = [
        {
          id: "std1",
          categoryName: "Sinais Vitais",
          subcategoryName: "Pressão Arterial",
          parameter: "Sistólica",
          unitSymbol: "mmHg",
          requiresDate: true,
          requiresTime: true,
          visible: true,
        },
        {
          id: "std2",
          categoryName: "Sinais Vitais",
          subcategoryName: "Pressão Arterial",
          parameter: "Diastólica",
          unitSymbol: "mmHg",
          requiresDate: true,
          requiresTime: true,
          visible: true,
        },
        {
          id: "std3",
          categoryName: "Sinais Vitais",
          subcategoryName: "Frequência Cardíaca",
          parameter: "Batimentos",
          unitSymbol: "bpm",
          requiresDate: true,
          requiresTime: false,
          visible: true,
        },
        {
          id: "std4",
          categoryName: "Sinais Vitais",
          subcategoryName: "Temperatura",
          parameter: "Corporal",
          unitSymbol: "°C",
          requiresDate: true,
          requiresTime: true,
          visible: true,
        },
        {
          id: "std5",
          categoryName: "Exames Laboratoriais",
          subcategoryName: "Glicemia",
          parameter: "Jejum",
          unitSymbol: "mg/dL",
          requiresDate: true,
          requiresTime: false,
          visible: true,
        },
        {
          id: "std6",
          categoryName: "Exames Laboratoriais",
          subcategoryName: "Colesterol",
          parameter: "Total",
          unitSymbol: "mg/dL",
          requiresDate: true,
          requiresTime: false,
          visible: true,
        },
        {
          id: "std7",
          categoryName: "Medidas Antropométricas",
          subcategoryName: "Peso",
          parameter: "Corporal",
          unitSymbol: "kg",
          requiresDate: true,
          requiresTime: false,
          visible: true,
        },
        {
          id: "std8",
          categoryName: "Medidas Antropométricas",
          subcategoryName: "Altura",
          parameter: "Estatura",
          unitSymbol: "cm",
          requiresDate: false,
          requiresTime: false,
          visible: true,
        },
      ];
      this.saveStandardIndicators(indicators);
    }

    return indicators;
  }

  async updateStandardIndicatorVisibility(id: string, visible: boolean): Promise<void> {
    await this.delay(200);
    const indicators = this.getStoredStandardIndicators();
    const indicatorIndex = indicators.findIndex(ind => ind.id === id);

    if (indicatorIndex !== -1) {
      indicators[indicatorIndex].visible = visible;
      this.saveStandardIndicators(indicators);
    }
  }

  async getVisibleStandardIndicators(): Promise<any[]> {
    const indicators = await this.getStandardIndicators();
    return indicators.filter(ind => ind.visible);
  }

  // Garantir que indicadores padrão existam no Supabase
  private async ensureStandardIndicatorsInSupabase(): Promise<void> {
    if (!isFeatureEnabled("useSupabaseIndicators") || !supabase) {
      return;
    }

    console.log("🔄 Verificando indicadores padrão no Supabase...");

    try {
      const standardIndicators = await this.getStandardIndicators();

      for (const indicator of standardIndicators) {
        // Verificar se o indicador já existe
        const { data: existing, error: checkError } = await supabase
          .from("indicators")
          .select("id")
          .eq("id", indicator.id)
          .single();

        // PGRST116 means no rows found, which is expected when indicator doesn't exist
        const indicatorExists = existing && !checkError;

        if (!indicatorExists) {
          console.log(`📝 Inserindo indicador padrão ${indicator.id} no Supabase`);

          const insertData = {
            id: indicator.id,
            name: indicator.parameter,
            unit: indicator.unitSymbol,
            type: "numeric",
            category: indicator.categoryName,
            doctor_id: null, // Indicadores padrão não pertencem a um médico específico
            is_standard: true,
            created_at: new Date().toISOString(),
          };

          const { error } = await supabase.from("indicators").insert([insertData]);

          if (error) {
            console.error(`❌ Erro ao inserir indicador padrão ${indicator.id}:`, error);
          } else {
            console.log(`✅ Indicador padrão ${indicator.id} inserido com sucesso`);
          }
        }
      }
    } catch (error) {
      console.error("💥 Erro ao verificar indicadores padrão:", error);
    }
  }

  // Método para limpar todos os dados (útil para testes)
  clearAllData(): void {
    localStorage.removeItem(this.STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(this.STORAGE_KEYS.SUBCATEGORIES);
    localStorage.removeItem(this.STORAGE_KEYS.UNITS);
    localStorage.removeItem(this.STORAGE_KEYS.INDICATORS);
    localStorage.removeItem(this.STORAGE_KEYS.STANDARD_INDICATORS);
  }
}

export const indicatorAPI = new IndicatorAPI();