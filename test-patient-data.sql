-- Verificar dados do paciente Judith Kuroe

-- 1. Buscar na tabela patients
SELECT 'PATIENTS TABLE' as source, *
FROM patients 
WHERE name ILIKE '%judith%' OR name ILIKE '%kuroe%'
ORDER BY created_at DESC;

-- 2. Buscar na tabela users (se foi criada conta)
SELECT 'USERS TABLE' as source, *
FROM users 
WHERE full_name ILIKE '%judith%' OR email ILIKE '%judith%'
ORDER BY created_at DESC;

-- 3. Buscar dados pessoais auxiliares
SELECT 'PERSONAL DATA TABLE' as source, ppd.*, p.name as patient_name
FROM patient_personal_data ppd
LEFT JOIN patients p ON p.id = ppd.user_id
WHERE p.name ILIKE '%judith%' OR ppd.full_name ILIKE '%judith%'
ORDER BY ppd.created_at DESC;

-- 4. Buscar dados médicos auxiliares
SELECT 'MEDICAL DATA TABLE' as source, pmd.*, p.name as patient_name
FROM patient_medical_data pmd
LEFT JOIN patients p ON p.id = pmd.user_id
WHERE p.name ILIKE '%judith%'
ORDER BY pmd.created_at DESC;

-- 5. Contar registros por tabela
SELECT 
  'patients' as table_name,
  COUNT(*) as total_records
FROM patients
WHERE name ILIKE '%judith%'

UNION ALL

SELECT 
  'patient_personal_data' as table_name,
  COUNT(*) as total_records
FROM patient_personal_data ppd
LEFT JOIN patients p ON p.id = ppd.user_id
WHERE p.name ILIKE '%judith%'

UNION ALL

SELECT 
  'patient_medical_data' as table_name,
  COUNT(*) as total_records
FROM patient_medical_data pmd
LEFT JOIN patients p ON p.id = pmd.user_id
WHERE p.name ILIKE '%judith%';
