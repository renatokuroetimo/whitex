-- Query final corrigida para popular indicadores padrões 
-- Baseada na estrutura real da tabela indicators

-- Inserir indicadores padrões usando a estrutura correta da tabela
INSERT INTO indicators (
  id,
  name,
  category,
  subcategory,
  parameter, 
  unit,
  unit_symbol,
  type,
  is_standard,
  category_id,
  subcategory_id,
  unit_id,
  is_mandatory,
  requires_date,
  requires_time,
  doctor_id,
  created_at,
  -- Campos de metadados
  definition,
  context,
  data_type,
  is_required,
  is_conditional,
  is_repeatable,
  standard_id,
  source
) VALUES 

-- SINAIS VITAIS
('std_bp_systolic', 'Pressão Arterial Sistólica', 'Sinais Vitais', 'Pressão Arterial', 
 'Pressão Arterial Sistólica', 'mmHg', 'mmHg', 'standard', true, 'cat1', 'sub1', 'unit_mmhg', 
 true, true, true, (SELECT id FROM admins WHERE email = 'renato@timo.com.br'), now(),
 'Medida da pressão máxima exercida pelo sangue nas artérias durante o ciclo cardíaco, correspondente à fase de sístole ventricular', 
 'Clinical', 'number', true, false, true, 'LOINC:8480-6', 
 'Organização Mundial da Saúde - Guidelines for Blood Pressure Measurement'),

('std_bp_diastolic', 'Pressão Arterial Diastólica', 'Sinais Vitais', 'Pressão Arterial', 
 'Pressão Arterial Diastólica', 'mmHg', 'mmHg', 'standard', true, 'cat1', 'sub1', 'unit_mmhg', 
 true, true, true, (SELECT id FROM admins WHERE email = 'renato@timo.com.br'), now(),
 'Medida da pressão mínima exercida pelo sangue nas artérias durante o ciclo cardíaco, correspondente à fase de diástole ventricular', 
 'Clinical', 'number', true, false, true, 'LOINC:8462-4', 
 'Organização Mundial da Saúde - Guidelines for Blood Pressure Measurement'),

('std_heart_rate', 'Frequência Cardíaca', 'Sinais Vitais', 'Frequência Cardíaca', 
 'Frequência Cardíaca', 'bpm', 'bpm', 'standard', true, 'cat1', 'sub2', 'unit_bpm', 
 true, true, true, (SELECT id FROM admins WHERE email = 'renato@timo.com.br'), now(),
 'Frequência de contrações do músculo cardíaco por unidade de tempo, geralmente expressa em batimentos por minuto', 
 'Clinical', 'number', true, false, true, 'LOINC:8867-4', 
 'American Heart Association - Heart Rate Guidelines'),

('std_temperature', 'Temperatura Corporal', 'Sinais Vitais', 'Temperatura', 
 'Temperatura Corporal', '°C', '°C', 'standard', true, 'cat1', 'sub3', 'unit_celsius', 
 true, true, true, (SELECT id FROM admins WHERE email = 'renato@timo.com.br'), now(),
 'Medida do grau de calor do corpo humano, indicativa do equilíbrio entre produção e perda de calor corporal', 
 'Clinical', 'number', true, false, true, 'LOINC:8310-5', 
 'International Federation of Clinical Chemistry - Temperature Standards'),

('std_respiratory_rate', 'Frequência Respiratória', 'Sinais Vitais', 'Respiração', 
 'Frequência Respiratória', 'irpm', 'irpm', 'standard', true, 'cat1', 'sub4', 'unit_irpm', 
 true, true, true, (SELECT id FROM admins WHERE email = 'renato@timo.com.br'), now(),
 'Frequência dos movimentos respiratórios por unidade de tempo, incluindo inspiração e expiração completas', 
 'Clinical', 'number', true, false, true, 'LOINC:9279-1', 
 'European Respiratory Society - Respiratory Rate Guidelines'),

('std_oxygen_sat', 'Saturação de Oxigênio', 'Sinais Vitais', 'Oxigenação', 
 'Saturação de Oxigênio', '%', '%', 'standard', true, 'cat1', 'sub4', 'unit_percent', 
 true, true, true, (SELECT id FROM admins WHERE email = 'renato@timo.com.br'), now(),
 'Medida da porcentagem de hemoglobina ligada ao oxigênio em relação à hemoglobina total no sangue', 
 'Clinical', 'number', true, false, true, 'LOINC:2708-6', 
 'World Health Organization - Pulse Oximetry Training Manual'),

-- MEDIDAS ANTROPOMÉTRICAS
('std_weight', 'Peso Corporal', 'Medidas Antropométricas', 'Peso', 
 'Peso Corporal', 'kg', 'kg', 'standard', true, 'cat3', 'sub6', 'unit_kg', 
 true, true, false, (SELECT id FROM admins WHERE email = 'renato@timo.com.br'), now(),
 'Medida da força gravitacional exercida sobre a massa total do corpo humano', 
 'Clinical', 'number', true, false, true, 'LOINC:29463-7', 
 'Organização Mundial da Saúde - Physical Status Assessment'),

