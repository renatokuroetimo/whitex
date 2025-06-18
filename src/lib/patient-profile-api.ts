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
        const { data: supabaseData, error } = await supabase
          .from("patient_personal_data")
          .select("*")
          .eq("user_id", userId)
          .single();

        console.log("📊 Dados pessoais do Supabase:", {
          data: supabaseData,
          error,
        });

        if (error) {
          // PGRST116 = no rows returned (normal case - user has no personal data yet)
          if (error.code === "PGRST116") {
            console.log(
              "ℹ️ Nenhum dado pessoal encontrado no Supabase para usuário:",
              userId,
            );
          } else {
            // Log other errors as actual errors
            console.error(
              "❌ Erro ao buscar dados pessoais:",
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
          }
          // Fallback para localStorage
        } else if (supabaseData) {
          // Converter dados do Supabase para formato local
          const personalData: PatientPersonalData = {
            id: supabaseData.id,
            userId: supabaseData.user_id,
            fullName: supabaseData.full_name,
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
        console.error(
          "💥 Erro no Supabase getPatientPersonalData:",
          supabaseError,
        );
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

    // Se Supabase estiver ativo, usar Supabase
    if (isFeatureEnabled("useSupabaseProfiles") && supabase) {
      console.log("🚀 Salvando dados pessoais no Supabase");

      try {
        const insertData = {
          id: resultData.id,
          user_id: resultData.userId,
          full_name: resultData.fullName,
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

        const { data: supabaseData, error } =
          existingIndex >= 0
            ? await supabase
                .from("patient_personal_data")
                .update(insertData)
                .eq("user_id", userId)
            : await supabase.from("patient_personal_data").insert([insertData]);

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
        console.error(
          "💥 Erro no Supabase dados pessoais:",
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
    const data = this.getStoredMedicalData();
    return data.find((item) => item.userId === userId) || null;
  }

  async savePatientMedicalData(
    userId: string,
    formData: PatientMedicalFormData,
  ): Promise<PatientMedicalData> {
    await this.delay(300);

    const allData = this.getStoredMedicalData();
    const existingIndex = allData.findIndex((item) => item.userId === userId);

    if (existingIndex >= 0) {
      // Atualizar existente
      allData[existingIndex] = {
        ...allData[existingIndex],
        ...formData,
        updatedAt: new Date().toISOString(),
      };
      this.saveMedicalData(allData);
      return allData[existingIndex];
    } else {
      // Criar novo
      const newData: PatientMedicalData = {
        id: this.generateId(),
        userId,
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      allData.push(newData);
      this.saveMedicalData(allData);
      return newData;
    }
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

  // Get doctors from registered users instead of mock data
  private getRegisteredDoctors(): Doctor[] {
    try {
      const users = localStorage.getItem("medical_app_users");
      const parsedUsers = users ? JSON.parse(users) : [];

      console.log("📋 Todos os usuários registrados:", parsedUsers);

      // Filter only users with profession "medico" and convert to Doctor format
      const doctorUsers = parsedUsers.filter(
        (user: any) => user.profession === "medico",
      );

      console.log("👨‍⚕️ Usuários médicos encontrados:", doctorUsers);

      return doctorUsers.map((user: any) => {
        // Generate a more realistic name if not provided
        const emailPrefix = user.email?.split("@")[0] || "medico";
        let doctorName = user.name || user.fullName;

        if (!doctorName || doctorName.trim() === "") {
          // Create a realistic name from email prefix
          const capitalizedPrefix =
            emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
          doctorName = `Dr. ${capitalizedPrefix.replace(/[0-9]/g, "")}`;
        }

        // Ensure name starts with Dr. if not already
        if (!doctorName.startsWith("Dr.") && !doctorName.startsWith("Dra.")) {
          doctorName = `Dr. ${doctorName}`;
        }

        const doctor = {
          id: user.id,
          name: doctorName,
          crm: user.crm || "123456", // Use provided CRM or default
          state: user.state || "SP",
          specialty: user.specialty || "Medicina Geral",
          email: user.email,
          city: user.city || "São Paulo",
          createdAt: user.createdAt || new Date().toISOString(),
        };

        console.log("👨‍⚕️ Médico mapeado:", doctor);
        return doctor;
      });
    } catch (error) {
      console.error("❌ Erro ao buscar médicos registrados:", error);
      return [];
    }
  }

  async loadRegisteredDoctors(): Promise<void> {
    // Get only doctors from registered users - no mocks
    const registeredDoctors = this.getRegisteredDoctors();

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
    await this.delay(300);

    const allShares = this.getStoredSharedData();
    const updatedShares = allShares.map((share) =>
      share.patientId === patientId && share.doctorId === doctorId
        ? { ...share, isActive: false }
        : share,
    );

    this.saveSharedData(updatedShares);
  }

  async getSharedDoctors(patientId: string): Promise<Doctor[]> {
    await this.delay(200);

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
