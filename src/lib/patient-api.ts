import {
  Patient,
  Diagnosis,
  PatientFormData,
  PaginationData,
} from "./patient-types";
import { supabase } from "./supabase";

class PatientAPI {
  // Delay para simular operação real
  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Gera ID único
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Buscar pacientes (apenas Supabase)
  async getPatients(): Promise<{
    patients: Patient[];
    pagination: PaginationData;
  }> {
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
    console.log("🚀 Buscando pacientes no Supabase para:", currentUser.id);

    try {
      // Buscar pacientes criados pelo médico
      const { data: ownPatients, error: patientsError } = await supabase
        .from("patients")
        .select("*")
        .eq("doctor_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (patientsError) {
        throw new Error(`Erro ao buscar pacientes: ${patientsError.message}`);
      }

      // Buscar pacientes compartilhados
      const { data: sharedData, error: sharedError } = await supabase
        .from("shared_data")
        .select(
          `
          id,
          patient_id,
          shared_with_doctor_id,
          patients:patient_id (
            id, name, age, city, state, weight, status, notes, created_at, doctor_id
          )
        `,
        )
        .eq("shared_with_doctor_id", currentUser.id);

      if (sharedError) {
        console.warn(
          "⚠️ Erro ao buscar compartilhamentos:",
          sharedError.message,
        );
      }

      // Combinar pacientes próprios e compartilhados
      const allPatients: Patient[] = [
        ...(ownPatients || []).map(
          (p: any): Patient => ({
            id: p.id,
            name: p.name,
            age: p.age,
            city: p.city,
            state: p.state,
            weight: p.weight,
            status: p.status || "ativo",
            notes: p.notes || "",
            createdAt: p.created_at,
            doctorId: p.doctor_id,
            isShared: false,
          }),
        ),
        ...(sharedData || []).map(
          (shared: any): Patient => ({
            id: shared.patients.id,
            name: shared.patients.name,
            age: shared.patients.age,
            city: shared.patients.city,
            state: shared.patients.state,
            weight: shared.patients.weight,
            status: shared.patients.status || "ativo",
            notes: shared.patients.notes || "",
            createdAt: shared.patients.created_at,
            doctorId: shared.patients.doctor_id,
            isShared: true,
            sharedId: shared.id,
          }),
        ),
      ];

      console.log(`✅ ${allPatients.length} pacientes carregados do Supabase`);

      return {
        patients: allPatients,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: allPatients.length,
          itemsPerPage: allPatients.length,
        },
      };
    } catch (error) {
      console.error("💥 Erro ao buscar pacientes:", error);
      throw error;
    }
  }

  // Buscar paciente por ID (apenas Supabase)
  async getPatientById(id: string): Promise<Patient | null> {
    await this.delay(300);

    if (!supabase) {
      throw new Error("❌ Supabase não está configurado");
    }

    try {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null; // Não encontrado
        }
        throw new Error(`Erro ao buscar paciente: ${error.message}`);
      }

      return {
        id: data.id,
        name: data.name,
        age: data.age,
        city: data.city,
        state: data.state,
        weight: data.weight,
        status: data.status || "ativo",
        notes: data.notes || "",
        createdAt: data.created_at,
        doctorId: data.doctor_id,
        isShared: false,
      };
    } catch (error) {
      console.error("💥 Erro ao buscar paciente por ID:", error);
      throw error;
    }
  }

  // Criar paciente (apenas Supabase)
  async createPatient(data: PatientFormData): Promise<Patient> {
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

    console.log("💾 Criando paciente no Supabase");
    console.log("📋 Dados recebidos:", JSON.stringify(data, null, 2));

    // Validar dados obrigatórios
    if (!data.name || typeof data.name !== "string" || !data.name.trim()) {
      throw new Error("❌ Nome é obrigatório e não pode estar vazio");
    }

    if (!data.age || data.age <= 0) {
      throw new Error("❌ Idade é obrigatória e deve ser maior que 0");
    }

    if (!data.state || typeof data.state !== "string" || !data.state.trim()) {
      throw new Error("❌ Estado é obrigatório");
    }

    if (!data.city || typeof data.city !== "string" || !data.city.trim()) {
      throw new Error("❌ Cidade é obrigatória");
    }

    if (!data.weight || data.weight <= 0) {
      throw new Error("❌ Peso é obrigatório e deve ser maior que 0");
    }

    const newPatient = {
      id: this.generateId(),
      name: data.name.trim(),
      age: data.age,
      city: data.city.trim(),
      state: data.state.trim(),
      weight: data.weight,
      notes: data.notes ? data.notes.trim() : "",
      status: "ativo",
      doctor_id: currentUser.id,
      created_at: new Date().toISOString(),
    };

    try {
      const { error } = await supabase.from("patients").insert([newPatient]);

      if (error) {
        throw new Error(`Erro ao criar paciente: ${error.message}`);
      }

      console.log("✅ Paciente criado no Supabase:", newPatient.id);

      return {
        id: newPatient.id,
        name: newPatient.name,
        age: newPatient.age,
        city: newPatient.city,
        state: newPatient.state,
        weight: newPatient.weight,
        status: newPatient.status,
        notes: newPatient.notes,
        createdAt: newPatient.created_at,
        doctorId: newPatient.doctor_id,
        isShared: false,
      };
    } catch (error) {
      console.error("💥 Erro ao criar paciente:", error);
      throw error;
    }
  }

  // Atualizar paciente (apenas Supabase)
  async updatePatient(
    id: string,
    data: Partial<PatientFormData>,
  ): Promise<Patient> {
    await this.delay(500);

    if (!supabase) {
      throw new Error("❌ Supabase não está configurado");
    }

    try {
      const { error } = await supabase
        .from("patients")
        .update({
          name: data.name,
          age: data.age,
          city: data.city,
          state: data.state,
          weight: data.weight,
          notes: data.notes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        throw new Error(`Erro ao atualizar paciente: ${error.message}`);
      }

      console.log("✅ Paciente atualizado no Supabase:", id);

      // Buscar o paciente atualizado
      const updatedPatient = await this.getPatientById(id);
      if (!updatedPatient) {
        throw new Error("Erro: Paciente não encontrado após atualização");
      }

      return updatedPatient;
    } catch (error) {
      console.error("💥 Erro ao atualizar paciente:", error);
      throw error;
    }
  }

  // Deletar paciente (apenas Supabase)
  async deletePatient(id: string): Promise<void> {
    await this.delay(300);

    if (!supabase) {
      throw new Error("❌ Supabase não está configurado");
    }

    try {
      const { error } = await supabase.from("patients").delete().eq("id", id);

      if (error) {
        throw new Error(`Erro ao deletar paciente: ${error.message}`);
      }

      console.log("✅ Paciente deletado do Supabase:", id);
    } catch (error) {
      console.error("�� Erro ao deletar paciente:", error);
      throw error;
    }
  }

  // Adicionar diagnóstico (apenas Supabase)
  async addDiagnosis(patientId: string, diagnosis: string): Promise<void> {
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

    try {
      const { error } = await supabase.from("diagnoses").insert([
        {
          id: this.generateId(),
          patient_id: patientId,
          doctor_id: currentUser.id,
          diagnosis,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        // Se a tabela não existir, dar erro mais claro
        if (
          error.message.includes("does not exist") ||
          error.code === "42P01"
        ) {
          throw new Error(
            "❌ Tabela diagnoses não existe. Execute o script fix_all_database_errors.sql no Supabase SQL Editor.",
          );
        }
        throw new Error(`Erro ao adicionar diagnóstico: ${error.message}`);
      }

      console.log("✅ Diagnóstico adicionado no Supabase");
    } catch (error) {
      console.error("💥 Erro ao adicionar diagnóstico:", error);
      throw error;
    }
  }

  // Buscar diagnósticos (apenas Supabase)
  async getDiagnoses(patientId: string): Promise<Diagnosis[]> {
    await this.delay(300);

    if (!supabase) {
      throw new Error("❌ Supabase não está configurado");
    }

    try {
      const { data, error } = await supabase
        .from("diagnoses")
        .select("*")
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false });

      if (error) {
        // Se a tabela não existir, retornar array vazio ao invés de erro
        if (
          error.message.includes("does not exist") ||
          error.code === "42P01"
        ) {
          console.warn(
            "⚠️ Tabela diagnoses não existe. Execute o script fix_all_database_errors.sql",
          );
          return [];
        }
        throw new Error(`Erro ao buscar diagnósticos: ${error.message}`);
      }

      return (data || []).map(
        (d: any): Diagnosis => ({
          id: d.id,
          patientId: d.patient_id,
          diagnosis: d.diagnosis,
          createdAt: d.created_at,
          doctorId: d.doctor_id,
        }),
      );
    } catch (error) {
      console.error("💥 Erro ao buscar diagnósticos:", error);
      // Se for erro de tabela não existir, retornar array vazio
      if (error instanceof Error && error.message.includes("does not exist")) {
        console.warn(
          "⚠️ Retornando array vazio para diagnósticos - tabela não existe",
        );
        return [];
      }
      throw error;
    }
  }

  // Remover compartilhamento (apenas Supabase)
  async removePatientSharing(patientId: string): Promise<void> {
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

    try {
      const { error } = await supabase
        .from("shared_data")
        .delete()
        .eq("patient_id", patientId)
        .eq("shared_with_doctor_id", currentUser.id);

      if (error) {
        throw new Error(`Erro ao remover compartilhamento: ${error.message}`);
      }

      console.log("✅ Compartilhamento removido do Supabase");
    } catch (error) {
      console.error("💥 Erro ao remover compartilhamento:", error);
      throw error;
    }
  }
}

// Instância singleton
export const patientAPI = new PatientAPI();
