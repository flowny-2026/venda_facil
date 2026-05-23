-- ========================================
-- FUNÇÃO PARA DELETAR USUÁRIO DO AUTH.USERS
-- ========================================
-- Esta função usa privilégios de SECURITY DEFINER para deletar
-- usuários da tabela auth.users que normalmente não é acessível

CREATE OR REPLACE FUNCTION delete_auth_user(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public
AS $$
BEGIN
  -- Verificar se o usuário existe
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = target_user_id) THEN
    RAISE NOTICE '❌ Usuário não encontrado: %', target_user_id;
    RETURN FALSE;
  END IF;

  -- Deletar o usuário
  DELETE FROM auth.users WHERE id = target_user_id;
  
  -- Verificar se foi deletado
  IF EXISTS (SELECT 1 FROM auth.users WHERE id = target_user_id) THEN
    RAISE NOTICE '❌ Falha ao deletar usuário: %', target_user_id;
    RETURN FALSE;
  END IF;
  
  RAISE NOTICE '✅ Usuário deletado com sucesso: %', target_user_id;
  RETURN TRUE;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Erro ao deletar usuário: %', SQLERRM;
    RETURN FALSE;
END;
$$;

-- Conceder permissões
GRANT EXECUTE ON FUNCTION delete_auth_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_auth_user(UUID) TO service_role;

-- Verificar se foi criada
SELECT 
  '✅ FUNCAO CRIADA' as status,
  proname as nome_funcao,
  'Função para deletar usuários do auth.users' as descricao
FROM pg_proc
WHERE proname = 'delete_auth_user';
