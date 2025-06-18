-- ================================================================
-- MEDICAL AUTH SYSTEM - SUPABASE DATABASE SETUP
-- ================================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- 1. TABELA DE USUÁRIOS (substitui auth localStorage)
-- ================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  profession TEXT NOT NULL CHECK (profession IN ('medico', 'paciente')),
  crm TEXT, -- Apenas para médicos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- 2. DADOS PESSOAIS DOS PACIENTES
-- ================================================================
CREATE TABLE IF NOT EXISTS patient_personal_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT,
  birth_date DATE,
  gender TEXT CHECK (gender IN ('masculino', 'feminino', 'outro')),
  state TEXT,
  city TEXT,
  health_plan TEXT,
  profile_image TEXT, -- Base64 ou URL
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- 3. DADOS MÉDICOS DOS PACIENTES
-- ================================================================
CREATE TABLE IF NOT EXISTS patient_medical_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  height INTEGER, -- em cm
  weight DECIMAL(5,2), -- em kg
  smoker BOOLEAN DEFAULT FALSE,
  high_blood_pressure BOOLEAN DEFAULT FALSE,
  physical_activity BOOLEAN DEFAULT FALSE,
  exercise_frequency TEXT CHECK (exercise_frequency IN ('nunca', 'raramente', 'semanalmente', 'diariamente')),
  healthy_diet BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- 4. PACIENTES (para médicos)
-- ================================================================
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  patient_user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Se for paciente registrado
  name TEXT NOT NULL,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'compartilhado', 'inativo')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- 5. INDICADORES
-- ================================================================
CREATE TABLE IF NOT EXISTS indicators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_name TEXT NOT NULL,
  subcategory_name TEXT NOT NULL,
  parameter TEXT NOT NULL,
  unit_symbol TEXT NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  is_standard BOOLEAN DEFAULT FALSE, -- Indicadores padrão do sistema
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- 6. VALORES DOS INDICADORES DOS PACIENTES
-- ================================================================
CREATE TABLE IF NOT EXISTS patient_indicator_values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  indicator_id UUID REFERENCES indicators(id) ON DELETE CASCADE,
  category_name TEXT NOT NULL, -- Denormalizado para performance
  subcategory_name TEXT NOT NULL,
  parameter TEXT NOT NULL,
  unit_symbol TEXT NOT NULL,
  value TEXT NOT NULL,
  date DATE,
  time TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- 7. COMPARTILHAMENTO MÉDICO-PACIENTE
-- ================================================================
CREATE TABLE IF NOT EXISTS doctor_patient_sharing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(doctor_id, patient_id)
);

-- ================================================================
-- 8. DIAGNÓSTICOS DOS PACIENTES
-- ================================================================
CREATE TABLE IF NOT EXISTS patient_diagnoses (
  id TEXT PRIMARY KEY, -- Using TEXT to match application ID generation
  patient_id TEXT NOT NULL, -- Reference to patient
  date TEXT NOT NULL, -- Date as string (DD/MM/YYYY format)
  status TEXT NOT NULL, -- Diagnosis description
  code TEXT NOT NULL, -- CID code
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- 9. ÍNDICES PARA PERFORMANCE
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_profession ON users(profession);
CREATE INDEX IF NOT EXISTS idx_patient_personal_data_user_id ON patient_personal_data(user_id);
CREATE INDEX IF NOT EXISTS idx_patient_medical_data_user_id ON patient_medical_data(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_doctor_id ON patients(doctor_id);
CREATE INDEX IF NOT EXISTS idx_patient_indicator_values_user_id ON patient_indicator_values(user_id);
CREATE INDEX IF NOT EXISTS idx_patient_indicator_values_date ON patient_indicator_values(date);
CREATE INDEX IF NOT EXISTS idx_doctor_patient_sharing_doctor_id ON doctor_patient_sharing(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_patient_sharing_patient_id ON doctor_patient_sharing(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_diagnoses_patient_id ON patient_diagnoses(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_diagnoses_date ON patient_diagnoses(date);

-- ================================================================
-- 9. TRIGGERS PARA UPDATED_AT AUTOMÁTICO
-- ================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar triggers em todas as tabelas
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patient_personal_data_updated_at BEFORE UPDATE ON patient_personal_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patient_medical_data_updated_at BEFORE UPDATE ON patient_medical_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_indicators_updated_at BEFORE UPDATE ON indicators FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patient_indicator_values_updated_at BEFORE UPDATE ON patient_indicator_values FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patient_diagnoses_updated_at BEFORE UPDATE ON patient_diagnoses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- 10. RLS (ROW LEVEL SECURITY) - OPCIONAL PARA SEGURANÇA EXTRA
-- ================================================================
-- Uncomment if you want to enable RLS later
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE patient_personal_data ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE patient_medical_data ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE patient_indicator_values ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE doctor_patient_sharing ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- 11. INSERIR INDICADORES PADRÃO DO SISTEMA
-- ================================================================
-- Estes indicadores são os mesmos que já existem no sistema
INSERT INTO indicators (category_name, subcategory_name, parameter, unit_symbol, is_standard) VALUES
('Cardiovascular', 'Pressão Arterial', 'Pressão Sistólica', 'mmHg', TRUE),
('Cardiovascular', 'Pressão Arterial', 'Pressão Diastólica', 'mmHg', TRUE),
('Cardiovascular', 'Frequência Cardíaca', 'Frequência de Repouso', 'bpm', TRUE),
('Metabólico', 'Glicemia', 'Glicemia em Jejum', 'mg/dL', TRUE),
('Metabólico', 'Glicemia', 'Glicemia Pós-Prandial', 'mg/dL', TRUE),
('Metabólico', 'Colesterol', 'Colesterol Total', 'mg/dL', TRUE),
('Metabólico', 'Colesterol', 'HDL', 'mg/dL', TRUE),
('Metabólico', 'Colesterol', 'LDL', 'mg/dL', TRUE),
('Antropométrico', 'Peso e Altura', 'Peso', 'kg', TRUE),
('Antropométrico', 'Peso e Altura', 'Altura', 'cm', TRUE),
('Antropométrico', 'Composição Corporal', 'IMC', 'kg/m²', TRUE),
('Renal', 'Função Renal', 'Creatinina', 'mg/dL', TRUE),
('Renal', 'Função Renal', 'Ureia', 'mg/dL', TRUE),
('Hematológico', 'Hemograma', 'Hemoglobina', 'g/dL', TRUE),
('Hematológico', 'Hemograma', 'Hematócrito', '%', TRUE),
('Respiratório', 'Oxigenação', 'Saturação O2', '%', TRUE)
ON CONFLICT DO NOTHING;

-- ================================================================
-- SETUP COMPLETO!
-- ================================================================
-- Execute este script no SQL Editor do Supabase
-- Após executar, todas as tabelas estarão prontas para uso
