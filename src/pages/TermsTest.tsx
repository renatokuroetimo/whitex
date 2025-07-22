import React from "react";
import { useNavigate } from "react-router-dom";

const TermsTest = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">Teste de Termos</h1>
        <p className="mb-4">
          Esta é uma página de teste para verificar se as rotas estão
          funcionando.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="bg-brand-teal text-white px-4 py-2 rounded"
        >
          Voltar
        </button>
      </div>
    </div>
  );
};

export default TermsTest;
