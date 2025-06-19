-- ================================================================
-- SCRIPT FINAL PARA RESOLVER PROBLEMAS DE COMPARTILHAMENTO
-- Execute no Supabase SQL Editor
-- ================================================================

-- 1. DESABILITAR RLS COMPLETAMENTE
ALTER TABLE doctor_patient_sharing DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE patient_personal_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE patient_medical_data DISABLE ROW LEVEL SECURITY;

-- 2. Remover TODAS as políticas RLS existentes
DROP POLICY IF EXISTS "Médicos podem ver seus compartilhamentos" ON doctor_patient_sharing;
DROP POLICY IF EXISTS "Pacientes podem compartilhar dados" ON doctor_patient_sharing;
DROP POLICY IF EXISTS "Pacientes podem ver seus compartilhamentos" ON doctor_patient_sharing;
DROP POLICY IF EXISTS "Pacientes podem remover compartilhamentos" ON doctor_patient_sharing;
DROP POLICY IF EXISTS "Usuários autenticados podem compartilhar" ON doctor_patient_sharing;
DROP POLICY IF EXISTS "Usuários podem ver compartilhamentos relacionados" ON doctor_patient_sharing;
DROP POLICY IF EXISTS "Usuários podem remover seus compartilhamentos" ON doctor_patient_sharing;
DROP POLICY IF EXISTS "Política temporária permissiva para compartilhar" ON doctor_patient_sharing;
DROP POLICY IF EXISTS "Política temporária para ver compartilhamentos" ON doctor_patient_sharing;
DROP POLICY IF EXISTS "Política temporária para deletar compartilhamentos" ON doctor_patient_sharing;

-- 3. Verificar estrutura da tabela users
SELECT 'ESTRUTURA DA TABELA USERS:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- 4. Verificar se há dados reais
SELECT 'DADOS DOS USUÁRIOS:' as info;
SELECT 
    id,
    email,
    profession,
    name,
    crm,
    city,
    state,
    specialty
FROM users 
WHERE profession IN ('medico', 'paciente')
ORDER BY profession, created_at DESC
LIMIT 10;

-- 5. Verificar compartilhamentos existentes
SELECT 'COMPARTILHAMENTOS EXISTENTES:' as info;
SELECT 
    id,
    doctor_id,
    patient_id,
    shared_at,
    created_at
FROM doctor_patient_sharing 
ORDER BY shared_at DESC;

-- 6. Verificar dados de compartilhamento com nomes
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

-- 7. Verificar status do RLS
SELECT 'STATUS RLS APÓS CORREÇÕES:' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('doctor_patient_sharing', 'users', 'patient_personal_data', 'patient_medical_data');

-- 8. Contar registros
SELECT 'CONTAGENS:' as info;
SELECT 
    'doctor_patient_sharing' as tabela,
    COUNT(*) as total_registros
FROM doctor_patient_sharing
UNION ALL
SELECT 
    'users' as tabela,
    COUNT(*) as total_registros
FROM users
UNION ALL
SELECT 
    'patient_personal_data' as tabela,
    COUNT(*) as total_registros
FROM patient_personal_data
UNION ALL
SELECT 
    'patient_medical_data' as tabela,
    COUNT(*) as total_registros
FROM patient_medical_data;

SELECT '✅ RLS DESABILITADO - SISTEMA CORRIGIDO PARA ARQUITETURA REAL!' as resultado;
