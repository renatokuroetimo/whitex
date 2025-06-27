-- Script completo: 10 pacientes + 100 indicadores médicos (10 por paciente)
-- Mostra evolução realista dos problemas de saúde de cada paciente
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
-- DADOS PESSOAIS DOS PACIENTES
-- =====================================================
INSERT INTO patient_personal_data (id, user_id, full_name, email, birth_date, gender, city, state, phone, health_plan, created_at, updated_at) VALUES
(gen_random_uuid(), patient_ids[1], 'Maria Silva Santos', 'maria.silva@email.com', '1985-03-15', 'Feminino', 'São Paulo', 'SP', '(11) 99999-1111', 'Unimed', base_date, base_date),
(gen_random_uuid(), patient_ids[2], 'João Carlos Oliveira', 'joao.oliveira@email.com', '1978-07-22', 'Masculino', 'Rio de Janeiro', 'RJ', '(21) 99999-2222', 'Bradesco Saúde', base_date, base_date),
(gen_random_uuid(), patient_ids[3], 'Ana Beatriz Costa', 'ana.costa@email.com', '1996-11-08', 'Feminino', 'Belo Horizonte', 'MG', '(31) 99999-3333', 'SulAmérica', base_date, base_date),
(gen_random_uuid(), patient_ids[4], 'Carlos Eduardo Ferreira', 'carlos.ferreira@email.com', '1972-04-12', 'Masculino', 'Salvador', 'BA', '(71) 99999-4444', 'Amil', base_date, base_date),
(gen_random_uuid(), patient_ids[5], 'Fernanda Cristina Lima', 'fernanda.lima@email.com', '1993-09-25', 'Feminino', 'Fortaleza', 'CE', '(85) 99999-5555', 'Hapvida', base_date, base_date),
(gen_random_uuid(), patient_ids[6], 'Roberto José Mendes', 'roberto.mendes@email.com', '1981-01-18', 'Masculino', 'Recife', 'PE', '(81) 99999-6666', 'Unimed', base_date, base_date),
(gen_random_uuid(), patient_ids[7], 'Juliana Aparecida Rocha', 'juliana.rocha@email.com', '1989-06-30', 'Feminino', 'Porto Alegre', 'RS', '(51) 99999-7777', 'GEAP', base_date, base_date),
(gen_random_uuid(), patient_ids[8], 'Pedro Henrique Almeida', 'pedro.almeida@email.com', '2000-12-03', 'Masculino', 'Curitiba', 'PR', '(41) 99999-8888', 'Bradesco Saúde', base_date, base_date),
(gen_random_uuid(), patient_ids[9], 'Luciana Regina Barbosa', 'luciana.barbosa@email.com', '1976-08-14', 'Feminino', 'Brasília', 'DF', '(61) 99999-9999', 'Cassi', base_date, base_date),
(gen_random_uuid(), patient_ids[10], 'Marcos Antonio Pereira', 'marcos.pereira@email.com', '1957-05-20', 'Masculino', 'Goiânia', 'GO', '(62) 99999-0000', 'SulAmérica', base_date, base_date);

-- =====================================================
-- DADOS MÉDICOS DOS PACIENTES
-- =====================================================
INSERT INTO patient_medical_data (id, user_id, weight, height, smoker, high_blood_pressure, physical_activity, created_at, updated_at) VALUES
(gen_random_uuid(), patient_ids[1], 68.5, 165, false, true, true, base_date, base_date),
(gen_random_uuid(), patient_ids[2], 82.3, 178, false, false, false, base_date, base_date),
(gen_random_uuid(), patient_ids[3], 58.7, 162, false, false, true, base_date, base_date),
(gen_random_uuid(), patient_ids[4], 95.1, 175, true, true, false, base_date, base_date),
(gen_random_uuid(), patient_ids[5], 65.2, 168, false, false, true, base_date, base_date),
(gen_random_uuid(), patient_ids[6], 110.8, 172, false, true, false, base_date, base_date),
(gen_random_uuid(), patient_ids[7], 72.4, 170, false, false, true, base_date, base_date),
(gen_random_uuid(), patient_ids[8], 75.6, 180, false, false, true, base_date, base_date),
(gen_random_uuid(), patient_ids[9], 63.9, 158, false, true, false, base_date, base_date),
(gen_random_uuid(), patient_ids[10], 78.2, 169, true, true, false, base_date, base_date);