('std_height', 'Altura', 'Medidas Antropométricas', 'Altura', 
 'Altura', 'cm', 'cm', 'standard', true, 'cat3', 'sub7', 'unit_cm', 
 true, true, false, (SELECT id FROM admins WHERE email = 'renato@timo.com.br'), now(),
 'Medida linear da estatura corporal total em posição anatômica padronizada', 
 'Clinical', 'number', true, false, false, 'LOINC:8302-2', 
 'International Society for the Advancement of Kinanthropometry'),

('std_bmi', 'Índice de Massa Corporal', 'Medidas Antropométricas', 'IMC', 
 'Índice de Massa Corporal', 'kg/m²', 'kg/m²', 'standard', true, 'cat3', 'sub8', 'unit_kgm2', 
 false, true, false, (SELECT id FROM admins WHERE email = 'renato@timo.com.br'), now(),
 'Índice calculado pela divisão do peso corporal pelo quadrado da altura, utilizado para classificação do estado nutricional', 
 'Clinical', 'number', false, true, true, 'LOINC:39156-5', 
 'Organização Mundial da Saúde - BMI Classification Standards'),

('std_waist_circ', 'Circunferência Abdominal', 'Medidas Antropométricas', 'Circunferência', 
 'Circunferência Abdominal', 'cm', 'cm', 'standard', true, 'cat3', 'sub9', 'unit_cm', 
 false, true, false, (SELECT id FROM admins WHERE email = 'renato@timo.com.br'), now(),
 'Medida do perímetro da região abdominal, indicativa de distribuição de gordura corporal central', 
 'Clinical', 'number', false, false, true, 'LOINC:33747-0', 
 'International Diabetes Federation - Waist Circumference Guidelines'),

-- EXAMES LABORATORIAIS - HEMATOLOGIA  
('std_hemoglobin', 'Hemoglobina', 'Exames Laboratoriais', 'Hematologia', 
 'Hemoglobina', 'g/dL', 'g/dL', 'standard', true, 'cat2', 'sub6', 'unit_gdl', 
 true, true, false, (SELECT id FROM admins WHERE email = 'renato@timo.com.br'), now(),
 'Concentração da metaloproteína rica em ferro presente nos glóbulos vermelhos, responsável pelo transporte de oxigênio', 
 'Clinical', 'number', true, false, true, 'LOINC:718-7', 
 'International Council for Standardization in Haematology'),

('std_hematocrit', 'Hematócrito', 'Exames Laboratoriais', 'Hematologia', 
 'Hematócrito', '%', '%', 'standard', true, 'cat2', 'sub6', 'unit_percent', 
 true, true, false, (SELECT id FROM admins WHERE email = 'renato@timo.com.br'), now(),
 'Proporção volumétrica de células vermelhas em relação ao volume total de sangue', 
 'Clinical', 'number', true, false, true, 'LOINC:4544-3', 
 'Clinical and Laboratory Standards Institute'),

('std_wbc_count', 'Contagem de Leucócitos', 'Exames Laboratoriais', 'Hematologia', 
 'Contagem de Leucócitos', 'células/μL', 'células/μL', 'standard', true, 'cat2', 'sub6', 'unit_cells', 
 true, true, false, (SELECT id FROM admins WHERE email = 'renato@timo.com.br'), now(),
 'Quantificação das células de defesa do organismo presentes no sangue periférico', 
 'Clinical', 'number', true, false, true, 'LOINC:6690-2', 
 'International Society of Laboratory Hematology'),

('std_platelet_count', 'Contagem de Plaquetas', 'Exames Laboratoriais', 'Hematologia', 
 'Contagem de Plaquetas', 'células/μL', 'células/μL', 'standard', true, 'cat2', 'sub6', 'unit_cells', 
 true, true, false, (SELECT id FROM admins WHERE email = 'renato@timo.com.br'), now(),
 'Quantificação das células responsáveis pela coagulação sanguínea no sangue periférico', 
 'Clinical', 'number', true, false, true, 'LOINC:777-3', 
 'International Society on Thrombosis and Haemostasis'),

-- EXAMES LABORATORIAIS - BIOQUÍMICA
('std_glucose', 'Glicemia de Jejum', 'Exames Laboratoriais', 'Glicemia', 
 'Glicemia de Jejum', 'mg/dL', 'mg/dL', 'standard', true, 'cat2', 'sub4', 'unit_mgdl', 
 true, true, false, (SELECT id FROM admins WHERE email = 'renato@timo.com.br'), now(),
 'Medida da concentração de açúcar no sangue em estado de jejum, indicativo do metabolismo glicídico', 
 'Clinical', 'number', true, false, true, 'LOINC:1558-6', 
 'American Diabetes Association - Standards of Medical Care'),

