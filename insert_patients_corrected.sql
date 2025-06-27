-- Script corrigido: 10 pacientes + 100 indicadores médicos
-- Usando IDs reais da tabela indicators e preenchendo todos os campos
-- Vinculados ao médico: 94e784dd-797a-4962-81ae-825e7060352e

DO $$
DECLARE
    patient_ids UUID[] := ARRAY[
        gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
        gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid()
    ];
    doctor_id UUID := '94e784dd-797a-4962-81ae-825e7060352e';
    base_date DATE := CURRENT_DATE - INTERVAL '6 months';
BEGIN

-- =====================================================
-- INSERIR PACIENTES NA TABELA PATIENTS
-- =====================================================
INSERT INTO patients (id, name, status, notes, doctor_id, created_at) VALUES
(patient_ids[1], 'Maria Silva Santos', 'ativo', 'Hipertensa - Controle medicamentoso em andamento', doctor_id, base_date),
(patient_ids[2], 'João Carlos Oliveira', 'ativo', 'Diabetes tipo 2 - Dieta e exercícios, uso de metformina', doctor_id, base_date),
(patient_ids[3], 'Ana Beatriz Costa', 'ativo', 'Prevenção - Jovem saudável, acompanhamento preventivo', doctor_id, base_date),
(patient_ids[4], 'Carlos Eduardo Ferreira', 'ativo', 'Cardiopatia - Histórico de infarto, uso de AAS e estatina', doctor_id, base_date),
(patient_ids[5], 'Fernanda Cristina Lima', 'ativo', 'Gestante - 28 semanas, pré-natal sem intercorrências', doctor_id, base_date),
(patient_ids[6], 'Roberto José Mendes', 'ativo', 'Obesidade grau II - IMC 37, programa de emagrecimento', doctor_id, base_date),
(patient_ids[7], 'Juliana Aparecida Rocha', 'ativo', 'Asma moderada - Uso de broncodilatador e corticoide inalatório', doctor_id, base_date),
(patient_ids[8], 'Pedro Henrique Almeida', 'ativo', 'Atleta - Corredor de maratona, acompanhamento esportivo', doctor_id, base_date),
(patient_ids[9], 'Luciana Regina Barbosa', 'ativo', 'Artrite reumatoide - Tratamento com metotrexato', doctor_id, base_date),
(patient_ids[10], 'Marcos Antonio Pereira', 'ativo', 'Idoso - Hipertensão, diabetes, dislipidemia', doctor_id, base_date);

-- =====================================================
-- INDICADORES MÉDICOS - USANDO IDs REAIS DA TABELA INDICATORS
-- =====================================================

-- ===== MARIA SILVA SANTOS - HIPERTENSA =====
INSERT INTO patient_indicator_values (id, patient_id, indicator_id, category_name, subcategory_name, parameter, unit_symbol, value, created_at, updated_at) VALUES
(gen_random_uuid(), patient_ids[1], 'med_blood_pressure', 'Sinais Vitais', 'Pressão Arterial', 'Pressão Arterial Sistólica', 'mmHg', '165', base_date, base_date),
(gen_random_uuid(), patient_ids[1], 'med_blood_pressure', 'Sinais Vitais', 'Pressão Arterial', 'Pressão Arterial Sistólica', 'mmHg', '158', base_date + INTERVAL '2 weeks', base_date + INTERVAL '2 weeks'),
(gen_random_uuid(), patient_ids[1], 'med_blood_pressure', 'Sinais Vitais', 'Pressão Arterial', 'Pressão Arterial Sistólica', 'mmHg', '152', base_date + INTERVAL '1 month', base_date + INTERVAL '1 month'),
(gen_random_uuid(), patient_ids[1], 'med_blood_pressure', 'Sinais Vitais', 'Pressão Arterial', 'Pressão Arterial Sistólica', 'mmHg', '145', base_date + INTERVAL '2 months', base_date + INTERVAL '2 months'),
(gen_random_uuid(), patient_ids[1], 'med_blood_pressure', 'Sinais Vitais', 'Pressão Arterial', 'Pressão Arterial Sistólica', 'mmHg', '138', base_date + INTERVAL '3 months', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[1], 'med_blood_pressure', 'Sinais Vitais', 'Pressão Arterial', 'Pressão Arterial Sistólica', 'mmHg', '135', base_date + INTERVAL '4 months', base_date + INTERVAL '4 months'),
(gen_random_uuid(), patient_ids[1], 'med_blood_pressure', 'Sinais Vitais', 'Pressão Arterial', 'Pressão Arterial Sistólica', 'mmHg', '132', base_date + INTERVAL '5 months', base_date + INTERVAL '5 months'),
(gen_random_uuid(), patient_ids[1], 'met_weight', 'Medidas Antropométricas', 'Peso', 'Peso Corporal', 'kg', '68.5', base_date, base_date),
(gen_random_uuid(), patient_ids[1], 'met_weight', 'Medidas Antropométricas', 'Peso', 'Peso Corporal', 'kg', '67.2', base_date + INTERVAL '3 months', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[1], 'med_heart_rate', 'Sinais Vitais', 'Frequência Cardíaca', 'Frequência Cardíaca', 'bpm', '82', base_date + INTERVAL '5 months', base_date + INTERVAL '5 months');

