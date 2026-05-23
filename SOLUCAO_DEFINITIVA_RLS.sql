-- ========================================
-- SOLUÇÃO DEFINITIVA PARA RLS
-- ========================================
-- Este script corrige o problema de Maria não ver produtos/pagamentos
-- Problema: Funções RLS não existem ou têm tipo errado
-- Solução: Deletar tudo e recriar do zero

-- ========================================
-- PASSO 1: DELETAR TUDO (CASCADE remove políticas)
-- ========================================

DROP FUNCTION IF EXISTS get_user_role() CASCADE;
DROP FUNCTION IF EXISTS get_user_company_id() CASCADE;
DROP FUNCTION IF EXISTS is_super_admin() CASCADE;

-- ========================================
-- PASSO 2: CRIAR FUNÇÕES COM TIPOS CORRETOS
-- ========================================

-- Função 1: Retorna company_id do usuário logado (UUID)
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN (
    SELECT company_id 
    FROM company_users 
    WHERE user_id = auth.uid() 
    AND active = true
    LIMIT 1
  );
END;
$$;

-- Função 2: Retorna role do usuário logado (TEXT)
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN (
    SELECT role::TEXT
    FROM company_users 
    WHERE user_id = auth.uid() 
    AND active = true
    LIMIT 1
  );
END;
$$;

-- Função 3: Verifica se é super admin (BOOLEAN)
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM company_users 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin'
    AND active = true
  );
END;
$$;

-- ========================================
-- PASSO 3: DAR PERMISSÕES
-- ========================================

GRANT EXECUTE ON FUNCTION get_user_company_id() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_user_role() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION is_super_admin() TO authenticated, anon;

-- ========================================
-- PASSO 4: RECRIAR POLÍTICAS DE PRODUCTS
-- ========================================

-- Habilitar RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- SELECT: Usuário vê apenas produtos da sua empresa
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
-- PASSO 5: RECRIAR POLÍTICAS DE PAYMENT_METHODS
-- ========================================

-- Habilitar RLS
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- SELECT: Usuário vê apenas formas de pagamento da sua empresa
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
-- PASSO 6: VERIFICAR SE FUNCIONOU
-- ========================================

-- Ver funções criadas
SELECT 
    routine_name,
    data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('get_user_company_id', 'get_user_role', 'is_super_admin')
ORDER BY routine_name;

-- Ver políticas criadas
SELECT 
    tablename,
    policyname,
    cmd,
    CASE 
        WHEN cmd = 'SELECT' THEN qual
        ELSE with_check
    END as policy_expression
FROM pg_policies
WHERE tablename IN ('products', 'payment_methods')
ORDER BY tablename, cmd;

-- ========================================
-- PASSO 7: TESTAR COM USUÁRIO MARIA
-- ========================================

-- Execute este SELECT logado como maria@empresa.com:
/*
SELECT 
    auth.uid() as meu_user_id,
    get_user_company_id() as minha_empresa,
    get_user_role() as minha_role,
    is_super_admin() as sou_admin;

-- Deve retornar:
-- meu_user_id: [UUID da maria]
-- minha_empresa: f3063d74-fa10-4cf7-9324-c7f67f66b307
-- minha_role: seller
-- sou_admin: false
*/

-- ========================================
-- PASSO 8: VERIFICAR SE MARIA VÊ PRODUTOS
-- ========================================

-- Execute logado como maria@empresa.com:
/*
SELECT * FROM products LIMIT 5;
SELECT * FROM payment_methods LIMIT 5;

-- Se retornar dados, está funcionando!
-- Se retornar vazio mas existem dados, o problema é que maria não está vinculada à empresa
*/

-- ========================================
-- PASSO 9: SE MARIA AINDA NÃO VER, VERIFICAR VÍNCULO
-- ========================================

-- Execute como admin para verificar se maria está vinculada:
/*
SELECT 
    u.email,
    cu.company_id,
    cu.role,
    cu.active,
    c.name as company_name
FROM auth.users u
LEFT JOIN company_users cu ON cu.user_id = u.id
LEFT JOIN companies c ON c.id = cu.company_id
WHERE u.email = 'maria@empresa.com';

-- Se company_id for NULL, maria não está vinculada!
-- Nesse caso, execute o script VINCULAR_BETE_AUTOMATICO.sql
-- substituindo 'bete@empresa.com' por 'maria@empresa.com'
*/
