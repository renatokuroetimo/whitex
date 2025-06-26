-- Script para adicionar campos de metadados à tabela indicators
-- Execute este script no SQL Editor do Supabase Dashboard

-- Adicionar novas colunas para metadados
ALTER TABLE public.indicators 
ADD COLUMN IF NOT EXISTS definition text,
ADD COLUMN IF NOT EXISTS context text,
ADD COLUMN IF NOT EXISTS data_type text,
ADD COLUMN IF NOT EXISTS is_required boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_conditional boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_repeatable boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS parent_metadata_id text,
ADD COLUMN IF NOT EXISTS extends_metadata_id text,
ADD COLUMN IF NOT EXISTS standard_id text,
ADD COLUMN IF NOT EXISTS source text;

-- Adicionar foreign keys para hierarquia (opcional, permite referência a outros indicadores)
ALTER TABLE public.indicators 
ADD CONSTRAINT indicators_parent_metadata_fkey 
FOREIGN KEY (parent_metadata_id) REFERENCES public.indicators(id);

ALTER TABLE public.indicators 
ADD CONSTRAINT indicators_extends_metadata_fkey 
FOREIGN KEY (extends_metadata_id) REFERENCES public.indicators(id);

-- Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_indicators_context ON public.indicators(context);
CREATE INDEX IF NOT EXISTS idx_indicators_data_type ON public.indicators(data_type);
CREATE INDEX IF NOT EXISTS idx_indicators_standard_id ON public.indicators(standard_id);
CREATE INDEX IF NOT EXISTS idx_indicators_parent_metadata_id ON public.indicators(parent_metadata_id);
CREATE INDEX IF NOT EXISTS idx_indicators_extends_metadata_id ON public.indicators(extends_metadata_id);

-- Adicionar comentários para documentação
COMMENT ON COLUMN public.indicators.definition IS 'Definição clara do significado do metadado';
COMMENT ON COLUMN public.indicators.context IS 'Contexto em que o metadado se aplica (ex: Autoria, Paciente)';
COMMENT ON COLUMN public.indicators.data_type IS 'Tipo de dado (ex: texto, número, data)';
COMMENT ON COLUMN public.indicators.is_required IS 'Se é obrigatório';
COMMENT ON COLUMN public.indicators.is_conditional IS 'Se é obrigatório com condição';
COMMENT ON COLUMN public.indicators.is_repeatable IS 'Se o metadado pode ocorrer múltiplas vezes';
COMMENT ON COLUMN public.indicators.parent_metadata_id IS 'Hierarquia entre metadados - ID do metadado pai';
COMMENT ON COLUMN public.indicators.extends_metadata_id IS 'Herança de metadado existente - ID do metadado base';
COMMENT ON COLUMN public.indicators.standard_id IS 'Identifica a qual padrão o metadado pertence (ex: Dublin Core, MPEG-7)';
COMMENT ON COLUMN public.indicators.source IS 'Fonte/origem do metadado';

-- Verificar se as colunas foram criadas com sucesso
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'indicators' 
  AND table_schema = 'public'
  AND column_name IN ('definition', 'context', 'data_type', 'is_required', 'is_conditional', 'is_repeatable', 'parent_metadata_id', 'extends_metadata_id', 'standard_id', 'source')
ORDER BY column_name;
