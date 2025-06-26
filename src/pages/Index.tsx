import React, { useState } from "react";
import { ArrowLeft, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, Link } from "react-router-dom";

const Index = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      // Store temporary data and navigate to profession selection
      sessionStorage.setItem(
        "temp_registration",
        JSON.stringify({ email, password }),
      );
      navigate("/select-profession");
    }
  };

  const handleBack = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Criar uma conta
          </h1>
          <p className="text-slate-300">
            Já tem uma conta?{" "}
            <Link
              to="/login"
              className="text-purple-400 hover:text-purple-300 underline transition-colors"
            >
              Entre aqui
            </Link>
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-2xl">
          <form onSubmit={handleCreateAccount} className="space-y-6">
            {/* Email */}
            <div>
              <Label className="text-white mb-2 block">E-mail</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="Digite seu e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-purple-400 focus:ring-purple-400"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <Label className="text-white mb-2 block">Senha</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-purple-400 focus:ring-purple-400"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-400 hover:text-white transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-400 hover:text-white transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* Create account button */}
            <Button
              type="submit"
              disabled={!email || !password}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              Criar uma conta
            </Button>

            {/* Terms text */}
            <p className="text-xs text-slate-400 text-center mt-4">
              Ao criar uma conta você concorda com os{" "}
              <button className="text-purple-400 hover:text-purple-300 underline transition-colors">
                Termos de Serviço
              </button>
            </p>
          </form>
        </div>

        {/* Back to Login */}
        <div className="text-center mt-6">
          <button
            onClick={handleBack}
            className="text-slate-300 hover:text-white text-sm underline transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Index;
