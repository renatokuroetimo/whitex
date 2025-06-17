import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const AddCRM = () => {
  const [crm, setCrm] = useState("");
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
    const data = JSON.parse(tempData);
    if (data.profession !== "medico") {
      // If not a doctor, redirect to profession selection
      navigate("/select-profession");
      return;
    }
    setRegistrationData(data);
  }, [navigate]);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!crm.trim() || !registrationData) {
      return;
    }

    setIsLoading(true);

    try {
      // Complete registration with CRM
      const success = await register({
        email: registrationData.email,
        password: registrationData.password,
        profession: "medico",
        crm: crm.trim(),
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
    navigate("/select-profession");
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
          </div>

          {/* CRM Form */}
          <form onSubmit={handleCreateAccount} className="space-y-6">
            {/* CRM field */}
            <div>
              <label
                htmlFor="crm"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                CRM
              </label>
              <Input
                id="crm"
                type="text"
                placeholder="CRM"
                value={crm}
                onChange={(e) => setCrm(e.target.value)}
                className="w-full h-12 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                required
              />
            </div>

            {/* Create account button */}
            <Button
              type="submit"
              disabled={!crm.trim() || isLoading}
              className="w-full h-12 bg-brand-blue hover:bg-blue-600 text-white font-medium rounded-md transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isLoading ? "Criando conta..." : "Criar uma conta"}
            </Button>
          </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCRM;