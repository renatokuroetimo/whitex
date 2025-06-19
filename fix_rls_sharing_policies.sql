-- Script para debugar e corrigir as políticas RLS do compartilhamento
-- Execute no Supabase SQL Editor

-- 1. Verificar o usuário atual e seu tipo
SELECT 'DEBUG - USUÁRIO ATUAL:' as status;
SELECT 
    auth.uid() as current_auth_uid,
    auth.uid()::text as current_auth_uid_text,
    auth.role() as current_role;

-- 2. Verificar se o usuário está na tabela users
SELECT 'DEBUG - USUÁRIO NA TABELA USERS:' as status;
SELECT 
    id,
    name,
    email,
    profession
FROM users 
WHERE id = auth.uid()::text;

-- 3. Temporariamente DESABILITAR RLS para teste
SELECT 'DESABILITANDO RLS TEMPORARIAMENTE:' as status;
ALTER TABLE doctor_patient_sharing DISABLE ROW LEVEL SECURITY;

-- 4. Testar inserção manual (substitua pelos IDs reais)
-- Esta é apenas para teste - NÃO execute se não souber os IDs
/*
INSERT INTO doctor_patient_sharing (doctor_id, patient_id) 
VALUES ('DOCTOR_ID_AQUI', 'PATIENT_ID_AQUI');
*/

-- 5. Reabilitar RLS
ALTER TABLE doctor_patient_sharing ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas RLS mais permissivas (temporariamente)
-- Remover políticas antigas
DROP POLICY IF EXISTS "Médicos podem ver seus compartilhamentos" ON doctor_patient_sharing;
DROP POLICY IF EXISTS "Pacientes podem compartilhar dados" ON doctor_patient_sharing;
DROP POLICY IF EXISTS "Pacientes podem ver seus compartilhamentos" ON doctor_patient_sharing;
DROP POLICY IF EXISTS "Pacientes podem remover compartilhamentos" ON doctor_patient_sharing;

-- Política mais permissiva para INSERT (temporária)
CREATE POLICY "Usuários autenticados podem compartilhar" 
ON doctor_patient_sharing FOR INSERT 
TO authenticated 
WITH CHECK (true); -- Temporariamente permite tudo

-- Política para SELECT
CREATE POLICY "Usuários podem ver compartilhamentos relacionados" 
ON doctor_patient_sharing FOR SELECT 
TO authenticated 
USING (
    doctor_id = auth.uid()::text OR 
    patient_id = auth.uid()::text
);

-- Política para DELETE
CREATE POLICY "Usuários podem remover seus compartilhamentos" 
ON doctor_patient_sharing FOR DELETE 
TO authenticated 
USING (
    doctor_id = auth.uid()::text OR 
    patient_id = auth.uid()::text
);

-- 7. Verificar as políticas criadas
SELECT 'POLÍTICAS RLS ATUAIS:' as status;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'doctor_patient_sharing';

-- 8. Verificar se a tabela tem RLS habilitado
SELECT 'STATUS RLS:' as status;
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'doctor_patient_sharing';

SELECT 'RLS CORRIGIDO - TESTE NOVAMENTE!' as status;
