-- ========================================
-- DELETAR FUNÇÕES ANTIGAS PRIMEIRO
-- ========================================

DROP FUNCTION IF EXISTS get_user_role() CASCADE;
DROP FUNCTION IF EXISTS get_user_company_id() CASCADE;
DROP FUNCTION IF EXISTS is_super_admin() CASCADE;

-- ========================================
-- CRIAR FUNÇÕES PARA RLS
-- ========================================

-- 1. Função para pegar company_id do usuário logado
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT company_id 
    FROM company_users 
    WHERE user_id = auth.uid() 
    AND active = true
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Função para pegar role do usuário logado
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role::TEXT
    FROM company_users 
    WHERE user_id = auth.uid() 
    AND active = true
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Função para verificar se é super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM company_users 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin'
    AND active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Dar permissões
GRANT EXECUTE ON FUNCTION get_user_company_id() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_user_role() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION is_super_admin() TO authenticated, anon;

-- ========================================
-- RECRIAR POLÍTICAS DE PAYMENT_METHODS
-- ========================================

-- Remover políticas antigas
DROP POLICY IF EXISTS pm_select ON payment_methods;
DROP POLICY IF EXISTS pm_insert ON payment_methods;
DROP POLICY IF EXISTS pm_update ON payment_methods;
DROP POLICY IF EXISTS pm_delete ON payment_methods;

-- Criar políticas novas

-- SELECT: Usuário vê apenas da sua empresa
CREATE POLICY pm_select ON payment_methods
FOR SELECT
TO authenticated
USING (
  company_id = get_user_company_id()
  OR is_super_admin()
);

-- INSERT: Apenas owner e manager podem criar
CREATE POLICY pm_insert ON payment_methods
FOR INSERT
TO authenticated
WITH CHECK (
  company_id = get_user_company_id()
  AND get_user_role() IN ('owner', 'manager')
);

-- UPDATE: Apenas owner e manager podem editar
CREATE POLICY pm_update ON payment_methods
FOR UPDATE
TO authenticated
USING (
  company_id = get_user_company_id()
  AND get_user_role() IN ('owner', 'manager')
);

-- DELETE: Apenas owner e manager podem deletar
CREATE POLICY pm_delete ON payment_methods
FOR DELETE
TO authenticated
USING (
  company_id = get_user_company_id()
  AND get_user_role() IN ('owner', 'manager')
);

-- ========================================
-- RECRIAR POLÍTICAS DE PRODUCTS
-- ========================================

-- Remover políticas antigas
DROP POLICY IF EXISTS products_select ON products;
DROP POLICY IF EXISTS products_insert ON products;
DROP POLICY IF EXISTS products_update ON products;
DROP POLICY IF EXISTS products_delete ON products;

-- SELECT: Usuário vê apenas da sua empresa
CREATE POLICY products_select ON products
FOR SELECT
TO authenticated
USING (
  company_id = get_user_company_id()
  OR is_super_admin()
);

-- INSERT: Apenas owner e manager podem criar
CREATE POLICY products_insert ON products
FOR INSERT
TO authenticated
WITH CHECK (
  company_id = get_user_company_id()
  AND get_user_role() IN ('owner', 'manager')
);

-- UPDATE: Apenas owner e manager podem editar
CREATE POLICY products_update ON products
FOR UPDATE
TO authenticated
USING (
  company_id = get_user_company_id()
  AND get_user_role() IN ('owner', 'manager')
);

-- DELETE: Apenas owner e manager podem deletar
CREATE POLICY products_delete ON products
FOR DELETE
TO authenticated
USING (
  company_id = get_user_company_id()
  AND get_user_role() IN ('owner', 'manager')
);

-- ========================================
-- VERIFICAR SE FUNCIONOU
-- ========================================

SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies
WHERE tablename IN ('products', 'payment_methods')
ORDER BY tablename, cmd;
