-- Script simplificado para desabilitar RLS
-- Execute no Supabase SQL Editor

-- 1. DESABILITAR RLS COMPLETAMENTE
ALTER TABLE doctor_patient_sharing DISABLE ROW LEVEL SECURITY;

-- 2. Verificar que foi desabilitado (sem a coluna problemática)
SELECT 'STATUS APÓS DESABILITAR RLS:' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'doctor_patient_sharing';

-- 3. Remover TODAS as políticas existentes
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

-- 4. Verificar que não há políticas
SELECT 'POLÍTICAS RESTANTES:' as info;
SELECT COUNT(*) as total_policies
FROM pg_policies 
WHERE tablename = 'doctor_patient_sharing';

-- 5. Mostrar dados atuais
SELECT 'DADOS ATUAIS:' as info;
SELECT COUNT(*) as total_records FROM doctor_patient_sharing;

-- 6. Mostrar informações do usuário atual para debug
SELECT 'USUÁRIO ATUAL:' as info;
SELECT 
    auth.uid() as auth_uid,
    auth.uid()::text as auth_uid_text;

SELECT 'RLS DESABILITADO - TESTE O COMPARTILHAMENTO AGORA!' as resultado;
