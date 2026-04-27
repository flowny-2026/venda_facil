-- ========================================
-- CRIAR FUNÇÃO is_admin
-- Verifica se um usuário é administrador
-- ========================================

-- Remover função antiga se existir
DROP FUNCTION IF EXISTS is_admin(UUID);

-- Criar função nova
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se o usuário existe na tabela admin_users e está ativo
  RETURN EXISTS (
    SELECT 1 
    FROM admin_users 
    WHERE user_id = user_uuid 
    AND active = true
  );
END;
$$;

-- Dar permissão para usuários autenticados executarem a função
GRANT EXECUTE ON FUNCTION is_admin(UUID) TO authenticated;

-- Testar a função com seu usuário
SELECT 
  u.email,
  au.user_id,
  is_admin(au.user_id) as is_admin_result
FROM auth.users u
JOIN admin_users au ON au.user_id = u.id
WHERE u.email = 'edicharlesbrito2009@hotmail.com';
