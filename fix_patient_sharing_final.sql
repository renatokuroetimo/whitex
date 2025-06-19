-- Script para corrigir a tabela de compartilhamento com tipos corretos
-- Execute no Supabase SQL Editor

-- 1. Verificar se a tabela doctor_patient_sharing existe
SELECT 'VERIFICANDO TABELAS:' as status;

SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'doctor_patient_sharing';

-- 2. Primeiro, vamos ver a estrutura da tabela users para entender os tipos
SELECT 'ESTRUTURA DA TABELA USERS:' as status;
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
AND column_name IN ('id', 'profession')
ORDER BY ordinal_position;

-- 3. Deletar tabela existente se houver problemas de tipo
DROP TABLE IF EXISTS doctor_patient_sharing CASCADE;

-- 4. Criar a tabela doctor_patient_sharing com tipos corretos
-- Assumindo que users.id é TEXT (não UUID)
CREATE TABLE doctor_patient_sharing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id TEXT NOT NULL,
    patient_id TEXT NOT NULL, 
    shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(doctor_id, patient_id)
);

-- 5. Adicionar foreign keys depois (se a tabela users existir)
-- Comentadas por enquanto até confirmarmos a estrutura
-- ALTER TABLE doctor_patient_sharing 
-- ADD CONSTRAINT fk_doctor FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE;

-- ALTER TABLE doctor_patient_sharing 
-- ADD CONSTRAINT fk_patient FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE;

-- 6. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_doctor_patient_sharing_doctor 
ON doctor_patient_sharing(doctor_id);

CREATE INDEX IF NOT EXISTS idx_doctor_patient_sharing_patient 
ON doctor_patient_sharing(patient_id);

-- 7. Habilitar RLS (Row Level Security)
ALTER TABLE doctor_patient_sharing ENABLE ROW LEVEL SECURITY;

-- 8. Políticas RLS corrigidas com cast adequado
-- Médicos podem ver compartilhamentos onde são o destinatário
DROP POLICY IF EXISTS "Médicos podem ver seus compartilhamentos" ON doctor_patient_sharing;
CREATE POLICY "Médicos podem ver seus compartilhamentos" 
ON doctor_patient_sharing FOR SELECT 
TO authenticated 
USING (doctor_id = auth.uid()::text);

-- Pacientes podem criar compartilhamentos
DROP POLICY IF EXISTS "Pacientes podem compartilhar dados" ON doctor_patient_sharing;
CREATE POLICY "Pacientes podem compartilhar dados" 
ON doctor_patient_sharing FOR INSERT 
TO authenticated 
WITH CHECK (patient_id = auth.uid()::text);

-- Pacientes podem ver seus próprios compartilhamentos
DROP POLICY IF EXISTS "Pacientes podem ver seus compartilhamentos" ON doctor_patient_sharing;
CREATE POLICY "Pacientes podem ver seus compartilhamentos" 
ON doctor_patient_sharing FOR SELECT 
TO authenticated 
USING (patient_id = auth.uid()::text);

-- Pacientes podem deletar seus compartilhamentos
DROP POLICY IF EXISTS "Pacientes podem remover compartilhamentos" ON doctor_patient_sharing;
CREATE POLICY "Pacientes podem remover compartilhamentos" 
ON doctor_patient_sharing FOR DELETE 
TO authenticated 
USING (patient_id = auth.uid()::text);

-- 9. Verificar estrutura da tabela criada
SELECT 'ESTRUTURA DA NOVA TABELA:' as status;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'doctor_patient_sharing'
ORDER BY ordinal_position;

-- 10. Verificar dados existentes
SELECT 'DADOS EXISTENTES:' as status;
SELECT 
    id,
    doctor_id,
    patient_id,
    shared_at,
    created_at
FROM doctor_patient_sharing 
ORDER BY created_at DESC;

-- 11. Teste de inserção (comentado - descomente para testar)
-- INSERT INTO doctor_patient_sharing (doctor_id, patient_id) 
-- VALUES ('test_doctor_id', 'test_patient_id');

SELECT 'TABELA CRIADA COM SUCESSO!' as status;
