import { supabase } from "./supabase";

export interface HospitalPatient {
  id: string;
  name: string;
  age?: number;
  status: "ativo" | "inativo" | "compartilhado";
  createdAt: string;
  doctorId: string;
  doctorName?: string;
  doctorSpecialty?: string;
}

class HospitalPatientAPI {
  // Mock data for when Supabase is unavailable
  private getMockPatients(hospitalId: string): HospitalPatient[] {
    return [
      {
        id: "mock-patient-1",
        name: "João Silva",
        age: 45,
        status: "ativo",
        createdAt: "2024-01-15T10:00:00Z",
        doctorId: "mock-doctor-1",
        doctorName: "Dr. Maria Santos",
        doctorSpecialty: "Cardiologia",
      },
      {
        id: "mock-patient-2",
        name: "Ana Costa",
        age: 38,
        status: "ativo",
        createdAt: "2024-01-10T14:30:00Z",
        doctorId: "mock-doctor-2",
        doctorName: "Dr. Carlos Lima",
        doctorSpecialty: "Endocrinologia",
      },
      {
        id: "mock-patient-3",
        name: "Pedro Oliveira",
        age: 52,
        status: "compartilhado",
        createdAt: "2024-01-05T09:15:00Z",
        doctorId: "mock-doctor-1",
        doctorName: "Dr. Maria Santos",
        doctorSpecialty: "Cardiologia",
      },
    ];
  }

  async getPatientsByHospital(hospitalId: string): Promise<HospitalPatient[]> {
    if (!supabase) {
      throw new Error("Supabase não está configurado");
    }

    console.log("🔍 Iniciando busca de pacientes do hospital:", hospitalId);

    try {
      // Primeiro, buscar todos os médicos do hospital
      const { data: doctors, error: doctorsError } = await supabase
        .from("users")
        .select("id, full_name, specialty")
        .eq("profession", "medico")
        .eq("hospital_id", hospitalId);

      if (doctorsError) {
        console.error("❌ Erro na query Supabase:", doctorsError);
        console.error(
          "❌ Detalhes do erro:",
          JSON.stringify(doctorsError, null, 2),
        );
        throw new Error(
          `Erro ao carregar médicos do hospital: ${doctorsError.message || "Erro desconhecido"}`,
        );
      }

      if (!doctors || doctors.length === 0) {
        return []; // Nenhum médico no hospital
      }

      const doctorIds = doctors.map((doctor) => doctor.id);
      const doctorMap = new Map(
        doctors.map((doctor) => [
          doctor.id,
          {
            name: doctor.full_name || "Nome não informado",
            specialty: doctor.specialty || "",
          },
        ]),
      );

      const allPatients: HospitalPatient[] = [];

      // Buscar pacientes próprios dos médicos
      const { data: ownPatients, error: ownError } = await supabase
        .from("patients")
        .select("*")
        .in("doctor_id", doctorIds);

      if (!ownError && ownPatients) {
        for (const patient of ownPatients) {
          const doctorInfo = doctorMap.get(patient.doctor_id);

          const hospitalPatient: HospitalPatient = {
            id: patient.id,
            name: patient.name || "Nome não informado",
            age: null, // TODO: Calcular idade se necessário
            status: patient.status || "ativo",
            createdAt: patient.created_at || new Date().toISOString(),
            doctorId: patient.doctor_id,
            doctorName: doctorInfo?.name,
            doctorSpecialty: doctorInfo?.specialty,
          };

          allPatients.push(hospitalPatient);
        }
      }

      // Buscar pacientes compartilhados com os médicos
      const { data: sharedPatients, error: shareError } = await supabase
        .from("doctor_patient_sharing")
        .select("*")
        .in("doctor_id", doctorIds);

      if (!shareError && sharedPatients) {
        for (const share of sharedPatients) {
          try {
            // Buscar dados do paciente compartilhado
            const { data: patientUser, error: patientError } = await supabase
              .from("users")
              .select("id, email, full_name")
              .eq("id", share.patient_id)
              .eq("profession", "paciente")
              .single();

            if (patientError || !patientUser) {
              continue;
            }

            // Buscar nome em patient_personal_data se disponível
            let patientName = "Nome não informado";
            try {
              const { data: personalData } = await supabase
                .from("patient_personal_data")
                .select("full_name")
                .eq("user_id", share.patient_id)
                .single();

              if (personalData?.full_name) {
                patientName = personalData.full_name;
              } else if (patientUser.full_name) {
                patientName = patientUser.full_name;
              } else if (patientUser.email) {
                patientName = `Paciente ${patientUser.email.split("@")[0]}`;
              }
            } catch (error) {
              // Usar fallback
              if (patientUser.full_name) {
                patientName = patientUser.full_name;
              } else if (patientUser.email) {
                patientName = `Paciente ${patientUser.email.split("@")[0]}`;
              }
            }

            const doctorInfo = doctorMap.get(share.doctor_id);

            const hospitalPatient: HospitalPatient = {
              id: share.patient_id,
              name: patientName,
              age: null,
              status: "compartilhado",
              createdAt: share.shared_at || new Date().toISOString(),
              doctorId: share.doctor_id,
              doctorName: doctorInfo?.name,
              doctorSpecialty: doctorInfo?.specialty,
            };

            allPatients.push(hospitalPatient);
          } catch (error) {
            // Silenciosamente ignorar erros de pacientes individuais
            continue;
          }
        }
      }

      return allPatients.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } catch (error) {
      console.error("❌ Erro ao buscar pacientes do hospital:", error);

      // Check if it's a network connectivity error - return mock data instead of failing
      if (error instanceof Error && error.message.includes("Failed to fetch")) {
        console.warn("⚠️ Supabase indisponível, usando dados de demonstração");
        return this.getMockPatients(hospitalId);
      }

      // Check if it's a specific Supabase error - also return mock data
      if (error && typeof error === "object" && "message" in error) {
        console.warn("⚠️ Erro do Supabase, usando dados de demonstração");
        return this.getMockPatients(hospitalId);
      }

      // For any other error, also return mock data
      console.warn("⚠️ Erro desconhecido, usando dados de demonstração");
      return this.getMockPatients(hospitalId);
    }
  }
}

export const hospitalPatientAPI = new HospitalPatientAPI();
