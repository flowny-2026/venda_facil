-- ========================================
-- EXECUTAR NO SUPABASE - URGENTE
-- ========================================
-- Copie e cole este código no SQL Editor do Supabase

-- RECRIAR A FUNÇÃO COM ORDEM CORRETA
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
BEGIN
  -- Buscar o ID da empresa
  SELECT id INTO company_uuid 
  FROM companies 
  WHERE name = company_name;
  
  IF company_uuid IS NULL THEN
    RETURN '❌ Empresa não encontrada: ' || company_name;
  END IF;
  
  -- ORDEM CORRETA DE EXCLUSÃO
  
  -- 1. Deletar vendas primeiro
  DELETE FROM sales 
  WHERE seller_id IN (
    SELECT id FROM sellers WHERE company_id = company_uuid
  );
  GET DIAGNOSTICS sales_count = ROW_COUNT;
  
  -- 2. Deletar produtos
  DELETE FROM products WHERE company_id = company_uuid;
  GET DIAGNOSTICS products_count = ROW_COUNT;
  
  -- 3. Deletar formas de pagamento
  DELETE FROM payment_methods WHERE company_id = company_uuid;
  GET DIAGNOSTICS payment_methods_count = ROW_COUNT;
  
  -- 4. Quebrar referência circular: limpar seller_id em company_users
  UPDATE company_users 
  SET seller_id = NULL 
  WHERE company_id = company_uuid AND seller_id IS NOT NULL;
  
  -- 5. Deletar sellers
  DELETE FROM sellers WHERE company_id = company_uuid;
  GET DIAGNOSTICS sellers_count = ROW_COUNT;
  
  -- 6. Deletar company_users
  DELETE FROM company_users WHERE company_id = company_uuid;
  GET DIAGNOSTICS users_count = ROW_COUNT;
  
  -- 7. Deletar a empresa
  DELETE FROM companies WHERE id = company_uuid;
  
  RETURN '✅ Empresa deletada: ' || company_name || 
         ' (vendas: ' || sales_count || 
         ', produtos: ' || products_count ||
         ', pagamentos: ' || payment_methods_count ||
         ', vendedores: ' || sellers_count || 
         ', usuários: ' || users_count || ')';
         
EXCEPTION
  WHEN OTHERS THEN
    RETURN '❌ Erro: ' || SQLERRM;
END;
$$;