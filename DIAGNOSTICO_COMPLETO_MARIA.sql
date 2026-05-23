-- ========================================
-- DIAGNÓSTICO COMPLETO: Maria vs Bete
-- ========================================

-- 1. Ver Maria na tabela SELLERS
SELECT 
    'SELLERS' as tabela,
    id,
    name,
    email,
    company_id,
    active
FROM sellers
WHERE email = 'maria@empresa.com';

-- 2. Ver Maria na tabela COMPANY_USERS (onde RLS busca!)
SELECT 
    'COMPANY_USERS' as tabela,
    cu.user_id,
    u.email,
    cu.company_id,
    cu.role,
    cu.active,
    cu.seller_id
FROM company_users cu
JOIN auth.users u ON u.id = cu.user_id
WHERE u.email = 'maria@empresa.com';

-- 3. Ver Bete na tabela COMPANY_USERS (para comparar)
SELECT 
    'COMPANY_USERS' as tabela,
    cu.user_id,
    u.email,
    cu.company_id,
    cu.role,
    cu.active,
    cu.seller_id
FROM company_users cu
JOIN auth.users u ON u.id = cu.user_id
WHERE u.email = 'bete@empresa.com';

-- 4. Ver qual empresa tem produtos cadastrados
SELECT 
    c.id as company_id,
    c.name as company_name,
    COUNT(p.id) as total_produtos,
    COUNT(pm.id) as total_formas_pagamento
FROM companies c
LEFT JOIN products p ON p.company_id = c.id
LEFT JOIN payment_methods pm ON pm.company_id = c.id
WHERE c.id IN (
    '56c5edd2-e7bf-4e45-80cd-5e2880d35193',
    'f3063d74-fa10-4cf7-9324-c7f67f66b307'
)
GROUP BY c.id, c.name;

-- ========================================
-- ANÁLISE:
-- ========================================
-- Se Maria aparecer em SELLERS mas NÃO em COMPANY_USERS:
--   → Maria não está vinculada! Precisa executar o INSERT
--
-- Se Maria aparecer em COMPANY_USERS com company_id diferente da Bete:
--   → Maria está em outra empresa! Precisa corrigir o company_id
--
-- Se os produtos estão na empresa f3063d74-... mas Maria está em 56c5edd2-...:
--   → Maria está na empresa errada! Precisa corrigir

-- ========================================
-- SOLUÇÃO 1: Se Maria NÃO está em COMPANY_USERS
-- ========================================

/*
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
    u.id as user_id,
    s.company_id,
    s.id as seller_id,
    'seller' as role,
    true as active,
    true as can_access_pdv,
    false as can_view_reports,
    false as can_manage_products,
    false as can_manage_sellers
FROM auth.users u
CROSS JOIN sellers s
WHERE u.email = 'maria@empresa.com'
AND s.email = 'maria@empresa.com'
AND NOT EXISTS (
    SELECT 1 FROM company_users cu 
    WHERE cu.user_id = u.id
);
*/

-- ========================================
-- SOLUÇÃO 2: Se Maria está em COMPANY_USERS mas empresa errada
-- ========================================

/*
-- Primeiro, descubra qual é a empresa CORRETA (onde estão os produtos)
-- Depois, atualize o company_id de Maria:

UPDATE company_users
SET company_id = 'f3063d74-fa10-4cf7-9324-c7f67f66b307'  -- Empresa correta
WHERE user_id = (
    SELECT id FROM auth.users WHERE email = 'maria@empresa.com'
);

-- Também atualizar na tabela sellers:
UPDATE sellers
SET company_id = 'f3063d74-fa10-4cf7-9324-c7f67f66b307'  -- Empresa correta
WHERE email = 'maria@empresa.com';
*/
