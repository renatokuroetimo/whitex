import {
  Patient,
  Diagnosis,
  PatientFormData,
  PaginationData,
} from "./patient-types";
import { supabase } from "./supabase";
import { isFeatureEnabled } from "./feature-flags";

class PatientAPI {
  private readonly STORAGE_KEYS = {
    PATIENTS: "medical_app_patients",
    DIAGNOSES: "medical_app_diagnoses",
  };

  // Simula delay de rede
  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Gera ID único
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Pega todos os pacientes
  private getStoredPatients(): Patient[] {
    try {
      const patients = localStorage.getItem(this.STORAGE_KEYS.PATIENTS);
      return patients ? JSON.parse(patients) : [];
    } catch {
      return [];
    }
  }

  // Salva pacientes
  private savePatients(patients: Patient[]): void {
    localStorage.setItem(this.STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
  }

  // Pega diagnósticos
  private getStoredDiagnoses(): Diagnosis[] {
    try {
      const diagnoses = localStorage.getItem(this.STORAGE_KEYS.DIAGNOSES);
      return diagnoses ? JSON.parse(diagnoses) : [];
    } catch {
      return [];
    }
  }

  // Salva diagnósticos
  private saveDiagnoses(diagnoses: Diagnosis[]): void {
    localStorage.setItem(
      this.STORAGE_KEYS.DIAGNOSES,
      JSON.stringify(diagnoses),
    );
  }

  // Inicializar dados mock se não existirem
  initializeMockData(doctorId: string, forceEmpty: boolean = false): void {
    const patients = this.getStoredPatients();
    if (patients.length === 0 && !forceEmpty) {
      const mockPatients: Patient[] = [
        {
          id: "1",
          name: "Paciente 1",
          age: 45,
          city: "São Paulo",
          state: "SP",
          weight: 70.5,
          status: "ativo",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          doctorId,
        },
        {
          id: "2",
          name: "Paciente 2",
          age: 32,
          city: "Rio de Janeiro",
          state: "RJ",
          weight: 68.2,
          status: "ativo",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          doctorId,
        },
        {
          id: "3",
          name: "Paciente 3",
          age: 58,
          city: "Belo Horizonte",
          state: "MG",
          weight: 85.0,
          status: "ativo",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          doctorId,
        },
        {
          id: "4",
          name: "Paciente 4",
          age: 29,
          city: "Curitiba",
          state: "PR",
          weight: 62.8,
          status: "ativo",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          doctorId,
        },
        {
          id: "5",
          name: "Paciente 5",
          age: 41,
          city: "Porto Alegre",
          state: "RS",
          weight: 78.3,
          status: "ativo",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          doctorId,
        },
        {
          id: "6",
          name: "Paciente 6",
          age: 36,
          city: "Salvador",
          state: "BA",
          weight: 71.9,
          status: "ativo",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          doctorId,
        },
        {
          id: "7",
          name: "Paciente 7",
          age: 52,
          city: "Recife",
          state: "PE",
          weight: 88.7,
          status: "ativo",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          doctorId,
        },
        {
          id: "8",
          name: "Lenora Robison",
          age: 56,
          city: "Londrina",
          state: "PR",
          weight: 54.0,
          status: "ativo",
          notes: "Paciente precisa ficar em repouso.",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          doctorId,
        },
      ];

      this.savePatients(mockPatients);

      // Diagnósticos mock
      const mockDiagnoses: Diagnosis[] = [
        {
          id: "d1",
          patientId: "8",
          date: "01/08/2024",
          status: "Hipertensão",
          code: "I10.0",
          createdAt: new Date().toISOString(),
        },
        {
          id: "d2",
          patientId: "8",
          date: "05/03/2022",
          status: "Pré-diabetes",
          code: "R73.0",
          createdAt: new Date().toISOString(),
        },
      ];

      this.saveDiagnoses(mockDiagnoses);
    }
  }

  // Get patients who shared data with this doctor
  private getSharedPatients(doctorId: string): Patient[] {
    try {
      const sharedData = localStorage.getItem("medical_app_shared_data");
      const personalData = localStorage.getItem("medical_app_patient_personal");
      const users = localStorage.getItem("medical_app_users");

      console.log("🔍 getSharedPatients para doctorId:", doctorId);
      console.log("📊 Dados encontrados:", {
        hasSharedData: !!sharedData,
        hasPersonalData: !!personalData,
        hasUsers: !!users,
      });

      if (!sharedData || !personalData || !users) return [];

      const shares = JSON.parse(sharedData);
      const patients = JSON.parse(personalData);
      const userList = JSON.parse(users);

      console.log("📋 Todos os compartilhamentos:", shares);
      console.log("👥 Todos os usuários:", userList);

      // Get active shares for this doctor
      const activeShares = shares.filter(
        (share: any) => share.doctorId === doctorId && share.isActive,
      );

      console.log(
        "✅ Compartilhamentos ativos para este médico:",
        activeShares,
      );

      // Convert shared patients to Patient format
      const sharedPatients = activeShares
        .map((share: any) => {
          console.log("🔄 Processando compartilhamento:", share);

          const patientData = patients.find(
            (p: any) => p.userId === share.patientId,
          );
          const userData = userList.find((u: any) => u.id === share.patientId);

          console.log("📋 Dados encontrados para paciente:", {
            patientId: share.patientId,
            hasPatientData: !!patientData,
            hasUserData: !!userData,
            patientData,
            userData,
          });

          if (!patientData && !userData) {
            console.log(
              "❌ Nenhum dado encontrado para paciente:",
              share.patientId,
            );
            return null;
          }

          const patient = {
            id: share.patientId,
            name:
              patientData?.fullName ||
              userData?.email?.split("@")[0] ||
              "Paciente",
            email: userData?.email || "",
            age: patientData?.birthDate
              ? this.calculateAge(patientData.birthDate)
              : undefined,
            city: patientData?.city || "",
            state: patientData?.state || "",
            weight: undefined,
            status: "compartilhado" as const,
            doctorId: doctorId,
            createdAt: share.sharedAt,
            notes: "Dados compartilhados pelo paciente",
          };

          console.log("✅ Paciente mapeado:", patient);
          return patient;
        })
        .filter(Boolean);

      console.log(
        "🎯 Total de pacientes compartilhados:",
        sharedPatients.length,
      );

      return sharedPatients;
    } catch (error) {
      console.error(
        "Error getting shared patients:",
        JSON.stringify(
          {
            message: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
            error: error,
          },
          null,
          2,
        ),
      );
      return [];
    }
  }

  private calculateAge(birthDate: string): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  }

