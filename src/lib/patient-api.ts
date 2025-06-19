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

    if (!supabase) {
      console.warn("⚠️ Supabase não configurado - retornando lista vazia");
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
      console.log("🔍 Buscando compartilhamentos reais no banco...");
      console.log("👤 ID do médico logado:", currentUser.id);

      const { data: shares, error: sharesError } = await supabase
        .from("doctor_patient_sharing")
        .select("*")
        .eq("doctor_id", currentUser.id);

      console.log("📊 RESULTADO DETALHADO:");
      console.log("- Total de compartilhamentos:", shares?.length || 0);
      console.log("- Erro:", sharesError?.message || "nenhum");
      console.log(
        "- Query executada: doctor_patient_sharing WHERE doctor_id =",
        currentUser.id,
      );
      console.log("- Dados completos:", shares);

      // Buscar TODOS os compartilhamentos para comparar
      const { data: allShares } = await supabase
        .from("doctor_patient_sharing")
        .select("*")
        .order("created_at", { ascending: false });

      console.log(
        "🗂️ TODOS OS COMPARTILHAMENTOS NO BANCO:",
        allShares?.length || 0,
      );
      allShares?.forEach((share, index) => {
        console.log(
          `  ${index + 1}. Doctor: ${share.doctor_id}, Patient: ${share.patient_id}, Data: ${share.shared_at}`,
        );
      });

      let allPatients: Patient[] = [];

      if (sharesError) {
        console.error("❌ ERRO ao buscar compartilhamentos:", sharesError);
      } else if (shares && shares.length > 0) {
        console.log(`✅ ${shares.length} compartilhamentos encontrados`);

        // Para cada compartilhamento, buscar dados REAIS do paciente
        for (const share of shares) {
          try {
            console.log(
              `🔍 Buscando dados reais do paciente: ${share.patient_id}`,
            );

            // Buscar dados do usuário paciente
            const { data: patientUser, error: patientError } = await supabase
              .from("users")
              .select("id, email, profession, created_at")
              .eq("id", share.patient_id)
              .eq("profession", "paciente")
              .single();

            if (patientError) {
              console.warn(
                `⚠️ Erro ao buscar paciente ${share.patient_id}:`,
                patientError,
              );
              continue;
            }

            if (patientUser) {
              console.log(`🔍 DEBUG - Dados brutos do paciente:`, patientUser);

              // Como não há coluna name na users, começar com email
              let patientName = patientUser.email?.split("@")[0] || "Paciente";
              let age = null;
              let city = "N/A";
              let state = "N/A";
              let weight = null;

              console.log(
                `🎯 Nome inicial do paciente (email): "${patientName}"`,
              );

              try {
                const { data: personalData, error: personalError } =
                  await supabase
                    .from("patient_personal_data")
                    .select("*")
                    .eq("user_id", share.patient_id)
                    .single();

                console.log(`🔍 Dados pessoais encontrados:`, personalData);
                console.log(
                  `🔍 Erro na busca de dados pessoais:`,
                  personalError,
                );

                if (personalData && personalData.full_name) {
                  patientName = personalData.full_name;
                  console.log(`✅ Usando nome completo: ${patientName}`);
                  city = personalData.city || city;
                  state = personalData.state || state;

                  if (personalData.birth_date) {
                    const today = new Date();
                    const birthDate = new Date(personalData.birth_date);
                    age = today.getFullYear() - birthDate.getFullYear();
                  }
                } else {
                  console.log(
                    `⚠️ Sem dados pessoais, usando nome baseado no email: ${patientName}`,
                  );
                }

                const { data: medicalData } = await supabase
                  .from("patient_medical_data")
                  .select("*")
                  .eq("user_id", share.patient_id)
                  .single();

                if (medicalData) {
                  weight = medicalData.weight;
                }
              } catch (error) {
                console.warn(
                  `⚠️ Erro ao buscar dados detalhados do paciente:`,
                  error,
                );
              }

              allPatients.push({
                id: share.patient_id,
                name: patientName, // Nome REAL do banco
                age: age,
                city: city,
                state: state,
                weight: weight,
                status: "compartilhado" as const,
                notes: `Compartilhado em ${new Date(share.shared_at).toLocaleDateString()}`,
                createdAt: share.shared_at || new Date().toISOString(),
                doctorId: null,
                isShared: true,
                sharedId: share.id,
              });

              console.log(`✅ Paciente real adicionado: ${patientName}`);
            }
          } catch (error) {
            console.warn(
              `⚠️ Erro ao processar paciente ${share.patient_id}:`,
              error,
            );
          }
        }

        console.log(
          `🎯 TOTAL: ${allPatients.length} pacientes reais compartilhados`,
        );
      } else {
        console.log("📝 Nenhum compartilhamento encontrado");
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
      console.log("🔄 Retornando lista vazia devido ao erro");

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
    console.log(
      "🗑️ removePatientSharing - Removendo compartilhamento do paciente:",
      patientId,
    );

    if (!supabase) {
      throw new Error("❌ Supabase não está configurado");
    }

    // Verificar se usuário está logado (médico)
    const currentUserStr = localStorage.getItem("medical_app_current_user");
    if (!currentUserStr) {
      throw new Error("❌ Usuário não autenticado");
    }

    const currentUser = JSON.parse(currentUserStr);
    console.log("👤 Médico removendo compartilhamento:", currentUser.id);

    try {
      // Deletar o compartilhamento específico
      const { error } = await supabase
        .from("doctor_patient_sharing")
        .delete()
        .eq("doctor_id", currentUser.id)
        .eq("patient_id", patientId);

      if (error) {
        console.error("❌ Erro ao deletar compartilhamento:", error);
        throw new Error(`Erro ao remover compartilhamento: ${error.message}`);
      }

      console.log("✅ Compartilhamento removido com sucesso do banco");
    } catch (error) {
      console.error("💥 Erro crítico ao remover compartilhamento:", error);
      throw error;
    }
  }
}

// Instância singleton
export const patientAPI = new PatientAPI();
