import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Lock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, useLocation } from "react-router-dom";
import { authSupabaseAPI } from "@/lib/auth-supabase";
import { toast } from "@/hooks/use-toast";
import Logo from "@/components/Logo";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [email, setEmail] = useState("");
  const [passwordReset, setPasswordReset] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Extrair token da URL
  const getTokenFromUrl = () => {
    const params = new URLSearchParams(location.search);
    const fragment = location.hash.substring(1);
    const fragmentParams = new URLSearchParams(fragment);

    // Tentar pegar token tanto da query string quanto do fragment
    return (
      params.get("token") ||
      fragmentParams.get("access_token") ||
      params.get("access_token") ||
      fragmentParams.get("token") ||
      ""
    );
  };

  useEffect(() => {
    const validateToken = async () => {
      const token = getTokenFromUrl();

      if (!token) {
        toast({
          variant: "destructive",
          title: "Token inválido",
          description: "Link de recuperação inválido ou expirado",
        });
        navigate("/forgot-password");
        return;
      }

      try {
        const result = await authSupabaseAPI.validateResetToken(token);
        if (result.success && result.data) {
          setIsValidToken(true);
          setEmail(result.data.email);
        }
      } catch (error: any) {
        console.error("Token validation error:", error);
        toast({
          variant: "destructive",
          title: "Token inválido",
          description:
            error.message || "Link de recuperação inválido ou expirado",
        });
        navigate("/forgot-password");
      }
    };

    validateToken();
  }, [location, navigate]);

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return "A senha deve ter pelo menos 6 caracteres";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    const passwordError = validatePassword(password);
    if (passwordError) {
      toast({
        variant: "destructive",
        title: "Senha inválida",
        description: passwordError,
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Senhas não coincidem",
        description: "A confirmação da senha deve ser igual à senha",
      });
      return;
    }

    setIsLoading(true);

    try {
      const token = getTokenFromUrl();
      await authSupabaseAPI.resetPassword(token, password);

      setPasswordReset(true);
      toast({
        title: "Senha redefinida",
        description: "Sua senha foi alterada com sucesso",
      });
    } catch (error: any) {
      console.error("Erro ao redefinir senha:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Erro ao redefinir senha",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (passwordReset) {
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
              Senha redefinida!
            </h1>

            <p className="text-brand-dark-teal mb-6">
              Sua senha foi alterada com sucesso. Agora você pode fazer login
              com sua nova senha.
            </p>

            <Button
              onClick={() => window.location.href = "https://whitex.app.br"}
              className="w-full bg-[#00B1BB] hover:bg-[#01485E] text-white"
            >
              Ir para o WhiteX
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-light via-white to-brand-light flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center">
            <div className="w-4 h-4 border-2 border-brand-teal border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-brand-dark-teal">
              Validando link de recuperação...
            </p>
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
            Redefinir senha
          </h1>
          <p className="text-brand-dark-teal">{email && `Para: ${email}`}</p>
          <p className="text-brand-dark-teal text-sm">Digite sua nova senha</p>
        </div>

        {/* Form */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl border border-gray-200 p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div>
              <Label className="text-gray-700 mb-2 block">Nova senha</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua nova senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-white border-gray-300 text-brand-primary placeholder:text-gray-400 focus:border-brand-teal focus:ring-brand-teal"
                  required
                  disabled={isLoading}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Mínimo de 6 caracteres
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <Label className="text-gray-700 mb-2 block">
                Confirmar nova senha
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirme sua nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10 bg-white border-gray-300 text-brand-primary placeholder:text-gray-400 focus:border-brand-teal focus:ring-brand-teal"
                  required
                  disabled={isLoading}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              disabled={isLoading || !password || !confirmPassword}
              className="w-full bg-[#00B1BB] hover:bg-[#01485E] text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Redefinindo...
                </div>
              ) : (
                "Redefinir senha"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