  // Buscar pacientes com paginação e filtro
  async getPatients(
    doctorId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<{ patients: Patient[]; pagination: PaginationData }> {
    await this.delay(300);

    console.log("🔍 getPatients chamado para doctorId:", doctorId);
    console.log("🔍 Feature flags:", {
      useSupabasePatients: isFeatureEnabled("useSupabasePatients"),
      supabaseAvailable: !!supabase,
    });

    // Se Supabase estiver ativo, usar Supabase
    if (isFeatureEnabled("useSupabasePatients") && supabase) {
      console.log("🚀 Buscando pacientes no Supabase");

      try {
        // Buscar pacientes criados pelo médico
        const { data: supabasePatients, error: patientsError } = await supabase
          .from("patients")
          .select("*")
          .eq("doctor_id", doctorId);

        console.log("📊 Pacientes criados pelo médico:", {
          data: supabasePatients,
          error: patientsError,
        });

        // Buscar pacientes compartilhados com o médico - query simplificada
        const { data: sharedData, error: sharedError } = await supabase
          .from("doctor_patient_sharing")
          .select("patient_id, shared_at")
          .eq("doctor_id", doctorId);

        console.log("🤝 Buscando compartilhamentos para doctorId:", doctorId);

        if (sharedError) {
          console.error(
            "❌ Erro na query de compartilhamentos:",
            JSON.stringify(
              {
                message: sharedError.message,
                details: sharedError.details,
                hint: sharedError.hint,
                code: sharedError.code,
              },
              null,
              2,
            ),
          );
        }

        if (sharedData && sharedData.length > 0) {
          console.log("📋 Compartilhamentos encontrados:", sharedData.length);
        }

        if (patientsError) {
          console.error(
            "❌ Erro ao buscar pacientes criados:",
            JSON.stringify(
              {
                message: patientsError.message,
                details: patientsError.details,
                hint: patientsError.hint,
                code: patientsError.code,
              },
              null,
              2,
            ),
          );
          // Fallback para localStorage
        } else {
          // Converter pacientes criados pelo médico
          let allPatients = (supabasePatients || []).map(
            (p: any): Patient => ({
              id: p.id,
              name: p.name,
              age: p.age,
              city: p.city,
              state: p.state,
              weight: p.weight,
              status: p.status || "ativo",
              notes: p.notes,
              doctorId: p.doctor_id,
              createdAt: p.created_at,
              updatedAt: p.updated_at,
            }),
          );

          // Converter pacientes compartilhados
          if (!sharedError && sharedData && sharedData.length > 0) {
            console.log("🔄 Processando pacientes compartilhados...");

            const sharedPatients = [];

            for (const share of sharedData) {
              // Buscar dados do usuário
              const { data: userData, error: userError } = await supabase
                .from("users")
                .select("id, email, full_name")
                .eq("id", share.patient_id)
                .maybeSingle();

              if (userError) {
                console.error(
                  `❌ Erro ao buscar usuário ${share.patient_id}:`,
                  userError,
                );
                continue;
              }

              if (!userData) {
                console.warn(`⚠️ Usuário ${share.patient_id} não encontrado`);
                continue;
              }

              // Buscar dados pessoais do paciente
              const { data: personalDataArray } = await supabase
                .from("patient_personal_data")
                .select("*")
                .eq("user_id", share.patient_id)
                .order("updated_at", { ascending: false })
                .limit(1);

              const personalData = personalDataArray?.[0];

              const sharedPatient: Patient = {
                id: share.patient_id,
                name:
                  personalData?.full_name ||
                  userData?.full_name ||
                  userData?.email?.split("@")[0] ||
                  "Paciente",
                email: userData?.email || "",
                age: personalData?.birth_date
                  ? this.calculateAge(personalData.birth_date)
                  : undefined,
                city: personalData?.city || "",
                state: personalData?.state || "",
                weight: undefined,
                status: "compartilhado" as const,
                doctorId: doctorId,
                createdAt: share.shared_at,
                notes: "Dados compartilhados pelo paciente",
              };

              console.log(
                `✅ Paciente compartilhado criado: ${sharedPatient.name}`,
              );
              sharedPatients.push(sharedPatient);
            }

            console.log(
              "✅ Total de pacientes compartilhados:",
              sharedPatients.length,
            );
            allPatients = [...allPatients, ...sharedPatients];
          } else {
            console.log("ℹ️ Nenhum paciente compartilhado encontrado");
          }

          console.log("✅ ===== RESULTADO FINAL =====");
          console.log(
            "✅ Pacientes criados pelo médico:",
            (supabasePatients || []).length,
          );
          console.log(
            "✅ Pacientes compartilhados:",
            allPatients.length - (supabasePatients || []).length,
          );
          console.log("✅ Total de pacientes:", allPatients.length);
          console.log(
            "✅ Lista completa:",
            allPatients.map((p) => ({
              id: p.id,
              name: p.name,
              status: p.status,
              doctorId: p.doctorId,
            })),
          );

          // Aplicar filtro de busca se necessário
          let filteredPatients = allPatients;
          if (search && search.trim()) {
            const searchLower = search.toLowerCase().trim();
            filteredPatients = allPatients.filter(
              (patient) =>
                patient.name.toLowerCase().includes(searchLower) ||
                (patient.city &&
                  patient.city.toLowerCase().includes(searchLower)) ||
                (patient.email &&
                  patient.email.toLowerCase().includes(searchLower)),
            );
          }

          // Paginação
          const totalItems = filteredPatients.length;
          const totalPages = Math.ceil(totalItems / limit);
          const startIndex = (page - 1) * limit;
          const endIndex = startIndex + limit;
          const paginatedPatients = filteredPatients.slice(
            startIndex,
            endIndex,
          );

          return {
            patients: paginatedPatients,
            pagination: {
              currentPage: page,
              totalPages,
              totalItems,
              itemsPerPage: limit,
            },
          };
        }
      } catch (supabaseError) {
        console.error(
          "💥 Erro no Supabase getPatients:",
          JSON.stringify(
            {
              message:
                supabaseError instanceof Error
                  ? supabaseError.message
                  : "Unknown error",
              stack:
                supabaseError instanceof Error
                  ? supabaseError.stack
                  : undefined,
              error: supabaseError,
            },
            null,
            2,
          ),
        );
        // Continuar para fallback localStorage
      }
    }

    console.log("⚠️ ===== USANDO LOCALSTORAGE FALLBACK =====");

    let patients = this.getStoredPatients().filter(
      (p) => p.doctorId === doctorId,
    );

    console.log("📁 Pacientes do localStorage (criados):", patients.length);

    // Add shared patients
    const sharedPatients = this.getSharedPatients(doctorId);
    console.log(
      "📁 Pacientes compartilhados (localStorage):",
      sharedPatients.length,
    );

    patients = [...patients, ...sharedPatients];

    console.log(
      "📁 Total localStorage (criados + compartilhados):",
      patients.length,
    );
    console.log(
      "📁 Lista localStorage:",
      patients.map((p) => ({
        id: p.id,
        name: p.name,
        status: p.status,
        doctorId: p.doctorId,
      })),
    );

    // Filtro de busca
    if (search && search.trim()) {
      const searchLower = search.toLowerCase().trim();
      patients = patients.filter(
        (patient) =>
          patient.name.toLowerCase().includes(searchLower) ||
          (patient.city && patient.city.toLowerCase().includes(searchLower)) ||
          (patient.email && patient.email.toLowerCase().includes(searchLower)),
      );
    }

    // Paginação
    const totalItems = patients.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPatients = patients.slice(startIndex, endIndex);

    return {
      patients: paginatedPatients,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
      },
    };
  }

