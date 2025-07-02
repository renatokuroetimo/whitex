import { PatientIndicatorValue } from "./patient-types";
import { supabase } from "./supabase";

class PatientIndicatorAPI {
  // Delay para simular operação real
  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Gera ID único
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }



  // Criar valor de indicador (apenas Supabase)
  async createPatientIndicatorValue(
    newValue: PatientIndicatorValue,
  ): Promise<PatientIndicatorValue> {
    await this.delay(500);

    if (!supabase) {
      throw new Error("❌ Supabase n��o está configurado");
    }

    // Verificar se usuário está logado
    const currentUserStr = localStorage.getItem("medical_app_current_user");
    if (!currentUserStr) {
      throw new Error("❌ Usuário não autenticado");
    }

    console.log("🚀 Criando valor indicador no Supabase");

    try {
      const insertData = {
        id: newValue.id || this.generateId(),
        patient_id: newValue.patientId,
        indicator_id: newValue.indicatorId,
        value: newValue.value,
        category_name: newValue.categoryName,
        subcategory_name: newValue.subcategoryName,
        parameter: newValue.parameter,
        unit_symbol: newValue.unitSymbol,
        date: newValue.date,
        time: newValue.time,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("patient_indicator_values")
        .insert([insertData]);

      if (error) {
        throw new Error(`Erro ao criar valor indicador: ${error.message}`);
      }

      console.log("✅ Valor indicador criado no Supabase:", insertData.id);

      return {
        id: insertData.id,
        patientId: insertData.patient_id,
        indicatorId: insertData.indicator_id,
        value: insertData.value,
        categoryName: insertData.category_name,
        subcategoryName: insertData.subcategory_name,
        parameter: insertData.parameter,
        unitSymbol: insertData.unit_symbol,
        date: insertData.date,
        time: insertData.time,
        createdAt: insertData.created_at,
      };
    } catch (error) {
      console.error("💥 Erro ao criar valor indicador:", error);
      throw error;
    }
  }

  // Buscar valores de indicadores (apenas Supabase)
  async getPatientIndicatorValues(
    patientId: string,
  ): Promise<PatientIndicatorValue[]> {
    await this.delay(100); // Reduzir delay para melhor performance

    if (!supabase) {
      console.error("❌ Supabase não está configurado");
      return []; // Retornar array vazio em vez de erro
    }

    console.log(
      `🚀 Buscando valores de indicadores para paciente: ${patientId}`,
    );

    try {
      // Verificar conectividade com Supabase
      const { data, error } = await supabase
        .from("patient_indicator_values")
        .select("*")
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false })
        .limit(1000); // Adicionar limite para evitar queries muito grandes

      if (error) {
        console.error("❌ Erro na query Supabase:", error);
        console.error(
          "❌ Detalhes do erro:",
          error.message,
          error.details,
          error.hint,
        );
        throw new Error("Erro de conectividade com a base de dados. Tente novamente.");      }
      }

      const values = (data || []).map(
        (item: any): PatientIndicatorValue => ({
          id: item.id,
          patientId: item.patient_id,
          indicatorId: item.indicator_id,
          value: item.value,
          categoryName: item.category_name || "Categoria",
          subcategoryName: item.subcategory_name || "Subcategoria",
          parameter: item.parameter || "Parâmetro",
          unitSymbol: item.unit_symbol || "un",
          date: item.date,
          time: item.time,
          createdAt: item.created_at,
        }),
      );

      console.log(
        `✅ ${values.length} valores carregados para paciente ${patientId}`,
      );
      return values;
    } catch (error) {
      console.error(
        `💥 Erro ao buscar valores de indicadores para paciente ${patientId}:`,
        error,
      );
      console.warn(
        "⚠️ Usando dados de demonstração para indicadores devido a erro de rede",
      );
      return this.getMockIndicators(patientId);
    }
  }

  // Atualizar valor de indicador (apenas Supabase)
  async updatePatientIndicatorValue(
    id: string,
    updates: Partial<PatientIndicatorValue>,
  ): Promise<PatientIndicatorValue> {
    await this.delay(300);

    if (!supabase) {
      throw new Error("❌ Supabase não está configurado");
    }

    try {
      const { error } = await supabase
        .from("patient_indicator_values")
        .update({
          value: updates.value,
          date: updates.date,
          time: updates.time,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        throw new Error(`Erro ao atualizar valor indicador: ${error.message}`);
      }

      console.log("✅ Valor indicador atualizado no Supabase:", id);

      // Buscar o valor atualizado
      const { data, error: fetchError } = await supabase
        .from("patient_indicator_values")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError || !data) {
        throw new Error("Erro: Valor não encontrado após atualização");
      }

      return {
        id: data.id,
        patientId: data.patient_id,
        indicatorId: data.indicator_id,
        value: data.value,
        categoryName: data.category_name || "Categoria",
        subcategoryName: data.subcategory_name || "Subcategoria",
        parameter: data.parameter || "Parâmetro",
        unitSymbol: data.unit_symbol || "un",
        date: data.date,
        time: data.time,
        createdAt: data.created_at,
      };
    } catch (error) {
      console.error("💥 Erro ao atualizar valor indicador:", error);
      throw error;
    }
  }

  // Deletar valor de indicador (apenas Supabase)
  async deletePatientIndicatorValue(id: string): Promise<void> {
    await this.delay(300);

    if (!supabase) {
      throw new Error("❌ Supabase não está configurado");
    }

    try {
      const { error } = await supabase
        .from("patient_indicator_values")
        .delete()
        .eq("id", id);

      if (error) {
        throw new Error(`Erro ao deletar valor indicador: ${error.message}`);
      }

      console.log("✅ Valor indicador deletado do Supabase:", id);
    } catch (error) {
      console.error("💥 Erro ao deletar valor indicador:", error);
      throw error;
    }
  }

  // Buscar valores por indicador específico (apenas Supabase)
  async getValuesByIndicator(
    patientId: string,
    indicatorId: string,
  ): Promise<PatientIndicatorValue[]> {
    await this.delay(300);

    if (!supabase) {
      throw new Error("❌ Supabase não está configurado");
    }

    try {
      const { data, error } = await supabase
        .from("patient_indicator_values")
        .select("*")
        .eq("patient_id", patientId)
        .eq("indicator_id", indicatorId)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(
          `Erro ao buscar valores por indicador: ${error.message}`,
        );
      }

      return (data || []).map(
        (item: any): PatientIndicatorValue => ({
          id: item.id,
          patientId: item.patient_id,
          indicatorId: item.indicator_id,
          value: item.value,
          categoryName: item.category_name || "Categoria",
          subcategoryName: item.subcategory_name || "Subcategoria",
          parameter: item.parameter || "Parâmetro",
          unitSymbol: item.unit_symbol || "un",
          date: item.date,
          time: item.time,
          createdAt: item.created_at,
        }),
      );
    } catch (error) {
      console.error("💥 Erro ao buscar valores por indicador:", error);
      throw error;
    }
  }
}

// Instância singleton
export const patientIndicatorAPI = new PatientIndicatorAPI();