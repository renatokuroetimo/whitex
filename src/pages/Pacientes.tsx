import React from "react";
import Sidebar from "@/components/Sidebar";

const Pacientes = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-8">
            Pacientes
          </h1>

          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              Gerenciamento de Pacientes
            </h2>
            <p className="text-gray-600">
              Esta funcionalidade será implementada em breve.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pacientes;
