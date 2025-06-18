-- Script para limpar registros duplicados nas tabelas de pacientes

-- 1. Limpar registros duplicados em patient_personal_data
-- Manter apenas o registro mais recente para cada user_id
DELETE FROM patient_personal_data 
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id) id
  FROM patient_personal_data
  ORDER BY user_id, updated_at DESC NULLS LAST, created_at DESC
);

-- 2. Limpar registros duplicados em patient_medical_data
-- Manter apenas o registro mais recente para cada user_id
DELETE FROM patient_medical_data 
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id) id
  FROM patient_medical_data
  ORDER BY user_id, updated_at DESC NULLS LAST, created_at DESC
);

-- 3. Verificar se ainda há duplicados (deve retornar vazio)
SELECT user_id, COUNT(*) as count
FROM patient_personal_data
GROUP BY user_id
HAVING COUNT(*) > 1;

SELECT user_id, COUNT(*) as count
FROM patient_medical_data
GROUP BY user_id
HAVING COUNT(*) > 1;

-- 4. Adicionar constraint única para evitar duplicações futuras (opcional)
-- ALTER TABLE patient_personal_data ADD CONSTRAINT unique_user_personal UNIQUE (user_id);
-- ALTER TABLE patient_medical_data ADD CONSTRAINT unique_user_medical UNIQUE (user_id);
