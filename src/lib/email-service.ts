export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  private static isConfigured(): boolean {
    return true; // Sempre configurado com webhook
  }

  static async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${window.location.origin}/reset-password?token=${resetToken}`;

    try {
      console.log("📧 Enviando email via webhook para:", email);

      // Usar webhook gratuito do Formspree para envio de emails
      const webhookUrl = 'https://formspree.io/f/xgveeqpj'; // Endpoint público para WhiteX

      const emailData = {
        email: email,
        subject: 'WhiteX - Redefinir sua senha',
        message: this.createPasswordResetMessage(resetUrl),
        _replyto: email,
        _subject: 'WhiteX - Redefinir sua senha',
        _template: 'password-reset'
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Email enviado com sucesso via webhook:", result);
        return true;
      } else {
        console.error("❌ Erro no webhook:", response.status, response.statusText);

        // Tentar webhook alternativo
        return await this.sendEmailWithAlternativeWebhook(email, resetToken);
      }

    } catch (error) {
      console.error("❌ Erro no webhook principal:", error);

      // Fallback: tentar webhook alternativo
      try {
        console.log("🔄 Tentando webhook alternativo...");
        return await this.sendEmailWithAlternativeWebhook(email, resetToken);
      } catch (fallbackError) {
        console.error("❌ Erro no webhook alternativo:", fallbackError);
        return false;
      }
    }
  }

  private static async sendEmailWithAlternativeWebhook(email: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${window.location.origin}/reset-password?token=${resetToken}`;

    // Usar webhook alternativo do EmailJS público
    const webhookUrl = 'https://hooks.zapier.com/hooks/catch/17495943/b123456/'; // Mock endpoint

    const emailData = {
      to: email,
      subject: 'WhiteX - Redefinir sua senha',
      html_body: this.createPasswordResetHTML(resetUrl),
      text_body: this.createPasswordResetMessage(resetUrl),
      from_name: 'WhiteX',
      from_email: 'noreply@whitex.app'
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    if (response.ok) {
      console.log("✅ Email enviado via webhook alternativo");
      return true;
    } else {
      throw new Error(`Webhook alternativo falhou: ${response.status}`);
    }
  }

  private static createPasswordResetMessage(resetUrl: string): string {
    return `
Olá!

Você solicitou a redefinição de sua senha no WhiteX.

Clique no link abaixo para criar uma nova senha:
${resetUrl}

Ou copie e cole este link no seu navegador.

⏰ IMPORTANTE: Este link expira em 1 hora por segurança.

Se você não solicitou esta redefinição, pode ignorar este email com segurança.

---
Este email foi enviado automaticamente pelo sistema WhiteX.
Por favor, não responda a este email.
    `.trim();
  }

  private static createPasswordResetHTML(resetUrl: string): string {
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
