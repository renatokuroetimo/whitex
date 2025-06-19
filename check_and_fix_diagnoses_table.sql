-- Script para verificar e corrigir a tabela patient_diagnoses
-- Execute no Supabase SQL Editor

-- 1. Verificar se a tabela patient_diagnoses existe
SELECT 'VERIFICANDO TABELA PATIENT_DIAGNOSES:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'patient_diagnoses';

-- 2. Ver estrutura da tabela se existir
SELECT 'ESTRUTURA DA TABELA PATIENT_DIAGNOSES:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'patient_diagnoses'
ORDER BY ordinal_position;

-- 3. Criar a tabela se não existir (baseado no supabase_setup.sql)
CREATE TABLE IF NOT EXISTS public.patient_diagnoses (
  id TEXT PRIMARY KEY, -- Using TEXT to match application ID generation
  patient_id TEXT NOT NULL, -- Reference to patient
  date TEXT NOT NULL, -- Date as string (DD/MM/YYYY format)
  status TEXT NOT NULL, -- Diagnosis description
  code TEXT NOT NULL, -- CID code
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Garantir que RLS esteja desabilitado
ALTER TABLE public.patient_diagnoses DISABLE ROW LEVEL SECURITY;

-- 5. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_patient_diagnoses_patient_id 
ON public.patient_diagnoses(patient_id);

CREATE INDEX IF NOT EXISTS idx_patient_diagnoses_date 
ON public.patient_diagnoses(date);

-- 6. Verificar dados existentes
SELECT 'DADOS EXISTENTES NA TABELA:' as info;
SELECT 
    id,
    patient_id,
    date,
    status,
    code,
    created_at
FROM public.patient_diagnoses 
ORDER BY created_at DESC
LIMIT 10;

-- 7. Verificar se há algum paciente compartilhado para teste
SELECT 'PACIENTES COMPARTILHADOS DISPONÍVEIS:' as info;
SELECT 
    dps.patient_id,
    u.full_name as patient_name,
    u.email as patient_email
FROM public.doctor_patient_sharing dps
JOIN public.users u ON u.id = dps.patient_id
ORDER BY dps.shared_at DESC;

-- 8. Contar registros
SELECT 'CONTAGEM FINAL:' as info;
SELECT COUNT(*) as total_diagnoses FROM public.patient_diagnoses;

SELECT '✅ TABELA PATIENT_DIAGNOSES VERIFICADA E CORRIGIDA!' as resultado;
