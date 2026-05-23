-- ========================================
-- CORREÇÃO FINAL: Todas as Dependências
-- ========================================
-- Resolver TODAS as chaves estrangeiras antes de deletar o usuário

-- PASSO 1: Identificar TODAS as dependências do usuário loja-tem@gmail.com
DO $$
DECLARE
    user_to_delete UUID;
    user_to_keep UUID;
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
    
    -- Transferir produtos
    UPDATE products 
    SET created_by = user_to_keep
    WHERE created_by = user_to_delete;
    
    -- Transferir vendas
    UPDATE sales 
    SET user_id = user_to_keep
    WHERE user_id = user_to_delete;
    
    -- Transferir formas de pagamento
    UPDATE payment_methods 
    SET created_by = user_to_keep
    WHERE created_by = user_to_delete;
    
    -- Transferir vendedores (esta era a dependência que faltava!)
    UPDATE sellers 
    SET created_by = user_to_keep
    WHERE created_by = user_to_delete;
    
    -- Transferir categorias se existirem
    UPDATE categories 
    SET created_by = user_to_keep
    WHERE created_by = user_to_delete;
    
    -- Transferir outras tabelas que podem ter created_by
    UPDATE companies 
    SET created_by = user_to_keep
    WHERE created_by = user_to_delete;
    
    RAISE NOTICE 'Dependências transferidas com sucesso';
END $$;

-- PASSO 2: Remover vinculação do usuário duplicado
DELETE FROM company_users 
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'loja-tem@gmail.com'
);

-- PASSO 3: Agora deletar o usuário duplicado (sem dependências)
DELETE FROM auth.users 
WHERE email = 'loja-tem@gmail.com';

-- PASSO 4: Garantir vinculação do usuário correto
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

-- PASSO 5: Corrigir emails inválidos
UPDATE auth.users 
SET email = 'maria@gmail.com'
WHERE email = 'maria@empresa.com';

UPDATE auth.users 
SET email = 'bete@gmail.com'
WHERE email = 'bete@empresa.com';

-- PASSO 6: Garantir que Maria e Bete estão vinculadas corretamente
-- Maria
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
    c.id as company_id,
    s.id as seller_id,
    'seller' as role,
    true as active,
    true as can_access_pdv,
    false as can_view_reports,
    false as can_manage_products,
    false as can_manage_sellers
FROM auth.users u
CROSS JOIN companies c
LEFT JOIN sellers s ON s.email = u.email AND s.company_id = c.id
WHERE u.email = 'maria@gmail.com'
  AND c.name = 'lojatem'
ON CONFLICT (user_id, company_id) 
DO UPDATE SET
    role = 'seller',
    active = true,
    can_access_pdv = true,
    can_view_reports = false,
    can_manage_products = false,
    can_manage_sellers = false;

-- Bete
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
    c.id as company_id,
    s.id as seller_id,
    'seller' as role,
    true as active,
    true as can_access_pdv,
    false as can_view_reports,
    false as can_manage_products,
    false as can_manage_sellers
FROM auth.users u
CROSS JOIN companies c
LEFT JOIN sellers s ON s.email = u.email AND s.company_id = c.id
WHERE u.email = 'bete@gmail.com'
  AND c.name = 'lojatem'
ON CONFLICT (user_id, company_id) 
DO UPDATE SET
    role = 'seller',
    active = true,
    can_access_pdv = true,
    can_view_reports = false,
    can_manage_products = false,
    can_manage_sellers = false;

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
  c.name as company_name,
  s.name as seller_name,
  (SELECT COUNT(*) FROM products WHERE created_by = u.id) as produtos_criados,
  (SELECT COUNT(*) FROM sellers WHERE created_by = u.id) as vendedores_criados
FROM auth.users u
LEFT JOIN company_users cu ON cu.user_id = u.id
LEFT JOIN companies c ON c.id = cu.company_id
LEFT JOIN sellers s ON s.id = cu.seller_id
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

-- PASSO 10: Verificar se todas as dependências foram resolvidas
SELECT 
  'DEPENDENCIAS RESOLVIDAS' as status,
  'Nenhum registro deve aparecer abaixo' as observacao;

-- Esta query deve retornar 0 registros se tudo foi corrigido
SELECT 
  'ERRO - AINDA HA DEPENDENCIAS' as problema,
  table_name,
  column_name,
  COUNT(*) as registros_problematicos
FROM (
  SELECT 'products' as table_name, 'created_by' as column_name, created_by as user_ref FROM products
  UNION ALL
  SELECT 'sellers' as table_name, 'created_by' as column_name, created_by as user_ref FROM sellers
  UNION ALL
  SELECT 'sales' as table_name, 'user_id' as column_name, user_id as user_ref FROM sales
  UNION ALL
  SELECT 'payment_methods' as table_name, 'created_by' as column_name, created_by as user_ref FROM payment_methods
) deps
WHERE user_ref = (SELECT id FROM auth.users WHERE email = 'loja-tem@gmail.com')
GROUP BY table_name, column_name;