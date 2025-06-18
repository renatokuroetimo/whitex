-- ================================================================
-- TABELA PARA OBSERVAÇÕES MÉDICAS DE PACIENTES COMPARTILHADOS
-- ================================================================

CREATE TABLE IF NOT EXISTS medical_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL, -- ID do paciente (user)
  doctor_id UUID REFERENCES users(id) ON DELETE CASCADE, -- Médico que fez a observação
  notes TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_medical_notes_patient_id ON medical_notes(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_notes_doctor_id ON medical_notes(doctor_id);

-- RLS (Row Level Security) - desabilitado temporariamente para desenvolvimento
ALTER TABLE medical_notes DISABLE ROW LEVEL SECURITY;
