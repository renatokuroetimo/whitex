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
  doctorId: string;
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
}

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}
