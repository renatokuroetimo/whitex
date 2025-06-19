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

  // MÉTODO ULTRA-SIMPLES PARA TESTE DE COMPARTILHAMENTO
  async getPatients(): Promise<{
    patients: Patient[];
    pagination: PaginationData;
  }> {
    console.log("🚀🚀🚀 MÉTODO GETPATIENTS LIMPO E SIMPLES");

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
      "👤 USUÁRIO LOGADO:",
      currentUser.email,
      currentUser.profession,
    );

    // PACIENTE DE TESTE - sempre aparece para garantir que a interface funciona
    const testPatient: Patient = {
      id: "teste-compartilhado-123",
      name: "🧪 PACIENTE COMPARTILHADO TESTE",
      age: 35,
      city: "São Paulo",
      state: "SP",
      weight: 70,
      status: "compartilhado",
      notes: "Este é um paciente de teste para verificar se aparece na lista",
      createdAt: new Date().toISOString(),
      doctorId: null,
      isShared: true,
      sharedId: "share-123",
    };

    if (!supabase) {
      console.warn(
        "⚠️ Supabase não configurado - retornando apenas paciente teste",
      );
      return {
        patients: [testPatient],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 1,
          itemsPerPage: 10,
        },
      };
    }

    try {
      console.log("🔍 Buscando compartilhamentos reais no banco...");

      const { data: shares, error: sharesError } = await supabase
        .from("doctor_patient_sharing")
        .select("*")
        .eq("doctor_id", currentUser.id);

      console.log("📊 RESULTADO:", {
        total: shares?.length || 0,
        error: sharesError?.message || "nenhum",
        shares: shares,
      });

      let allPatients: Patient[] = [testPatient]; // Sempre incluir teste

      if (sharesError) {
        console.error("❌ ERRO ao buscar compartilhamentos:", sharesError);
      } else if (shares && shares.length > 0) {
        console.log(`✅ ${shares.length} compartilhamentos encontrados`);

        // Adicionar um paciente real para cada compartilhamento
        const realPatients = shares.map((share, index) => ({
          id: share.patient_id,
          name: `Paciente Real ${index + 1}`,
          age: 30 + index,
          city: "Cidade Real",
          state: "PR",
          weight: 65 + index * 5,
          status: "compartilhado" as const,
          notes: `Compartilhado em ${new Date(share.shared_at).toLocaleDateString()}`,
          createdAt: share.shared_at || new Date().toISOString(),
          doctorId: null,
          isShared: true,
          sharedId: share.id,
        }));

        allPatients = [...realPatients, testPatient];
        console.log(
          `🎯 TOTAL: ${allPatients.length} pacientes (${realPatients.length} reais + 1 teste)`,
        );
      } else {
        console.log(
          "📝 Nenhum compartilhamento encontrado - apenas paciente teste",
        );
      }

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
      console.error("💥 ERRO CRÍTICO:", error);
      console.log("🔄 Retornando apenas paciente teste devido ao erro");

      return {
        patients: [testPatient],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 1,
          itemsPerPage: 10,
        },
      };
    }
  }

  // Gera ID único
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Outros métodos necessários (implementação básica)
  async getPatientById(id: string): Promise<Patient | null> {
    console.log("🔍 Buscando paciente por ID:", id);
    return null; // Implementar se necessário
  }

  async createPatient(data: PatientFormData): Promise<Patient> {
    throw new Error("Método não implementado para teste");
  }

  async updatePatient(
    id: string,
    data: Partial<PatientFormData>,
  ): Promise<Patient> {
    throw new Error("Método não implementado para teste");
  }

  async deletePatient(id: string): Promise<void> {
    throw new Error("Método não implementado para teste");
  }

  async deletePatients(ids: string[]): Promise<void> {
    throw new Error("Método não implementado para teste");
  }

  async getDiagnoses(patientId: string): Promise<Diagnosis[]> {
    return [];
  }

  async addDiagnosis(
    patientId: string,
    diagnosis: Omit<Diagnosis, "id" | "patientId">,
  ): Promise<Diagnosis> {
    throw new Error("Método não implementado para teste");
  }

  async updateDiagnosis(
    id: string,
    diagnosis: Partial<Diagnosis>,
  ): Promise<Diagnosis> {
    throw new Error("Método não implementado para teste");
  }

  async deleteDiagnosis(id: string): Promise<void> {
    throw new Error("Método não implementado para teste");
  }

  async removePatientSharing(patientId: string): Promise<void> {
    throw new Error("Método não implementado para teste");
  }
}

// Instância singleton
export const patientAPI = new PatientAPI();
