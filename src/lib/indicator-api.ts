import {
  Category,
  Subcategory,
  UnitOfMeasure,
  Indicator,
  IndicatorFormData,
  IndicatorWithDetails,
} from "./indicator-types";

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
    const indicators = this.getStoredIndicators().filter(
      (ind) => ind.doctorId === doctorId,
    );
    const categories = await this.getCategories();
    const subcategories = await this.getSubcategories();
    const units = await this.getUnitsOfMeasure();

    return indicators.map((indicator) => {
      const category = categories.find(
        (cat) => cat.id === indicator.categoryId,
      );
      const subcategory = subcategories.find(
        (sub) => sub.id === indicator.subcategoryId,
      );
      const unit = units.find((u) => u.id === indicator.unitOfMeasureId);

      return {
        ...indicator,
        categoryName: category?.name || "Categoria não encontrada",
        subcategoryName: subcategory?.name || "Subcategoria não encontrada",
        unitOfMeasureName: unit?.name || "Unidade não encontrada",
        unitOfMeasureSymbol: unit?.symbol || "",
      };
    });
  }

  async createIndicator(
    doctorId: string,
    data: IndicatorFormData,
  ): Promise<Indicator> {
    await this.delay(500);

    const newIndicator: Indicator = {
      id: this.generateId(),
      ...data,
      doctorId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const indicators = this.getStoredIndicators();
    indicators.push(newIndicator);
    this.saveIndicators(indicators);

    return newIndicator;
  }

  async deleteIndicator(id: string): Promise<void> {
    await this.delay(300);
    const indicators = this.getStoredIndicators();
    const filteredIndicators = indicators.filter((ind) => ind.id !== id);
    this.saveIndicators(filteredIndicators);
  }

  // === STANDARD INDICATORS ===
  private getStoredStandardIndicators(): any[] {
    try {
      const indicators = localStorage.getItem(
        this.STORAGE_KEYS.STANDARD_INDICATORS,
      );
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

  async updateStandardIndicatorVisibility(
    id: string,
    visible: boolean,
  ): Promise<void> {
    await this.delay(200);
    const indicators = this.getStoredStandardIndicators();
    const indicatorIndex = indicators.findIndex((ind) => ind.id === id);

    if (indicatorIndex !== -1) {
      indicators[indicatorIndex].visible = visible;
      this.saveStandardIndicators(indicators);
    }
  }

  async getVisibleStandardIndicators(): Promise<any[]> {
    const indicators = await this.getStandardIndicators();
    return indicators.filter((ind) => ind.visible);
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
