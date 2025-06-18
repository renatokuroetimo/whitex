-- ================================================================
-- FIX: Adicionar colunas faltantes na tabela patients
-- ================================================================

-- Adicionar colunas que estão faltando na tabela patients
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS weight DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Verificar estrutura da tabela
-- \d patients
