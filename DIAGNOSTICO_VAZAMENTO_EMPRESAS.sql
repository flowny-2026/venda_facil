-- ========================================
-- DIAGNÓSTICO VAZAMENTO ENTRE EMPRESAS
-- ========================================
-- PROBLEMA CRÍTICO: Empresas vendo dados de outras empresas

-- 1. VERIFICAR TODAS AS EMPRESAS
SELECT 
  'TODAS AS EMPRESAS' as categoria,
  id,
  name,
  email,
  access_type,
  status
FROM companies 
ORDER BY name;

-- 2. VERIFICAR EMPRESA DA VENDA R$ 199,00
SELECT 
  'EMPRESA DA VENDA 199' as categoria,
  c.id as company_id,
  c.name as company_name,
  c.email as company_email,
  c.access_type,
  s.total_amount,
  sel.name as seller_name,
  sel.email as seller_email
FROM sales s
JOIN sellers sel ON s.seller_id = sel.id
JOIN companies c ON sel.company_id = c.id
WHERE s.total_amount = 199.00;

-- 3. VERIFICAR EMPRESA DE NICOLLY E AMANDA
SELECT 
  'EMPRESA NICOLLY AMANDA' as categoria,
  c.id as company_id,
  c.name as company_name,
  c.email as company_email,
  c.access_type,
  s.name as seller_name,
  s.email as seller_email
FROM sellers s
JOIN companies c ON s.company_id = c.id
WHERE s.name ILIKE '%nicolly%' OR s.name ILIKE '%amanda%'
ORDER BY s.name;

-- 4. COMPARAR IDs DAS EMPRESAS
SELECT 
  'COMPARACAO EMPRESAS' as categoria,
  CASE 
    WHEN (
      SELECT c.id FROM sales s
      JOIN sellers sel ON s.seller_id = sel.id
      JOIN companies c ON sel.company_id = c.id
      WHERE s.total_amount = 199.00
      LIMIT 1
    ) = (
      SELECT c.id FROM sellers s
      JOIN companies c ON s.company_id = c.id
      WHERE s.name ILIKE '%nicolly%'
      LIMIT 1
    ) THEN '✅ MESMA EMPRESA (não há problema)'
    ELSE '🚨 EMPRESAS DIFERENTES - VAZAMENTO CRÍTICO!'
  END as resultado;

-- 5. VERIFICAR POLÍTICAS RLS DA TABELA SALES
SELECT 
  'POLITICAS RLS SALES' as categoria,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'sales'
ORDER BY policyname;