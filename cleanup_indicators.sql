-- Script para limpar indicadores problemáticos e manter apenas os corretos
-- Execute este script no Supabase SQL Editor

-- 1. Primeiro, vamos ver o que temos no banco
SELECT 
    id, 
    name, 
    category, 
    category_id,
    parameter,
    unit_symbol,
    is_standard,
    doctor_id,
    created_at
FROM indicators 
ORDER BY is_standard DESC, created_at;

-- 2. Remover indicadores customizados problemáticos (aqueles sem categoria correta)
-- CUIDADO: Isto vai deletar indicadores customizados que não têm categoria/subcategoria corretas
DELETE FROM indicators 
WHERE (
    (category IS NULL OR category = '' OR category = 'cat1' OR category = 'cat2' OR category = 'cat3')
    AND (is_standard IS NULL OR is_standard = false)
    AND doctor_id IS NOT NULL
);

-- 3. Remover indicadores padrão antigos/duplicados que não estão corretos
DELETE FROM indicators 
WHERE (
    (category IS NULL OR category = '' OR category LIKE 'cat%')
    AND (is_standard = true OR doctor_id IS NULL)
);

-- 4. Agora inserir apenas os indicadores padrão corretos
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

-- 5. Verificar o resultado final
SELECT 
    id, 
    name, 
    category, 
    parameter,
    unit_symbol,
    is_standard,
    doctor_id
FROM indicators 
ORDER BY is_standard DESC, category, name;
