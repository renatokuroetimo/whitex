-- Adicionar campo email na tabela patient_personal_data se não existir
ALTER TABLE patient_personal_data 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Verificar se a coluna foi adicionada
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'patient_personal_data' 
AND column_name = 'email';
