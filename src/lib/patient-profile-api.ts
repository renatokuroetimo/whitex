import {
  PatientPersonalData,
  PatientMedicalData,
  Doctor,
  SharedData,
  PatientPersonalFormData,
  PatientMedicalFormData,
} from "./patient-profile-types";

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
    const data = this.getStoredPersonalData();
    return data.find((item) => item.userId === userId) || null;
  }

  async savePatientPersonalData(
    userId: string,
    formData: PatientPersonalFormData,
  ): Promise<PatientPersonalData> {
    await this.delay(300);

    const allData = this.getStoredPersonalData();
    const existingIndex = allData.findIndex((item) => item.userId === userId);

    if (existingIndex >= 0) {
      // Atualizar existente
      allData[existingIndex] = {
        ...allData[existingIndex],
        ...formData,
        updatedAt: new Date().toISOString(),
      };
      this.savePersonalData(allData);
      return allData[existingIndex];
    } else {
      // Criar novo
      const newData: PatientPersonalData = {
        id: this.generateId(),
        userId,
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      allData.push(newData);
      this.savePersonalData(allData);
      return newData;
    }
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

  async initializeMockDoctors(): Promise<void> {
    const doctors = this.getStoredDoctors();
    // Force reinitialize if we don't have Dr. Renato Kuroe
    const hasRenato = doctors.some(
      (d) => d.name.includes("Renato Kuroe") || d.crm === "123333",
    );
    if (doctors.length === 0 || !hasRenato) {
      const mockDoctors: Doctor[] = [
        {
          id: "doc1",
          name: "Dr. João Silva",
          crm: "123456",
          state: "SP",
          specialty: "Cardiologia",
          email: "joao.silva@email.com",
          city: "São Paulo",
          createdAt: new Date().toISOString(),
        },
        {
          id: "doc2",
          name: "Dra. Maria Santos",
          crm: "789012",
          state: "RJ",
          specialty: "Clínico Geral",
          email: "maria.santos@email.com",
          city: "Rio de Janeiro",
          createdAt: new Date().toISOString(),
        },
        {
          id: "doc3",
          name: "Dr. Pedro Costa",
          crm: "345678",
          state: "MG",
          specialty: "Endocrinologia",
          email: "pedro.costa@email.com",
          city: "Belo Horizonte",
          createdAt: new Date().toISOString(),
        },
        {
          id: "doc4",
          name: "Dra. Ana Oliveira",
          crm: "111222",
          state: "SP",
          specialty: "Ginecologia",
          email: "ana.oliveira@email.com",
          city: "São Paulo",
          createdAt: new Date().toISOString(),
        },
        {
          id: "doc5",
          name: "Dr. Carlos Mendes",
          crm: "333444",
          state: "RS",
          specialty: "Ortopedia",
          email: "carlos.mendes@email.com",
          city: "Porto Alegre",
          createdAt: new Date().toISOString(),
        },
        {
          id: "doc6",
          name: "Dr. Fernando Rodrigues",
          crm: "555666",
          state: "PR",
          specialty: "Neurologia",
          email: "fernando.rodrigues@email.com",
          city: "Curitiba",
          createdAt: new Date().toISOString(),
        },
        {
          id: "doc7",
          name: "Dra. Beatriz Lima",
          crm: "777888",
          state: "BA",
          specialty: "Pediatria",
          email: "beatriz.lima@email.com",
          city: "Salvador",
          createdAt: new Date().toISOString(),
        },
        {
          id: "doc8",
          name: "Dr. Ricardo Almeida",
          crm: "999000",
          state: "CE",
          specialty: "Dermatologia",
          email: "ricardo.almeida@email.com",
          city: "Fortaleza",
          createdAt: new Date().toISOString(),
        },
        {
          id: "doc9",
          name: "Dr. Renato Kuroe",
          crm: "123333",
          state: "SP",
          specialty: "Clínico Geral",
          email: "renato.kuroe@email.com",
          city: "São Paulo",
          createdAt: new Date().toISOString(),
        },
      ];
      this.saveDoctors(mockDoctors);
    }
  }

  async searchDoctors(query: string): Promise<Doctor[]> {
    await this.delay(300);
    await this.initializeMockDoctors();

    const doctors = this.getStoredDoctors();
    console.log("Available doctors:", doctors);

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
