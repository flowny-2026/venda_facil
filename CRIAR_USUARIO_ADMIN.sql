-- ========================================
-- CRIAR USUÁRIO ADMIN (SUPER_ADMIN)
-- ========================================

-- IMPORTANTE: O usuário precisa ser criado no Supabase Auth primeiro!
-- Vá em: Supabase Dashboard → Authentication → Users → Add User

-- Depois de criar o usuário no Auth, execute este script:

-- ========================================
-- PASSO 1: Verificar se o usuário existe no Auth
-- ========================================

SELECT 
    id,
    email,
    created_at
FROM auth.users
WHERE email = 'edicharlesbrito2009@hotmail.com';

-- Copie o ID do usuário acima e use no próximo passo

-- ========================================
-- PASSO 2: Criar entrada na company_users como super_admin
-- ========================================

-- SUBSTITUA 'SEU_USER_ID_AQUI' pelo ID do passo 1
INSERT INTO company_users (
    user_id,
    company_id,
    role,
    active,
    can_access_pdv,
    can_view_reports,
    can_manage_products,
    can_manage_sellers
) VALUES (
    'SEU_USER_ID_AQUI',  -- ← SUBSTITUA AQUI
    NULL,  -- Super admin não precisa de company_id
    'super_admin',
    true,
    true,
    true,
    true,
    true
)
ON CONFLICT (user_id, company_id) DO UPDATE
SET 
    role = 'super_admin',
    active = true;

-- ========================================
-- PASSO 3: Verificar se funcionou
-- ========================================

SELECT 
    u.email,
    cu.role,
    cu.active
FROM auth.users u
JOIN company_users cu ON cu.user_id = u.id
WHERE u.email = 'edicharlesbrito2009@hotmail.com';

-- Deve retornar:
-- email: edicharlesbrito2009@hotmail.com
-- role: super_admin
-- active: true

-- ========================================
-- ALTERNATIVA: Se company_id não pode ser NULL
-- ========================================

-- Se der erro de NOT NULL, use uma empresa existente:

-- 1. Ver empresas disponíveis
SELECT id, name FROM companies LIMIT 5;

-- 2. Inserir com company_id
INSERT INTO company_users (
    user_id,
    company_id,
    role,
    active,
    can_access_pdv,
    can_view_reports,
    can_manage_products,
    can_manage_sellers
) VALUES (
    'SEU_USER_ID_AQUI',  -- ← SUBSTITUA
    'f3063d74-fa10-4cf7-9324-c7f67f66b307',  -- ← ID de uma empresa existente
    'super_admin',
    true,
    true,
    true,
    true,
    true
)
ON CONFLICT (user_id, company_id) DO UPDATE
SET 
    role = 'super_admin',
    active = true;
