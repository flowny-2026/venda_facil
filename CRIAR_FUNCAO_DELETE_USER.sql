-- ========================================
-- FUNÇÃO PARA DELETAR USUÁRIO VENDEDOR
-- ========================================
-- Esta função deleta um usuário vendedor e todas suas dependências
-- de forma segura e definitiva

CREATE OR REPLACE FUNCTION delete_user_cascade(user_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
  v_company_name TEXT;
  v_seller_name TEXT;
  v_sales_count INT;
BEGIN
  -- 1. Buscar usuário pelo email
  SELECT id, email INTO v_user_id, v_user_email
  FROM auth.users
  WHERE email = user_email;
  
  IF v_user_id IS NULL THEN
    RETURN '❌ Usuário não encontrado: ' || user_email;
  END IF;
  
  -- 2. Buscar informações do vendedor
  SELECT 
    c.name,
    s.name,
    (SELECT COUNT(*) FROM sales WHERE user_id = v_user_id)
  INTO v_company_name, v_seller_name, v_sales_count
  FROM company_users cu
  LEFT JOIN companies c ON cu.company_id = c.id
  LEFT JOIN sellers s ON cu.seller_id = s.id
  WHERE cu.user_id = v_user_id
  LIMIT 1;
  
  RAISE NOTICE '🔍 Usuário encontrado: % (ID: %)', v_user_email, v_user_id;
  RAISE NOTICE '🏢 Empresa: %', COALESCE(v_company_name, 'N/A');
  RAISE NOTICE '👤 Vendedor: %', COALESCE(v_seller_name, 'N/A');
  RAISE NOTICE '💰 Vendas registradas: %', v_sales_count;
  
  -- 3. IMPORTANTE: Não deletar vendas, apenas desvincular o usuário
  -- As vendas devem ser mantidas para histórico
  UPDATE sales
  SET user_id = NULL
  WHERE user_id = v_user_id;
  
  RAISE NOTICE '✅ Vendas desvinculadas (mantidas para histórico)';
  
  -- 4. Deletar vinculação na tabela company_users
  DELETE FROM company_users
  WHERE user_id = v_user_id;
  
  RAISE NOTICE '✅ Vinculação removida de company_users';
  
  -- 5. Deletar usuário do auth.users
  DELETE FROM auth.users
  WHERE id = v_user_id;
  
  RAISE NOTICE '✅ Usuário deletado do auth.users';
  
  -- 6. Retornar mensagem de sucesso
  RETURN '✅ Usuário deletado com sucesso: ' || v_user_email || 
         ' (Empresa: ' || COALESCE(v_company_name, 'N/A') || 
         ', Vendas mantidas: ' || v_sales_count || ')';
         
EXCEPTION
  WHEN OTHERS THEN
    RETURN '❌ Erro ao deletar usuário: ' || SQLERRM;
END;
$$;

-- ========================================
-- TESTAR A FUNÇÃO
-- ========================================

-- Exemplo de uso:
-- SELECT delete_user_cascade('usuario@empresa.com');

-- Verificar se a função foi criada
SELECT 
  'FUNCAO CRIADA' as status,
  proname as nome_funcao,
  pg_get_functiondef(oid) as definicao
FROM pg_proc
WHERE proname = 'delete_user_cascade';
