-- ========================================
-- CORRIGIR USUÁRIO bete@empresa.com
-- ========================================
-- Este script vincula o usuário bete@empresa.com à empresa

-- PASSO 1: Verificar se o usuário existe no Auth
SELECT 
    id as user_id,
    email,
    created_at
FROM auth.users 
WHERE email = 'bete@empresa.com';

-- PASSO 2: Verificar se o vendedor existe
SELECT 
    id as seller_id,
    name,
    email,
    company_id
FROM sellers 
WHERE email = 'bete@empresa.com';

-- PASSO 3: Verificar se já está vinculado
SELECT * FROM company_users 
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'bete@empresa.com');

-- ========================================
-- SOLUÇÃO 1: Se o usuário existe mas não está vinculado
-- ========================================
-- Execute este INSERT substituindo os valores:

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
WHERE u.email = 'bete@empresa.com'
AND s.email = 'bete@empresa.com';
*/

-- ========================================
-- SOLUÇÃO 2: Se o usuário não existe, delete e recrie
-- ========================================
-- 1. Delete o usuário do Auth (se existir)
-- Vá em: Supabase → Authentication → Users → Procure bete@empresa.com → Delete

-- 2. Depois crie novamente pelo sistema cliente

-- ========================================
-- VERIFICAÇÃO FINAL
-- ========================================
-- Execute para confirmar que está tudo certo:

SELECT 
    cu.user_id,
    cu.company_id,
    cu.seller_id,
    cu.role,
    cu.active,
    u.email as user_email,
    s.name as seller_name,
    c.name as company_name
FROM company_users cu
JOIN auth.users u ON u.id = cu.user_id
LEFT JOIN sellers s ON s.id = cu.seller_id
JOIN companies c ON c.id = cu.company_id
WHERE u.email = 'bete@empresa.com';
