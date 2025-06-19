-- Verificar se existe coluna name na tabela users
-- Execute no Supabase SQL Editor

-- 1. Ver estrutura completa da tabela users
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- 2. Ver dados específicos do médico incluindo name
SELECT 
    id,
    email,
    profession,
    name,  -- Esta coluna deveria existir
    crm,
    specialty,
    created_at
FROM users 
WHERE profession = 'medico'
ORDER BY created_at DESC;
