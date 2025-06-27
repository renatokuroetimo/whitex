import { supabase } from "./supabase";

export interface Doctor {
  id: string;
  name: string;
  email: string;
  crm: string;
  specialty: string;
  state: string;
  city: string;
  phone?: string;
  hospitalId: string;
  hospitalName?: string;
  createdAt: string;
}

export interface DoctorFormData {
  name: string;
  crm: string;
  specialty: string;
  state: string;
  city: string;
  phone: string;
  email: string;
  hospitalId: string;
  password: string;
}

class DoctorAPI {
  async createDoctor(doctorData: DoctorFormData): Promise<void> {
    if (!supabase) {
      throw new Error("Supabase não está configurado");
    }

    console.log("🔍 Dados do médico para cadastro:", doctorData);

    try {
      // Verificar se já existe usuário com este email
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("id")
        .eq("email", doctorData.email)
        .single();

      // Ignorar erro "PGRST116" que indica que nenhum registro foi encontrado
      if (checkError && checkError.code !== "PGRST116") {
        console.error("❌ Erro ao verificar email existente:", checkError);
        throw new Error("Erro ao verificar email existente");
      }

      if (existingUser) {
        throw new Error("Já existe um usuário cadastrado com este e-mail");
      }

      // Verificar se já existe médico com este CRM
      const { data: existingDoctor, error: crmCheckError } = await supabase
        .from("users")
        .select("id")
        .eq("crm", doctorData.crm)
        .eq("profession", "medico")
        .single();

      // Ignorar erro "PGRST116" que indica que nenhum registro foi encontrado
      if (crmCheckError && crmCheckError.code !== "PGRST116") {
        console.error("❌ Erro ao verificar CRM existente:", crmCheckError);
        throw new Error("Erro ao verificar CRM existente");
      }

      if (existingDoctor) {
        throw new Error("Já existe um médico cadastrado com este CRM");
      }

      // Criar médico na tabela users
      const insertData = {
        email: doctorData.email,
        password: doctorData.password,
        profession: "medico",
        full_name: doctorData.name,
        crm: doctorData.crm,
        specialty: doctorData.specialty,
        state: doctorData.state,
        city: doctorData.city,
        phone: doctorData.phone || null,
        hospital_id: doctorData.hospitalId,
      };

      console.log("📝 Dados para inserção:", insertData);

      const { data: doctor, error: doctorError } = await supabase
        .from("users")
        .insert([insertData])
        .select()
        .single();

      if (doctorError) {
        console.error("❌ Erro detalhado ao criar médico:", {
          error: doctorError,
          message: doctorError.message,
          details: doctorError.details,
          hint: doctorError.hint,
          code: doctorError.code,
        });

        // Melhorar mensagens de erro específicas
        if (doctorError.code === "23505") {
          if (doctorError.message.includes("email")) {
            throw new Error("Este e-mail já está cadastrado no sistema");
          }
          if (doctorError.message.includes("crm")) {
            throw new Error("Este CRM já está cadastrado no sistema");
          }
          throw new Error("Dados duplicados - verifique e-mail e CRM");
        }

        if (doctorError.code === "23503") {
          throw new Error(
            "Hospital não encontrado - verifique se o hospital ainda existe",
          );
        }

        if (doctorError.message.includes("hospital_id")) {
          throw new Error("Erro na vinculação com o hospital");
        }

        throw new Error(
          `Erro ao cadastrar médico: ${doctorError.message || "Erro desconhecido"}`,
        );
      }

      console.log("✅ Médico criado com sucesso:", doctor);
    } catch (error: any) {
      console.error("💥 Erro geral no cadastro de médico:", error);

      // Re-throw se já é uma mensagem de erro tratada
      if (error.message && typeof error.message === "string") {
        throw error;
      }

      // Caso contrário, criar uma mensagem genérica
      throw new Error(
        "Erro interno ao cadastrar médico. Verifique os dados e tente novamente.",
      );
    }
  }

  async getDoctorsByHospital(hospitalId: string): Promise<Doctor[]> {
    if (!supabase) {
      throw new Error("Supabase não está configurado");
    }

    const { data, error } = await supabase
      .from("users")
      .select(
        `
        id,
        full_name,
        email,
        crm,
        specialty,
        state,
        city,
        phone,
        hospital_id,
        created_at,
        hospitals (
          name
        )
      `,
      )
      .eq("profession", "medico")
      .eq("hospital_id", hospitalId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar médicos:", error);
      throw new Error("Erro ao carregar médicos");
    }

    return (
      data?.map((doctor) => ({
        id: doctor.id,
        name: doctor.full_name || "",
        email: doctor.email,
        crm: doctor.crm || "",
        specialty: doctor.specialty || "",
        state: doctor.state || "",
        city: doctor.city || "",
        phone: doctor.phone || "",
        hospitalId: doctor.hospital_id,
        hospitalName: doctor.hospitals?.name || "",
        createdAt: doctor.created_at,
      })) || []
    );
  }

  async getAllDoctors(): Promise<Doctor[]> {
    if (!supabase) {
      throw new Error("Supabase não está configurado");
    }

    const { data, error } = await supabase
      .from("users")
      .select(
        `
        id,
        full_name,
        email,
        crm,
        specialty,
        state,
        city,
        phone,
        hospital_id,
        created_at,
        hospitals (
          name
        )
      `,
      )
      .eq("profession", "medico")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar médicos:", error);
      throw new Error("Erro ao carregar médicos");
    }

    return (
      data?.map((doctor) => ({
        id: doctor.id,
        name: doctor.full_name || "",
        email: doctor.email,
        crm: doctor.crm || "",
        specialty: doctor.specialty || "",
        state: doctor.state || "",
        city: doctor.city || "",
        phone: doctor.phone || "",
        hospitalId: doctor.hospital_id,
        hospitalName: doctor.hospitals?.name || "Sem hospital",
        createdAt: doctor.created_at,
      })) || []
    );
  }

  async updateDoctor(
    doctorId: string,
    updates: Partial<DoctorFormData>,
  ): Promise<void> {
    if (!supabase) {
      throw new Error("Supabase não está configurado");
    }

    const updateData: any = {};

    if (updates.name) updateData.full_name = updates.name;
    if (updates.crm) updateData.crm = updates.crm;
    if (updates.specialty) updateData.specialty = updates.specialty;
    if (updates.state) updateData.state = updates.state;
    if (updates.city) updateData.city = updates.city;
    if (updates.phone) updateData.phone = updates.phone;
    if (updates.email) updateData.email = updates.email;

    const { error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", doctorId)
      .eq("profession", "medico");

    if (error) {
      console.error("Erro ao atualizar médico:", error);
      throw new Error("Erro ao atualizar médico");
    }
  }

  async deleteDoctor(doctorId: string): Promise<void> {
    if (!supabase) {
      throw new Error("Supabase não está configurado");
    }

    // Verificar se há pacientes vinculados a este médico
    const { data: patients, error: patientsError } = await supabase
      .from("patients")
      .select("id")
      .eq("doctor_id", doctorId);

    if (patientsError) {
      console.error("Erro ao verificar pacientes:", patientsError);
      throw new Error("Erro ao verificar pacientes vinculados");
    }

    if (patients && patients.length > 0) {
      throw new Error("Não é possível remover médico com pacientes vinculados");
    }

    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", doctorId)
      .eq("profession", "medico");

    if (error) {
      console.error("Erro ao deletar médico:", error);
      throw new Error("Erro ao remover médico");
    }
  }
}

export const doctorAPI = new DoctorAPI();
