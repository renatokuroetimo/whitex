// Backend Node.js para envio de emails
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();

// Configurar CORS
app.use(
  cors({
    origin:
      "https://833e787f10e948cdbd860feb88237398-69bbc4c149874c3f98caa7fe5.fly.dev",
  }),
);

app.use(express.json());

// Endpoint para envio de email
app.post("/send-reset-email", async (req, res) => {
  try {
    const { email, resetToken } = req.body;

    const resetUrl = `https://833e787f10e948cdbd860feb88237398-69bbc4c149874c3f98caa7fe5.fly.dev/reset-password?token=${resetToken}`;

    // Enviar via Resend
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer re_dzLVA7A2_7JznwHEgUDxXbzf9wz19oMmA",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "WhiteX <onboarding@resend.dev>",
        to: email,
        subject: "WhiteX - Redefinir sua senha",
        html: `
          <h1>WhiteX - Redefinir sua senha</h1>
          <p>Clique no link para redefinir sua senha:</p>
          <a href="${resetUrl}" style="background: #00B1BB; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px;">
            Redefinir Senha
          </a>
          <p>Ou copie este link: ${resetUrl}</p>
          <p>⏰ Este link expira em 1 hora.</p>
        `,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      res.json({ success: true, emailId: result.id });
    } else {
      throw new Error("Erro no Resend");
    }
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.listen(3001, () => {
  console.log("Backend rodando na porta 3001");
});