-- ===== JOÃO CARLOS OLIVEIRA - DIABÉTICO =====
INSERT INTO patient_indicator_values (id, patient_id, indicator_id, category_name, subcategory_name, parameter, unit_symbol, value, created_at, updated_at) VALUES
(gen_random_uuid(), patient_ids[2], 'lab_glucose', 'Exames Laboratoriais', 'Glicemia', 'Glicemia de Jejum', 'mg/dL', '185', base_date, base_date),
(gen_random_uuid(), patient_ids[2], 'lab_glucose', 'Exames Laboratoriais', 'Glicemia', 'Glicemia de Jejum', 'mg/dL', '165', base_date + INTERVAL '1 month', base_date + INTERVAL '1 month'),
(gen_random_uuid(), patient_ids[2], 'lab_glucose', 'Exames Laboratoriais', 'Glicemia', 'Glicemia de Jejum', 'mg/dL', '142', base_date + INTERVAL '2 months', base_date + INTERVAL '2 months'),
(gen_random_uuid(), patient_ids[2], 'lab_glucose', 'Exames Laboratoriais', 'Glicemia', 'Glicemia de Jejum', 'mg/dL', '158', base_date + INTERVAL '3 months', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[2], 'lab_glucose', 'Exames Laboratoriais', 'Glicemia', 'Glicemia de Jejum', 'mg/dL', '138', base_date + INTERVAL '4 months', base_date + INTERVAL '4 months'),
(gen_random_uuid(), patient_ids[2], 'lab_hba1c', 'Exames Laboratoriais', 'Hemoglobina Glicada', 'HbA1c', '%', '9.2', base_date, base_date),
(gen_random_uuid(), patient_ids[2], 'lab_hba1c', 'Exames Laboratoriais', 'Hemoglobina Glicada', 'HbA1c', '%', '7.8', base_date + INTERVAL '3 months', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[2], 'met_weight', 'Medidas Antropométricas', 'Peso', 'Peso Corporal', 'kg', '82.3', base_date, base_date),
(gen_random_uuid(), patient_ids[2], 'met_weight', 'Medidas Antropométricas', 'Peso', 'Peso Corporal', 'kg', '79.5', base_date + INTERVAL '4 months', base_date + INTERVAL '4 months'),
(gen_random_uuid(), patient_ids[2], 'met_waist_circumference', 'Medidas Antropométricas', 'Circunferência', 'Circunferência Abdominal', 'cm', '98', base_date + INTERVAL '5 months', base_date + INTERVAL '5 months');

