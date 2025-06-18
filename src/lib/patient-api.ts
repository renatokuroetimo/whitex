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

      if (!sharedData || !personalData || !users) return [];

      const shares = JSON.parse(sharedData);
      const patients = JSON.parse(personalData);
      const userList = JSON.parse(users);

      // Get active shares for this doctor
      const activeShares = shares.filter(
        (share: any) => share.doctorId === doctorId && share.isActive,
      );

      // Convert shared patients to Patient format
      const sharedPatients = activeShares
        .map((share: any) => {
          const patientData = patients.find(
            (p: any) => p.userId === share.patientId,
          );
          const userData = userList.find((u: any) => u.id === share.patientId);

          if (!patientData && !userData) return null;

          return {
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
        })
        .filter(Boolean);

      return sharedPatients;
    } catch (error) {
      console.error("Error getting shared patients:", error);
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

    // Se Supabase estiver ativo, usar Supabase
    if (isFeatureEnabled("useSupabasePatients") && supabase) {
      console.log("🚀 Buscando pacientes no Supabase");

      try {
        const { data: supabasePatients, error } = await supabase
          .from("patients")
          .select("*")
          .eq("doctor_id", doctorId);

        console.log("📊 Pacientes do Supabase:", {
          data: supabasePatients,
          error,
        });

        if (error) {
          console.error("❌ Erro ao buscar pacientes:", error);
          // Fallback para localStorage
        } else {
          // Converter dados do Supabase para formato local
          const patients = (supabasePatients || []).map(
            (p: any): Patient => ({
              id: p.id,
              name: p.name,
              age: p.age,
              city: p.city,
              state: p.state,
              weight: p.weight,
              status: p.status,
              notes: p.notes,
              doctorId: p.doctor_id,
              createdAt: p.created_at,
              updatedAt: p.updated_at,
            }),
          );

          console.log("✅ Pacientes convertidos:", patients);

          // Aplicar filtro de busca se necessário
          let filteredPatients = patients;
          if (search && search.trim()) {
            const searchLower = search.toLowerCase().trim();
            filteredPatients = patients.filter(
              (patient) =>
                patient.name.toLowerCase().includes(searchLower) ||
                (patient.city &&
                  patient.city.toLowerCase().includes(searchLower)),
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
        console.error("💥 Erro no Supabase getPatients:", supabaseError);
        // Continuar para fallback localStorage
      }
    }

    console.log("⚠️ Usando localStorage fallback");

    let patients = this.getStoredPatients().filter(
      (p) => p.doctorId === doctorId,
    );

    // Add shared patients
    const sharedPatients = this.getSharedPatients(doctorId);
    patients = [...patients, ...sharedPatients];

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
    const patients = this.getStoredPatients();
    return patients.find((p) => p.id === id) || null;
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
        console.error("💥 Erro no try/catch:", supabaseError);
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

    const patients = this.getStoredPatients();
    const index = patients.findIndex((p) => p.id === id);

    if (index === -1) return null;

    patients[index] = {
      ...patients[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    this.savePatients(patients);
    return patients[index];
  }

  // Deletar pacientes
  async deletePatients(ids: string[]): Promise<void> {
    await this.delay(300);

    const patients = this.getStoredPatients();
    const filteredPatients = patients.filter((p) => !ids.includes(p.id));
    this.savePatients(filteredPatients);

    // Também deletar diagnósticos relacionados
    const diagnoses = this.getStoredDiagnoses();
    const filteredDiagnoses = diagnoses.filter(
      (d) => !ids.includes(d.patientId),
    );
    this.saveDiagnoses(filteredDiagnoses);
  }

  // Buscar diagnósticos de um paciente
  async getPatientDiagnoses(patientId: string): Promise<Diagnosis[]> {
    await this.delay(200);
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

    const diagnoses = this.getStoredDiagnoses();
    diagnoses.push(newDiagnosis);
    this.saveDiagnoses(diagnoses);

    return newDiagnosis;
  }
}

export const patientAPI = new PatientAPI();
