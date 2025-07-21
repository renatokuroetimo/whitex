import { supabase } from './supabase';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  private static isConfigured(): boolean {
    return !!supabase;
  }

  static async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    if (!this.isConfigured()) {
      console.warn("⚠️ Supabase não configurado");
      return false;
    }

    try {
      console.log("📧 Enviando email via Supabase Edge Function para:", email);

      const resetUrl = `${window.location.origin}/reset-password?token=${resetToken}`;

      const { data, error } = await supabase.functions.invoke('send-reset-email', {
        body: {
          email,
          resetToken,
          resetUrl,
          apiKey: 're_dzLVA7A2_7JznwHEgUDxXbzf9wz19oMmA'
        }
      });

      if (error) {
        console.error("❌ Erro na Edge Function:", error);
        return false;
      }

      if (data && data.success) {
        console.log("✅ Email enviado com sucesso! ID:", data.emailId);
        return true;
      } else {
        console.error("❌ Falha no envio:", data);
        return false;
      }

    } catch (error) {
      console.error("❌ Erro no serviço de email:", error);
      return false;
    }
  }
}