-- ===== ANA BEATRIZ COSTA - PREVENÇÃO =====
INSERT INTO patient_indicator_values (id, patient_id, indicator_id, category_name, subcategory_name, parameter, unit_symbol, value, created_at, updated_at) VALUES
(gen_random_uuid(), patient_ids[3], 'lab_cholesterol', 'Exames Laboratoriais', 'Lipidograma', 'Colesterol Total', 'mg/dL', '180', base_date, base_date),
(gen_random_uuid(), patient_ids[3], 'lab_hdl', 'Exames Laboratoriais', 'Lipidograma', 'HDL Colesterol', 'mg/dL', '65', base_date, base_date),
(gen_random_uuid(), patient_ids[3], 'lab_ldl', 'Exames Laboratoriais', 'Lipidograma', 'LDL Colesterol', 'mg/dL', '98', base_date, base_date),
(gen_random_uuid(), patient_ids[3], 'lab_triglycerides', 'Exames Laboratoriais', 'Lipidograma', 'Triglicérides', 'mg/dL', '85', base_date, base_date),
(gen_random_uuid(), patient_ids[3], 'med_blood_pressure', 'Sinais Vitais', 'Pressão Arterial', 'Pressão Arterial Sistólica', 'mmHg', '115', base_date, base_date),
(gen_random_uuid(), patient_ids[3], 'med_diastolic', 'Sinais Vitais', 'Pressão Arterial', 'Pressão Arterial Diastólica', 'mmHg', '75', base_date, base_date),
(gen_random_uuid(), patient_ids[3], 'lab_glucose', 'Exames Laboratoriais', 'Glicemia', 'Glicemia de Jejum', 'mg/dL', '88', base_date, base_date),
(gen_random_uuid(), patient_ids[3], 'met_weight', 'Medidas Antropométricas', 'Peso', 'Peso Corporal', 'kg', '58.7', base_date, base_date),
(gen_random_uuid(), patient_ids[3], 'met_bmi', 'Medidas Antropométricas', 'IMC', 'Índice de Massa Corporal', 'kg/m²', '22.4', base_date, base_date),
(gen_random_uuid(), patient_ids[3], 'lab_vitamin_d', 'Exames Laboratoriais', 'Vitaminas', 'Vitamina D', 'ng/mL', '32', base_date + INTERVAL '3 months', base_date + INTERVAL '3 months');

-- ===== CARLOS EDUARDO FERREIRA - CARDIOPATA =====
INSERT INTO patient_indicator_values (id, patient_id, indicator_id, category_name, subcategory_name, parameter, unit_symbol, value, created_at, updated_at) VALUES
(gen_random_uuid(), patient_ids[4], 'med_blood_pressure', 'Sinais Vitais', 'Pressão Arterial', 'Pressão Arterial Sistólica', 'mmHg', '160', base_date, base_date),
(gen_random_uuid(), patient_ids[4], 'med_blood_pressure', 'Sinais Vitais', 'Pressão Arterial', 'Pressão Arterial Sistólica', 'mmHg', '145', base_date + INTERVAL '1 month', base_date + INTERVAL '1 month'),
(gen_random_uuid(), patient_ids[4], 'med_blood_pressure', 'Sinais Vitais', 'Pressão Arterial', 'Pressão Arterial Sistólica', 'mmHg', '138', base_date + INTERVAL '3 months', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[4], 'lab_ldl', 'Exames Laboratoriais', 'Lipidograma', 'LDL Colesterol', 'mg/dL', '165', base_date, base_date),
(gen_random_uuid(), patient_ids[4], 'lab_ldl', 'Exames Laboratoriais', 'Lipidograma', 'LDL Colesterol', 'mg/dL', '120', base_date + INTERVAL '2 months', base_date + INTERVAL '2 months'),
(gen_random_uuid(), patient_ids[4], 'lab_ldl', 'Exames Laboratoriais', 'Lipidograma', 'LDL Colesterol', 'mg/dL', '88', base_date + INTERVAL '4 months', base_date + INTERVAL '4 months'),
(gen_random_uuid(), patient_ids[4], 'med_heart_rate', 'Sinais Vitais', 'Frequência Cardíaca', 'Frequência Cardíaca', 'bpm', '88', base_date, base_date),
(gen_random_uuid(), patient_ids[4], 'met_weight', 'Medidas Antropométricas', 'Peso', 'Peso Corporal', 'kg', '95.1', base_date, base_date),
(gen_random_uuid(), patient_ids[4], 'met_weight', 'Medidas Antropométricas', 'Peso', 'Peso Corporal', 'kg', '92.3', base_date + INTERVAL '3 months', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[4], 'lab_troponin', 'Exames Laboratoriais', 'Marcadores Cardíacos', 'Troponina', 'ng/mL', '0.02', base_date + INTERVAL '5 months', base_date + INTERVAL '5 months');

