-- ========================================
-- CORREÇÃO SEGURA: Verificar Tabelas Existentes
-- ========================================
-- Script que verifica quais tabelas existem antes de atualizar

-- PASSO 1: Verificar quais tabelas existem no banco
SELECT 
  'TABELAS EXISTENTES' as info,
  table_name
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('products', 'sellers', 'sales', 'payment_methods', 'categories', 'companies')
ORDER BY table_name;

-- PASSO 2: Transferir dependências apenas das tabelas que existem
DO $$
DECLARE
    user_to_delete UUID;
    user_to_keep UUID;
    table_exists BOOLEAN;
BEGIN
    -- Buscar IDs dos usuários
    SELECT id INTO user_to_delete FROM auth.users WHERE email = 'loja-tem@gmail.com';
    SELECT id INTO user_to_keep FROM auth.users WHERE email = 'lojatem@gmail.com';
    
    IF user_to_delete IS NULL THEN
        RAISE NOTICE 'Usuário loja-tem@gmail.com não encontrado - pode já ter sido deletado';
        RETURN;
    END IF;
    
    IF user_to_keep IS NULL THEN
        RAISE NOTICE 'ERRO: Usuário lojatem@gmail.com não encontrado';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Transferindo dependências de % para %', user_to_delete, user_to_keep;
    
    -- Verificar e transferir produtos
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'products'
    ) INTO table_exists;
    
    IF table_exists THEN
        UPDATE products 
        SET created_by = user_to_keep
        WHERE created_by = user_to_delete;
        RAISE NOTICE 'Produtos transferidos';
    END IF;
    
    -- Verificar e transferir vendas
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'sales'
    ) INTO table_exists;
    
    IF table_exists THEN
        UPDATE sales 
        SET user_id = user_to_keep
        WHERE user_id = user_to_delete;
        RAISE NOTICE 'Vendas transferidas';
    END IF;
    
    -- Verificar e transferir formas de pagamento
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'payment_methods'
    ) INTO table_exists;
    
    IF table_exists THEN
        UPDATE payment_methods 
        SET created_by = user_to_keep
        WHERE created_by = user_to_delete;
        RAISE NOTICE 'Formas de pagamento transferidas';
    END IF;
    
    -- Verificar e transferir vendedores
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'sellers'
    ) INTO table_exists;
    
    IF table_exists THEN
        UPDATE sellers 
        SET created_by = user_to_keep
        WHERE created_by = user_to_delete;
        RAISE NOTICE 'Vendedores transferidos';
    END IF;
    
    -- Verificar e transferir empresas
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'companies'
    ) INTO table_exists;
    
    IF table_exists THEN
        -- Verificar se a coluna created_by existe em companies
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
              AND table_name = 'companies' 
              AND column_name = 'created_by'
        ) INTO table_exists;
        
        IF table_exists THEN
            UPDATE companies 
            SET created_by = user_to_keep
            WHERE created_by = user_to_delete;
            RAISE NOTICE 'Empresas transferidas';
        END IF;
    END IF;
    
    RAISE NOTICE 'Todas as dependências foram transferidas';
END $$;

-- PASSO 3: Remover vinculação do usuário duplicado
DELETE FROM company_users 
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'loja-tem@gmail.com'
);

-- PASSO 4: Deletar o usuário duplicado
DELETE FROM auth.users 
WHERE email = 'loja-tem@gmail.com';

-- PASSO 5: Garantir vinculação do usuário correto
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
    u.id as user_id,
    c.id as company_id,
    'manager' as role,
    true as active,
    true as can_access_pdv,
    true as can_view_reports,
    true as can_manage_products,
    true as can_manage_sellers
FROM auth.users u
CROSS JOIN companies c
WHERE u.email = 'lojatem@gmail.com'
  AND c.name = 'lojatem'
ON CONFLICT (user_id, company_id) 
DO UPDATE SET
    role = 'manager',
    active = true,
    can_access_pdv = true,
    can_view_reports = true,
    can_manage_products = true,
    can_manage_sellers = true;

-- PASSO 6: Corrigir emails inválidos
UPDATE auth.users 
SET email = 'maria@gmail.com'
WHERE email = 'maria@empresa.com';

UPDATE auth.users 
SET email = 'bete@gmail.com'
WHERE email = 'bete@empresa.com';

-- PASSO 7: Invalidar todas as sessões para forçar novo login
UPDATE auth.users 
SET updated_at = NOW()
WHERE email IN (
  'maria@gmail.com',
  'bete@gmail.com', 
  'lojatem@gmail.com',
  'edicharlesbrito2009@hotmail.com'
);

-- PASSO 8: Verificar resultado final
SELECT 
  'RESULTADO FINAL' as status,
  u.email,
  cu.role,
  cu.active,
  c.name as company_name
FROM auth.users u
LEFT JOIN company_users cu ON cu.user_id = u.id
LEFT JOIN companies c ON c.id = cu.company_id
WHERE u.email IN (
  'lojatem@gmail.com',
  'maria@gmail.com',
  'bete@gmail.com',
  'edicharlesbrito2009@hotmail.com'
)
ORDER BY 
  CASE u.email
    WHEN 'edicharlesbrito2009@hotmail.com' THEN 1
    WHEN 'lojatem@gmail.com' THEN 2
    WHEN 'maria@gmail.com' THEN 3
    WHEN 'bete@gmail.com' THEN 4
    ELSE 5
  END;

-- PASSO 9: Confirmar que não há mais duplicação
SELECT 
  'VERIFICAR DUPLICACAO' as status,
  email,
  COUNT(*) as quantidade
FROM auth.users 
WHERE email LIKE '%lojatem%' OR email LIKE '%loja-tem%'
GROUP BY email;

-- PASSO 10: Verificar se o usuário foi deletado com sucesso
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'loja-tem@gmail.com') 
    THEN '❌ ERRO: Usuário ainda existe'
    ELSE '✅ SUCESSO: Usuário deletado'
  END as resultado_delecao;