  // Buscar paciente por ID
  async getPatientById(id: string): Promise<Patient | null> {
    await this.delay(200);

    console.log("🔍 getPatientById chamado para ID:", id);

    // Se Supabase estiver ativo, buscar no Supabase primeiro
    if (isFeatureEnabled("useSupabasePatients") && supabase) {
      console.log("🚀 Buscando paciente por ID no Supabase");

      try {
        const { data: supabasePatient, error } = await supabase
          .from("patients")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        console.log("📊 Resultado do Supabase:", {
          data: supabasePatient,
          error,
        });

        if (error) {
          console.error(
            "❌ Erro ao buscar paciente no Supabase:",
            JSON.stringify(
              {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code,
              },
              null,
              2,
            ),
          );
          // Continuar para localStorage fallback
        } else if (supabasePatient) {
          // Converter dados do Supabase para formato local
          const patient: Patient = {
            id: supabasePatient.id,
            name: supabasePatient.name,
            age: supabasePatient.age,
            city: supabasePatient.city,
            state: supabasePatient.state,
            weight: supabasePatient.weight,
            status: supabasePatient.status,
            notes: supabasePatient.notes,
            doctorId: supabasePatient.doctor_id,
            createdAt: supabasePatient.created_at,
            updatedAt: supabasePatient.updated_at,
          };

          console.log("✅ Paciente encontrado no Supabase:", patient);
          return patient;
        }
      } catch (supabaseError) {
        console.error(
          "💥 Erro no Supabase getPatientById:",
          JSON.stringify(
            {
              message:
                supabaseError instanceof Error
                  ? supabaseError.message
                  : "Unknown error",
              stack:
                supabaseError instanceof Error
                  ? supabaseError.stack
                  : undefined,
              error: supabaseError,
            },
            null,
            2,
          ),
        );
        // Continuar para fallback localStorage
      }
    }

    console.log("⚠️ Buscando no localStorage fallback");

    // Fallback para localStorage
    const patients = this.getStoredPatients();
    const found = patients.find((p) => p.id === id) || null;

    console.log("📋 Resultado localStorage:", found);
    return found;
  }

