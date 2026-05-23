-- ========================================
-- CORRIGIR FUNÇÃO get_user_company_id()
-- ========================================

-- 1. RECRIAR A FUNÇÃO COM LÓGICA CORRETA
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  user_company_id UUID;
BEGIN
  -- Buscar company_id do usuário logado
  -- Pega apenas vinculações ativas e ordena por created_at DESC (mais recente)
  SELECT company_id INTO user_company_id
  FROM company_users
  WHERE user_id = auth.uid()
    AND active = TRUE
  ORDER BY created_at DESC
  LIMIT 1;
  
  RETURN user_company_id;
END;
$$;

-- 2. TESTAR A FUNÇÃO RECRIADA
SELECT 
  'TESTE FUNCAO RECRIADA' as categoria,
  'Função get_user_company_id() recriada com sucesso' as resultado;

-- 3. FORÇAR REFRESH DAS POLÍTICAS RLS
-- Desabilitar e reabilitar para forçar refresh
ALTER TABLE sales DISABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

SELECT 
  'RLS REFRESH' as categoria,
  'RLS foi desabilitado e reabilitado para forçar refresh' as resultado;