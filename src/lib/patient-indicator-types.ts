export interface PatientIndicatorValue {
  id: string;
  patientId: string;
  indicatorId: string;
  indicatorType: "standard" | "custom"; // Para identificar se é padrão ou personalizado
  categoryName: string;
  subcategoryName: string;
  parameter: string;
  unitSymbol: string;
  value: string;
  date?: string;
  time?: string;
  visibleToMedics: boolean;
  doctorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatientIndicatorFormData {
  indicatorId: string;
  indicatorType: "standard" | "custom";
  value: string;
  date?: string;
  time?: string;
  visibleToMedics: boolean;
}
