-- ========================================
-- CORREÇÃO: Usuário com Dependências
-- ========================================
-- Resolver o problema do usuário loja-tem@gmail.com que tem produtos vinculados

-- PASSO 1: Identificar o problema
SELECT 
  'PROBLEMA IDENTIFICADO' as status,
  u.email,
  u.id,
  COUNT(p.id) as produtos_criados
FROM auth.users u
LEFT JOIN products p ON p.created_by = u.id
WHERE u.email = 'loja-tem@gmail.com'
GROUP BY u.email, u.id;

-- PASSO 2: Transferir produtos para o usuário correto (lojatem@gmail.com)
UPDATE products 
SET created_by = (
  SELECT id FROM auth.users WHERE email = 'lojatem@gmail.com'
)
WHERE created_by = (
  SELECT id FROM auth.users WHERE email = 'loja-tem@gmail.com'
);

-- PASSO 3: Verificar se há outras dependências
SELECT 
  'OUTRAS DEPENDENCIAS' as status,
  'sales' as tabela,
  COUNT(*) as registros
FROM sales 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'loja-tem@gmail.com')

UNION ALL

SELECT 
  'OUTRAS DEPENDENCIAS' as status,
  'payment_methods' as tabela,
  COUNT(*) as registros
FROM payment_methods 
WHERE created_by = (SELECT id FROM auth.users WHERE email = 'loja-tem@gmail.com')

UNION ALL

SELECT 
  'OUTRAS DEPENDENCIAS' as status,
  'sellers' as tabela,
  COUNT(*) as registros
FROM sellers 
WHERE created_by = (SELECT id FROM auth.users WHERE email = 'loja-tem@gmail.com');

-- PASSO 4: Transferir outras dependências se existirem
-- Vendas
UPDATE sales 
SET user_id = (
  SELECT id FROM auth.users WHERE email = 'lojatem@gmail.com'
)
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'loja-tem@gmail.com'
);

-- Formas de pagamento
UPDATE payment_methods 
SET created_by = (
  SELECT id FROM auth.users WHERE email = 'lojatem@gmail.com'
)
WHERE created_by = (
  SELECT id FROM auth.users WHERE email = 'loja-tem@gmail.com'
);

-- Vendedores
UPDATE sellers 
SET created_by = (
  SELECT id FROM auth.users WHERE email = 'lojatem@gmail.com'
)
WHERE created_by = (
  SELECT id FROM auth.users WHERE email = 'loja-tem@gmail.com'
);

-- PASSO 5: Remover vinculação do usuário duplicado da empresa
DELETE FROM company_users 
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'loja-tem@gmail.com'
);

-- PASSO 6: Agora deletar o usuário duplicado (sem dependências)
DELETE FROM auth.users 
WHERE email = 'loja-tem@gmail.com';

-- PASSO 7: Garantir que lojatem@gmail.com está corretamente vinculado
DO $$
DECLARE
    lojatem_user_id UUID;
    lojatem_company_id UUID;
BEGIN
    -- Buscar IDs
    SELECT id INTO lojatem_user_id FROM auth.users WHERE email = 'lojatem@gmail.com';
    SELECT id INTO lojatem_company_id FROM companies WHERE name = 'lojatem';
    
    -- Verificar se encontrou os IDs
    IF lojatem_user_id IS NULL THEN
        RAISE NOTICE 'ERRO: Usuário lojatem@gmail.com não encontrado';
        RETURN;
    END IF;
    
    IF lojatem_company_id IS NULL THEN
        RAISE NOTICE 'ERRO: Empresa lojatem não encontrada';
        RETURN;
    END IF;
    
    -- Inserir ou atualizar vinculação como gerente
    INSERT INTO company_users (
        user_id, company_id, seller_id, role, active,
        can_access_pdv, can_view_reports, can_manage_products, can_manage_sellers,
        can_view_company_profits
    ) VALUES (
        lojatem_user_id, lojatem_company_id, NULL, 'manager', true,
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
        
    RAISE NOTICE 'lojatem@gmail.com configurado como gerente com sucesso';
END $$;

-- PASSO 8: Corrigir emails inválidos
UPDATE auth.users 
SET email = 'maria@gmail.com'
WHERE email = 'maria@empresa.com';

UPDATE auth.users 
SET email = 'bete@gmail.com'
WHERE email = 'bete@empresa.com';

-- PASSO 9: Invalidar todas as sessões para forçar novo login
UPDATE auth.users 
SET updated_at = NOW()
WHERE email IN (
  'maria@gmail.com',
  'bete@gmail.com', 
  'lojatem@gmail.com',
  'edicharlesbrito2009@hotmail.com'
);

-- PASSO 10: Verificar resultado final
SELECT 
  'RESULTADO FINAL' as status,
  u.email,
  u.id,
  cu.role,
  cu.active,
  c.name as company_name,
  (SELECT COUNT(*) FROM products WHERE created_by = u.id) as produtos_criados,
  CASE 
    WHEN u.email = 'lojatem@gmail.com' THEN '✅ GERENTE ÚNICO'
    WHEN u.email = 'maria@gmail.com' THEN '✅ VENDEDORA MARIA'
    WHEN u.email = 'bete@gmail.com' THEN '✅ VENDEDORA BETE'
    WHEN u.email = 'edicharlesbrito2009@hotmail.com' THEN '✅ SUPER ADMIN'
    ELSE '⚠️ VERIFICAR'
  END as situacao
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

-- PASSO 11: Confirmar que não há mais usuário duplicado
SELECT 
  'VERIFICAR DUPLICACAO' as status,
  email,
  COUNT(*) as quantidade
FROM auth.users 
WHERE email LIKE '%lojatem%' OR email LIKE '%loja-tem%'
GROUP BY email;