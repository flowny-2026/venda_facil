-- ========================================
-- DIAGNOSTICAR LOGIN DE VENDEDORES
-- ========================================
-- Vamos verificar se os logins dos vendedores foram criados corretamente

-- 1. VERIFICAR USUÁRIOS CRIADOS RECENTEMENTE
SELECT 
  'USUARIOS RECENTES' as categoria,
  id,
  email,
  created_at,
  email_confirmed_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN '✅ EMAIL CONFIRMADO'
    ELSE '❌ EMAIL NÃO CONFIRMADO'
  END as status_email
FROM auth.users 
WHERE created_at > NOW() - INTERVAL '1 day'
ORDER BY created_at DESC;

-- 2. VERIFICAR COMPANY_USERS COM SELLER_ID
SELECT 
  'VENDEDORES COM LOGIN' as categoria,
  cu.user_id,
  cu.seller_id,
  cu.role,
  cu.active,
  u.email,
  s.name as seller_name,
  c.name as company_name
FROM company_users cu
JOIN auth.users u ON cu.user_id = u.id
LEFT JOIN sellers s ON cu.seller_id = s.id
LEFT JOIN companies c ON cu.company_id = c.id
WHERE cu.seller_id IS NOT NULL
ORDER BY cu.created_at DESC;

-- 3. VERIFICAR VENDEDORES SEM LOGIN
SELECT 
  'VENDEDORES SEM LOGIN' as categoria,
  s.id,
  s.name,
  s.email,
  c.name as company_name,
  c.access_type
FROM sellers s
JOIN companies c ON s.company_id = c.id
WHERE s.id NOT IN (
  SELECT seller_id 
  FROM company_users 
  WHERE seller_id IS NOT NULL
)
AND c.access_type = 'individual'
ORDER BY s.created_at DESC;

-- 4. VERIFICAR EMPRESAS COM ACESSO INDIVIDUAL
SELECT 
  'EMPRESAS INDIVIDUAIS' as categoria,
  id,
  name,
  email,
  access_type,
  status
FROM companies 
WHERE access_type = 'individual'
ORDER BY created_at DESC;

-- 5. VERIFICAR POSSÍVEIS PROBLEMAS
SELECT 
  'PROBLEMAS POTENCIAIS' as categoria,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM auth.users 
      WHERE created_at > NOW() - INTERVAL '1 day' 
      AND email_confirmed_at IS NULL
    ) THEN '⚠️ Há usuários com email não confirmado'
    ELSE '✅ Todos os emails estão confirmados'
  END as problema_email,
  
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM company_users 
      WHERE seller_id IS NOT NULL 
      AND active = FALSE
    ) THEN '⚠️ Há vendedores com login inativo'
    ELSE '✅ Todos os vendedores estão ativos'
  END as problema_ativo;