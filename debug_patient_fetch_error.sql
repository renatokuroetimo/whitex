-- Script para debugar erro na busca de pacientes compartilhados
-- Execute no Supabase SQL Editor

-- 1. Verificar se o compartilhamento funcionou
SELECT 'COMPARTILHAMENTOS CRIADOS:' as info;
SELECT 
    id,
    doctor_id,
    patient_id,
    shared_at,
    created_at
FROM doctor_patient_sharing 
ORDER BY created_at DESC;

-- 2. Verificar se as tabelas de dados do paciente existem
SELECT 'TABELAS EXISTENTES:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('patient_personal_data', 'patient_medical_data', 'patients')
ORDER BY table_name;

-- 3. Verificar estrutura da tabela patient_personal_data (se existir)
SELECT 'COLUNAS patient_personal_data:' as info;
SELECT column_name, data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'patient_personal_data'
ORDER BY ordinal_position;

-- 4. Verificar estrutura da tabela patient_medical_data (se existir)
SELECT 'COLUNAS patient_medical_data:' as info;
SELECT column_name, data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'patient_medical_data'
ORDER BY ordinal_position;

-- 5. Verificar dados em patient_personal_data (se existir)
-- Comentado pois pode não existir
/*
SELECT 'DADOS em patient_personal_data:' as info;
SELECT 
    user_id,
    full_name,
    email,
    city,
    state,
    created_at
FROM patient_personal_data 
ORDER BY created_at DESC
LIMIT 5;
*/

-- 6. Verificar dados em patient_medical_data (se existir)
-- Comentado pois pode não existir
/*
SELECT 'DADOS em patient_medical_data:' as info;
SELECT 
    user_id,
    height,
    weight,
    smoker,
    created_at
FROM patient_medical_data 
ORDER BY created_at DESC
LIMIT 5;
*/

-- 7. Verificar se há usuários na tabela users
SELECT 'USUÁRIOS RECENTES:' as info;
SELECT 
    id,
    email,
    profession,
    created_at
FROM users 
ORDER BY created_at DESC
LIMIT 5;

-- 8. Para cada compartilhamento, verificar se o paciente tem dados
SELECT 'VERIFICAÇÃO DE DADOS POR COMPARTILHAMENTO:' as info;
SELECT 
    dps.id as sharing_id,
    dps.patient_id,
    dps.doctor_id,
    u.email as patient_email,
    u.profession as patient_profession,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patient_personal_data') 
        THEN 'Tabela existe'
        ELSE 'Tabela NÃO existe'
    END as personal_data_table_status
FROM doctor_patient_sharing dps
LEFT JOIN users u ON u.id = dps.patient_id
ORDER BY dps.created_at DESC;

SELECT 'DEBUG COMPLETO - ANALISE OS RESULTADOS!' as resultado;
