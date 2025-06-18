-- Tabela para configurações de visibilidade dos indicadores padrão por médico
CREATE TABLE doctor_standard_indicator_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  standard_indicator_id TEXT NOT NULL,
  visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(doctor_id, standard_indicator_id)
);

-- Índices para performance
CREATE INDEX idx_doctor_standard_indicator_settings_doctor_id ON doctor_standard_indicator_settings(doctor_id);
CREATE INDEX idx_doctor_standard_indicator_settings_indicator_id ON doctor_standard_indicator_settings(standard_indicator_id);

-- RLS (Row Level Security)
ALTER TABLE doctor_standard_indicator_settings ENABLE ROW LEVEL SECURITY;

-- Política: médicos só podem ver/editar suas próprias configurações
CREATE POLICY "Doctors can view own indicator settings" ON doctor_standard_indicator_settings
  FOR SELECT USING (doctor_id = auth.uid()::text);

CREATE POLICY "Doctors can insert own indicator settings" ON doctor_standard_indicator_settings
  FOR INSERT WITH CHECK (doctor_id = auth.uid()::text);

CREATE POLICY "Doctors can update own indicator settings" ON doctor_standard_indicator_settings
  FOR UPDATE USING (doctor_id = auth.uid()::text);

CREATE POLICY "Doctors can delete own indicator settings" ON doctor_standard_indicator_settings
  FOR DELETE USING (doctor_id = auth.uid()::text);
