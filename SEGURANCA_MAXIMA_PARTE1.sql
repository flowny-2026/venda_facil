-- ============================================
-- SEGURANÇA MÁXIMA - PARTE 1
-- ATIVAR RLS E POLÍTICAS BÁSICAS
-- ============================================

-- PASSO 1: Ativar RLS em todas as tabelas
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;

-- PASSO 2: Limpar políticas antigas de companies
DROP POLICY IF EXISTS "Companies: Usuários veem sua empresa" ON companies;
DROP POLICY IF EXISTS "Companies: Owners podem atualizar" ON companies;
DROP POLICY IF EXISTS "Companies: Admins podem inserir" ON companies;

-- PASSO 3: Políticas para COMPANIES
CREATE POLICY "Companies: Usuários veem sua empresa"
ON companies FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT company_id 
    FROM company_users 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Companies: Owners podem atualizar"
ON companies FOR UPDATE
TO authenticated
USING (
  id IN (
    SELECT company_id 
    FROM company_users 
    WHERE user_id = auth.uid()
    AND role = 'owner'
  )
);

-- PASSO 4: Limpar políticas antigas de company_users
DROP POLICY IF EXISTS "Company_users: Usuário vê seu registro" ON company_users;
DROP POLICY IF EXISTS "Company_users: Managers veem todos" ON company_users;
DROP POLICY IF EXISTS "Company_users: Managers podem inserir" ON company_users;
DROP POLICY IF EXISTS "Company_users: Managers podem atualizar" ON company_users;

-- PASSO 5: Políticas para COMPANY_USERS
CREATE POLICY "Company_users: Usuário vê seu registro"
ON company_users FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM company_users cu
    WHERE cu.user_id = auth.uid()
    AND cu.company_id = company_users.company_id
    AND cu.role IN ('owner', 'manager')
  )
);

CREATE POLICY "Company_users: Managers podem inserir"
ON company_users FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM company_users cu
    WHERE cu.user_id = auth.uid()
    AND cu.company_id = company_users.company_id
    AND cu.role IN ('owner', 'manager')
  )
);

CREATE POLICY "Company_users: Managers podem atualizar"
ON company_users FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM company_users cu
    WHERE cu.user_id = auth.uid()
    AND cu.company_id = company_users.company_id
    AND cu.role IN ('owner', 'manager')
  )
);

-- PASSO 6: Verificar resultado
SELECT 
  '=== RLS ATIVADO ===' as status,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('companies', 'company_users', 'sellers')
ORDER BY tablename;

SELECT 
  '=== POLÍTICAS CRIADAS ===' as status,
  tablename,
  policyname,
  cmd as command
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('companies', 'company_users')
ORDER BY tablename, policyname;
