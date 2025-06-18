-- ================================================================
-- CORRIGIR SCHEMA DA TABELA patient_indicator_values
-- ================================================================

-- Verificar estrutura atual
\d patient_indicator_values

-- Adicionar colunas que podem estar faltando
ALTER TABLE patient_indicator_values 
ADD COLUMN IF NOT EXISTS date DATE,
ADD COLUMN IF NOT EXISTS time TIME,
ADD COLUMN IF NOT EXISTS category_name TEXT,
ADD COLUMN IF NOT EXISTS subcategory_name TEXT,
ADD COLUMN IF NOT EXISTS parameter TEXT,
ADD COLUMN IF NOT EXISTS unit_symbol TEXT;

-- Verificar novamente
\d patient_indicator_values
