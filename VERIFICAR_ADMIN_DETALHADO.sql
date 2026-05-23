-- ========================================
-- VERIFICAÇÃO DETALHADA DO SUPER ADMIN
-- ========================================

-- 1. Ver os super_admins com TODOS os detalhes
SELECT 
    u.id as user_id,
    u.email,
    u.email_confirmed_at,
    u.last_sign_in_at,
    cu.role,
    cu.active,
    cu.company_id,
    c.name as company_name
FROM auth.users u
JOIN company_users cu ON cu.user_id = u.id
LEFT JOIN companies c ON c.id = cu.company_id
WHERE cu.role = 'super_admin'
ORDER BY u.email;

-- 2. Verificar se há múltiplas entradas para o mesmo usuário
SELECT 
    user_id,
    COUNT(*) as total_entries,
    STRING_AGG(role::text, ', ') as roles
FROM company_users
WHERE user_id IN (
    SELECT user_id 
    FROM company_users 
    WHERE role = 'super_admin'
)
GROUP BY user_id
HAVING COUNT(*) > 1;

-- 3. Ver a estrutura exata da tabela company_users
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'company_users'
ORDER BY ordinal_position;

-- 4. Verificar se há constraint de UNIQUE que pode estar causando problema
SELECT
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'company_users'
ORDER BY tc.constraint_type, kcu.column_name;
