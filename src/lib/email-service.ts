export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  private static isConfigured(): boolean {
    return true; // Webhook sempre disponível
  }

  static async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    try {
      console.log("📧 Enviando email real via webhook para:", email);

      const resetUrl = `${window.location.origin}/reset-password?token=${resetToken}`;

      // Webhook configurado especificamente para WhiteX que usa Resend
      const webhookUrl = 'https://hook.eu2.make.com/yqk4xbv7w1g2hk8lpqm3r9v5s2n4d6f8';

      const emailData = {
        api_key: 're_dzLVA7A2_7JznwHEgUDxXbzf9wz19oMmA',
        to: email,
        from: 'WhiteX <onboarding@resend.dev>',
        subject: 'WhiteX - Redefinir sua senha',
        html: this.createEmailHTML(resetUrl)
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
      });

      if (response.ok) {
        const result = await response.text();
        console.log("✅ Email enviado com sucesso via webhook:", result);
        return true;
      } else {
        console.error("❌ Erro no webhook:", response.status, response.statusText);
        return false;
      }

    } catch (error) {
      console.error("❌ Erro no serviço de email:", error);
      return false;
    }
  }

  private static createEmailHTML(resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Redefinir Senha - WhiteX</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #292759; font-size: 32px; margin: 0;">WhiteX</h1>
            <h2 style="color: #333; margin: 20px 0;">Redefinir sua senha</h2>
          </div>

          <p>Olá,</p>
          <p>Você solicitou a redefinição de sua senha no WhiteX.</p>
          <p>Clique no botão abaixo para criar uma nova senha:</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #00B1BB; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
              Redefinir Senha
            </a>
          </div>

          <p>Ou copie e cole este link no seu navegador:</p>
          <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace;">
            ${resetUrl}
          </p>

          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <strong>⏰ Importante:</strong> Este link expira em 1 hora por segurança.
          </div>

          <p>Se você não solicitou esta redefinição, pode ignorar este email com segurança.</p>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center;">
            <p>Este email foi enviado automaticamente pelo sistema WhiteX.<br>
            Por favor, não responda a este email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
