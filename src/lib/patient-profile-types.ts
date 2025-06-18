export interface PatientPersonalData {
  id: string;
  userId: string;
  profileImage?: string;
  fullName: string;
  birthDate: string;
  gender: "masculino" | "feminino" | "outro";
  state: string;
  city: string;
  healthPlan?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatientMedicalData {
  id: string;
  userId: string;
  height?: number; // em cm
  weight?: number; // em kg
  smoker: boolean;
  highBloodPressure: boolean;
  physicalActivity: boolean;
  exerciseFrequency?: "nunca" | "raramente" | "semanalmente" | "diariamente";
  healthyDiet: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Doctor {
  id: string;
  name: string;
  crm: string;
  state: string; // UF do CRM
  specialty: string;
  email: string;
  city?: string;
  createdAt: string;
}

export interface SharedData {
  id: string;
  patientId: string;
  doctorId: string;
  sharedAt: string;
  isActive: boolean;
}

export interface PatientPersonalFormData {
  fullName: string;
  birthDate: string;
  gender: "masculino" | "feminino" | "outro";
  state: string;
  city: string;
  healthPlan?: string;
}

export interface PatientMedicalFormData {
  height?: number;
  weight?: number;
  smoker: boolean;
  highBloodPressure: boolean;
  physicalActivity: boolean;
  exerciseFrequency?: "nunca" | "raramente" | "semanalmente" | "diariamente";
  healthyDiet: boolean;
}
