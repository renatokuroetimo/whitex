import { supabase } from "./supabase";

export interface Hospital {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface HospitalFormData {
  name: string;
  email: string;
  password: string;
}

class HospitalAPI {
  async getHospitals(): Promise<Hospital[]> {
    if (!supabase) {
      throw new Error("Supabase não está configurado");
    }

    const { data, error } = await supabase
      .from("hospitals")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar hospitais:", error);
      throw new Error("Erro ao carregar hospitais");
    }

    return (
      data?.map((hospital) => ({
        id: hospital.id,
        name: hospital.name,
        email: hospital.email,
        createdAt: hospital.created_at,
      })) || []
    );
  }

  async createHospital(hospitalData: HospitalFormData): Promise<void> {
    if (!supabase) {
      throw new Error("Supabase não está configurado");
    }

    // Verificar se já existe hospital com este email
    const { data: existingHospital, error: emailCheckError } = await supabase
      .from("hospitals")
      .select("id")
      .eq("email", hospitalData.email)
      .single();

    if (existingHospital) {
      throw new Error("Já existe um hospital cadastrado com este e-mail");
    }

    // Criar entrada na tabela hospitals
    const { data: hospital, error: hospitalError } = await supabase
      .from("hospitals")
      .insert([
        {
          name: hospitalData.name,
          email: hospitalData.email,
          password: hospitalData.password,
        },
      ])
      .select()
      .single();

    if (hospitalError) {
      console.error("Erro ao criar hospital:", hospitalError);
      throw new Error("Erro ao cadastrar hospital");
    }

    console.log("Hospital criado com sucesso:", hospital);
  }

  async updateHospital(
    hospitalId: string,
    updates: { name: string; email: string },
  ): Promise<void> {
    if (!supabase) {
      throw new Error("Supabase não está configurado");
    }

    const { error } = await supabase
      .from("hospitals")
      .update({
        name: updates.name,
        email: updates.email,
      })
      .eq("id", hospitalId);

    if (error) {
      console.error("Erro ao atualizar hospital:", error);
      throw new Error("Erro ao atualizar hospital");
    }
  }

  async deleteHospital(hospitalId: string): Promise<void> {
    if (!supabase) {
      throw new Error("Supabase não está configurado");
    }

    // Primeiro, verificar se há médicos vinculados
    const { data: doctors, error: doctorsError } = await supabase
      .from("users")
      .select("id")
      .eq("hospital_id", hospitalId)
      .eq("profession", "medico");

    if (doctorsError) {
      console.error("Erro ao verificar médicos:", doctorsError);
      throw new Error("Erro ao verificar médicos vinculados");
    }

    if (doctors && doctors.length > 0) {
      throw new Error("Não é possível remover hospital com médicos vinculados");
    }

    const { error } = await supabase
      .from("hospitals")
      .delete()
      .eq("id", hospitalId);

    if (error) {
      console.error("Erro ao deletar hospital:", error);
      throw new Error("Erro ao remover hospital");
    }
  }

  // Login para hospitais
  async login(email: string, password: string): Promise<Hospital> {
    if (!supabase) {
      throw new Error("Supabase não está configurado");
    }

    const { data, error } = await supabase
      .from("hospitals")
      .select("*")
      .eq("email", email)
      .eq("password", password)
      .single();

    if (error || !data) {
      throw new Error("Email ou senha incorretos");
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      createdAt: data.created_at,
    };
  }

  // Atualizar senha do hospital
  async updatePassword(
    hospitalId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    if (!supabase) {
      throw new Error("Supabase não está configurado");
    }

    // Verificar senha atual
    const { data: hospital, error: checkError } = await supabase
      .from("hospitals")
      .select("password")
      .eq("id", hospitalId)
      .single();

    if (checkError || !hospital) {
      throw new Error("Hospital não encontrado");
    }

    if (hospital.password !== currentPassword) {
      throw new Error("Senha atual incorreta");
    }

    // Atualizar senha
    const { error } = await supabase
      .from("hospitals")
      .update({ password: newPassword })
      .eq("id", hospitalId);

    if (error) {
      console.error("Erro ao atualizar senha:", error);
      throw new Error("Erro ao atualizar senha");
    }
  }
}

export const hospitalAPI = new HospitalAPI();
