-- Script para testar completamente o sistema de compartilhamento
-- Execute no Supabase SQL Editor

-- 1. Verificar estrutura das tabelas relevantes
SELECT 'VERIFICANDO ESTRUTURA DAS TABELAS:' as status;

-- Verificar tabela doctor_patient_sharing
SELECT 'Tabela doctor_patient_sharing existe?' as check_table,
EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'doctor_patient_sharing'
) as exists;

-- Verificar tabela patient_personal_data  
SELECT 'Tabela patient_personal_data existe?' as check_table,
EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'patient_personal_data'  
) as exists;

-- Verificar tabela patient_medical_data
SELECT 'Tabela patient_medical_data existe?' as check_table,
EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'patient_medical_data'
) as exists;

-- 2. Ver dados de compartilhamento existentes
SELECT 'DADOS DE COMPARTILHAMENTO:' as status;
SELECT 
    id,
    doctor_id,
    patient_id,
    shared_at,
    created_at
FROM doctor_patient_sharing 
ORDER BY created_at DESC;

-- 3. Ver dados pessoais de pacientes
SELECT 'DADOS PESSOAIS DE PACIENTES:' as status;
SELECT 
    user_id,
    full_name,
    email,
    birth_date,
    city,
    state,
    created_at
FROM patient_personal_data 
ORDER BY created_at DESC
LIMIT 5;

-- 4. Ver usuários médicos
SELECT 'USUÁRIOS MÉDICOS:' as status;
SELECT 
    id,
    name,
    email,
    profession,
    created_at
FROM users 
WHERE profession = 'medico'
ORDER BY created_at DESC
LIMIT 5;

-- 5. Ver usuários pacientes
SELECT 'USUÁRIOS PACIENTES:' as status;
SELECT 
    id,
    name,
    email,
    profession,
    created_at
FROM users 
WHERE profession = 'paciente'
ORDER BY created_at DESC
LIMIT 5;

-- 6. Simulação da query que o código faz
SELECT 'SIMULAÇÃO DA QUERY DO CÓDIGO:' as status;

-- Exemplo: buscar compartilhamentos para um médico específico
-- Substitua 'DOCTOR_ID_AQUI' pelo ID real de um médico
/*
SELECT 
    dps.id,
    dps.patient_id,
    dps.doctor_id,
    dps.shared_at,
    ppd.full_name as patient_name,
    ppd.city,
    ppd.state,
    pmd.weight
FROM doctor_patient_sharing dps
LEFT JOIN patient_personal_data ppd ON ppd.user_id = dps.patient_id
LEFT JOIN patient_medical_data pmd ON pmd.user_id = dps.patient_id
WHERE dps.doctor_id = 'DOCTOR_ID_AQUI'
ORDER BY dps.shared_at DESC;
*/

-- 7. Verificar se há algum compartilhamento
SELECT 'TOTAL DE COMPARTILHAMENTOS:' as status,
COUNT(*) as total_shares
FROM doctor_patient_sharing;

-- 8. Verificar se há dados pessoais de pacientes
SELECT 'TOTAL DE PERFIS PESSOAIS:' as status,
COUNT(*) as total_personal_data
FROM patient_personal_data;
