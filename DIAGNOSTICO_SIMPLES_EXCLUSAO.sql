-- ========================================
-- DIAGNÓSTICO SIMPLES - PROBLEMA DE EXCLUSÃO
-- ========================================

-- PASSO 1: Verificar empresas existentes
SELECT 
  'EMPRESAS ATUAIS' as categoria,
  id,
  name,
  email,
  status
FROM companies 
ORDER BY name;

-- PASSO 2: Verificar dependências da empresa lojalolo
SELECT 
  'DEPENDENCIAS LOJALOLO' as categoria,
  'company_users' as tabela,
  COUNT(*) as quantidade
FROM company_users 
WHERE company_id = 'd21fd5fb-d1d3-461d-98f4-8c7dc380099c'

UNION ALL

SELECT 
  'DEPENDENCIAS LOJALOLO',
  'products',
  COUNT(*)
FROM products 
WHERE company_id = 'd21fd5fb-d1d3-461d-98f4-8c7dc380099c'

UNION ALL

SELECT 
  'DEPENDENCIAS LOJALOLO',
  'sales',
  COUNT(*)
FROM sales 
WHERE company_id = 'd21fd5fb-d1d3-461d-98f4-8c7dc380099c'

UNION ALL

SELECT 
  'DEPENDENCIAS LOJALOLO',
  'sellers',
  COUNT(*)
FROM sellers 
WHERE company_id = 'd21fd5fb-d1d3-461d-98f4-8c7dc380099c'

UNION ALL

SELECT 
  'DEPENDENCIAS LOJALOLO',
  'payment_methods',
  COUNT(*)
FROM payment_methods 
WHERE company_id = 'd21fd5fb-d1d3-461d-98f4-8c7dc380099c';

-- PASSO 3: Verificar políticas RLS que podem bloquear DELETE
SELECT 
  'POLITICAS DELETE' as categoria,
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE tablename IN ('companies', 'company_users', 'products', 'sales', 'sellers', 'payment_methods')
  AND cmd = 'DELETE'
ORDER BY tablename;

-- PASSO 4: Verificar permissões do usuário atual
SELECT 
  'PERMISSOES' as categoria,
  'companies' as tabela,
  has_table_privilege('companies', 'DELETE') as pode_deletar

UNION ALL

SELECT 
  'PERMISSOES',
  'company_users',
  has_table_privilege('company_users', 'DELETE')

UNION ALL

SELECT 
  'PERMISSOES',
  'products',
  has_table_privilege('products', 'DELETE')

UNION ALL

SELECT 
  'PERMISSOES',
  'sales',
  has_table_privilege('sales', 'DELETE')

UNION ALL

SELECT 
  'PERMISSOES',
  'sellers',
  has_table_privilege('sellers', 'DELETE')

UNION ALL

SELECT 
  'PERMISSOES',
  'payment_methods',
  has_table_privilege('payment_methods', 'DELETE');

-- PASSO 5: Verificar se RLS está habilitado
SELECT 
  'RLS STATUS' as categoria,
  tablename,
  rowsecurity as rls_habilitado
FROM pg_tables 
WHERE tablename IN ('companies', 'company_users', 'products', 'sales', 'sellers', 'payment_methods')
ORDER BY tablename;