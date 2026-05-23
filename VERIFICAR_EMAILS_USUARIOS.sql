-- ========================================
-- VERIFICAR EMAILS DE TODOS OS USUÁRIOS
-- ========================================

-- Ver todos os usuários cadastrados no Auth
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;

-- Ver usuários vinculados a empresas
SELECT 
    u.id,
    u.email,
    cu.company_id,
    c.name as company_name,
    cu.role,
    cu.active
FROM auth.users u
LEFT JOIN company_users cu ON cu.user_id = u.id
LEFT JOIN companies c ON c.id = cu.company_id
ORDER BY u.created_at DESC;

-- Verificar se existe email inválido "lojaabcd@empresa.com"
SELECT 
    id,
    email,
    created_at
FROM auth.users
WHERE email LIKE '%lojaabcd%'
OR email LIKE '%loja%';

-- ========================================
-- SOLUÇÃO: Se encontrar email inválido
-- ========================================

-- Para atualizar o email de um usuário, você precisa:
-- 1. Ir no Supabase Dashboard
-- 2. Authentication → Users
-- 3. Encontrar o usuário com email inválido
-- 4. Clicar em "..." → Edit User
-- 5. Alterar o email para um válido
-- 6. Salvar

-- OU deletar o usuário e criar novamente com email correto

-- ========================================
-- VERIFICAR EMPRESA "lojatem"
-- ========================================

SELECT 
    c.id,
    c.name,
    c.email,
    COUNT(cu.user_id) as total_usuarios
FROM companies c
LEFT JOIN company_users cu ON cu.company_id = c.id
WHERE c.name = 'lojatem'
GROUP BY c.id, c.name, c.email;

-- Ver todos os usuários da empresa lojatem
SELECT 
    u.email as user_email,
    cu.role,
    cu.active,
    s.name as seller_name,
    s.email as seller_email
FROM company_users cu
JOIN auth.users u ON u.id = cu.user_id
LEFT JOIN sellers s ON s.id = cu.seller_id
JOIN companies c ON c.id = cu.company_id
WHERE c.name = 'lojatem'
ORDER BY cu.role;
