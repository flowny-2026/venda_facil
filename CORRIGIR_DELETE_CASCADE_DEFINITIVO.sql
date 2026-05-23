-- ========================================
-- CORRIGIR DELETE CASCADE - DEFINITIVO
-- ========================================
-- O problema é a ordem de exclusão das tabelas
-- Precisamos deletar na ordem correta para respeitar as foreign keys

-- 1. VERIFICAR DEPENDÊNCIAS ATUAIS
SELECT 
  'DEPENDENCIAS' as categoria,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND (tc.table_name IN ('companies', 'company_users', 'sellers', 'sales', 'products', 'payment_methods')
       OR ccu.table_name IN ('companies', 'company_users', 'sellers'))
ORDER BY tc.table_name;

-- 2. RECRIAR A FUNÇÃO COM ORDEM CORRETA
CREATE OR REPLACE FUNCTION delete_company_cascade(company_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  company_uuid UUID;
  sales_count INT := 0;
  products_count INT := 0;
  payment_methods_count INT := 0;
  sellers_count INT := 0;
  users_count INT := 0;
  total_deleted INT := 0;
BEGIN
  -- Buscar o ID da empresa
  SELECT id INTO company_uuid 
  FROM companies 
  WHERE name = company_name;
  
  IF company_uuid IS NULL THEN
    RETURN '❌ Empresa não encontrada: ' || company_name;
  END IF;
  
  -- ORDEM CORRETA DE EXCLUSÃO (do mais dependente para o menos dependente)
  
  -- 1. Deletar vendas (sales) - dependem de sellers e company_users
  DELETE FROM sales 
  WHERE seller_id IN (
    SELECT id FROM sellers WHERE company_id = company_uuid
  );
  GET DIAGNOSTICS sales_count = ROW_COUNT;
  
  -- 2. Deletar produtos (products) - dependem de companies
  DELETE FROM products WHERE company_id = company_uuid;
  GET DIAGNOSTICS products_count = ROW_COUNT;
  
  -- 3. Deletar formas de pagamento (payment_methods) - dependem de companies
  DELETE FROM payment_methods WHERE company_id = company_uuid;
  GET DIAGNOSTICS payment_methods_count = ROW_COUNT;
  
  -- 4. Deletar company_users que referenciam sellers (quebrar a referência circular)
  UPDATE company_users 
  SET seller_id = NULL 
  WHERE company_id = company_uuid AND seller_id IS NOT NULL;
  
  -- 5. Deletar sellers - agora não há mais referências
  DELETE FROM sellers WHERE company_id = company_uuid;
  GET DIAGNOSTICS sellers_count = ROW_COUNT;
  
  -- 6. Deletar company_users - agora sem referências de sellers
  DELETE FROM company_users WHERE company_id = company_uuid;
  GET DIAGNOSTICS users_count = ROW_COUNT;
  
  -- 7. Finalmente deletar a empresa
  DELETE FROM companies WHERE id = company_uuid;
  GET DIAGNOSTICS total_deleted = ROW_COUNT;
  
  -- Retornar resultado detalhado
  RETURN '✅ Empresa deletada: ' || company_name || 
         ' (vendas: ' || sales_count || 
         ', produtos: ' || products_count ||
         ', pagamentos: ' || payment_methods_count ||
         ', vendedores: ' || sellers_count || 
         ', usuários: ' || users_count || ')';
         
EXCEPTION
  WHEN OTHERS THEN
    RETURN '❌ Erro ao deletar empresa: ' || SQLERRM;
END;
$$;

-- 3. TESTAR A FUNÇÃO CORRIGIDA
SELECT 'TESTE' as categoria, delete_company_cascade('lojaabcd') as resultado;

-- 4. VERIFICAR SE FOI DELETADA
SELECT 
  'VERIFICACAO' as categoria,
  CASE 
    WHEN EXISTS (SELECT 1 FROM companies WHERE name = 'lojaabcd')
    THEN '❌ EMPRESA AINDA EXISTE'
    ELSE '✅ EMPRESA DELETADA COM SUCESSO'
  END as resultado;