('std_hba1c', 'Hemoglobina Glicada', 'Exames Laboratoriais', 'Glicemia', 
 'Hemoglobina Glicada', '%', '%', 'standard', true, 'cat2', 'sub4', 'unit_percent', 
 false, true, false, (SELECT id FROM admins WHERE email = 'renato@timo.com.br'), now(),
 'Medida do controle glicêmico médio dos últimos 2-3 meses através da glicação da hemoglobina', 
 'Clinical', 'number', false, true, true, 'LOINC:4548-4', 
 'International Federation of Clinical Chemistry - HbA1c Standardization'),

('std_cholesterol', 'Colesterol Total', 'Exames Laboratoriais', 'Colesterol', 
 'Colesterol Total', 'mg/dL', 'mg/dL', 'standard', true, 'cat2', 'sub5', 'unit_mgdl', 
 true, true, false, (SELECT id FROM admins WHERE email = 'renato@timo.com.br'), now(),
 'Medida da concentração total do esterol presente no plasma sanguíneo, indicativo do perfil lipídico', 
 'Clinical', 'number', true, false, true, 'LOINC:2093-3', 
 'National Cholesterol Education Program Guidelines'),

('std_hdl', 'HDL Colesterol', 'Exames Laboratoriais', 'Colesterol', 
 'HDL Colesterol', 'mg/dL', 'mg/dL', 'standard', true, 'cat2', 'sub5', 'unit_mgdl', 
 true, true, false, (SELECT id FROM admins WHERE email = 'renato@timo.com.br'), now(),
 'Medida do colesterol transportado por lipoproteínas de alta densidade, considerado protetor cardiovascular', 
 'Clinical', 'number', true, false, true, 'LOINC:2085-9', 
 'European Society of Cardiology - Dyslipidemia Guidelines'),

('std_ldl', 'LDL Colesterol', 'Exames Laboratoriais', 'Colesterol', 
 'LDL Colesterol', 'mg/dL', 'mg/dL', 'standard', true, 'cat2', 'sub5', 'unit_mgdl', 
 true, true, false, (SELECT id FROM admins WHERE email = 'renato@timo.com.br'), now(),
 'Medida do colesterol transportado por lipoproteínas de baixa densidade, associado ao risco cardiovascular', 
 'Clinical', 'number', true, false, true, 'LOINC:18262-6', 
 'American Heart Association - Cholesterol Management Guidelines'),

('std_triglycerides', 'Triglicerídeos', 'Exames Laboratoriais', 'Colesterol', 
 'Triglicerídeos', 'mg/dL', 'mg/dL', 'standard', true, 'cat2', 'sub5', 'unit_mgdl', 
 true, true, false, (SELECT id FROM admins WHERE email = 'renato@timo.com.br'), now(),
 'Medida da concentração de lipídeos simples no plasma, indicativo do metabolismo lipídico', 
 'Clinical', 'number', true, false, true, 'LOINC:2571-8', 
 'International Atherosclerosis Society - Triglyceride Guidelines'),

('std_creatinine', 'Creatinina Sérica', 'Exames Laboratoriais', 'Função Renal', 
 'Creatinina Sérica', 'mg/dL', 'mg/dL', 'standard', true, 'cat2', 'sub7', 'unit_mgdl', 
 true, true, false, (SELECT id FROM admins WHERE email = 'renato@timo.com.br'), now(),
 'Medida do produto de degradação da creatina muscular, utilizada para avaliação da função renal', 
 'Clinical', 'number', true, false, true, 'LOINC:2160-0', 
 'Kidney Disease Improving Global Outcomes - Clinical Practice Guidelines'),

('std_urea', 'Ureia', 'Exames Laboratoriais', 'Função Renal', 
 'Ureia', 'mg/dL', 'mg/dL', 'standard', true, 'cat2', 'sub7', 'unit_mgdl', 
 true, true, false, (SELECT id FROM admins WHERE email = 'renato@timo.com.br'), now(),
 'Medida do principal produto nitrogenado da degradação de proteínas, indicativo da função renal', 
 'Clinical', 'number', true, false, true, 'LOINC:3094-0', 
 'National Kidney Foundation - Clinical Practice Guidelines')

ON CONFLICT (id) DO UPDATE SET
  updated_at = now();

-- Verificar se os indicadores foram inseridos corretamente
SELECT 
  i.id,
  i.name as nome,
  i.category as categoria,
  i.subcategory as subcategoria,
  i.unit_symbol as unidade,
  i.definition as definicao,
  i.standard_id as codigo_loinc,
  i.is_standard
FROM indicators i
WHERE i.is_standard = true
ORDER BY i.category, i.subcategory, i.name;
