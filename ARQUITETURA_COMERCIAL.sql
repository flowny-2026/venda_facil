-- ========================================
-- ARQUITETURA COMERCIAL MULTI-TENANT
-- ========================================

-- 1. Tabela de Empresas/Clientes
CREATE TABLE IF NOT EXISTS companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Dados da empresa
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  document TEXT, -- CNPJ
  
  -- Endereço
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  
  -- Configurações
  plan TEXT CHECK (plan IN ('starter', 'professional', 'enterprise')) DEFAULT 'starter',
  status TEXT CHECK (status IN ('active', 'suspended', 'canceled')) DEFAULT 'active',
  max_users INTEGER DEFAULT 1,
  max_sales_per_month INTEGER DEFAULT 1000,
  
  -- Financeiro
  monthly_fee DECIMAL(10,2) DEFAULT 29.00,
  next_billing_date DATE DEFAULT (NOW() + INTERVAL '30 days'),
  
  -- Criado por qual admin
  created_by UUID REFERENCES admin_users(user_id)
);

-- 2. Tabela de Usuários da Empresa (vendedores/gerentes)
CREATE TABLE IF NOT EXISTS company_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  role TEXT CHECK (role IN ('owner', 'manager', 'seller')) DEFAULT 'seller',
  permissions JSONB DEFAULT '{"view_sales": true, "add_sales": true, "edit_sales": false, "delete_sales": false}',
  active BOOLEAN DEFAULT true,
  
  UNIQUE(company_id, user_id)
);

-- 3. Atualizar tabela de vendas para incluir empresa
ALTER TABLE sales ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);

-- 4. Habilitar RLS nas novas tabelas
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;

-- 5. Políticas para companies (apenas admins veem todas)
CREATE POLICY "Admins can manage all companies" ON companies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND active = true
    )
  );

-- 6. Políticas para company_users
CREATE POLICY "Users can view their company" ON company_users
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage company_users" ON company_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND active = true
    )
  );

-- 7. Atualizar políticas de sales para incluir empresa
DROP POLICY IF EXISTS "Users can view own sales" ON sales;
DROP POLICY IF EXISTS "Users can insert own sales" ON sales;
DROP POLICY IF EXISTS "Users can update own sales" ON sales;
DROP POLICY IF EXISTS "Users can delete own sales" ON sales;

-- Novas políticas baseadas na empresa
CREATE POLICY "Users can view company sales" ON sales
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM company_users cu 
      WHERE cu.user_id = auth.uid() 
      AND cu.company_id = sales.company_id
      AND cu.active = true
    )
  );

CREATE POLICY "Users can insert company sales" ON sales
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM company_users cu 
      WHERE cu.user_id = auth.uid() 
      AND cu.company_id = sales.company_id
      AND cu.active = true
    )
  );

CREATE POLICY "Users can update company sales" ON sales
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM company_users cu 
      WHERE cu.user_id = auth.uid() 
      AND cu.company_id = sales.company_id
      AND cu.active = true
    )
  );

CREATE POLICY "Users can delete company sales" ON sales
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM company_users cu 
      WHERE cu.user_id = auth.uid() 
      AND cu.company_id = sales.company_id
      AND cu.active = true
      AND (cu.role = 'owner' OR cu.role = 'manager')
    )
  );

-- 8. Admins podem ver todas as vendas
CREATE POLICY "Admins can view all sales" ON sales
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND active = true
    )
  );

-- 9. Função para verificar se usuário pertence a uma empresa
CREATE OR REPLACE FUNCTION user_company_id(user_uuid UUID DEFAULT auth.uid())
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT company_id 
    FROM company_users 
    WHERE user_id = user_uuid 
    AND active = true 
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Função para verificar se usuário é dono da empresa
CREATE OR REPLACE FUNCTION is_company_owner(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM company_users 
    WHERE user_id = user_uuid 
    AND role = 'owner' 
    AND active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- DADOS DE EXEMPLO (OPCIONAL)
-- ========================================

-- Exemplo: Criar primeira empresa
/*
INSERT INTO companies (name, email, plan, created_by)
SELECT 
  'Empresa Exemplo Ltda',
  'contato@empresaexemplo.com',
  'professional',
  user_id
FROM admin_users 
WHERE role = 'super_admin' 
LIMIT 1;
*/