-- Script mínimo: 10 pacientes + 100 indicadores médicos
-- Apenas com colunas básicas que devem existir
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
-- INDICADORES MÉDICOS - APENAS COLUNAS BÁSICAS
-- =====================================================

-- ===== MARIA SILVA SANTOS - HIPERTENSA =====
INSERT INTO patient_indicator_values (id, patient_id, indicator_id, value, notes, created_at) VALUES
(gen_random_uuid(), patient_ids[1], 'pressao-arterial-sistolica', '165', 'Primeira consulta - 165 mmHg - pressão elevada', base_date),
(gen_random_uuid(), patient_ids[1], 'pressao-arterial-sistolica', '158', 'Início medicação - 158 mmHg - Losartana 50mg', base_date + INTERVAL '2 weeks'),
(gen_random_uuid(), patient_ids[1], 'pressao-arterial-sistolica', '152', 'Ajuste de dose - 152 mmHg - Losartana 100mg', base_date + INTERVAL '1 month'),
(gen_random_uuid(), patient_ids[1], 'pressao-arterial-sistolica', '145', 'Melhora progressiva - 145 mmHg', base_date + INTERVAL '2 months'),
(gen_random_uuid(), patient_ids[1], 'pressao-arterial-sistolica', '138', 'Atingindo meta - 138 mmHg', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[1], 'pressao-arterial-sistolica', '135', 'Pressão controlada - 135 mmHg', base_date + INTERVAL '4 months'),
(gen_random_uuid(), patient_ids[1], 'pressao-arterial-sistolica', '132', 'Excelente controle - 132 mmHg', base_date + INTERVAL '5 months'),
(gen_random_uuid(), patient_ids[1], 'peso', '68.5', 'Peso inicial - 68.5 kg', base_date),
(gen_random_uuid(), patient_ids[1], 'peso', '67.2', 'Perdeu peso com dieta - 67.2 kg', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[1], 'frequencia-cardiaca', '82', 'FC repouso normalizada - 82 bpm', base_date + INTERVAL '5 months');

-- ===== JOÃO CARLOS OLIVEIRA - DIABÉTICO =====
INSERT INTO patient_indicator_values (id, patient_id, indicator_id, value, notes, created_at) VALUES
(gen_random_uuid(), patient_ids[2], 'glicemia-jejum', '185', 'Diagnóstico - 185 mg/dL - glicemia muito elevada', base_date),
(gen_random_uuid(), patient_ids[2], 'glicemia-jejum', '165', 'Início metformina - 165 mg/dL', base_date + INTERVAL '1 month'),
(gen_random_uuid(), patient_ids[2], 'glicemia-jejum', '142', 'Melhora com dieta - 142 mg/dL', base_date + INTERVAL '2 months'),
(gen_random_uuid(), patient_ids[2], 'glicemia-jejum', '158', 'Descompensação festas - 158 mg/dL', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[2], 'glicemia-jejum', '138', 'Retomou controle - 138 mg/dL', base_date + INTERVAL '4 months'),
(gen_random_uuid(), patient_ids[2], 'hba1c', '9.2', 'HbA1c inicial muito alterada - 9.2%', base_date),
(gen_random_uuid(), patient_ids[2], 'hba1c', '7.8', 'Melhora significativa - 7.8%', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[2], 'peso', '82.3', 'Peso inicial - 82.3 kg', base_date),
(gen_random_uuid(), patient_ids[2], 'peso', '79.5', 'Perda de peso - 79.5 kg', base_date + INTERVAL '4 months'),
(gen_random_uuid(), patient_ids[2], 'circunferencia-abdominal', '98', 'Ainda elevada - 98 cm', base_date + INTERVAL '5 months');

