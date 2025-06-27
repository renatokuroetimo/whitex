-- Criar tabela de hospitais/clínicas
CREATE TABLE IF NOT EXISTS hospitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar coluna hospital_id na tabela users para vincular médicos aos hospitais
ALTER TABLE users ADD COLUMN IF NOT EXISTS hospital_id UUID REFERENCES hospitals(id);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_users_hospital_id ON users(hospital_id);
CREATE INDEX IF NOT EXISTS idx_hospitals_name ON hospitals(name);

-- Inserir dados de exemplo (opcional)
-- INSERT INTO hospitals (name, password) VALUES ('Hospital Central', '123456');

-- Comentário sobre as mudanças:
-- 1. Criada tabela hospitals com campos básicos
-- 2. Adicionada foreign key hospital_id na tabela users
-- 3. Médicos ficam vinculados aos hospitais através do campo hospital_id
-- 4. Senha padrão será "123456" para novos hospitais
-- 5. Médicos criados pelos hospitais terão senha padrão "123456"
