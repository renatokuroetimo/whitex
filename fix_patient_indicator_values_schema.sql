-- ================================================================
-- VERIFICAR E CORRIGIR SCHEMA DE patient_indicator_values
-- ================================================================

-- 1. Verificar estrutura atual da tabela
\d patient_indicator_values

-- 2. Se a tabela não tiver category_name, adicionar:
ALTER TABLE patient_indicator_values 
ADD COLUMN IF NOT EXISTS category_name TEXT,
ADD COLUMN IF NOT EXISTS subcategory_name TEXT,
ADD COLUMN IF NOT EXISTS parameter TEXT,
ADD COLUMN IF NOT EXISTS unit_symbol TEXT;

-- 3. Se a tabela estiver usando tipos incorretos, recriar:
-- (Execute apenas se necessário)
/*
DROP TABLE IF EXISTS patient_indicator_values CASCADE;

CREATE TABLE patient_indicator_values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  indicator_id TEXT, -- Simplificado para compatibilidade
  category_name TEXT NOT NULL,
  subcategory_name TEXT NOT NULL,
  parameter TEXT NOT NULL,
  unit_symbol TEXT NOT NULL,
  value TEXT NOT NULL,
  date DATE,
  time TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE patient_indicator_values DISABLE ROW LEVEL SECURITY;
*/
