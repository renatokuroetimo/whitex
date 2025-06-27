-- Script final: 10 pacientes + 100 indicadores médicos
-- Usando apenas as colunas que existem no banco: id, patient_id, indicator_id, value, created_at, updated_at
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
-- INDICADORES MÉDICOS - APENAS COM COLUNAS EXISTENTES
-- =====================================================

-- ===== MARIA SILVA SANTOS - HIPERTENSA =====
INSERT INTO patient_indicator_values (id, patient_id, indicator_id, value, created_at, updated_at) VALUES
(gen_random_uuid(), patient_ids[1], 'pressao-arterial-sistolica', '165', base_date, base_date),
(gen_random_uuid(), patient_ids[1], 'pressao-arterial-sistolica', '158', base_date + INTERVAL '2 weeks', base_date + INTERVAL '2 weeks'),
(gen_random_uuid(), patient_ids[1], 'pressao-arterial-sistolica', '152', base_date + INTERVAL '1 month', base_date + INTERVAL '1 month'),
(gen_random_uuid(), patient_ids[1], 'pressao-arterial-sistolica', '145', base_date + INTERVAL '2 months', base_date + INTERVAL '2 months'),
(gen_random_uuid(), patient_ids[1], 'pressao-arterial-sistolica', '138', base_date + INTERVAL '3 months', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[1], 'pressao-arterial-sistolica', '135', base_date + INTERVAL '4 months', base_date + INTERVAL '4 months'),
(gen_random_uuid(), patient_ids[1], 'pressao-arterial-sistolica', '132', base_date + INTERVAL '5 months', base_date + INTERVAL '5 months'),
(gen_random_uuid(), patient_ids[1], 'peso', '68.5', base_date, base_date),
(gen_random_uuid(), patient_ids[1], 'peso', '67.2', base_date + INTERVAL '3 months', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[1], 'frequencia-cardiaca', '82', base_date + INTERVAL '5 months', base_date + INTERVAL '5 months');

-- ===== JOÃO CARLOS OLIVEIRA - DIABÉTICO =====
INSERT INTO patient_indicator_values (id, patient_id, indicator_id, value, created_at, updated_at) VALUES
(gen_random_uuid(), patient_ids[2], 'glicemia-jejum', '185', base_date, base_date),
(gen_random_uuid(), patient_ids[2], 'glicemia-jejum', '165', base_date + INTERVAL '1 month', base_date + INTERVAL '1 month'),
(gen_random_uuid(), patient_ids[2], 'glicemia-jejum', '142', base_date + INTERVAL '2 months', base_date + INTERVAL '2 months'),
(gen_random_uuid(), patient_ids[2], 'glicemia-jejum', '158', base_date + INTERVAL '3 months', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[2], 'glicemia-jejum', '138', base_date + INTERVAL '4 months', base_date + INTERVAL '4 months'),
(gen_random_uuid(), patient_ids[2], 'hba1c', '9.2', base_date, base_date),
(gen_random_uuid(), patient_ids[2], 'hba1c', '7.8', base_date + INTERVAL '3 months', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[2], 'peso', '82.3', base_date, base_date),
(gen_random_uuid(), patient_ids[2], 'peso', '79.5', base_date + INTERVAL '4 months', base_date + INTERVAL '4 months'),
(gen_random_uuid(), patient_ids[2], 'circunferencia-abdominal', '98', base_date + INTERVAL '5 months', base_date + INTERVAL '5 months');