-- ===== ANA BEATRIZ COSTA - PREVENÇÃO =====
INSERT INTO patient_indicator_values (id, patient_id, indicator_id, value, notes, created_at) VALUES
(gen_random_uuid(), patient_ids[3], 'colesterol-total', '180', 'Exame rotina normal - 180 mg/dL', base_date),
(gen_random_uuid(), patient_ids[3], 'colesterol-hdl', '65', 'HDL excelente - 65 mg/dL', base_date),
(gen_random_uuid(), patient_ids[3], 'colesterol-ldl', '98', 'LDL ótimo - 98 mg/dL', base_date),
(gen_random_uuid(), patient_ids[3], 'triglicerides', '85', 'Triglicérides normais - 85 mg/dL', base_date),
(gen_random_uuid(), patient_ids[3], 'pressao-arterial-sistolica', '115', 'Pressão ótima - 115 mmHg', base_date),
(gen_random_uuid(), patient_ids[3], 'pressao-arterial-diastolica', '75', 'Pressão ótima - 75 mmHg', base_date),
(gen_random_uuid(), patient_ids[3], 'glicemia-jejum', '88', 'Glicemia normal - 88 mg/dL', base_date),
(gen_random_uuid(), patient_ids[3], 'peso', '58.7', 'Peso ideal - 58.7 kg', base_date),
(gen_random_uuid(), patient_ids[3], 'imc', '22.4', 'IMC ideal - 22.4 kg/m²', base_date),
(gen_random_uuid(), patient_ids[3], 'vitamina-d', '32', 'Vitamina D adequada - 32 ng/mL', base_date + INTERVAL '3 months');

-- ===== CARLOS EDUARDO FERREIRA - CARDIOPATA =====
INSERT INTO patient_indicator_values (id, patient_id, indicator_id, value, notes, created_at) VALUES
(gen_random_uuid(), patient_ids[4], 'pressao-arterial-sistolica', '160', 'Pós-infarto elevada - 160 mmHg', base_date),
(gen_random_uuid(), patient_ids[4], 'pressao-arterial-sistolica', '145', 'Medicação otimizada - 145 mmHg', base_date + INTERVAL '1 month'),
(gen_random_uuid(), patient_ids[4], 'pressao-arterial-sistolica', '138', 'Controle adequado - 138 mmHg', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[4], 'colesterol-ldl', '165', 'LDL muito elevado - 165 mg/dL', base_date),
(gen_random_uuid(), patient_ids[4], 'colesterol-ldl', '120', 'Melhora com estatina - 120 mg/dL', base_date + INTERVAL '2 months'),
(gen_random_uuid(), patient_ids[4], 'colesterol-ldl', '88', 'Meta atingida - 88 mg/dL', base_date + INTERVAL '4 months'),
(gen_random_uuid(), patient_ids[4], 'frequencia-cardiaca', '88', 'FC repouso - 88 bpm', base_date),
(gen_random_uuid(), patient_ids[4], 'peso', '95.1', 'Sobrepeso importante - 95.1 kg', base_date),
(gen_random_uuid(), patient_ids[4], 'peso', '92.3', 'Perda gradual - 92.3 kg', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[4], 'troponina', '0.02', 'Controle normal - 0.02 ng/mL', base_date + INTERVAL '5 months');

-- ===== FERNANDA CRISTINA LIMA - GESTANTE =====
INSERT INTO patient_indicator_values (id, patient_id, indicator_id, value, notes, created_at) VALUES
(gen_random_uuid(), patient_ids[5], 'peso', '65.2', '22 semanas gestação - 65.2 kg', base_date),
(gen_random_uuid(), patient_ids[5], 'peso', '67.8', '26 semanas ganho adequado - 67.8 kg', base_date + INTERVAL '1 month'),
(gen_random_uuid(), patient_ids[5], 'peso', '70.1', '30 semanas esperado - 70.1 kg', base_date + INTERVAL '2 months'),
(gen_random_uuid(), patient_ids[5], 'pressao-arterial-sistolica', '118', 'Pressão normal gestação - 118 mmHg', base_date),
(gen_random_uuid(), patient_ids[5], 'pressao-arterial-sistolica', '125', 'Leve elevação monitorar - 125 mmHg', base_date + INTERVAL '2 months'),
(gen_random_uuid(), patient_ids[5], 'glicemia-jejum', '85', 'Glicemia normal - 85 mg/dL', base_date),
(gen_random_uuid(), patient_ids[5], 'teste-tolerancia-glicose', '145', 'TTG normal gestação - 145 mg/dL', base_date + INTERVAL '1 month'),
(gen_random_uuid(), patient_ids[5], 'hemoglobina', '11.8', 'Leve anemia gestacional - 11.8 g/dL', base_date),
(gen_random_uuid(), patient_ids[5], 'hemoglobina', '12.2', 'Melhora com ferro - 12.2 g/dL', base_date + INTERVAL '2 months'),
(gen_random_uuid(), patient_ids[5], 'altura-uterina', '28', '30 semanas crescimento adequado - 28 cm', base_date + INTERVAL '2 months');

