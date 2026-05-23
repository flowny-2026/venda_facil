-- ========================================
-- VERIFICAR SE MARIA ESTÁ VINCULADA À EMPRESA
-- ========================================

-- 1. Ver dados de Maria
SELECT 
    u.id as user_id,
    u.email,
    u.created_at,
    cu.company_id,
    cu.role,
    cu.active,
    cu.seller_id,
    c.name as company_name,
    s.name as seller_name
FROM auth.users u
LEFT JOIN company_users cu ON cu.user_id = u.id
LEFT JOIN companies c ON c.id = cu.company_id
LEFT JOIN sellers s ON s.id = cu.seller_id
WHERE u.email = 'maria@empresa.com';

-- 2. Ver dados de Bete (para comparar)
SELECT 
    u.id as user_id,
    u.email,
    u.created_at,
    cu.company_id,
    cu.role,
    cu.active,
    cu.seller_id,
    c.name as company_name,
    s.name as seller_name
FROM auth.users u
LEFT JOIN company_users cu ON cu.user_id = u.id
LEFT JOIN companies c ON c.id = cu.company_id
LEFT JOIN sellers s ON s.id = cu.seller_id
WHERE u.email = 'bete@empresa.com';

-- 3. Ver se existe vendedor Maria na tabela sellers
SELECT 
    id,
    name,
    email,
    company_id,
    active
FROM sellers
WHERE email = 'maria@empresa.com'
OR name ILIKE '%maria%';

-- ========================================
-- RESULTADO ESPERADO:
-- ========================================
-- Se Maria estiver CORRETAMENTE vinculada, deve aparecer:
-- - user_id: [UUID]
-- - email: maria@empresa.com
-- - company_id: f3063d74-fa10-4cf7-9324-c7f67f66b307 (mesma da Bete)
-- - role: seller
-- - active: true
-- - seller_id: [UUID do vendedor]
-- - company_name: [Nome da empresa]
-- - seller_name: Maria (ou nome do vendedor)

-- ========================================
-- SE MARIA NÃO ESTIVER VINCULADA:
-- ========================================
-- Execute o script abaixo para vincular:

/*
-- Vincular Maria à empresa automaticamente
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

-- Verificar se funcionou
SELECT 
    u.email,
    cu.company_id,
    cu.role,
    c.name as company_name
FROM auth.users u
JOIN company_users cu ON cu.user_id = u.id
JOIN companies c ON c.id = cu.company_id
WHERE u.email = 'maria@empresa.com';
*/
