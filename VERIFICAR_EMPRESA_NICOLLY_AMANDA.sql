-- ========================================
-- VERIFICAR EMPRESA DE NICOLLY E AMANDA
-- ========================================

-- 1. TODAS AS EMPRESAS DO SISTEMA
SELECT 
  'TODAS EMPRESAS' as categoria,
  id,
  name,
  email,
  access_type
FROM companies
ORDER BY created_at;

-- 2. EMPRESA DE NICOLLY
SELECT 
  'EMPRESA NICOLLY' as categoria,
  c.id as company_id,
  c.name as company_name,
  c.email as company_email,
  c.access_type,
  s.name as seller_name,
  u.email as user_email
FROM sellers s
JOIN companies c ON s.company_id = c.id
LEFT JOIN company_users cu ON cu.seller_id = s.id
LEFT JOIN auth.users u ON cu.user_id = u.id
WHERE s.name ILIKE '%nicolly%';

-- 3. EMPRESA DE AMANDA
SELECT 
  'EMPRESA AMANDA' as categoria,
  c.id as company_id,
  c.name as company_name,
  c.email as company_email,
  c.access_type,
  s.name as seller_name,
  u.email as user_email
FROM sellers s
JOIN companies c ON s.company_id = c.id
LEFT JOIN company_users cu ON cu.seller_id = s.id
LEFT JOIN auth.users u ON cu.user_id = u.id
WHERE s.name ILIKE '%amanda%';

-- 4. EMPRESA DA VENDA R$ 199,00
SELECT 
  'EMPRESA VENDA 199' as categoria,
  c.id as company_id,
  c.name as company_name,
  c.email as company_email,
  c.access_type,
  sel.name as seller_name
FROM sales s
JOIN companies c ON s.company_id = c.id
LEFT JOIN sellers sel ON s.seller_id = sel.id
WHERE s.total_amount = 199.00;

-- 5. COMPARAÇÃO FINAL
SELECT 
  'DIAGNOSTICO' as categoria,
  (SELECT c.name FROM sellers s
   JOIN companies c ON s.company_id = c.id
   WHERE s.name ILIKE '%nicolly%' LIMIT 1) as empresa_nicolly,
  (SELECT c.name FROM sales sa
   JOIN companies c ON sa.company_id = c.id
   WHERE sa.total_amount = 199.00 LIMIT 1) as empresa_venda_199,
  CASE 
    WHEN (SELECT c.id FROM sellers s
          JOIN companies c ON s.company_id = c.id
          WHERE s.name ILIKE '%nicolly%' LIMIT 1) = 
         (SELECT c.id FROM sales sa
          JOIN companies c ON sa.company_id = c.id
          WHERE sa.total_amount = 199.00 LIMIT 1)
    THEN 'MESMA EMPRESA - Nicolly foi cadastrada na empresa errada!'
    ELSE 'EMPRESAS DIFERENTES - Problema de RLS'
  END as resultado;