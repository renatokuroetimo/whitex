-- ================================================================
-- RECRIAR TABELA patient_indicator_values COM ESTRUTURA CORRETA
-- ================================================================

-- Verificar estrutura atual
\d patient_indicator_values

-- Se a tabela existe mas com estrutura errada, drop e recriar
DROP TABLE IF EXISTS patient_indicator_values CASCADE;

-- Criar tabela com estrutura compatível
CREATE TABLE patient_indicator_values (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  indicator_id TEXT NOT NULL,
  category_name TEXT,
  subcategory_name TEXT,
  parameter TEXT,
  unit_symbol TEXT,
  value TEXT NOT NULL,
  date DATE,
  time TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Desabilitar RLS temporariamente
ALTER TABLE patient_indicator_values DISABLE ROW LEVEL SECURITY;

-- Verificar estrutura final
\d patient_indicator_values