-- ===== ANA BEATRIZ COSTA - PREVENÇÃO =====
INSERT INTO patient_indicator_values (id, patient_id, indicator_id, value, created_at, updated_at) VALUES
(gen_random_uuid(), patient_ids[3], 'colesterol-total', '180', base_date, base_date),
(gen_random_uuid(), patient_ids[3], 'colesterol-hdl', '65', base_date, base_date),
(gen_random_uuid(), patient_ids[3], 'colesterol-ldl', '98', base_date, base_date),
(gen_random_uuid(), patient_ids[3], 'triglicerides', '85', base_date, base_date),
(gen_random_uuid(), patient_ids[3], 'pressao-arterial-sistolica', '115', base_date, base_date),
(gen_random_uuid(), patient_ids[3], 'pressao-arterial-diastolica', '75', base_date, base_date),
(gen_random_uuid(), patient_ids[3], 'glicemia-jejum', '88', base_date, base_date),
(gen_random_uuid(), patient_ids[3], 'peso', '58.7', base_date, base_date),
(gen_random_uuid(), patient_ids[3], 'imc', '22.4', base_date, base_date),
(gen_random_uuid(), patient_ids[3], 'vitamina-d', '32', base_date + INTERVAL '3 months', base_date + INTERVAL '3 months');

-- ===== CARLOS EDUARDO FERREIRA - CARDIOPATA =====
INSERT INTO patient_indicator_values (id, patient_id, indicator_id, value, created_at, updated_at) VALUES
(gen_random_uuid(), patient_ids[4], 'pressao-arterial-sistolica', '160', base_date, base_date),
(gen_random_uuid(), patient_ids[4], 'pressao-arterial-sistolica', '145', base_date + INTERVAL '1 month', base_date + INTERVAL '1 month'),
(gen_random_uuid(), patient_ids[4], 'pressao-arterial-sistolica', '138', base_date + INTERVAL '3 months', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[4], 'colesterol-ldl', '165', base_date, base_date),
(gen_random_uuid(), patient_ids[4], 'colesterol-ldl', '120', base_date + INTERVAL '2 months', base_date + INTERVAL '2 months'),
(gen_random_uuid(), patient_ids[4], 'colesterol-ldl', '88', base_date + INTERVAL '4 months', base_date + INTERVAL '4 months'),
(gen_random_uuid(), patient_ids[4], 'frequencia-cardiaca', '88', base_date, base_date),
(gen_random_uuid(), patient_ids[4], 'peso', '95.1', base_date, base_date),
(gen_random_uuid(), patient_ids[4], 'peso', '92.3', base_date + INTERVAL '3 months', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[4], 'troponina', '0.02', base_date + INTERVAL '5 months', base_date + INTERVAL '5 months');

-- ===== FERNANDA CRISTINA LIMA - GESTANTE =====
INSERT INTO patient_indicator_values (id, patient_id, indicator_id, value, created_at, updated_at) VALUES
(gen_random_uuid(), patient_ids[5], 'peso', '65.2', base_date, base_date),
(gen_random_uuid(), patient_ids[5], 'peso', '67.8', base_date + INTERVAL '1 month', base_date + INTERVAL '1 month'),
(gen_random_uuid(), patient_ids[5], 'peso', '70.1', base_date + INTERVAL '2 months', base_date + INTERVAL '2 months'),
(gen_random_uuid(), patient_ids[5], 'pressao-arterial-sistolica', '118', base_date, base_date),
(gen_random_uuid(), patient_ids[5], 'pressao-arterial-sistolica', '125', base_date + INTERVAL '2 months', base_date + INTERVAL '2 months'),
(gen_random_uuid(), patient_ids[5], 'glicemia-jejum', '85', base_date, base_date),
(gen_random_uuid(), patient_ids[5], 'teste-tolerancia-glicose', '145', base_date + INTERVAL '1 month', base_date + INTERVAL '1 month'),
(gen_random_uuid(), patient_ids[5], 'hemoglobina', '11.8', base_date, base_date),
(gen_random_uuid(), patient_ids[5], 'hemoglobina', '12.2', base_date + INTERVAL '2 months', base_date + INTERVAL '2 months'),
(gen_random_uuid(), patient_ids[5], 'altura-uterina', '28', base_date + INTERVAL '2 months', base_date + INTERVAL '2 months');

