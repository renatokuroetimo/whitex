import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, resetToken, resetUrl } = await req.json()
    
    // Inicializar Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY não configurada')
    }

    const emailData = {
      from: 'WhiteX <onboarding@resend.dev>',
      to: email,
      subject: 'WhiteX - Redefinir sua senha',
      html: createPasswordResetTemplate(resetUrl)
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Resend API error: ${error}`)
    }

    const result = await response.json()
    
    return new Response(
      JSON.stringify({ success: true, data: result }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Erro ao enviar email:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 400
      }
    )
  }
})

function createPasswordResetTemplate(resetUrl: string): string {
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
