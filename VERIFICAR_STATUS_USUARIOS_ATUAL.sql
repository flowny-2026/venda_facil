-- ========================================
-- VERIFICAR STATUS ATUAL DOS USUÁRIOS
-- ========================================

-- 1. Verificar emails atuais dos usuários principais
SELECT 
  'USUARIOS PRINCIPAIS' as categoria,
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at
FROM auth.users 
WHERE email IN (
  'bete@empresa.com', 'bete@gmail.com',
  'maria@empresa.com', 'maria@gmail.com', 
  'lojatem@empresa.com', 'loja-tem@gmail.com', 'lojatem@gmail.com',
  'edicharlesbrito2009@hotmail.com'
)
ORDER BY email;

-- 2. Verificar vinculação à empresa lojatem
SELECT 
  'USUARIOS LOJATEM' as categoria,
  u.email,
  cu.role,
  cu.active,
  c.name as company_name,
  s.name as seller_name,
  cu.created_at
FROM company_users cu
JOIN auth.users u ON u.id = cu.user_id
JOIN companies c ON c.id = cu.company_id
LEFT JOIN sellers s ON s.id = cu.seller_id
WHERE c.name = 'lojatem'
ORDER BY cu.role, u.email;

-- 3. Verificar se há usuários duplicados (mesmo nome, emails diferentes)
SELECT 
  'DUPLICADOS POTENCIAIS' as categoria,
  CASE 
    WHEN email LIKE '%bete%' THEN 'BETE'
    WHEN email LIKE '%maria%' THEN 'MARIA'
    WHEN email LIKE '%lojatem%' OR email LIKE '%loja-tem%' THEN 'LOJATEM'
    ELSE 'OUTRO'
  END as usuario_tipo,
  email,
  id,
  created_at
FROM auth.users 
WHERE email LIKE '%bete%' 
   OR email LIKE '%maria%' 
   OR email LIKE '%lojatem%' 
   OR email LIKE '%loja-tem%'
ORDER BY usuario_tipo, created_at;

-- 4. Verificar produtos visíveis para Bete
SELECT 
  'PRODUTOS BETE' as categoria,
  p.id,
  p.name,
  p.price,
  p.company_id
FROM products p
WHERE p.company_id = (
  SELECT cu.company_id 
  FROM company_users cu
  JOIN auth.users u ON u.id = cu.user_id
  WHERE u.email IN ('bete@empresa.com', 'bete@gmail.com')
  LIMIT 1
);

-- 5. Verificar formas de pagamento visíveis para Maria
SELECT 
  'PAGAMENTOS MARIA' as categoria,
  pm.id,
  pm.name,
  pm.type,
  pm.company_id
FROM payment_methods pm
WHERE pm.company_id = (
  SELECT cu.company_id 
  FROM company_users cu
  JOIN auth.users u ON u.id = cu.user_id
  WHERE u.email IN ('maria@empresa.com', 'maria@gmail.com')
  LIMIT 1
);

-- 6. Verificar empresa lojatem
SELECT 
  'EMPRESA LOJATEM' as categoria,
  id,
  name,
  status,
  created_at,
  (SELECT COUNT(*) FROM company_users WHERE company_id = companies.id AND active = true) as usuarios_ativos
FROM companies 
WHERE name = 'lojatem';

-- 7. Verificar últimos logins
SELECT 
  'ULTIMOS LOGINS' as categoria,
  u.email,
  u.last_sign_in_at,
  CASE 
    WHEN u.last_sign_in_at IS NULL THEN 'Nunca fez login'
    WHEN u.last_sign_in_at > NOW() - INTERVAL '1 day' THEN 'Último dia'
    WHEN u.last_sign_in_at > NOW() - INTERVAL '7 days' THEN 'Última semana'
    ELSE 'Mais de uma semana'
  END as quando
FROM auth.users u
WHERE u.email IN (
  'bete@empresa.com', 'bete@gmail.com',
  'maria@empresa.com', 'maria@gmail.com', 
  'lojatem@empresa.com', 'loja-tem@gmail.com', 'lojatem@gmail.com',
  'edicharlesbrito2009@hotmail.com'
)
ORDER BY u.last_sign_in_at DESC NULLS LAST;