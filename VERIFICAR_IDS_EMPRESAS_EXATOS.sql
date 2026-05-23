-- ========================================
-- VERIFICAR IDs EXATOS DAS EMPRESAS
-- ========================================

-- 1. EMPRESA DE NICOLLY (ID EXATO)
SELECT 
  'NICOLLY COMPANY' as categoria,
  c.id as company_id,
  c.name as company_name,
  c.access_type
FROM sellers s
JOIN companies c ON s.company_id = c.id
WHERE s.name ILIKE '%nicolly%';

-- 2. EMPRESA DA VENDA R$ 199 (ID EXATO)
SELECT 
  'VENDA 199 COMPANY' as categoria,
  c.id as company_id,
  c.name as company_name,
  c.access_type
FROM sales sa
JOIN companies c ON sa.company_id = c.id
WHERE sa.total_amount = 199.00;

-- 3. COMPARAR IDs
SELECT 
  'COMPARACAO IDS' as categoria,
  (SELECT c.id FROM sellers s
   JOIN companies c ON s.company_id = c.id
   WHERE s.name ILIKE '%nicolly%' LIMIT 1) as nicolly_company_id,
  (SELECT c.id FROM sales sa
   JOIN companies c ON sa.company_id = c.id
   WHERE sa.total_amount = 199.00 LIMIT 1) as venda_company_id,
  CASE 
    WHEN (SELECT c.id FROM sellers s
          JOIN companies c ON s.company_id = c.id
          WHERE s.name ILIKE '%nicolly%' LIMIT 1) = 
         (SELECT c.id FROM sales sa
          JOIN companies c ON sa.company_id = c.id
          WHERE sa.total_amount = 199.00 LIMIT 1)
    THEN 'MESMO ID - Mesma empresa'
    ELSE 'IDS DIFERENTES - Empresas diferentes'
  END as resultado;

-- 4. TODAS AS EMPRESAS
SELECT 
  'TODAS EMPRESAS' as categoria,
  id,
  name,
  access_type,
  created_at
FROM companies
ORDER BY created_at;