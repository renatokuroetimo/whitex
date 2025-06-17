export interface Patient {
  id: string;
  name: string;
  age: number;
  city: string;
  state: string;
  weight: number;
  status: "ativo" | "inativo";
  notes?: string;
  createdAt: string;
  updatedAt: string;
  doctorId: string;
}

export interface Diagnosis {
  id: string;
  patientId: string;
  date: string;
  status: "Hipertensão" | "Pré-diabetes" | "Diabetes" | "Normal" | "Obesidade";
  code: string;
  description?: string;
  createdAt: string;
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
