-- ========================================
-- CORRIGIR SELLER_ID DE AMANDA E NICOLLY
-- ========================================

-- 1. VERIFICAR ESTADO ATUAL
SELECT 
  'ESTADO ATUAL' as categoria,
  u.email,
  cu.seller_id,
  s.name as seller_name,
  CASE 
    WHEN cu.seller_id IS NOT NULL THEN '✅ TEM SELLER_ID'
    ELSE '❌ SEM SELLER_ID'
  END as status
FROM auth.users u
JOIN company_users cu ON cu.user_id = u.id
LEFT JOIN sellers s ON cu.seller_id = s.id
WHERE u.email IN ('amanda@empresa.com', 'nicolly@empresa.com', 'sarah@empresa.com')
ORDER BY u.email;

-- 2. ATUALIZAR AMANDA
UPDATE company_users
SET seller_id = (
  SELECT id FROM sellers 
  WHERE name ILIKE '%amanda%' 
  AND company_id = '5d9fc6d3-22ca-46c8-b0e9-6d06e33dd4e4'
  LIMIT 1
)
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'amanda@empresa.com')
AND company_id = '5d9fc6d3-22ca-46c8-b0e9-6d06e33dd4e4';

-- 3. ATUALIZAR NICOLLY
UPDATE company_users
SET seller_id = (
  SELECT id FROM sellers 
  WHERE name ILIKE '%nicolly%' 
  AND company_id = '5d9fc6d3-22ca-46c8-b0e9-6d06e33dd4e4'
  LIMIT 1
)
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'nicolly@empresa.com')
AND company_id = '5d9fc6d3-22ca-46c8-b0e9-6d06e33dd4e4';

-- 4. VERIFICAR CORREÇÃO
SELECT 
  'DEPOIS DA CORRECAO' as categoria,
  u.email,
  cu.seller_id,
  s.name as seller_name,
  CASE 
    WHEN cu.seller_id IS NOT NULL THEN '✅ CORRIGIDO'
    ELSE '❌ AINDA SEM SELLER_ID'
  END as status
FROM auth.users u
JOIN company_users cu ON cu.user_id = u.id
LEFT JOIN sellers s ON cu.seller_id = s.id
WHERE u.email IN ('amanda@empresa.com', 'nicolly@empresa.com', 'sarah@empresa.com')
ORDER BY u.email;