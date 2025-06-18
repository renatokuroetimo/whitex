-- Adicionar todas as colunas necessárias para patient_indicator_values
ALTER TABLE patient_indicator_values 
ADD COLUMN IF NOT EXISTS date DATE,
ADD COLUMN IF NOT EXISTS time TIME,
ADD COLUMN IF NOT EXISTS category_name TEXT,
ADD COLUMN IF NOT EXISTS subcategory_name TEXT,
ADD COLUMN IF NOT EXISTS parameter TEXT,
ADD COLUMN IF NOT EXISTS unit_symbol TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Verificar estrutura da tabela
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'patient_indicator_values' 
ORDER BY ordinal_position;
