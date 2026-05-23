-- ========================================
-- CORRIGIR PERMISSÕES DE SARAH
-- ========================================

-- 1. CORRIGIR PERMISSÕES
UPDATE company_users
SET 
  can_view_reports = FALSE,
  can_manage_products = FALSE,
  can_manage_sellers = FALSE,
  can_access_pdv = TRUE
WHERE user_id = (SELECT id FROM auth.users WHERE email LIKE '%sarah%')
AND role = 'seller';

-- 2. VERIFICAR CORREÇÃO
SELECT 
  'PERMISSOES CORRIGIDAS' as categoria,
  u.email,
  cu.role,
  cu.can_access_pdv,
  cu.can_view_reports,
  cu.can_manage_products,
  cu.can_manage_sellers,
  CASE 
    WHEN cu.role = 'seller' 
         AND cu.can_access_pdv = TRUE
         AND cu.can_view_reports = FALSE 
         AND cu.can_manage_products = FALSE 
         AND cu.can_manage_sellers = FALSE 
    THEN '✅ PERMISSOES CORRETAS'
    ELSE '❌ AINDA INCORRETAS'
  END as status
FROM auth.users u
JOIN company_users cu ON cu.user_id = u.id
WHERE u.email LIKE '%sarah%';

-- 3. CORRIGIR TAMBÉM NICOLLY E AMANDA (se necessário)
UPDATE company_users
SET 
  can_view_reports = FALSE,
  can_manage_products = FALSE,
  can_manage_sellers = FALSE,
  can_access_pdv = TRUE
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('nicolly@empresa.com', 'amanda@empresa.com')
)
AND role = 'seller';

-- 4. VERIFICAR TODAS AS VENDEDORAS
SELECT 
  'TODAS VENDEDORAS' as categoria,
  u.email,
  cu.role,
  cu.can_access_pdv as pdv,
  cu.can_view_reports as relatorios,
  cu.can_manage_products as produtos,
  cu.can_manage_sellers as vendedores,
  CASE 
    WHEN cu.can_view_reports = FALSE 
         AND cu.can_manage_products = FALSE 
         AND cu.can_manage_sellers = FALSE 
    THEN '✅ OK'
    ELSE '❌ ERRO'
  END as status
FROM auth.users u
JOIN company_users cu ON cu.user_id = u.id
WHERE u.email IN ('sarah@empresa.com', 'nicolly@empresa.com', 'amanda@empresa.com')
ORDER BY u.email;