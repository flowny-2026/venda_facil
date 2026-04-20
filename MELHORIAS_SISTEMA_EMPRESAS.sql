-- Melhorias no sistema de empresas
-- Execute este script no Supabase Dashboard > SQL Editor

-- 1. Adicionar campo para tipo de acesso na tabela companies
ALTER TABLE companies ADD COLUMN IF NOT EXISTS access_type TEXT DEFAULT 'shared' CHECK (access_type IN ('shared', 'individual'));
ALTER TABLE companies ADD COLUMN IF NOT EXISTS max_users INTEGER DEFAULT 1;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- 2. Atualizar empresas existentes
UPDATE companies SET access_type = 'shared', max_users = 1 WHERE access_type IS NULL;

-- 3. Criar tabela para usuários das empresas (se não existir)
CREATE TABLE IF NOT EXISTS company_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Relacionamentos
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Dados do usuário na empresa
  role TEXT DEFAULT 'user' CHECK (role IN ('owner', 'manager', 'user', 'seller')),
  active BOOLEAN DEFAULT true,
  
  -- Permissões específicas
  can_access_pdv BOOLEAN DEFAULT true,
  can_view_reports BOOLEAN DEFAULT false,
  can_manage_products BOOLEAN DEFAULT false,
  can_manage_sellers BOOLEAN DEFAULT false,
  
  UNIQUE(company_id, user_id)
);

-- 4. Habilitar RLS na tabela company_users
ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;

-- 5. Criar política para company_users
CREATE POLICY "Users can view their company data" ON company_users
  FOR ALL USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM company_users cu 
    WHERE cu.user_id = auth.uid() 
    AND cu.company_id = company_users.company_id 
    AND cu.role IN ('owner', 'manager')
  ));

-- 6. Verificar estrutura
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'companies' 
AND column_name IN ('access_type', 'max_users', 'created_by')
ORDER BY column_name;