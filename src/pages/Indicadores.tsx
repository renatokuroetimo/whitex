import React from "react";
import ResponsiveSidebar from "@/components/ResponsiveSidebar";

const Indicadores = () => {
  return (
    <ResponsiveSidebar>
      <div className="p-4 sm:p-6 lg:p-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-8">
            Indicadores
          </h1>

          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              Dashboard de Indicadores
            </h2>
            <p className="text-gray-600">
              Relatórios e métricas serão exibidos aqui.
            </p>
          </div>
        </div>
      </div>
    </ResponsiveSidebar>
  );
};

export default Indicadores;