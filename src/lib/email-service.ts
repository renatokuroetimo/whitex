export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  private static isConfigured(): boolean {
    // Para demonstração, sempre retorna false para mostrar o link direto
    // Em produção, seria implementado um backend real para envio de emails
    return false;
  }

  static async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    console.log("📧 Sistema de recuperação de senha ativado para:", email);
    console.log("🔗 Token gerado:", resetToken);

    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 500));

    // Para aplicações frontend, o envio real de emails deve ser feito via:
    // 1. API backend própria
    // 2. Supabase Edge Functions
    // 3. Vercel/Netlify Functions
    // 4. AWS SES, SendGrid, etc.

    console.log("ℹ️ Em produção, aqui seria feita a chamada para API backend");
    console.log("ℹ️ Por enquanto, fornecendo link direto para o usuário");

    return false; // Sempre retorna false para mostrar link direto
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
