-- Script para migração manual de imagens sem depender de RLS
-- Execute este script no Supabase SQL Editor

-- 1. Temporariamente desabilitar RLS para permitir migração
ALTER TABLE profile_images DISABLE ROW LEVEL SECURITY;

-- 2. Depois da migração, reabilitar RLS
-- ALTER TABLE profile_images ENABLE ROW LEVEL SECURITY;

-- 3. Para verificar se há imagens na tabela
SELECT COUNT(*) as total_images FROM profile_images;

-- 4. Para ver todas as imagens
SELECT user_id, file_size, created_at FROM profile_images ORDER BY created_at DESC;

-- 5. Para limpar dados duplicados (se necessário)
-- DELETE FROM profile_images WHERE id NOT IN (
--   SELECT DISTINCT ON (user_id) id FROM profile_images ORDER BY user_id, created_at DESC
-- );
