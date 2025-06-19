-- Script para verificar e corrigir a tabela de compartilhamento de pacientes
-- Execute no Supabase SQL Editor

-- 1. Verificar se a tabela doctor_patient_sharing existe
SELECT 'VERIFICANDO TABELAS:' as status;

SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'doctor_patient_sharing';

-- 2. Criar a tabela doctor_patient_sharing se não existir
CREATE TABLE IF NOT EXISTS doctor_patient_sharing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(doctor_id, patient_id)
);

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_doctor_patient_sharing_doctor 
ON doctor_patient_sharing(doctor_id);

CREATE INDEX IF NOT EXISTS idx_doctor_patient_sharing_patient 
ON doctor_patient_sharing(patient_id);

-- 4. Habilitar RLS (Row Level Security)
ALTER TABLE doctor_patient_sharing ENABLE ROW LEVEL SECURITY;

-- 5. Políticas RLS para doctor_patient_sharing
-- Médicos podem ver compartilhamentos onde são o destinatário
DROP POLICY IF EXISTS "Médicos podem ver seus compartilhamentos" ON doctor_patient_sharing;
CREATE POLICY "Médicos podem ver seus compartilhamentos" 
ON doctor_patient_sharing FOR SELECT 
TO authenticated 
USING (doctor_id = auth.uid());

-- Pacientes podem criar compartilhamentos
DROP POLICY IF EXISTS "Pacientes podem compartilhar dados" ON doctor_patient_sharing;
CREATE POLICY "Pacientes podem compartilhar dados" 
ON doctor_patient_sharing FOR INSERT 
TO authenticated 
WITH CHECK (patient_id = auth.uid());

-- Pacientes podem ver seus próprios compartilhamentos
DROP POLICY IF EXISTS "Pacientes podem ver seus compartilhamentos" ON doctor_patient_sharing;
CREATE POLICY "Pacientes podem ver seus compartilhamentos" 
ON doctor_patient_sharing FOR SELECT 
TO authenticated 
USING (patient_id = auth.uid());

-- Pacientes podem deletar seus compartilhamentos
DROP POLICY IF EXISTS "Pacientes podem remover compartilhamentos" ON doctor_patient_sharing;
CREATE POLICY "Pacientes podem remover compartilhamentos" 
ON doctor_patient_sharing FOR DELETE 
TO authenticated 
USING (patient_id = auth.uid());

-- 6. Verificar estrutura da tabela criada
SELECT 'ESTRUTURA DA TABELA:' as status;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'doctor_patient_sharing'
ORDER BY ordinal_position;

-- 7. Verificar dados existentes
SELECT 'DADOS EXISTENTES:' as status;

SELECT 
    id,
    doctor_id,
    patient_id,
    shared_at,
    created_at
FROM doctor_patient_sharing 
ORDER BY created_at DESC;

-- 8. Verificar se há dados na tabela antiga shared_data (se existir)
SELECT 'VERIFICANDO TABELA ANTIGA:' as status;

SELECT EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'shared_data'
) as shared_data_exists;

-- 9. Contar registros
SELECT 'CONTAGEM:' as status;
SELECT COUNT(*) as total_compartilhamentos FROM doctor_patient_sharing;
