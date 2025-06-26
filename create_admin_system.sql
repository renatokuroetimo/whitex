-- Script para criar sistema de administração
-- Execute este script no SQL Editor do Supabase Dashboard

-- Criar tabela de administradores
CREATE TABLE IF NOT EXISTS public.admins (
  id text NOT NULL PRIMARY KEY DEFAULT (gen_random_uuid())::text,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  full_name text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Inserir admin padrão (senha: Timo@2025)
-- Usando um hash simples para demonstração - em produção usar bcrypt
INSERT INTO public.admins (email, password_hash, full_name) VALUES
('renato@timo.com.br', 'Timo@2025', 'Administrador do Sistema')
ON CONFLICT (email) DO NOTHING;

-- Criar ou atualizar indicadores padrão com type = 'standard'
-- Primeiro, vamos garantir que temos alguns indicadores padrão
INSERT INTO public.indicators (
  id, name, category, subcategory, parameter, unit, unit_symbol, type, 
  is_standard, category_id, subcategory_id, unit_id, is_mandatory,
  requires_date, requires_time, definition, context, data_type, standard_id, source
) VALUES
-- Sinais Vitais
('std_pressure', 'Pressão Arterial', 'Sinais Vitais', 'Pressão Arterial', 'Sistólica/Diastólica', 'mmHg', 'mmHg', 'standard', true, 'cat1', 'sub1', 'unit_mmhg', true, true, false, 'Pressão exercida pelo sangue nas paredes arteriais', 'Clínico', 'texto', 'HL7 FHIR', 'Protocolo Clínico Cardiovascular'),
('std_heart_rate', 'Frequência Cardíaca', 'Sinais Vitais', 'Frequência Cardíaca', 'Batimentos por minuto', 'bpm', 'bpm', 'standard', true, 'cat1', 'sub2', 'unit_bpm', true, true, false, 'Número de batimentos cardíacos por minuto', 'Clínico', 'numero', 'HL7 FHIR', 'Protocolo Clínico Cardiovascular'),
('std_temperature', 'Temperatura Corporal', 'Sinais Vitais', 'Temperatura', 'Temperatura corporal', '°C', '°C', 'standard', true, 'cat1', 'sub3', 'unit_celsius', true, true, false, 'Temperatura interna do corpo humano', 'Clínico', 'numero', 'HL7 FHIR', 'Protocolo Clínico Geral'),
('std_oxygen_sat', 'Saturação de Oxigênio', 'Sinais Vitais', 'Oxigenação', 'SpO2', '%', '%', 'standard', true, 'cat1', 'sub4', 'unit_percent', true, true, false, 'Percentual de saturação de oxigênio no sangue', 'Clínico', 'numero', 'HL7 FHIR', 'Protocolo Clínico Respiratório'),

-- Exames Laboratoriais
('std_glucose', 'Glicemia', 'Exames Laboratoriais', 'Glicemia', 'Glicose no sangue', 'mg/dL', 'mg/dL', 'standard', true, 'cat2', 'sub4', 'unit_mgdl', true, true, false, 'Concentração de glicose no sangue', 'Clínico', 'numero', 'HL7 FHIR', 'Protocolo Laboratorial Endócrino'),
('std_cholesterol', 'Colesterol Total', 'Exames Laboratoriais', 'Colesterol', 'Colesterol total', 'mg/dL', 'mg/dL', 'standard', true, 'cat2', 'sub5', 'unit_mgdl', true, true, false, 'Concentração total de colesterol no sangue', 'Clínico', 'numero', 'HL7 FHIR', 'Protocolo Laboratorial Lipídico'),
('std_hemoglobin', 'Hemoglobina', 'Exames Laboratoriais', 'Hematologia', 'Hemoglobina', 'g/dL', 'g/dL', 'standard', true, 'cat2', 'sub6', 'unit_gdl', true, true, false, 'Concentração de hemoglobina no sangue', 'Clínico', 'numero', 'HL7 FHIR', 'Protocolo Laboratorial Hematológico'),

-- Medidas Antropométricas
('std_weight', 'Peso', 'Medidas Antropométricas', 'Peso', 'Peso corporal', 'kg', 'kg', 'standard', true, 'cat3', 'sub6', 'unit_kg', true, true, false, 'Massa corporal do paciente', 'Clínico', 'numero', 'HL7 FHIR', 'Protocolo Antropométrico'),
('std_height', 'Altura', 'Medidas Antropométricas', 'Altura', 'Altura/Estatura', 'cm', 'cm', 'standard', true, 'cat3', 'sub7', 'unit_cm', true, true, false, 'Altura do paciente em posição ereta', 'Clínico', 'numero', 'HL7 FHIR', 'Protocolo Antropométrico'),
('std_bmi', 'IMC', 'Medidas Antropométricas', 'IMC', 'Índice de Massa Corporal', 'kg/m²', 'kg/m²', 'standard', true, 'cat3', 'sub8', 'unit_kgm2', false, true, false, 'Relação entre peso e altura ao quadrado', 'Clínico', 'numero', 'HL7 FHIR', 'Protocolo Antropométrico')

ON CONFLICT (id) DO UPDATE SET
  type = 'standard',
  is_standard = true,
  updated_at = now();

-- Atualizar indicadores existentes que deveriam ser padrão
UPDATE public.indicators 
SET 
  type = 'standard',
  is_standard = true,
  updated_at = now()
WHERE 
  name IN ('Pressão Arterial', 'Frequência Cardíaca', 'Temperatura Corporal', 'Peso', 'Altura', 'Glicemia', 'IMC')
  OR parameter IN ('Sistólica/Diastólica', 'Batimentos por minuto', 'Temperatura', 'Peso corporal', 'Altura', 'Glicose no sangue');

-- Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_admins_email ON public.admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_active ON public.admins(is_active);
CREATE INDEX IF NOT EXISTS idx_indicators_type ON public.indicators(type);
CREATE INDEX IF NOT EXISTS idx_indicators_standard ON public.indicators(is_standard);

-- Adicionar comentários para documentação
COMMENT ON TABLE public.admins IS 'Tabela de administradores do sistema';
COMMENT ON COLUMN public.admins.email IS 'Email de login do administrador';
COMMENT ON COLUMN public.admins.password_hash IS 'Hash da senha (usar bcrypt em produção)';
COMMENT ON COLUMN public.admins.is_active IS 'Se o administrador está ativo no sistema';

-- Verificar se o admin foi criado
SELECT email, full_name, is_active, created_at 
FROM public.admins 
WHERE email = 'renato@timo.com.br';

-- Verificar indicadores padrão
SELECT id, name, parameter, type, is_standard 
FROM public.indicators 
WHERE type = 'standard' 
ORDER BY category, subcategory, name;
