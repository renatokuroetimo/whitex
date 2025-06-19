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

  // Método ultra-simplificado para teste
  async getPatients(): Promise<{
    patients: Patient[];
    pagination: PaginationData;
  }> {
    console.log("🧪 TESTE: Método getPatients simplificado");

    await this.delay(200);

    // Verificar se usuário está logado
    const currentUserStr = localStorage.getItem("medical_app_current_user");
    if (!currentUserStr) {
      console.error("❌ Usuário não autenticado");
      return {
        patients: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 10,
        },
      };
    }

    const currentUser = JSON.parse(currentUserStr);
    console.log(
      "👤 Usuário logado:",
      currentUser.email,
      currentUser.profession,
    );

    if (!supabase) {
      console.error("❌ Supabase não configurado");
      return {
        patients: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 10,
        },
      };
    }

    try {
      // 1. Primeiro, buscar apenas compartilhamentos
      console.log("🔍 Buscando compartilhamentos...");
      const { data: shares, error: sharesError } = await supabase
        .from("doctor_patient_sharing")
        .select("*")
        .eq("doctor_id", currentUser.id);

      if (sharesError) {
        console.error("❌ Erro ao buscar compartilhamentos:", sharesError);
        return {
          patients: [],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            itemsPerPage: 10,
          },
        };
      }

      console.log("📊 Compartilhamentos encontrados:", shares?.length || 0);

      // 2. Para cada compartilhamento, criar um paciente básico
      const patients: Patient[] = [];

      if (shares && shares.length > 0) {
        for (let i = 0; i < shares.length; i++) {
          const share = shares[i];
          console.log(
            `👤 Processando compartilhamento ${i + 1}:`,
            share.patient_id,
          );

          patients.push({
            id: share.patient_id,
            name: `Paciente Compartilhado ${i + 1}`,
            age: 30,
            city: "Cidade",
            state: "Estado",
            weight: 70,
            status: "compartilhado",
            notes: "Dados compartilhados",
            createdAt: share.shared_at || new Date().toISOString(),
            doctorId: null,
            isShared: true,
            sharedId: share.id,
          });
        }
      }

      console.log(`✅ Total de pacientes retornados: ${patients.length}`);

      return {
        patients,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: patients.length,
          itemsPerPage: patients.length,
        },
      };
    } catch (error) {
      console.error("💥 Erro crítico no getPatients:", error);
      return {
        patients: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 10,
        },
      };
    }
  }

  // Métodos básicos necessários (stubs)
  async getPatientById(id: string): Promise<Patient | null> {
    return null;
  }

  async createPatient(data: PatientFormData): Promise<Patient> {
    throw new Error("Não implementado no teste");
  }

  async updatePatient(
    id: string,
    data: Partial<PatientFormData>,
  ): Promise<Patient> {
    throw new Error("Não implementado no teste");
  }

  async deletePatient(id: string): Promise<void> {
    throw new Error("Não implementado no teste");
  }

  async deletePatients(ids: string[]): Promise<void> {
    throw new Error("Não implementado no teste");
  }

  async getDiagnoses(patientId: string): Promise<Diagnosis[]> {
    return [];
  }

  async addDiagnosis(
    patientId: string,
    diagnosis: Omit<Diagnosis, "id" | "patientId">,
  ): Promise<Diagnosis> {
    throw new Error("Não implementado no teste");
  }

  async updateDiagnosis(
    id: string,
    diagnosis: Partial<Diagnosis>,
  ): Promise<Diagnosis> {
    throw new Error("Não implementado no teste");
  }

  async deleteDiagnosis(id: string): Promise<void> {
    throw new Error("Não implementado no teste");
  }

  async removePatientSharing(patientId: string): Promise<void> {
    throw new Error("Não implementado no teste");
  }
}

// Instância singleton
export const patientAPI = new PatientAPI();
