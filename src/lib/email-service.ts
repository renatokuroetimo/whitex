import emailjs from '@emailjs/browser';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  // Configuração pública do EmailJS - pode ser exposta no frontend
  private static readonly emailjsConfig = {
    serviceId: 'service_whitex',
    templateId: 'template_password_reset',
    publicKey: 'user_WhiteXRecovery2024'
  };

  private static isConfigured(): boolean {
    // EmailJS não precisa de configuração secreta no frontend
    return true;
  }

  static async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${window.location.origin}/reset-password?token=${resetToken}`;

    try {
      console.log("📧 Enviando email via EmailJS para:", email);

      // Inicializar EmailJS
      emailjs.init(this.emailjsConfig.publicKey);

      const templateParams = {
        to_email: email,
        subject: 'WhiteX - Redefinir sua senha',
        reset_url: resetUrl,
        reset_token: resetToken,
        app_name: 'WhiteX',
        user_email: email
      };

      const result = await emailjs.send(
        this.emailjsConfig.serviceId,
        this.emailjsConfig.templateId,
        templateParams
      );

      if (result.status === 200) {
        console.log("✅ Email enviado com sucesso via EmailJS:", result);
        return true;
      } else {
        console.error("❌ Erro no EmailJS:", result);
        return false;
      }

    } catch (error) {
      console.error("❌ Erro no EmailJS:", error);

      // Fallback: tentar com configuração alternativa
      try {
        console.log("🔄 Tentando configuração alternativa do EmailJS...");
        return await this.sendEmailWithFallback(email, resetToken);
      } catch (fallbackError) {
        console.error("❌ Erro no fallback:", fallbackError);
        return false;
      }
    }
  }

  private static async sendEmailWithFallback(email: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${window.location.origin}/reset-password?token=${resetToken}`;

    // Configuração alternativa do EmailJS
    const fallbackConfig = {
      serviceId: 'service_g8j4k2m',
      templateId: 'template_reset_pwd',
      publicKey: 'user_123456789'
    };

    emailjs.init(fallbackConfig.publicKey);

    const templateParams = {
      to_email: email,
      message: `Clique no link para redefinir sua senha: ${resetUrl}`,
      subject: 'WhiteX - Redefinir senha',
      from_name: 'WhiteX',
      reply_to: 'noreply@whitex.com'
    };

    const result = await emailjs.send(
      fallbackConfig.serviceId,
      fallbackConfig.templateId,
      templateParams
    );

    if (result.status === 200) {
      console.log("✅ Email enviado com configuração alternativa:", result);
      return true;
    } else {
      throw new Error(`EmailJS fallback failed: ${result.text}`);
    }
  }

  private static createPasswordResetTemplate(resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Redefinir Senha - WhiteX</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
          }
          .container {
            background-color: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            color: #292759;
            margin-bottom: 10px;
          }
          .button {
            display: inline-block;
            background-color: #00B1BB;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #666;
            text-align: center;
          }
          .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">WhiteX</div>
            <h1>Redefinir sua senha</h1>
          </div>
          
          <p>Olá,</p>
          
          <p>Você solicitou a redefinição de sua senha no WhiteX. Clique no botão abaixo para criar uma nova senha:</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Redefinir Senha</a>
          </div>
          
          <p>Ou copie e cole este link no seu navegador:</p>
          <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace;">
            ${resetUrl}
          </p>
          
          <div class="warning">
            <strong>⏰ Importante:</strong> Este link expira em 1 hora por segurança.
          </div>
          
          <p>Se você não solicitou esta redefinição, pode ignorar este email com segurança.</p>
          
          <div class="footer">
            <p>Este email foi enviado automaticamente pelo sistema WhiteX.<br>
            Por favor, não responda a este email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
