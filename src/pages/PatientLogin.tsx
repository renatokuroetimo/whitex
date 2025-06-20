import React, { useState } from "react";
import { ArrowLeft, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate, Link } from "react-router-dom";
import { patientAccountAPI } from "@/lib/patient-account-api";

const PatientLogin = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !email.trim()) {
      setError("Email é obrigatório");
      return;
    }

    setIsLoading(true);

    try {
      const result = await patientAccountAPI.loginPatient(email);

      if (result.success) {
        // Redirecionar para dashboard do paciente
        navigate("/patient-dashboard");
      } else {
        setError(
          result.error ||
            "Erro ao fazer login. Verifique se sua conta foi ativada.",
        );
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Erro ao fazer login. Tente novamente.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header with back arrow */}
      <div className="p-4">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Header with branding */}
      <div className="p-4 sm:p-6 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
          WhiteX
        </h1>
        <p className="text-sm text-gray-600">Área do Paciente</p>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-sm mx-auto">
          {/* Title */}
          <div className="text-center mb-8">
            <User className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-medium text-gray-900 mb-2">
              Login do Paciente
            </h2>
            <p className="text-sm text-gray-600">
              Acesse sua área pessoal para gerenciar suas informações médicas
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                E-mail
              </label>
              <Input
                id="email"
                type="email"
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-3"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Use o mesmo email cadastrado pelo seu médico
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Login button */}
            <Button
              type="submit"
              disabled={isLoading || !email}
              className="w-full h-12"
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          {/* Activation link */}
          <div className="mt-6 space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Primeira vez aqui?</p>
              <Link
                to="/patient-activation"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
              >
                Ativar Minha Conta
              </Link>
            </div>

            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Você é um médico?{" "}
                <Link to="/login" className="text-blue-600 hover:underline">
                  Clique aqui para login médico
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientLogin;
