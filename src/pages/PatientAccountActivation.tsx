import React, { useState } from "react";
import { ArrowLeft, User, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate, Link } from "react-router-dom";
import { patientAccountAPI } from "@/lib/patient-account-api";

const PatientAccountActivation = () => {
  const [step, setStep] = useState<"email" | "activate" | "success">("email");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [accountInfo, setAccountInfo] = useState<{
    patientName?: string;
    doctorName?: string;
  }>({});

  const navigate = useNavigate();

  const handleEmailValidation = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const validation = await patientAccountAPI.validatePatientAccount(email);

      if (!validation.exists) {
        setError(
          "Não foi encontrada uma conta criada para este email. Verifique com seu médico se o cadastro foi realizado corretamente.",
        );
        return;
      }

      if (!validation.isPending) {
        setError(
          "Esta conta já foi ativada. Você pode fazer login normalmente.",
        );
        return;
      }

      // Conta encontrada e pendente
      setAccountInfo({
        patientName: validation.patientName,
        doctorName: validation.doctorName,
      });
      setStep("activate");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Erro ao verificar conta. Tente novamente.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountActivation = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validações do lado cliente
    if (!newPassword || newPassword.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("As senhas não conferem");
      return;
    }

    setIsLoading(true);

    try {
      const result = await patientAccountAPI.activatePatientAccount({
        email,
        newPassword,
        confirmPassword,
      });

      if (result.success) {
        setStep("success");
      } else {
        setError(result.error || "Erro ao ativar conta");
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Erro ao ativar conta. Tente novamente.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToLogin = () => {
    navigate("/patient-login");
  };

  const handleBack = () => {
    if (step === "activate") {
      setStep("email");
      setError("");
    } else {
      navigate("/");
    }
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
        <p className="text-sm text-gray-600">Ativação de Conta - Paciente</p>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-md mx-auto">
          {/* Step 1: Email Validation */}
          {step === "email" && (
            <>
              <div className="text-center mb-8">
                <User className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h2 className="text-2xl font-medium text-gray-900 mb-2">
                  Ativar Minha Conta
                </h2>
                <p className="text-sm text-gray-600">
                  Insira o email usado pelo seu médico para criar sua conta
                </p>
              </div>

              <form onSubmit={handleEmailValidation} className="space-y-4">
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
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full h-12"
                >
                  {isLoading ? "Verificando..." : "Verificar Conta"}
                </Button>
              </form>
            </>
          )}

          {/* Step 2: Password Creation */}
          {step === "activate" && (
            <>
              <div className="text-center mb-8">
                <Lock className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-medium text-gray-900 mb-2">
                  Definir Senha
                </h2>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <strong>Olá, {accountInfo.patientName}!</strong>
                  </p>
                  <p>
                    Sua conta foi criada por{" "}
                    <strong>{accountInfo.doctorName}</strong>
                  </p>
                  <p>Defina uma senha para acessar sua conta</p>
                </div>
              </div>

              <form onSubmit={handleAccountActivation} className="space-y-4">
                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Nova Senha
                  </label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full h-12 px-3 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Confirmar Senha
                  </label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Digite a senha novamente"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full h-12 px-3 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  disabled={isLoading || !newPassword || !confirmPassword}
                  className="w-full h-12"
                >
                  {isLoading ? "Ativando..." : "Ativar Conta"}
                </Button>
              </form>
            </>
          )}

          {/* Step 3: Success */}
          {step === "success" && (
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-medium text-gray-900">
                  Conta Ativada!
                </h2>
                <p className="text-gray-600">
                  Sua conta foi ativada com sucesso. Agora você pode fazer login
                  e gerenciar suas informações médicas.
                </p>
              </div>

              <div className="space-y-3">
                <Button onClick={handleGoToLogin} className="w-full h-12">
                  Fazer Login
                </Button>
                <Link
                  to="/"
                  className="block text-center text-sm text-gray-500 hover:text-gray-700"
                >
                  Voltar à página inicial
                </Link>
              </div>
            </div>
          )}

          {/* Bottom link */}
          {step !== "success" && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Já tem uma conta ativa?{" "}
                <Link
                  to="/patient-login"
                  className="text-blue-600 hover:underline"
                >
                  Fazer login
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientAccountActivation;
