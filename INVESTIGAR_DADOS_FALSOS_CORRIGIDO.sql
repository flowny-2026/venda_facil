-- ========================================
-- INVESTIGAR DADOS FALSOS - CORRIGIDO
-- ========================================

-- 1. VERIFICAR VENDAS DA EMPRESA "LOJA LIZ BRITO"
SELECT 
  'VENDAS DA EMPRESA' as categoria,
  s.id,
  s.total_amount,
  s.created_at,
  s.seller_id,
  sel.name as seller_name,
  c.name as company_name
FROM sales s
LEFT JOIN sellers sel ON s.seller_id = sel.id
LEFT JOIN companies c ON sel.company_id = c.id
WHERE c.name ILIKE '%liz%' OR c.name ILIKE '%brito%'
ORDER BY s.created_at DESC;

-- 2. VERIFICAR SE HÁ VENDAS SEM SELLER_ID (PROBLEMA COMUM)
SELECT 
  'VENDAS SEM VENDEDOR' as categoria,
  s.id,
  s.total_amount,
  s.created_at,
  s.seller_id,
  s.company_id,
  c.name as company_name
FROM sales s
LEFT JOIN companies c ON s.company_id = c.id
WHERE s.seller_id IS NULL
AND (c.name ILIKE '%liz%' OR c.name ILIKE '%brito%')
ORDER BY s.created_at DESC;

-- 3. VERIFICAR IDs DOS VENDEDORES NICOLLY E AMANDA
SELECT 
  'IDS VENDEDORES' as categoria,
  s.id as seller_id,
  s.name,
  s.email,
  c.name as company_name
FROM sellers s
JOIN companies c ON s.company_id = c.id
WHERE (s.name ILIKE '%nicolly%' OR s.name ILIKE '%amanda%')
AND (c.name ILIKE '%liz%' OR c.name ILIKE '%brito%')
ORDER BY s.name;

-- 4. VERIFICAR DADOS SUSPEITOS (R$ 199,00)
SELECT 
  'DADOS SUSPEITOS R$ 199' as categoria,
  s.id,
  s.total_amount,
  s.created_at,
  s.seller_id,
  sel.name as seller_name,
  c.name as company_name,
  '🚨 VALOR SUSPEITO (R$ 199,00)' as alerta
FROM sales s
LEFT JOIN sellers sel ON s.seller_id = sel.id
LEFT JOIN companies c ON sel.company_id = c.id
WHERE s.total_amount = 199.00
ORDER BY s.created_at DESC;

-- 5. VERIFICAR TODAS AS VENDAS DO SISTEMA (ÚLTIMAS 10)
SELECT 
  'ULTIMAS VENDAS SISTEMA' as categoria,
  s.id,
  s.total_amount,
  s.created_at,
  s.seller_id,
  sel.name as seller_name,
  c.name as company_name
FROM sales s
LEFT JOIN sellers sel ON s.seller_id = sel.id
LEFT JOIN companies c ON sel.company_id = c.id
ORDER BY s.created_at DESC
LIMIT 10;

-- 6. CONTAR VENDAS POR EMPRESA
SELECT 
  'RESUMO POR EMPRESA' as categoria,
  c.name as empresa,
  COUNT(s.id) as total_vendas,
  SUM(s.total_amount) as valor_total,
  COUNT(DISTINCT s.seller_id) as vendedores_diferentes
FROM companies c
LEFT JOIN sellers sel ON sel.company_id = c.id
LEFT JOIN sales s ON s.seller_id = sel.id
GROUP BY c.id, c.name
HAVING COUNT(s.id) > 0
ORDER BY total_vendas DESC;