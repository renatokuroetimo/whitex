import {
  Category,
  Subcategory,
  UnitOfMeasure,
  Indicator,
  IndicatorFormData,
  IndicatorWithDetails,
} from "./indicator-types";
import { supabase } from "./supabase";

class IndicatorAPI {
  // Delay para simular operação real
  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Mapear ID de categoria para nome real
  private mapCategoryIdToName(categoryId: string): string {
    const categoryMap: { [key: string]: string } = {
      cat1: "Sinais Vitais",
      cat2: "Exames Laboratoriais",
      cat3: "Medidas Antropométricas",
      cat4: "Medicamentos",
      cat5: "Sintomas",
    };
    return categoryMap[categoryId] || categoryId || "Categoria";
  }

  // Mapear ID de subcategoria para nome real
  private mapSubcategoryIdToName(subcategoryId: string): string {
    const subcategoryMap: { [key: string]: string } = {
      sub1: "Pressão Arterial",
      sub2: "Frequência Cardíaca",
      sub3: "Temperatura",
      sub4: "Glicemia",
      sub5: "Colesterol",
      sub6: "Peso",
      sub7: "Altura",
      sub8: "IMC",
    };
    return subcategoryMap[subcategoryId] || subcategoryId || "Subcategoria";
  }

  // Buscar indicadores (apenas Supabase)
  async getIndicators(): Promise<IndicatorWithDetails[]> {
    await this.delay(500);

    if (!supabase) {
      throw new Error("❌ Supabase não está configurado");
    }

    // Verificar se usuário está logado
    const currentUserStr = localStorage.getItem("medical_app_current_user");
    if (!currentUserStr) {
      throw new Error("❌ Usuário não autenticado");
    }

    const currentUser = JSON.parse(currentUserStr);

    try {
      const { data, error } = await supabase
        .from("indicators")
        .select("*")
        .eq("doctor_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(`Erro ao buscar indicadores: ${error.message}`);
      }

      return (data || []).map(
        (indicator: any): IndicatorWithDetails => ({
          id: indicator.id,
          name: indicator.name,
          categoryId: indicator.category_id,
          categoryName: this.mapCategoryIdToName(indicator.category_id),
          subcategoryId: indicator.subcategory_id,
          subcategoryName: this.mapSubcategoryIdToName(
            indicator.subcategory_id,
          ),
          parameter: indicator.parameter,
          unitId: indicator.unit_id,
          unitSymbol: indicator.unit_symbol || "un",
          isMandatory: indicator.is_mandatory || false,
          doctorId: indicator.doctor_id,
          createdAt: indicator.created_at,
        }),
      );
    } catch (error) {
      console.error("💥 Erro ao buscar indicadores:", error);
      throw error;
    }
  }

  // Criar indicador (apenas Supabase)
  async createIndicator(data: IndicatorFormData): Promise<Indicator> {
    await this.delay(500);

    if (!supabase) {
      throw new Error("❌ Supabase não está configurado");
    }

    // Verificar se usuário está logado
    const currentUserStr = localStorage.getItem("medical_app_current_user");
    if (!currentUserStr) {
      throw new Error("❌ Usuário não autenticado");
    }

    const currentUser = JSON.parse(currentUserStr);

    const newIndicator = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      name: data.name,
      category_id: data.categoryId,
      subcategory_id: data.subcategoryId,
      parameter: data.parameter,
      unit_id: data.unitId,
      unit_symbol: data.unitSymbol || "un",
      is_mandatory: data.isMandatory || false,
      doctor_id: currentUser.id,
      created_at: new Date().toISOString(),
    };

