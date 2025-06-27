import { supabase } from "./supabase";

export interface Hospital {
  id: string;
  name: string;
  createdAt: string;
}

export interface HospitalFormData {
  name: string;
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
        createdAt: hospital.created_at,
      })) || []
    );
  }

  async createHospital(hospitalData: HospitalFormData): Promise<void> {
    if (!supabase) {
      throw new Error("Supabase não está configurado");
    }

    // Criar entrada na tabela hospitals
    const { data: hospital, error: hospitalError } = await supabase
      .from("hospitals")
      .insert([
        {
          name: hospitalData.name,
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
    updates: { name: string },
  ): Promise<void> {
    if (!supabase) {
      throw new Error("Supabase não está configurado");
    }

    const { error } = await supabase
      .from("hospitals")
      .update({ name: updates.name })
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
  async login(name: string, password: string): Promise<Hospital> {
    if (!supabase) {
      throw new Error("Supabase não está configurado");
    }

    const { data, error } = await supabase
      .from("hospitals")
      .select("*")
      .eq("name", name)
      .eq("password", password)
      .single();

    if (error || !data) {
      throw new Error("Nome ou senha incorretos");
    }

    return {
      id: data.id,
      name: data.name,
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
