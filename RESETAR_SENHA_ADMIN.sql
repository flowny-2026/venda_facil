-- ========================================
-- RESETAR SENHA DO ADMIN
-- ========================================

-- IMPORTANTE: Senhas não podem ser visualizadas por segurança.
-- Você precisa resetar a senha no Supabase Dashboard.

-- ========================================
-- PASSO 1: Verificar o usuário admin
-- ========================================

SELECT 
    id,
    email,
    created_at,
    last_sign_in_at,
    email_confirmed_at
FROM auth.users
WHERE email = 'edicharlesbrito2009@hotmail.com';

-- ========================================
-- PASSO 2: Resetar a senha
-- ========================================

-- OPÇÃO A: Via Supabase Dashboard (RECOMENDADO)
-- 
-- 1. Acesse: https://supabase.com/dashboard/project/cvmjjzhvdmpbxquxepue
-- 2. Menu: Authentication → Users
-- 3. Procure por: edicharlesbrito2009@hotmail.com
-- 4. Clique nos 3 pontinhos (⋮) ao lado do usuário
-- 5. Clique em "Send Password Recovery"
-- 6. OU clique em "Reset Password" e defina uma nova senha manualmente
--
-- OPÇÃO B: Definir senha diretamente (use com cuidado)
--
-- No Supabase Dashboard:
-- 1. Authentication → Users
-- 2. Clique no usuário edicharlesbrito2009@hotmail.com
-- 3. Role até "User Management"
-- 4. Clique em "Reset Password"
-- 5. Digite a nova senha
-- 6. Clique em "Update User"

-- ========================================
-- PASSO 3: Testar o login
-- ========================================

-- Após resetar a senha:
-- 1. Vá em: http://localhost:5174
-- 2. Clique em "Sair e Fazer Login com Outro Usuário"
-- 3. Faça login com:
--    - Email: edicharlesbrito2009@hotmail.com
--    - Senha: [a nova senha que você definiu]

-- ========================================
-- ALTERNATIVA: Criar um novo super_admin
-- ========================================

-- Se preferir criar um novo usuário admin:

-- 1. Crie o usuário no Dashboard:
--    Authentication → Users → Add User
--    Email: admin@vendafacil.com (ou outro)
--    Password: [escolha uma senha]
--    Auto Confirm User: ✅ MARQUE

-- 2. Depois execute este SQL (substitua o email):

DO $$
DECLARE
    v_user_id uuid;
    v_company_id uuid;
BEGIN
    -- Buscar o novo usuário
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = 'admin@vendafacil.com';  -- ← ALTERE AQUI
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuário não encontrado!';
    END IF;
    
    -- Buscar uma empresa
    SELECT id INTO v_company_id
    FROM companies
    LIMIT 1;
    
    -- Dar permissão de super_admin
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
    SET role = 'super_admin', active = true;
    
    RAISE NOTICE '✅ Novo super_admin criado com sucesso!';
END $$;

-- ========================================
-- VERIFICAÇÃO FINAL
-- ========================================

-- Ver todos os super_admins
SELECT 
    u.email,
    cu.role,
    cu.active,
    u.last_sign_in_at
FROM auth.users u
JOIN company_users cu ON cu.user_id = u.id
WHERE cu.role = 'super_admin'
ORDER BY u.email;
