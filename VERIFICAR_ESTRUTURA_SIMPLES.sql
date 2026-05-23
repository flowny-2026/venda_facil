-- ========================================
-- VERIFICAR ESTRUTURA SIMPLES - SEM EMOJIS
-- ========================================

-- 1. QUANTAS EMPRESAS EXISTEM?
SELECT 
  'TOTAL EMPRESAS' as categoria,
  COUNT(*) as total
FROM companies;

-- 2. LISTAR TODAS AS EMPRESAS
SELECT 
  'TODAS EMPRESAS' as categoria,
  id,
  name,
  email,
  access_type,
  status
FROM companies
ORDER BY name;

-- 3. DETALHES DA EMPRESA e7f97d10-4c56-431b-a458-a4dbe026f0de
SELECT 
  'EMPRESA ESPECIFICA' as categoria,
  id,
  name,
  email,
  access_type,
  status
FROM companies 
WHERE id = 'e7f97d10-4c56-431b-a458-a4dbe026f0de';

-- 4. USUÁRIOS DA EMPRESA
SELECT 
  'USUARIOS' as categoria,
  u.email,
  cu.role,
  s.name as seller_name
FROM company_users cu
JOIN auth.users u ON cu.user_id = u.id
LEFT JOIN sellers s ON cu.seller_id = s.id
WHERE cu.company_id = 'e7f97d10-4c56-431b-a458-a4dbe026f0de'
ORDER BY cu.role, u.email;

-- 5. VENDEDORES DA EMPRESA
SELECT 
  'VENDEDORES' as categoria,
  id,
  name,
  email
FROM sellers 
WHERE company_id = 'e7f97d10-4c56-431b-a458-a4dbe026f0de'
ORDER BY name;

-- 6. VENDAS DA EMPRESA
SELECT 
  'VENDAS' as categoria,
  s.id,
  s.total_amount,
  s.created_at,
  sel.name as vendedor
FROM sales s
LEFT JOIN sellers sel ON s.seller_id = sel.id
WHERE s.company_id = 'e7f97d10-4c56-431b-a458-a4dbe026f0de'
ORDER BY s.created_at DESC;