import React, { useState, useEffect } from "react";
import { ArrowLeft, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContextHybrid";
import { isMobileApp } from "@/lib/mobile-utils";
import Logo from "@/components/Logo";

const Index = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register, isAuthenticated, user, logout } = useAuth();

  // Handle already authenticated users
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("🔄 Index page: User already authenticated, redirecting...", {
        email: user.email,
        profession: user.profession,
        isMobile: isMobileApp(),
      });

      // On mobile, if it's a doctor, logout instead of redirect
      if (isMobileApp() && user.profession === "medico") {
        console.log("🚫 Mobile: Doctor detected, logging out");
        logout();
        return;
      }

      // Redirect to appropriate dashboard
      if (user.profession === "paciente") {
        navigate("/patient-dashboard", { replace: true });
      } else if (user.profession === "medico" && !isMobileApp()) {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, logout]);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      if (isMobileApp()) {
        // Mobile: register directly as patient
        setIsLoading(true);
        try {
          const success = await register({
            email,
            password,
            profession: "paciente",
          });

          if (success) {
            navigate("/patient-dashboard");
          }
        } catch (error) {
          console.error("Registration error:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        // Web: store temporary data and navigate to profession selection
        sessionStorage.setItem(
          "temp_registration",
          JSON.stringify({ email, password }),
        );
        navigate("/select-profession");
      }
    }
  };

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
            Criar uma conta
          </h1>
          <p className="text-brand-dark-teal">
            Já tem uma conta?{" "}
            <Link
              to="/login"
              className="text-brand-teal hover:text-brand-dark-teal underline transition-colors"
            >
              Entre aqui
            </Link>
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl border border-gray-200 p-8 shadow-xl">
          <form onSubmit={handleCreateAccount} className="space-y-6">
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
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-white border-gray-300 text-brand-primary placeholder:text-gray-400 focus:border-brand-teal focus:ring-brand-teal"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* Create account button */}
            <Button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full bg-[#00B1BB] hover:bg-[#01485E] text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {isMobileApp() ? "Criando conta..." : "Criando uma conta"}
                </div>
              ) : isMobileApp() ? (
                "Criar conta de paciente"
              ) : (
                "Criar uma conta"
              )}
            </Button>

            {/* Terms text */}
            <p className="text-xs text-gray-500 text-center mt-4">
              Ao criar uma conta você concorda com os{" "}
              <button
                type="button"
                onClick={() => {
                  if (isMobileApp()) {
                    // Mobile: abre no navegador externo do sistema
                    window.open(
                      `${window.location.origin}/termos-whitex.pdf`,
                      "_blank",
                    );
                  } else {
                    window.open("/termos-whitex.pdf", "_blank");
                  }
                }}
                className="text-brand-teal hover:text-brand-dark-teal underline transition-colors"
              >
                Termos de Serviço
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Index;
