-- VERIFICAR USUÁRIOS ATIVOS NO SISTEMA
-- Execute este script para ver todos os usuários e suas empresas

-- 1. Usuários na tabela auth.users
SELECT 
  'AUTH USERS' as tabela,
  id,
  email,
  created_at,
  email_confirmed_at,
  last_sign_in_at
FROM auth.users 
ORDER BY last_sign_in_at DESC NULLS LAST;

-- 2. Usuários vinculados a empresas
SELECT 
  'COMPANY USERS' as tabela,
  cu.user_id,
  au.email,
  cu.role,
  cu.active,
  c.name as company_name,
  cu.created_at
FROM company_users cu
JOIN auth.users au ON cu.user_id = au.id
JOIN companies c ON cu.company_id = c.id
WHERE cu.active = true
ORDER BY cu.created_at DESC;

-- 3. Usuários da empresa lojatem especificamente
SELECT 
  'LOJATEM USERS' as tabela,
  cu.user_id,
  au.email,
  cu.role,
  cu.active,
  s.name as seller_name,
  cu.created_at
FROM company_users cu
JOIN auth.users au ON cu.user_id = au.id
JOIN companies c ON cu.company_id = c.id
LEFT JOIN sellers s ON cu.seller_id = s.id
WHERE c.name = 'lojatem' 
  AND cu.active = true
ORDER BY cu.role, cu.created_at;

-- 4. Verificar se há usuários duplicados (mesmo email)
SELECT 
  'EMAILS DUPLICADOS' as tabela,
  email,
  COUNT(*) as quantidade,
  STRING_AGG(id::text, ', ') as user_ids
FROM auth.users 
GROUP BY email 
HAVING COUNT(*) > 1;

-- 5. Últimos logins por empresa
SELECT 
  'ULTIMOS LOGINS' as tabela,
  c.name as company_name,
  au.email,
  cu.role,
  au.last_sign_in_at,
  EXTRACT(EPOCH FROM (NOW() - au.last_sign_in_at))/3600 as horas_desde_ultimo_login
FROM company_users cu
JOIN auth.users au ON cu.user_id = au.id
JOIN companies c ON cu.company_id = c.id
WHERE cu.active = true
  AND au.last_sign_in_at IS NOT NULL
ORDER BY au.last_sign_in_at DESC;