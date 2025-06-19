-- Script para verificar estrutura real das tabelas
-- Execute no Supabase SQL Editor

-- 1. Ver estrutura da tabela users
SELECT 'ESTRUTURA DA TABELA USERS:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- 2. Ver dados da tabela users (sem assumir coluna name)
SELECT 'DADOS DA TABELA USERS:' as info;
SELECT * FROM users 
WHERE profession IN ('medico', 'paciente')
ORDER BY profession, created_at DESC
LIMIT 10;

-- 3. Ver estrutura da tabela patient_personal_data
SELECT 'ESTRUTURA DA TABELA PATIENT_PERSONAL_DATA:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'patient_personal_data'
ORDER BY ordinal_position;

-- 4. Ver compartilhamentos existentes
SELECT 'COMPARTILHAMENTOS:' as info;
SELECT * FROM doctor_patient_sharing 
ORDER BY shared_at DESC;

-- 5. Dados pessoais de pacientes
SELECT 'DADOS PESSOAIS DE PACIENTES:' as info;
SELECT * FROM patient_personal_data 
ORDER BY created_at DESC
LIMIT 5;
