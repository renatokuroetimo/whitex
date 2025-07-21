import React, { useState } from "react";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, Link } from "react-router-dom";
import { authSupabaseAPI } from "@/lib/auth-supabase";
import { toast } from "@/hooks/use-toast";
import Logo from "@/components/Logo";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, digite seu email",
      });
      return;
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, digite um email válido",
      });
      return;
    }

    setIsLoading(true);

    try {
      await authSupabaseAPI.requestPasswordReset(email);
      setEmailSent(true);
      toast({
        title: "✅ Email enviado",
        description:
          "Verifique sua caixa de entrada (pode demorar alguns minutos)",
      });
    } catch (error: any) {
      console.error("Erro ao solicitar reset de senha:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Erro ao enviar email de recuperação",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-light via-white to-brand-light flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-4">
            <Logo
              variant="primary"
              size="3xl"
              showText={false}
              className="justify-center"
            />
          </div>

          {/* Success Message */}
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl border border-gray-200 p-8 shadow-xl text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>

            <h1 className="text-2xl font-bold text-brand-primary mb-2">
              Email enviado!
            </h1>

            <p className="text-brand-dark-teal mb-6">
              Enviamos um link de recuperação para <strong>{email}</strong>.
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>📧 Verifique:</strong>
              </p>
              <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                <li>• Caixa de entrada</li>
                <li>• Spam/Lixo eletrônico</li>
                <li>• Pode demorar até 5 minutos</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => navigate("/login")}
                className="w-full bg-[#00B1BB] hover:bg-[#01485E] text-white"
              >
                Voltar ao Login
              </Button>

              <Button
                onClick={() => {
                  setEmailSent(false);
                  setEmail("");
                }}
                variant="outline"
                className="w-full"
              >
                Enviar novamente
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-light via-white to-brand-light flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-4">
          <Logo
            variant="primary"
            size="3xl"
            showText={false}
            className="justify-center"
          />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-primary mb-2">
            Esqueceu sua senha?
          </h1>
          <p className="text-brand-dark-teal">
            Digite seu email para receber um link de recuperação
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl border border-gray-200 p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <Label className="text-gray-700 mb-2 block">E-mail</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="Digite seu e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white border-gray-300 text-brand-primary placeholder:text-gray-400 focus:border-brand-teal focus:ring-brand-teal"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              disabled={isLoading || !email}
              className="w-full bg-[#00B1BB] hover:bg-[#01485E] text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Enviando...
                </div>
              ) : (
                "Enviar link de recuperação"
              )}
            </Button>
          </form>

          {/* Back to login */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-brand-teal hover:text-brand-dark-teal text-sm underline transition-colors inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
