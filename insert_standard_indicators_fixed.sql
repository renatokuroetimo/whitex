-- Inserir indicadores padrão na tabela indicators
-- Execute este script no Supabase SQL Editor para ter indicadores padrão no banco

-- Limpar indicadores padrão existentes (opcional - remova esta linha se quiser manter os existentes)
-- DELETE FROM indicators WHERE is_standard = true OR doctor_id IS NULL;

-- Inserir indicadores padrão
INSERT INTO indicators (
    id, 
    name, 
    category,
    category_id, 
    subcategory_id, 
    parameter, 
    unit_id, 
    unit, 
    unit_symbol, 
    type, 
    is_mandatory, 
    is_standard,
    requires_time,
    requires_date,
    doctor_id, 
    created_at
) VALUES 
-- 1. Pressão Arterial
('std_blood_pressure', 'Pressão Arterial', 'Sinais Vitais', 'cat1', 'sub1', 'Sistólica/Diastólica', 'unit_mmhg', 'mmHg', 'mmHg', 'standard', true, true, false, false, NULL, NOW()),

-- 2. Frequência Cardíaca  
('std_heart_rate', 'Frequência Cardíaca', 'Sinais Vitais', 'cat1', 'sub2', 'Batimentos por minuto', 'unit_bpm', 'bpm', 'bpm', 'standard', false, true, false, false, NULL, NOW()),

-- 3. Temperatura
('std_temperature', 'Temperatura Corporal', 'Sinais Vitais', 'cat1', 'sub3', 'Temperatura', 'unit_celsius', '°C', '°C', 'standard', false, true, false, false, NULL, NOW()),

-- 4. Peso
('std_weight', 'Peso', 'Medidas Antropométricas', 'cat3', 'sub6', 'Peso corporal', 'unit_kg', 'kg', 'kg', 'standard', false, true, false, false, NULL, NOW()),

-- 5. Altura
('std_height', 'Altura', 'Medidas Antropométricas', 'cat3', 'sub7', 'Altura', 'unit_cm', 'cm', 'cm', 'standard', false, true, false, false, NULL, NOW()),

-- 6. Glicemia
('std_glucose', 'Glicemia', 'Exames Laboratoriais', 'cat2', 'sub4', 'Glicose no sangue', 'unit_mgdl', 'mg/dL', 'mg/dL', 'standard', false, true, false, false, NULL, NOW())

ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    category_id = EXCLUDED.category_id,
    subcategory_id = EXCLUDED.subcategory_id,
    parameter = EXCLUDED.parameter,
    unit_symbol = EXCLUDED.unit_symbol,
    is_standard = EXCLUDED.is_standard;

-- Verificar se os indicadores foram inseridos
SELECT id, name, category, parameter, unit_symbol, is_standard 
FROM indicators 
WHERE is_standard = true OR doctor_id IS NULL
ORDER BY created_at;
