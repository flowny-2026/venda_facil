-- ========================================
-- PAINEL ADMIN - CONFIGURAÇÃO DO BANCO
-- ========================================

-- 1. Criar tabela de administradores
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  role TEXT CHECK (role IN ('super_admin', 'admin', 'support')) DEFAULT 'admin',
  permissions JSONB DEFAULT '{"view_users": true, "manage_users": false, "view_sales": true, "manage_sales": false, "view_analytics": true}',
  active BOOLEAN DEFAULT true
);

-- 2. Habilitar RLS para admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 3. Políticas para admin_users (apenas super_admins podem gerenciar)
CREATE POLICY "Super admins can manage admin_users" ON admin_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.role = 'super_admin' 
      AND au.active = true
    )
  );

-- 4. Política para admins verem a si mesmos
CREATE POLICY "Admins can view themselves" ON admin_users
  FOR SELECT USING (user_id = auth.uid());

-- 5. Função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = user_uuid 
    AND active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Função para verificar se usuário é super admin
CREATE OR REPLACE FUNCTION is_super_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = user_uuid 
    AND role = 'super_admin' 
    AND active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. View para estatísticas gerais (apenas admins)
CREATE OR REPLACE VIEW admin_stats AS
SELECT 
  -- Estatísticas de usuários
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM auth.users WHERE created_at >= NOW() - INTERVAL '30 days') as new_users_30d,
  (SELECT COUNT(*) FROM auth.users WHERE created_at >= NOW() - INTERVAL '7 days') as new_users_7d,
  
  -- Estatísticas de vendas
  (SELECT COUNT(*) FROM sales) as total_sales,
  (SELECT COALESCE(SUM(amount), 0) FROM sales) as total_revenue,
  (SELECT COALESCE(AVG(amount), 0) FROM sales) as avg_ticket,
  (SELECT COUNT(*) FROM sales WHERE created_at >= NOW() - INTERVAL '30 days') as sales_30d,
  (SELECT COALESCE(SUM(amount), 0) FROM sales WHERE created_at >= NOW() - INTERVAL '30 days') as revenue_30d,
  
  -- Estatísticas por status
  (SELECT COUNT(*) FROM sales WHERE status = 'paid') as paid_sales,
  (SELECT COUNT(*) FROM sales WHERE status = 'pending') as pending_sales,
  (SELECT COUNT(*) FROM sales WHERE status = 'canceled') as canceled_sales,
  
  -- Top categorias
  (SELECT json_agg(row_to_json(t)) FROM (
    SELECT category, COUNT(*) as count, SUM(amount) as revenue
    FROM sales 
    GROUP BY category 
    ORDER BY revenue DESC 
    LIMIT 5
  ) t) as top_categories;

-- 8. RLS para admin_stats (apenas admins podem ver)
ALTER VIEW admin_stats OWNER TO postgres;

-- 9. View para usuários com suas vendas (apenas admins)
CREATE OR REPLACE VIEW admin_users_overview AS
SELECT 
  u.id,
  u.email,
  u.created_at,
  u.email_confirmed_at,
  u.last_sign_in_at,
  COALESCE(u.raw_user_meta_data->>'full_name', '') as full_name,
  COALESCE(u.raw_user_meta_data->>'company_name', '') as company_name,
  
  -- Estatísticas de vendas do usuário
  COALESCE(s.total_sales, 0) as total_sales,
  COALESCE(s.total_revenue, 0) as total_revenue,
  COALESCE(s.avg_ticket, 0) as avg_ticket,
  COALESCE(s.last_sale, NULL) as last_sale
FROM auth.users u
LEFT JOIN (
  SELECT 
    user_id,
    COUNT(*) as total_sales,
    SUM(amount) as total_revenue,
    AVG(amount) as avg_ticket,
    MAX(created_at) as last_sale
  FROM sales 
  GROUP BY user_id
) s ON u.id = s.user_id
ORDER BY u.created_at DESC;

-- 10. Inserir primeiro super admin (SUBSTITUA pelo seu email)
-- IMPORTANTE: Execute este comando separadamente após criar sua conta
/*
INSERT INTO admin_users (user_id, role, permissions, active)
SELECT 
  id,
  'super_admin',
  '{"view_users": true, "manage_users": true, "view_sales": true, "manage_sales": true, "view_analytics": true, "system_config": true}',
  true
FROM auth.users 
WHERE email = 'SEU_EMAIL_AQUI@exemplo.com'
ON CONFLICT (user_id) DO NOTHING;
*/

-- ========================================
-- INSTRUÇÕES DE USO:
-- ========================================
-- 1. Execute este script no SQL Editor do Supabase
-- 2. Substitua 'SEU_EMAIL_AQUI@exemplo.com' pelo seu email
-- 3. Execute o INSERT do super admin separadamente
-- 4. Acesse o painel admin em /admin no seu sistema
-- ========================================