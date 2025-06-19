-- Script para debug do compartilhamento após teste
-- Execute no Supabase SQL Editor DEPOIS de tentar compartilhar

-- 1. Verificar todos os compartilhamentos
SELECT 'COMPARTILHAMENTOS NA TABELA:' as status;
SELECT 
    id,
    doctor_id,
    patient_id,
    shared_at,
    created_at
FROM doctor_patient_sharing 
ORDER BY created_at DESC;

-- 2. Verificar usuários médicos
SELECT 'USUÁRIOS MÉDICOS:' as status;
SELECT 
    id,
    name,
    email,
    profession
FROM users 
WHERE profession = 'medico'
ORDER BY created_at DESC;

-- 3. Verificar usuários pacientes  
SELECT 'USUÁRIOS PACIENTES:' as status;
SELECT 
    id,
    name,
    email,
    profession
FROM users 
WHERE profession = 'paciente'
ORDER BY created_at DESC;

-- 4. Verificar dados pessoais de pacientes
SELECT 'DADOS PESSOAIS DE PACIENTES:' as status;
SELECT 
    user_id,
    full_name,
    email,
    city,
    state
FROM patient_personal_data 
ORDER BY created_at DESC;

-- 5. Verificar dados médicos de pacientes
SELECT 'DADOS MÉDICOS DE PACIENTES:' as status;
SELECT 
    user_id,
    height,
    weight,
    smoker,
    high_blood_pressure,
    physical_activity
FROM patient_medical_data 
ORDER BY created_at DESC;

-- 6. Query completa simulando o que o código faz
SELECT 'SIMULAÇÃO DA QUERY DO CÓDIGO:' as status;
SELECT 
    dps.id as sharing_id,
    dps.doctor_id,
    dps.patient_id,
    dps.shared_at,
    ppd.full_name as patient_name,
    ppd.email as patient_email,
    ppd.city,
    ppd.state,
    pmd.weight,
    pmd.height
FROM doctor_patient_sharing dps
LEFT JOIN patient_personal_data ppd ON ppd.user_id = dps.patient_id
LEFT JOIN patient_medical_data pmd ON pmd.user_id = dps.patient_id
ORDER BY dps.shared_at DESC;
