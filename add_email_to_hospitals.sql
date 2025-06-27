-- Adicionar coluna email na tabela hospitals
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;

-- Criar índice para melhor performance nas consultas por email
CREATE INDEX IF NOT EXISTS idx_hospitals_email ON hospitals(email);

-- Comentário:
-- Esta migração adiciona o campo email na tabela hospitals
-- O email será usado para autenticação no lugar do nome
-- O campo é UNIQUE para evitar duplicatas
