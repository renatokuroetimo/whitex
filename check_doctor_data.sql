-- Script para verificar dados específicos do médico
-- Execute no Supabase SQL Editor

-- 1. Ver dados do médico na tabela users
SELECT 'DADOS DO MÉDICO NA TABELA USERS:' as info;
SELECT 
    id,
    email,
    profession,
    crm,
    specialty,
    state,
    city,
    created_at
FROM users 
WHERE profession = 'medico'
ORDER BY created_at DESC;

-- 2. Ver se médico tem dados pessoais na patient_personal_data
SELECT 'DADOS PESSOAIS DO MÉDICO:' as info;
SELECT 
    user_id,
    full_name,
    email,
    birth_date,
    city,
    state
FROM patient_personal_data 
WHERE user_id IN (
    SELECT id FROM users WHERE profession = 'medico'
);

-- 3. Ver compartilhamentos com nomes completos
SELECT 'COMPARTILHAMENTOS COM NOMES:' as info;
SELECT 
    dps.id as sharing_id,
    dps.doctor_id,
    dps.patient_id,
    u_doctor.email as doctor_email,
    u_patient.email as patient_email,
    ppd_doctor.full_name as doctor_full_name,
    ppd_patient.full_name as patient_full_name,
    dps.shared_at
FROM doctor_patient_sharing dps
LEFT JOIN users u_doctor ON u_doctor.id = dps.doctor_id
LEFT JOIN users u_patient ON u_patient.id = dps.patient_id
LEFT JOIN patient_personal_data ppd_doctor ON ppd_doctor.user_id = dps.doctor_id
LEFT JOIN patient_personal_data ppd_patient ON ppd_patient.user_id = dps.patient_id
ORDER BY dps.shared_at DESC;
