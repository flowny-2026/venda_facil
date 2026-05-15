-- ========================================
-- CRIAR FUNÇÃO RPC: is_admin()
-- ========================================
-- Esta função verifica se um usuário é administrador
-- Retorna TRUE se for super_admin, FALSE caso contrário

CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar se o usuário tem role 'super_admin' na tabela user_roles
  RETURN EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE user_id = user_uuid 
    AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dar permissão para usuários anônimos chamarem a função
GRANT EXECUTE ON FUNCTION is_admin(UUID) TO anon, authenticated;

-- Comentário explicativo
COMMENT ON FUNCTION is_admin(user_uuid UUID) IS 'Verifica se um usuário é administrador (super_admin)';