-- =====================================================
-- INDICADORES MÉDICOS - EVOLUÇÃO POR PACIENTE
-- =====================================================

-- ===== MARIA SILVA SANTOS - HIPERTENSA =====
-- Evolução da pressão arterial ao longo de 6 meses (melhora gradual com medicação)
INSERT INTO patient_indicator_values (id, patient_id, indicator_id, value, unit, measured_at, notes, created_at) VALUES
(gen_random_uuid(), patient_ids[1], 'pressao-arterial-sistolica', '165', 'mmHg', base_date, 'Primeira consulta - pressão elevada', base_date),
(gen_random_uuid(), patient_ids[1], 'pressao-arterial-sistolica', '158', 'mmHg', base_date + INTERVAL '2 weeks', 'Início medicação - Losartana 50mg', base_date + INTERVAL '2 weeks'),
(gen_random_uuid(), patient_ids[1], 'pressao-arterial-sistolica', '152', 'mmHg', base_date + INTERVAL '1 month', 'Ajuste de dose - Losartana 100mg', base_date + INTERVAL '1 month'),
(gen_random_uuid(), patient_ids[1], 'pressao-arterial-sistolica', '145', 'mmHg', base_date + INTERVAL '2 months', 'Melhora progressiva', base_date + INTERVAL '2 months'),
(gen_random_uuid(), patient_ids[1], 'pressao-arterial-sistolica', '138', 'mmHg', base_date + INTERVAL '3 months', 'Atingindo meta terapêutica', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[1], 'pressao-arterial-sistolica', '135', 'mmHg', base_date + INTERVAL '4 months', 'Pressão controlada', base_date + INTERVAL '4 months'),
(gen_random_uuid(), patient_ids[1], 'pressao-arterial-sistolica', '132', 'mmHg', base_date + INTERVAL '5 months', 'Excelente controle', base_date + INTERVAL '5 months'),
(gen_random_uuid(), patient_ids[1], 'peso', '68.5', 'kg', base_date, 'Peso inicial', base_date),
(gen_random_uuid(), patient_ids[1], 'peso', '67.2', 'kg', base_date + INTERVAL '3 months', 'Perdeu peso com dieta', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[1], 'frequencia-cardiaca', '82', 'bpm', base_date + INTERVAL '5 months', 'FC em repouso normalizada', base_date + INTERVAL '5 months');

-- ===== JOÃO CARLOS OLIVEIRA - DIABÉTICO =====
-- Evolução do diabetes com algumas oscilações
INSERT INTO patient_indicator_values (id, patient_id, indicator_id, value, unit, measured_at, notes, created_at) VALUES
(gen_random_uuid(), patient_ids[2], 'glicemia-jejum', '185', 'mg/dL', base_date, 'Diagnóstico - glicemia muito elevada', base_date),
(gen_random_uuid(), patient_ids[2], 'glicemia-jejum', '165', 'mg/dL', base_date + INTERVAL '1 month', 'Início metformina 850mg', base_date + INTERVAL '1 month'),
(gen_random_uuid(), patient_ids[2], 'glicemia-jejum', '142', 'mg/dL', base_date + INTERVAL '2 months', 'Melhora com dieta e exercício', base_date + INTERVAL '2 months'),
(gen_random_uuid(), patient_ids[2], 'glicemia-jejum', '158', 'mg/dL', base_date + INTERVAL '3 months', 'Descompensação - festas de fim de ano', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[2], 'glicemia-jejum', '138', 'mg/dL', base_date + INTERVAL '4 months', 'Retomou controle dietético', base_date + INTERVAL '4 months'),
(gen_random_uuid(), patient_ids[2], 'hba1c', '9.2', '%', base_date, 'HbA1c inicial muito alterada', base_date),
(gen_random_uuid(), patient_ids[2], 'hba1c', '7.8', '%', base_date + INTERVAL '3 months', 'Melhora significativa', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[2], 'peso', '82.3', 'kg', base_date, 'Peso inicial', base_date),
(gen_random_uuid(), patient_ids[2], 'peso', '79.5', 'kg', base_date + INTERVAL '4 months', 'Perda de peso com tratamento', base_date + INTERVAL '4 months'),
(gen_random_uuid(), patient_ids[2], 'circunferencia-abdominal', '98', 'cm', base_date + INTERVAL '5 months', 'Ainda acima do ideal', base_date + INTERVAL '5 months');

