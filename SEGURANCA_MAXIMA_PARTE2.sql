-- ============================================
-- SEGURANÇA MÁXIMA - PARTE 2
-- POLÍTICAS PARA SELLERS E VALIDAÇÕES
-- ============================================

-- PASSO 1: Limpar políticas antigas de sellers
DROP POLICY IF EXISTS "Sellers: Usuários da empresa veem" ON sellers;
DROP POLICY IF EXISTS "Sellers: Managers podem inserir" ON sellers;
DROP POLICY IF EXISTS "Sellers: Managers podem atualizar" ON sellers;
DROP POLICY IF EXISTS "Sellers: Managers podem deletar" ON sellers;

-- PASSO 2: Políticas para SELLERS
CREATE POLICY "Sellers: Usuários da empresa veem"
ON sellers FOR SELECT
TO authenticated
USING (
  company_id IN (
    SELECT company_id 
    FROM company_users 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Sellers: Managers podem inserir"
ON sellers FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM company_users cu
    WHERE cu.user_id = auth.uid()
    AND cu.company_id = sellers.company_id
    AND cu.role IN ('owner', 'manager')
  )
);

CREATE POLICY "Sellers: Managers podem atualizar"
ON sellers FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM company_users cu
    WHERE cu.user_id = auth.uid()
    AND cu.company_id = sellers.company_id
    AND cu.role IN ('owner', 'manager')
  )
);

CREATE POLICY "Sellers: Managers podem deletar"
ON sellers FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM company_users cu
    WHERE cu.user_id = auth.uid()
    AND cu.company_id = sellers.company_id
    AND cu.role IN ('owner', 'manager')
  )
);

-- PASSO 3: Adicionar constraints de validação
-- Email válido
ALTER TABLE sellers
DROP CONSTRAINT IF EXISTS sellers_email_valid;

ALTER TABLE sellers
ADD CONSTRAINT sellers_email_valid
CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Comissão entre 0 e 100
ALTER TABLE sellers
DROP CONSTRAINT IF EXISTS sellers_commission_valid;

ALTER TABLE sellers
ADD CONSTRAINT sellers_commission_valid
CHECK (commission_percentage >= 0 AND commission_percentage <= 100);

-- Meta mensal não negativa
ALTER TABLE sellers
DROP CONSTRAINT IF EXISTS sellers_goal_valid;

ALTER TABLE sellers
ADD CONSTRAINT sellers_goal_valid
CHECK (monthly_goal >= 0);

-- Nome não vazio
ALTER TABLE sellers
DROP CONSTRAINT IF EXISTS sellers_name_not_empty;

ALTER TABLE sellers
ADD CONSTRAINT sellers_name_not_empty
CHECK (length(trim(name)) > 0);

-- PASSO 4: Validações para companies
ALTER TABLE companies
DROP CONSTRAINT IF EXISTS companies_name_not_empty;

ALTER TABLE companies
ADD CONSTRAINT companies_name_not_empty
CHECK (length(trim(name)) > 0);

ALTER TABLE companies
DROP CONSTRAINT IF EXISTS companies_email_valid;

ALTER TABLE companies
ADD CONSTRAINT companies_email_valid
CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE companies
DROP CONSTRAINT IF EXISTS companies_status_valid;

ALTER TABLE companies
ADD CONSTRAINT companies_status_valid
CHECK (status IN ('active', 'inactive', 'suspended'));

-- PASSO 5: Verificar resultado
SELECT 
  '=== POLÍTICAS SELLERS ===' as status,
  policyname,
  cmd as command
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'sellers'
ORDER BY policyname;

SELECT 
  '=== CONSTRAINTS ===' as status,
  table_name,
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public'
AND table_name IN ('sellers', 'companies')
AND constraint_type = 'CHECK'
ORDER BY table_name, constraint_name;
