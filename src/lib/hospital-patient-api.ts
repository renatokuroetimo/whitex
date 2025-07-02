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
      console.error("Erro ao buscar pacientes do hospital:", error);
      throw new Error("Erro ao carregar pacientes do hospital");
    }
  }
}

export const hospitalPatientAPI = new HospitalPatientAPI();
