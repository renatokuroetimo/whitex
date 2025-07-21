// Vercel Function para envio de emails
// Arquivo: api/send-email.js

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', 'https://833e787f10e948cdbd860feb88237398-69bbc4c149874c3f98caa7fe5.fly.dev');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, resetToken } = req.body;
    
    const resetUrl = `https://833e787f10e948cdbd860feb88237398-69bbc4c149874c3f98caa7fe5.fly.dev/reset-password?token=${resetToken}`;
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer re_dzLVA7A2_7JznwHEgUDxXbzf9wz19oMmA',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'WhiteX <onboarding@resend.dev>',
        to: email,
        subject: 'WhiteX - Redefinir sua senha',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #292759;">WhiteX</h1>
            <h2>Redefinir sua senha</h2>
            <p>Você solicitou a redefinição de sua senha.</p>
            <a href="${resetUrl}" style="background-color: #00B1BB; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
              Redefinir Senha
            </a>
            <p>Ou copie este link: <br><code>${resetUrl}</code></p>
            <p><strong>⏰ Este link expira em 1 hora.</strong></p>
          </div>
        `
      })
    });

    if (response.ok) {
      const result = await response.json();
      res.json({ success: true, emailId: result.id });
    } else {
      const error = await response.text();
      throw new Error(`Resend error: ${error}`);
    }
    
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
}
