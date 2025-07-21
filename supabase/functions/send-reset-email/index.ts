import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, resetToken } = await req.json()
    
    const resendApiKey = 're_dzLVA7A2_7JznwHEgUDxXbzf9wz19oMmA'
    const resetUrl = `https://833e787f10e948cdbd860feb88237398-69bbc4c149874c3f98caa7fe5.fly.dev/reset-password?token=${resetToken}`

    const emailData = {
      from: 'WhiteX <onboarding@resend.dev>',
      to: email,
      subject: 'WhiteX - Redefinir sua senha',
      html: `
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
      `
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
      JSON.stringify({ success: true, emailId: result.id }),
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
