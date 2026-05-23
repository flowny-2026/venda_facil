-- ========================================
-- TESTE RÁPIDO: Verificar Maria e Bete
-- ========================================

-- 1. Ver se ambas estão vinculadas à mesma empresa
SELECT 
    u.email,
    cu.company_id,
    cu.role,
    cu.active,
    c.name as company_name
FROM auth.users u
LEFT JOIN company_users cu ON cu.user_id = u.id
LEFT JOIN companies c ON c.id = cu.company_id
WHERE u.email IN ('maria@empresa.com', 'bete@empresa.com')
ORDER BY u.email;

-- ========================================
-- RESULTADO ESPERADO:
-- ========================================
-- Ambas devem ter o MESMO company_id
-- 
-- bete@empresa.com  | f3063d74-... | seller/manager | true | [Nome Empresa]
-- maria@empresa.com | f3063d74-... | seller         | true | [Nome Empresa]
--
-- Se Maria tiver company_id NULL, ela NÃO está vinculada!

-- ========================================
-- SE MARIA NÃO ESTIVER VINCULADA, EXECUTE:
-- ========================================

/*
-- Vincular Maria automaticamente
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
