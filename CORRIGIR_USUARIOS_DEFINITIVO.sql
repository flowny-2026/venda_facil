-- ========================================
-- CORREÇÃO DEFINITIVA DOS USUÁRIOS
-- ========================================
-- Execute este script para garantir que os usuários estejam configurados corretamente

-- PASSO 1: Atualizar emails para domínios válidos (se necessário)
-- Só execute se ainda houver emails @empresa.com

-- Bete: empresa.com -> gmail.com
UPDATE auth.users 
SET email = 'bete@gmail.com'
WHERE email = 'bete@empresa.com';

-- Maria: empresa.com -> gmail.com  
UPDATE auth.users 
SET email = 'maria@gmail.com'
WHERE email = 'maria@empresa.com';

-- Lojatem: empresa.com -> gmail.com
UPDATE auth.users 
SET email = 'loja-tem@gmail.com'
WHERE email = 'lojatem@empresa.com';

-- PASSO 2: Garantir que Bete está vinculada corretamente
-- Buscar IDs necessários
DO $$
DECLARE
    bete_user_id UUID;
    bete_seller_id UUID;
    lojatem_company_id UUID;
BEGIN
    -- Buscar IDs
    SELECT id INTO bete_user_id FROM auth.users WHERE email = 'bete@gmail.com';
    SELECT id INTO bete_seller_id FROM sellers WHERE email = 'bete@gmail.com' LIMIT 1;
    SELECT id INTO lojatem_company_id FROM companies WHERE name = 'lojatem';
    
    -- Verificar se encontrou os IDs
    IF bete_user_id IS NULL THEN
        RAISE NOTICE 'ERRO: Usuário bete@gmail.com não encontrado';
        RETURN;
    END IF;
    
    IF bete_seller_id IS NULL THEN
        RAISE NOTICE 'ERRO: Vendedor bete@gmail.com não encontrado';
        RETURN;
    END IF;
    
    IF lojatem_company_id IS NULL THEN
        RAISE NOTICE 'ERRO: Empresa lojatem não encontrada';
        RETURN;
    END IF;
    
    -- Atualizar ou inserir vinculação da Bete
    INSERT INTO company_users (
        user_id, company_id, seller_id, role, active,
        can_access_pdv, can_view_reports, can_manage_products, can_manage_sellers,
        can_view_company_profits
    ) VALUES (
        bete_user_id, lojatem_company_id, bete_seller_id, 'seller', true,
        true, false, false, false, false
    )
    ON CONFLICT (user_id, company_id) 
    DO UPDATE SET
        seller_id = bete_seller_id,
        role = 'seller',
        active = true,
        can_access_pdv = true,
        can_view_reports = false,
        can_manage_products = false,
        can_manage_sellers = false,
        can_view_company_profits = false;
        
    RAISE NOTICE 'Bete vinculada com sucesso';
END $$;

-- PASSO 3: Garantir que Maria está vinculada corretamente
DO $$
DECLARE
    maria_user_id UUID;
    maria_seller_id UUID;
    lojatem_company_id UUID;
BEGIN
    -- Buscar IDs
    SELECT id INTO maria_user_id FROM auth.users WHERE email = 'maria@gmail.com';
    SELECT id INTO maria_seller_id FROM sellers WHERE email = 'maria@gmail.com' LIMIT 1;
    SELECT id INTO lojatem_company_id FROM companies WHERE name = 'lojatem';
    
    -- Verificar se encontrou os IDs
    IF maria_user_id IS NULL THEN
        RAISE NOTICE 'ERRO: Usuário maria@gmail.com não encontrado';
        RETURN;
    END IF;
    
    IF maria_seller_id IS NULL THEN
        RAISE NOTICE 'ERRO: Vendedor maria@gmail.com não encontrado';
        RETURN;
    END IF;
    
    IF lojatem_company_id IS NULL THEN
        RAISE NOTICE 'ERRO: Empresa lojatem não encontrada';
        RETURN;
    END IF;
    
    -- Atualizar ou inserir vinculação da Maria
    INSERT INTO company_users (
        user_id, company_id, seller_id, role, active,
        can_access_pdv, can_view_reports, can_manage_products, can_manage_sellers,
        can_view_company_profits
    ) VALUES (
        maria_user_id, lojatem_company_id, maria_seller_id, 'seller', true,
        true, false, false, false, false
    )
    ON CONFLICT (user_id, company_id) 
    DO UPDATE SET
        seller_id = maria_seller_id,
        role = 'seller',
        active = true,
        can_access_pdv = true,
        can_view_reports = false,
        can_manage_products = false,
        can_manage_sellers = false,
        can_view_company_profits = false;
        
    RAISE NOTICE 'Maria vinculada com sucesso';
END $$;

-- PASSO 4: Garantir que o gerente está correto
DO $$
DECLARE
    manager_user_id UUID;
    lojatem_company_id UUID;
BEGIN
    -- Buscar IDs (tentar ambos os emails possíveis)
    SELECT id INTO manager_user_id FROM auth.users WHERE email = 'loja-tem@gmail.com';
    IF manager_user_id IS NULL THEN
        SELECT id INTO manager_user_id FROM auth.users WHERE email = 'lojatem@gmail.com';
    END IF;
    
    SELECT id INTO lojatem_company_id FROM companies WHERE name = 'lojatem';
    
    -- Verificar se encontrou os IDs
    IF manager_user_id IS NULL THEN
        RAISE NOTICE 'ERRO: Usuário gerente não encontrado (loja-tem@gmail.com ou lojatem@gmail.com)';
        RETURN;
    END IF;
    
    IF lojatem_company_id IS NULL THEN
        RAISE NOTICE 'ERRO: Empresa lojatem não encontrada';
        RETURN;
    END IF;
    
    -- Atualizar ou inserir vinculação do gerente
    INSERT INTO company_users (
        user_id, company_id, seller_id, role, active,
        can_access_pdv, can_view_reports, can_manage_products, can_manage_sellers,
        can_view_company_profits
    ) VALUES (
        manager_user_id, lojatem_company_id, NULL, 'manager', true,
        true, true, true, true, true
    )
    ON CONFLICT (user_id, company_id) 
    DO UPDATE SET
        role = 'manager',
        active = true,
        can_access_pdv = true,
        can_view_reports = true,
        can_manage_products = true,
        can_manage_sellers = true,
        can_view_company_profits = true;
        
    RAISE NOTICE 'Gerente vinculado com sucesso';
END $$;

-- PASSO 5: Remover usuários duplicados ou inativos (se houver)
-- Desativar usuários com emails @empresa.com se existirem versões @gmail.com
UPDATE company_users 
SET active = false
WHERE user_id IN (
    SELECT id FROM auth.users 
    WHERE email LIKE '%@empresa.com'
    AND EXISTS (
        SELECT 1 FROM auth.users u2 
        WHERE u2.email = REPLACE(auth.users.email, '@empresa.com', '@gmail.com')
    )
);

-- PASSO 6: Verificar resultado final
SELECT 
    'RESULTADO FINAL' as status,
    u.email,
    cu.role,
    cu.active,
    c.name as company_name,
    s.name as seller_name
FROM company_users cu
JOIN auth.users u ON u.id = cu.user_id
JOIN companies c ON c.id = cu.company_id
LEFT JOIN sellers s ON s.id = cu.seller_id
WHERE c.name = 'lojatem' AND cu.active = true
ORDER BY cu.role, u.email;