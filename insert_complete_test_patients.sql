-- Script completo para inserir 10 pacientes de teste com todos os dados
-- Vinculados ao médico: 94e784dd-797a-4962-81ae-825e7060352e

DO $$
DECLARE
    patient_ids UUID[] := ARRAY[
        gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(),
        gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid()
    ];
    doctor_id UUID := '94e784dd-797a-4962-81ae-825e7060352e';
BEGIN

-- Inserir pacientes na tabela patients
INSERT INTO patients (id, name, status, notes, doctor_id, created_at) VALUES
(patient_ids[1], 'Maria Silva Santos', 'ativo', 'Paciente hipertensa, acompanhamento regular', doctor_id, NOW()),
(patient_ids[2], 'João Carlos Oliveira', 'ativo', 'Diabetes tipo 2, controle dietético', doctor_id, NOW()),
(patient_ids[3], 'Ana Beatriz Costa', 'ativo', 'Acompanhamento preventivo, sem comorbidades', doctor_id, NOW()),
(patient_ids[4], 'Carlos Eduardo Ferreira', 'ativo', 'Histórico de problemas cardíacos', doctor_id, NOW()),
(patient_ids[5], 'Fernanda Cristina Lima', 'ativo', 'Gestante, pré-natal regular', doctor_id, NOW()),
(patient_ids[6], 'Roberto José Mendes', 'ativo', 'Obesidade grau II, programa de emagrecimento', doctor_id, NOW()),
(patient_ids[7], 'Juliana Aparecida Rocha', 'ativo', 'Asma brônquica, uso de broncodilatador', doctor_id, NOW()),
(patient_ids[8], 'Pedro Henrique Almeida', 'ativo', 'Jovem atleta, acompanhamento esportivo', doctor_id, NOW()),
(patient_ids[9], 'Luciana Regina Barbosa', 'ativo', 'Artrite reumatoide, tratamento imunossupressor', doctor_id, NOW()),
(patient_ids[10], 'Marcos Antonio Pereira', 'ativo', 'Idoso com múltiplas comorbidades', doctor_id, NOW());

-- Inserir dados pessoais na tabela patient_personal_data (se existir)
INSERT INTO patient_personal_data (id, user_id, full_name, email, birth_date, gender, city, state, phone, health_plan, created_at, updated_at) VALUES
(gen_random_uuid(), patient_ids[1], 'Maria Silva Santos', 'maria.silva@email.com', '1985-03-15', 'Feminino', 'São Paulo', 'SP', '(11) 99999-1111', 'Unimed', NOW(), NOW()),
(gen_random_uuid(), patient_ids[2], 'João Carlos Oliveira', 'joao.oliveira@email.com', '1978-07-22', 'Masculino', 'Rio de Janeiro', 'RJ', '(21) 99999-2222', 'Bradesco Saúde', NOW(), NOW()),
(gen_random_uuid(), patient_ids[3], 'Ana Beatriz Costa', 'ana.costa@email.com', '1996-11-08', 'Feminino', 'Belo Horizonte', 'MG', '(31) 99999-3333', 'SulAmérica', NOW(), NOW()),
(gen_random_uuid(), patient_ids[4], 'Carlos Eduardo Ferreira', 'carlos.ferreira@email.com', '1972-04-12', 'Masculino', 'Salvador', 'BA', '(71) 99999-4444', 'Amil', NOW(), NOW()),
(gen_random_uuid(), patient_ids[5], 'Fernanda Cristina Lima', 'fernanda.lima@email.com', '1993-09-25', 'Feminino', 'Fortaleza', 'CE', '(85) 99999-5555', 'Hapvida', NOW(), NOW()),
(gen_random_uuid(), patient_ids[6], 'Roberto José Mendes', 'roberto.mendes@email.com', '1981-01-18', 'Masculino', 'Recife', 'PE', '(81) 99999-6666', 'Unimed', NOW(), NOW()),
(gen_random_uuid(), patient_ids[7], 'Juliana Aparecida Rocha', 'juliana.rocha@email.com', '1989-06-30', 'Feminino', 'Porto Alegre', 'RS', '(51) 99999-7777', 'GEAP', NOW(), NOW()),
(gen_random_uuid(), patient_ids[8], 'Pedro Henrique Almeida', 'pedro.almeida@email.com', '2000-12-03', 'Masculino', 'Curitiba', 'PR', '(41) 99999-8888', 'Bradesco Saúde', NOW(), NOW()),
(gen_random_uuid(), patient_ids[9], 'Luciana Regina Barbosa', 'luciana.barbosa@email.com', '1976-08-14', 'Feminino', 'Brasília', 'DF', '(61) 99999-9999', 'Cassi', NOW(), NOW()),
(gen_random_uuid(), patient_ids[10], 'Marcos Antonio Pereira', 'marcos.pereira@email.com', '1957-05-20', 'Masculino', 'Goiânia', 'GO', '(62) 99999-0000', 'SulAmérica', NOW(), NOW());

-- Inserir dados médicos na tabela patient_medical_data (se existir)
INSERT INTO patient_medical_data (id, user_id, weight, height, smoker, high_blood_pressure, physical_activity, created_at, updated_at) VALUES
(gen_random_uuid(), patient_ids[1], 68.5, 165, false, true, true, NOW(), NOW()),
(gen_random_uuid(), patient_ids[2], 82.3, 178, false, false, false, NOW(), NOW()),
(gen_random_uuid(), patient_ids[3], 58.7, 162, false, false, true, NOW(), NOW()),
(gen_random_uuid(), patient_ids[4], 95.1, 175, true, true, false, NOW(), NOW()),
(gen_random_uuid(), patient_ids[5], 65.2, 168, false, false, true, NOW(), NOW()),
(gen_random_uuid(), patient_ids[6], 110.8, 172, false, true, false, NOW(), NOW()),
(gen_random_uuid(), patient_ids[7], 72.4, 170, false, false, true, NOW(), NOW()),
(gen_random_uuid(), patient_ids[8], 75.6, 180, false, false, true, NOW(), NOW()),
(gen_random_uuid(), patient_ids[9], 63.9, 158, false, true, false, NOW(), NOW()),
(gen_random_uuid(), patient_ids[10], 78.2, 169, true, true, false, NOW(), NOW());

RAISE NOTICE 'Inseridos 10 pacientes de teste com sucesso!';

END $$;

-- Query para verificar os pacientes inseridos
SELECT 
    p.name,
    p.status,
    p.notes,
    p.created_at
FROM patients p 
WHERE p.doctor_id = '94e784dd-797a-4962-81ae-825e7060352e'
ORDER BY p.created_at DESC
LIMIT 10;
