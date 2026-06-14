-- =====================================================
-- CORREÇÃO DE SEGURANÇA URGENTE - VIEWS UNRESTRICTED
-- =====================================================
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- IMPORTANTE: Views não têm RLS direto como tabelas.
-- A solução é recriar as views como tabelas normais COM RLS
-- OU proteger via políticas nas tabelas base.

-- Verificar quais views existem
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'v_%';

-- =====================================================
-- OPÇÃO 1: Proteger com funções de segurança
-- =====================================================

-- Se as views são usadas no código, vamos criar políticas
-- nas tabelas base (company_users) para garantir segurança

-- Verificar RLS na tabela company_users
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'company_users';

-- Habilitar RLS na tabela company_users se não estiver
ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;

-- Verificar políticas existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'company_users';

-- =====================================================
-- OPÇÃO 2: Deletar views desnecessárias
-- =====================================================

-- Se as views não são mais usadas, DELETAR:
-- DROP VIEW IF EXISTS v_company_users_emails CASCADE;
-- DROP VIEW IF EXISTS v_company_users_full CASCADE;

-- ⚠️ NÃO EXECUTE O DROP ACIMA SEM CONFIRMAR QUE NÃO SÃO USADAS!

-- =====================================================
-- OPÇÃO 3: Recriar views com segurança
-- =====================================================

-- Exemplo: Se a view v_company_users_emails existe,
-- podemos recriá-la com restrições de segurança

-- Primeiro vamos ver a definição atual
SELECT definition 
FROM pg_views 
WHERE viewname LIKE 'v_company_users%';

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Após executar as correções, verifique novamente:
SELECT 
  table_name,
  table_type,
  CASE 
    WHEN table_type = 'BASE TABLE' THEN 
      (SELECT rowsecurity FROM pg_tables WHERE tablename = table_name AND schemaname = 'public')
    ELSE NULL
  END as rls_enabled
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name LIKE 'v_%' OR table_name = 'company_users')
ORDER BY table_name;

-- =====================================================
-- RESULTADO ESPERADO:
-- Todas as tabelas devem ter rls_enabled = TRUE
-- Views devem ser eliminadas ou protegidas via tabelas base
-- =====================================================
