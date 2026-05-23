-- ========================================
-- TESTAR get_user_company_id() DETALHADO
-- ========================================

-- 1. VER CÓDIGO DA FUNÇÃO
SELECT 
  'CODIGO FUNCAO' as categoria,
  routine_name,
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'get_user_company_id'
AND routine_schema = 'public';

-- 2. SIMULAR O QUE A FUNÇÃO RETORNA PARA NICOLLY
SELECT 
  'SIMULACAO NICOLLY' as categoria,
  u.email,
  cu.company_id,
  c.name as company_name,
  cu.active,
  cu.role
FROM auth.users u
JOIN company_users cu ON cu.user_id = u.id
JOIN companies c ON cu.company_id = c.id
WHERE u.email = 'nicolly@empresa.com';

-- 3. VERIFICAR SE NICOLLY TEM MÚLTIPLAS VINCULAÇÕES
SELECT 
  'MULTIPLAS VINCULACOES NICOLLY' as categoria,
  COUNT(*) as total_vinculacoes,
  STRING_AGG(c.name, ', ') as empresas
FROM auth.users u
JOIN company_users cu ON cu.user_id = u.id
JOIN companies c ON cu.company_id = c.id
WHERE u.email = 'nicolly@empresa.com';

-- 4. TODAS AS VINCULAÇÕES DE NICOLLY
SELECT 
  'TODAS VINCULACOES NICOLLY' as categoria,
  cu.company_id,
  c.name as company_name,
  cu.role,
  cu.active,
  cu.created_at
FROM auth.users u
JOIN company_users cu ON cu.user_id = u.id
JOIN companies c ON cu.company_id = c.id
WHERE u.email = 'nicolly@empresa.com'
ORDER BY cu.created_at;