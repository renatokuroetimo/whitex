-- Script para remover colunas de hierarquia da tabela indicators
-- Execute este script no SQL Editor do Supabase Dashboard

-- Primeiro, remover as foreign keys (constraints)
ALTER TABLE public.indicators 
DROP CONSTRAINT IF EXISTS indicators_parent_metadata_fkey;

ALTER TABLE public.indicators 
DROP CONSTRAINT IF EXISTS indicators_extends_metadata_fkey;

-- Remover os índices relacionados
DROP INDEX IF EXISTS idx_indicators_parent_metadata_id;
DROP INDEX IF EXISTS idx_indicators_extends_metadata_id;

-- Remover as colunas
ALTER TABLE public.indicators 
DROP COLUMN IF EXISTS parent_metadata_id,
DROP COLUMN IF EXISTS extends_metadata_id;

-- Verificar se as colunas foram removidas com sucesso
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'indicators' 
  AND table_schema = 'public'
  AND column_name NOT IN ('parent_metadata_id', 'extends_metadata_id')
ORDER BY column_name;

-- Confirmar que as colunas de hierarquia foram removidas
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'indicators' 
  AND table_schema = 'public'
  AND column_name IN ('parent_metadata_id', 'extends_metadata_id');
-- Esta consulta deve retornar 0 linhas se as colunas foram removidas corretamente
