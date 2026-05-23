-- ========================================
-- DIAGNÓSTICO SIMPLES - VENDA R$ 199,00
-- ========================================

-- 1. QUEM FEZ A VENDA DE R$ 199,00?
SELECT 
  'QUEM FEZ A VENDA' as pergunta,
  s.id,
  s.total_amount,
  s.seller_id,
  sel.name as vendedor_nome,
  CASE 
    WHEN s.seller_id IS NULL THEN '🚨 VENDA SEM VENDEDOR (ÓRFÃ)'
    WHEN sel.name ILIKE '%nicolly%' THEN '🚨 VENDA DA NICOLLY'
    WHEN sel.name ILIKE '%amanda%' THEN '🚨 VENDA DA AMANDA'
    ELSE '✅ VENDA DE: ' || sel.name
  END as diagnostico
FROM sales s
LEFT JOIN sellers sel ON s.seller_id = sel.id
WHERE s.total_amount = 199.00;

-- 2. NICOLLY E AMANDA EXISTEM?
SELECT 
  'NICOLLY E AMANDA' as pergunta,
  name,
  id as seller_id,
  email
FROM sellers 
WHERE name ILIKE '%nicolly%' OR name ILIKE '%amanda%'
ORDER BY name;

-- 3. RESULTADO FINAL
SELECT 
  'DIAGNOSTICO FINAL' as categoria,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM sales s 
      WHERE s.total_amount = 199.00 AND s.seller_id IS NULL
    ) THEN '🚨 PROBLEMA: VENDA ÓRFÃ (sem vendedor) - APARECE PARA TODOS'
    
    WHEN EXISTS (
      SELECT 1 FROM sales s 
      JOIN sellers sel ON s.seller_id = sel.id
      WHERE s.total_amount = 199.00 
      AND (sel.name ILIKE '%nicolly%' OR sel.name ILIKE '%amanda%')
    ) THEN '✅ VENDA LEGÍTIMA DE NICOLLY OU AMANDA'
    
    ELSE '⚠️ VENDA DE OUTRO VENDEDOR - PROBLEMA DE RLS'
  END as resultado;