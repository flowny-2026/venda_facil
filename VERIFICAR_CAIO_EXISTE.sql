-- ========================================
-- VERIFICAR SE CAIO EXISTE
-- ========================================

-- 1. Buscar por email exato
SELECT 
  '1. BUSCAR POR EMAIL EXATO' as busca,
  email,
  id,
  created_at,
  email_confirmed_at
FROM auth.users
WHERE email = 'caio@oliveira.com';

-- 2. Buscar por qualquer email com "caio"
SELECT 
  '2. BUSCAR QUALQUER EMAIL COM CAIO' as busca,
  email,
  id,
  created_at,
  email_confirmed_at
FROM auth.users
WHERE email ILIKE '%caio%';

-- 3. Buscar por qualquer email com "oliveira"
SELECT 
  '3. BUSCAR QUALQUER EMAIL COM OLIVEIRA' as busca,
  email,
  id,
  created_at,
  email_confirmed_at
FROM auth.users
WHERE email ILIKE '%oliveira%';

-- 4. Buscar nos metadados
SELECT 
  '4. BUSCAR NOS METADADOS' as busca,
  email,
  id,
  raw_user_meta_data->>'seller_name' as seller_name,
  created_at
FROM auth.users
WHERE raw_user_meta_data->>'seller_name' ILIKE '%caio%';

-- 5. Listar TODOS os usuários criados recentemente
SELECT 
  '5. ULTIMOS 10 USUARIOS CRIADOS' as busca,
  email,
  id,
  created_at,
  EXTRACT(EPOCH FROM (NOW() - created_at))/60 as minutos_atras
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- 6. Verificar se vendedor Caio existe
SELECT 
  '6. VENDEDOR CAIO EXISTE?' as busca,
  name,
  email,
  id,
  company_id,
  active
FROM sellers
WHERE name ILIKE '%caio%';
