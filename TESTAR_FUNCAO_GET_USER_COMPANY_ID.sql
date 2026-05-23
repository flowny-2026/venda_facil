-- ========================================
-- TESTAR FUNÇÃO get_user_company_id()
-- ========================================

-- 1. VERIFICAR SE A FUNÇÃO EXISTE
SELECT 
  'FUNCAO EXISTE?' as pergunta,
  routine_name,
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'get_user_company_id'
AND routine_schema = 'public';

-- 2. TESTAR A FUNÇÃO COM USUÁRIOS NICOLLY E AMANDA
-- Simular o que a função retorna para cada usuário
SELECT 
  'TESTE NICOLLY' as usuario,
  u.email,
  cu.company_id,
  c.name as company_name
FROM auth.users u
JOIN company_users cu ON cu.user_id = u.id
JOIN companies c ON cu.company_id = c.id
WHERE u.email = 'nicolly@empresa.com';

SELECT 
  'TESTE AMANDA' as usuario,
  u.email,
  cu.company_id,
  c.name as company_name
FROM auth.users u
JOIN company_users cu ON cu.user_id = u.id
JOIN companies c ON cu.company_id = c.id
WHERE u.email = 'amanda@empresa.com';

-- 3. VERIFICAR EMPRESA DA VENDA R$ 199,00
SELECT 
  'EMPRESA VENDA 199' as categoria,
  s.id as sale_id,
  s.company_id as sale_company_id,
  c.name as company_name,
  s.seller_id,
  sel.name as seller_name,
  sel.company_id as seller_company_id
FROM sales s
LEFT JOIN companies c ON s.company_id = c.id
LEFT JOIN sellers sel ON s.seller_id = sel.id
WHERE s.total_amount = 199.00;

-- 4. COMPARAR company_id
SELECT 
  'COMPARACAO' as categoria,
  (SELECT cu.company_id FROM auth.users u
   JOIN company_users cu ON cu.user_id = u.id
   WHERE u.email = 'nicolly@empresa.com' LIMIT 1) as nicolly_company_id,
  (SELECT s.company_id FROM sales s WHERE s.total_amount = 199.00 LIMIT 1) as venda_company_id,
  CASE 
    WHEN (SELECT cu.company_id FROM auth.users u
          JOIN company_users cu ON cu.user_id = u.id
          WHERE u.email = 'nicolly@empresa.com' LIMIT 1) = 
         (SELECT s.company_id FROM sales s WHERE s.total_amount = 199.00 LIMIT 1)
    THEN '🚨 MESMA EMPRESA - Por isso Nicolly vê!'
    ELSE '✅ EMPRESAS DIFERENTES - RLS deveria bloquear'
  END as diagnostico;