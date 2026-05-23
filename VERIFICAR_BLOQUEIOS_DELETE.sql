-- ========================================
-- VERIFICAR BLOQUEIOS DE DELETE
-- ========================================

-- PASSO 1: Verificar se RLS está habilitado e políticas DELETE
SELECT 
  'RLS E POLITICAS' as categoria,
  t.tablename,
  t.rowsecurity as rls_habilitado,
  COALESCE(p.policyname, 'SEM POLITICA DELETE') as politica_delete,
  COALESCE(p.qual, 'N/A') as condicao_politica
FROM pg_tables t
LEFT JOIN pg_policies p ON p.tablename = t.tablename AND p.cmd = 'DELETE'
WHERE t.tablename = 'companies'
ORDER BY t.tablename;

-- PASSO 2: Verificar todas as políticas da tabela companies
SELECT 
  'TODAS POLITICAS COMPANIES' as categoria,
  policyname,
  cmd,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'companies'
ORDER BY cmd, policyname;

-- PASSO 3: Verificar triggers que podem estar impedindo DELETE
SELECT 
  'TRIGGERS COMPANIES' as categoria,
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'companies'
  AND event_manipulation = 'DELETE'
ORDER BY trigger_name;

-- PASSO 4: Verificar permissões do usuário atual
SELECT 
  'PERMISSOES USUARIO' as categoria,
  current_user as usuario,
  session_user as sessao,
  has_table_privilege('companies', 'DELETE') as pode_deletar_companies,
  has_table_privilege('companies', 'SELECT') as pode_selecionar_companies;

-- PASSO 5: Tentar simular DELETE (sem executar)
EXPLAIN (ANALYZE false, BUFFERS false, COSTS false) 
DELETE FROM companies 
WHERE id = 'd21fd5fb-d1d3-461d-98f4-8c7dc380099c';

-- PASSO 6: Verificar se há chaves estrangeiras ainda não mapeadas
SELECT 
  'CHAVES ESTRANGEIRAS NAO MAPEADAS' as categoria,
  tc.table_name as tabela_dependente,
  kcu.column_name as coluna_dependente,
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
  AND tc.table_name NOT IN ('company_users', 'products', 'sales', 'sellers', 'payment_methods')
ORDER BY tc.table_name;

-- PASSO 7: Verificar se a empresa existe e suas dependências atuais
SELECT 
  'STATUS ATUAL LOJALOLO' as categoria,
  c.id,
  c.name,
  c.status,
  (SELECT COUNT(*) FROM company_users WHERE company_id = c.id) as usuarios,
  (SELECT COUNT(*) FROM products WHERE company_id = c.id) as produtos,
  (SELECT COUNT(*) FROM sales WHERE company_id = c.id) as vendas,
  (SELECT COUNT(*) FROM sellers WHERE company_id = c.id) as vendedores,
  (SELECT COUNT(*) FROM payment_methods WHERE company_id = c.id) as formas_pagamento
FROM companies c
WHERE c.id = 'd21fd5fb-d1d3-461d-98f4-8c7dc380099c';

-- PASSO 8: Verificar se há funções ou procedures que podem estar interferindo
SELECT 
  'FUNCOES RELACIONADAS' as categoria,
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines 
WHERE routine_definition ILIKE '%companies%'
  AND routine_type IN ('FUNCTION', 'PROCEDURE')
ORDER BY routine_name;