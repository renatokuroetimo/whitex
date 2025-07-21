import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";

interface MobileAccessRestrictedProps {
  title?: string;
  message?: string;
  actionText?: string;
  actionPath?: string;
}

const MobileAccessRestricted: React.FC<MobileAccessRestrictedProps> = ({
  title = "App Exclusivo para Pacientes",
  message = "Este aplicativo é exclusivo para pacientes. Médicos devem acessar através da versão web.",
  actionText = "Voltar ao Login",
  actionPath = "/login",
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-light via-white to-brand-light flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="text-center mb-6">
          <Logo
            variant="primary"
            size="2xl"
            showText={false}
            className="justify-center"
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
            <span className="text-blue-600 text-2xl">📱</span>
          </div>
          
          <h2 className="text-lg font-semibold text-blue-800 mb-3">
            {title}
          </h2>
          
          <p className="text-blue-600 text-sm mb-6 leading-relaxed">
            {message}
          </p>
          
          <Button
            onClick={() => navigate(actionPath, { replace: true })}
            className="w-full bg-[#00B1BB] hover:bg-[#01485E] text-white"
          >
            {actionText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileAccessRestricted;
