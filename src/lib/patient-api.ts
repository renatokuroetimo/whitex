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

  // MÉTODO CORRIGIDO BASEADO NA ESTRUTURA REAL DO BANCO (SEM CAMPO NAME)
  async getPatients(): Promise<{
    patients: Patient[];
    pagination: PaginationData;
  }> {
    console.log("🔄 GETPATIENTS - VERSÃO CORRIGIDA SEM CAMPO NAME");

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

            // 2.1 Buscar dados básicos do usuário paciente (COM CAMPO full_name)
            const { data: patientUser, error: patientError } = await supabase
              .from("users")
              .select(
                `
                id,
                email,
                profession,
                full_name,
                crm,
                city,
                state,
                specialty,
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

            // 2.2 Determinar nome do paciente (prioridade: full_name da tabela users)
            let patientName = "Sem nome definido";

            // PRIMEIRO: tentar usar full_name da tabela users
            if (patientUser.full_name && patientUser.full_name.trim()) {
              patientName = patientUser.full_name.trim();
              console.log(
                `✅ Nome do paciente obtido da tabela users.full_name: "${patientName}"`,
              );
            } else {
              console.log(
                `⚠️ Campo full_name vazio na tabela users, buscando em patient_personal_data...`,
              );

              // SEGUNDO: buscar nome em patient_personal_data como fallback
              try {
                const { data: personalData, error: personalError } =
                  await supabase
                    .from("patient_personal_data")
                    .select("full_name, email")
                    .eq("user_id", share.patient_id)
                    .single();

                console.log(`📋 DADOS PESSOAIS PARA NOME:`, {
                  dados: personalData,
                  erro: personalError?.message || "nenhum",
                });

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
                  // TERCEIRO: fallback para email
                  if (patientUser.email) {
                    patientName = `Paciente ${patientUser.email.split("@")[0]}`;
                  } else {
                    patientName = `Paciente ${share.patient_id.substring(0, 8)}`;
                  }
                  console.log(`⚠️ Usando nome fallback: "${patientName}"`);
                }
              } catch (error) {
                console.warn(
                  `⚠️ Erro ao buscar dados pessoais do paciente:`,
                  error,
                );
                // Fallback para email se não conseguir buscar dados pessoais
                if (patientUser.email) {
                  patientName = `Paciente ${patientUser.email.split("@")[0]}`;
                } else {
                  patientName = `Paciente ${share.patient_id.substring(0, 8)}`;
                }
                console.log(`⚠️ Usando nome fallback final: "${patientName}"`);
              }
            }

            // 2.3 Buscar dados adicionais (idade, peso, etc.)
            let age = null;
            let weight = null;
            let city = "N/A";
            let state = "N/A";

            // Buscar dados pessoais detalhados
            try {
              const { data: personalData, error: personalError } =
                await supabase
                  .from("patient_personal_data")
                  .select("*")
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
                .select("*")
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

  // Implementar getPatientById para buscar pacientes compartilhados
  async getPatientById(id: string): Promise<Patient | null> {
    console.log("🔍 getPatientById - Buscando paciente ID:", id);

    await this.delay(200);

    // Verificar se usuário está logado
    const currentUserStr = localStorage.getItem("medical_app_current_user");
    if (!currentUserStr) {
      console.error("❌ Usuário não autenticado");
      return null;
    }

    const currentUser = JSON.parse(currentUserStr);
    console.log("👤 USUÁRIO LOGADO:", {
      id: currentUser.id,
      email: currentUser.email,
      profession: currentUser.profession,
    });

    if (!supabase) {
      console.warn("⚠️ Supabase não configurado");
      return null;
    }

    try {
      // 1. VERIFICAR SE É UM PACIENTE COMPARTILHADO
      console.log(
        "🔍 Verificando se paciente está compartilhado com médico:",
        currentUser.id,
      );

      const { data: shareData, error: shareError } = await supabase
        .from("doctor_patient_sharing")
        .select("*")
        .eq("doctor_id", currentUser.id)
        .eq("patient_id", id)
        .single();

      console.log("📊 RESULTADO DA VERIFICAÇÃO DE COMPARTILHAMENTO:", {
        compartilhado: !!shareData,
        erro: shareError?.message || "nenhum",
        dados: shareData,
      });

      if (shareError && shareError.code !== "PGRST116") {
        // PGRST116 = No rows returned, é esperado se não houver compartilhamento
        console.error("❌ Erro ao verificar compartilhamento:", shareError);
        return null;
      }

      if (!shareData) {
        console.log("⚠️ Paciente não está compartilhado com este médico");
        return null;
      }

      // 2. BUSCAR DADOS DO PACIENTE COMPARTILHADO
      console.log(
        "✅ Paciente compartilhado encontrado, buscando dados completos...",
      );

      // 2.1 Buscar dados básicos do usuário paciente
      const { data: patientUser, error: patientError } = await supabase
        .from("users")
        .select(
          `
          id,
          email,
          profession,
          full_name,
          crm,
          city,
          state,
          specialty,
          phone,
          created_at
        `,
        )
        .eq("id", id)
        .eq("profession", "paciente")
        .single();

      console.log(`👤 DADOS BÁSICOS DO PACIENTE:`, {
        dados: patientUser,
        erro: patientError?.message || "nenhum",
      });

      if (patientError || !patientUser) {
        console.warn(
          `⚠️ Erro ao buscar dados básicos do paciente ${id}:`,
          patientError,
        );
        return null;
      }

      // 2.2 Determinar nome do paciente
      let patientName = "Sem nome definido";

      if (patientUser.full_name && patientUser.full_name.trim()) {
        patientName = patientUser.full_name.trim();
        console.log(
          `✅ Nome do paciente obtido da tabela users.full_name: "${patientName}"`,
        );
      } else {
        // Fallback para patient_personal_data
        try {
          const { data: personalData, error: personalError } = await supabase
            .from("patient_personal_data")
            .select("full_name")
            .eq("user_id", id)
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
          } else if (patientUser.email) {
            patientName = `Paciente ${patientUser.email.split("@")[0]}`;
            console.log(`⚠️ Usando nome fallback: "${patientName}"`);
          }
        } catch (error) {
          console.warn(`⚠️ Erro ao buscar dados pessoais:`, error);
          if (patientUser.email) {
            patientName = `Paciente ${patientUser.email.split("@")[0]}`;
          }
        }
      }

      // 2.3 Buscar dados adicionais
      let age = null;
      let weight = null;
      let city = patientUser.city || "N/A";
      let state = patientUser.state || "N/A";

      try {
        const { data: personalData } = await supabase
          .from("patient_personal_data")
          .select("*")
          .eq("user_id", id)
          .single();

        if (personalData) {
          if (personalData.city) city = personalData.city;
          if (personalData.state) state = personalData.state;

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
          }
        }
      } catch (error) {
        console.warn(`⚠️ Erro ao buscar dados pessoais detalhados:`, error);
      }

      try {
        const { data: medicalData } = await supabase
          .from("patient_medical_data")
          .select("*")
          .eq("user_id", id)
          .single();

        if (medicalData?.weight) {
          weight = parseFloat(medicalData.weight.toString());
        }
      } catch (error) {
        console.warn(`⚠️ Erro ao buscar dados médicos:`, error);
      }

      // 2.4 Criar objeto paciente
      const patient: Patient = {
        id: id,
        name: patientName,
        age: age,
        city: city,
        state: state,
        weight: weight,
        status: "compartilhado" as const,
        notes: `Compartilhado em ${new Date(shareData.shared_at).toLocaleDateString("pt-BR")}`,
        createdAt: shareData.shared_at || new Date().toISOString(),
        doctorId: null,
        isShared: true,
        sharedId: shareData.id,
      };

      console.log(`✅ PACIENTE ENCONTRADO E CARREGADO:`, patient);
      return patient;
    } catch (error) {
      console.error("💥 ERRO CRÍTICO no getPatientById:", error);
      return null;
    }
  }

  async createPatient(data: PatientFormData): Promise<Patient> {
    throw new Error("Método não implementado para teste");
  }

  async updatePatient(
    id: string,
    data: Partial<PatientFormData>,
  ): Promise<Patient> {
    await this.delay(300);

    if (!supabase) {
      throw new Error("Sistema de banco de dados não configurado");
    }

    // Obter usuário atual do contexto (SEM localStorage)
    const currentUserStr = localStorage.getItem("medical_app_current_user");
    if (!currentUserStr) {
      throw new Error("Usuário não autenticado");
    }
    const currentUser = JSON.parse(currentUserStr);

    // Verificar se é paciente compartilhado
    const { data: shareData, error: shareError } = await supabase
      .from("doctor_patient_sharing")
      .select("*")
      .eq("doctor_id", currentUser.id)
      .eq("patient_id", id)
      .single();

    if (shareError && shareError.code !== "PGRST116") {
      throw new Error(`Erro ao verificar permissões: ${shareError.message}`);
    }

    if (!shareData) {
      throw new Error("Você não tem permissão para editar este paciente");
    }

    // Salvar observações médicas se houver
    if (data.notes && data.notes.trim()) {
      // Verificar se já existe observação
      const { data: existingObs } = await supabase
        .from("patient_medical_observations")
        .select("*")
        .eq("patient_id", id)
        .eq("doctor_id", currentUser.id)
        .single();

      if (existingObs) {
        // Atualizar existente
        const { error: updateError } = await supabase
          .from("patient_medical_observations")
          .update({
            observations: data.notes,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingObs.id);

        if (updateError) {
          throw new Error(
            `Erro ao atualizar observações: ${updateError.message}`,
          );
        }
      } else {
        // Criar nova
        const { error: insertError } = await supabase
          .from("patient_medical_observations")
          .insert([
            {
              id: this.generateId(),
              patient_id: id,
              doctor_id: currentUser.id,
              observations: data.notes,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ]);

        if (insertError) {
          throw new Error(`Erro ao salvar observações: ${insertError.message}`);
        }
      }
    }

    // Retornar paciente atualizado
    const currentPatient = await this.getPatientById(id);
    if (!currentPatient) {
      throw new Error("Paciente não encontrado");
    }

    return {
      ...currentPatient,
      notes: data.notes || currentPatient.notes,
    };
  }
  async deletePatients(ids: string[]): Promise<void> {
    throw new Error("Método não implementado para teste");
  }

  async getDiagnoses(patientId: string): Promise<Diagnosis[]> {
    console.log(
      "🔍 getDiagnoses - Buscando diagnósticos para paciente:",
      patientId,
    );

    await this.delay(200);

    // Verificar se usuário está logado
    const currentUserStr = localStorage.getItem("medical_app_current_user");
    if (!currentUserStr) {
      console.error("❌ Usuário não autenticado");
      return [];
    }

    const currentUser = JSON.parse(currentUserStr);
    console.log("👤 Usuário buscando diagnósticos:", {
      id: currentUser.id,
      profession: currentUser.profession,
    });

    if (!supabase) {
      console.warn("⚠️ Supabase não configurado");
      return [];
    }

    try {
      // BUSCAR DIAGNÓSTICOS DO PACIENTE
      const { data: diagnoses, error } = await supabase
        .from("patient_diagnoses")
        .select("*")
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false });

      console.log("📊 DIAGNÓSTICOS ENCONTRADOS:", {
        total: diagnoses?.length || 0,
        erro: error?.message || "nenhum",
        dados: diagnoses,
      });

      if (error) {
        console.error("❌ Erro ao buscar diagnósticos:", error);
        return [];
      }

      if (!diagnoses || diagnoses.length === 0) {
        console.log("📝 Nenhum diagnóstico encontrado para este paciente");
        return [];
      }

      // CONVERTER PARA FORMATO DA APLICAÇÃO
      const convertedDiagnoses: Diagnosis[] = diagnoses.map((d: any) => ({
        id: d.id,
        patientId: d.patient_id,
        date: d.date,
        diagnosis: d.status, // Campo 'status' contém o diagnóstico
        code: d.code,
        status: d.status,
      }));

      console.log(`✅ ${convertedDiagnoses.length} diagnósticos carregados`);
      return convertedDiagnoses;
    } catch (error) {
      console.error("💥 Erro crítico ao buscar diagnósticos:", error);
      return [];
    }
  }

  async addDiagnosis(
    patientId: string,
    diagnosis: Omit<Diagnosis, "id" | "patientId">,
  ): Promise<Diagnosis> {
    console.log("🏥 addDiagnosis - Adicionando diagnóstico:", {
      patientId,
      diagnosis,
    });

    await this.delay(300);

    // Verificar se usuário está logado (médico)
    const currentUserStr = localStorage.getItem("medical_app_current_user");
    if (!currentUserStr) {
      throw new Error("❌ Usuário não autenticado");
    }

    const currentUser = JSON.parse(currentUserStr);
    console.log("👤 Médico adicionando diagnóstico:", {
      doctor_id: currentUser.id,
      patient_id: patientId,
    });

    if (!supabase) {
      throw new Error("❌ Supabase não está configurado");
    }

    try {
      // 1. VERIFICAR SE O PACIENTE ESTÁ COMPARTILHADO COM ESTE MÉDICO
      const { data: shareData, error: shareError } = await supabase
        .from("doctor_patient_sharing")
        .select("*")
        .eq("doctor_id", currentUser.id)
        .eq("patient_id", patientId)
        .single();

      console.log("📊 VERIFICAÇÃO DE COMPARTILHAMENTO:", {
        compartilhado: !!shareData,
        erro: shareError?.message || "nenhum",
        dados: shareData,
      });

      if (shareError && shareError.code !== "PGRST116") {
        console.error("❌ Erro ao verificar compartilhamento:", shareError);
        throw new Error("Erro ao verificar permissões de acesso ao paciente");
      }

      if (!shareData) {
        console.log("⚠️ Paciente não está compartilhado com este médico");
        throw new Error(
          "Você não tem permissão para adicionar diagnósticos a este paciente",
        );
      }

      // 2. CRIAR O DIAGNÓSTICO
      const newDiagnosis: Diagnosis = {
        id: this.generateId(),
        patientId: patientId,
        date: diagnosis.date,
        diagnosis: diagnosis.diagnosis,
        code: diagnosis.code,
        status: diagnosis.status || diagnosis.diagnosis, // Fallback para compatibilidade
      };

      console.log("📝 Diagnóstico que será salvo:", newDiagnosis);

      // 3. SALVAR NO BANCO SUPABASE (tabela patient_diagnoses)
      const { data: savedDiagnosis, error: saveError } = await supabase
        .from("patient_diagnoses")
        .insert([
          {
            id: newDiagnosis.id,
            patient_id: newDiagnosis.patientId,
            date: newDiagnosis.date,
            status: newDiagnosis.status,
            code: newDiagnosis.code,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      console.log("📊 Resultado do salvamento no Supabase:", {
        dados: savedDiagnosis,
        erro: saveError?.message || "nenhum",
      });

      if (saveError) {
        console.error("❌ Erro ao salvar diagnóstico:", saveError);
        throw new Error(`Erro ao salvar diagnóstico: ${saveError.message}`);
      }

      console.log("✅ Diagnóstico salvo com sucesso!");
      return newDiagnosis;
    } catch (error) {
      console.error("💥 Erro crítico ao adicionar diagnóstico:", error);
      throw error;
    }
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
