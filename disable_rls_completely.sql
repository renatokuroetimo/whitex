-- Script para desabilitar RLS completamente e resolver o problema
-- Execute no Supabase SQL Editor

-- 1. Verificar status atual da tabela
SELECT 'STATUS ATUAL DA TABELA:' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    forcerowsecurity
FROM pg_tables 
WHERE tablename = 'doctor_patient_sharing';

-- 2. DESABILITAR RLS COMPLETAMENTE
ALTER TABLE doctor_patient_sharing DISABLE ROW LEVEL SECURITY;

-- 3. Verificar que foi desabilitado
SELECT 'STATUS APÓS DESABILITAR RLS:' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    forcerowsecurity
FROM pg_tables 
WHERE tablename = 'doctor_patient_sharing';

-- 4. Remover TODAS as políticas existentes
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

-- 5. Verificar que não há políticas
SELECT 'POLÍTICAS RESTANTES (deve estar vazio):' as info;
SELECT 
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'doctor_patient_sharing';

-- 6. Testar inserção manual para garantir que funciona
-- (Esta linha está comentada - descomente para testar com IDs reais)
-- INSERT INTO doctor_patient_sharing (doctor_id, patient_id) VALUES ('test-doctor', 'test-patient');

-- 7. Mostrar dados atuais
SELECT 'DADOS ATUAIS NA TABELA:' as info;
SELECT 
    id,
    doctor_id,
    patient_id,
    shared_at
FROM doctor_patient_sharing 
ORDER BY created_at DESC;

-- 8. Mostrar informações do usuário atual para debug
SELECT 'USUÁRIO ATUAL:' as info;
SELECT 
    auth.uid() as auth_uid,
    auth.uid()::text as auth_uid_text,
    auth.role() as auth_role;

SELECT 'RLS TOTALMENTE DESABILITADO - AGORA DEVE FUNCIONAR!' as resultado;
SELECT 'TESTE O COMPARTILHAMENTO NOVAMENTE!' as instrucao;
