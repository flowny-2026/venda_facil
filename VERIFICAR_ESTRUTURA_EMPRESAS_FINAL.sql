-- ========================================
-- VERIFICAR ESTRUTURA FINAL DAS EMPRESAS
-- ========================================

-- 1. QUANTAS EMPRESAS EXISTEM?
SELECT 
  'TOTAL EMPRESAS' as categoria,
  COUNT(*) as total,
  STRING_AGG(name, ', ') as nomes
FROM companies;

-- 2. DETALHES DA EMPRESA e7f97d10-4c56-431b-a458-a4dbe026f0de
SELECT 
  'EMPRESA UNICA' as categoria,
  id,
  name,
  email,
  access_type,
  status
FROM companies 
WHERE id = 'e7f97d10-4c56-431b-a458-a4dbe026f0de';

-- 3. TODOS OS USUÁRIOS DESSA EMPRESA
SELECT 
  'USUARIOS DA EMPRESA' as categoria,
  u.email,
  cu.role,
  cu.seller_id,
  s.name as seller_name,
  CASE 
    WHEN cu.role = 'manager' THEN '👔 GERENTE'
    WHEN cu.role = 'seller' THEN '🛒 VENDEDOR'
    ELSE cu.role
  END as tipo
FROM company_users cu
JOIN auth.users u ON cu.user_id = u.id
LEFT JOIN sellers s ON cu.seller_id = s.id
WHERE cu.company_id = 'e7f97d10-4c56-431b-a458-a4dbe026f0de'
ORDER BY cu.role, u.email;

-- 4. VENDEDORES DA EMPRESA
SELECT 
  'VENDEDORES' as categoria,
  id,
  name,
  email
FROM sellers 
WHERE company_id = 'e7f97d10-4c56-431b-a458-a4dbe026f0de'
ORDER BY name;

-- 5. VENDAS DA EMPRESA
SELECT 
  'VENDAS DA EMPRESA' as categoria,
  s.id,
  s.total_amount,
  s.created_at,
  sel.name as vendedor,
  u.email as usuario_login
FROM sales s
LEFT JOIN sellers sel ON s.seller_id = sel.id
LEFT JOIN company_users cu ON cu.seller_id = sel.id
LEFT JOIN auth.users u ON cu.user_id = u.id
WHERE s.company_id = 'e7f97d10-4c56-431b-a458-a4dbe026f0de'
ORDER BY s.created_at DESC;