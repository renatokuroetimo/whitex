-- Script para adicionar coluna phone à tabela patient_personal_data
-- Execute no Supabase SQL Editor

-- 1. Verificar se a coluna já existe
SELECT 'VERIFICANDO SE COLUNA PHONE EXISTE:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'patient_personal_data'
AND column_name = 'phone';

-- 2. Adicionar coluna phone se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'patient_personal_data' 
        AND column_name = 'phone'
    ) THEN
        ALTER TABLE patient_personal_data 
        ADD COLUMN phone VARCHAR(20);
        
        RAISE NOTICE 'Coluna phone adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna phone já existe na tabela!';
    END IF;
END $$;

-- 3. Verificar estrutura atualizada da tabela
SELECT 'ESTRUTURA ATUALIZADA DA TABELA:' as info;
SELECT column_name, data_type, is_nullable, character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'patient_personal_data'
ORDER BY ordinal_position;

-- 4. Verificar dados existentes
SELECT 'DADOS EXISTENTES (COM PHONE):' as info;
SELECT id, user_id, full_name, phone, created_at
FROM patient_personal_data 
ORDER BY created_at DESC
LIMIT 5;
