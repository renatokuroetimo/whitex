import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Badge } from "@/components/ui/badge";

const StandardIndicators = () => {
  const navigate = useNavigate();

  const standardIndicators = [
    {
      id: 1,
      categoryName: "Sinais Vitais",
      subcategoryName: "Pressão Arterial",
      parameter: "Sistólica",
      unitSymbol: "mmHg",
      requiresDate: true,
      requiresTime: true,
    },
    {
      id: 2,
      categoryName: "Sinais Vitais",
      subcategoryName: "Pressão Arterial",
      parameter: "Diastólica",
      unitSymbol: "mmHg",
      requiresDate: true,
      requiresTime: true,
    },
    {
      id: 3,
      categoryName: "Sinais Vitais",
      subcategoryName: "Frequência Cardíaca",
      parameter: "Batimentos",
      unitSymbol: "bpm",
      requiresDate: true,
      requiresTime: false,
    },
    {
      id: 4,
      categoryName: "Sinais Vitais",
      subcategoryName: "Temperatura",
      parameter: "Corporal",
      unitSymbol: "°C",
      requiresDate: true,
      requiresTime: true,
    },
    {
      id: 5,
      categoryName: "Exames Laboratoriais",
      subcategoryName: "Glicemia",
      parameter: "Jejum",
      unitSymbol: "mg/dL",
      requiresDate: true,
      requiresTime: false,
    },
    {
      id: 6,
      categoryName: "Exames Laboratoriais",
      subcategoryName: "Colesterol",
      parameter: "Total",
      unitSymbol: "mg/dL",
      requiresDate: true,
      requiresTime: false,
    },
    {
      id: 7,
      categoryName: "Medidas Antropométricas",
      subcategoryName: "Peso",
      parameter: "Corporal",
      unitSymbol: "kg",
      requiresDate: true,
      requiresTime: false,
    },
    {
      id: 8,
      categoryName: "Medidas Antropométricas",
      subcategoryName: "Altura",
      parameter: "Estatura",
      unitSymbol: "cm",
      requiresDate: false,
      requiresTime: false,
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/indicadores")}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <h1 className="text-2xl font-semibold text-gray-900">
                Indicadores Padrão
              </h1>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Indicadores do Sistema ({standardIndicators.length})
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                        Categoria
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                        Subcategoria
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                        Parâmetro
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                        Unidade
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                        Obrigatoriedade
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {standardIndicators.map((indicator) => (
                      <tr
                        key={indicator.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          <span className="text-sm font-medium text-gray-900">
                            {indicator.categoryName}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-600">
                            {indicator.subcategoryName}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-900">
                            {indicator.parameter}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-600">
                            {indicator.unitSymbol}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1">
                            {indicator.requiresDate && (
                              <Badge variant="secondary" className="text-xs">
                                Data
                              </Badge>
                            )}
                            {indicator.requiresTime && (
                              <Badge variant="secondary" className="text-xs">
                                Horário
                              </Badge>
                            )}
                            {!indicator.requiresDate &&
                              !indicator.requiresTime && (
                                <span className="text-xs text-gray-400">
                                  Nenhuma
                                </span>
                              )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StandardIndicators;
