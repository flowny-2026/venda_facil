-- ========================================
-- TESTE LOGIN ESPECÍFICO - NICOLLY E AMANDA
-- ========================================

-- 1. VERIFICAR SE OS USUÁRIOS EXISTEM NO AUTH
SELECT 
  'USUARIOS NO AUTH' as categoria,
  email,
  id,
  created_at,
  email_confirmed_at,
  last_sign_in_at,
  CASE 
    WHEN last_sign_in_at IS NOT NULL THEN '✅ JÁ FEZ LOGIN'
    ELSE '❌ NUNCA FEZ LOGIN'
  END as status_login
FROM auth.users 
WHERE email IN ('nicolly@empresa.com', 'amanda@empresa.com')
ORDER BY email;

-- 2. VERIFICAR VINCULAÇÃO COMPLETA
SELECT 
  'VINCULACAO COMPLETA' as categoria,
  u.email,
  cu.user_id,
  cu.company_id,
  cu.seller_id,
  cu.role,
  cu.active,
  cu.can_access_pdv,
  s.name as seller_name,
  c.name as company_name
FROM auth.users u
LEFT JOIN company_users cu ON cu.user_id = u.id
LEFT JOIN sellers s ON cu.seller_id = s.id
LEFT JOIN companies c ON cu.company_id = c.id
WHERE u.email IN ('nicolly@empresa.com', 'amanda@empresa.com')
ORDER BY u.email;

-- 3. VERIFICAR SE A EMPRESA TEM ACESSO INDIVIDUAL
SELECT 
  'TIPO ACESSO EMPRESA' as categoria,
  name,
  access_type,
  status,
  max_users
FROM companies 
WHERE name ILIKE '%liz%' OR name ILIKE '%brito%';

-- 4. VERIFICAR POLÍTICAS RLS QUE PODEM ESTAR BLOQUEANDO
SELECT 
  'POLITICAS RLS' as categoria,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('company_users', 'sellers', 'companies')
ORDER BY tablename, policyname;

-- 5. TESTE DE FUNÇÃO GET_USER_COMPANY_ID
SELECT 
  'TESTE FUNCOES RLS' as categoria,
  'Testando se as funções RLS funcionam corretamente' as descricao;

-- Simular login de cada usuário
DO $$
DECLARE
  nicolly_user_id UUID;
  amanda_user_id UUID;
BEGIN
  -- Buscar IDs dos usuários
  SELECT id INTO nicolly_user_id FROM auth.users WHERE email = 'nicolly@empresa.com';
  SELECT id INTO amanda_user_id FROM auth.users WHERE email = 'amanda@empresa.com';
  
  -- Mostrar resultados
  RAISE NOTICE 'Nicolly ID: %', nicolly_user_id;
  RAISE NOTICE 'Amanda ID: %', amanda_user_id;
END $$;