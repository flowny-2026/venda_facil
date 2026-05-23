-- ========================================
-- CORREÇÃO FINAL RLS - DEFINITIVA
-- ========================================
-- Garantir isolamento TOTAL entre empresas

-- 1. DESABILITAR RLS TEMPORARIAMENTE
ALTER TABLE sales DISABLE ROW LEVEL SECURITY;

-- 2. REMOVER TODAS AS POLÍTICAS EXISTENTES
DROP POLICY IF EXISTS "sales_select" ON sales;
DROP POLICY IF EXISTS "sales_insert" ON sales;
DROP POLICY IF EXISTS "sales_update" ON sales;
DROP POLICY IF EXISTS "sales_delete" ON sales;
DROP POLICY IF EXISTS "Users can only view sales from their own company" ON sales;
DROP POLICY IF EXISTS "Users can only insert sales for their own company" ON sales;
DROP POLICY IF EXISTS "Users can only update sales from their own company" ON sales;
DROP POLICY IF EXISTS "Users can only delete sales from their own company" ON sales;

-- 3. REABILITAR RLS
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- 4. CRIAR POLÍTICA DEFINITIVA - ISOLAMENTO POR COMPANY_ID
CREATE POLICY "sales_company_isolation_select" ON sales
FOR SELECT
USING (
  -- Super admin vê tudo
  is_super_admin() OR
  -- Usuários veem apenas vendas da SUA empresa (usando company_id direto)
  company_id = get_user_company_id()
);

CREATE POLICY "sales_company_isolation_insert" ON sales
FOR INSERT
WITH CHECK (
  -- Super admin pode inserir qualquer venda
  is_super_admin() OR
  -- Usuários podem inserir apenas vendas da SUA empresa
  company_id = get_user_company_id()
);

CREATE POLICY "sales_company_isolation_update" ON sales
FOR UPDATE
USING (
  -- Super admin pode atualizar qualquer venda
  is_super_admin() OR
  -- Usuários podem atualizar apenas vendas da SUA empresa
  company_id = get_user_company_id()
);

CREATE POLICY "sales_company_isolation_delete" ON sales
FOR DELETE
USING (
  -- Super admin pode deletar qualquer venda
  is_super_admin() OR
  -- Usuários podem deletar apenas vendas da SUA empresa
  company_id = get_user_company_id()
);

-- 5. VERIFICAR POLÍTICAS CRIADAS
SELECT 
  'POLITICAS FINAIS' as categoria,
  policyname,
  cmd,
  'ISOLAMENTO POR COMPANY_ID' as tipo
FROM pg_policies 
WHERE tablename = 'sales'
ORDER BY policyname;