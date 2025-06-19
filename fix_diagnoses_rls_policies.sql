-- Fix RLS policies for diagnoses table

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own diagnoses" ON diagnoses;
DROP POLICY IF EXISTS "Users can insert own diagnoses" ON diagnoses;
DROP POLICY IF EXISTS "Users can update own diagnoses" ON diagnoses;
DROP POLICY IF EXISTS "Doctors can view patient diagnoses" ON diagnoses;
DROP POLICY IF EXISTS "Doctors can insert patient diagnoses" ON diagnoses;
DROP POLICY IF EXISTS "Doctors can update patient diagnoses" ON diagnoses;

-- Ensure the table exists
CREATE TABLE IF NOT EXISTS diagnoses (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    doctor_id TEXT NOT NULL,
    diagnosis TEXT NOT NULL,
    code TEXT,
    date TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;

-- Create simple policies for diagnoses
CREATE POLICY "allow_doctors_full_access_diagnoses" ON diagnoses
    FOR ALL USING (true);

-- Grant permissions
GRANT ALL ON diagnoses TO authenticated;
GRANT ALL ON diagnoses TO anon;

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'diagnoses';
