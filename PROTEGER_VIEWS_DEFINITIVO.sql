-- =====================================================
-- PROTEÇÃO DE VIEWS - SOLUÇÃO DEFINITIVA
-- =====================================================
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- IMPORTANTE: Views herdam as permissões das tabelas base
-- Precisamos garantir que as tabelas base tenham RLS

-- =====================================================
-- PASSO 1: Verificar e habilitar RLS nas tabelas base
-- =====================================================

-- Habilitar RLS na company_users (se não estiver)
ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS na auth.users (gerenciada pelo Supabase, mas vamos garantir)
-- NOTA: auth.users já tem proteção automática do Supabase

-- =====================================================
-- PASSO 2: Recriar a view com segurança
-- =====================================================

-- Deletar view antiga se existir
DROP VIEW IF EXISTS v_company_users_emails CASCADE;

-- Recriar view com JOIN seguro
CREATE OR REPLACE VIEW v_company_users_emails AS
SELECT 
  cu.user_id,
  cu.company_id,
  cu.role,
  cu.active,
  au.email
FROM company_users cu
INNER JOIN auth.users au ON cu.user_id = au.id
WHERE cu.active = true;

-- Conceder permissão de SELECT apenas para usuários autenticados
GRANT SELECT ON v_company_users_emails TO authenticated;
REVOKE SELECT ON v_company_users_emails FROM anon;
REVOKE SELECT ON v_company_users_emails FROM public;

-- =====================================================
-- PASSO 3: Criar políticas de segurança na view
-- =====================================================

-- Views não têm RLS direto, mas podemos criar uma função
-- que valida o acesso antes de retornar dados

-- Função para verificar se o usuário é super_admin
CREATE OR REPLACE FUNCTION is_super_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM company_users 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PASSO 4: Proteger com políticas RLS na tabela base
-- =====================================================

-- Super admins podem ver todos os usuários
CREATE POLICY "Super admins podem ver todos os company_users"
ON company_users
FOR SELECT
TO authenticated
USING (
  is_super_admin_user()
);

-- Gerentes podem ver usuários da própria empresa
CREATE POLICY "Gerentes podem ver usuarios da propria empresa"
ON company_users
FOR SELECT
TO authenticated
USING (
  company_id IN (
    SELECT company_id 
    FROM company_users 
    WHERE user_id = auth.uid()
  )
);

-- =====================================================
-- PASSO 5: Verificar outra view se existir
-- =====================================================

-- Se existir v_company_users_full ou similar
DROP VIEW IF EXISTS v_company_users_full CASCADE;

-- Recriar se necessário (adapte conforme sua necessidade)
CREATE OR REPLACE VIEW v_company_users_full AS
SELECT 
  cu.*,
  au.email,
  au.email_confirmed_at,
  au.created_at as user_created_at,
  c.name as company_name
FROM company_users cu
INNER JOIN auth.users au ON cu.user_id = au.id
INNER JOIN companies c ON cu.company_id = c.id
WHERE cu.active = true;

-- Proteger também
GRANT SELECT ON v_company_users_full TO authenticated;
REVOKE SELECT ON v_company_users_full FROM anon;
REVOKE SELECT ON v_company_users_full FROM public;

-- =====================================================
-- PASSO 6: VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar políticas criadas
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE tablename = 'company_users'
ORDER BY policyname;

-- Verificar permissões nas views
SELECT 
  table_name,
  privilege_type,
  grantee
FROM information_schema.table_privileges
WHERE table_schema = 'public'
AND table_name LIKE 'v_company_%'
ORDER BY table_name, grantee;

-- =====================================================
-- RESULTADO ESPERADO:
-- ✅ company_users com RLS habilitado
-- ✅ Políticas criadas para super_admin e gerente
-- ✅ Views protegidas (apenas authenticated, sem anon/public)
-- ✅ Alertas UNRESTRICTED devem desaparecer
-- =====================================================

-- =====================================================
-- REVOGAR TODAS AS PERMISSÕES PERIGOSAS - URGENTE
-- =====================================================

-- REVOGAR TUDO de ANON (usuários não autenticados)
REVOKE ALL ON v_company_users_emails FROM anon;
REVOKE ALL ON v_company_users_full FROM anon;
REVOKE ALL ON v_company_users_with_seller FROM anon;

-- REVOGAR TUDO de PUBLIC
REVOKE ALL ON v_company_users_emails FROM public;
REVOKE ALL ON v_company_users_full FROM public;
REVOKE ALL ON v_company_users_with_seller FROM public;

-- Conceder APENAS SELECT para AUTHENTICATED (usuários logados)
GRANT SELECT ON v_company_users_emails TO authenticated;
GRANT SELECT ON v_company_users_full TO authenticated;
GRANT SELECT ON v_company_users_with_seller TO authenticated;

-- =====================================================
-- VERIFICAÇÃO: Executar para confirmar
-- =====================================================

SELECT 
  table_name,
  privilege_type,
  grantee
FROM information_schema.table_privileges
WHERE table_schema = 'public'
AND table_name LIKE 'v_company_%'
AND grantee IN ('anon', 'authenticated', 'public')
ORDER BY table_name, grantee, privilege_type;

-- =====================================================
-- RESULTADO ESPERADO:
-- ✅ anon: NENHUMA permissão
-- ✅ public: NENHUMA permissão  
-- ✅ authenticated: APENAS SELECT
-- =====================================================