-- ===== ROBERTO JOSÉ MENDES - OBESO =====
INSERT INTO patient_indicator_values (id, patient_id, indicator_id, value, notes, created_at) VALUES
(gen_random_uuid(), patient_ids[6], 'peso', '110.8', 'Obesidade grau II inicial - 110.8 kg', base_date),
(gen_random_uuid(), patient_ids[6], 'peso', '108.2', 'Início emagrecimento - 108.2 kg', base_date + INTERVAL '1 month'),
(gen_random_uuid(), patient_ids[6], 'peso', '106.5', 'Perda consistente - 106.5 kg', base_date + INTERVAL '2 months'),
(gen_random_uuid(), patient_ids[6], 'peso', '104.1', 'Continua perdendo - 104.1 kg', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[6], 'peso', '103.8', 'Platô ajustar dieta - 103.8 kg', base_date + INTERVAL '4 months'),
(gen_random_uuid(), patient_ids[6], 'imc', '37.5', 'IMC inicial - 37.5 kg/m²', base_date),
(gen_random_uuid(), patient_ids[6], 'imc', '35.1', 'Redução IMC - 35.1 kg/m²', base_date + INTERVAL '4 months'),
(gen_random_uuid(), patient_ids[6], 'circunferencia-abdominal', '118', 'Circunferência elevada - 118 cm', base_date),
(gen_random_uuid(), patient_ids[6], 'circunferencia-abdominal', '112', 'Redução gordura - 112 cm', base_date + INTERVAL '4 months'),
(gen_random_uuid(), patient_ids[6], 'pressao-arterial-sistolica', '142', 'Pressão melhorou - 142 mmHg', base_date + INTERVAL '5 months');

-- ===== JULIANA APARECIDA ROCHA - ASMÁTICA =====
INSERT INTO patient_indicator_values (id, patient_id, indicator_id, value, notes, created_at) VALUES
(gen_random_uuid(), patient_ids[7], 'peak-flow', '320', 'Função pulmonar reduzida - 320 L/min', base_date),
(gen_random_uuid(), patient_ids[7], 'peak-flow', '385', 'Melhora com corticoide - 385 L/min', base_date + INTERVAL '1 month'),
(gen_random_uuid(), patient_ids[7], 'peak-flow', '420', 'Controle adequado - 420 L/min', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[7], 'peak-flow', '380', 'Crise primavera - 380 L/min', base_date + INTERVAL '4 months'),
(gen_random_uuid(), patient_ids[7], 'uso-broncodilatador', '4', 'Uso frequente salbutamol - 4 doses/dia', base_date),
(gen_random_uuid(), patient_ids[7], 'uso-broncodilatador', '2', 'Redução uso resgate - 2 doses/dia', base_date + INTERVAL '2 months'),
(gen_random_uuid(), patient_ids[7], 'uso-broncodilatador', '1', 'Uso esporádico - 1 dose/dia', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[7], 'saturacao-oxigenio', '96', 'Saturação durante crise - 96%', base_date),
(gen_random_uuid(), patient_ids[7], 'saturacao-oxigenio', '99', 'Saturaç��o normal - 99%', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[7], 'ige-total', '450', 'IgE elevada alérgico - 450 UI/mL', base_date + INTERVAL '2 months');

-- ===== PEDRO HENRIQUE ALMEIDA - ATLETA =====
INSERT INTO patient_indicator_values (id, patient_id, indicator_id, value, notes, created_at) VALUES
(gen_random_uuid(), patient_ids[8], 'frequencia-cardiaca-repouso', '48', 'FC repouso atleta - 48 bpm', base_date),
(gen_random_uuid(), patient_ids[8], 'frequencia-cardiaca-repouso', '45', 'Melhora condicionamento - 45 bpm', base_date + INTERVAL '2 months'),
(gen_random_uuid(), patient_ids[8], 'vo2-max', '68', 'VO2 máximo excelente - 68 ml/kg/min', base_date),
(gen_random_uuid(), patient_ids[8], 'vo2-max', '72', 'Evolução condicionamento - 72 ml/kg/min', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[8], 'peso', '75.6', 'Peso ideal corrida - 75.6 kg', base_date),
(gen_random_uuid(), patient_ids[8], 'peso', '74.8', 'Ajuste competição - 74.8 kg', base_date + INTERVAL '2 months'),
(gen_random_uuid(), patient_ids[8], 'percentual-gordura', '8.5', 'Baixo percentual gordura - 8.5%', base_date),
(gen_random_uuid(), patient_ids[8], 'lactato', '12.8', 'Limiar anaeróbio - 12.8 mmol/L', base_date + INTERVAL '1 month'),
(gen_random_uuid(), patient_ids[8], 'ferritina', '45', 'Ferritina baixa endurance - 45 ng/mL', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[8], 'creatina-quinase', '180', 'CK pós treino - 180 U/L', base_date + INTERVAL '4 months');

