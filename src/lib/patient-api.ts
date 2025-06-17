import {
  Patient,
  Diagnosis,
  PatientFormData,
  PaginationData,
} from "./patient-types";

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

  // Buscar pacientes com paginação e filtro
  async getPatients(
    doctorId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<{ patients: Patient[]; pagination: PaginationData }> {
    await this.delay(300);

    let patients = this.getStoredPatients().filter(
      (p) => p.doctorId === doctorId,
    );

    // Filtro de busca
    if (search && search.trim()) {
      const searchLower = search.toLowerCase().trim();
      patients = patients.filter(
        (patient) =>
          patient.name.toLowerCase().includes(searchLower) ||
          patient.city.toLowerCase().includes(searchLower),
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
    await this.delay(500);

    const newPatient: Patient = {
      id: this.generateId(),
      ...data,
      doctorId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

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
    return diagnoses.filter((d) => !ids.includes(d.patientId));
    this.saveDiagnoses(filteredDiagnoses);
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
