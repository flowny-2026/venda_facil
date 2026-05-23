-- ========================================
-- VERIFICAR VENDAS DA AMANDA
-- ========================================

-- PASSO 1: Encontrar o ID da vendedora Amanda
SELECT 
    id,
    name,
    email,
    commission_percentage,
    active,
    company_id
FROM sellers
WHERE name ILIKE '%amanda%'
ORDER BY name;

-- PASSO 2: Ver todas as vendas da Amanda (substitua o ID)
SELECT 
    s.id,
    s.created_at,
    s.total_amount,
    s.seller_id,
    sel.name as seller_name,
    s.status,
    s.payment_received,
    s.change_amount
FROM sales s
JOIN sellers sel ON sel.id = s.seller_id
WHERE sel.name ILIKE '%amanda%'
ORDER BY s.created_at DESC;

-- PASSO 3: Contar vendas de hoje da Amanda
SELECT 
    COUNT(*) as vendas_hoje,
    SUM(s.total_amount) as total_hoje,
    AVG(s.total_amount) as ticket_medio_hoje
FROM sales s
JOIN sellers sel ON sel.id = s.seller_id
WHERE sel.name ILIKE '%amanda%'
AND s.created_at >= CURRENT_DATE
AND s.created_at < CURRENT_DATE + INTERVAL '1 day';

-- PASSO 4: Contar vendas do mês da Amanda
SELECT 
    COUNT(*) as vendas_mes,
    SUM(s.total_amount) as total_mes,
    AVG(s.total_amount) as ticket_medio_mes
FROM sales s
JOIN sellers sel ON sel.id = s.seller_id
WHERE sel.name ILIKE '%amanda%'
AND s.created_at >= DATE_TRUNC('month', CURRENT_DATE)
AND s.created_at < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month';

-- PASSO 5: Ver itens das vendas da Amanda
SELECT 
    s.id as sale_id,
    s.created_at,
    s.total_amount,
    si.product_name,
    si.quantity,
    si.unit_price,
    si.total_price
FROM sales s
JOIN sellers sel ON sel.id = s.seller_id
LEFT JOIN sale_items si ON si.sale_id = s.id
WHERE sel.name ILIKE '%amanda%'
ORDER BY s.created_at DESC, si.id;

-- PASSO 6: Verificar se há problema na coluna items_count
SELECT 
    s.id,
    s.created_at,
    s.total_amount,
    s.items_count,  -- Esta coluna pode não existir
    COUNT(si.id) as itens_reais
FROM sales s
JOIN sellers sel ON sel.id = s.seller_id
LEFT JOIN sale_items si ON si.sale_id = s.id
WHERE sel.name ILIKE '%amanda%'
GROUP BY s.id, s.created_at, s.total_amount, s.items_count
ORDER BY s.created_at DESC;

-- ========================================
-- POSSÍVEIS PROBLEMAS
-- ========================================

-- 1. Vendas não estão sendo salvas com seller_id correto
-- 2. Coluna items_count não existe na tabela sales
-- 3. Vendas estão sendo salvas com data/hora incorreta
-- 4. Problema de timezone (UTC vs local)
-- 5. Vendas estão sendo salvas em outra empresa (company_id diferente)

-- ========================================
-- VERIFICAR ESTRUTURA DA TABELA SALES
-- ========================================

SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'sales'
ORDER BY ordinal_position;