-- ===== FERNANDA CRISTINA LIMA - GESTANTE =====
INSERT INTO patient_indicator_values (id, patient_id, indicator_id, category_name, subcategory_name, parameter, unit_symbol, value, created_at, updated_at) VALUES
(gen_random_uuid(), patient_ids[5], 'met_weight', 'Medidas Antropométricas', 'Peso', 'Peso Corporal', 'kg', '65.2', base_date, base_date),
(gen_random_uuid(), patient_ids[5], 'met_weight', 'Medidas Antropométricas', 'Peso', 'Peso Corporal', 'kg', '67.8', base_date + INTERVAL '1 month', base_date + INTERVAL '1 month'),
(gen_random_uuid(), patient_ids[5], 'met_weight', 'Medidas Antropométricas', 'Peso', 'Peso Corporal', 'kg', '70.1', base_date + INTERVAL '2 months', base_date + INTERVAL '2 months'),
(gen_random_uuid(), patient_ids[5], 'med_blood_pressure', 'Sinais Vitais', 'Pressão Arterial', 'Pressão Arterial Sistólica', 'mmHg', '118', base_date, base_date),
(gen_random_uuid(), patient_ids[5], 'med_blood_pressure', 'Sinais Vitais', 'Pressão Arterial', 'Pressão Arterial Sistólica', 'mmHg', '125', base_date + INTERVAL '2 months', base_date + INTERVAL '2 months'),
(gen_random_uuid(), patient_ids[5], 'lab_glucose', 'Exames Laboratoriais', 'Glicemia', 'Glicemia de Jejum', 'mg/dL', '85', base_date, base_date),
(gen_random_uuid(), patient_ids[5], 'lab_gtt', 'Exames Laboratoriais', 'Teste de Tolerância', 'Teste de Tolerância à Glicose', 'mg/dL', '145', base_date + INTERVAL '1 month', base_date + INTERVAL '1 month'),
(gen_random_uuid(), patient_ids[5], 'lab_hemoglobin', 'Exames Laboratoriais', 'Hemograma', 'Hemoglobina', 'g/dL', '11.8', base_date, base_date),
(gen_random_uuid(), patient_ids[5], 'lab_hemoglobin', 'Exames Laboratoriais', 'Hemograma', 'Hemoglobina', 'g/dL', '12.2', base_date + INTERVAL '2 months', base_date + INTERVAL '2 months'),
(gen_random_uuid(), patient_ids[5], 'obs_fundal_height', 'Ginecologia/Obstetrícia', 'Medidas Gestacionais', 'Altura Uterina', 'cm', '28', base_date + INTERVAL '2 months', base_date + INTERVAL '2 months');

-- ===== ROBERTO JOSÉ MENDES - OBESO =====
INSERT INTO patient_indicator_values (id, patient_id, indicator_id, category_name, subcategory_name, parameter, unit_symbol, value, created_at, updated_at) VALUES
(gen_random_uuid(), patient_ids[6], 'met_weight', 'Medidas Antropométricas', 'Peso', 'Peso Corporal', 'kg', '110.8', base_date, base_date),
(gen_random_uuid(), patient_ids[6], 'met_weight', 'Medidas Antropométricas', 'Peso', 'Peso Corporal', 'kg', '108.2', base_date + INTERVAL '1 month', base_date + INTERVAL '1 month'),
(gen_random_uuid(), patient_ids[6], 'met_weight', 'Medidas Antropométricas', 'Peso', 'Peso Corporal', 'kg', '106.5', base_date + INTERVAL '2 months', base_date + INTERVAL '2 months'),
(gen_random_uuid(), patient_ids[6], 'met_weight', 'Medidas Antropométricas', 'Peso', 'Peso Corporal', 'kg', '104.1', base_date + INTERVAL '3 months', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[6], 'met_weight', 'Medidas Antropométricas', 'Peso', 'Peso Corporal', 'kg', '103.8', base_date + INTERVAL '4 months', base_date + INTERVAL '4 months'),
(gen_random_uuid(), patient_ids[6], 'met_bmi', 'Medidas Antropométricas', 'IMC', 'Índice de Massa Corporal', 'kg/m²', '37.5', base_date, base_date),
(gen_random_uuid(), patient_ids[6], 'met_bmi', 'Medidas Antropométricas', 'IMC', 'Índice de Massa Corporal', 'kg/m²', '35.1', base_date + INTERVAL '4 months', base_date + INTERVAL '4 months'),
(gen_random_uuid(), patient_ids[6], 'met_waist_circumference', 'Medidas Antropométricas', 'Circunferência', 'Circunferência Abdominal', 'cm', '118', base_date, base_date),
(gen_random_uuid(), patient_ids[6], 'met_waist_circumference', 'Medidas Antropométricas', 'Circunferência', 'Circunferência Abdominal', 'cm', '112', base_date + INTERVAL '4 months', base_date + INTERVAL '4 months'),
(gen_random_uuid(), patient_ids[6], 'med_blood_pressure', 'Sinais Vitais', 'Pressão Arterial', 'Pressão Arterial Sistólica', 'mmHg', '142', base_date + INTERVAL '5 months', base_date + INTERVAL '5 months');

