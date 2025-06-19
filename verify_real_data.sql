-- Script para verificar dados reais no banco
-- Execute no Supabase SQL Editor

-- 1. Ver todos os usuários (médicos e pacientes)
SELECT 'TODOS OS USUÁRIOS:' as info;
SELECT 
    id,
    name,
    email,
    profession,
    created_at
FROM users 
ORDER BY profession, created_at DESC;

-- 2. Ver compartilhamentos existentes
SELECT 'COMPARTILHAMENTOS:' as info;
SELECT 
    id,
    doctor_id,
    patient_id,
    shared_at
FROM doctor_patient_sharing 
ORDER BY shared_at DESC;

-- 3. Dados completos dos compartilhamentos (com nomes)
SELECT 'COMPARTILHAMENTOS COM NOMES:' as info;
SELECT 
    dps.id as sharing_id,
    dps.doctor_id,
    dps.patient_id,
    u_doctor.name as doctor_name,
    u_doctor.email as doctor_email,
    u_patient.name as patient_name,
    u_patient.email as patient_email,
    dps.shared_at
FROM doctor_patient_sharing dps
LEFT JOIN users u_doctor ON u_doctor.id = dps.doctor_id
LEFT JOIN users u_patient ON u_patient.id = dps.patient_id
ORDER BY dps.shared_at DESC;

-- 4. Dados pessoais de pacientes
SELECT 'DADOS PESSOAIS DE PACIENTES:' as info;
SELECT 
    user_id,
    full_name,
    email,
    birth_date,
    city,
    state
FROM patient_personal_data 
ORDER BY created_at DESC;
