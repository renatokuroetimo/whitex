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
    const patientMap = new Map<string, Patient>(); // Use Map to prevent duplicates

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

          // Add to map to prevent duplicates
          patientMap.set(patient.id, patient);
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

            // 2.2 Determinar nome do paciente (prioridade: patient_personal_data para compartilhados)
            let patientName = "Sem nome definido";

            // PRIMEIRO: buscar nome em patient_personal_data (dados atualizados pelo paciente)
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
                console.log(
                  "✅ Nome encontrado em patient_personal_data:",
                  patientName,
                );
              } else {
                // SEGUNDO: fallback para full_name da tabela users
                if (patientUser.full_name && patientUser.full_name.trim()) {
                  patientName = patientUser.full_name.trim();
                  console.log(
                    "✅ Nome encontrado em users.full_name:",
                    patientName,
                  );
                } else {
                  // TERCEIRO: fallback para email
                  if (patientUser.email) {
                    patientName = `Paciente ${patientUser.email.split("@")[0]}`;
                    console.log("⚠️ Usando email como nome:", patientName);
                  } else {
                    patientName = `Paciente ${share.patient_id.substring(0, 8)}`;
                    console.log("⚠️ Usando ID como nome:", patientName);
                  }
                }
              }
            } catch (error) {
              console.warn(
                "⚠️ Erro ao buscar dados pessoais, usando fallback:",
                error,
              );
              // Fallback para full_name da tabela users
              if (patientUser.full_name && patientUser.full_name.trim()) {
                patientName = patientUser.full_name.trim();
              } else if (patientUser.email) {
                patientName = `Paciente ${patientUser.email.split("@")[0]}`;
              } else {
                patientName = `Paciente ${share.patient_id.substring(0, 8)}`;
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

        // Nome do paciente (prioridade: patient_personal_data para compartilhados)
        let patientName = "Sem nome definido";

        console.log("🔍 DEBUG COMPARTILHADO - patientUser dados:", {
          id: patientUser.id,
          email: patientUser.email,
          full_name: patientUser.full_name,
        });

        // PRIMEIRO: buscar nome em patient_personal_data (dados atualizados pelo paciente)
        try {
          const { data: personalData, error: personalError } = await supabase
            .from("patient_personal_data")
            .select("full_name, email")
            .eq("user_id", id);

          console.log("🔍 DEBUG COMPARTILHADO - patient_personal_data:", {
            data: personalData,
            error: personalError,
            count: personalData?.length,
          });

          // Se há múltiplos registros, pegar o mais recente
          const latestPersonalData =
            personalData && personalData.length > 0
              ? personalData.sort(
                  (a, b) =>
                    new Date(b.updated_at || b.created_at || "").getTime() -
                    new Date(a.updated_at || a.created_at || "").getTime(),
                )[0]
              : null;

          if (
            !personalError &&
            latestPersonalData?.full_name &&
            latestPersonalData.full_name.trim()
          ) {
            patientName = latestPersonalData.full_name.trim();
            console.log(
              "✅ Nome compartilhado encontrado em patient_personal_data:",
              patientName,
            );
          } else {
            console.log("❌ Dados pessoais não encontrados ou full_name vazio");
            // SEGUNDO: fallback para full_name da tabela users
            if (patientUser.full_name && patientUser.full_name.trim()) {
              patientName = patientUser.full_name.trim();
              console.log(
                "✅ Nome compartilhado encontrado em users.full_name:",
                patientName,
              );
            } else if (patientUser.email) {
              patientName = `Paciente ${patientUser.email.split("@")[0]}`;
              console.log(
                "⚠️ Usando email como nome compartilhado:",
                patientName,
              );
            }
          }
        } catch (error) {
          console.warn(
            "⚠️ Erro ao buscar dados pessoais do compartilhado:",
            error,
          );
          // Fallback para users.full_name
          if (patientUser.full_name && patientUser.full_name.trim()) {
            patientName = patientUser.full_name.trim();
          } else if (patientUser.email) {
            patientName = `Paciente ${patientUser.email.split("@")[0]}`;
          }
        }

        console.log(
          "🎯 DEBUG COMPARTILHADO - Nome final escolhido:",
          patientName,
        );

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
      console.log("🔍 Buscando paciente próprio do médico:", {
        patientId: id,
        doctorId: currentUser.id,
      });

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

        console.log("✅ Usando dados reais da tabela patients:", {
          age,
          city,
          state,
          weight,
        });

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

    // Validar email obrigatório para criar conta de usuário
    if (!data.email || !data.email.trim()) {
      throw new Error("Email é obrigatório para criar conta do paciente");
    }

    // Gerar ID único para o novo paciente
    const newPatientId = this.generateId();

    // Criar paciente na tabela patients com dados básicos
    const { error: createError } = await supabase.from("patients").insert([
      {
        id: newPatientId,
        doctor_id: currentUser.id,
        name: data.name,
        city: data.city || null,
        state: data.state || null,
        weight: data.weight || null,
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

    // NOVO: Criar usuário na tabela users para que o paciente possa se logar
    try {
      console.log("👤 Criando conta de usuário para o paciente...");

      // Verificar se email já existe
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("email", data.email.toLowerCase())
        .single();

      if (existingUser) {
        console.warn(
          "⚠️ Email já existe na tabela users, pulando criação de usuário",
        );
      } else {
        // Criar usuário com senha padrão "123456"
        const { error: userCreateError } = await supabase.from("users").insert([
          {
            id: newPatientId, // Usar o mesmo ID do paciente
            email: data.email.toLowerCase(),
            profession: "paciente",
            full_name: data.name,
            city: data.city || null,
            state: data.state || null,
            phone: data.phone || null,
            crm: null, // Pacientes não têm CRM
            specialty: null, // Pacientes não têm especialidade
            created_at: new Date().toISOString(),
          },
        ]);

        if (userCreateError) {
          console.error("❌ Erro ao criar usuário:", userCreateError);
          console.warn(
            "⚠️ Paciente criado mas conta de usuário não foi criada",
          );
        } else {
          console.log(
            "✅ Conta de usuário criada com sucesso - Senha padrão: 123456",
          );
        }
      }
    } catch (error) {
      console.error("❌ Erro ao processar criação de usuário:", error);
      console.warn(
        "⚠️ Paciente criado mas conta de usuário pode não ter sido criada",
      );
    }

    // Salvar dados extras nas tabelas auxiliares APENAS se o usuário foi criado com sucesso
    try {
      // Verificar se o usuário foi criado antes de salvar dados auxiliares
      const { data: userExists, error: userCheckError } = await supabase
        .from("users")
        .select("id")
        .eq("id", newPatientId)
        .single();

      if (userCheckError || !userExists) {
        console.warn(
          "⚠️ CREATE: Usuário não foi criado, pulando dados auxiliares",
        );
        console.log(
          "⚠️ CREATE: Dados auxiliares só serão salvos quando o usuário fizer login e completar o perfil",
        );
      } else {
        console.log("✅ CREATE: Usuário confirmado, salvando dados auxiliares");

        // 1. Salvar dados pessoais se fornecidos
        if (
          data.email ||
          data.phone ||
          data.birthDate ||
          data.gender ||
          data.healthPlan
        ) {
          console.log("📋 CREATE: Salvando dados pessoais auxiliares");

          const personalDataToSave = {
            id: this.generateId(),
            user_id: newPatientId,
            full_name: data.name,
            email: data.email || "",
            birth_date: data.birthDate || null,
            gender: data.gender || null,
            state: data.state || null,
            city: data.city || null,
            health_plan: data.healthPlan || "",
            profile_image: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          console.log(
            "📝 CREATE: Dados pessoais que serão salvos:",
            personalDataToSave,
          );

          const { error: personalError } = await supabase
            .from("patient_personal_data")
            .insert([personalDataToSave]);

          if (personalError) {
            console.warn(
              "❌ CREATE: Erro ao salvar dados pessoais auxiliares:",
              personalError,
            );
          } else {
            console.log(
              "✅ CREATE: Dados pessoais auxiliares salvos com sucesso",
            );
          }
        } else {
          console.log("⚠️ CREATE: Nenhum dado pessoal fornecido para salvar");
        }

        // 2. Salvar dados médicos se fornecidos
        if (
          data.height ||
          data.smoker !== undefined ||
          data.highBloodPressure !== undefined ||
          data.physicalActivity !== undefined
        ) {
          console.log("🏥 Salvando dados médicos auxiliares");

          const medicalDataToSave = {
            id: this.generateId(),
            user_id: newPatientId,
            height: data.height || null,
            weight: data.weight || null,
            smoker: data.smoker || false,
            high_blood_pressure: data.highBloodPressure || false,
            physical_activity: data.physicalActivity || false,
            exercise_frequency: null,
            healthy_diet: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          const { error: medicalError } = await supabase
            .from("patient_medical_data")
            .insert([medicalDataToSave]);

          if (medicalError) {
            console.warn(
              "⚠️ Erro ao salvar dados médicos auxiliares:",
              medicalError,
            );
          } else {
            console.log("✅ Dados médicos auxiliares salvos com sucesso");
          }
        }
      }
    } catch (error) {
      console.warn("⚠️ Erro ao salvar dados auxiliares:", error);
    }

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
      console.log(
        "✅ Paciente próprio identificado, atualizando dados básicos...",
      );

      // Atualizar dados básicos do paciente (SEMPRE atualizar com os dados recebidos)
      console.log("📝 Atualizando dados básicos completos:");
      console.log("📊 Dados atuais no banco (ownPatient):", ownPatient);
      console.log("📊 Dados enviados pelo formulário (data):", data);
      console.log("🔍 Campos específicos do formulário:");
      console.log("  - data.city:", data.city, "tipo:", typeof data.city);
      console.log("  - data.state:", data.state, "tipo:", typeof data.state);
      console.log("  - data.weight:", data.weight, "tipo:", typeof data.weight);

      const updateData = {
        name: data.name || ownPatient.name,
        city: data.city || ownPatient.city,
        state: data.state || ownPatient.state,
        weight: data.weight
          ? parseFloat(data.weight.toString())
          : ownPatient.weight,
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
        console.error("❌ BASIC UPDATE: Erro ao atualizar dados básicos:");
        console.error(
          "❌ BASIC UPDATE: Código do erro:",
          updatePatientError.code,
        );
        console.error(
          "❌ BASIC UPDATE: Mensagem do erro:",
          updatePatientError.message,
        );
        console.error(
          "❌ BASIC UPDATE: Detalhes do erro:",
          updatePatientError.details,
        );
        console.error(
          "❌ BASIC UPDATE: Hint do erro:",
          updatePatientError.hint,
        );
        console.error(
          "❌ BASIC UPDATE: Erro completo:",
          JSON.stringify(updatePatientError, null, 2),
        );
        throw new Error(
          `Erro ao atualizar dados básicos: ${updatePatientError.message}`,
        );
      }

      console.log("✅ Dados básicos atualizados com sucesso:", updatedPatient);

      // AGORA SALVAR DADOS EXTRAS NAS TABELAS AUXILIARES
      console.log("💾 Salvando dados extras nas tabelas auxiliares...");

      // 1. Salvar dados pessoais APENAS se há dados extras para salvar
      if (data.email || data.birthDate || data.gender || data.healthPlan) {
        console.log("📋 UPDATE: Verificando dados pessoais para salvar...");
        console.log("📊 UPDATE: Dados recebidos:", {
          email: data.email,
          birthDate: data.birthDate,
          gender: data.gender,
          healthPlan: data.healthPlan,
        });

        // CRUCIAL: Verificar se o patient ID existe na tabela users antes de inserir
        console.log(
          "🔍 UPDATE: Verificando se patient ID existe na tabela users...",
        );
        const { data: userExists, error: userCheckError } = await supabase
          .from("users")
          .select("id")
          .eq("id", id)
          .single();

        if (userCheckError || !userExists) {
          console.warn(
            `⚠️ UPDATE: Patient ID ${id} não existe na tabela users, criando entrada...`,
          );

          // Criar usuário na tabela users se não existir
          try {
            const { error: createUserError } = await supabase
              .from("users")
              .insert([
                {
                  id: id,
                  email: data.email || `patient-${id}@medical.local`,
                  profession: "paciente",
                  full_name: data.name || ownPatient.name,
                  city: data.city || ownPatient.city,
                  state: data.state || ownPatient.state,
                  phone: null,
                  crm: null,
                  specialty: null,
                  created_at: new Date().toISOString(),
                },
              ]);

            if (createUserError) {
              console.error(
                "❌ UPDATE: Erro ao criar usuário:",
                createUserError,
              );
              console.warn(
                "⚠️ UPDATE: Pulando salvamento de dados pessoais devido à falta de usuário",
              );
            } else {
              console.log(
                "✅ UPDATE: Usuário criado com sucesso para o patient",
              );
            }
          } catch (createError) {
            console.error(
              "❌ UPDATE: Erro crítico ao criar usuário:",
              createError,
            );
            console.warn("⚠️ UPDATE: Pulando salvamento de dados pessoais");
          }
        } else {
          console.log("✅ UPDATE: Patient ID existe na tabela users");
        }

        // Agora tentar salvar dados pessoais apenas se o usuário existe
        const { data: finalUserCheck } = await supabase
          .from("users")
          .select("id")
          .eq("id", id)
          .single();

        if (finalUserCheck) {
          const personalDataToSave = {
            id: this.generateId(),
            user_id: id,
            full_name: data.name || ownPatient.name,
            email: data.email || "",
            birth_date: data.birthDate || null,
            gender: data.gender || null,
            state: data.state || ownPatient.state,
            city: data.city || ownPatient.city,
            health_plan: data.healthPlan || "",
            profile_image: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          console.log(
            "📝 UPDATE: Dados pessoais que serão salvos:",
            personalDataToSave,
          );

          try {
            // Deletar registros existentes e inserir novo
            console.log("🗑️ UPDATE: Deletando dados pessoais existentes...");
            const { error: deleteError } = await supabase
              .from("patient_personal_data")
              .delete()
              .eq("user_id", id);

            if (deleteError) {
              console.warn(
                "⚠️ UPDATE: Erro ao deletar dados pessoais existentes:",
                deleteError,
              );
            } else {
              console.log("✅ UPDATE: Dados pessoais existentes deletados");
            }

            console.log("💾 UPDATE: Inserindo novos dados pessoais...");
            const { error: personalError } = await supabase
              .from("patient_personal_data")
              .insert([personalDataToSave]);

            if (personalError) {
              console.error(
                "❌ UPDATE: Erro ao salvar dados pessoais auxiliares:",
              );
              console.error("❌ UPDATE: Código do erro:", personalError.code);
              console.error(
                "❌ UPDATE: Mensagem do erro:",
                personalError.message,
              );
              console.error(
                "❌ UPDATE: Detalhes do erro:",
                personalError.details,
              );
              console.error("❌ UPDATE: Hint do erro:", personalError.hint);
              console.error(
                "❌ UPDATE: Erro completo:",
                JSON.stringify(personalError, null, 2),
              );
            } else {
              console.log(
                "✅ UPDATE: Dados pessoais auxiliares salvos com sucesso",
              );
            }
          } catch (error) {
            console.error(
              "❌ UPDATE: Erro ao processar dados pessoais:",
              error,
            );
          }
        } else {
          console.warn(
            "⚠️ UPDATE: Usuário ainda não existe após tentativa de criação, pulando dados pessoais",
          );
        }
      } else {
        console.log(
          "⚠️ UPDATE: Nenhum dado pessoal extra fornecido, pulando salvamento",
        );
      }

      // 2. Salvar dados médicos extras se fornecidos
      if (
        data.height ||
        data.smoker !== undefined ||
        data.highBloodPressure !== undefined ||
        data.physicalActivity !== undefined
      ) {
        console.log("🏥 Salvando dados médicos auxiliares");

        // Verificar se o usuário existe antes de tentar salvar dados médicos
        const { data: userExistsForMedical } = await supabase
          .from("users")
          .select("id")
          .eq("id", id)
          .single();

        if (userExistsForMedical) {
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

          try {
            // Deletar registros existentes e inserir novo
            await supabase
              .from("patient_medical_data")
              .delete()
              .eq("user_id", id);
            const { error: medicalError } = await supabase
              .from("patient_medical_data")
              .insert([medicalDataToSave]);

            if (medicalError) {
              console.warn(
                "⚠️ Erro ao salvar dados médicos auxiliares:",
                medicalError,
              );
            } else {
              console.log("✅ Dados médicos auxiliares salvos com sucesso");
            }
          } catch (error) {
            console.warn("⚠️ Erro ao processar dados médicos:", error);
          }
        } else {
          console.warn(
            "⚠️ UPDATE: Usuário não existe, pulando salvamento de dados médicos",
          );
        }
      }

      console.log("🎉 Todos os dados salvos: básicos + auxiliares");
    }

    // Salvar observações médicas se houver
    if (data.notes && data.notes.trim()) {
      console.log("📝 Salvando observações médicas:", data.notes);

      // Para pacientes criados pelo médico, simplesmente atualizar o campo notes na tabela patients
      if (ownPatient) {
        console.log(
          "💾 Salvando observações diretamente na tabela patients:",
          data.notes,
        );

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
        console.log(
          "💾 Salvando observações na tabela patient_medical_observations",
        );

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
            throw new Error(
              `Erro ao salvar observações: ${insertError.message}`,
            );
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
      throw new Error("❌ Usuário n��o autenticado");
    }

    const currentUser = JSON.parse(currentUserStr);

    if (!supabase) {
      throw new Error("❌ Supabase não está configurado");
    }

    try {
      // 1. VERIFICAR SE O PACIENTE É PRÓPRIO OU COMPARTILHADO COM ESTE MÉDICO

      // Primeiro: verificar se é paciente próprio
      const { data: ownPatient, error: ownError } = await supabase
        .from("patients")
        .select("*")
        .eq("id", patientId)
        .eq("doctor_id", currentUser.id)
        .single();

      // Segundo: se não é próprio, verificar se é compartilhado
      let hasPermission = false;
      if (ownPatient && !ownError) {
        hasPermission = true;
        console.log("✅ Diagnóstico para paciente próprio");
      } else {
        const { data: shareData, error: shareError } = await supabase
          .from("doctor_patient_sharing")
          .select("*")
          .eq("doctor_id", currentUser.id)
          .eq("patient_id", patientId)
          .single();

        if (shareData && !shareError) {
          hasPermission = true;
          console.log("✅ Diagnóstico para paciente compartilhado");
        }
      }

      if (!hasPermission) {
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
