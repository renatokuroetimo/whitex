-- Fix indicators table schema to match API expectations

-- First, check if table exists and what columns it has
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'indicators' AND table_schema = 'public';

-- Add missing columns if they don't exist
ALTER TABLE indicators 
ADD COLUMN IF NOT EXISTS category_id TEXT,
ADD COLUMN IF NOT EXISTS subcategory_id TEXT,
ADD COLUMN IF NOT EXISTS parameter TEXT,
ADD COLUMN IF NOT EXISTS unit_id TEXT,
ADD COLUMN IF NOT EXISTS unit_symbol TEXT DEFAULT 'un',
ADD COLUMN IF NOT EXISTS is_mandatory BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS doctor_id TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create diagnoses table if it doesn't exist
CREATE TABLE IF NOT EXISTS diagnoses (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  doctor_id TEXT NOT NULL,
  diagnosis TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_indicators_doctor_id ON indicators(doctor_id);
CREATE INDEX IF NOT EXISTS idx_indicators_category_id ON indicators(category_id);
CREATE INDEX IF NOT EXISTS idx_diagnoses_patient_id ON diagnoses(patient_id);
CREATE INDEX IF NOT EXISTS idx_diagnoses_doctor_id ON diagnoses(doctor_id);

-- Fix patient_indicator_values table if needed
ALTER TABLE patient_indicator_values 
ADD COLUMN IF NOT EXISTS patient_id TEXT,
ADD COLUMN IF NOT EXISTS indicator_id TEXT,
ADD COLUMN IF NOT EXISTS value TEXT,
ADD COLUMN IF NOT EXISTS category_name TEXT,
ADD COLUMN IF NOT EXISTS subcategory_name TEXT,
ADD COLUMN IF NOT EXISTS parameter TEXT,
ADD COLUMN IF NOT EXISTS unit_symbol TEXT,
ADD COLUMN IF NOT EXISTS date DATE,
ADD COLUMN IF NOT EXISTS time TIME,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Verify the changes
SELECT 'indicators' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'indicators' AND table_schema = 'public'
UNION ALL
SELECT 'diagnoses' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'diagnoses' AND table_schema = 'public'
UNION ALL
SELECT 'patient_indicator_values' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'patient_indicator_values' AND table_schema = 'public'
ORDER BY table_name, column_name;
