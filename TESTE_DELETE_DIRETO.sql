-- ========================================
-- TESTE DIRETO DE DELETE
-- ========================================
-- Vamos testar deletar a empresa lojalolo passo a passo

-- ANTES: Verificar se a empresa existe
SELECT 
  'ANTES' as momento,
  COUNT(*) as empresas_total,
  SUM(CASE WHEN name = 'lojalolo' THEN 1 ELSE 0 END) as lojalolo_existe
FROM companies;

-- TESTE 1: Tentar deletar diretamente (vai falhar se houver dependências)
-- DELETE FROM companies WHERE name = 'lojalolo';
-- (Comentado para não executar ainda)

-- TESTE 2: Verificar o que impede a exclusão
-- Listar todas as chaves estrangeiras que referenciam companies
SELECT 
  'CHAVES ESTRANGEIRAS' as tipo,
  tc.table_name as tabela_dependente,
  kcu.column_name as coluna_dependente,
  tc.constraint_name as nome_constraint
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

-- TESTE 3: Contar registros que dependem da empresa lojalolo
SELECT 
  'CONTAGEM DEPENDENCIAS' as tipo,
  (SELECT COUNT(*) FROM company_users WHERE company_id = 'd21fd5fb-d1d3-461d-98f4-8c7dc380099c') as company_users,
  (SELECT COUNT(*) FROM products WHERE company_id = 'd21fd5fb-d1d3-461d-98f4-8c7dc380099c') as products,
  (SELECT COUNT(*) FROM sales WHERE company_id = 'd21fd5fb-d1d3-461d-98f4-8c7dc380099c') as sales,
  (SELECT COUNT(*) FROM sellers WHERE company_id = 'd21fd5fb-d1d3-461d-98f4-8c7dc380099c') as sellers,
  (SELECT COUNT(*) FROM payment_methods WHERE company_id = 'd21fd5fb-d1d3-461d-98f4-8c7dc380099c') as payment_methods;

-- TESTE 4: Se não houver dependências, tentar deletar
-- Só execute este bloco se todas as contagens acima forem 0
/*
DELETE FROM companies 
WHERE id = 'd21fd5fb-d1d3-461d-98f4-8c7dc380099c'
  AND NOT EXISTS (SELECT 1 FROM company_users WHERE company_id = 'd21fd5fb-d1d3-461d-98f4-8c7dc380099c')
  AND NOT EXISTS (SELECT 1 FROM products WHERE company_id = 'd21fd5fb-d1d3-461d-98f4-8c7dc380099c')
  AND NOT EXISTS (SELECT 1 FROM sales WHERE company_id = 'd21fd5fb-d1d3-461d-98f4-8c7dc380099c')
  AND NOT EXISTS (SELECT 1 FROM sellers WHERE company_id = 'd21fd5fb-d1d3-461d-98f4-8c7dc380099c')
  AND NOT EXISTS (SELECT 1 FROM payment_methods WHERE company_id = 'd21fd5fb-d1d3-461d-98f4-8c7dc380099c');
*/

-- DEPOIS: Verificar se foi deletada
SELECT 
  'DEPOIS' as momento,
  COUNT(*) as empresas_total,
  SUM(CASE WHEN name = 'lojalolo' THEN 1 ELSE 0 END) as lojalolo_existe
FROM companies;