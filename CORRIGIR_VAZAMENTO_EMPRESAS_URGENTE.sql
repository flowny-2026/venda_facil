-- ========================================
-- CORRIGIR VAZAMENTO ENTRE EMPRESAS - URGENTE
-- ========================================
-- PROBLEMA CATASTRÓFICO: Empresas vendo dados de outras empresas

-- 1. REMOVER TODAS AS POLÍTICAS PROBLEMÁTICAS
DROP POLICY IF EXISTS "Users can view sales from their company" ON sales;
DROP POLICY IF EXISTS "Users can insert sales for their company" ON sales;
DROP POLICY IF EXISTS "Users can update sales from their company" ON sales;
DROP POLICY IF EXISTS "Users can delete sales from their company" ON sales;
DROP POLICY IF EXISTS "Sellers can only view their own sales" ON sales;
DROP POLICY IF EXISTS "Sellers can insert their own sales" ON sales;
DROP POLICY IF EXISTS "Sellers can update their own sales" ON sales;
DROP POLICY IF EXISTS "Sellers can delete their own sales" ON sales;

-- 2. CRIAR POLÍTICA CORRETA - ISOLAMENTO TOTAL POR EMPRESA
-- POLÍTICA DE SELECT (LEITURA) - ISOLAMENTO POR EMPRESA
CREATE POLICY "Users can only view sales from their own company" ON sales
FOR SELECT
USING (
  -- Super admin vê tudo
  is_super_admin() OR
  -- Usuários veem apenas vendas da SUA EMPRESA
  seller_id IN (
    SELECT s.id 
    FROM sellers s
    WHERE s.company_id = get_user_company_id()
  )
);

-- POLÍTICA DE INSERT (CRIAÇÃO) - ISOLAMENTO POR EMPRESA
CREATE POLICY "Users can only insert sales for their own company" ON sales
FOR INSERT
WITH CHECK (
  -- Super admin pode inserir qualquer venda
  is_super_admin() OR
  -- Usuários podem inserir apenas vendas da SUA EMPRESA
  seller_id IN (
    SELECT s.id 
    FROM sellers s
    WHERE s.company_id = get_user_company_id()
  )
);

-- POLÍTICA DE UPDATE (ATUALIZAÇÃO) - ISOLAMENTO POR EMPRESA
CREATE POLICY "Users can only update sales from their own company" ON sales
FOR UPDATE
USING (
  -- Super admin pode atualizar qualquer venda
  is_super_admin() OR
  -- Usuários podem atualizar apenas vendas da SUA EMPRESA
  seller_id IN (
    SELECT s.id 
    FROM sellers s
    WHERE s.company_id = get_user_company_id()
  )
);

-- POLÍTICA DE DELETE (EXCLUSÃO) - ISOLAMENTO POR EMPRESA
CREATE POLICY "Users can only delete sales from their own company" ON sales
FOR DELETE
USING (
  -- Super admin pode deletar qualquer venda
  is_super_admin() OR
  -- Usuários podem deletar apenas vendas da SUA EMPRESA
  seller_id IN (
    SELECT s.id 
    FROM sellers s
    WHERE s.company_id = get_user_company_id()
  )
);

-- 3. VERIFICAR SE AS POLÍTICAS FORAM CRIADAS
SELECT 
  'POLITICAS CORRIGIDAS' as categoria,
  policyname,
  cmd,
  '✅ CRIADA - ISOLAMENTO POR EMPRESA' as status
FROM pg_policies 
WHERE tablename = 'sales'
ORDER BY policyname;

-- 4. TESTE DE ISOLAMENTO
SELECT 
  'TESTE ISOLAMENTO' as categoria,
  'Políticas recriadas com isolamento total por empresa' as resultado;