-- ===== JULIANA APARECIDA ROCHA - ASMÁTICA =====
INSERT INTO patient_indicator_values (id, patient_id, indicator_id, category_name, subcategory_name, parameter, unit_symbol, value, created_at, updated_at) VALUES
(gen_random_uuid(), patient_ids[7], 'res_peak_flow', 'Sistema Respiratório', 'Função Pulmonar', 'Peak Flow', 'L/min', '320', base_date, base_date),
(gen_random_uuid(), patient_ids[7], 'res_peak_flow', 'Sistema Respiratório', 'Função Pulmonar', 'Peak Flow', 'L/min', '385', base_date + INTERVAL '1 month', base_date + INTERVAL '1 month'),
(gen_random_uuid(), patient_ids[7], 'res_peak_flow', 'Sistema Respiratório', 'Função Pulmonar', 'Peak Flow', 'L/min', '420', base_date + INTERVAL '3 months', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[7], 'res_peak_flow', 'Sistema Respiratório', 'Função Pulmonar', 'Peak Flow', 'L/min', '380', base_date + INTERVAL '4 months', base_date + INTERVAL '4 months'),
(gen_random_uuid(), patient_ids[7], 'med_medication_usage', 'Tratamento', 'Uso de Medicamentos', 'Uso de Broncodilatador', 'doses/dia', '4', base_date, base_date),
(gen_random_uuid(), patient_ids[7], 'med_medication_usage', 'Tratamento', 'Uso de Medicamentos', 'Uso de Broncodilatador', 'doses/dia', '2', base_date + INTERVAL '2 months', base_date + INTERVAL '2 months'),
(gen_random_uuid(), patient_ids[7], 'med_medication_usage', 'Tratamento', 'Uso de Medicamentos', 'Uso de Broncodilatador', 'doses/dia', '1', base_date + INTERVAL '3 months', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[7], 'med_oxygen_saturation', 'Sinais Vitais', 'Oxigenação', 'Saturação de Oxigênio', '%', '96', base_date, base_date),
(gen_random_uuid(), patient_ids[7], 'med_oxygen_saturation', 'Sinais Vitais', 'Oxigenação', 'Saturação de Oxigênio', '%', '99', base_date + INTERVAL '3 months', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[7], 'lab_ige', 'Exames Laboratoriais', 'Imunologia', 'IgE Total', 'UI/mL', '450', base_date + INTERVAL '2 months', base_date + INTERVAL '2 months');

