-- Complete database fix for all missing tables and columns

-- 1. Fix indicators table schema
DO $$ 
BEGIN
    -- Add missing columns to indicators table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='indicators' AND column_name='category_id') THEN
        ALTER TABLE indicators ADD COLUMN category_id TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='indicators' AND column_name='subcategory_id') THEN
        ALTER TABLE indicators ADD COLUMN subcategory_id TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='indicators' AND column_name='parameter') THEN
        ALTER TABLE indicators ADD COLUMN parameter TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='indicators' AND column_name='unit_id') THEN
        ALTER TABLE indicators ADD COLUMN unit_id TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='indicators' AND column_name='unit_symbol') THEN
        ALTER TABLE indicators ADD COLUMN unit_symbol TEXT DEFAULT 'un';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='indicators' AND column_name='is_mandatory') THEN
        ALTER TABLE indicators ADD COLUMN is_mandatory BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='indicators' AND column_name='doctor_id') THEN
        ALTER TABLE indicators ADD COLUMN doctor_id TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='indicators' AND column_name='created_at') THEN
        ALTER TABLE indicators ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 2. Create diagnoses table
CREATE TABLE IF NOT EXISTS diagnoses (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    doctor_id TEXT NOT NULL,
    diagnosis TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Fix patient_indicator_values table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patient_indicator_values' AND column_name='patient_id') THEN
        ALTER TABLE patient_indicator_values ADD COLUMN patient_id TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patient_indicator_values' AND column_name='indicator_id') THEN
        ALTER TABLE patient_indicator_values ADD COLUMN indicator_id TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patient_indicator_values' AND column_name='value') THEN
        ALTER TABLE patient_indicator_values ADD COLUMN value TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patient_indicator_values' AND column_name='category_name') THEN
        ALTER TABLE patient_indicator_values ADD COLUMN category_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patient_indicator_values' AND column_name='subcategory_name') THEN
        ALTER TABLE patient_indicator_values ADD COLUMN subcategory_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patient_indicator_values' AND column_name='parameter') THEN
        ALTER TABLE patient_indicator_values ADD COLUMN parameter TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patient_indicator_values' AND column_name='unit_symbol') THEN
        ALTER TABLE patient_indicator_values ADD COLUMN unit_symbol TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patient_indicator_values' AND column_name='date') THEN
        ALTER TABLE patient_indicator_values ADD COLUMN date DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patient_indicator_values' AND column_name='time') THEN
        ALTER TABLE patient_indicator_values ADD COLUMN time TIME;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patient_indicator_values' AND column_name='created_at') THEN
        ALTER TABLE patient_indicator_values ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patient_indicator_values' AND column_name='updated_at') THEN
        ALTER TABLE patient_indicator_values ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 4. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_indicators_doctor_id ON indicators(doctor_id);
CREATE INDEX IF NOT EXISTS idx_indicators_category_id ON indicators(category_id);
CREATE INDEX IF NOT EXISTS idx_diagnoses_patient_id ON diagnoses(patient_id);
CREATE INDEX IF NOT EXISTS idx_diagnoses_doctor_id ON diagnoses(doctor_id);
CREATE INDEX IF NOT EXISTS idx_patient_indicator_values_patient_id ON patient_indicator_values(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_indicator_values_indicator_id ON patient_indicator_values(indicator_id);

-- 5. Clean up any corrupted indicator data that shows as null
UPDATE indicators 
SET 
    category_id = 'cat1' WHERE category_id IS NULL,
    subcategory_id = 'sub1' WHERE subcategory_id IS NULL,
    parameter = name WHERE parameter IS NULL AND name IS NOT NULL,
    parameter = 'Parâmetro' WHERE parameter IS NULL,
    unit_symbol = 'un' WHERE unit_symbol IS NULL,
    is_mandatory = false WHERE is_mandatory IS NULL;

-- 6. Verify the structure
SELECT 
    'indicators' as table_name, 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'indicators' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 
    'diagnoses' as table_name, 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'diagnoses' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 7. Show current indicator data to verify cleanup
SELECT id, name, category_id, subcategory_id, parameter, unit_symbol, doctor_id 
FROM indicators 
WHERE doctor_id IS NOT NULL
LIMIT 10;
