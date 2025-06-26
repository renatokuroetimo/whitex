import { supabase } from "./supabase";
import { IndicatorWithDetails, IndicatorFormData } from "./indicator-types";

export interface Admin {
  id: string;
  email: string;
  fullName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminLoginData {
  email: string;
  password: string;
}

class AdminAPI {
  // Delay para simular operação real
  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Fazer login como administrador
  async login(credentials: AdminLoginData): Promise<Admin> {
    await this.delay(500);

    if (!supabase) {
      throw new Error("❌ Supabase não está configurado");
    }

    try {
      const { data, error } = await supabase
        .from("admins")
        .select("*")
        .eq("email", credentials.email)
        .eq("password_hash", credentials.password) // Em produção, usar bcrypt
        .eq("is_active", true)
        .single();

      if (error || !data) {
        throw new Error("❌ Credenciais inválidas");
      }

      const admin: Admin = {
        id: data.id,
        email: data.email,
        fullName: data.full_name,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      // Salvar dados do admin no localStorage
      localStorage.setItem("admin_session", JSON.stringify(admin));

      console.log("✅ Admin logado com sucesso:", admin.email);
      return admin;
    } catch (error) {
      console.error("💥 Erro no login do admin:", error);
      throw error;
    }
  }

  // Verificar se admin está logado
  isAuthenticated(): boolean {
    try {
      const adminSession = localStorage.getItem("admin_session");
      return !!adminSession;
    } catch {
      return false;
    }
  }

  // Obter dados do admin atual
  getCurrentAdmin(): Admin | null {
    try {
      const adminSession = localStorage.getItem("admin_session");
      if (adminSession) {
        return JSON.parse(adminSession);
      }
      return null;
    } catch {
      return null;
    }
  }

  // Logout do admin
  logout(): void {
    localStorage.removeItem("admin_session");
    console.log("✅ Admin deslogado");
  }

  // Buscar todos os indicadores padrão
  async getStandardIndicators(): Promise<IndicatorWithDetails[]> {
    await this.delay(500);

    if (!supabase) {
      throw new Error("❌ Supabase não está configurado");
    }

    try {
      const { data, error } = await supabase
        .from("indicators")
        .select("*")
        .eq("type", "standard")
        .order("category", { ascending: true })
        .order("subcategory", { ascending: true })
        .order("name", { ascending: true });

      if (error) {
        throw new Error(`Erro ao buscar indicadores padrão: ${error.message}`);
      }

      return (data || []).map(
        (indicator: any): IndicatorWithDetails => ({
          id: indicator.id,
          name: indicator.name || indicator.parameter || "Indicador",
          categoryId: indicator.category_id || "cat1",
          categoryName: indicator.category || "Categoria",
          subcategoryId: indicator.subcategory_id || "sub1",
          subcategoryName: indicator.subcategory || "Subcategoria",
          parameter: indicator.parameter || indicator.name || "Parâmetro",
          unitId: indicator.unit_id || "unit_un",
          unitSymbol: indicator.unit_symbol || indicator.unit || "un",
          isMandatory: indicator.is_mandatory || false,
          requiresTime: indicator.requires_time || false,
          requiresDate: indicator.requires_date || false,
          doctorId: indicator.doctor_id || "",
          createdAt: indicator.created_at || new Date().toISOString(),
          updatedAt: indicator.updated_at || new Date().toISOString(),
          // Metadata fields
          definition: indicator.definition || "",
          context: indicator.context || "",
          dataType: indicator.data_type || "",
          isRequired: indicator.is_required || false,
          isConditional: indicator.is_conditional || false,
          isRepeatable: indicator.is_repeatable || false,
          standardId: indicator.standard_id || "",
          source: indicator.source || "",
        }),
      );
    } catch (error) {
      console.error("💥 Erro ao buscar indicadores padrão:", error);
      throw error;
    }
  }

  // Buscar um indicador padrão específico
  async getStandardIndicatorById(
    id: string,
  ): Promise<IndicatorWithDetails | null> {
    await this.delay(300);

    if (!supabase) {
      throw new Error("❌ Supabase não está configurado");
    }

    try {
      const { data, error } = await supabase
        .from("indicators")
        .select("*")
        .eq("id", id)
        .eq("type", "standard")
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null;
        }
        throw new Error(`Erro ao buscar indicador: ${error.message}`);
      }

      if (!data) {
        return null;
      }

      return {
        id: data.id,
        name: data.name || data.parameter || "Indicador",
        categoryId: data.category_id || "cat1",
        categoryName: data.category || "Categoria",
        subcategoryId: data.subcategory_id || "sub1",
        subcategoryName: data.subcategory || "Subcategoria",
        parameter: data.parameter || data.name || "Parâmetro",
        unitId: data.unit_id || "unit_un",
        unitSymbol: data.unit_symbol || data.unit || "un",
        isMandatory: data.is_mandatory || false,
        requiresTime: data.requires_time || false,
        requiresDate: data.requires_date || false,
        doctorId: data.doctor_id || "",
        createdAt: data.created_at || new Date().toISOString(),
        updatedAt: data.updated_at || new Date().toISOString(),
        // Metadata fields
        definition: data.definition || "",
        context: data.context || "",
        dataType: data.data_type || "",
        isRequired: data.is_required || false,
        isConditional: data.is_conditional || false,
        isRepeatable: data.is_repeatable || false,
        standardId: data.standard_id || "",
        source: data.source || "",
      };
    } catch (error) {
      console.error("💥 Erro ao buscar indicador padrão:", error);
      throw error;
    }
  }

