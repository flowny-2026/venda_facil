-- =====================================================
-- CORRIGIR SECURITY DEFINER DAS VIEWS
-- =====================================================
-- Views com SECURITY DEFINER ignoram RLS!
-- Precisamos recriar como SECURITY INVOKER
-- =====================================================

-- =====================================================
-- PASSO 1: Ver definição atual das views
-- =====================================================

SELECT 
  schemaname,
  viewname,
  definition
FROM pg_views
WHERE schemaname = 'public'
AND viewname LIKE 'v_company_%'
ORDER BY viewname;

-- Copie as definições que aparecerem acima!

-- =====================================================
-- PASSO 2: Recriar v_company_users_emails
-- =====================================================

DROP VIEW IF EXISTS v_company_users_emails CASCADE;

CREATE VIEW v_company_users_emails 
WITH (security_invoker = true)  -- ✅ USAR PERMISSÕES DO USUÁRIO
AS
SELECT 
  cu.user_id,
  cu.company_id,
  cu.role,
  cu.active,
  au.email
FROM company_users cu
INNER JOIN auth.users au ON cu.user_id = au.id;

-- Conceder SELECT apenas para authenticated
GRANT SELECT ON v_company_users_emails TO authenticated;
REVOKE ALL ON v_company_users_emails FROM anon;
REVOKE ALL ON v_company_users_emails FROM public;

-- =====================================================
-- PASSO 3: Recriar v_company_users_full
-- =====================================================

DROP VIEW IF EXISTS v_company_users_full CASCADE;

CREATE VIEW v_company_users_full
WITH (security_invoker = true)  -- ✅ USAR PERMISSÕES DO USUÁRIO
AS
SELECT 
  cu.user_id,
  cu.company_id,
  cu.role,
  cu.seller_id,
  cu.active,
  cu.created_at,
  cu.can_access_pdv,
  cu.can_view_reports,
  cu.can_manage_products,
  cu.can_manage_sellers,
  au.email,
  au.email_confirmed_at,
  au.created_at as user_created_at,
  c.name as company_name
FROM company_users cu
INNER JOIN auth.users au ON cu.user_id = au.id
INNER JOIN companies c ON cu.company_id = c.id;

-- Conceder SELECT apenas para authenticated
GRANT SELECT ON v_company_users_full TO authenticated;
REVOKE ALL ON v_company_users_full FROM anon;
REVOKE ALL ON v_company_users_full FROM public;

-- =====================================================
-- PASSO 4: Recriar v_company_users_with_seller
-- =====================================================

DROP VIEW IF EXISTS v_company_users_with_seller CASCADE;

CREATE VIEW v_company_users_with_seller
WITH (security_invoker = true)  -- ✅ USAR PERMISSÕES DO USUÁRIO
AS
SELECT 
  cu.user_id,
  cu.company_id,
  cu.role,
  cu.seller_id,
  cu.active,
  au.email,
  s.name as seller_name
FROM company_users cu
INNER JOIN auth.users au ON cu.user_id = au.id
LEFT JOIN sellers s ON cu.seller_id = s.id;

-- Conceder SELECT apenas para authenticated
GRANT SELECT ON v_company_users_with_seller TO authenticated;
REVOKE ALL ON v_company_users_with_seller FROM anon;
REVOKE ALL ON v_company_users_with_seller FROM public;

-- =====================================================
-- PASSO 5: Verificar se está correto
-- =====================================================

-- Verificar se views foram criadas com security_invoker
SELECT 
  schemaname,
  viewname,
  viewowner,
  CASE 
    WHEN definition LIKE '%security_invoker%' THEN 'SECURITY INVOKER ✅'
    ELSE 'SECURITY DEFINER ❌'
  END as security_mode
FROM pg_views
WHERE schemaname = 'public'
AND viewname LIKE 'v_company_%'
ORDER BY viewname;

-- Verificar permissões
SELECT 
  table_name,
  grantee,
  string_agg(privilege_type, ', ' ORDER BY privilege_type) as permissions
FROM information_schema.table_privileges
WHERE table_schema = 'public'
AND table_name LIKE 'v_company_%'
AND grantee IN ('anon', 'authenticated', 'public')
GROUP BY table_name, grantee
ORDER BY table_name, grantee;

-- =====================================================
-- RESULTADO ESPERADO:
-- ✅ Todas as views com "SECURITY INVOKER ✅"
-- ✅ Apenas 'authenticated' com 'SELECT'
-- ❌ Nenhuma linha com 'anon' ou 'public'
-- =====================================================

-- =====================================================
-- IMPORTANTE: GARANTIR RLS NA TABELA BASE
-- =====================================================

-- Habilitar RLS em company_users se não estiver
ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;

-- Criar política para usuários autenticados verem apenas da própria empresa
DROP POLICY IF EXISTS "Users can view own company users" ON company_users;

CREATE POLICY "Users can view own company users"
ON company_users
FOR SELECT
TO authenticated
USING (
  -- Super admin vê tudo
  EXISTS (
    SELECT 1 FROM company_users 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin'
  )
  OR
  -- Outros veem apenas da própria empresa
  company_id IN (
    SELECT company_id 
    FROM company_users 
    WHERE user_id = auth.uid()
  )
);

-- Verificar RLS está ativo
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'company_users';

-- =====================================================
-- TESTE FINAL
-- =====================================================

-- Este SELECT deve retornar apenas dados da empresa do usuário logado
-- (se não for super_admin)
SELECT * FROM v_company_users_emails LIMIT 5;

-- =====================================================
-- ✅ SEGURANÇA COMPLETA:
-- 1. Views com SECURITY INVOKER (respeitam RLS)
-- 2. Apenas authenticated pode SELECT
-- 3. RLS ativo na tabela base
-- 4. Política limita acesso por empresa
-- =====================================================
