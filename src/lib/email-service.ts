export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  private static isConfigured(): boolean {
    return false; // Mantém link direto até configuração de backend
  }

  static async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    console.log("📧 Sistema de recuperação configurado para:", email);
    console.log("🔗 Token de reset:", resetToken);

    const resetUrl = `${window.location.origin}/reset-password?token=${resetToken}`;

    // Para demonstração, vou mostrar como seria o email:
    console.log("📄 Conteúdo do email que seria enviado:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Para:", email);
    console.log("Assunto: WhiteX - Redefinir sua senha");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Olá,");
    console.log("");
    console.log("Você solicitou a redefinição de sua senha no WhiteX.");
    console.log("Clique no link abaixo para criar uma nova senha:");
    console.log("");
    console.log("🔗", resetUrl);
    console.log("");
    console.log("⏰ Este link expira em 1 hora por segurança.");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 1000));

    return false; // Retorna false para mostrar link direto na UI
  }
}