  // Atualizar indicador padrão
  async updateStandardIndicator(
    id: string,
    data: IndicatorFormData,
  ): Promise<void> {
    await this.delay(500);

    if (!supabase) {
      throw new Error("❌ Supabase não está configurado");
    }

    // Verificar se admin está autenticado
    if (!this.isAuthenticated()) {
      throw new Error("❌ Acesso não autorizado");
    }

    try {
      const updateData = {
        name: data.parameter || "Indicador",
        parameter: data.parameter?.trim() || "",
        category_id: data.categoryId || "",
        category: data.categoryId || "",
        subcategory_id: data.subcategoryId || "",
        subcategory: data.subcategoryId || "",
        unit_id: data.unitOfMeasureId || "",
        unit: data.unitOfMeasureId || "",
        requires_time: data.requiresTime || false,
        requires_date: data.requiresDate || false,
        updated_at: new Date().toISOString(),
        // Metadata fields
        definition: data.definition?.trim() || null,
        context: data.context || null,
        data_type: data.dataType || null,
        is_required: data.isRequired || false,
        is_conditional: data.isConditional || false,
        is_repeatable: data.isRepeatable || false,
        standard_id: data.standardId?.trim() || null,
        source: data.source?.trim() || null,
      };

      const { error } = await supabase
        .from("indicators")
        .update(updateData)
        .eq("id", id)
        .eq("type", "standard"); // Garantir que só atualiza indicadores padrão

      if (error) {
        throw new Error(`Erro ao atualizar indicador padrão: ${error.message}`);
      }

      console.log("✅ Indicador padrão atualizado:", id);
    } catch (error) {
      console.error("💥 Erro ao atualizar indicador padrão:", error);
      throw error;
    }
  }

  // Criar novo indicador padrão
  async createStandardIndicator(data: IndicatorFormData): Promise<void> {
    await this.delay(500);

    if (!supabase) {
      throw new Error("❌ Supabase não está configurado");
    }

    // Verificar se admin está autenticado
    if (!this.isAuthenticated()) {
      throw new Error("❌ Acesso não autorizado");
    }

    try {
      const newIndicator = {
        id: `std_${Date.now().toString(36)}`,
        name: data.parameter || "Indicador",
        parameter: data.parameter?.trim() || "",
        category_id: data.categoryId || "",
        category: data.categoryId || "",
        subcategory_id: data.subcategoryId || "",
        subcategory: data.subcategoryId || "",
        unit_id: data.unitOfMeasureId || "",
        unit: data.unitOfMeasureId || "",
        type: "standard",
        is_standard: true,
        requires_time: data.requiresTime || false,
        requires_date: data.requiresDate || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Metadata fields
        definition: data.definition?.trim() || null,
        context: data.context || null,
        data_type: data.dataType || null,
        is_required: data.isRequired || false,
        is_conditional: data.isConditional || false,
        is_repeatable: data.isRepeatable || false,
        standard_id: data.standardId?.trim() || null,
        source: data.source?.trim() || null,
      };

      const { error } = await supabase
        .from("indicators")
        .insert([newIndicator]);

      if (error) {
        throw new Error(`Erro ao criar indicador padrão: ${error.message}`);
      }

      console.log("✅ Indicador padrão criado:", newIndicator.id);
    } catch (error) {
      console.error("💥 Erro ao criar indicador padrão:", error);
      throw error;
    }
  }

  // Deletar indicador padrão
  async deleteStandardIndicator(id: string): Promise<void> {
    await this.delay(300);

    if (!supabase) {
      throw new Error("❌ Supabase não está configurado");
    }

    // Verificar se admin está autenticado
    if (!this.isAuthenticated()) {
      throw new Error("❌ Acesso não autorizado");
    }

    try {
      const { error } = await supabase
        .from("indicators")
        .delete()
        .eq("id", id)
        .eq("type", "standard");

      if (error) {
        throw new Error(`Erro ao deletar indicador padrão: ${error.message}`);
      }

      console.log("✅ Indicador padrão deletado:", id);
    } catch (error) {
      console.error("💥 Erro ao deletar indicador padrão:", error);
      throw error;
    }
  }
}

// Instância singleton
export const adminAPI = new AdminAPI();
