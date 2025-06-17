import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const SelectProfession = () => {
  const [selectedProfession, setSelectedProfession] = useState<string>("");
  const [registrationData, setRegistrationData] = useState<any>(null);
  const navigate = useNavigate();

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

  const completeRegistration = () => {
    // This would complete registration for patients
    // For now, simulate successful registration
    sessionStorage.removeItem("temp_registration");
    console.log("Patient registration completed");
    navigate("/dashboard");
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

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-medium text-gray-900 mb-2">
              Estamos quase lá
            </h1>
            <p className="text-sm text-gray-600">O que você é?</p>
          </div>

          {/* Profession Selection */}
          <div className="space-y-3 mb-6">
            {/* Doctor option */}
            <button
              onClick={() => setSelectedProfession("medico")}
              className={`w-full p-4 rounded-lg border-2 transition-all ${
                selectedProfession === "medico"
                  ? "border-brand-blue bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <span className="text-gray-900 font-medium">Médico</span>
            </button>

            {/* Patient option */}
            <button
              onClick={() => setSelectedProfession("paciente")}
              className={`w-full p-4 rounded-lg border-2 transition-all ${
                selectedProfession === "paciente"
                  ? "border-brand-blue bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <span className="text-gray-900 font-medium">Paciente</span>
            </button>
          </div>

          {/* Continue button */}
          <Button
            onClick={handleContinue}
            disabled={!selectedProfession}
            className="w-full h-12 bg-brand-blue hover:bg-blue-600 text-white font-medium rounded-md transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Continuar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SelectProfession;