-- ===== PEDRO HENRIQUE ALMEIDA - ATLETA =====
INSERT INTO patient_indicator_values (id, patient_id, indicator_id, category_name, subcategory_name, parameter, unit_symbol, value, created_at, updated_at) VALUES
(gen_random_uuid(), patient_ids[8], 'med_resting_heart_rate', 'Sinais Vitais', 'Frequência Cardíaca', 'Frequência Cardíaca de Repouso', 'bpm', '48', base_date, base_date),
(gen_random_uuid(), patient_ids[8], 'med_resting_heart_rate', 'Sinais Vitais', 'Frequência Cardíaca', 'Frequência Cardíaca de Repouso', 'bpm', '45', base_date + INTERVAL '2 months', base_date + INTERVAL '2 months'),
(gen_random_uuid(), patient_ids[8], 'spt_vo2_max', 'Performance Física', 'Capacidade Aeróbica', 'VO2 Máximo', 'ml/kg/min', '68', base_date, base_date),
(gen_random_uuid(), patient_ids[8], 'spt_vo2_max', 'Performance Física', 'Capacidade Aeróbica', 'VO2 Máximo', 'ml/kg/min', '72', base_date + INTERVAL '3 months', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[8], 'met_weight', 'Medidas Antropométricas', 'Peso', 'Peso Corporal', 'kg', '75.6', base_date, base_date),
(gen_random_uuid(), patient_ids[8], 'met_weight', 'Medidas Antropométricas', 'Peso', 'Peso Corporal', 'kg', '74.8', base_date + INTERVAL '2 months', base_date + INTERVAL '2 months'),
(gen_random_uuid(), patient_ids[8], 'met_body_fat', 'Medidas Antropométricas', 'Composição Corporal', 'Percentual de Gordura', '%', '8.5', base_date, base_date),
(gen_random_uuid(), patient_ids[8], 'lab_lactate', 'Exames Laboratoriais', 'Performance', 'Lactato', 'mmol/L', '12.8', base_date + INTERVAL '1 month', base_date + INTERVAL '1 month'),
(gen_random_uuid(), patient_ids[8], 'lab_ferritin', 'Exames Laboratoriais', 'Hematologia', 'Ferritina', 'ng/mL', '45', base_date + INTERVAL '3 months', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[8], 'lab_creatine_kinase', 'Exames Laboratoriais', 'Enzimas Musculares', 'Creatina Quinase', 'U/L', '180', base_date + INTERVAL '4 months', base_date + INTERVAL '4 months');

-- ===== LUCIANA REGINA BARBOSA - ARTRITE REUMATOIDE =====
INSERT INTO patient_indicator_values (id, patient_id, indicator_id, category_name, subcategory_name, parameter, unit_symbol, value, created_at, updated_at) VALUES
(gen_random_uuid(), patient_ids[9], 'qol_pain_scale', 'Qualidade de Vida', 'Avaliação da Dor', 'Escala Visual Analógica de Dor', 'escala 0-10', '8', base_date, base_date),
(gen_random_uuid(), patient_ids[9], 'qol_pain_scale', 'Qualidade de Vida', 'Avaliação da Dor', 'Escala Visual Analógica de Dor', 'escala 0-10', '6', base_date + INTERVAL '1 month', base_date + INTERVAL '1 month'),
(gen_random_uuid(), patient_ids[9], 'qol_pain_scale', 'Qualidade de Vida', 'Avaliação da Dor', 'Escala Visual Analógica de Dor', 'escala 0-10', '4', base_date + INTERVAL '2 months', base_date + INTERVAL '2 months'),
(gen_random_uuid(), patient_ids[9], 'qol_pain_scale', 'Qualidade de Vida', 'Avaliação da Dor', 'Escala Visual Analógica de Dor', 'escala 0-10', '7', base_date + INTERVAL '3 months', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[9], 'qol_pain_scale', 'Qualidade de Vida', 'Avaliação da Dor', 'Escala Visual Analógica de Dor', 'escala 0-10', '3', base_date + INTERVAL '4 months', base_date + INTERVAL '4 months'),
(gen_random_uuid(), patient_ids[9], 'lab_crp', 'Exames Laboratoriais', 'Inflamação', 'Proteína C Reativa', 'mg/L', '45', base_date, base_date),
(gen_random_uuid(), patient_ids[9], 'lab_crp', 'Exames Laboratoriais', 'Inflamação', 'Proteína C Reativa', 'mg/L', '18', base_date + INTERVAL '2 months', base_date + INTERVAL '2 months'),
(gen_random_uuid(), patient_ids[9], 'lab_crp', 'Exames Laboratoriais', 'Inflamação', 'Proteína C Reativa', 'mg/L', '8', base_date + INTERVAL '4 months', base_date + INTERVAL '4 months'),
(gen_random_uuid(), patient_ids[9], 'qol_morning_stiffness', 'Qualidade de Vida', 'Sintomas Articulares', 'Rigidez Matinal', 'minutos', '120', base_date, base_date),
(gen_random_uuid(), patient_ids[9], 'qol_morning_stiffness', 'Qualidade de Vida', 'Sintomas Articulares', 'Rigidez Matinal', 'minutos', '30', base_date + INTERVAL '4 months', base_date + INTERVAL '4 months');

