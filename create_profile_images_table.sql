-- Tabela para armazenar imagens de perfil dos usuários
CREATE TABLE profile_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  image_data TEXT NOT NULL, -- Base64 da imagem
  mime_type TEXT DEFAULT 'image/jpeg',
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Índice para performance
CREATE INDEX idx_profile_images_user_id ON profile_images(user_id);

-- RLS (Row Level Security)
ALTER TABLE profile_images ENABLE ROW LEVEL SECURITY;

-- Política: usuários só podem ver/editar sua própria imagem
CREATE POLICY "Users can view own profile image" ON profile_images
  FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert own profile image" ON profile_images
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own profile image" ON profile_images
  FOR UPDATE USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete own profile image" ON profile_images
  FOR DELETE USING (user_id = auth.uid()::text);
