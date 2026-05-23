-- ========================================
-- CORRIGIR RLS VENDAS - URGENTE
-- ========================================
-- Vendedores estão vendo vendas de outros - PROBLEMA CRÍTICO

-- 1. VERIFICAR POLÍTICAS ATUAIS DA TABELA SALES
SELECT 
  'POLITICAS ATUAIS SALES' as categoria,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'sales'
ORDER BY policyname;

-- 2. REMOVER POLÍTICAS PROBLEMÁTICAS
DROP POLICY IF EXISTS "Users can view sales from their company" ON sales;
DROP POLICY IF EXISTS "Users can insert sales for their company" ON sales;
DROP POLICY IF EXISTS "Users can update sales from their company" ON sales;
DROP POLICY IF EXISTS "Users can delete sales from their company" ON sales;

-- 3. CRIAR POLÍTICAS CORRETAS PARA VENDEDORES
-- Vendedores só veem SUAS PRÓPRIAS vendas

-- POLÍTICA DE SELECT (LEITURA) - MAIS RESTRITIVA
CREATE POLICY "Sellers can only view their own sales" ON sales
FOR SELECT
USING (
  -- Super admin vê tudo
  is_super_admin() OR
  -- Managers veem vendas da empresa
  (get_user_role() = 'manager' AND seller_id IN (
    SELECT s.id FROM sellers s WHERE s.company_id = get_user_company_id()
  )) OR
  -- Vendedores veem APENAS suas próprias vendas
  (get_user_role() = 'seller' AND seller_id IN (
    SELECT cu.seller_id 
    FROM company_users cu 
    WHERE cu.user_id = auth.uid() 
    AND cu.active = TRUE
    AND cu.seller_id IS NOT NULL
  ))
);

-- POLÍTICA DE INSERT (CRIAÇÃO)
CREATE POLICY "Sellers can insert their own sales" ON sales
FOR INSERT
WITH CHECK (
  -- Super admin pode inserir qualquer venda
  is_super_admin() OR
  -- Managers podem inserir vendas da empresa
  (get_user_role() = 'manager' AND seller_id IN (
    SELECT s.id FROM sellers s WHERE s.company_id = get_user_company_id()
  )) OR
  -- Vendedores podem inserir apenas suas próprias vendas
  (get_user_role() = 'seller' AND seller_id IN (
    SELECT cu.seller_id 
    FROM company_users cu 
    WHERE cu.user_id = auth.uid() 
    AND cu.active = TRUE
    AND cu.seller_id IS NOT NULL
  ))
);

-- POLÍTICA DE UPDATE (ATUALIZAÇÃO)
CREATE POLICY "Sellers can update their own sales" ON sales
FOR UPDATE
USING (
  -- Super admin pode atualizar qualquer venda
  is_super_admin() OR
  -- Managers podem atualizar vendas da empresa
  (get_user_role() = 'manager' AND seller_id IN (
    SELECT s.id FROM sellers s WHERE s.company_id = get_user_company_id()
  )) OR
  -- Vendedores podem atualizar apenas suas próprias vendas
  (get_user_role() = 'seller' AND seller_id IN (
    SELECT cu.seller_id 
    FROM company_users cu 
    WHERE cu.user_id = auth.uid() 
    AND cu.active = TRUE
    AND cu.seller_id IS NOT NULL
  ))
);

-- POLÍTICA DE DELETE (EXCLUSÃO)
CREATE POLICY "Sellers can delete their own sales" ON sales
FOR DELETE
USING (
  -- Super admin pode deletar qualquer venda
  is_super_admin() OR
  -- Managers podem deletar vendas da empresa
  (get_user_role() = 'manager' AND seller_id IN (
    SELECT s.id FROM sellers s WHERE s.company_id = get_user_company_id()
  )) OR
  -- Vendedores podem deletar apenas suas próprias vendas
  (get_user_role() = 'seller' AND seller_id IN (
    SELECT cu.seller_id 
    FROM company_users cu 
    WHERE cu.user_id = auth.uid() 
    AND cu.active = TRUE
    AND cu.seller_id IS NOT NULL
  ))
);

-- 4. VERIFICAR SE AS POLÍTICAS FORAM CRIADAS
SELECT 
  'POLITICAS CORRIGIDAS' as categoria,
  policyname,
  cmd,
  'CRIADA COM SUCESSO' as status
FROM pg_policies 
WHERE tablename = 'sales'
ORDER BY policyname;