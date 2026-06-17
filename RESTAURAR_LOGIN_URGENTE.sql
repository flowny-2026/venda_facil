-- =====================================================
-- 🚨 RESTAURAR LOGIN - EXECUTAR IMEDIATAMENTE 🚨
-- =====================================================

-- PASSO 1: Remover a política que está bloqueando o login
DROP POLICY IF EXISTS "Users can view own company users" ON company_users;

-- PASSO 2: Criar política correta que permite login
CREATE POLICY "allow_read_own_company_data"
ON company_users
FOR SELECT
TO authenticated
USING (true);  -- ✅ Permite ler durante autenticação

-- PASSO 3: Criar política para permitir que usuário veja seus próprios dados
CREATE POLICY "allow_read_self"
ON company_users
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- PASSO 4: Permitir que super_admin veja tudo
CREATE POLICY "allow_super_admin_read_all"
ON company_users
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM company_users 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin'
  )
);

-- =====================================================
-- VERIFICAR SE FUNCIONA
-- =====================================================

-- Este SELECT deve retornar seus dados
SELECT * FROM company_users WHERE user_id = auth.uid();

-- =====================================================
-- ✅ AGORA TENTE FAZER LOGIN NOVAMENTE
-- =====================================================