-- ===== MARCOS ANTONIO PEREIRA - IDOSO POLIMÓRBIDO =====
INSERT INTO patient_indicator_values (id, patient_id, indicator_id, category_name, subcategory_name, parameter, unit_symbol, value, created_at, updated_at) VALUES
(gen_random_uuid(), patient_ids[10], 'med_blood_pressure', 'Sinais Vitais', 'Pressão Arterial', 'Pressão Arterial Sistólica', 'mmHg', '168', base_date, base_date),
(gen_random_uuid(), patient_ids[10], 'med_blood_pressure', 'Sinais Vitais', 'Pressão Arterial', 'Pressão Arterial Sistólica', 'mmHg', '152', base_date + INTERVAL '1 month', base_date + INTERVAL '1 month'),
(gen_random_uuid(), patient_ids[10], 'med_blood_pressure', 'Sinais Vitais', 'Pressão Arterial', 'Pressão Arterial Sistólica', 'mmHg', '142', base_date + INTERVAL '3 months', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[10], 'lab_glucose', 'Exames Laboratoriais', 'Glicemia', 'Glicemia de Jejum', 'mg/dL', '172', base_date, base_date),
(gen_random_uuid(), patient_ids[10], 'lab_glucose', 'Exames Laboratoriais', 'Glicemia', 'Glicemia de Jejum', 'mg/dL', '148', base_date + INTERVAL '2 months', base_date + INTERVAL '2 months'),
(gen_random_uuid(), patient_ids[10], 'lab_creatinine', 'Exames Laboratoriais', 'Função Renal', 'Creatinina Sérica', 'mg/dL', '1.8', base_date, base_date),
(gen_random_uuid(), patient_ids[10], 'lab_creatinine', 'Exames Laboratoriais', 'Função Renal', 'Creatinina Sérica', 'mg/dL', '1.6', base_date + INTERVAL '3 months', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[10], 'lab_cholesterol', 'Exames Laboratoriais', 'Lipidograma', 'Colesterol Total', 'mg/dL', '245', base_date, base_date),
(gen_random_uuid(), patient_ids[10], 'met_weight', 'Medidas Antropométricas', 'Peso', 'Peso Corporal', 'kg', '78.2', base_date, base_date),
(gen_random_uuid(), patient_ids[10], 'met_weight', 'Medidas Antropométricas', 'Peso', 'Peso Corporal', 'kg', '76.8', base_date + INTERVAL '4 months', base_date + INTERVAL '4 months');

RAISE NOTICE 'Inseridos 10 pacientes e 100 indicadores médicos usando IDs reais da tabela indicators!';

END $$;

-- =====================================================
-- CONSULTAS PARA VERIFICAR OS DADOS INSERIDOS
-- =====================================================

-- Verificar pacientes criados
SELECT 
    name,
    status,
    LEFT(notes, 50) as resumo_notas,
    created_at
FROM patients 
WHERE doctor_id = '94e784dd-797a-4962-81ae-825e7060352e'
ORDER BY created_at DESC;

-- Verificar indicadores com todos os campos preenchidos
SELECT 
    p.name as paciente,
    piv.indicator_id,
    piv.category_name,
    piv.subcategory_name,
    piv.parameter,
    piv.value,
    piv.unit_symbol,
    piv.created_at
FROM patients p
JOIN patient_indicator_values piv ON p.id = piv.patient_id
WHERE p.doctor_id = '94e784dd-797a-4962-81ae-825e7060352e'
ORDER BY p.name, piv.created_at
LIMIT 30;

-- Verificar quantos indicadores por categoria
SELECT 
    category_name,
    subcategory_name,
    COUNT(*) as total_indicadores
FROM patient_indicator_values 
WHERE patient_id IN (
    SELECT id FROM patients 
    WHERE doctor_id = '94e784dd-797a-4962-81ae-825e7060352e'
)
GROUP BY category_name, subcategory_name
ORDER BY category_name, subcategory_name;
