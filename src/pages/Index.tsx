import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate, Link } from "react-router-dom";

const Index = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

      {/* Header with WhiteX branding */}
      <div className="p-4 sm:p-6 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-8">
          WhiteX
        </h1>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-sm mx-auto min-h-[400px] flex flex-col justify-center">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-medium text-gray-900 mb-2">
              Criar uma conta
            </h1>
            <p className="text-sm text-gray-600">
              Já tem uma conta?{" "}
              <Link to="/login" className="text-brand-blue hover:underline">
                Entre aqui
              </Link>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleCreateAccount} className="space-y-4">
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
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                required
              />
            </div>

            {/* Password field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Senha
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                required
                minLength={6}
              />
            </div>

            {/* Create account button */}
            <Button
              type="submit"
              disabled={!email || !password}
              className="w-full h-12 bg-brand-blue hover:bg-blue-600 text-white font-medium rounded-md transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Criar uma conta
            </Button>

            {/* Terms text */}
            <p className="text-xs text-gray-500 text-center mt-4">
              Ao criar uma conta você concorda com os{" "}
              <button className="text-brand-blue hover:underline">
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
