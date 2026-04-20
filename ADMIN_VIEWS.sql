-- ========================================
-- VIEWS PARA O PAINEL ADMIN
-- ========================================

-- 1. View para estatísticas gerais (apenas admins)
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
  (SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json) FROM (
    SELECT category, COUNT(*) as count, SUM(amount) as revenue
    FROM sales 
    GROUP BY category 
    ORDER BY revenue DESC 
    LIMIT 5
  ) t) as top_categories;

-- 2. View para usuários com suas vendas (apenas admins)
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

-- 3. Habilitar RLS nas views (apenas admins podem acessar)
ALTER VIEW admin_stats OWNER TO postgres;
ALTER VIEW admin_users_overview OWNER TO postgres;

-- 4. Criar políticas RLS para as views
CREATE POLICY "Only admins can view admin_stats" ON admin_stats
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND active = true
    )
  );

CREATE POLICY "Only admins can view admin_users_overview" ON admin_users_overview
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND active = true
    )
  );