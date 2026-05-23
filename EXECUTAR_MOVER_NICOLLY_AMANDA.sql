-- ========================================
-- MOVER NICOLLY E AMANDA PARA EMPRESA CORRETA
-- ========================================
-- Empresa correta: loja liz brito (5d9fc6d3-22ca-46c8-b0e9-6d06e33dd4e4)

-- 1. VERIFICAR ESTADO ANTES
SELECT 
  'ANTES - NICOLLY' as categoria,
  u.email,
  cu.company_id,
  c.name as company_name,
  s.name as seller_name
FROM auth.users u
JOIN company_users cu ON cu.user_id = u.id
JOIN companies c ON cu.company_id = c.id
LEFT JOIN sellers s ON cu.seller_id = s.id
WHERE u.email = 'nicolly@empresa.com';

SELECT 
  'ANTES - AMANDA' as categoria,
  u.email,
  cu.company_id,
  c.name as company_name,
  s.name as seller_name
FROM auth.users u
JOIN company_users cu ON cu.user_id = u.id
JOIN companies c ON cu.company_id = c.id
LEFT JOIN sellers s ON cu.seller_id = s.id
WHERE u.email = 'amanda@empresa.com';

-- 2. MOVER COMPANY_USERS (vinculação de usuários)
UPDATE company_users 
SET company_id = '5d9fc6d3-22ca-46c8-b0e9-6d06e33dd4e4'
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('nicolly@empresa.com', 'amanda@empresa.com')
);

-- 3. MOVER SELLERS (vendedores)
UPDATE sellers
SET company_id = '5d9fc6d3-22ca-46c8-b0e9-6d06e33dd4e4'
WHERE name ILIKE '%nicolly%' OR name ILIKE '%amanda%';

-- 4. VERIFICAR ESTADO DEPOIS
SELECT 
  'DEPOIS - NICOLLY' as categoria,
  u.email,
  cu.company_id,
  c.name as company_name,
  c.access_type,
  s.name as seller_name
FROM auth.users u
JOIN company_users cu ON cu.user_id = u.id
JOIN companies c ON cu.company_id = c.id
LEFT JOIN sellers s ON cu.seller_id = s.id
WHERE u.email = 'nicolly@empresa.com';

SELECT 
  'DEPOIS - AMANDA' as categoria,
  u.email,
  cu.company_id,
  c.name as company_name,
  c.access_type,
  s.name as seller_name
FROM auth.users u
JOIN company_users cu ON cu.user_id = u.id
JOIN companies c ON cu.company_id = c.id
LEFT JOIN sellers s ON cu.seller_id = s.id
WHERE u.email = 'amanda@empresa.com';

-- 5. RESULTADO FINAL
SELECT 
  'RESULTADO' as categoria,
  '✅ Nicolly e Amanda movidas para "loja liz brito" (acesso individual)' as mensagem;