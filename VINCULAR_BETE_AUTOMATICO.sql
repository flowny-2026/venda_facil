-- ========================================
-- VINCULAR bete@empresa.com AUTOMATICAMENTE
-- ========================================
-- Este script vincula o usuário automaticamente sem precisar copiar IDs

-- Execute este comando único:
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

-- Verificar se funcionou:
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
