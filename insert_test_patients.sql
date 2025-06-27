-- Inserir 10 pacientes de teste vinculados ao médico 94e784dd-797a-4962-81ae-825e7060352e

-- Paciente 1: Maria Silva
INSERT INTO patients (id, name, status, notes, doctor_id, created_at) 
VALUES (
  gen_random_uuid(), 
  'Maria Silva Santos', 
  'ativo', 
  'Paciente hipertensa, acompanhamento regular', 
  '94e784dd-797a-4962-81ae-825e7060352e', 
  NOW()
);

-- Paciente 2: João Oliveira
INSERT INTO patients (id, name, status, notes, doctor_id, created_at) 
VALUES (
  gen_random_uuid(), 
  'João Carlos Oliveira', 
  'ativo', 
  'Diabetes tipo 2, controle dietético', 
  '94e784dd-797a-4962-81ae-825e7060352e', 
  NOW()
);

-- Paciente 3: Ana Costa
INSERT INTO patients (id, name, status, notes, doctor_id, created_at) 
VALUES (
  gen_random_uuid(), 
  'Ana Beatriz Costa', 
  'ativo', 
  'Acompanhamento preventivo, sem comorbidades', 
  '94e784dd-797a-4962-81ae-825e7060352e', 
  NOW()
);

-- Paciente 4: Carlos Ferreira
INSERT INTO patients (id, name, status, notes, doctor_id, created_at) 
VALUES (
  gen_random_uuid(), 
  'Carlos Eduardo Ferreira', 
  'ativo', 
  'Histórico de problemas cardíacos', 
  '94e784dd-797a-4962-81ae-825e7060352e', 
  NOW()
);

-- Paciente 5: Fernanda Lima
INSERT INTO patients (id, name, status, notes, doctor_id, created_at) 
VALUES (
  gen_random_uuid(), 
  'Fernanda Cristina Lima', 
  'ativo', 
  'Gestante, pré-natal regular', 
  '94e784dd-797a-4962-81ae-825e7060352e', 
  NOW()
);

-- Paciente 6: Roberto Mendes
INSERT INTO patients (id, name, status, notes, doctor_id, created_at) 
VALUES (
  gen_random_uuid(), 
  'Roberto José Mendes', 
  'ativo', 
  'Obesidade grau II, programa de emagrecimento', 
  '94e784dd-797a-4962-81ae-825e7060352e', 
  NOW()
);

-- Paciente 7: Juliana Rocha
INSERT INTO patients (id, name, status, notes, doctor_id, created_at) 
VALUES (
  gen_random_uuid(), 
  'Juliana Aparecida Rocha', 
  'ativo', 
  'Asma brônquica, uso de broncodilatador', 
  '94e784dd-797a-4962-81ae-825e7060352e', 
  NOW()
);

-- Paciente 8: Pedro Almeida
INSERT INTO patients (id, name, status, notes, doctor_id, created_at) 
VALUES (
  gen_random_uuid(), 
  'Pedro Henrique Almeida', 
  'ativo', 
  'Jovem atleta, acompanhamento esportivo', 
  '94e784dd-797a-4962-81ae-825e7060352e', 
  NOW()
);

-- Paciente 9: Luciana Barbosa
INSERT INTO patients (id, name, status, notes, doctor_id, created_at) 
VALUES (
  gen_random_uuid(), 
  'Luciana Regina Barbosa', 
  'ativo', 
  'Artrite reumatoide, tratamento imunossupressor', 
  '94e784dd-797a-4962-81ae-825e7060352e', 
  NOW()
);

-- Paciente 10: Marcos Pereira
INSERT INTO patients (id, name, status, notes, doctor_id, created_at) 
VALUES (
  gen_random_uuid(), 
  'Marcos Antonio Pereira', 
  'ativo', 
  'Idoso com múltiplas comorbidades', 
  '94e784dd-797a-4962-81ae-825e7060352e', 
  NOW()
);

-- Agora vamos inserir dados pessoais detalhados para cada paciente
-- Primeiro, vamos obter os IDs dos pacientes criados e depois inserir dados pessoais

-- Script para inserir dados pessoais dos pacientes (execute após o script acima)
-- Você precisará substituir os UUIDs pelos IDs reais dos pacientes criados

/* 
EXEMPLO DE COMO INSERIR DADOS PESSOAIS (substitua PATIENT_UUID_HERE pelos IDs reais):

INSERT INTO patient_personal_data (
  id, user_id, full_name, email, birth_date, gender, city, state, 
  phone, health_plan, created_at, updated_at
) VALUES 
(gen_random_uuid(), 'PATIENT_UUID_HERE', 'Maria Silva Santos', 'maria.silva@email.com', '1985-03-15', 'Feminino', 'São Paulo', 'SP', '(11) 99999-1111', 'Unimed', NOW(), NOW()),
(gen_random_uuid(), 'PATIENT_UUID_HERE', 'João Carlos Oliveira', 'joao.oliveira@email.com', '1978-07-22', 'Masculino', 'Rio de Janeiro', 'RJ', '(21) 99999-2222', 'Bradesco Saúde', NOW(), NOW());

INSERT INTO patient_medical_data (
  id, user_id, weight, height, smoker, high_blood_pressure, 
  physical_activity, created_at, updated_at
) VALUES 
(gen_random_uuid(), 'PATIENT_UUID_HERE', 68.5, 165, false, true, true, NOW(), NOW()),
(gen_random_uuid(), 'PATIENT_UUID_HERE', 82.3, 178, false, false, false, NOW(), NOW());
*/

-- Lista de dados de exemplo para os pacientes:
/*
1. Maria Silva Santos - 39 anos, 68.5kg, 1.65m, São Paulo/SP, maria.silva@email.com, Unimed
2. João Carlos Oliveira - 46 anos, 82.3kg, 1.78m, Rio de Janeiro/RJ, joao.oliveira@email.com, Bradesco Saúde  
3. Ana Beatriz Costa - 28 anos, 58.7kg, 1.62m, Belo Horizonte/MG, ana.costa@email.com, SulAmérica
4. Carlos Eduardo Ferreira - 52 anos, 95.1kg, 1.75m, Salvador/BA, carlos.ferreira@email.com, Amil
5. Fernanda Cristina Lima - 31 anos, 65.2kg, 1.68m, Fortaleza/CE, fernanda.lima@email.com, Hapvida
6. Roberto José Mendes - 43 anos, 110.8kg, 1.72m, Recife/PE, roberto.mendes@email.com, Unimed
7. Juliana Aparecida Rocha - 35 anos, 72.4kg, 1.70m, Porto Alegre/RS, juliana.rocha@email.com, GEAP
8. Pedro Henrique Almeida - 24 anos, 75.6kg, 1.80m, Curitiba/PR, pedro.almeida@email.com, Bradesco Saúde
9. Luciana Regina Barbosa - 48 anos, 63.9kg, 1.58m, Brasília/DF, luciana.barbosa@email.com, Cassi
10. Marcos Antonio Pereira - 67 anos, 78.2kg, 1.69m, Goiânia/GO, marcos.pereira@email.com, SulAmérica
*/
