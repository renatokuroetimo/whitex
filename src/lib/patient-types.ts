export interface Patient {
  id: string;
  name: string;
  age?: number;
  city?: string;
  state?: string;
  weight?: number;
  email?: string;
  status: "ativo" | "inativo" | "compartilhado";
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  doctorId: string | null;
  isShared?: boolean;
  sharedId?: string;
}

export interface Diagnosis {
  id: string;
  patientId: string;
  date: string;
  diagnosis: string;
  code: string;
  description?: string;
  createdAt: string;
  doctorId?: string;
}

export interface PatientFormData {
  name: string;
  age: number;
  city: string;
  state: string;
  weight: number;
  status: "ativo" | "inativo";
  notes?: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  healthPlan?: string;
  height?: number;
  smoker?: boolean;
  highBloodPressure?: boolean;
  physicalActivity?: boolean;
}

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}
