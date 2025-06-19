-- Verificar dados do compartilhamento real que acabou de ser criado
-- Execute no Supabase SQL Editor

-- 1. Ver todos os compartilhamentos (mais recentes primeiro)
SELECT 'COMPARTILHAMENTOS CRIADOS:' as status;
SELECT 
    id,
    doctor_id,
    patient_id,
    shared_at,
    created_at
FROM doctor_patient_sharing 
ORDER BY created_at DESC
LIMIT 10;

-- 2. Ver usuários médicos recentes
SELECT 'MÉDICOS CADASTRADOS:' as status;
SELECT 
    id,
    email,
    profession,
    created_at
FROM users 
WHERE profession = 'medico'
ORDER BY created_at DESC
LIMIT 5;

-- 3. Ver usuários pacientes recentes  
SELECT 'PACIENTES CADASTRADOS:' as status;
SELECT 
    id,
    email,
    profession,
    created_at
FROM users 
WHERE profession = 'paciente'
ORDER BY created_at DESC
LIMIT 5;

-- 4. Verificar se IDs dos usuários batem com os compartilhamentos
SELECT 'VERIFICAÇÃO DE INTEGRIDADE:' as status;
SELECT 
    dps.id as sharing_id,
    dps.patient_id,
    dps.doctor_id,
    u1.email as patient_email,
    u2.email as doctor_email,
    dps.shared_at
FROM doctor_patient_sharing dps
LEFT JOIN users u1 ON u1.id = dps.patient_id
LEFT JOIN users u2 ON u2.id = dps.doctor_id
ORDER BY dps.created_at DESC
LIMIT 10;
