-- ========================================
-- CORREÇÃO SIMPLES: Resolver Usuário Duplicado
-- ========================================
-- Versão simplificada que funciona com a estrutura atual

-- PASSO 1: Verificar estrutura da tabela company_users
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'company_users' 
ORDER BY ordinal_position;

-- PASSO 2: Transferir produtos para o usuário correto
UPDATE products 
SET created_by = (
  SELECT id FROM auth.users WHERE email = 'lojatem@gmail.com'
)
WHERE created_by = (
  SELECT id FROM auth.users WHERE email = 'loja-tem@gmail.com'
);

-- PASSO 3: Transferir vendas se existirem
UPDATE sales 
SET user_id = (
  SELECT id FROM auth.users WHERE email = 'lojatem@gmail.com'
)
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'loja-tem@gmail.com'
);

-- PASSO 4: Transferir formas de pagamento se existirem
UPDATE payment_methods 
SET created_by = (
  SELECT id FROM auth.users WHERE email = 'lojatem@gmail.com'
)
WHERE created_by = (
  SELECT id FROM auth.users WHERE email = 'loja-tem@gmail.com'
);

-- PASSO 5: Remover vinculação do usuário duplicado
DELETE FROM company_users 
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'loja-tem@gmail.com'
);

-- PASSO 6: Deletar o usuário duplicado
DELETE FROM auth.users 
WHERE email = 'loja-tem@gmail.com';

-- PASSO 7: Garantir vinculação do usuário correto (versão simples)
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

-- PASSO 8: Corrigir emails inválidos
UPDATE auth.users 
SET email = 'maria@gmail.com'
WHERE email = 'maria@empresa.com';

UPDATE auth.users 
SET email = 'bete@gmail.com'
WHERE email = 'bete@empresa.com';

-- PASSO 9: Invalidar sessões
UPDATE auth.users 
SET updated_at = NOW()
WHERE email IN (
  'maria@gmail.com',
  'bete@gmail.com', 
  'lojatem@gmail.com',
  'edicharlesbrito2009@hotmail.com'
);

-- PASSO 10: Verificar resultado
SELECT 
  'RESULTADO' as status,
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
ORDER BY u.email;

-- PASSO 11: Confirmar que duplicação foi resolvida
SELECT 
  'DUPLICACAO RESOLVIDA' as status,
  email,
  COUNT(*) as quantidade
FROM auth.users 
WHERE email LIKE '%lojatem%' OR email LIKE '%loja-tem%'
GROUP BY email;