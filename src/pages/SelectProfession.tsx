import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContextHybrid";
import Logo from "@/components/Logo";

const SelectProfession = () => {
  const [selectedProfession, setSelectedProfession] = useState<string>("");
  const [registrationData, setRegistrationData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  useEffect(() => {
    // Get temporary registration data
    const tempData = sessionStorage.getItem("temp_registration");
    if (!tempData) {
      // If no temp data, redirect to sign-up
      navigate("/");
      return;
    }
    setRegistrationData(JSON.parse(tempData));
  }, [navigate]);

  const handleContinue = () => {
    if (selectedProfession === "medico") {
      // Store profession selection and go to CRM page
      sessionStorage.setItem(
        "temp_registration",
        JSON.stringify({
          ...registrationData,
          profession: "medico",
        }),
      );
      navigate("/add-crm");
    } else if (selectedProfession === "paciente") {
      // Store profession and complete registration
      sessionStorage.setItem(
        "temp_registration",
        JSON.stringify({
          ...registrationData,
          profession: "paciente",
        }),
      );
      // For patients, complete registration directly
      completeRegistration();
    }
  };

  const completeRegistration = async () => {
    if (!registrationData) return;

    setIsLoading(true);

    try {
      // Complete registration for patient
      const success = await register({
        email: registrationData.email,
        password: registrationData.password,
        profession: "paciente",
      });

      if (success) {
        // Clear temporary data
        sessionStorage.removeItem("temp_registration");
        // Navigate to dashboard
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-light via-white to-brand-light flex flex-col">
      {/* Header with back arrow */}
      <div className="p-4">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-brand-light rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-brand-dark-teal" />
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <Logo
              variant="primary"
              size="xl"
              showText={false}
              className="justify-center"
            />
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-medium text-brand-primary mb-2">
              Estamos quase lá
            </h1>
            <p className="text-sm text-brand-dark-teal">O que você é?</p>
          </div>

          {/* Profession Selection */}
          <div className="space-y-3 mb-6">
            {/* Doctor option */}
            <button
              onClick={() => setSelectedProfession("medico")}
              className={`w-full p-4 rounded-lg border-2 transition-all ${
                selectedProfession === "medico"
                  ? "border-brand-teal bg-brand-teal/10"
                  : "border-gray-200 bg-white hover:border-brand-teal/50"
              }`}
            >
              <span className="text-brand-primary font-medium">Médico</span>
            </button>

            {/* Patient option */}
            <button
              onClick={() => setSelectedProfession("paciente")}
              className={`w-full p-4 rounded-lg border-2 transition-all ${
                selectedProfession === "paciente"
                  ? "border-brand-teal bg-brand-teal/10"
                  : "border-gray-200 bg-white hover:border-brand-teal/50"
              }`}
            >
              <span className="text-brand-primary font-medium">Paciente</span>
            </button>
          </div>

          {/* Continue button */}
          <Button
            onClick={handleContinue}
            disabled={!selectedProfession || isLoading}
            className="w-full h-12 bg-gradient-to-r from-brand-primary to-brand-dark-teal hover:from-brand-dark-teal hover:to-brand-primary text-white font-medium rounded-md transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isLoading ? "Criando conta..." : "Continuar"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SelectProfession;
