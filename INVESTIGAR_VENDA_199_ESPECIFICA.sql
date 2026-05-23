-- ========================================
-- INVESTIGAR VENDA R$ 199,00 ESPECÍFICA
-- ========================================

-- 1. DETALHES COMPLETOS DA VENDA DE R$ 199,00
SELECT 
  'DETALHES VENDA 199' as categoria,
  s.id as sale_id,
  s.total_amount,
  s.created_at,
  s.seller_id,
  s.company_id,
  sel.name as seller_name,
  sel.email as seller_email,
  c.name as company_name,
  cu.user_id as seller_user_id,
  u.email as seller_login_email
FROM sales s
LEFT JOIN sellers sel ON s.seller_id = sel.id
LEFT JOIN companies c ON s.company_id = c.id
LEFT JOIN company_users cu ON cu.seller_id = sel.id
LEFT JOIN auth.users u ON cu.user_id = u.id
WHERE s.total_amount = 199.00
ORDER BY s.created_at DESC;

-- 2. VERIFICAR IDs DOS VENDEDORES NICOLLY E AMANDA
SELECT 
  'VENDEDORES NICOLLY AMANDA' as categoria,
  s.id as seller_id,
  s.name as seller_name,
  s.email as seller_email,
  cu.user_id,
  u.email as login_email,
  c.name as company_name
FROM sellers s
JOIN companies c ON s.company_id = c.id
LEFT JOIN company_users cu ON cu.seller_id = s.id
LEFT JOIN auth.users u ON cu.user_id = u.id
WHERE (s.name ILIKE '%nicolly%' OR s.name ILIKE '%amanda%')
AND c.name ILIKE '%liz%'
ORDER BY s.name;

-- 3. VERIFICAR SE A VENDA ESTÁ VINCULADA A NICOLLY OU AMANDA
SELECT 
  'VINCULACAO VENDA' as categoria,
  s.id as sale_id,
  s.total_amount,
  s.seller_id,
  sel.name as seller_da_venda,
  CASE 
    WHEN sel.name ILIKE '%nicolly%' THEN '🚨 VENDA DA NICOLLY'
    WHEN sel.name ILIKE '%amanda%' THEN '🚨 VENDA DA AMANDA'
    WHEN s.seller_id IS NULL THEN '⚠️ VENDA SEM VENDEDOR'
    ELSE '✅ VENDA DE OUTRO VENDEDOR'
  END as diagnostico
FROM sales s
LEFT JOIN sellers sel ON s.seller_id = sel.id
WHERE s.total_amount = 199.00;

-- 4. VERIFICAR POLÍTICAS RLS - SIMULAR ACESSO DOS VENDEDORES
-- (Isso vai mostrar se o problema é de RLS)
SELECT 
  'TESTE RLS' as categoria,
  'Verificando se RLS está permitindo acesso incorreto' as descricao;

-- 5. VERIFICAR SE HÁ VENDAS ÓRFÃS (sem seller_id)
SELECT 
  'VENDAS ORFAS' as categoria,
  s.id,
  s.total_amount,
  s.created_at,
  s.seller_id,
  s.company_id,
  c.name as company_name,
  '⚠️ VENDA SEM VENDEDOR - PODE APARECER PARA TODOS' as problema
FROM sales s
LEFT JOIN companies c ON s.company_id = c.id
WHERE s.seller_id IS NULL
AND s.total_amount = 199.00;