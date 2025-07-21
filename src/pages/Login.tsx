import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContextHybrid";
import { toast } from "@/hooks/use-toast";
import { isMobileApp } from "@/lib/mobile-utils";
import Logo from "@/components/Logo";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login, logout, isLoading, isAuthenticated, user } = useAuth();

  // Redirect already authenticated users
  useEffect(() => {
    if (isAuthenticated && user && !isLoading) {
      console.log("🔄 Login page: User already authenticated, redirecting...", {
        email: user.email,
        profession: user.profession,
        isMobile: isMobileApp(),
      });

      if (user.profession === "paciente") {
        navigate("/patient-dashboard", { replace: true });
      } else if (user.profession === "medico" && !isMobileApp()) {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [isAuthenticated, user, isLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      return;
    }

    // Check if it's a doctor trying to login on mobile before attempting login
    if (isMobileApp()) {
      // First do a pre-check by attempting to find the user in localStorage
      try {
        const storedUsers = JSON.parse(
          localStorage.getItem("medical_app_users") || "[]",
        );
        const existingUser = storedUsers.find(
          (u: any) => u.email === email.toLowerCase(),
        );

        if (existingUser && existingUser.profession === "medico") {
          toast({
            variant: "destructive",
            title: "Acesso Restrito",
            description:
              "Este aplicativo é exclusivo para pacientes. Médicos devem acessar através da versão web.",
          });
          return;
        }
      } catch (error) {
        console.log("Could not pre-check user profession");
      }
    }

    const success = await login({ email, password });
    if (success) {
      // Additional check for mobile after successful login
      if (isMobileApp()) {
        const currentUser = JSON.parse(
          localStorage.getItem("medical_app_current_user") || "{}",
        );
        if (currentUser.profession === "medico") {
          console.log("🚫 Doctor detected after login on mobile - logging out");
          await logout();
          toast({
            variant: "destructive",
            title: "Acesso Restrito",
            description: "Este aplicativo é exclusivo para pacientes.",
          });
          return;
        }
      }

      navigate("/dashboard");
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
            Fazer login
          </h1>
          <p className="text-brand-dark-teal">
            Não tem uma conta?{" "}
            <Link
              to="/"
              className="text-brand-teal hover:text-brand-dark-teal underline transition-colors"
            >
              Criar conta
            </Link>
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl border border-gray-200 p-8 shadow-xl">
          <form onSubmit={handleLogin} className="space-y-6">
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

            {/* Login button */}
            <Button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full bg-[#00B1BB] hover:bg-[#01485E] text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Entrando...
                </div>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          {/* Forgot password link */}
          <div className="mt-6 text-center">
            <button className="text-brand-teal hover:text-brand-dark-teal text-sm underline transition-colors">
              Esqueceu sua senha?
            </button>
          </div>
        </div>


      </div>
    </div>
  );
};

export default Login;
