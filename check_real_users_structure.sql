-- Script para verificar a estrutura REAL da tabela users
-- Execute no Supabase SQL Editor

-- 1. Ver estrutura completa da tabela users
SELECT 'ESTRUTURA REAL DA TABELA USERS:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- 2. Ver dados reais (primeiras 5 linhas)
SELECT 'DADOS REAIS DA TABELA USERS:' as info;
SELECT * FROM users 
WHERE profession IN ('medico', 'paciente')
ORDER BY created_at DESC
LIMIT 5;

-- 3. Ver estrutura da tabela doctor_patient_sharing
SELECT 'ESTRUTURA DA TABELA DOCTOR_PATIENT_SHARING:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'doctor_patient_sharing'
ORDER BY ordinal_position;

-- 4. Ver estrutura da tabela patient_personal_data
SELECT 'ESTRUTURA DA TABELA PATIENT_PERSONAL_DATA:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'patient_personal_data'
ORDER BY ordinal_position;

-- 5. Verificar se RLS está ativo
SELECT 'STATUS RLS:' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('users', 'doctor_patient_sharing', 'patient_personal_data');
