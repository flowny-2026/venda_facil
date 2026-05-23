-- ========================================
-- CORRIGIR RLS SALES - VERSÃO CORRETA
-- ========================================
-- A política atual está errada porque usa company_id que não existe em sales
-- A forma correta é através de seller_id → sellers → company_id

-- 1. REMOVER POLÍTICAS PROBLEMÁTICAS
DROP POLICY IF EXISTS "sales_select" ON sales;
DROP POLICY IF EXISTS "sales_insert" ON sales;
DROP POLICY IF EXISTS "sales_update" ON sales;
DROP POLICY IF EXISTS "sales_delete" ON sales;

-- 2. CRIAR POLÍTICA CORRETA DE SELECT
-- Usuários veem apenas vendas de vendedores da SUA EMPRESA
CREATE POLICY "sales_select" ON sales
FOR SELECT
USING (
  -- Super admin vê tudo
  is_super_admin() OR
  -- Usuários veem vendas de vendedores da sua empresa
  seller_id IN (
    SELECT s.id 
    FROM sellers s
    WHERE s.company_id = get_user_company_id()
  )
);

-- 3. CRIAR POLÍTICA CORRETA DE INSERT
CREATE POLICY "sales_insert" ON sales
FOR INSERT
WITH CHECK (
  -- Super admin pode inserir qualquer venda
  is_super_admin() OR
  -- Usuários podem inserir vendas apenas de vendedores da sua empresa
  seller_id IN (
    SELECT s.id 
    FROM sellers s
    WHERE s.company_id = get_user_company_id()
  )
);

-- 4. CRIAR POLÍTICA CORRETA DE UPDATE
CREATE POLICY "sales_update" ON sales
FOR UPDATE
USING (
  -- Super admin pode atualizar qualquer venda
  is_super_admin() OR
  -- Usuários podem atualizar vendas apenas de vendedores da sua empresa
  seller_id IN (
    SELECT s.id 
    FROM sellers s
    WHERE s.company_id = get_user_company_id()
  )
);

-- 5. CRIAR POLÍTICA CORRETA DE DELETE
CREATE POLICY "sales_delete" ON sales
FOR DELETE
USING (
  -- Super admin pode deletar qualquer venda
  is_super_admin() OR
  -- Usuários podem deletar vendas apenas de vendedores da sua empresa
  seller_id IN (
    SELECT s.id 
    FROM sellers s
    WHERE s.company_id = get_user_company_id()
  )
);

-- 6. VERIFICAR POLÍTICAS CRIADAS
SELECT 
  'POLITICAS CORRIGIDAS' as categoria,
  policyname,
  cmd,
  '✅ CORRIGIDA - USA seller_id → sellers → company_id' as status
FROM pg_policies 
WHERE tablename = 'sales'
ORDER BY policyname;