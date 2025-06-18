-- DIAGNÓSTICO COMPLETO DO SISTEMA DE COMPARTILHAMENTO

-- 1. Verificar se existem usuários médicos e pacientes
SELECT 
  '=== USUÁRIOS CADASTRADOS ===' as info,
  profession,
  COUNT(*) as total,
  STRING_AGG(email, ', ') as emails
FROM users 
GROUP BY profession
ORDER BY profession;

-- 2. Verificar se existem dados pessoais de pacientes
SELECT 
  '=== DADOS PESSOAIS DE PACIENTES ===' as info,
  COUNT(*) as total_registros,
  COUNT(DISTINCT user_id) as usuarios_unicos
FROM patient_personal_data;

-- 3. Verificar compartilhamentos existentes
SELECT 
  '=== COMPARTILHAMENTOS EXISTENTES ===' as info,
  COUNT(*) as total_compartilhamentos
FROM doctor_patient_sharing;

-- 4. Detalhes dos compartilhamentos
SELECT 
  dps.id,
  dps.doctor_id,
  dps.patient_id,
  dps.shared_at,
  doctor.email as doctor_email,
  patient.email as patient_email
FROM doctor_patient_sharing dps
LEFT JOIN users doctor ON dps.doctor_id = doctor.id
LEFT JOIN users patient ON dps.patient_id = patient.id;

-- 5. CRIAR DADOS DE TESTE (execute apenas se necessário)
-- Primeiro, certificar que temos pelo menos 1 médico e 1 paciente
INSERT INTO users (email, profession, crm, full_name) 
SELECT 'medico@teste.com', 'medico', '123456', 'Dr. Teste'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'medico@teste.com');

INSERT INTO users (email, profession, full_name) 
SELECT 'paciente@teste.com', 'paciente', 'Paciente Teste'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'paciente@teste.com');

-- Criar dados pessoais para o paciente de teste
INSERT INTO patient_personal_data (user_id, full_name, email, birth_date, gender, state, city)
SELECT 
  u.id,
  'Paciente Teste',
  'paciente@teste.com',
  '1990-01-01',
  'masculino',
  'SP',
  'São Paulo'
FROM users u 
WHERE u.email = 'paciente@teste.com'
AND NOT EXISTS (
  SELECT 1 FROM patient_personal_data ppd 
  WHERE ppd.user_id = u.id
);

-- Criar compartilhamento de teste
INSERT INTO doctor_patient_sharing (doctor_id, patient_id) 
SELECT 
  (SELECT id FROM users WHERE email = 'medico@teste.com'),
  (SELECT id FROM users WHERE email = 'paciente@teste.com')
WHERE NOT EXISTS (
  SELECT 1 FROM doctor_patient_sharing 
  WHERE doctor_id = (SELECT id FROM users WHERE email = 'medico@teste.com')
  AND patient_id = (SELECT id FROM users WHERE email = 'paciente@teste.com')
);

-- 6. VERIFICAÇÃO FINAL
SELECT 
  '=== VERIFICAÇÃO FINAL ===' as info,
  (SELECT COUNT(*) FROM users WHERE profession = 'medico') as medicos,
  (SELECT COUNT(*) FROM users WHERE profession = 'paciente') as pacientes,
  (SELECT COUNT(*) FROM patient_personal_data) as dados_pessoais,
  (SELECT COUNT(*) FROM doctor_patient_sharing) as compartilhamentos;
