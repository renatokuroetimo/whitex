-- Script para buscar IDs dos usuários para teste de compartilhamento

-- 1. Buscar todos os usuários com seus IDs
SELECT 
  id,
  email,
  profession,
  full_name,
  crm
FROM users 
ORDER BY profession, email;

-- 2. Buscar especificamente pacientes
SELECT 
  'PACIENTES:' as tipo,
  id,
  email,
  full_name
FROM users 
WHERE profession = 'paciente'
ORDER BY email;

-- 3. Buscar especificamente médicos  
SELECT 
  'MÉDICOS:' as tipo,
  id,
  email,
  full_name,
  crm
FROM users 
WHERE profession = 'medico'
ORDER BY email;

-- 4. Criar usuários de teste se não existirem
INSERT INTO users (email, profession, crm, full_name) 
SELECT 'paciente@teste.com', 'paciente', null, 'Paciente Teste'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'paciente@teste.com');

INSERT INTO users (email, profession, full_name) 
SELECT 'paciente2@teste.com', 'paciente', 'Paciente Teste 2'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'paciente2@teste.com');

-- 5. Mostrar resultado final
SELECT 
  '=== RESULTADO FINAL ===' as info,
  id,
  email,
  profession,
  full_name
FROM users 
ORDER BY profession, email;
