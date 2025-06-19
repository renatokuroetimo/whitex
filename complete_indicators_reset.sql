-- RESET COMPLETO DOS INDICADORES
-- Este script vai deletar TODOS os indicadores e inserir apenas os 6 padrão corretos
-- Execute no Supabase SQL Editor

-- 1. Ver o que temos antes da limpeza
SELECT 'ANTES DA LIMPEZA:' as status;
SELECT count(*) as total_indicadores FROM indicators;
SELECT id, name, category, parameter, is_standard, doctor_id FROM indicators ORDER BY created_at;

-- 2. DELETAR TODOS OS INDICADORES (cuidado!)
DELETE FROM indicators;

-- 3. Confirmar que a tabela está vazia
SELECT 'APÓS LIMPEZA:' as status;
SELECT count(*) as total_indicadores FROM indicators;

-- 4. Inserir APENAS os 6 indicadores padrão corretos
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
('std_glucose', 'Glicemia', 'Exames Laboratoriais', 'cat2', 'sub4', 'Glicose no sangue', 'unit_mgdl', 'mg/dL', 'mg/dL', 'standard', false, true, false, false, NULL, NOW());

-- 5. Verificar resultado final
SELECT 'RESULTADO FINAL:' as status;
SELECT count(*) as total_indicadores FROM indicators;
SELECT 
    id, 
    name, 
    category, 
    parameter,
    unit_symbol,
    is_standard
FROM indicators 
ORDER BY category, name;
