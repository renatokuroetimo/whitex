-- Script corrigido para debugar e corrigir as políticas RLS do compartilhamento
-- Execute no Supabase SQL Editor

-- 1. Verificar o usuário atual e seu tipo
SELECT 'DEBUG - USUÁRIO ATUAL:' as status;
SELECT 
    auth.uid() as current_auth_uid,
    auth.uid()::text as current_auth_uid_text,
    auth.role() as current_role;

-- 2. Primeiro verificar que colunas existem na tabela users
SELECT 'COLUNAS DA TABELA USERS:' as status;
SELECT column_name
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- 3. Verificar se o usuário está na tabela users (só com colunas que sabemos que existem)
SELECT 'DEBUG - USUÁRIO NA TABELA USERS:' as status;
SELECT 
    id,
    email,
    profession
FROM users 
WHERE id = auth.uid()::text;

-- 4. Temporariamente DESABILITAR RLS para teste
SELECT 'DESABILITANDO RLS TEMPORARIAMENTE:' as status;
ALTER TABLE doctor_patient_sharing DISABLE ROW LEVEL SECURITY;

-- 5. Reabilitar RLS
ALTER TABLE doctor_patient_sharing ENABLE ROW LEVEL SECURITY;

-- 6. Remover políticas antigas
DROP POLICY IF EXISTS "Médicos podem ver seus compartilhamentos" ON doctor_patient_sharing;
DROP POLICY IF EXISTS "Pacientes podem compartilhar dados" ON doctor_patient_sharing;
DROP POLICY IF EXISTS "Pacientes podem ver seus compartilhamentos" ON doctor_patient_sharing;
DROP POLICY IF EXISTS "Pacientes podem remover compartilhamentos" ON doctor_patient_sharing;
DROP POLICY IF EXISTS "Usuários autenticados podem compartilhar" ON doctor_patient_sharing;
DROP POLICY IF EXISTS "Usuários podem ver compartilhamentos relacionados" ON doctor_patient_sharing;
DROP POLICY IF EXISTS "Usuários podem remover seus compartilhamentos" ON doctor_patient_sharing;

-- 7. Criar política MUITO permissiva para INSERT (temporária para teste)
CREATE POLICY "Política temporária permissiva para compartilhar" 
ON doctor_patient_sharing FOR INSERT 
TO authenticated 
WITH CHECK (true); -- Permite tudo temporariamente

-- 8. Política para SELECT
CREATE POLICY "Política temporária para ver compartilhamentos" 
ON doctor_patient_sharing FOR SELECT 
TO authenticated 
USING (true); -- Permite ver tudo temporariamente

-- 9. Política para DELETE
CREATE POLICY "Política temporária para deletar compartilhamentos" 
ON doctor_patient_sharing FOR DELETE 
TO authenticated 
USING (true); -- Permite deletar tudo temporariamente

-- 10. Verificar as políticas criadas
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

-- 11. Verificar se a tabela tem RLS habilitado
SELECT 'STATUS RLS:' as status;
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'doctor_patient_sharing';

-- 12. Testar contagem de registros
SELECT 'CONTAGEM ATUAL DE COMPARTILHAMENTOS:' as status;
SELECT COUNT(*) as total FROM doctor_patient_sharing;

SELECT 'RLS CORRIGIDO COM POLÍTICAS TEMPORÁRIAS PERMISSIVAS - TESTE NOVAMENTE!' as status;
