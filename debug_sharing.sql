-- Script para verificar dados de compartilhamento no Supabase

-- 1. Verificar se existem usuários médicos e pacientes
SELECT 
  profession,
  COUNT(*) as total,
  STRING_AGG(email, ', ') as emails
FROM users 
GROUP BY profession;

-- 2. Verificar se existem compartilhamentos na tabela
SELECT 
  dps.*,
  doctor.email as doctor_email,
  patient.email as patient_email
FROM doctor_patient_sharing dps
LEFT JOIN users doctor ON dps.doctor_id = doctor.id
LEFT JOIN users patient ON dps.patient_id = patient.id;

-- 3. Verificar dados pessoais de pacientes
SELECT 
  ppd.*,
  u.email
FROM patient_personal_data ppd
LEFT JOIN users u ON ppd.user_id = u.id;

-- 4. Para criar dados de teste (execute apenas se necessário):
-- INSERT INTO doctor_patient_sharing (doctor_id, patient_id) 
-- SELECT 
--   (SELECT id FROM users WHERE profession = 'medico' LIMIT 1),
--   (SELECT id FROM users WHERE profession = 'paciente' LIMIT 1)
-- WHERE NOT EXISTS (SELECT 1 FROM doctor_patient_sharing);
