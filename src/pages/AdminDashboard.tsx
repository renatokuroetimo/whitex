import React from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Building2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const dashboardOptions = [
    {
      title: "Configurar indicadores padrão",
      description: "Gerenciar indicadores disponíveis no sistema",
      icon: Settings,
      path: "/admin/indicators",
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Gerenciar hospitais e clínicas",
      description: "Cadastrar e gerenciar instituições médicas",
      icon: Building2,
      path: "/admin/hospitals",
      color: "from-green-500 to-green-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Painel Administrativo
          </h1>
          <p className="text-xl text-gray-600">
            Selecione uma opção para gerenciar o sistema
          </p>
        </div>

        {/* Dashboard Options */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {dashboardOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <div
                key={option.path}
                className="bg-white/90 backdrop-blur-lg rounded-2xl border border-gray-200 p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
                onClick={() => navigate(option.path)}
              >
                <div className="flex flex-col items-center text-center">
                  <div
                    className={`w-20 h-20 rounded-full bg-gradient-to-r ${option.color} flex items-center justify-center mb-6 shadow-lg`}
                  >
                    <IconComponent className="w-10 h-10 text-white" />
                  </div>

                  <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                    {option.title}
                  </h3>

                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {option.description}
                  </p>

                  <Button
                    className={`w-full bg-gradient-to-r ${option.color} hover:shadow-lg transition-all duration-200 text-white font-semibold py-3 rounded-lg group`}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(option.path);
                    }}
                  >
                    Acessar
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="text-gray-600 hover:text-gray-800 border-gray-300 hover:border-gray-400"
          >
            ← Voltar ao site principal
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
