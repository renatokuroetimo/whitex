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

  // MÉTODO CORRIGIDO BASEADO NA ARQUITETURA REAL DO BANCO
  async getPatients(): Promise<{
    patients: Patient[];
    pagination: PaginationData;
  }> {
    console.log("🔄 GETPATIENTS - VERSÃO CORRIGIDA PARA ARQUITETURA REAL");

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
    console.log("👤 USUÁRIO LOGADO:", {
      id: currentUser.id,
      email: currentUser.email,
      profession: currentUser.profession,
    });

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
      console.log("🔍 Buscando compartilhamentos para médico:", currentUser.id);

      // 1. BUSCAR COMPARTILHAMENTOS USANDO A ESTRUTURA REAL
      const { data: shares, error: sharesError } = await supabase
        .from("doctor_patient_sharing")
        .select("*")
        .eq("doctor_id", currentUser.id);

      console.log("📊 COMPARTILHAMENTOS ENCONTRADOS:", {
        total: shares?.length || 0,
        error: sharesError?.message || "nenhum",
        shares: shares,
      });

      if (sharesError) {
        console.error("❌ ERRO ao buscar compartilhamentos:", sharesError);
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

      let allPatients: Patient[] = [];

      if (shares && shares.length > 0) {
        console.log(`✅ ${shares.length} compartilhamentos encontrados`);

        // 2. PARA CADA COMPARTILHAMENTO, BUSCAR DADOS REAIS DO PACIENTE
        for (const share of shares) {
          try {
            console.log(`🔍 Processando paciente: ${share.patient_id}`);

            // 2.1 Buscar dados básicos do usuário paciente na tabela users
            const { data: patientUser, error: patientError } = await supabase
              .from("users")
              .select(
                `
                id,
                email,
                profession,
                name,
                city,
                state,
                phone,
                created_at
              `,
              )
              .eq("id", share.patient_id)
              .eq("profession", "paciente")
              .single();

            console.log(`👤 DADOS BÁSICOS DO PACIENTE:`, {
              dados: patientUser,
              erro: patientError?.message || "nenhum",
            });

            if (patientError) {
              console.warn(
                `⚠️ Erro ao buscar dados básicos do paciente ${share.patient_id}:`,
                patientError,
              );
              continue;
            }

            if (!patientUser) {
              console.warn(
                `⚠️ Paciente ${share.patient_id} não encontrado na tabela users`,
              );
              continue;
            }

            // 2.2 Determinar nome do paciente (prioridade: campo name da tabela users)
            let patientName = "Sem nome definido";

            if (patientUser.name && patientUser.name.trim()) {
              patientName = patientUser.name.trim();
              console.log(
                `✅ Nome do paciente obtido da tabela users: "${patientName}"`,
              );
            } else {
              console.log(
                `⚠️ Campo name vazio na tabela users, tentando buscar em patient_personal_data...`,
              );

              // Fallback: buscar nome em patient_personal_data
              try {
                const { data: personalData, error: personalError } =
                  await supabase
                    .from("patient_personal_data")
                    .select("full_name")
                    .eq("user_id", share.patient_id)
                    .single();

                if (
                  !personalError &&
                  personalData?.full_name &&
                  personalData.full_name.trim()
                ) {
                  patientName = personalData.full_name.trim();
                  console.log(
                    `✅ Nome do paciente obtido de patient_personal_data: "${patientName}"`,
                  );
                } else {
                  console.log(`ℹ️ Mantendo nome padrão: "${patientName}"`);
                }
              } catch (error) {
                console.warn(
                  `⚠️ Erro ao buscar dados pessoais do paciente:`,
                  error,
                );
              }
            }

            // 2.3 Buscar dados adicionais (idade, peso, etc.)
            let age = null;
            let weight = null;
            let city = patientUser.city || "N/A";
            let state = patientUser.state || "N/A";

            // Buscar dados pessoais detalhados
            try {
              const { data: personalData, error: personalError } =
                await supabase
                  .from("patient_personal_data")
                  .select(
                    `
                  birth_date,
                  city,
                  state,
                  gender,
                  health_plan
                `,
                  )
                  .eq("user_id", share.patient_id)
                  .single();

              if (!personalError && personalData) {
                console.log(`📋 DADOS PESSOAIS DETALHADOS:`, personalData);

                // Atualizar cidade e estado se disponíveis
                if (personalData.city) city = personalData.city;
                if (personalData.state) state = personalData.state;

                // Calcular idade se data de nascimento disponível
                if (personalData.birth_date) {
                  const today = new Date();
                  const birthDate = new Date(personalData.birth_date);
                  age = today.getFullYear() - birthDate.getFullYear();
                  const monthDiff = today.getMonth() - birthDate.getMonth();
                  if (
                    monthDiff < 0 ||
                    (monthDiff === 0 && today.getDate() < birthDate.getDate())
                  ) {
                    age--;
                  }
                  console.log(`✅ Idade calculada: ${age} anos`);
                }
              }
            } catch (error) {
              console.warn(
                `⚠️ Erro ao buscar dados pessoais detalhados:`,
                error,
              );
            }

            // Buscar dados médicos (peso, altura, etc.)
            try {
              const { data: medicalData, error: medicalError } = await supabase
                .from("patient_medical_data")
                .select(
                  `
                  height,
                  weight,
                  smoker,
                  high_blood_pressure,
                  physical_activity,
                  exercise_frequency,
                  healthy_diet
                `,
                )
                .eq("user_id", share.patient_id)
                .single();

              if (!medicalError && medicalData) {
                console.log(`🏥 DADOS MÉDICOS:`, medicalData);
                if (medicalData.weight) {
                  weight = parseFloat(medicalData.weight.toString());
                }
              }
            } catch (error) {
              console.warn(`⚠️ Erro ao buscar dados médicos:`, error);
            }

            // 2.4 Criar objeto paciente final
            const patient: Patient = {
              id: share.patient_id,
              name: patientName,
              age: age,
              city: city,
              state: state,
              weight: weight,
              status: "compartilhado" as const,
              notes: `Compartilhado em ${new Date(share.shared_at).toLocaleDateString("pt-BR")}`,
              createdAt: share.shared_at || new Date().toISOString(),
              doctorId: null,
              isShared: true,
              sharedId: share.id,
            };

            allPatients.push(patient);
            console.log(
              `✅ PACIENTE ADICIONADO: "${patientName}" (ID: ${share.patient_id})`,
            );
          } catch (error) {
            console.warn(
              `⚠️ Erro ao processar paciente ${share.patient_id}:`,
              error,
            );
          }
        }

        console.log(
          `🎯 RESULTADO FINAL: ${allPatients.length} pacientes compartilhados carregados`,
        );
      } else {
        console.log("📝 Nenhum compartilhamento encontrado para este médico");
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
      console.error("💥 ERRO CRÍTICO no getPatients:", error);
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
    console.log("🗑️ REMOVENDO COMPARTILHAMENTO - patient_id:", patientId);

    if (!supabase) {
      throw new Error("❌ Supabase não está configurado");
    }

    // Verificar se usuário está logado (médico)
    const currentUserStr = localStorage.getItem("medical_app_current_user");
    if (!currentUserStr) {
      throw new Error("❌ Usuário não autenticado");
    }

    const currentUser = JSON.parse(currentUserStr);
    console.log("👤 Médico removendo compartilhamento:", {
      doctor_id: currentUser.id,
      patient_id: patientId,
    });

    try {
      // Deletar o compartilhamento específico usando a estrutura correta
      const { error } = await supabase
        .from("doctor_patient_sharing")
        .delete()
        .eq("doctor_id", currentUser.id)
        .eq("patient_id", patientId);

      if (error) {
        console.error("❌ Erro ao deletar compartilhamento:", error);
        throw new Error(`Erro ao remover compartilhamento: ${error.message}`);
      }

      console.log("✅ Compartilhamento removido com sucesso");
    } catch (error) {
      console.error("💥 Erro crítico ao remover compartilhamento:", error);
      throw error;
    }
  }
}

// Instância singleton
export const patientAPI = new PatientAPI();
