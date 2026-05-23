-- ========================================
-- CORREÇÃO DEFINITIVA: Vincular Maria à Empresa
-- ========================================
-- Empresa: lojatem (56c5edd2-e7bf-4e45-80cd-5e2880d35193)
-- Produtos: 6
-- Formas de Pagamento: 6

-- ========================================
-- PASSO 1: Verificar situação atual
-- ========================================

-- Ver se Maria está em company_users
SELECT 
    'ANTES DA CORREÇÃO' as status,
    u.email,
    cu.company_id,
    cu.role,
    cu.active
FROM auth.users u
LEFT JOIN company_users cu ON cu.user_id = u.id
WHERE u.email = 'maria@empresa.com';

-- ========================================
-- PASSO 2: Vincular Maria à empresa lojatem
-- ========================================

-- Se Maria NÃO estiver em company_users, este INSERT vai criar o vínculo
-- Se Maria JÁ estiver, este INSERT não fará nada (por causa do NOT EXISTS)
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
    s.company_id,  -- Vai pegar 56c5edd2-e7bf-4e45-80cd-5e2880d35193
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

-- ========================================
-- PASSO 3: Se Maria JÁ estava em company_users mas empresa errada
-- ========================================

-- Atualizar para a empresa correta (lojatem)
UPDATE company_users
SET 
    company_id = '56c5edd2-e7bf-4e45-80cd-5e2880d35193',
    seller_id = (SELECT id FROM sellers WHERE email = 'maria@empresa.com'),
    active = true
WHERE user_id = (
    SELECT id FROM auth.users WHERE email = 'maria@empresa.com'
);

-- ========================================
-- PASSO 4: Verificar se funcionou
-- ========================================

SELECT 
    'DEPOIS DA CORREÇÃO' as status,
    u.email,
    cu.company_id,
    cu.role,
    cu.active,
    c.name as company_name
FROM auth.users u
JOIN company_users cu ON cu.user_id = u.id
JOIN companies c ON c.id = cu.company_id
WHERE u.email = 'maria@empresa.com';

-- ========================================
-- PASSO 5: Testar as funções RLS com Maria
-- ========================================

-- Execute este SELECT LOGADO COMO maria@empresa.com:
/*
SELECT 
    auth.uid() as meu_user_id,
    get_user_company_id() as minha_empresa,
    get_user_role() as minha_role,
    is_super_admin() as sou_admin;

-- Resultado esperado:
-- meu_user_id: [UUID da maria]
-- minha_empresa: 56c5edd2-e7bf-4e45-80cd-5e2880d35193
-- minha_role: seller
-- sou_admin: false
*/

-- ========================================
-- PASSO 6: Testar se Maria vê os produtos
-- ========================================

-- Execute LOGADO COMO maria@empresa.com:
/*
SELECT COUNT(*) as total_produtos FROM products;
SELECT COUNT(*) as total_formas_pagamento FROM payment_methods;

-- Resultado esperado:
-- total_produtos: 6
-- total_formas_pagamento: 6
*/

-- ========================================
-- PASSO 7: Fazer o mesmo para Bete (se necessário)
-- ========================================

-- Verificar Bete
SELECT 
    u.email,
    cu.company_id,
    cu.role,
    c.name as company_name
FROM auth.users u
LEFT JOIN company_users cu ON cu.user_id = u.id
LEFT JOIN companies c ON c.id = cu.company_id
WHERE u.email = 'bete@empresa.com';

-- Se Bete também não estiver vinculada ou estiver em empresa errada:
/*
-- Vincular Bete
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
WHERE u.email = 'bete@empresa.com'
AND s.email = 'bete@empresa.com'
AND NOT EXISTS (
    SELECT 1 FROM company_users cu 
    WHERE cu.user_id = u.id
);

-- Ou atualizar se já existir:
UPDATE company_users
SET 
    company_id = '56c5edd2-e7bf-4e45-80cd-5e2880d35193',
    seller_id = (SELECT id FROM sellers WHERE email = 'bete@empresa.com'),
    active = true
WHERE user_id = (
    SELECT id FROM auth.users WHERE email = 'bete@empresa.com'
);
*/

-- ========================================
-- RESUMO FINAL
-- ========================================

SELECT 
    'RESUMO FINAL' as status,
    u.email,
    cu.company_id,
    c.name as company_name,
    cu.role,
    cu.active,
    (SELECT COUNT(*) FROM products WHERE company_id = cu.company_id) as produtos_visiveis,
    (SELECT COUNT(*) FROM payment_methods WHERE company_id = cu.company_id) as formas_pagamento_visiveis
FROM auth.users u
JOIN company_users cu ON cu.user_id = u.id
JOIN companies c ON c.id = cu.company_id
WHERE u.email IN ('maria@empresa.com', 'bete@empresa.com')
ORDER BY u.email;

-- Resultado esperado:
-- bete@empresa.com  | 56c5edd2-... | lojatem | seller | true | 6 | 6
-- maria@empresa.com | 56c5edd2-... | lojatem | seller | true | 6 | 6
