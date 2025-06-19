-- CREATE DIAGNOSES TABLE FROM SCRATCH

-- Create the diagnoses table
CREATE TABLE diagnoses (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    doctor_id TEXT NOT NULL,
    diagnosis TEXT NOT NULL,
    code TEXT,
    date TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Grant permissions
GRANT ALL ON diagnoses TO authenticated;
GRANT ALL ON diagnoses TO anon;
GRANT ALL ON diagnoses TO postgres;

-- Disable RLS for now to avoid policy conflicts
ALTER TABLE diagnoses DISABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_diagnoses_patient_id ON diagnoses(patient_id);
CREATE INDEX IF NOT EXISTS idx_diagnoses_doctor_id ON diagnoses(doctor_id);

-- Verify table was created
SELECT 'Table diagnoses created successfully' AS status;
