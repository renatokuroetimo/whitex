import { supabase } from "./supabase";

export interface MetadataContext {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface MetadataDataType {
  id: string;
  name: string;
  value: string;
  description?: string;
  inputType: string;
  validationRules?: any;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

class MetadataOptionsAPI {
  // Delay para simular operação real
  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Buscar contextos disponíveis
  async getContexts(): Promise<MetadataContext[]> {
    await this.delay(300);

    if (!supabase) {
      // Fallback para contextos padrão se Supabase não estiver disponível
      return [
        {
          id: "ctx1",
          name: "Autoria",
          description: "Contexto relacionado à autoria",
          isActive: true,
          displayOrder: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "ctx2",
          name: "Paciente",
          description: "Contexto relacionado ao paciente",
          isActive: true,
          displayOrder: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "ctx3",
          name: "Clínico",
          description: "Contexto relacionado ao ambiente clínico",
          isActive: true,
          displayOrder: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "ctx4",
          name: "Administrativo",
          description: "Contexto administrativo",
          isActive: true,
          displayOrder: 4,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "ctx5",
          name: "Técnico",
          description: "Contexto técnico",
          isActive: true,
          displayOrder: 5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "ctx6",
          name: "Temporal",
          description: "Contexto relacionado a tempo",
          isActive: true,
          displayOrder: 6,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
    }

    try {
      const { data, error } = await supabase
        .from("metadata_contexts")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) {
        console.error("❌ Erro ao buscar contextos:", error);
        throw new Error(`Erro ao buscar contextos: ${error.message}`);
      }

      return (data || []).map(
        (context: any): MetadataContext => ({
          id: context.id,
          name: context.name,
          description: context.description,
          isActive: context.is_active,
          displayOrder: context.display_order,
          createdAt: context.created_at,
          updatedAt: context.updated_at,
        }),
      );
    } catch (error) {
      console.error("💥 Erro ao carregar contextos:", error);
      throw error;
    }
  }

  // Buscar tipos de dados disponíveis
  async getDataTypes(): Promise<MetadataDataType[]> {
    await this.delay(300);

    if (!supabase) {
      // Fallback para tipos padrão se Supabase não estiver disponível
      return [
        {
          id: "dt1",
          name: "Texto",
          value: "texto",
          inputType: "text",
          isActive: true,
          displayOrder: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "dt2",
          name: "Número",
          value: "numero",
          inputType: "number",
          isActive: true,
          displayOrder: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "dt3",
          name: "Data",
          value: "data",
          inputType: "date",
          isActive: true,
          displayOrder: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "dt4",
          name: "Data e Hora",
          value: "data_hora",
          inputType: "datetime-local",
          isActive: true,
          displayOrder: 4,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "dt5",
          name: "Booleano",
          value: "booleano",
          inputType: "select",
          isActive: true,
          displayOrder: 5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "dt6",
          name: "Lista",
          value: "lista",
          inputType: "text",
          isActive: true,
          displayOrder: 6,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "dt7",
          name: "URL",
          value: "url",
          inputType: "url",
          isActive: true,
          displayOrder: 7,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "dt8",
          name: "Email",
          value: "email",
          inputType: "email",
          isActive: true,
          displayOrder: 8,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
    }

    try {
      const { data, error } = await supabase
        .from("metadata_data_types")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) {
        console.error("❌ Erro ao buscar tipos de dados:", error);
        throw new Error(`Erro ao buscar tipos de dados: ${error.message}`);
      }

      return (data || []).map(
        (dataType: any): MetadataDataType => ({
          id: dataType.id,
          name: dataType.name,
          value: dataType.value,
          description: dataType.description,
          inputType: dataType.input_type,
          validationRules: dataType.validation_rules,
          isActive: dataType.is_active,
          displayOrder: dataType.display_order,
          createdAt: dataType.created_at,
          updatedAt: dataType.updated_at,
        }),
      );
    } catch (error) {
      console.error("💥 Erro ao carregar tipos de dados:", error);
      throw error;
    }
  }

  // Criar novo contexto
  async createContext(
    name: string,
    description?: string,
  ): Promise<MetadataContext> {
    await this.delay(300);

    if (!supabase) {
      throw new Error("❌ Supabase não está configurado");
    }

    try {
      const { data, error } = await supabase
        .from("metadata_contexts")
        .insert([
          {
            name: name.trim(),
            description: description?.trim(),
            is_active: true,
            display_order: Date.now(), // Usar timestamp como ordem temporária
          },
        ])
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao criar contexto: ${error.message}`);
      }

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        isActive: data.is_active,
        displayOrder: data.display_order,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error("💥 Erro ao criar contexto:", error);
      throw error;
    }
  }

  // Criar novo tipo de dados
  async createDataType(
    name: string,
    value: string,
    inputType: string,
    description?: string,
    validationRules?: any,
  ): Promise<MetadataDataType> {
    await this.delay(300);

    if (!supabase) {
      throw new Error("❌ Supabase não está configurado");
    }

    try {
      const { data, error } = await supabase
        .from("metadata_data_types")
        .insert([
          {
            name: name.trim(),
            value: value.trim(),
            description: description?.trim(),
            input_type: inputType,
            validation_rules: validationRules,
            is_active: true,
            display_order: Date.now(), // Usar timestamp como ordem temporária
          },
        ])
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao criar tipo de dados: ${error.message}`);
      }

      return {
        id: data.id,
        name: data.name,
        value: data.value,
        description: data.description,
        inputType: data.input_type,
        validationRules: data.validation_rules,
        isActive: data.is_active,
        displayOrder: data.display_order,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error("💥 Erro ao criar tipo de dados:", error);
      throw error;
    }
  }
}

// Instância singleton
export const metadataOptionsAPI = new MetadataOptionsAPI();
