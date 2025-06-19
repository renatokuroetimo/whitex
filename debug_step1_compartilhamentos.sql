-- STEP 1: Verificar compartilhamentos criados
SELECT 
    id,
    doctor_id,
    patient_id,
    shared_at,
    created_at
FROM doctor_patient_sharing 
ORDER BY created_at DESC;
