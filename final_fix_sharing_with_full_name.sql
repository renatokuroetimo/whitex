-- ================================================================
-- SCRIPT FINAL - SISTEMA DE COMPARTILHAMENTO CORRIGIDO
-- Execute no Supabase SQL Editor
-- ================================================================

-- 1. GARANTIR QUE RLS ESTEJA DESABILITADO
ALTER TABLE public.doctor_patient_sharing DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_personal_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_medical_data DISABLE ROW LEVEL SECURITY;

-- 2. Remover TODAS as políticas RLS
DROP POLICY IF EXISTS "Médicos podem ver seus compartilhamentos" ON public.doctor_patient_sharing;
DROP POLICY IF EXISTS "Pacientes podem compartilhar dados" ON public.doctor_patient_sharing;
DROP POLICY IF EXISTS "Pacientes podem ver seus compartilhamentos" ON public.doctor_patient_sharing;
DROP POLICY IF EXISTS "Pacientes podem remover compartilhamentos" ON public.doctor_patient_sharing;

-- 3. Verificar estrutura da tabela public.users
SELECT 'ESTRUTURA DA TABELA PUBLIC.USERS:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- 4. Testar consulta que o sistema vai fazer para médicos
SELECT 'TESTE: BUSCAR MÉDICOS COM FULL_NAME:' as info;
SELECT 
    id,
    email,
    profession,
    full_name,
    crm,
    specialty,
    state,
    city,
    phone,
    created_at
FROM public.users 
WHERE profession = 'medico'
ORDER BY created_at DESC
LIMIT 5;

-- 5. Testar consulta que o sistema vai fazer para pacientes
SELECT 'TESTE: BUSCAR PACIENTES COM FULL_NAME:' as info;
SELECT 
    id,
    email,
    profession,
    full_name,
    crm,
    city,
    state,
    specialty,
    phone,
    created_at
FROM public.users 
WHERE profession = 'paciente'
ORDER BY created_at DESC
LIMIT 5;

-- 6. Verificar compartilhamentos existentes
SELECT 'COMPARTILHAMENTOS EXISTENTES:' as info;
SELECT 
    dps.id as sharing_id,
    dps.doctor_id,
    dps.patient_id,
    u_doctor.full_name as doctor_name,
    u_doctor.email as doctor_email,
    u_patient.full_name as patient_name,
    u_patient.email as patient_email,
    dps.shared_at
FROM public.doctor_patient_sharing dps
LEFT JOIN public.users u_doctor ON u_doctor.id = dps.doctor_id
LEFT JOIN public.users u_patient ON u_patient.id = dps.patient_id
ORDER BY dps.shared_at DESC;

-- 7. Verificar status do RLS após correções
SELECT 'STATUS RLS FINAL:' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('users', 'doctor_patient_sharing', 'patient_personal_data', 'patient_medical_data')
AND schemaname = 'public';

-- 8. Inserir um compartilhamento de teste se não houver nenhum
-- (substitua pelos IDs reais dos seus usuários)
/*
INSERT INTO public.doctor_patient_sharing (doctor_id, patient_id, shared_at)
SELECT 
    (SELECT id FROM public.users WHERE profession = 'medico' LIMIT 1),
    (SELECT id FROM public.users WHERE profession = 'paciente' LIMIT 1),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM public.doctor_patient_sharing
);
*/

SELECT '✅ SISTEMA CORRIGIDO - USANDO CAMPO full_name DA TABELA public.users!' as resultado;
