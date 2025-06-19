-- Solução definitiva para políticas RLS da tabela profile_images
-- Este script corrige os problemas de autenticação para aplicações que usam auth própria

-- 1. Remover políticas antigas que usam auth.uid()
DROP POLICY IF EXISTS "Users can view own profile image" ON profile_images;
DROP POLICY IF EXISTS "Users can insert own profile image" ON profile_images;
DROP POLICY IF EXISTS "Users can update own profile image" ON profile_images;
DROP POLICY IF EXISTS "Users can delete own profile image" ON profile_images;
DROP POLICY IF EXISTS "Allow authenticated users to view own profile image" ON profile_images;
DROP POLICY IF EXISTS "Allow authenticated users to insert own profile image" ON profile_images;
DROP POLICY IF EXISTS "Allow authenticated users to update own profile image" ON profile_images;
DROP POLICY IF EXISTS "Allow authenticated users to delete own profile image" ON profile_images;

-- 2. Opção A: Desabilitar RLS temporariamente (mais fácil para desenvolvimento)
-- Descomente as linhas abaixo para usar esta opção:

-- ALTER TABLE profile_images DISABLE ROW LEVEL SECURITY;

-- 3. Opção B: Criar RPC function para bypass RLS (recomendado)
-- Esta função permite inserir/atualizar sem verificação de auth.uid()

CREATE OR REPLACE FUNCTION upsert_profile_image(
  p_user_id TEXT,
  p_image_data TEXT,
  p_mime_type TEXT DEFAULT 'image/jpeg',
  p_file_size INTEGER DEFAULT NULL
) RETURNS void AS $$
BEGIN
  INSERT INTO profile_images (user_id, image_data, mime_type, file_size, created_at, updated_at)
  VALUES (p_user_id, p_image_data, p_mime_type, p_file_size, NOW(), NOW())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    image_data = EXCLUDED.image_data,
    mime_type = EXCLUDED.mime_type,
    file_size = EXCLUDED.file_size,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Opção C: Políticas mais permissivas (mantém RLS mas flexibiliza)
-- Descomente as linhas abaixo para usar esta opção:

-- CREATE POLICY "Allow profile image operations" ON profile_images
--   FOR ALL USING (true);

-- 5. Verificar as políticas atuais
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'profile_images';

-- 6. Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profile_images';

-- 7. Testar a função RPC (opcional)
-- SELECT upsert_profile_image('test_user_id', 'data:image/jpeg;base64,test', 'image/jpeg', 1024);