    try {
      const { error } = await supabase
        .from("indicators")
        .insert([newIndicator]);

      if (error) {
        throw new Error(`Erro ao criar indicador: ${error.message}`);
      }

      console.log("✅ Indicador criado no Supabase:", newIndicator.id);

      return {
        id: newIndicator.id,
        name: newIndicator.name,
        categoryId: newIndicator.category_id,
        subcategoryId: newIndicator.subcategory_id,
        parameter: newIndicator.parameter,
        unitId: newIndicator.unit_id,
        unitSymbol: newIndicator.unit_symbol,
        isMandatory: newIndicator.is_mandatory,
        doctorId: newIndicator.doctor_id,
        createdAt: newIndicator.created_at,
      };
    } catch (error) {
      console.error("💥 Erro ao criar indicador:", error);
      throw error;
    }
  }

  // Deletar indicador (apenas Supabase)
  async deleteIndicator(id: string): Promise<void> {
    await this.delay(300);

    if (!supabase) {
      throw new Error("❌ Supabase não está configurado");
    }

    try {
      const { error } = await supabase.from("indicators").delete().eq("id", id);

      if (error) {
        throw new Error(`Erro ao deletar indicador: ${error.message}`);
      }

      console.log("✅ Indicador deletado do Supabase:", id);
    } catch (error) {
      console.error("💥 Erro ao deletar indicador:", error);
      throw error;
    }
  }

  // Indicadores padrão básicos
  private getDefaultStandardIndicators() {
    return [
      {
        id: "std_blood_pressure",
        name: "Pressão Arterial",
        categoryId: "cat1",
        categoryName: "Sinais Vitais",
        subcategoryId: "sub1",
        subcategoryName: "Pressão Arterial",
        parameter: "Sistólica/Diastólica",
        unitId: "unit_mmhg",
        unitSymbol: "mmHg",
        isMandatory: true,
      },
      {
        id: "std_heart_rate",
        name: "Frequência Cardíaca",
        categoryId: "cat1",
        categoryName: "Sinais Vitais",
        subcategoryId: "sub2",
        subcategoryName: "Frequência Cardíaca",
        parameter: "Batimentos por minuto",
        unitId: "unit_bpm",
        unitSymbol: "bpm",
        isMandatory: false,
      },
      {
        id: "std_temperature",
        name: "Temperatura Corporal",
        categoryId: "cat1",
        categoryName: "Sinais Vitais",
        subcategoryId: "sub3",
        subcategoryName: "Temperatura",
        parameter: "Temperatura",
        unitId: "unit_celsius",
        unitSymbol: "°C",
        isMandatory: false,
      },
    ];
  }

  // Buscar indicadores padrão (apenas Supabase)
  async getStandardIndicators(
    doctorId?: string,
  ): Promise<IndicatorWithDetails[]> {
    // Retornar indicadores padrão básicos
    return this.getDefaultStandardIndicators();
  }

  // Atualizar visibilidade de indicador padrão (apenas Supabase)
  async updateStandardIndicatorVisibility(
    indicatorId: string,
    visible: boolean,
    doctorId?: string,
  ): Promise<void> {
    await this.delay(300);

    if (!supabase) {
      throw new Error("❌ Supabase não está configurado");
    }

    // Verificar se usuário está logado
    const currentUserStr = localStorage.getItem("medical_app_current_user");
    if (!currentUserStr) {
      throw new Error("❌ Usuário não autenticado");
    }

    const currentUser = JSON.parse(currentUserStr);
    const finalDoctorId = doctorId || currentUser.id;

    try {
      const { error } = await supabase
        .from("doctor_standard_indicator_settings")
        .upsert(
          {
            doctor_id: finalDoctorId,
            standard_indicator_id: indicatorId,
            visible: visible,
          },
          {
            onConflict: "doctor_id,standard_indicator_id",
          },
        );

      if (error) {
        throw new Error(`Erro ao atualizar visibilidade: ${error.message}`);
      }

      console.log("✅ Visibilidade atualizada no Supabase");
    } catch (error) {
      console.error("💥 Erro ao atualizar visibilidade:", error);
      throw error;
    }
  }

  // Buscar indicadores padrão visíveis (apenas Supabase)
  async getVisibleStandardIndicators(
    doctorId?: string,
  ): Promise<IndicatorWithDetails[]> {
    await this.delay(300);

    if (!supabase) {
      throw new Error("❌ Supabase não está configurado");
    }

    // Verificar se usuário está logado
    const currentUserStr = localStorage.getItem("medical_app_current_user");
    if (!currentUserStr) {
      throw new Error("❌ Usuário não autenticado");
    }

    const currentUser = JSON.parse(currentUserStr);
    const finalDoctorId = doctorId || currentUser.id;

    try {
      const { data, error } = await supabase
        .from("doctor_standard_indicator_settings")
        .select("*")
        .eq("doctor_id", finalDoctorId)
        .eq("visible", true);

      if (error) {
        console.warn("⚠️ Erro ao buscar configurações:", error.message);
        // Retornar todos os indicadores padrão se não houver configurações
        return this.getDefaultStandardIndicators();
      }

      if (!data || data.length === 0) {
        // Se não há configurações, retornar todos os indicadores padrão
        return this.getDefaultStandardIndicators();
      }

      // Filtrar indicadores baseado nas configurações
      const allStandard = this.getDefaultStandardIndicators();
      const visibleIds = data.map(
        (setting: any) => setting.standard_indicator_id,
      );

      return allStandard.filter((indicator) =>
        visibleIds.includes(indicator.id),
      );
    } catch (error) {
      console.error("💥 Erro ao buscar indicadores visíveis:", error);
      // Fallback para todos os indicadores padrão
      return this.getDefaultStandardIndicators();
    }
  }

  // Categorias básicas
  async getCategories(): Promise<Category[]> {
    return [
      { id: "cat1", name: "Sinais Vitais" },
      { id: "cat2", name: "Exames Laboratoriais" },
      { id: "cat3", name: "Medidas Antropométricas" },
      { id: "cat4", name: "Medicamentos" },
      { id: "cat5", name: "Sintomas" },
    ];
  }

  // Subcategorias básicas
  async getSubcategories(): Promise<Subcategory[]> {
    return [
      { id: "sub1", categoryId: "cat1", name: "Pressão Arterial" },
      { id: "sub2", categoryId: "cat1", name: "Frequência Cardíaca" },
      { id: "sub3", categoryId: "cat1", name: "Temperatura" },
      { id: "sub4", categoryId: "cat2", name: "Glicemia" },
      { id: "sub5", categoryId: "cat2", name: "Colesterol" },
      { id: "sub6", categoryId: "cat3", name: "Peso" },
      { id: "sub7", categoryId: "cat3", name: "Altura" },
      { id: "sub8", categoryId: "cat3", name: "IMC" },
    ];
  }

  // Unidades de medida básicas
  async getUnits(): Promise<UnitOfMeasure[]> {
    return [
      { id: "unit_mmhg", name: "Milímetros de Mercúrio", symbol: "mmHg" },
      { id: "unit_bpm", name: "Batimentos por Minuto", symbol: "bpm" },
      { id: "unit_celsius", name: "Graus Celsius", symbol: "°C" },
      { id: "unit_mgdl", name: "Miligramas por Decilitro", symbol: "mg/dL" },
      { id: "unit_kg", name: "Quilograma", symbol: "kg" },
      { id: "unit_cm", name: "Centímetro", symbol: "cm" },
      {
        id: "unit_kgm2",
        name: "Quilograma por Metro Quadrado",
        symbol: "kg/m²",
      },
      { id: "unit_percent", name: "Porcentagem", symbol: "%" },
      { id: "unit_ml", name: "Mililitro", symbol: "mL" },
      { id: "unit_mg", name: "Miligrama", symbol: "mg" },
    ];
  }
}

// Instância singleton
export const indicatorAPI = new IndicatorAPI();
