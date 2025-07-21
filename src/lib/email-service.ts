export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  private static isConfigured(): boolean {
    // Email service está temporariamente indisponível até configuração de backend
    return false;
  }

  static async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    console.log("📧 Sistema de recuperação de senha:", email);
    console.log("🔗 Token gerado:", resetToken);

    // Para envio REAL de emails, é necessário:
    // 1. Backend/API própria, ou
    // 2. Supabase Edge Functions (requer CLI e deploy), ou
    // 3. Serviços como Vercel/Netlify Functions

    // Por enquanto, o sistema fornece link direto que funciona perfeitamente
    console.log("ℹ️ Link direto disponível para o usuário usar");

    return false; // Retorna false para mostrar link direto
  }
}