-- ===== ROBERTO JOSÉ MENDES - OBESO =====
INSERT INTO patient_indicator_values (id, patient_id, indicator_id, value, created_at, updated_at) VALUES
(gen_random_uuid(), patient_ids[6], 'peso', '110.8', base_date, base_date),
(gen_random_uuid(), patient_ids[6], 'peso', '108.2', base_date + INTERVAL '1 month', base_date + INTERVAL '1 month'),
(gen_random_uuid(), patient_ids[6], 'peso', '106.5', base_date + INTERVAL '2 months', base_date + INTERVAL '2 months'),
(gen_random_uuid(), patient_ids[6], 'peso', '104.1', base_date + INTERVAL '3 months', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[6], 'peso', '103.8', base_date + INTERVAL '4 months', base_date + INTERVAL '4 months'),
(gen_random_uuid(), patient_ids[6], 'imc', '37.5', base_date, base_date),
(gen_random_uuid(), patient_ids[6], 'imc', '35.1', base_date + INTERVAL '4 months', base_date + INTERVAL '4 months'),
(gen_random_uuid(), patient_ids[6], 'circunferencia-abdominal', '118', base_date, base_date),
(gen_random_uuid(), patient_ids[6], 'circunferencia-abdominal', '112', base_date + INTERVAL '4 months', base_date + INTERVAL '4 months'),
(gen_random_uuid(), patient_ids[6], 'pressao-arterial-sistolica', '142', base_date + INTERVAL '5 months', base_date + INTERVAL '5 months');

-- ===== JULIANA APARECIDA ROCHA - ASMÁTICA =====
INSERT INTO patient_indicator_values (id, patient_id, indicator_id, value, created_at, updated_at) VALUES
(gen_random_uuid(), patient_ids[7], 'peak-flow', '320', base_date, base_date),
(gen_random_uuid(), patient_ids[7], 'peak-flow', '385', base_date + INTERVAL '1 month', base_date + INTERVAL '1 month'),
(gen_random_uuid(), patient_ids[7], 'peak-flow', '420', base_date + INTERVAL '3 months', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[7], 'peak-flow', '380', base_date + INTERVAL '4 months', base_date + INTERVAL '4 months'),
(gen_random_uuid(), patient_ids[7], 'uso-broncodilatador', '4', base_date, base_date),
(gen_random_uuid(), patient_ids[7], 'uso-broncodilatador', '2', base_date + INTERVAL '2 months', base_date + INTERVAL '2 months'),
(gen_random_uuid(), patient_ids[7], 'uso-broncodilatador', '1', base_date + INTERVAL '3 months', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[7], 'saturacao-oxigenio', '96', base_date, base_date),
(gen_random_uuid(), patient_ids[7], 'saturacao-oxigenio', '99', base_date + INTERVAL '3 months', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[7], 'ige-total', '450', base_date + INTERVAL '2 months', base_date + INTERVAL '2 months');

-- ===== PEDRO HENRIQUE ALMEIDA - ATLETA =====
INSERT INTO patient_indicator_values (id, patient_id, indicator_id, value, created_at, updated_at) VALUES
(gen_random_uuid(), patient_ids[8], 'frequencia-cardiaca-repouso', '48', base_date, base_date),
(gen_random_uuid(), patient_ids[8], 'frequencia-cardiaca-repouso', '45', base_date + INTERVAL '2 months', base_date + INTERVAL '2 months'),
(gen_random_uuid(), patient_ids[8], 'vo2-max', '68', base_date, base_date),
(gen_random_uuid(), patient_ids[8], 'vo2-max', '72', base_date + INTERVAL '3 months', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[8], 'peso', '75.6', base_date, base_date),
(gen_random_uuid(), patient_ids[8], 'peso', '74.8', base_date + INTERVAL '2 months', base_date + INTERVAL '2 months'),
(gen_random_uuid(), patient_ids[8], 'percentual-gordura', '8.5', base_date, base_date),
(gen_random_uuid(), patient_ids[8], 'lactato', '12.8', base_date + INTERVAL '1 month', base_date + INTERVAL '1 month'),
(gen_random_uuid(), patient_ids[8], 'ferritina', '45', base_date + INTERVAL '3 months', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[8], 'creatina-quinase', '180', base_date + INTERVAL '4 months', base_date + INTERVAL '4 months');

