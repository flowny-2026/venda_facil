-- ========================================
-- VERIFICAR PROBLEMA DE EXCLUSÃO DE EMPRESAS
-- ========================================

-- PASSO 1: Verificar se RLS está habilitado na tabela companies
SELECT 
  'RLS STATUS' as categoria,
  schemaname,
  tablename,
  rowsecurity as rls_habilitado
FROM pg_tables 
WHERE tablename = 'companies';

-- PASSO 2: Verificar políticas RLS da tabela companies
SELECT 
  'POLITICAS RLS' as categoria,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'companies'
ORDER BY cmd;

-- PASSO 3: Verificar chaves estrangeiras que referenciam companies
SELECT 
  'CHAVES ESTRANGEIRAS' as categoria,
  tc.table_name as tabela_dependente,
  kcu.column_name as coluna_dependente,
  ccu.table_name as tabela_referenciada,
  ccu.column_name as coluna_referenciada,
  tc.constraint_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND ccu.table_name = 'companies'
ORDER BY tc.table_name;

-- PASSO 4: Verificar quantos registros dependentes existem para cada empresa
SELECT 
  'DEPENDENCIAS POR EMPRESA' as categoria,
  c.id,
  c.name as empresa_nome,
  (SELECT COUNT(*) FROM company_users WHERE company_id = c.id) as usuarios,
  (SELECT COUNT(*) FROM products WHERE company_id = c.id) as produtos,
  (SELECT COUNT(*) FROM sales WHERE company_id = c.id) as vendas,
  (SELECT COUNT(*) FROM sellers WHERE company_id = c.id) as vendedores,
  (SELECT COUNT(*) FROM payment_methods WHERE company_id = c.id) as formas_pagamento
FROM companies c
ORDER BY c.name;

-- PASSO 5: Verificar se há empresas "fantasma" (sem usuários)
SELECT 
  'EMPRESAS SEM USUARIOS' as categoria,
  c.id,
  c.name,
  c.status,
  c.created_at
FROM companies c
LEFT JOIN company_users cu ON cu.company_id = c.id
WHERE cu.company_id IS NULL
ORDER BY c.created_at DESC;

-- PASSO 6: Testar permissão de DELETE (simular)
-- Esta query mostra se o usuário atual tem permissão de DELETE
SELECT 
  'PERMISSOES DELETE' as categoria,
  has_table_privilege(current_user, 'companies', 'DELETE') as pode_deletar,
  current_user as usuario_atual,
  session_user as sessao_usuario;

-- PASSO 7: Verificar se há triggers que podem estar impedindo a exclusão
SELECT 
  'TRIGGERS' as categoria,
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'companies'
ORDER BY trigger_name;

-- PASSO 8: Verificar últimas empresas criadas (podem ser de teste)
SELECT 
  'ULTIMAS EMPRESAS' as categoria,
  id,
  name,
  email,
  status,
  created_at,
  CASE 
    WHEN name ILIKE '%test%' OR name ILIKE '%teste%' THEN '🧪 TESTE'
    WHEN email ILIKE '%test%' OR email ILIKE '%exemplo%' THEN '🧪 TESTE'
    ELSE '✅ REAL'
  END as tipo
FROM companies 
ORDER BY created_at DESC 
LIMIT 10;