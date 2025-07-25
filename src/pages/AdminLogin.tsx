import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Shield, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminAPI } from "@/lib/admin-api";
import { toast } from "@/hooks/use-toast";
import Logo from "@/components/Logo";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Verificar se já está autenticado
  useEffect(() => {
    if (adminAPI.isAuthenticated()) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Email é obrigatório",
      });
      return;
    }

    if (!formData.password.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Senha é obrigatória",
      });
      return;
    }

    setIsLoading(true);

    try {
      await adminAPI.login({
        email: formData.email.trim(),
        password: formData.password,
      });

      toast({
        title: "Sucesso",
        description: "Login realizado com sucesso",
      });

      navigate("/admin/dashboard", { replace: true });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro no Login",
        description: error.message || "Credenciais inválidas",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-light via-white to-brand-light flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Logo
            variant="primary"
            size="xl"
            showText={false}
            className="justify-center"
          />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-primary mb-2">
            Acesso Administrativo
          </h1>
          <p className="text-brand-dark-teal">
            Faça login para gerenciar indicadores padrão
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl border border-gray-200 p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <Label className="text-gray-700 mb-2 block">Email</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Digite seu email administrativo"
                  className="pl-10 bg-white border-gray-300 text-brand-primary placeholder:text-gray-400 focus:border-brand-teal focus:ring-brand-teal"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <Label className="text-gray-700 mb-2 block">Senha</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  placeholder="Digite sua senha"
                  className="pl-10 pr-10 bg-white border-gray-300 text-brand-primary placeholder:text-gray-400 focus:border-brand-teal focus:ring-brand-teal"
                  disabled={isLoading}
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
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#00B1BB] hover:bg-[#01485E] text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Entrando...
                </div>
              ) : (
                "Entrar como Administrador"
              )}
            </Button>
          </form>

          {/* Forgot password link */}
          <div className="mt-6 text-center">
            <Link
              to="/forgot-password"
              className="text-brand-teal hover:text-brand-dark-teal text-sm underline transition-colors"
            >
              Esqueceu sua senha?
            </Link>
          </div>

          {/* Footer */}
          <div className="mt-4 text-center">
            <p className="text-gray-500 text-sm">
              Área restrita para administradores do sistema
            </p>
          </div>
        </div>

        {/* Back to Main */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/")}
            className="text-brand-dark-teal hover:text-brand-primary text-sm underline transition-colors"
          >
            ← Voltar ao site principal
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