-- ===== LUCIANA REGINA BARBOSA - ARTRITE REUMATOIDE =====
INSERT INTO patient_indicator_values (id, patient_id, indicator_id, value, created_at, updated_at) VALUES
(gen_random_uuid(), patient_ids[9], 'vas-dor', '8', base_date, base_date),
(gen_random_uuid(), patient_ids[9], 'vas-dor', '6', base_date + INTERVAL '1 month', base_date + INTERVAL '1 month'),
(gen_random_uuid(), patient_ids[9], 'vas-dor', '4', base_date + INTERVAL '2 months', base_date + INTERVAL '2 months'),
(gen_random_uuid(), patient_ids[9], 'vas-dor', '7', base_date + INTERVAL '3 months', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[9], 'vas-dor', '3', base_date + INTERVAL '4 months', base_date + INTERVAL '4 months'),
(gen_random_uuid(), patient_ids[9], 'pcr', '45', base_date, base_date),
(gen_random_uuid(), patient_ids[9], 'pcr', '18', base_date + INTERVAL '2 months', base_date + INTERVAL '2 months'),
(gen_random_uuid(), patient_ids[9], 'pcr', '8', base_date + INTERVAL '4 months', base_date + INTERVAL '4 months'),
(gen_random_uuid(), patient_ids[9], 'rigidez-matinal', '120', base_date, base_date),
(gen_random_uuid(), patient_ids[9], 'rigidez-matinal', '30', base_date + INTERVAL '4 months', base_date + INTERVAL '4 months');

-- ===== MARCOS ANTONIO PEREIRA - IDOSO POLIMÓRBIDO =====
INSERT INTO patient_indicator_values (id, patient_id, indicator_id, value, created_at, updated_at) VALUES
(gen_random_uuid(), patient_ids[10], 'pressao-arterial-sistolica', '168', base_date, base_date),
(gen_random_uuid(), patient_ids[10], 'pressao-arterial-sistolica', '152', base_date + INTERVAL '1 month', base_date + INTERVAL '1 month'),
(gen_random_uuid(), patient_ids[10], 'pressao-arterial-sistolica', '142', base_date + INTERVAL '3 months', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[10], 'glicemia-jejum', '172', base_date, base_date),
(gen_random_uuid(), patient_ids[10], 'glicemia-jejum', '148', base_date + INTERVAL '2 months', base_date + INTERVAL '2 months'),
(gen_random_uuid(), patient_ids[10], 'creatinina', '1.8', base_date, base_date),
(gen_random_uuid(), patient_ids[10], 'creatinina', '1.6', base_date + INTERVAL '3 months', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[10], 'colesterol-total', '245', base_date, base_date),
(gen_random_uuid(), patient_ids[10], 'peso', '78.2', base_date, base_date),
(gen_random_uuid(), patient_ids[10], 'peso', '76.8', base_date + INTERVAL '4 months', base_date + INTERVAL '4 months');

RAISE NOTICE 'Inseridos 10 pacientes e 100 indicadores médicos com sucesso!';

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

-- Verificar indicadores por paciente
SELECT 
    p.name as paciente,
    piv.indicator_id,
    piv.value,
    piv.created_at
FROM patients p
JOIN patient_indicator_values piv ON p.id = piv.patient_id
WHERE p.doctor_id = '94e784dd-797a-4962-81ae-825e7060352e'
ORDER BY p.name, piv.created_at
LIMIT 30;

-- Verificar quantos indicadores por paciente
SELECT 
    p.name as paciente,
    COUNT(piv.id) as total_indicadores
FROM patients p
LEFT JOIN patient_indicator_values piv ON p.id = piv.patient_id
WHERE p.doctor_id = '94e784dd-797a-4962-81ae-825e7060352e'
GROUP BY p.id, p.name
ORDER BY p.name;