-- ===== ANA BEATRIZ COSTA - PREVENÇÃO =====
-- Jovem saudável - indicadores preventivos normais
INSERT INTO patient_indicator_values (id, patient_id, indicator_id, value, unit, measured_at, notes, created_at) VALUES
(gen_random_uuid(), patient_ids[3], 'colesterol-total', '180', 'mg/dL', base_date, 'Exame de rotina - normal', base_date),
(gen_random_uuid(), patient_ids[3], 'colesterol-hdl', '65', 'mg/dL', base_date, 'HDL excelente', base_date),
(gen_random_uuid(), patient_ids[3], 'colesterol-ldl', '98', 'mg/dL', base_date, 'LDL ótimo', base_date),
(gen_random_uuid(), patient_ids[3], 'triglicerides', '85', 'mg/dL', base_date, 'Triglicérides normais', base_date),
(gen_random_uuid(), patient_ids[3], 'pressao-arterial-sistolica', '115', 'mmHg', base_date, 'Pressão ótima', base_date),
(gen_random_uuid(), patient_ids[3], 'pressao-arterial-diastolica', '75', 'mmHg', base_date, 'Pressão ótima', base_date),
(gen_random_uuid(), patient_ids[3], 'glicemia-jejum', '88', 'mg/dL', base_date, 'Glicemia normal', base_date),
(gen_random_uuid(), patient_ids[3], 'peso', '58.7', 'kg', base_date, 'Peso ideal', base_date),
(gen_random_uuid(), patient_ids[3], 'imc', '22.4', 'kg/m²', base_date, 'IMC ideal', base_date),
(gen_random_uuid(), patient_ids[3], 'vitamina-d', '32', 'ng/mL', base_date + INTERVAL '3 months', 'Vitamina D adequada', base_date + INTERVAL '3 months');

-- ===== CARLOS EDUARDO FERREIRA - CARDIOPATA =====
-- Pós-infarto - controle rigoroso, algumas oscilações
INSERT INTO patient_indicator_values (id, patient_id, indicator_id, value, unit, measured_at, notes, created_at) VALUES
(gen_random_uuid(), patient_ids[4], 'pressao-arterial-sistolica', '160', 'mmHg', base_date, 'Pressão elevada pós-infarto', base_date),
(gen_random_uuid(), patient_ids[4], 'pressao-arterial-sistolica', '145', 'mmHg', base_date + INTERVAL '1 month', 'Medicação otimizada', base_date + INTERVAL '1 month'),
(gen_random_uuid(), patient_ids[4], 'pressao-arterial-sistolica', '138', 'mmHg', base_date + INTERVAL '3 months', 'Controle adequado', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[4], 'colesterol-ldl', '165', 'mg/dL', base_date, 'LDL muito elevado', base_date),
(gen_random_uuid(), patient_ids[4], 'colesterol-ldl', '120', 'mg/dL', base_date + INTERVAL '2 months', 'Melhora com estatina', base_date + INTERVAL '2 months'),
(gen_random_uuid(), patient_ids[4], 'colesterol-ldl', '88', 'mg/dL', base_date + INTERVAL '4 months', 'Meta terapêutica atingida', base_date + INTERVAL '4 months'),
(gen_random_uuid(), patient_ids[4], 'frequencia-cardiaca', '88', 'bpm', base_date, 'FC em repouso', base_date),
(gen_random_uuid(), patient_ids[4], 'peso', '95.1', 'kg', base_date, 'Sobrepeso importante', base_date),
(gen_random_uuid(), patient_ids[4], 'peso', '92.3', 'kg', base_date + INTERVAL '3 months', 'Perda de peso gradual', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[4], 'troponina', '0.02', 'ng/mL', base_date + INTERVAL '5 months', 'Controle pós-infarto - normal', base_date + INTERVAL '5 months');

