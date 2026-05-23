-- ========================================
-- VERIFICAR USUÁRIOS DA MESMA EMPRESA
-- ========================================

-- 1. Ver todos os usuários da empresa
SELECT 
    u.email,
    cu.company_id,
    cu.role,
    cu.active,
    c.name as company_name,
    s.name as seller_name
FROM company_users cu
JOIN auth.users u ON u.id = cu.user_id
JOIN companies c ON c.id = cu.company_id
LEFT JOIN sellers s ON s.id = cu.seller_id
WHERE u.email IN ('bete@empresa.com', 'maria@empresa.com')
ORDER BY u.email;

-- 2. Verificar se estão na mesma empresa
SELECT 
    c.id as company_id,
    c.name as company_name,
    COUNT(*) as total_usuarios,
    STRING_AGG(u.email, ', ') as usuarios
FROM company_users cu
JOIN auth.users u ON u.id = cu.user_id
JOIN companies c ON c.id = cu.company_id
WHERE u.email IN ('bete@empresa.com', 'maria@empresa.com')
GROUP BY c.id, c.name;

-- 3. Ver produtos da empresa
SELECT 
    p.id,
    p.name,
    p.company_id,
    c.name as company_name
FROM products p
JOIN companies c ON c.id = p.company_id
WHERE c.id IN (
    SELECT company_id 
    FROM company_users cu
    JOIN auth.users u ON u.id = cu.user_id
    WHERE u.email = 'bete@empresa.com'
);

-- 4. Ver formas de pagamento da empresa
SELECT 
    pm.id,
    pm.name,
    pm.type,
    pm.company_id,
    c.name as company_name
FROM payment_methods pm
JOIN companies c ON c.id = pm.company_id
WHERE c.id IN (
    SELECT company_id 
    FROM company_users cu
    JOIN auth.users u ON u.id = cu.user_id
    WHERE u.email = 'bete@empresa.com'
);

-- ========================================
-- VERIFICAR POLÍTICAS RLS
-- ========================================

-- 5. Ver políticas de products
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'products';

-- 6. Ver políticas de payment_methods
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'payment_methods';

-- ========================================
-- SOLUÇÃO: Se maria não estiver vinculada
-- ========================================

-- Execute apenas se maria não aparecer no passo 1:
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
