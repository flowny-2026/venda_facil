-- ========================================
-- CORRIGIR PERMISSÕES DE ADMIN
-- ========================================
-- lojatem@empresa.com deve ser MANAGER (não super_admin)
-- edicharlesbrito2009@hotmail.com deve ser SUPER_ADMIN

-- ========================================
-- PASSO 1: Remover super_admin da lojatem
-- ========================================

UPDATE company_users
SET role = 'manager'
WHERE user_id = (
    SELECT id FROM auth.users WHERE email = 'lojatem@empresa.com'
)
AND role = 'super_admin';

-- ========================================
-- PASSO 2: Confirmar que edicharles é super_admin
-- ========================================

-- Verificar se já existe
SELECT 
    u.email,
    cu.role,
    cu.active,
    cu.company_id
FROM auth.users u
JOIN company_users cu ON cu.user_id = u.id
WHERE u.email = 'edicharlesbrito2009@hotmail.com';

-- Se não existir ou não for super_admin, execute:
INSERT INTO company_users (
    user_id,
    company_id,
    role,
    active,
    can_access_pdv,
    can_view_reports,
    can_manage_products,
    can_manage_sellers
)
SELECT 
    u.id,
    c.id,
    'super_admin',
    true,
    true,
    true,
    true,
    true
FROM auth.users u
CROSS JOIN companies c
WHERE u.email = 'edicharlesbrito2009@hotmail.com'
AND c.name = 'lojatem'
LIMIT 1
ON CONFLICT (user_id, company_id) DO UPDATE
SET 
    role = 'super_admin',
    active = true;

-- ========================================
-- PASSO 3: Verificação Final
-- ========================================

-- Ver todos os super_admins (deve ter APENAS edicharles)
SELECT 
    u.email,
    cu.role,
    cu.active
FROM auth.users u
JOIN company_users cu ON cu.user_id = u.id
WHERE cu.role = 'super_admin';

-- Ver a lojatem (deve ser manager)
SELECT 
    u.email,
    cu.role,
    cu.active
FROM auth.users u
JOIN company_users cu ON cu.user_id = u.id
WHERE u.email = 'lojatem@empresa.com';

-- ========================================
-- RESULTADO ESPERADO
-- ========================================
-- 
-- Super Admins:
-- | email                           | role        | active |
-- | edicharlesbrito2009@hotmail.com | super_admin | true   |
--
-- Lojatem:
-- | email               | role    | active |
-- | lojatem@empresa.com | manager | true   |
--
-- ========================================
