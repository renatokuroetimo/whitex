-- Script para verificar estrutura da tabela patient_medical_data
-- Execute no Supabase SQL Editor

-- 1. Ver estrutura da tabela patient_medical_data
SELECT 'ESTRUTURA DA TABELA PATIENT_MEDICAL_DATA:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'patient_medical_data'
ORDER BY ordinal_position;

-- 2. Ver dados existentes
SELECT 'DADOS EXISTENTES:' as info;
SELECT * FROM public.patient_medical_data 
ORDER BY created_at DESC
LIMIT 5;

-- 3. Verificar se precisa adicionar campo para observações médicas
-- (pode ser que a tabela não tenha o campo medical_notes)

-- 4. Alternativa: usar uma tabela separada para observações médicas
CREATE TABLE IF NOT EXISTS public.patient_medical_observations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  patient_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  doctor_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Desabilitar RLS
ALTER TABLE public.patient_medical_observations DISABLE ROW LEVEL SECURITY;

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_patient_medical_observations_patient_id 
ON public.patient_medical_observations(patient_id);

CREATE INDEX IF NOT EXISTS idx_patient_medical_observations_doctor_id 
ON public.patient_medical_observations(doctor_id);

SELECT '✅ ESTRUTURA VERIFICADA E TABELA DE OBSERVAÇÕES CRIADA!' as resultado;