-- ===== FERNANDA CRISTINA LIMA - GESTANTE =====
-- Evolução gestacional normal com ganho de peso fisiológico
INSERT INTO patient_indicator_values (id, patient_id, indicator_id, value, unit, measured_at, notes, created_at) VALUES
(gen_random_uuid(), patient_ids[5], 'peso', '65.2', 'kg', base_date, '22 semanas gestação', base_date),
(gen_random_uuid(), patient_ids[5], 'peso', '67.8', 'kg', base_date + INTERVAL '1 month', '26 semanas - ganho adequado', base_date + INTERVAL '1 month'),
(gen_random_uuid(), patient_ids[5], 'peso', '70.1', 'kg', base_date + INTERVAL '2 months', '30 semanas - dentro do esperado', base_date + INTERVAL '2 months'),
(gen_random_uuid(), patient_ids[5], 'pressao-arterial-sistolica', '118', 'mmHg', base_date, 'Pressão normal na gestação', base_date),
(gen_random_uuid(), patient_ids[5], 'pressao-arterial-sistolica', '125', 'mmHg', base_date + INTERVAL '2 months', 'Leve elevação - monitorar', base_date + INTERVAL '2 months'),
(gen_random_uuid(), patient_ids[5], 'glicemia-jejum', '85', 'mg/dL', base_date, 'Glicemia normal', base_date),
(gen_random_uuid(), patient_ids[5], 'teste-tolerancia-glicose', '145', 'mg/dL', base_date + INTERVAL '1 month', 'TTG normal na gestação', base_date + INTERVAL '1 month'),
(gen_random_uuid(), patient_ids[5], 'hemoglobina', '11.8', 'g/dL', base_date, 'Leve anemia gestacional', base_date),
(gen_random_uuid(), patient_ids[5], 'hemoglobina', '12.2', 'g/dL', base_date + INTERVAL '2 months', 'Melhora com sulfato ferroso', base_date + INTERVAL '2 months'),
(gen_random_uuid(), patient_ids[5], 'altura-uterina', '28', 'cm', base_date + INTERVAL '2 months', '30 semanas - crescimento fetal adequado', base_date + INTERVAL '2 months');

-- ===== ROBERTO JOSÉ MENDES - OBESO =====
-- Luta contra obesidade com resultados lentos mas consistentes
INSERT INTO patient_indicator_values (id, patient_id, indicator_id, value, unit, measured_at, notes, created_at) VALUES
(gen_random_uuid(), patient_ids[6], 'peso', '110.8', 'kg', base_date, 'Peso inicial - obesidade grau II', base_date),
(gen_random_uuid(), patient_ids[6], 'peso', '108.2', 'kg', base_date + INTERVAL '1 month', 'Início programa emagrecimento', base_date + INTERVAL '1 month'),
(gen_random_uuid(), patient_ids[6], 'peso', '106.5', 'kg', base_date + INTERVAL '2 months', 'Perda gradual mas consistente', base_date + INTERVAL '2 months'),
(gen_random_uuid(), patient_ids[6], 'peso', '104.1', 'kg', base_date + INTERVAL '3 months', 'Continua perdendo peso', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[6], 'peso', '103.8', 'kg', base_date + INTERVAL '4 months', 'Platô - ajustar dieta', base_date + INTERVAL '4 months'),
(gen_random_uuid(), patient_ids[6], 'imc', '37.5', 'kg/m²', base_date, 'IMC inicial', base_date),
(gen_random_uuid(), patient_ids[6], 'imc', '35.1', 'kg/m²', base_date + INTERVAL '4 months', 'Redução do IMC', base_date + INTERVAL '4 months'),
(gen_random_uuid(), patient_ids[6], 'circunferencia-abdominal', '118', 'cm', base_date, 'Circunferência muito elevada', base_date),
(gen_random_uuid(), patient_ids[6], 'circunferencia-abdominal', '112', 'cm', base_date + INTERVAL '4 months', 'Redução da gordura abdominal', base_date + INTERVAL '4 months'),
(gen_random_uuid(), patient_ids[6], 'pressao-arterial-sistolica', '142', 'mmHg', base_date + INTERVAL '5 months', 'Pressão melhorou com perda de peso', base_date + INTERVAL '5 months');