-- ===== LUCIANA REGINA BARBOSA - ARTRITE REUMATOIDE =====
INSERT INTO patient_indicator_values (id, patient_id, indicator_id, value, notes, created_at) VALUES
(gen_random_uuid(), patient_ids[9], 'vas-dor', '8', 'Dor intensa início - 8 (escala 0-10)', base_date),
(gen_random_uuid(), patient_ids[9], 'vas-dor', '6', 'Melhora metotrexato - 6 (escala 0-10)', base_date + INTERVAL '1 month'),
(gen_random_uuid(), patient_ids[9], 'vas-dor', '4', 'Dor controlada - 4 (escala 0-10)', base_date + INTERVAL '2 months'),
(gen_random_uuid(), patient_ids[9], 'vas-dor', '7', 'Crise infecção - 7 (escala 0-10)', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[9], 'vas-dor', '3', 'Controle pós antibiótico - 3 (escala 0-10)', base_date + INTERVAL '4 months'),
(gen_random_uuid(), patient_ids[9], 'pcr', '45', 'PCR elevada inflamação - 45 mg/L', base_date),
(gen_random_uuid(), patient_ids[9], 'pcr', '18', 'Redução inflamação - 18 mg/L', base_date + INTERVAL '2 months'),
(gen_random_uuid(), patient_ids[9], 'pcr', '8', 'PCR quase normal - 8 mg/L', base_date + INTERVAL '4 months'),
(gen_random_uuid(), patient_ids[9], 'rigidez-matinal', '120', 'Rigidez prolongada - 120 minutos', base_date),
(gen_random_uuid(), patient_ids[9], 'rigidez-matinal', '30', 'Melhora significativa - 30 minutos', base_date + INTERVAL '4 months');

-- ===== MARCOS ANTONIO PEREIRA - IDOSO POLIMÓRBIDO =====
INSERT INTO patient_indicator_values (id, patient_id, indicator_id, value, notes, created_at) VALUES
(gen_random_uuid(), patient_ids[10], 'pressao-arterial-sistolica', '168', 'Hipertensão descontrolada - 168 mmHg', base_date),
(gen_random_uuid(), patient_ids[10], 'pressao-arterial-sistolica', '152', 'Ajuste medicação - 152 mmHg', base_date + INTERVAL '1 month'),
(gen_random_uuid(), patient_ids[10], 'pressao-arterial-sistolica', '142', 'Melhora gradual - 142 mmHg', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[10], 'glicemia-jejum', '172', 'Diabetes descompensado - 172 mg/dL', base_date),
(gen_random_uuid(), patient_ids[10], 'glicemia-jejum', '148', 'Melhora com insulina - 148 mg/dL', base_date + INTERVAL '2 months'),
(gen_random_uuid(), patient_ids[10], 'creatinina', '1.8', 'Função renal comprometida - 1.8 mg/dL', base_date),
(gen_random_uuid(), patient_ids[10], 'creatinina', '1.6', 'Estabilização renal - 1.6 mg/dL', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[10], 'colesterol-total', '245', 'Dislipidemia - 245 mg/dL', base_date),
(gen_random_uuid(), patient_ids[10], 'peso', '78.2', 'Perda peso não intencional - 78.2 kg', base_date),
(gen_random_uuid(), patient_ids[10], 'peso', '76.8', 'Continua perdendo - 76.8 kg', base_date + INTERVAL '4 months');

RAISE NOTICE 'Inseridos 10 pacientes e 100 indicadores médicos!';

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
    LEFT(piv.notes, 40) as observacao,
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
