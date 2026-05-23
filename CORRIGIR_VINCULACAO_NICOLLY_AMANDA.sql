-- ========================================
-- CORRIGIR VINCULAÇÃO NICOLLY E AMANDA
-- ========================================
-- Os usuários existem mas não estão vinculados à empresa

-- 1. BUSCAR IDs NECESSÁRIOS
WITH dados_empresa AS (
  SELECT id as company_id 
  FROM companies 
  WHERE name ILIKE '%liz%' OR name ILIKE '%brito%'
  LIMIT 1
),
dados_usuarios AS (
  SELECT 
    id as user_id,
    email
  FROM auth.users 
  WHERE email IN ('nicolly@empresa.com', 'amanda@empresa.com')
),
dados_vendedores AS (
  SELECT 
    s.id as seller_id,
    s.name,
    s.email
  FROM sellers s
  JOIN dados_empresa de ON s.company_id = de.company_id
  WHERE s.name ILIKE '%nicolly%' OR s.name ILIKE '%amanda%'
)
-- 2. MOSTRAR DADOS ANTES DA CORREÇÃO
SELECT 
  'DADOS PARA VINCULACAO' as categoria,
  de.company_id,
  du.user_id,
  du.email as user_email,
  dv.seller_id,
  dv.name as seller_name
FROM dados_empresa de
CROSS JOIN dados_usuarios du
LEFT JOIN dados_vendedores dv ON (
  (du.email = 'nicolly@empresa.com' AND dv.name ILIKE '%nicolly%') OR
  (du.email = 'amanda@empresa.com' AND dv.name ILIKE '%amanda%')
);

-- 3. FAZER A VINCULAÇÃO
WITH dados_empresa AS (
  SELECT id as company_id 
  FROM companies 
  WHERE name ILIKE '%liz%' OR name ILIKE '%brito%'
  LIMIT 1
),
dados_usuarios AS (
  SELECT 
    id as user_id,
    email
  FROM auth.users 
  WHERE email IN ('nicolly@empresa.com', 'amanda@empresa.com')
),
dados_vendedores AS (
  SELECT 
    s.id as seller_id,
    s.name,
    s.email
  FROM sellers s
  JOIN dados_empresa de ON s.company_id = de.company_id
  WHERE s.name ILIKE '%nicolly%' OR s.name ILIKE '%amanda%'
)
INSERT INTO company_users (
  user_id,
  company_id,
  seller_id,
  role,
  active,
  can_access_pdv,
  can_view_reports,
  can_manage_products,
  can_manage_sellers
)
SELECT 
  du.user_id,
  de.company_id,
  dv.seller_id,
  'seller' as role,
  TRUE as active,
  TRUE as can_access_pdv,
  FALSE as can_view_reports,
  FALSE as can_manage_products,
  FALSE as can_manage_sellers
FROM dados_empresa de
CROSS JOIN dados_usuarios du
LEFT JOIN dados_vendedores dv ON (
  (du.email = 'nicolly@empresa.com' AND dv.name ILIKE '%nicolly%') OR
  (du.email = 'amanda@empresa.com' AND dv.name ILIKE '%amanda%')
)
ON CONFLICT (user_id, company_id) DO UPDATE SET
  seller_id = EXCLUDED.seller_id,
  active = TRUE,
  can_access_pdv = TRUE;

-- 4. VERIFICAR SE A CORREÇÃO FUNCIONOU
SELECT 
  'VERIFICACAO FINAL' as categoria,
  u.email,
  cu.company_id,
  cu.seller_id,
  cu.role,
  cu.active,
  cu.can_access_pdv,
  s.name as seller_name,
  c.name as company_name
FROM auth.users u
JOIN company_users cu ON cu.user_id = u.id
JOIN companies c ON cu.company_id = c.id
LEFT JOIN sellers s ON cu.seller_id = s.id
WHERE u.email IN ('nicolly@empresa.com', 'amanda@empresa.com')
ORDER BY u.email;