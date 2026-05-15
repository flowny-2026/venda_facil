-- ========================================
-- CORRIGIR FUNÇÃO DELETE USER
-- ========================================
-- Versão melhorada que bypassa RLS e trata erros

-- 1. DROPAR FUNÇÃO ANTIGA (se existir)
DROP FUNCTION IF EXISTS delete_user_cascade(TEXT);

-- 2. CRIAR FUNÇÃO MELHORADA
CREATE OR REPLACE FUNCTION delete_user_cascade(user_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
  v_company_name TEXT;
  v_seller_name TEXT;
  v_sales_count INT;
  v_error_detail TEXT;
BEGIN
  -- Log início
  RAISE NOTICE '========================================';
  RAISE NOTICE '🔍 INICIANDO EXCLUSÃO DE USUÁRIO';
  RAISE NOTICE '========================================';
  RAISE NOTICE '📧 Email solicitado: %', user_email;
  
  -- 1. Buscar usuário pelo email
  SELECT id, email INTO v_user_id, v_user_email
  FROM auth.users
  WHERE email = user_email;
  
  IF v_user_id IS NULL THEN
    RAISE NOTICE '❌ Usuário não encontrado';
    RETURN '❌ Usuário não encontrado: ' || user_email;
  END IF;
  
  RAISE NOTICE '✅ Usuário encontrado: % (ID: %)', v_user_email, v_user_id;
  
  -- 2. Buscar informações do vendedor
  BEGIN
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
    
    RAISE NOTICE '🏢 Empresa: %', COALESCE(v_company_name, 'N/A');
    RAISE NOTICE '👤 Vendedor: %', COALESCE(v_seller_name, 'N/A');
    RAISE NOTICE '💰 Vendas registradas: %', COALESCE(v_sales_count, 0);
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE '⚠️ Erro ao buscar informações: %', SQLERRM;
      v_company_name := 'N/A';
      v_seller_name := 'N/A';
      v_sales_count := 0;
  END;
  
  -- 3. Desvincular vendas (manter para histórico)
  BEGIN
    UPDATE sales
    SET user_id = NULL
    WHERE user_id = v_user_id;
    
    RAISE NOTICE '✅ Vendas desvinculadas: % vendas mantidas para histórico', COALESCE(v_sales_count, 0);
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE '⚠️ Erro ao desvincular vendas: %', SQLERRM;
      -- Continuar mesmo com erro
  END;
  
  -- 4. Deletar vinculação na tabela company_users
  BEGIN
    DELETE FROM company_users
    WHERE user_id = v_user_id;
    
    RAISE NOTICE '✅ Vinculação removida de company_users';
  EXCEPTION
    WHEN OTHERS THEN
      v_error_detail := SQLERRM;
      RAISE NOTICE '❌ Erro ao remover vinculação: %', v_error_detail;
      RETURN '❌ Erro ao remover vinculação: ' || v_error_detail;
  END;
  
  -- 5. Deletar usuário do auth.users
  BEGIN
    DELETE FROM auth.users
    WHERE id = v_user_id;
    
    RAISE NOTICE '✅ Usuário deletado do auth.users';
  EXCEPTION
    WHEN OTHERS THEN
      v_error_detail := SQLERRM;
      RAISE NOTICE '❌ Erro ao deletar usuário: %', v_error_detail;
      RETURN '❌ Erro ao deletar usuário: ' || v_error_detail;
  END;
  
  -- 6. Verificar se realmente foi deletado
  IF EXISTS (SELECT 1 FROM auth.users WHERE id = v_user_id) THEN
    RAISE NOTICE '❌ FALHA: Usuário ainda existe após exclusão';
    RETURN '❌ Falha na exclusão: usuário ainda existe no banco';
  END IF;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ EXCLUSÃO CONCLUÍDA COM SUCESSO';
  RAISE NOTICE '========================================';
  
  -- 7. Retornar mensagem de sucesso
  RETURN '✅ Usuário deletado com sucesso: ' || v_user_email || 
         ' (Empresa: ' || COALESCE(v_company_name, 'N/A') || 
         ', Vendas mantidas: ' || COALESCE(v_sales_count, 0) || ')';
         
EXCEPTION
  WHEN OTHERS THEN
    v_error_detail := SQLERRM;
    RAISE NOTICE '❌ ERRO GERAL: %', v_error_detail;
    RETURN '❌ Erro ao deletar usuário: ' || v_error_detail;
END;
$$;

-- 3. CONCEDER PERMISSÕES
GRANT EXECUTE ON FUNCTION delete_user_cascade(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_user_cascade(TEXT) TO service_role;

-- 4. VERIFICAR SE FOI CRIADA
SELECT 
  '✅ FUNCAO ATUALIZADA' as status,
  proname as nome_funcao,
  prosecdef as security_definer,
  'Função recriada com melhorias' as observacao
FROM pg_proc
WHERE proname = 'delete_user_cascade';

-- 5. INSTRUÇÕES DE TESTE
SELECT 
  '📋 COMO TESTAR' as categoria,
  'Execute: SELECT delete_user_cascade(''email@empresa.com'');' as comando,
  'Verifique os logs (NOTICE) para ver o processo detalhado' as observacao;