  // Criar paciente
  async createPatient(
    doctorId: string,
    data: PatientFormData,
  ): Promise<Patient> {
    console.log("🔥 FUNÇÃO createPatient CHAMADA!", { doctorId, data });
    await this.delay(500);

    const newPatient: Patient = {
      id: this.generateId(),
      ...data,
      doctorId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Se Supabase estiver ativo, usar Supabase
    if (isFeatureEnabled("useSupabasePatients") && supabase) {
      console.log("🚀 Criando paciente no Supabase:", newPatient);
      console.log(
        "🔧 Feature flag useSupabasePatients:",
        isFeatureEnabled("useSupabasePatients"),
      );
      console.log("🔗 Supabase client:", !!supabase);

      try {
        const insertData = {
          id: newPatient.id,
          name: newPatient.name,
          age: newPatient.age,
          city: newPatient.city,
          state: newPatient.state,
          weight: newPatient.weight,
          status: newPatient.status,
          notes: newPatient.notes,
          doctor_id: newPatient.doctorId,
          created_at: newPatient.createdAt,
          updated_at: newPatient.updatedAt,
        };

        console.log("📝 Dados sendo inseridos:", insertData);

        const { data, error } = await supabase
          .from("patients")
          .insert([insertData]);

        console.log("📊 Resposta do Supabase:", { data, error });

        if (error) {
          console.error("❌ Erro detalhado:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
          });
          throw error; // Forçar fallback
        } else {
          console.log("✅ Paciente criado no Supabase com sucesso!");
          return newPatient;
        }
      } catch (supabaseError) {
        console.error(
          "💥 Erro no try/catch:",
          JSON.stringify(
            {
              message:
                supabaseError instanceof Error
                  ? supabaseError.message
                  : "Unknown error",
              stack:
                supabaseError instanceof Error
                  ? supabaseError.stack
                  : undefined,
              error: supabaseError,
            },
            null,
            2,
          ),
        );
        // Continuar para fallback
      }
    } else {
      console.log(
        "⚠️ Supabase não ativo - useSupabasePatients:",
        isFeatureEnabled("useSupabasePatients"),
        "supabase:",
        !!supabase,
      );
    }

    // Fallback para localStorage
    const patients = this.getStoredPatients();
    patients.push(newPatient);
    this.savePatients(patients);

    return newPatient;
  }

