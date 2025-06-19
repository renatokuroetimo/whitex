import {
  PatientPersonalData,
  PatientMedicalData,
  Doctor,
  SharedData,
  PatientPersonalFormData,
  PatientMedicalFormData,
} from "./patient-profile-types";
import { supabase } from "./supabase";
import { isFeatureEnabled } from "./feature-flags";

class PatientProfileAPI {
  private readonly STORAGE_KEYS = {
    PERSONAL_DATA: "medical_app_patient_personal",
    MEDICAL_DATA: "medical_app_patient_medical",
    DOCTORS: "medical_app_doctors",
    SHARED_DATA: "medical_app_shared_data",
  };

  // Simula delay de rede
  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Gera ID único
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // === DADOS PESSOAIS ===
  private getStoredPersonalData(): PatientPersonalData[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.PERSONAL_DATA);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private savePersonalData(data: PatientPersonalData[]): void {
    localStorage.setItem(this.STORAGE_KEYS.PERSONAL_DATA, JSON.stringify(data));
  }

  async getPatientPersonalData(
    userId: string,
  ): Promise<PatientPersonalData | null> {
    await this.delay(200);

    console.log("🔍 getPatientPersonalData chamado para userId:", userId);

    // Se Supabase estiver ativo, usar Supabase
    if (isFeatureEnabled("useSupabaseProfiles") && supabase) {
      console.log("🚀 Buscando dados pessoais no Supabase");

      try {
        // Buscar múltiplos registros e pegar o mais recente
        const { data: supabaseDataArray, error } = await supabase
          .from("patient_personal_data")
          .select("*")
          .eq("user_id", userId)
          .order("updated_at", { ascending: false })
          .limit(1);

        console.log("📊 Dados pessoais do Supabase:", {
          data: supabaseDataArray,
          error,
          count: supabaseDataArray?.length,
        });

        if (error) {
          console.error(
            "❌ Erro ao buscar dados pessoais no Supabase:",
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
        } else if (supabaseDataArray && supabaseDataArray.length > 0) {
          // Pegar o primeiro registro (mais recente)
          const supabaseData = supabaseDataArray[0];

          console.log("✅ Usando registro mais recente:", supabaseData);
          // Converter dados do Supabase para formato local
          const personalData: PatientPersonalData = {
            id: supabaseData.id,
            userId: supabaseData.user_id,
            fullName: supabaseData.full_name,
            email: supabaseData.email,
            birthDate: supabaseData.birth_date,
            gender: supabaseData.gender,
            state: supabaseData.state,
            city: supabaseData.city,
            healthPlan: supabaseData.health_plan,
            profileImage: supabaseData.profile_image,
            createdAt: supabaseData.created_at,
            updatedAt: supabaseData.updated_at,
          };

          console.log("✅ Dados pessoais convertidos:", personalData);
          return personalData;
        } else {
          console.log("📝 Dados pessoais não encontrados no Supabase");
          return null;
        }
      } catch (supabaseError) {
        console.error("💥 Erro no Supabase getPatientPersonalData:", {
          message:
            supabaseError instanceof Error
              ? supabaseError.message
              : "Unknown error",
          name: supabaseError instanceof Error ? supabaseError.name : "Unknown",
          stack:
            supabaseError instanceof Error
              ? supabaseError.stack?.split("\n")[0]
              : undefined,
        });
        // Continuar para fallback localStorage
      }
    }

    console.log("⚠️ Usando localStorage para dados pessoais");
    const data = this.getStoredPersonalData();
    return data.find((item) => item.userId === userId) || null;
  }

  async savePatientPersonalData(
    userId: string,
    formData: PatientPersonalFormData,
  ): Promise<PatientPersonalData> {
    await this.delay(300);

    console.log("🔥 SALVANDO DADOS PESSOAIS:", { userId, formData });

    // Verificações de debug
    console.log(
      "🔍 Feature Flag useSupabaseProfiles:",
      isFeatureEnabled("useSupabaseProfiles"),
    );
    console.log("🔍 Supabase disponível:", !!supabase);

    const allData = this.getStoredPersonalData();
    const existingIndex = allData.findIndex((item) => item.userId === userId);

    let resultData: PatientPersonalData;

    if (existingIndex >= 0) {
      // Atualizar existente
      resultData = {
        ...allData[existingIndex],
        ...formData,
        updatedAt: new Date().toISOString(),
      };
    } else {
      // Criar novo
      resultData = {
        id: this.generateId(),
        userId,
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    console.log("📝 Dados que serão salvos:", resultData);

    // Se Supabase estiver ativo, usar Supabase
    if (isFeatureEnabled("useSupabaseProfiles") && supabase) {
      console.log("🚀 Salvando dados pessoais no Supabase");

      try {
        const insertData = {
          id: resultData.id,
          user_id: resultData.userId,
          full_name: resultData.fullName,
          email: resultData.email,
          birth_date: resultData.birthDate,
          gender: resultData.gender,
          state: resultData.state,
          city: resultData.city,
          health_plan: resultData.healthPlan,
          profile_image: resultData.profileImage,
          created_at: resultData.createdAt,
          updated_at: resultData.updatedAt,
        };

        console.log("📝 Dados pessoais para Supabase:", insertData);

        // Primeiro, deletar registros existentes para evitar duplicações
        await supabase
          .from("patient_personal_data")
          .delete()
          .eq("user_id", userId);

        console.log("🗑️ Registros antigos removidos");

        // Inserir novo registro
        const { data: supabaseData, error } = await supabase
          .from("patient_personal_data")
          .insert([insertData])
          .select()
          .single();

        console.log("📊 Resposta Supabase dados pessoais:", {
          data: supabaseData,
          error,
        });

        if (error) {
          console.error(
            "❌ Erro ao salvar dados pessoais:",
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
          console.log("✅ Dados pessoais salvos no Supabase!");
          return resultData;
        }
      } catch (supabaseError) {
        console.error("💥 Erro no Supabase dados pessoais:", {
          message:
            supabaseError instanceof Error
              ? supabaseError.message
              : "Unknown error",
          name: supabaseError instanceof Error ? supabaseError.name : "Unknown",
          stack:
            supabaseError instanceof Error
              ? supabaseError.stack?.split("\n")[0]
              : undefined,
        });
        // Continuar para fallback
      }
    } else {
      console.log("⚠️ Supabase perfis não ativo");
    }

    console.log("📁 Salvando dados pessoais no localStorage");
    if (existingIndex >= 0) {
      allData[existingIndex] = resultData;
    } else {
      allData.push(resultData);
    }
    this.savePersonalData(allData);
    return resultData;
  }

  // === DADOS MÉDICOS ===
  private getStoredMedicalData(): PatientMedicalData[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.MEDICAL_DATA);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveMedicalData(data: PatientMedicalData[]): void {
    localStorage.setItem(this.STORAGE_KEYS.MEDICAL_DATA, JSON.stringify(data));
  }

  async getPatientMedicalData(
    userId: string,
  ): Promise<PatientMedicalData | null> {
    await this.delay(200);

    console.log("🔍 getPatientMedicalData chamado para userId:", userId);

    // Se Supabase estiver ativo, usar Supabase
    if (isFeatureEnabled("useSupabaseProfiles") && supabase) {
      console.log("🚀 Buscando dados médicos no Supabase");

      try {
        // Buscar múltiplos registros e pegar o mais recente
        const { data: supabaseDataArray, error } = await supabase
          .from("patient_medical_data")
          .select("*")
          .eq("user_id", userId)
          .order("updated_at", { ascending: false })
          .limit(1);

        console.log("📊 Dados médicos do Supabase:", {
          data: supabaseDataArray,
          error,
          count: supabaseDataArray?.length,
        });

        if (error) {
          console.error(
            "❌ Erro ao buscar dados médicos no Supabase:",
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
        } else if (supabaseDataArray && supabaseDataArray.length > 0) {
          // Pegar o primeiro registro (mais recente)
          const supabaseData = supabaseDataArray[0];

          console.log("✅ Usando registro médico mais recente:", supabaseData);
          // Converter dados do Supabase para formato local
          const medicalData: PatientMedicalData = {
            id: supabaseData.id,
            userId: supabaseData.user_id,
            height: supabaseData.height,
            weight: supabaseData.weight
              ? parseFloat(supabaseData.weight)
              : undefined,
            smoker: supabaseData.smoker || false,
            highBloodPressure: supabaseData.high_blood_pressure || false,
            physicalActivity: supabaseData.physical_activity || false,
            exerciseFrequency: supabaseData.exercise_frequency,
            healthyDiet: supabaseData.healthy_diet || false,
            createdAt: supabaseData.created_at,
            updatedAt: supabaseData.updated_at,
          };

          console.log("✅ Dados médicos convertidos:", medicalData);
          return medicalData;
        } else {
          console.log("📝 Dados médicos não encontrados no Supabase");
          return null;
        }
      } catch (supabaseError) {
        console.error("💥 Erro no Supabase getPatientMedicalData:", {
          message:
            supabaseError instanceof Error
              ? supabaseError.message
              : "Unknown error",
          name: supabaseError instanceof Error ? supabaseError.name : "Unknown",
          stack:
            supabaseError instanceof Error
              ? supabaseError.stack?.split("\n")[0]
              : undefined,
        });
        // Continuar para fallback localStorage
      }
    }

    console.log("⚠️ Usando localStorage para dados médicos");
    const data = this.getStoredMedicalData();
    return data.find((item) => item.userId === userId) || null;
  }

  async savePatientMedicalData(
    userId: string,
    formData: PatientMedicalFormData,
  ): Promise<PatientMedicalData> {
    await this.delay(300);

    console.log("🔥 SALVANDO DADOS MÉDICOS:", { userId, formData });

    const allData = this.getStoredMedicalData();
    const existingIndex = allData.findIndex((item) => item.userId === userId);

    let resultData: PatientMedicalData;

    if (existingIndex >= 0) {
      // Atualizar existente
      resultData = {
        ...allData[existingIndex],
        ...formData,
        updatedAt: new Date().toISOString(),
      };
    } else {
      // Criar novo
      resultData = {
        id: this.generateId(),
        userId,
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    // Se Supabase estiver ativo, usar Supabase
    if (isFeatureEnabled("useSupabaseProfiles") && supabase) {
      console.log("🚀 Salvando dados médicos no Supabase");

      try {
        const insertData = {
          id: resultData.id,
          user_id: resultData.userId,
          height: resultData.height,
          weight: resultData.weight,
          smoker: resultData.smoker,
          high_blood_pressure: resultData.highBloodPressure,
          physical_activity: resultData.physicalActivity,
          exercise_frequency: resultData.exerciseFrequency,
          healthy_diet: resultData.healthyDiet,
          created_at: resultData.createdAt,
          updated_at: resultData.updatedAt,
        };

        console.log("📝 Dados médicos para Supabase:", insertData);

        // Primeiro, deletar registros existentes para evitar duplicações
        await supabase
          .from("patient_medical_data")
          .delete()
          .eq("user_id", userId);

        console.log("🗑️ Registros médicos antigos removidos");

        // Inserir novo registro
        const { data: supabaseData, error } = await supabase
          .from("patient_medical_data")
          .insert([insertData])
          .select()
          .single();

        console.log("📊 Resposta Supabase dados médicos:", {
          data: supabaseData,
          error,
        });

        if (error) {
          console.error(
            "❌ Erro ao salvar dados médicos:",
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
          console.log("✅ Dados médicos salvos no Supabase!");
          return resultData;
        }
      } catch (supabaseError) {
        console.error("💥 Erro no Supabase dados médicos:", {
          message:
            supabaseError instanceof Error
              ? supabaseError.message
              : "Unknown error",
          name: supabaseError instanceof Error ? supabaseError.name : "Unknown",
          stack:
            supabaseError instanceof Error
              ? supabaseError.stack?.split("\n")[0]
              : undefined,
        });
        // Continuar para fallback
      }
    } else {
      console.log("⚠️ Supabase perfis não ativo");
    }

    console.log("📁 Salvando dados médicos no localStorage");
    if (existingIndex >= 0) {
      allData[existingIndex] = resultData;
    } else {
      allData.push(resultData);
    }
    this.saveMedicalData(allData);
    return resultData;
  }

  // === MÉDICOS ===
  private getStoredDoctors(): Doctor[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.DOCTORS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveDoctors(doctors: Doctor[]): void {
    localStorage.setItem(this.STORAGE_KEYS.DOCTORS, JSON.stringify(doctors));
  }

  // Get doctors from registered users baseado na estrutura real
  private async getRegisteredDoctors(): Promise<Doctor[]> {
    console.log("🔍 Buscando médicos registrados baseado na estrutura real...");

    // Try Supabase first if feature is enabled
    if (isFeatureEnabled("useSupabaseProfiles") && supabase) {
      console.log("🚀 Buscando médicos no Supabase");

      try {
        // USAR A ESTRUTURA REAL DA TABELA USERS (COM CAMPO full_name)
        const { data: supabaseUsers, error } = await supabase
          .from("users")
          .select(
            `
            id,
            email,
            profession,
            full_name,
            crm,
            specialty,
            state,
            city,
            phone,
            created_at
          `,
          )
          .eq("profession", "medico");

        console.log("📊 Médicos do Supabase:", {
          data: supabaseUsers,
          error,
          total: supabaseUsers?.length || 0,
        });

        if (error) {
          console.error(
            "❌ Erro ao buscar médicos no Supabase:",
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
          // Continue to localStorage fallback
        } else {
          const doctors = (supabaseUsers || []).map((user: any) =>
            this.mapUserToDoctor(user, "supabase"),
          );
          console.log("✅ Médicos convertidos do Supabase:", doctors);
          return doctors;
        }
      } catch (supabaseError) {
        console.error("💥 Erro no Supabase getRegisteredDoctors:", {
          message:
            supabaseError instanceof Error
              ? supabaseError.message
              : "Unknown error",
          name: supabaseError instanceof Error ? supabaseError.name : "Unknown",
        });
        // Continue to localStorage fallback
      }
    }

    console.log("⚠️ Usando localStorage fallback para médicos");

    try {
      const users = localStorage.getItem("medical_app_users");
      const parsedUsers = users ? JSON.parse(users) : [];

      console.log(
        "📋 Todos os usuários registrados (localStorage):",
        parsedUsers,
      );

      // Filter only users with profession "medico" and convert to Doctor format
      const doctorUsers = parsedUsers.filter(
        (user: any) => user.profession === "medico",
      );

      console.log(
        "👨‍⚕️ Usuários médicos encontrados (localStorage):",
        doctorUsers,
      );

      return doctorUsers.map((user: any) =>
        this.mapUserToDoctor(user, "localStorage"),
      );
    } catch (error) {
      console.error("❌ Erro ao buscar médicos registrados:", error);
      return [];
    }
  }

  // Helper function corrigido para mapear baseado na estrutura real (CAMPO full_name)
  private mapUserToDoctor(
    user: any,
    source: "supabase" | "localStorage",
  ): Doctor {
    // Usar campo full_name da tabela public.users
    let doctorName = "Sem nome definido";

    if (user.full_name && user.full_name.trim()) {
      doctorName = user.full_name.trim();
      console.log(`✅ Usando full_name: "${doctorName}"`);
    } else if (user.fullName && user.fullName.trim()) {
      // Fallback para localStorage
      doctorName = user.fullName.trim();
      console.log(`✅ Usando fullName (localStorage): "${doctorName}"`);
    } else if (user.email) {
      doctorName = `Dr. ${user.email.split("@")[0]}`;
      console.log(`⚠️ Usando email como fallback: "${doctorName}"`);
    }

    console.log(`🔍 Dados originais do usuário médico (${source}):`, {
      id: user.id,
      full_name: user.full_name,
      fullName: user.fullName,
      crm: user.crm,
      state: user.state,
      email: user.email,
      city: user.city,
      specialty: user.specialty,
    });

    const doctor = {
      id: user.id,
      name: doctorName,
      crm: user.crm || "123456",
      state: user.state || "",
      specialty: user.specialty || "",
      email: user.email,
      city: user.city || "",
      createdAt: user.createdAt || user.created_at || new Date().toISOString(),
    };

    console.log(`👨‍⚕️ Médico mapeado (${source}):`, doctor);
    return doctor;
  }

  async loadRegisteredDoctors(): Promise<void> {
    // Get only doctors from registered users - no mocks
    const registeredDoctors = await this.getRegisteredDoctors();

    // Always update with latest registered doctors
    this.saveDoctors(registeredDoctors);

    console.log("Loaded registered doctors:", registeredDoctors);
  }

  async searchDoctors(query: string): Promise<Doctor[]> {
    await this.delay(300);
    // Always refresh with latest registered users only
    await this.loadRegisteredDoctors();

    const doctors = this.getStoredDoctors();
    console.log("Available registered doctors:", doctors);

    const searchTerm = query.toLowerCase().trim();

    if (!searchTerm) return doctors;

    const filteredDoctors = doctors.filter((doctor) => {
      const nameMatch = doctor.name.toLowerCase().includes(searchTerm);
      const crmMatch = doctor.crm.includes(searchTerm);
      const crmStateMatch = `${doctor.crm}-${doctor.state}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const specialtyMatch = doctor.specialty
        .toLowerCase()
        .includes(searchTerm);
      const stateMatch = doctor.state
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const cityMatch = doctor.city?.toLowerCase().includes(searchTerm);

      // Split search term by spaces to match individual words
      const searchWords = searchTerm.split(" ");
      const nameWordsMatch = searchWords.every((word) =>
        doctor.name.toLowerCase().includes(word),
      );

      return (
        nameMatch ||
        crmMatch ||
        crmStateMatch ||
        specialtyMatch ||
        stateMatch ||
        cityMatch ||
        nameWordsMatch
      );
    });

    console.log(`Search for "${query}" returned:`, filteredDoctors);
    return filteredDoctors;
  }

  // === COMPARTILHAMENTO ===
  private getStoredSharedData(): SharedData[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.SHARED_DATA);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveSharedData(data: SharedData[]): void {
    localStorage.setItem(this.STORAGE_KEYS.SHARED_DATA, JSON.stringify(data));
  }

  async shareDataWithDoctor(
    patientId: string,
    doctorId: string,
  ): Promise<SharedData> {
    await this.delay(300);

    console.log("🤝 COMPARTILHANDO DADOS - VERSÃO CORRIGIDA:", {
      patientId,
      doctorId,
    });

    // Se Supabase estiver ativo, usar Supabase
    if (isFeatureEnabled("useSupabaseProfiles") && supabase) {
      console.log("🚀 Criando compartilhamento no Supabase");

      try {
        // Verificar se já existe compartilhamento
        const { data: existingShare, error: checkError } = await supabase
          .from("doctor_patient_sharing")
          .select("*")
          .eq("doctor_id", doctorId)
          .eq("patient_id", patientId)
          .maybeSingle();

        console.log("📊 Verificação de compartilhamento existente:", {
          data: existingShare,
          error: checkError,
        });

        if (existingShare) {
          // Converter dados do Supabase para formato local
          const sharedData: SharedData = {
            id: existingShare.id,
            patientId: existingShare.patient_id,
            doctorId: existingShare.doctor_id,
            sharedAt: existingShare.shared_at,
            isActive: true,
          };
          console.log("✅ Compartilhamento já existe:", sharedData);
          return sharedData;
        }

        // Criar novo compartilhamento
        const newShare = {
          doctor_id: doctorId,
          patient_id: patientId,
          shared_at: new Date().toISOString(),
        };

        console.log("📝 Criando novo compartilhamento:", newShare);

        const { data: supabaseData, error } = await supabase
          .from("doctor_patient_sharing")
          .insert([newShare])
          .select()
          .single();

        console.log("📊 Resultado do compartilhamento:", {
          data: supabaseData,
          error,
        });

        if (error) {
          console.error(
            "❌ Erro ao criar compartilhamento:",
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
          console.log("✅ Compartilhamento criado no Supabase!");
          const sharedData: SharedData = {
            id: supabaseData.id,
            patientId: supabaseData.patient_id,
            doctorId: supabaseData.doctor_id,
            sharedAt: supabaseData.shared_at,
            isActive: true,
          };
          return sharedData;
        }
      } catch (supabaseError) {
        console.error("💥 Erro no Supabase shareDataWithDoctor:", {
          message:
            supabaseError instanceof Error
              ? supabaseError.message
              : "Unknown error",
          name: supabaseError instanceof Error ? supabaseError.name : "Unknown",
          stack:
            supabaseError instanceof Error
              ? supabaseError.stack?.split("\n")[0]
              : undefined,
        });
        // Continuar para fallback
      }
    } else {
      console.log("⚠️ Supabase perfis não ativo");
    }

    console.log("📁 Usando localStorage para compartilhamento");
    const allShares = this.getStoredSharedData();

    // Verificar se já existe compartilhamento ativo
    const existingShare = allShares.find(
      (share) =>
        share.patientId === patientId &&
        share.doctorId === doctorId &&
        share.isActive,
    );

    if (existingShare) {
      return existingShare;
    }

    const newShare: SharedData = {
      id: this.generateId(),
      patientId,
      doctorId,
      sharedAt: new Date().toISOString(),
      isActive: true,
    };

    allShares.push(newShare);
    this.saveSharedData(allShares);
    return newShare;
  }

  async stopSharingWithDoctor(
    patientId: string,
    doctorId: string,
  ): Promise<void> {
    console.log("🗑️ stopSharingWithDoctor - VERSÃO CORRIGIDA:", {
      patientId,
      doctorId,
    });

    await this.delay(300);

    if (isFeatureEnabled("useSupabaseProfiles") && supabase) {
      console.log("🚀 Usando Supabase para remover compartilhamento");

      try {
        // Deletar o compartilhamento do banco
        const { error } = await supabase
          .from("doctor_patient_sharing")
          .delete()
          .eq("patient_id", patientId)
          .eq("doctor_id", doctorId);

        if (error) {
          console.error("❌ Erro ao deletar compartilhamento:", error);
          throw new Error(`Erro ao remover compartilhamento: ${error.message}`);
        }

        console.log("✅ Compartilhamento removido com sucesso do banco");
        return;
      } catch (error) {
        console.error("💥 Erro crítico ao remover compartilhamento:", error);
        throw error;
      }
    } else {
      console.log("⚠️ Supabase não ativo, usando localStorage");
    }

    // Fallback para localStorage
    const allShares = this.getStoredSharedData();
    const updatedShares = allShares.map((share) =>
      share.patientId === patientId && share.doctorId === doctorId
        ? { ...share, isActive: false }
        : share,
    );

    this.saveSharedData(updatedShares);
  }

  async getSharedDoctors(patientId: string): Promise<Doctor[]> {
    console.log(
      "🔍 getSharedDoctors - VERSÃO CORRIGIDA para paciente:",
      patientId,
    );

    await this.delay(200);

    if (isFeatureEnabled("useSupabaseProfiles") && supabase) {
      console.log("🚀 Usando Supabase para buscar médicos compartilhados");

      try {
        // Buscar compartilhamentos do paciente
        const { data: shares, error: sharesError } = await supabase
          .from("doctor_patient_sharing")
          .select("*")
          .eq("patient_id", patientId);

        console.log("📊 Compartilhamentos encontrados:", {
          total: shares?.length || 0,
          error: sharesError?.message || "nenhum",
          data: shares,
        });

        if (sharesError) {
          console.error("❌ Erro ao buscar compartilhamentos:", sharesError);
          return [];
        }

        if (!shares || shares.length === 0) {
          console.log("📝 Nenhum compartilhamento encontrado");
          return [];
        }

        // Para cada compartilhamento, buscar dados do médico usando a estrutura real
        const doctors: Doctor[] = [];

        for (const share of shares) {
          try {
            // USAR ESTRUTURA REAL DA TABELA public.users (COM CAMPO full_name)
            const { data: doctorUser, error: doctorError } = await supabase
              .from("users")
              .select(
                `
                id,
                email,
                profession,
                full_name,
                crm,
                specialty,
                state,
                city,
                phone,
                created_at
              `,
              )
              .eq("id", share.doctor_id)
              .eq("profession", "medico")
              .single();

            if (doctorError) {
              console.warn(
                `⚠️ Erro ao buscar médico ${share.doctor_id}:`,
                doctorError,
              );
              continue;
            }

            if (doctorUser) {
              console.log(
                `🔍 DEBUG - Dados brutos do médico no getSharedDoctors:`,
                doctorUser,
              );
              console.log(`📧 Email do médico:`, doctorUser.email);
              console.log(`👤 Campo full_name:`, doctorUser.full_name);

              // Usar campo full_name da tabela public.users
              let doctorName = "Sem nome definido";

              if (doctorUser.full_name && doctorUser.full_name.trim()) {
                doctorName = doctorUser.full_name.trim();
                console.log(
                  `✅ Usando full_name da tabela users: "${doctorName}"`,
                );
              } else if (doctorUser.email) {
                doctorName = `Dr. ${doctorUser.email.split("@")[0]}`;
                console.log(`⚠️ Usando email como fallback: "${doctorName}"`);
              } else {
                console.log(
                  `⚠️ Nenhum nome disponível, usando: "${doctorName}"`,
                );
              }

              doctors.push({
                id: doctorUser.id,
                name: doctorName,
                crm: doctorUser.crm || "N/A",
                state: doctorUser.state || "N/A",
                specialty: doctorUser.specialty || "Clínico Geral",
                email: doctorUser.email,
                city: doctorUser.city,
                createdAt: doctorUser.created_at || new Date().toISOString(),
              });

              console.log(
                `✅ Médico final adicionado na lista: "${doctorName}"`,
              );
            }
          } catch (error) {
            console.warn(
              `⚠️ Erro ao processar médico ${share.doctor_id}:`,
              error,
            );
          }
        }

        console.log(`✅ Total de médicos compartilhados: ${doctors.length}`);
        return doctors;
      } catch (error) {
        console.error(
          "💥 Erro crítico ao buscar médicos compartilhados:",
          error,
        );
        console.log("🔄 Fallback para localStorage");
      }
    } else {
      console.log("⚠️ Supabase não ativo, usando localStorage");
    }

    // Fallback para localStorage
    const shares = this.getStoredSharedData();
    const doctors = this.getStoredDoctors();

    const activeShares = shares.filter(
      (share) => share.patientId === patientId && share.isActive,
    );

    return doctors.filter((doctor) =>
      activeShares.some((share) => share.doctorId === doctor.id),
    );
  }

  // Limpar dados dos médicos
  clearDoctorsData(): void {
    localStorage.removeItem(this.STORAGE_KEYS.DOCTORS);
  }

  // Limpar todos os dados
  clearAllData(): void {
    localStorage.removeItem(this.STORAGE_KEYS.PERSONAL_DATA);
    localStorage.removeItem(this.STORAGE_KEYS.MEDICAL_DATA);
    localStorage.removeItem(this.STORAGE_KEYS.DOCTORS);
    localStorage.removeItem(this.STORAGE_KEYS.SHARED_DATA);
  }
}

export const patientProfileAPI = new PatientProfileAPI();