-- ===== JULIANA APARECIDA ROCHA - ASMÁTICA =====
-- Controle da asma com medicação e medidas ambientais
INSERT INTO patient_indicator_values (id, patient_id, indicator_id, value, unit, measured_at, notes, created_at) VALUES
(gen_random_uuid(), patient_ids[7], 'peak-flow', '320', 'L/min', base_date, 'Função pulmonar reduzida', base_date),
(gen_random_uuid(), patient_ids[7], 'peak-flow', '385', 'L/min', base_date + INTERVAL '1 month', 'Melhora com corticoide inalatório', base_date + INTERVAL '1 month'),
(gen_random_uuid(), patient_ids[7], 'peak-flow', '420', 'L/min', base_date + INTERVAL '3 months', 'Controle adequado da asma', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[7], 'peak-flow', '380', 'L/min', base_date + INTERVAL '4 months', 'Crise por alérgeno - primavera', base_date + INTERVAL '4 months'),
(gen_random_uuid(), patient_ids[7], 'uso-broncodilatador', '4', 'doses/dia', base_date, 'Uso frequente de salbutamol', base_date),
(gen_random_uuid(), patient_ids[7], 'uso-broncodilatador', '2', 'doses/dia', base_date + INTERVAL '2 months', 'Redução do uso de resgate', base_date + INTERVAL '2 months'),
(gen_random_uuid(), patient_ids[7], 'uso-broncodilatador', '1', 'doses/dia', base_date + INTERVAL '3 months', 'Uso esporádico - bom controle', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[7], 'saturacao-oxigenio', '96', '%', base_date, 'Saturação durante crise', base_date),
(gen_random_uuid(), patient_ids[7], 'saturacao-oxigenio', '99', '%', base_date + INTERVAL '3 months', 'Saturação normal em repouso', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[7], 'ige-total', '450', 'UI/mL', base_date + INTERVAL '2 months', 'IgE elevada - perfil alérgico', base_date + INTERVAL '2 months');

-- ===== PEDRO HENRIQUE ALMEIDA - ATLETA =====
-- Monitoramento esportivo - parâmetros de alto rendimento
INSERT INTO patient_indicator_values (id, patient_id, indicator_id, value, unit, measured_at, notes, created_at) VALUES
(gen_random_uuid(), patient_ids[8], 'frequencia-cardiaca-repouso', '48', 'bpm', base_date, 'FC de repouso de atleta', base_date),
(gen_random_uuid(), patient_ids[8], 'frequencia-cardiaca-repouso', '45', 'bpm', base_date + INTERVAL '2 months', 'Melhora do condicionamento', base_date + INTERVAL '2 months'),
(gen_random_uuid(), patient_ids[8], 'vo2-max', '68', 'ml/kg/min', base_date, 'VO2 máximo excelente', base_date),
(gen_random_uuid(), patient_ids[8], 'vo2-max', '72', 'ml/kg/min', base_date + INTERVAL '3 months', 'Evolução no condicionamento', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[8], 'peso', '75.6', 'kg', base_date, 'Peso ideal para corrida', base_date),
(gen_random_uuid(), patient_ids[8], 'peso', '74.8', 'kg', base_date + INTERVAL '2 months', 'Ajuste fino para competição', base_date + INTERVAL '2 months'),
(gen_random_uuid(), patient_ids[8], 'percentual-gordura', '8.5', '%', base_date, 'Baixo percentual de gordura', base_date),
(gen_random_uuid(), patient_ids[8], 'lactato', '12.8', 'mmol/L', base_date + INTERVAL '1 month', 'Limiar anaeróbio - teste esforço', base_date + INTERVAL '1 month'),
(gen_random_uuid(), patient_ids[8], 'ferritina', '45', 'ng/mL', base_date + INTERVAL '3 months', 'Ferritina baixa - atleta de endurance', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[8], 'creatina-quinase', '180', 'U/L', base_date + INTERVAL '4 months', 'CK após treino intenso', base_date + INTERVAL '4 months');

