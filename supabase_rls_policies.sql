-- ================================================================
-- SUPABASE RLS (Row Level Security) POLICIES
-- Execute este script APÓS criar as tabelas com supabase_setup.sql
-- ================================================================

-- ================================================================
-- 1. DESABILITAR RLS TEMPORARIAMENTE PARA PERMITIR INSERÇÕES
-- ================================================================

-- Para desenvolvimento, vamos desabilitar RLS na tabela users
-- para permitir inserções diretas via API
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Desabilitar RLS em outras tabelas também para desenvolvimento
ALTER TABLE patient_personal_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE patient_medical_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE indicators DISABLE ROW LEVEL SECURITY;
ALTER TABLE patient_indicator_values DISABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_patient_sharing DISABLE ROW LEVEL SECURITY;

-- ================================================================
-- 2. CONFIGURAÇÃO ALTERNATIVA - RLS COM POLÍTICAS ABERTAS
-- ================================================================

-- Se preferir manter RLS ativo, use as políticas abaixo:
-- (Execute apenas uma das opções - desabilitar OU políticas abertas)

/*
-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_personal_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_medical_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_indicator_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_patient_sharing ENABLE ROW LEVEL SECURITY;

-- Políticas para tabela users
CREATE POLICY "Allow insert for users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow select for users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow update for users" ON users FOR UPDATE USING (true);
CREATE POLICY "Allow delete for users" ON users FOR DELETE USING (true);

-- Políticas para patient_personal_data
CREATE POLICY "Allow insert for patient_personal_data" ON patient_personal_data FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow select for patient_personal_data" ON patient_personal_data FOR SELECT USING (true);
CREATE POLICY "Allow update for patient_personal_data" ON patient_personal_data FOR UPDATE USING (true);
CREATE POLICY "Allow delete for patient_personal_data" ON patient_personal_data FOR DELETE USING (true);

-- Políticas para patient_medical_data
CREATE POLICY "Allow insert for patient_medical_data" ON patient_medical_data FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow select for patient_medical_data" ON patient_medical_data FOR SELECT USING (true);
CREATE POLICY "Allow update for patient_medical_data" ON patient_medical_data FOR UPDATE USING (true);
CREATE POLICY "Allow delete for patient_medical_data" ON patient_medical_data FOR DELETE USING (true);

-- Políticas para patients
CREATE POLICY "Allow insert for patients" ON patients FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow select for patients" ON patients FOR SELECT USING (true);
CREATE POLICY "Allow update for patients" ON patients FOR UPDATE USING (true);
CREATE POLICY "Allow delete for patients" ON patients FOR DELETE USING (true);

-- Políticas para indicators
CREATE POLICY "Allow insert for indicators" ON indicators FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow select for indicators" ON indicators FOR SELECT USING (true);
CREATE POLICY "Allow update for indicators" ON indicators FOR UPDATE USING (true);
CREATE POLICY "Allow delete for indicators" ON indicators FOR DELETE USING (true);

-- Políticas para patient_indicator_values
CREATE POLICY "Allow insert for patient_indicator_values" ON patient_indicator_values FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow select for patient_indicator_values" ON patient_indicator_values FOR SELECT USING (true);
CREATE POLICY "Allow update for patient_indicator_values" ON patient_indicator_values FOR UPDATE USING (true);
CREATE POLICY "Allow delete for patient_indicator_values" ON patient_indicator_values FOR DELETE USING (true);

-- Políticas para doctor_patient_sharing
CREATE POLICY "Allow insert for doctor_patient_sharing" ON doctor_patient_sharing FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow select for doctor_patient_sharing" ON doctor_patient_sharing FOR SELECT USING (true);
CREATE POLICY "Allow update for doctor_patient_sharing" ON doctor_patient_sharing FOR UPDATE USING (true);
CREATE POLICY "Allow delete for doctor_patient_sharing" ON doctor_patient_sharing FOR DELETE USING (true);
*/

-- ================================================================
-- 3. VERIFICAR SE AS TABELAS FORAM CRIADAS
-- ================================================================

-- Execute esta query para verificar se todas as tabelas existem:
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'patient_personal_data', 'patient_medical_data', 'patients', 'indicators', 'patient_indicator_values', 'doctor_patient_sharing');