  // Atualizar paciente
  async updatePatient(
    id: string,
    data: Partial<PatientFormData>,
  ): Promise<Patient | null> {
    await this.delay(500);

    console.log("🔄 updatePatient chamado para ID:", id);
    console.log("🔄 Dados para atualizar:", data);

    // Se Supabase estiver ativo, usar Supabase
    if (isFeatureEnabled("useSupabasePatients") && supabase) {
      console.log("🚀 Atualizando paciente no Supabase");

      try {
        // Primeiro, verificar se é um paciente próprio (na tabela patients)
        const { data: existingPatient, error: checkError } = await supabase
          .from("patients")
          .select("id, status")
          .eq("id", id)
          .maybeSingle();

        console.log("🔍 Verificando se paciente existe na tabela patients:", {
          data: existingPatient,
          error: checkError,
        });

        if (checkError && checkError.code !== "PGRST116") {
          throw checkError;
        }

        if (existingPatient) {
          // É um paciente próprio - atualizar na tabela patients
          console.log("📝 Atualizando paciente próprio");

          const updateData: any = {
            updated_at: new Date().toISOString(),
          };

          if (data.name !== undefined) updateData.name = data.name;
          if (data.age !== undefined) updateData.age = data.age;
          if (data.city !== undefined) updateData.city = data.city;
          if (data.state !== undefined) updateData.state = data.state;
          if (data.weight !== undefined) updateData.weight = data.weight;
          if (data.status !== undefined) updateData.status = data.status;
          if (data.notes !== undefined) updateData.notes = data.notes;

          console.log("📝 Dados para atualizar paciente próprio:", updateData);

          const { data: updatedPatient, error } = await supabase
            .from("patients")
            .update(updateData)
            .eq("id", id)
            .select()
            .single();

          if (error) {
            console.error("❌ Erro ao atualizar paciente próprio:", error);
            throw error;
          }

          if (updatedPatient) {
            const patient: Patient = {
              id: updatedPatient.id,
              name: updatedPatient.name,
              age: updatedPatient.age,
              city: updatedPatient.city,
              state: updatedPatient.state,
              weight: updatedPatient.weight,
              status: updatedPatient.status || "ativo",
              notes: updatedPatient.notes,
              doctorId: updatedPatient.doctor_id,
              createdAt: updatedPatient.created_at,
              updatedAt: updatedPatient.updated_at,
            };

            console.log("✅ Paciente próprio atualizado:", patient);
            return patient;
          }
        } else {
          // Verificar se é um paciente compartilhado
          console.log("🤝 Verificando se é paciente compartilhado");

          const { data: sharedCheck, error: sharedError } = await supabase
            .from("doctor_patient_sharing")
            .select("patient_id")
            .eq("patient_id", id)
            .maybeSingle();

          if (sharedError && sharedError.code !== "PGRST116") {
            throw sharedError;
          }

          if (sharedCheck) {
            console.log(
              "📝 Paciente compartilhado - salvando apenas observações",
            );

            // Para pacientes compartilhados, salvar apenas observações em uma tabela de observações médicas
            if (data.notes !== undefined) {
              // Criar ou atualizar observações médicas para este paciente compartilhado
              // Por enquanto, vamos simular que foi salvo e retornar o paciente atual
              const currentPatient = await this.getPatientById(id);
              if (currentPatient) {
                const updatedPatient: Patient = {
                  ...currentPatient,
                  notes: data.notes,
                  updatedAt: new Date().toISOString(),
                };
                console.log(
                  "✅ Observações do paciente compartilhado 'atualizadas':",
                  updatedPatient,
                );
                return updatedPatient;
              }
            } else {
              // Para pacientes compartilhados, apenas observações podem ser editadas
              console.log(
                "⚠️ Tentativa de editar dados pessoais de paciente compartilhado - ignorando",
              );
              const currentPatient = await this.getPatientById(id);
              return currentPatient;
            }
          }
        }

        console.log("❓ Paciente não encontrado no Supabase");
      } catch (supabaseError) {
        console.error(
          "💥 Erro no Supabase updatePatient:",
          JSON.stringify(
            {
              message:
                supabaseError instanceof Error
                  ? supabaseError.message
                  : "Unknown error",
              stack:
                supabaseError instanceof Error
                  ? supabaseError.stack
                  : undefined,
              error: supabaseError,
            },
            null,
            2,
          ),
        );
        // Continuar para fallback localStorage
      }
    }

    console.log("⚠️ Usando localStorage fallback para updatePatient");

    // Fallback para localStorage
    const patients = this.getStoredPatients();
    const index = patients.findIndex((p) => p.id === id);

    if (index === -1) {
      console.log("❌ Paciente não encontrado no localStorage");
      return null;
    }

    patients[index] = {
      ...patients[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    this.savePatients(patients);
    console.log("✅ Paciente atualizado no localStorage:", patients[index]);
    return patients[index];
  }

  // Buscar paciente por ID
  async getPatientById(id: string): Promise<Patient | null> {
    await this.delay(200);

    console.log("🔍 getPatientById chamado para ID:", id);

    // Se Supabase estiver ativo, usar Supabase
    if (isFeatureEnabled("useSupabasePatients") && supabase) {
      console.log("🚀 Buscando paciente no Supabase");

      try {
        // Primeiro, verificar se é um paciente criado pelo médico
        const { data: ownPatient, error: ownError } = await supabase
          .from("patients")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        console.log("📊 Paciente próprio:", {
          data: ownPatient,
          error: ownError,
        });

        if (ownError && ownError.code !== "PGRST116") {
          console.error(
            "❌ Erro ao buscar paciente próprio:",
            JSON.stringify(
              {
                message: ownError.message,
                details: ownError.details,
                hint: ownError.hint,
                code: ownError.code,
              },
              null,
              2,
            ),
          );
          throw ownError;
        }

        if (ownPatient) {
          // Converter dados do Supabase para formato local
          const patient: Patient = {
            id: ownPatient.id,
            name: ownPatient.name,
            age: ownPatient.age,
            city: ownPatient.city,
            state: ownPatient.state,
            weight: ownPatient.weight,
            status: ownPatient.status || "ativo",
            notes: ownPatient.notes,
            doctorId: ownPatient.doctor_id,
            createdAt: ownPatient.created_at,
            updatedAt: ownPatient.updated_at,
          };

          console.log("✅ Paciente próprio encontrado:", patient);
          return patient;
        }

        // Se não encontrou como paciente próprio, verificar se é compartilhado
        const { data: sharedData, error: sharedError } = await supabase
          .from("doctor_patient_sharing")
          .select("patient_id, shared_at")
          .eq("patient_id", id)
          .maybeSingle();

        console.log("🤝 Verificando compartilhamento:", {
          data: sharedData,
          error: sharedError,
        });

        if (sharedError && sharedError.code !== "PGRST116") {
          console.error(
            "❌ Erro ao verificar compartilhamento:",
            JSON.stringify(
              {
                message: sharedError.message,
                details: sharedError.details,
                hint: sharedError.hint,
                code: sharedError.code,
              },
              null,
              2,
            ),
          );
          throw sharedError;
        }

        if (sharedData) {
          // Buscar dados do usuário/paciente
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("id, email, full_name")
            .eq("id", id)
            .maybeSingle();

          if (userError && userError.code !== "PGRST116") {
            console.error("❌ Erro ao buscar dados do usuário:", userError);
            throw userError;
          }

          // Buscar dados pessoais do paciente
          const { data: personalDataArray } = await supabase
            .from("patient_personal_data")
            .select("*")
            .eq("user_id", id)
            .order("updated_at", { ascending: false })
            .limit(1);

          const personalData = personalDataArray?.[0];

          if (userData || personalData) {
            const sharedPatient: Patient = {
              id: id,
              name:
                personalData?.full_name ||
                userData?.full_name ||
                userData?.email?.split("@")[0] ||
                "Paciente",
              email: userData?.email || "",
              age: personalData?.birth_date
                ? this.calculateAge(personalData.birth_date)
                : undefined,
              city: personalData?.city || "",
              state: personalData?.state || "",
              weight: undefined,
              status: "compartilhado" as const,
              doctorId: "", // Paciente compartilhado não tem doctor específico
              createdAt: sharedData.shared_at,
              notes: "Dados compartilhados pelo paciente",
            };

            console.log("✅ Paciente compartilhado encontrado:", sharedPatient);
            return sharedPatient;
          }
        }

        console.log("❓ Paciente não encontrado no Supabase");
        // Continuar para fallback localStorage
      } catch (supabaseError) {
        console.error(
          "💥 Erro no Supabase getPatientById:",
          JSON.stringify(
            {
              message:
                supabaseError instanceof Error
                  ? supabaseError.message
                  : "Unknown error",
              stack:
                supabaseError instanceof Error
                  ? supabaseError.stack
                  : undefined,
              error: supabaseError,
            },
            null,
            2,
          ),
        );
        // Continuar para fallback localStorage
      }
    }

    console.log("⚠️ Usando localStorage fallback para getPatientById");

    // Fallback: buscar nos pacientes próprios
    const patients = this.getStoredPatients();
    let patient = patients.find((p) => p.id === id);

    if (patient) {
      console.log("📁 Paciente encontrado no localStorage (próprio):", patient);
      return patient;
    }

    // Se não encontrou nos próprios, buscar nos compartilhados
    try {
      const sharedData = localStorage.getItem("medical_app_shared_data");
      const personalData = localStorage.getItem("medical_app_patient_personal");
      const users = localStorage.getItem("medical_app_users");

      if (sharedData && personalData && users) {
        const shares = JSON.parse(sharedData);
        const patientsData = JSON.parse(personalData);
        const userList = JSON.parse(users);

        const share = shares.find((s: any) => s.patientId === id && s.isActive);

        if (share) {
          const patientData = patientsData.find((p: any) => p.userId === id);
          const userData = userList.find((u: any) => u.id === id);

          if (patientData || userData) {
            const sharedPatient: Patient = {
              id: id,
              name:
                patientData?.fullName ||
                userData?.email?.split("@")[0] ||
                "Paciente",
              email: userData?.email || "",
              age: patientData?.birthDate
                ? this.calculateAge(patientData.birthDate)
                : undefined,
              city: patientData?.city || "",
              state: patientData?.state || "",
              weight: undefined,
              status: "compartilhado" as const,
              doctorId: "",
              createdAt: share.sharedAt,
              notes: "Dados compartilhados pelo paciente",
            };

            console.log(
              "📁 Paciente compartilhado encontrado no localStorage:",
              sharedPatient,
            );
            return sharedPatient;
          }
        }
      }
    } catch (error) {
      console.error(
        "❌ Erro ao buscar paciente compartilhado no localStorage:",
        error,
      );
    }

    console.log("❌ Paciente não encontrado");
    return null;
  }

  // Buscar diagnósticos de um paciente
  async getPatientDiagnoses(patientId: string): Promise<Diagnosis[]> {
    await this.delay(200);

    console.log("🔍 getPatientDiagnoses chamado para patientId:", patientId);

    // Se Supabase estiver ativo, usar Supabase
    if (isFeatureEnabled("useSupabasePatients") && supabase) {
      console.log("🚀 Buscando diagnósticos no Supabase");

      try {
        const { data: supabaseDiagnoses, error } = await supabase
          .from("patient_diagnoses")
          .select("*")
          .eq("patient_id", patientId)
          .order("created_at", { ascending: false });

        console.log("📊 Diagnósticos do Supabase:", {
          data: supabaseDiagnoses,
          error,
        });

        if (error) {
          console.error(
            "❌ Erro ao buscar diagnósticos:",
            JSON.stringify(
              {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code,
              },
              null,
              2,
            ),
          );
          // Fallback para localStorage
        } else {
          // Converter dados do Supabase para formato local
          const diagnoses = (supabaseDiagnoses || []).map(
            (d: any): Diagnosis => ({
              id: d.id,
              patientId: d.patient_id,
              date: d.date,
              status: d.status,
              code: d.code,
              createdAt: d.created_at,
            }),
          );

          console.log("✅ Diagnósticos convertidos:", diagnoses);
          return diagnoses;
        }
      } catch (supabaseError) {
        console.error(
          "💥 Erro no Supabase getPatientDiagnoses:",
          JSON.stringify(
            {
              message:
                supabaseError instanceof Error
                  ? supabaseError.message
                  : "Unknown error",
              stack:
                supabaseError instanceof Error
                  ? supabaseError.stack
                  : undefined,
              error: supabaseError,
            },
            null,
            2,
          ),
        );
        // Continuar para fallback localStorage
      }
    }

    console.log("⚠️ Usando localStorage fallback para diagnósticos");
    const diagnoses = this.getStoredDiagnoses();
    return diagnoses.filter((d) => d.patientId === patientId);
  }

  // Método para limpar todos os dados (útil para testes)
  clearAllData(): void {
    localStorage.removeItem(this.STORAGE_KEYS.PATIENTS);
    localStorage.removeItem(this.STORAGE_KEYS.DIAGNOSES);
  }
  // Adicionar diagnóstico
  async addDiagnosis(
    patientId: string,
    diagnosis: Omit<Diagnosis, "id" | "patientId" | "createdAt">,
  ): Promise<Diagnosis> {
    await this.delay(300);

    const newDiagnosis: Diagnosis = {
      id: this.generateId(),
      patientId,
      ...diagnosis,
      createdAt: new Date().toISOString(),
    };

    console.log("🔥 CRIANDO DIAGNÓSTICO:", newDiagnosis);

    // Se Supabase estiver ativo, usar Supabase
    if (isFeatureEnabled("useSupabasePatients") && supabase) {
      console.log("🚀 Criando diagnóstico no Supabase");

      try {
        const insertData = {
          id: newDiagnosis.id,
          patient_id: newDiagnosis.patientId,
          date: newDiagnosis.date,
          status: newDiagnosis.status,
          code: newDiagnosis.code,
          created_at: newDiagnosis.createdAt,
        };

        console.log("📝 Dados do diagnóstico:", insertData);

        const { data: supabaseData, error } = await supabase
          .from("patient_diagnoses")
          .insert([insertData]);

        console.log("📊 Resposta do Supabase:", { data: supabaseData, error });

        if (error) {
          console.error(
            "❌ Erro ao criar diagnóstico:",
            JSON.stringify(
              {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code,
              },
              null,
              2,
            ),
          );
          throw error; // Forçar fallback
        } else {
          console.log("✅ Diagnóstico criado no Supabase!");
          return newDiagnosis;
        }
      } catch (supabaseError) {
        console.error(
          "💥 Erro no Supabase diagnóstico:",
          JSON.stringify(
            {
              message:
                supabaseError instanceof Error
                  ? supabaseError.message
                  : "Unknown error",
              stack:
                supabaseError instanceof Error
                  ? supabaseError.stack
                  : undefined,
              error: supabaseError,
            },
            null,
            2,
          ),
        );
        // Continuar para fallback
      }
    } else {
      console.log("⚠️ Supabase não ativo para diagnósticos");
    }

    console.log("📁 Salvando diagnóstico no localStorage");
    const diagnoses = this.getStoredDiagnoses();
    diagnoses.push(newDiagnosis);
    this.saveDiagnoses(diagnoses);

    return newDiagnosis;
  }

  // Deletar pacientes
  async deletePatients(ids: string[]): Promise<void> {
    await this.delay(300);

    console.log("🗑️ DELETANDO PACIENTES:", ids);

    // Se Supabase estiver ativo, usar Supabase
    if (isFeatureEnabled("useSupabasePatients") && supabase) {
      console.log("🚀 Deletando pacientes no Supabase");

      try {
        const { error } = await supabase
          .from("patients")
          .delete()
          .in("id", ids);

        console.log("📊 Resultado da deleção no Supabase:", { error });

        if (error) {
          console.error(
            "❌ Erro ao deletar pacientes:",
            JSON.stringify(
              {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code,
              },
              null,
              2,
            ),
          );
          throw error; // Forçar fallback
        } else {
          console.log("✅ Pacientes deletados no Supabase!");
          return;
        }
      } catch (supabaseError) {
        console.error(
          "💥 Erro no Supabase deletePatients:",
          JSON.stringify(
            {
              message:
                supabaseError instanceof Error
                  ? supabaseError.message
                  : "Unknown error",
              stack:
                supabaseError instanceof Error
                  ? supabaseError.stack
                  : undefined,
              error: supabaseError,
            },
            null,
            2,
          ),
        );
        // Continuar para fallback
      }
    } else {
      console.log("⚠️ Supabase não ativo para deleção");
    }

    console.log("📁 Deletando pacientes do localStorage");
    const patients = this.getStoredPatients();
    const updatedPatients = patients.filter((p) => !ids.includes(p.id));
    this.savePatients(updatedPatients);
  }
}

export const patientAPI = new PatientAPI();
