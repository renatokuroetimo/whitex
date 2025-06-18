-- ================================================================
-- TABELA PARA OBSERVAÇÕES MÉDICAS DE PACIENTES COMPARTILHADOS
-- (Versão corrigida para compatibilidade de tipos)
-- ================================================================

-- Primeira opção: usar TEXT para compatibilidade
CREATE TABLE IF NOT EXISTS medical_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id TEXT NOT NULL, -- TEXT para compatibilidade com users.id
  doctor_id TEXT REFERENCES users(id) ON DELETE CASCADE, -- TEXT para compatibilidade
  notes TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_medical_notes_patient_id ON medical_notes(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_notes_doctor_id ON medical_notes(doctor_id);

-- RLS (Row Level Security) - desabilitado temporariamente para desenvolvimento
ALTER TABLE medical_notes DISABLE ROW LEVEL SECURITY;
