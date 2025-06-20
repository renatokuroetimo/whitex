-- Script para verificar estrutura e dados da tabela users
-- Execute no Supabase SQL Editor

-- 1. Ver estrutura da tabela users
SELECT 'ESTRUTURA DA TABELA USERS:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 2. Ver dados reais dos médicos
SELECT 'DADOS DOS MÉDICOS:' as info;
SELECT * FROM users 
WHERE profession = 'medico'
LIMIT 5;

-- 3. Ver dados específicos do médico que está logando (assumindo email de teste)
SELECT 'DADOS DO MÉDICO TESTE:' as info;
SELECT * FROM users 
WHERE email LIKE '%medico%' 
   OR email LIKE '%@supabase%'
LIMIT 5;
