-- ========================================
-- TESTAR EXCLUSÃO DE EMPRESA ESPECÍFICA
-- ========================================
-- Vamos testar com a empresa "lojalolo" que parece ser de teste

-- PASSO 1: Identificar a empresa de teste
SELECT 
  'EMPRESA TESTE' as info,
  id,
  name,
  email,
  status,
  created_at
FROM companies 
WHERE name = 'lojalolo' OR email = 'lolo@empresa.com';

-- PASSO 2: Verificar todas as dependências desta empresa (versão simplificada)
SELECT 
  'DEPENDENCIAS LOJALOLO' as categoria,
  'company_users' as tabela,
  COUNT(*) as quantidade
FROM company_users 
WHERE company_id = 'd21fd5fb-d1d3-461d-98f4-8c7dc380099c'

UNION ALL

SELECT 
  'DEPENDENCIAS LOJALOLO' as categoria,
  'products' as tabela,
  COUNT(*) as quantidade
FROM products 
WHERE company_id = 'd21fd5fb-d1d3-461d-98f4-8c7dc380099c'

UNION ALL

SELECT 
  'DEPENDENCIAS LOJALOLO' as categoria,
  'sales' as tabela,
  COUNT(*) as quantidade
FROM sales 
WHERE company_id = 'd21fd5fb-d1d3-461d-98f4-8c7dc380099c'

UNION ALL

SELECT 
  'DEPENDENCIAS LOJALOLO' as categoria,
  'sellers' as tabela,
  COUNT(*) as quantidade
FROM sellers 
WHERE company_id = 'd21fd5fb-d1d3-461d-98f4-8c7dc380099c'

UNION ALL

SELECT 
  'DEPENDENCIAS LOJALOLO' as categoria,
  'payment_methods' as tabela,
  COUNT(*) as quantidade
FROM payment_methods 
WHERE company_id = 'd21fd5fb-d1d3-461d-98f4-8c7dc380099c';

-- PASSO 3: Contar dependências detalhadamente
SELECT 
  'CONTAGEM DEPENDENCIAS' as categoria,
  c.name as empresa,
  (SELECT COUNT(*) FROM company_users WHERE company_id = c.id) as usuarios,
  (SELECT COUNT(*) FROM products WHERE company_id = c.id) as produtos,
  (SELECT COUNT(*) FROM sales WHERE company_id = c.id) as vendas,
  (SELECT COUNT(*) FROM sellers WHERE company_id = c.id) as vendedores,
  (SELECT COUNT(*) FROM payment_methods WHERE company_id = c.id) as formas_pagamento
FROM companies c
WHERE c.name = 'lojalolo';

-- PASSO 4: Verificar políticas RLS que podem estar bloqueando
SELECT 
  'POLITICAS RLS' as categoria,
  tablename,
  policyname,
  cmd,
  roles,
  qual
FROM pg_policies 
WHERE tablename IN ('companies', 'company_users', 'products', 'sales', 'sellers', 'payment_methods')
  AND cmd = 'DELETE'
ORDER BY tablename, policyname;

-- PASSO 5: Testar permissão de DELETE diretamente
SELECT 
  'TESTE PERMISSAO' as categoria,
  has_table_privilege('companies', 'DELETE') as pode_deletar_companies,
  has_table_privilege('company_users', 'DELETE') as pode_deletar_company_users,
  current_user as usuario_atual;

-- PASSO 6: Verificar se há triggers que podem estar impedindo
SELECT 
  'TRIGGERS' as categoria,
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table IN ('companies', 'company_users', 'products', 'sales', 'sellers', 'payment_methods')
  AND event_manipulation = 'DELETE'
ORDER BY event_object_table, trigger_name;

-- PASSO 7: Simular exclusão (SEM EXECUTAR) para ver onde falha
-- Esta query mostra o que SERIA deletado, mas não deleta nada
SELECT 
  'SIMULACAO EXCLUSAO' as categoria,
  'company_users' as tabela,
  COUNT(*) as registros_afetados
FROM company_users 
WHERE company_id = 'd21fd5fb-d1d3-461d-98f4-8c7dc380099c'

UNION ALL

SELECT 
  'SIMULACAO EXCLUSAO' as categoria,
  'products' as tabela,
  COUNT(*) as registros_afetados
FROM products 
WHERE company_id = 'd21fd5fb-d1d3-461d-98f4-8c7dc380099c'

UNION ALL

SELECT 
  'SIMULACAO EXCLUSAO' as categoria,
  'sales' as tabela,
  COUNT(*) as registros_afetados
FROM sales 
WHERE company_id = 'd21fd5fb-d1d3-461d-98f4-8c7dc380099c'

UNION ALL

SELECT 
  'SIMULACAO EXCLUSAO' as categoria,
  'sellers' as tabela,
  COUNT(*) as registros_afetados
FROM sellers 
WHERE company_id = 'd21fd5fb-d1d3-461d-98f4-8c7dc380099c'

UNION ALL

SELECT 
  'SIMULACAO EXCLUSAO' as categoria,
  'payment_methods' as tabela,
  COUNT(*) as registros_afetados
FROM payment_methods 
WHERE company_id = 'd21fd5fb-d1d3-461d-98f4-8c7dc380099c';