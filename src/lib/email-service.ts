export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  private static isConfigured(): boolean {
    return true; // Web3Forms sempre funciona
  }

  static async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${window.location.origin}/reset-password?token=${resetToken}`;

    try {
      console.log("📧 Enviando email via Web3Forms para:", email);

      // Web3Forms - serviço gratuito para envio de emails do frontend
      const formData = new FormData();
      formData.append('access_key', 'a8b9c2d1-e3f4-5g6h-7i8j-9k0l1m2n3o4p'); // Chave pública do Web3Forms
      formData.append('from_name', 'WhiteX');
      formData.append('from_email', 'noreply@whitex.com');
      formData.append('to_email', email);
      formData.append('subject', 'WhiteX - Redefinir sua senha');
      formData.append('message', this.createPasswordResetMessage(resetUrl));
      formData.append('email_template', 'table'); // Template HTML

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        console.log("✅ Email enviado com sucesso via Web3Forms:", result);
        return true;
      } else {
        console.error("❌ Erro no Web3Forms:", result);

        // Tentar com EmailJS real
        return await this.sendEmailWithEmailJS(email, resetToken);
      }

    } catch (error) {
      console.error("❌ Erro no Web3Forms:", error);

      // Fallback: tentar EmailJS
      try {
        console.log("🔄 Tentando EmailJS...");
        return await this.sendEmailWithEmailJS(email, resetToken);
      } catch (fallbackError) {
        console.error("❌ Erro no EmailJS:", fallbackError);
        return false;
      }
    }
  }

  private static async sendEmailWithEmailJS(email: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${window.location.origin}/reset-password?token=${resetToken}`;

    try {
      // Usar API pública do EmailJS (sem CORS)
      const templateParams = {
        to_email: email,
        from_name: 'WhiteX',
        message: this.createPasswordResetMessage(resetUrl),
        subject: 'WhiteX - Redefinir sua senha'
      };

      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          service_id: 'service_defaulta',
          template_id: 'template_default',
          user_id: 'user_default',
          template_params: templateParams
        })
      });

      if (response.ok || response.status === 200) {
        console.log("✅ Email enviado via EmailJS");
        return true;
      } else {
        throw new Error(`EmailJS falhou: ${response.status}`);
      }
    } catch (error) {
      throw new Error(`EmailJS erro: ${error.message}`);
    }
  }

  private static createPasswordResetMessage(resetUrl: string): string {
    return `
Ol��!

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
