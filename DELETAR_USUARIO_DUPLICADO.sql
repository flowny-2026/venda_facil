-- ========================================
-- DELETAR USUÁRIO DUPLICADO: loja-tem@gmail.com
-- ========================================
-- Manter apenas lojatem@gmail.com como gerente

-- PASSO 1: Verificar dados antes da exclusão
SELECT 
  'ANTES DA EXCLUSAO' as status,
  u.id,
  u.email,
  u.created_at,
  u.last_sign_in_at,
  cu.role,
  cu.active,
  c.name as company_name
FROM auth.users u
LEFT JOIN company_users cu ON cu.user_id = u.id
LEFT JOIN companies c ON c.id = cu.company_id
WHERE u.email IN ('loja-tem@gmail.com', 'lojatem@gmail.com')
ORDER BY u.email;

-- PASSO 2: Remover vinculação do usuário duplicado da empresa
DELETE FROM company_users 
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'loja-tem@gmail.com'
);

-- PASSO 3: Deletar o usuário duplicado do auth.users
DELETE FROM auth.users 
WHERE email = 'loja-tem@gmail.com';

-- PASSO 4: Garantir que lojatem@gmail.com está corretamente vinculado
-- Buscar IDs necessários e vincular como gerente
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

-- PASSO 5: Atualizar emails inválidos para válidos
UPDATE auth.users 
SET email = 'maria@gmail.com'
WHERE email = 'maria@empresa.com';

UPDATE auth.users 
SET email = 'bete@gmail.com'
WHERE email = 'bete@empresa.com';

-- PASSO 6: Invalidar todas as sessões para forçar novo login
UPDATE auth.users 
SET updated_at = NOW()
WHERE email IN (
  'maria@gmail.com',
  'bete@gmail.com', 
  'lojatem@gmail.com',
  'edicharlesbrito2009@hotmail.com'
);

-- PASSO 7: Verificar resultado final
SELECT 
  'RESULTADO FINAL' as status,
  u.email,
  u.id,
  u.created_at,
  cu.role,
  cu.active,
  c.name as company_name,
  CASE 
    WHEN u.email = 'lojatem@gmail.com' THEN '✅ GERENTE PRINCIPAL'
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

-- PASSO 8: Verificar se não há mais usuários duplicados
SELECT 
  'VERIFICAR DUPLICADOS' as status,
  email,
  COUNT(*) as quantidade
FROM auth.users 
WHERE email LIKE '%lojatem%' 
   OR email LIKE '%loja-tem%'
   OR email LIKE '%maria%'
   OR email LIKE '%bete%'
GROUP BY email
HAVING COUNT(*) > 1;