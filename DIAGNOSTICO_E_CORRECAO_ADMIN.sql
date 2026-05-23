-- ========================================
-- DIAGNÓSTICO E CORREÇÃO - USUÁRIO ADMIN
-- ========================================
-- Execute cada seção em ordem e verifique os resultados

-- ========================================
-- SEÇÃO 1: VERIFICAR USUÁRIOS NO AUTH
-- ========================================
-- Veja todos os usuários cadastrados no sistema

SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;

-- ========================================
-- SEÇÃO 2: VERIFICAR COMPANY_USERS
-- ========================================
-- Veja quem tem acesso e qual role

SELECT 
    u.email,
    cu.role,
    cu.active,
    c.name as company_name
FROM auth.users u
LEFT JOIN company_users cu ON cu.user_id = u.id
LEFT JOIN companies c ON c.id = cu.company_id
ORDER BY u.email;

-- ========================================
-- SEÇÃO 3: VERIFICAR SUPER ADMINS
-- ========================================
-- Veja quem já é super_admin

SELECT 
    u.email,
    cu.role,
    cu.active
FROM auth.users u
JOIN company_users cu ON cu.user_id = u.id
WHERE cu.role = 'super_admin';

-- ========================================
-- SEÇÃO 4: BUSCAR USUÁRIO ESPECÍFICO
-- ========================================
-- Procure pelo email do admin desejado

SELECT 
    u.id as user_id,
    u.email,
    cu.role,
    cu.active,
    cu.company_id
FROM auth.users u
LEFT JOIN company_users cu ON cu.user_id = u.id
WHERE u.email = 'edicharlesbrito2009@hotmail.com';

-- OU procure por lojatem@empresa.com se for usar esse:
SELECT 
    u.id as user_id,
    u.email,
    cu.role,
    cu.active,
    cu.company_id
FROM auth.users u
LEFT JOIN company_users cu ON cu.user_id = u.id
WHERE u.email = 'lojatem@empresa.com';

-- ========================================
-- SEÇÃO 5: CORREÇÃO - OPÇÃO A
-- ========================================
-- Se o usuário JÁ EXISTE no auth.users mas NÃO tem role super_admin
-- Substitua o email pelo email correto

DO $$
DECLARE
    v_user_id uuid;
    v_company_id uuid;
BEGIN
    -- Buscar user_id
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = 'lojatem@empresa.com';  -- ← ALTERE O EMAIL AQUI
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuário não encontrado no auth.users';
    END IF;
    
    -- Buscar uma empresa (lojatem)
    SELECT id INTO v_company_id
    FROM companies
    WHERE name = 'lojatem'
    LIMIT 1;
    
    IF v_company_id IS NULL THEN
        RAISE NOTICE 'Nenhuma empresa encontrada, usando NULL';
    END IF;
    
    -- Inserir ou atualizar
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
        v_user_id,
        v_company_id,
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
        active = true,
        can_access_pdv = true,
        can_view_reports = true,
        can_manage_products = true,
        can_manage_sellers = true;
    
    RAISE NOTICE 'Usuário configurado como super_admin com sucesso!';
END $$;

-- ========================================
-- SEÇÃO 6: CORREÇÃO - OPÇÃO B (MANUAL)
-- ========================================
-- Se preferir fazer manualmente, copie o user_id da SEÇÃO 4 e execute:

-- SUBSTITUA OS VALORES ABAIXO:
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
    'COLE_O_USER_ID_AQUI',  -- ← user_id da SEÇÃO 4
    '56c5edd2-e7bf-4e45-80cd-5e2880d35193',  -- company_id da lojatem
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
-- SEÇÃO 7: VERIFICAÇÃO FINAL
-- ========================================
-- Confirme que funcionou

SELECT 
    u.email,
    cu.role,
    cu.active,
    c.name as company_name
FROM auth.users u
JOIN company_users cu ON cu.user_id = u.id
LEFT JOIN companies c ON c.id = cu.company_id
WHERE cu.role = 'super_admin';

-- Deve mostrar o email com role = 'super_admin' e active = true

-- ========================================
-- SEÇÃO 8: SE O USUÁRIO NÃO EXISTE
-- ========================================
-- Se a SEÇÃO 4 não retornou nada, o usuário não existe no auth.users
-- Você precisa criar no Supabase Dashboard:
-- 
-- 1. Vá em: https://supabase.com/dashboard/project/cvmjjzhvdmpbxquxepue
-- 2. Menu: Authentication → Users
-- 3. Clique em "Add User"
-- 4. Preencha:
--    - Email: edicharlesbrito2009@hotmail.com
--    - Password: [escolha uma senha]
--    - Auto Confirm User: ✅ MARQUE
-- 5. Clique em "Create User"
-- 6. Depois execute a SEÇÃO 5 ou 6 acima

-- ========================================
-- RESUMO DO PROCESSO
-- ========================================
-- 
-- 1. Execute SEÇÃO 1 → Ver todos os usuários
-- 2. Execute SEÇÃO 4 → Procurar seu usuário específico
-- 3. Se encontrou → Execute SEÇÃO 5 (automático) ou SEÇÃO 6 (manual)
-- 4. Se não encontrou → Crie no Dashboard (SEÇÃO 8) e depois execute SEÇÃO 5/6
-- 5. Execute SEÇÃO 7 → Confirmar que funcionou
-- 6. Faça login no painel admin
-- 
-- ========================================
