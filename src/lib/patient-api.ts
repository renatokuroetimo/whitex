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
    await this.delay(200);

    // Verificar se usuário está logado
    const currentUserStr = localStorage.getItem("medical_app_current_user");
    if (!currentUserStr) {
      return {
        patients: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
        },
      };
    }

    const currentUser = JSON.parse(currentUserStr);

    if (!supabase) {
      throw new Error("❌ Supabase não está configurado");
    }

    const allPatients: Patient[] = [];

    try {
      // PRIMEIRO: Buscar pacientes criados pelo próprio médico
      const { data: ownPatients, error: ownError } = await supabase
        .from("patients")
        .select("*")
        .eq("doctor_id", currentUser.id);

      if (!ownError && ownPatients && ownPatients.length > 0) {
        for (const ownPatient of ownPatients) {
          // Buscar observações médicas se existirem
          let notes = ownPatient.notes || "";

          try {
            const { data: observations } = await supabase
              .from("patient_medical_observations")
              .select("observations")
              .eq("patient_id", ownPatient.id)
              .eq("doctor_id", currentUser.id)
              .single();

            if (observations?.observations) {
              notes = observations.observations;
            }
          } catch (error) {
            // Ignorar erro se não houver observações
          }

          const patient: Patient = {
            id: ownPatient.id,
            name: ownPatient.name,
            age: null, // TODO: buscar de patient_personal_data se necessário
            city: "N/A", // TODO: buscar de patient_personal_data se necessário
            state: "N/A", // TODO: buscar de patient_personal_data se necessário
            weight: null, // TODO: buscar de patient_medical_data se necessário
            status: ownPatient.status || "ativo",
            notes: notes,
            createdAt: ownPatient.created_at || new Date().toISOString(),
            doctorId: ownPatient.doctor_id,
            isShared: false,
          };

          allPatients.push(patient);
        }
      }

      // SEGUNDO: Buscar compartilhamentos para este médico
      const { data: shares, error: shareError } = await supabase
        .from("doctor_patient_sharing")
        .select("*")
        .eq("doctor_id", currentUser.id);

      if (shareError) {
        console.error("❌ Erro ao buscar compartilhamentos:", shareError);
        return {
          patients: [],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
          },
        };
      }

      if (shares && shares.length > 0) {
        // Processar cada compartilhamento
        for (const share of shares) {
          try {
            // 2.1 Buscar dados básicos do paciente na tabela users
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

            if (patientError) {
              continue;
            }

            if (!patientUser) {
              continue;
            }

            // 2.2 Determinar nome do paciente (prioridade: full_name da tabela users)
            let patientName = "Sem nome definido";

            // PRIMEIRO: tentar usar full_name da tabela users
            if (patientUser.full_name && patientUser.full_name.trim()) {
              patientName = patientUser.full_name.trim();
            } else {
              // SEGUNDO: buscar nome em patient_personal_data como fallback
              try {
                const { data: personalData, error: personalError } =
                  await supabase
                    .from("patient_personal_data")
                    .select("full_name, email")
                    .eq("user_id", share.patient_id)
                    .single();

                if (
                  !personalError &&
                  personalData?.full_name &&
                  personalData.full_name.trim()
                ) {
                  patientName = personalData.full_name.trim();
                } else {
                  // TERCEIRO: fallback para email
                  if (patientUser.email) {
                    patientName = `Paciente ${patientUser.email.split("@")[0]}`;
                  } else {
                    patientName = `Paciente ${share.patient_id.substring(0, 8)}`;
                  }
                }
              } catch (error) {
                // Fallback para email se não conseguir buscar dados pessoais
                if (patientUser.email) {
                  patientName = `Paciente ${patientUser.email.split("@")[0]}`;
                } else {
                  patientName = `Paciente ${share.patient_id.substring(0, 8)}`;
                }
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
                }
              }
            } catch (error) {
              // Silenciosamente ignorar erros de dados pessoais
            }

            // Buscar dados médicos (peso, altura, etc.)
            try {
              const { data: medicalData, error: medicalError } = await supabase
                .from("patient_medical_data")
                .select("*")
                .eq("user_id", share.patient_id)
                .single();

              if (!medicalError && medicalData) {
                if (medicalData.weight) {
                  weight = parseFloat(medicalData.weight.toString());
                }
              }
            } catch (error) {
              // Silenciosamente ignorar erros de dados médicos
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
          } catch (error) {
            // Silenciosamente ignorar erros de processamento de pacientes individuais
          }
        }
      }

      return {
        patients: allPatients,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: allPatients.length,
        },
      };
    } catch (error) {
      console.error("💥 Erro crítico ao buscar pacientes:", error);
      throw new Error("Erro interno do servidor. Tente novamente.");
    }
  }

  // Versão simplificada do getPatientById para evitar problemas de autenticação
  async getPatientById(id: string): Promise<Patient | null> {
    await this.delay(200);

    const currentUserStr = localStorage.getItem("medical_app_current_user");
    if (!currentUserStr) {
      return null;
    }

    const currentUser = JSON.parse(currentUserStr);

    if (!supabase) {
      return null;
    }

    try {
      // PRIMEIRO: Verificar se é um paciente compartilhado
      const { data: shareData } = await supabase
        .from("doctor_patient_sharing")
        .select("*")
        .eq("doctor_id", currentUser.id)
        .eq("patient_id", id)
        .single();

      if (shareData) {
        // Buscar dados básicos do paciente
        const { data: patientUser } = await supabase
          .from("users")
          .select("id, email, profession, full_name, city, state")
          .eq("id", id)
          .eq("profession", "paciente")
          .single();

        if (!patientUser) {
          return null;
        }

        // Nome do paciente
        let patientName = "Sem nome definido";
        if (patientUser.full_name && patientUser.full_name.trim()) {
          patientName = patientUser.full_name.trim();
        } else if (patientUser.email) {
          patientName = `Paciente ${patientUser.email.split("@")[0]}`;
        }

        // Buscar observações médicas salvas
        let notes = `Compartilhado em ${new Date(shareData.shared_at).toLocaleDateString("pt-BR")}`;

        try {
          const { data: observations } = await supabase
            .from("patient_medical_observations")
            .select("observations")
            .eq("patient_id", id)
            .eq("doctor_id", currentUser.id)
            .single();

          if (observations?.observations) {
            notes = observations.observations;
          }
        } catch (error) {
          // Ignorar erro se não houver observações
        }

        return {
          id: id,
          name: patientName,
          age: null,
          city: patientUser.city || "N/A",
          state: patientUser.state || "N/A",
          weight: null,
          status: "compartilhado" as const,
          notes: notes,
          createdAt: shareData.shared_at || new Date().toISOString(),
          doctorId: null,
          isShared: true,
          sharedId: shareData.id,
        };
      }

      // SEGUNDO: Se não é compartilhado, verificar se é um paciente próprio
      console.log("🔍 Buscando paciente próprio do médico:", { patientId: id, doctorId: currentUser.id });

      const { data: ownPatient } = await supabase
        .from("patients")
        .select("*")
        .eq("id", id)
        .eq("doctor_id", currentUser.id)
        .single();

      console.log("📋 Paciente próprio encontrado:", ownPatient);

      if (ownPatient) {
        // Buscar observações médicas salvas
        let notes = ownPatient.notes || "";

        try {
          const { data: observations } = await supabase
            .from("patient_medical_observations")
            .select("observations")
            .eq("patient_id", id)
            .eq("doctor_id", currentUser.id)
            .single();

          if (observations?.observations) {
            notes = observations.observations;
          }
        } catch (error) {
          // Ignorar erro se não houver observações
        }

        // Para pacientes criados pelo médico, usar dados básicos da tabela patients
        console.log("📊 Dados base do paciente próprio:", ownPatient);

        // USAR OS DADOS REAIS DA TABELA PATIENTS em vez de valores padrão
        const age = ownPatient.age;
        const city = ownPatient.city;
        const state = ownPatient.state;
        const weight = ownPatient.weight;

        console.log("✅ Usando dados reais da tabela patients:", { age, city, state, weight });

        const result = {
          id: ownPatient.id,
          name: ownPatient.name,
          age: age,
          city: city,
          state: state,
          weight: weight,
          status: ownPatient.status || "ativo",
          notes: notes,
          createdAt: ownPatient.created_at || new Date().toISOString(),
          doctorId: ownPatient.doctor_id,
          isShared: false,
        };

        console.log("✅ Retornando paciente próprio:", result);
        return result;
      }

      return null;
    } catch (error) {
      console.error("Erro ao buscar paciente:", error);
      return null;
    }
  }

  async createPatient(data: PatientFormData): Promise<Patient> {
    await this.delay(300);

    if (!supabase) {
      throw new Error("Sistema de banco de dados não configurado");
    }

    const currentUserStr = localStorage.getItem("medical_app_current_user");
    if (!currentUserStr) {
      throw new Error("Usuário não autenticado");
    }

    const currentUser = JSON.parse(currentUserStr);

    if (currentUser.profession !== "medico") {
      throw new Error("Apenas médicos podem criar pacientes");
    }

    // Gerar ID único para o novo paciente
    const newPatientId = this.generateId();

    // Criar paciente na tabela patients com dados básicos
    const { error: createError } = await supabase.from("patients").insert([
      {
        id: newPatientId,
        doctor_id: currentUser.id,
        name: data.name,
        status: data.status || "ativo",
        notes: data.notes || "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);

    if (createError) {
      throw new Error(`Erro ao criar paciente: ${createError.message}`);
    }

    console.log("✅ Paciente criado com sucesso na tabela patients");
    // NOTA: Para pacientes criados pelo médico, não utilizamos as tabelas
    // patient_personal_data e patient_medical_data, pois essas são para usuários registrados

    // Retornar o paciente criado
    const newPatient: Patient = {
      id: newPatientId,
      name: data.name,
      age: data.age || null,
      city: data.city || "N/A",
      state: data.state || "N/A",
      weight: data.weight || null,
      email: data.email || undefined,
      status: data.status || "ativo",
      notes: data.notes || "",
      createdAt: new Date().toISOString(),
      doctorId: currentUser.id,
      isShared: false,
    };

    return newPatient;
  }

  async updatePatient(
    id: string,
    data: Partial<PatientFormData>,
  ): Promise<Patient> {
    await this.delay(300);

    console.log("🔥 UPDATEPATIENT INICIADO:", { id, data });

    if (!supabase) {
      throw new Error("Sistema de banco de dados não configurado");
    }

    // Obter usuário atual do contexto (SEM localStorage)
    const currentUserStr = localStorage.getItem("medical_app_current_user");
    if (!currentUserStr) {
      throw new Error("Usuário não autenticado");
    }
    const currentUser = JSON.parse(currentUserStr);

    console.log("🔍 Usuário atual:", {
      id: currentUser.id,
      profession: currentUser.profession,
      email: currentUser.email,
    });

    // PRIMEIRO: Verificar se é paciente próprio do médico
    const { data: ownPatient, error: ownError } = await supabase
      .from("patients")
      .select("*")
      .eq("id", id)
      .eq("doctor_id", currentUser.id)
      .single();

    // SEGUNDO: Se não for paciente próprio, verificar se é compartilhado
    let shareData = null;
    if (!ownPatient) {
      const { data: tempShareData, error: shareError } = await supabase
        .from("doctor_patient_sharing")
        .select("*")
        .eq("doctor_id", currentUser.id)
        .eq("patient_id", id)
        .single();

      if (shareError && shareError.code !== "PGRST116") {
        throw new Error(`Erro ao verificar permissões: ${shareError.message}`);
      }

      shareData = tempShareData;
    }

    // Verificar se tem permissão (próprio OU compartilhado)
    if (!ownPatient && !shareData) {
      throw new Error("Você não tem permissão para editar este paciente");
    }

    console.log("🔍 Permissões verificadas:", {
      isOwnPatient: !!ownPatient,
      isSharedPatient: !!shareData,
      patientId: id,
      doctorId: currentUser.id,
    });

    // Atualizar dados pessoais se for paciente próprio (não compartilhado)
    if (ownPatient) {

      if (ownPatient) {
        console.log("✅ Paciente próprio identificado, atualizando dados básicos...");

        // Atualizar dados básicos do paciente (SEMPRE atualizar com os dados recebidos)
        console.log("📝 Atualizando dados básicos completos:");
        console.log("📊 Dados atuais no banco (ownPatient):", ownPatient);
        console.log("📊 Dados enviados pelo formulário (data):", data);
        console.log("🔍 Campos específicos do formulário:");
        console.log("  - data.age:", data.age, "tipo:", typeof data.age);
        console.log("  - data.city:", data.city, "tipo:", typeof data.city);
        console.log("  - data.state:", data.state, "tipo:", typeof data.state);
        console.log("  - data.weight:", data.weight, "tipo:", typeof data.weight);

        const updateData = {
          name: data.name || ownPatient.name,
          age: data.age ? parseInt(data.age.toString()) : ownPatient.age,
          city: data.city || ownPatient.city,
          state: data.state || ownPatient.state,
          weight: data.weight ? parseFloat(data.weight.toString()) : ownPatient.weight,
          status: data.status || ownPatient.status,
          updated_at: new Date().toISOString(),
        };

        console.log("💾 Dados que serão salvos (COMPLETOS):", updateData);

        const { data: updatedPatient, error: updatePatientError } = await supabase
          .from("patients")
          .update(updateData)
          .eq("id", id)
          .eq("doctor_id", currentUser.id) // Garantir que só atualiza se for do médico
          .select()
          .single();

        if (updatePatientError) {
          console.error("❌ Erro ao atualizar dados básicos:", updatePatientError);
          throw new Error(
            `Erro ao atualizar dados básicos: ${updatePatientError.message}`,
          );
        }

        console.log("✅ Dados básicos atualizados com sucesso:", updatedPatient);

        // NOVO: Salvar dados complementares nas tabelas auxiliares para pacientes próprios
        console.log("💾 Salvando dados complementares nas tabelas auxiliares...");

        // Salvar dados pessoais se fornecidos
        if (data.email || data.phone || data.birthDate || data.gender || data.healthPlan) {
          console.log("📋 Atualizando/criando dados pessoais auxiliares");

          const personalDataToSave = {
            id: this.generateId(),
            user_id: id,
            full_name: data.name || ownPatient.name,
            email: data.email || "",
            phone: data.phone || "",
            birth_date: data.birthDate || null,
            gender: data.gender || null,
            state: data.state || ownPatient.state,
            city: data.city || ownPatient.city,
            health_plan: data.healthPlan || "",
            profile_image: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          // Deletar registros existentes e inserir novo
          await supabase.from("patient_personal_data").delete().eq("user_id", id);
          const { error: personalError } = await supabase.from("patient_personal_data").insert([personalDataToSave]);

          if (personalError) {
            console.warn("⚠️ Erro ao salvar dados pessoais auxiliares:", personalError);
          } else {
            console.log("✅ Dados pessoais auxiliares salvos");
          }
        }

        // Salvar dados médicos se fornecidos
        if (data.height || data.smoker !== undefined || data.highBloodPressure !== undefined || data.physicalActivity !== undefined) {
          console.log("🏥 Atualizando/criando dados médicos auxiliares");

          const medicalDataToSave = {
            id: this.generateId(),
            user_id: id,
            height: data.height || null,
            weight: data.weight || ownPatient.weight,
            smoker: data.smoker || false,
            high_blood_pressure: data.highBloodPressure || false,
            physical_activity: data.physicalActivity || false,
            exercise_frequency: null,
            healthy_diet: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          // Deletar registros existentes e inserir novo
          await supabase.from("patient_medical_data").delete().eq("user_id", id);
          const { error: medicalError } = await supabase.from("patient_medical_data").insert([medicalDataToSave]);

          if (medicalError) {
            console.warn("⚠️ Erro ao salvar dados médicos auxiliares:", medicalError);
          } else {
            console.log("✅ Dados médicos auxiliares salvos");
          }
        }
      }

      // Para pacientes criados pelo médico, dados também são salvos nas tabelas auxiliares
      console.log("✅ Dados básicos E auxiliares atualizados para paciente próprio");

    // Salvar observações médicas se houver
    if (data.notes && data.notes.trim()) {
      console.log("📝 Salvando observações médicas:", data.notes);

      // Para pacientes criados pelo médico, simplesmente atualizar o campo notes na tabela patients
      if (ownPatient) {
        console.log("💾 Salvando observações diretamente na tabela patients:", data.notes);

        const { data: updatedNotes, error: updateNotesError } = await supabase
          .from("patients")
          .update({
            notes: data.notes,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .eq("doctor_id", currentUser.id)
          .select("notes")
          .single();

        if (updateNotesError) {
          console.error("❌ Erro ao salvar observações:", updateNotesError);
          throw new Error(
            `Erro ao salvar observações: ${updateNotesError.message}`,
          );
        }
        console.log("✅ Observações salvas com sucesso:", updatedNotes);
      } else {
        // Para pacientes compartilhados, usar a tabela de observações médicas
        console.log("💾 Salvando observações na tabela patient_medical_observations");

        // Verificar se já existe observação
        const { data: existingObs } = await supabase
          .from("patient_medical_observations")
          .select("*")
          .eq("patient_id", id)
          .eq("doctor_id", currentUser.id)
          .single();

        console.log("🔍 Observações existentes:", existingObs);

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
    }

    // Retornar paciente atualizado
    console.log("🔄 Buscando paciente atualizado...");
    const currentPatient = await this.getPatientById(id);
    if (!currentPatient) {
      throw new Error("Paciente não encontrado");
    }

    const result = {
      ...currentPatient,
      notes: data.notes || currentPatient.notes,
    };

    console.log("✅ UPDATEPATIENT CONCLUÍDO COM SUCESSO:", result);
    return result;
  }

  async deletePatients(ids: string[]): Promise<void> {
    await this.delay(300);

    if (!supabase) {
      throw new Error("Sistema de banco de dados não configurado");
    }

    const currentUserStr = localStorage.getItem("medical_app_current_user");
    if (!currentUserStr) {
      throw new Error("Usuário não autenticado");
    }

    const currentUser = JSON.parse(currentUserStr);

    try {
      // Deletar apenas pacientes que pertencem ao médico atual
      const { error } = await supabase
        .from("patients")
        .delete()
        .in("id", ids)
        .eq("doctor_id", currentUser.id);

      if (error) {
        throw new Error(`Erro ao deletar pacientes: ${error.message}`);
      }

      // Também remover observações médicas relacionadas
      for (const patientId of ids) {
        await supabase
          .from("patient_medical_observations")
          .delete()
          .eq("patient_id", patientId)
          .eq("doctor_id", currentUser.id);
      }
    } catch (error) {
      console.error("Erro ao deletar pacientes:", error);
      throw error;
    }
  }

  // Função auxiliar para gerar IDs únicos
  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  async getDiagnoses(patientId: string): Promise<Diagnosis[]> {
    await this.delay(300);

    // Verificar se usuário está logado (médico)
    const currentUserStr = localStorage.getItem("medical_app_current_user");
    if (!currentUserStr) {
      throw new Error("❌ Usuário não autenticado");
    }

    const currentUser = JSON.parse(currentUserStr);

    if (!supabase) {
      throw new Error("❌ Supabase não está configurado");
    }

    try {
      // BUSCAR DIAGNÓSTICOS DO PACIENTE
      const { data: diagnoses, error } = await supabase
        .from("patient_diagnoses")
        .select("*")
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Erro ao buscar diagnósticos:", error);
        return [];
      }

      if (!diagnoses || diagnoses.length === 0) {
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
    await this.delay(300);

    // Verificar se usuário está logado (médico)
    const currentUserStr = localStorage.getItem("medical_app_current_user");
    if (!currentUserStr) {
      throw new Error("❌ Usuário não autenticado");
    }

    const currentUser = JSON.parse(currentUserStr);

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

      if (shareError && shareError.code !== "PGRST116") {
        console.error("❌ Erro ao verificar compartilhamento:", shareError);
        throw new Error("Erro ao verificar permissões de acesso ao paciente");
      }

      if (!shareData) {
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

      if (saveError) {
        console.error("❌ Erro ao salvar diagnóstico:", saveError);
        throw new Error(`Erro ao salvar diagnóstico: ${saveError.message}`);
      }

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
    if (!supabase) {
      throw new Error("❌ Supabase não está configurado");
    }

    // Verificar se usuário está logado (médico)
    const currentUserStr = localStorage.getItem("medical_app_current_user");
    if (!currentUserStr) {
      throw new Error("❌ Usuário não autenticado");
    }

    const currentUser = JSON.parse(currentUserStr);

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
    } catch (error) {
      console.error("💥 Erro crítico ao remover compartilhamento:", error);
      throw error;
    }
  }
}

// Instância singleton
export const patientAPI = new PatientAPI();