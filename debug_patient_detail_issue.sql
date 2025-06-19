-- Script para debugar o problema do PatientDetailView
-- Execute no Supabase SQL Editor

-- 1. Ver todos os compartilhamentos existentes
SELECT 'TODOS OS COMPARTILHAMENTOS:' as info;
SELECT 
    id,
    doctor_id,
    patient_id,
    shared_at
FROM public.doctor_patient_sharing
ORDER BY shared_at DESC;

-- 2. Ver dados dos pacientes compartilhados
SELECT 'DADOS DOS PACIENTES COMPARTILHADOS:' as info;
SELECT 
    u.id,
    u.email,
    u.profession,
    u.full_name,
    u.city,
    u.state,
    'COMPARTILHADO COM:' as status,
    dps.doctor_id
FROM public.users u
INNER JOIN public.doctor_patient_sharing dps ON u.id = dps.patient_id
WHERE u.profession = 'paciente'
ORDER BY u.full_name;

-- 3. Ver dados dos médicos que recebem compartilhamentos
SELECT 'MÉDICOS QUE RECEBEM COMPARTILHAMENTOS:' as info;
SELECT 
    u.id,
    u.email,
    u.profession,
    u.full_name,
    'RECEBE COMPARTILHAMENTOS DE:' as status,
    COUNT(dps.patient_id) as total_pacientes
FROM public.users u
INNER JOIN public.doctor_patient_sharing dps ON u.id = dps.doctor_id
WHERE u.profession = 'medico'
GROUP BY u.id, u.email, u.profession, u.full_name
ORDER BY u.full_name;

-- 4. Query específica para testar o que o sistema vai fazer
-- (substitua os IDs pelos reais se souber)
SELECT 'TESTE DE CONSULTA ESPECÍFICA:' as info;
SELECT 
    'COMPARTILHAMENTO ENCONTRADO:' as teste,
    dps.*
FROM public.doctor_patient_sharing dps
WHERE dps.patient_id IN (
    SELECT id FROM public.users WHERE profession = 'paciente' LIMIT 1
)
AND dps.doctor_id IN (
    SELECT id FROM public.users WHERE profession = 'medico' LIMIT 1
);

-- 5. Ver detalhes do paciente "Renato Kuroe" especificamente
SELECT 'DADOS DO PACIENTE RENATO KUROE:' as info;
SELECT 
    id,
    email,
    profession,
    full_name,
    city,
    state,
    created_at
FROM public.users 
WHERE full_name ILIKE '%renato%' 
OR full_name ILIKE '%kuroe%'
OR email ILIKE '%renato%'
ORDER BY created_at DESC;

-- 6. Ver se Renato está compartilhado
SELECT 'COMPARTILHAMENTOS DO RENATO KUROE:' as info;
SELECT 
    dps.id as sharing_id,
    dps.doctor_id,
    dps.patient_id,
    u_patient.full_name as patient_name,
    u_doctor.full_name as doctor_name,
    dps.shared_at
FROM public.doctor_patient_sharing dps
LEFT JOIN public.users u_patient ON u_patient.id = dps.patient_id
LEFT JOIN public.users u_doctor ON u_doctor.id = dps.doctor_id
WHERE u_patient.full_name ILIKE '%renato%' 
   OR u_patient.full_name ILIKE '%kuroe%'
ORDER BY dps.shared_at DESC;