-- ===== LUCIANA REGINA BARBOSA - ARTRITE REUMATOIDE =====
-- Controle da artrite com imunossupressor e oscilações
INSERT INTO patient_indicator_values (id, patient_id, indicator_id, value, unit, measured_at, notes, created_at) VALUES
(gen_random_uuid(), patient_ids[9], 'vas-dor', '8', 'escala 0-10', base_date, 'Dor intensa - início tratamento', base_date),
(gen_random_uuid(), patient_ids[9], 'vas-dor', '6', 'escala 0-10', base_date + INTERVAL '1 month', 'Melhora com metotrexato', base_date + INTERVAL '1 month'),
(gen_random_uuid(), patient_ids[9], 'vas-dor', '4', 'escala 0-10', base_date + INTERVAL '2 months', 'Dor controlada', base_date + INTERVAL '2 months'),
(gen_random_uuid(), patient_ids[9], 'vas-dor', '7', 'escala 0-10', base_date + INTERVAL '3 months', 'Crise - infecção respiratória', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[9], 'vas-dor', '3', 'escala 0-10', base_date + INTERVAL '4 months', 'Retomou controle após antibiótico', base_date + INTERVAL '4 months'),
(gen_random_uuid(), patient_ids[9], 'pcr', '45', 'mg/L', base_date, 'PCR elevada - inflamação ativa', base_date),
(gen_random_uuid(), patient_ids[9], 'pcr', '18', 'mg/L', base_date + INTERVAL '2 months', 'Redução da inflamação', base_date + INTERVAL '2 months'),
(gen_random_uuid(), patient_ids[9], 'pcr', '8', 'mg/L', base_date + INTERVAL '4 months', 'PCR quase normalizada', base_date + INTERVAL '4 months'),
(gen_random_uuid(), patient_ids[9], 'rigidez-matinal', '120', 'minutos', base_date, 'Rigidez matinal prolongada', base_date),
(gen_random_uuid(), patient_ids[9], 'rigidez-matinal', '30', 'minutos', base_date + INTERVAL '4 months', 'Melhora significativa', base_date + INTERVAL '4 months');

-- ===== MARCOS ANTONIO PEREIRA - IDOSO POLIMÓRBIDO =====
-- Múltiplas comorbidades com controle desafiador
INSERT INTO patient_indicator_values (id, patient_id, indicator_id, value, unit, measured_at, notes, created_at) VALUES
(gen_random_uuid(), patient_ids[10], 'pressao-arterial-sistolica', '168', 'mmHg', base_date, 'Hipertensão descontrolada', base_date),
(gen_random_uuid(), patient_ids[10], 'pressao-arterial-sistolica', '152', 'mmHg', base_date + INTERVAL '1 month', 'Ajuste medicação', base_date + INTERVAL '1 month'),
(gen_random_uuid(), patient_ids[10], 'pressao-arterial-sistolica', '142', 'mmHg', base_date + INTERVAL '3 months', 'Melhora gradual', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[10], 'glicemia-jejum', '172', 'mg/dL', base_date, 'Diabetes descompensado', base_date),
(gen_random_uuid(), patient_ids[10], 'glicemia-jejum', '148', 'mg/dL', base_date + INTERVAL '2 months', 'Melhora com insulina', base_date + INTERVAL '2 months'),
(gen_random_uuid(), patient_ids[10], 'creatinina', '1.8', 'mg/dL', base_date, 'Função renal comprometida', base_date),
(gen_random_uuid(), patient_ids[10], 'creatinina', '1.6', 'mg/dL', base_date + INTERVAL '3 months', 'Estabilização da função renal', base_date + INTERVAL '3 months'),
(gen_random_uuid(), patient_ids[10], 'colesterol-total', '245', 'mg/dL', base_date, 'Dislipidemia', base_date),
(gen_random_uuid(), patient_ids[10], 'peso', '78.2', 'kg', base_date, 'Perda de peso não intencional', base_date),
(gen_random_uuid(), patient_ids[10], 'peso', '76.8', 'kg', base_date + INTERVAL '4 months', 'Continua perdendo peso - investigar', base_date + INTERVAL '4 months');

RAISE NOTICE 'Inseridos 10 pacientes e 100 indicadores médicos com evolução realista!';

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

-- Verificar indicadores por paciente (amostra)
SELECT 
    p.name as paciente,
    piv.indicator_id,
    piv.value,
    piv.unit,
    piv.measured_at,
    LEFT(piv.notes, 30) as observacao
FROM patients p
JOIN patient_indicator_values piv ON p.id = piv.patient_id
WHERE p.doctor_id = '94e784dd-797a-4962-81ae-825e7060352e'
ORDER BY p.name, piv.measured_at
LIMIT 20;
