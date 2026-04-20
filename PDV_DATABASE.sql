-- ========================================
-- SISTEMA PDV COMPLETO - ESTRUTURA DO BANCO
-- ========================================

-- 1. Tabela de Vendedores
CREATE TABLE IF NOT EXISTS sellers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Dados do vendedor
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  document TEXT, -- CPF
  
  -- Configurações
  commission_percentage DECIMAL(5,2) DEFAULT 0.00, -- Ex: 5.50 para 5.5%
  monthly_goal DECIMAL(10,2) DEFAULT 0.00,
  active BOOLEAN DEFAULT true,
  
  -- Relacionamento com empresa
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Auditoria
  created_by UUID REFERENCES auth.users(id)
);

-- 2. Tabela de Categorias de Produtos
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6', -- Cor para identificação visual
  active BOOLEAN DEFAULT true,
  
  -- Relacionamento com empresa
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  
  UNIQUE(company_id, name)
);

-- 3. Tabela de Produtos
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Dados do produto
  name TEXT NOT NULL,
  description TEXT,
  barcode TEXT,
  sku TEXT, -- Código interno
  
  -- Preços
  price DECIMAL(10,2) NOT NULL,
  cost_price DECIMAL(10,2) DEFAULT 0.00,
  promotional_price DECIMAL(10,2),
  
  -- Estoque
  stock_quantity INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 0,
  
  -- Categoria
  category_id UUID REFERENCES product_categories(id),
  
  -- Configurações
  active BOOLEAN DEFAULT true,
  track_stock BOOLEAN DEFAULT true,
  
  -- Relacionamento com empresa
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Auditoria
  created_by UUID REFERENCES auth.users(id)
);

-- 4. Tabela de Formas de Pagamento
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('cash', 'debit_card', 'credit_card', 'pix', 'other')) NOT NULL,
  active BOOLEAN DEFAULT true,
  
  -- Relacionamento com empresa
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  
  UNIQUE(company_id, name)
);

-- 5. Atualizar tabela de vendas para PDV
ALTER TABLE sales ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES sellers(id);
ALTER TABLE sales ADD COLUMN IF NOT EXISTS payment_method_id UUID REFERENCES payment_methods(id);
ALTER TABLE sales ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2); -- amount + tax - discount
ALTER TABLE sales ADD COLUMN IF NOT EXISTS payment_received DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS change_amount DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS notes TEXT;

-- 6. Tabela de Itens da Venda
CREATE TABLE IF NOT EXISTS sale_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  
  -- Dados do item na venda
  product_name TEXT NOT NULL, -- Snapshot do nome na hora da venda
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL, -- quantity * unit_price
  
  -- Relacionamento com empresa
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE
);

-- 7. Habilitar RLS nas novas tabelas
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

-- 8. Políticas RLS para sellers
CREATE POLICY "Users can view company sellers" ON sellers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM company_users cu 
      WHERE cu.user_id = auth.uid() 
      AND cu.company_id = sellers.company_id
      AND cu.active = true
    )
  );

CREATE POLICY "Users can manage company sellers" ON sellers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM company_users cu 
      WHERE cu.user_id = auth.uid() 
      AND cu.company_id = sellers.company_id
      AND cu.active = true
      AND cu.role IN ('owner', 'manager')
    )
  );

-- 9. Políticas RLS para product_categories
CREATE POLICY "Users can view company categories" ON product_categories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM company_users cu 
      WHERE cu.user_id = auth.uid() 
      AND cu.company_id = product_categories.company_id
      AND cu.active = true
    )
  );

CREATE POLICY "Users can manage company categories" ON product_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM company_users cu 
      WHERE cu.user_id = auth.uid() 
      AND cu.company_id = product_categories.company_id
      AND cu.active = true
      AND cu.role IN ('owner', 'manager')
    )
  );

-- 10. Políticas RLS para products
CREATE POLICY "Users can view company products" ON products
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM company_users cu 
      WHERE cu.user_id = auth.uid() 
      AND cu.company_id = products.company_id
      AND cu.active = true
    )
  );

CREATE POLICY "Users can manage company products" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM company_users cu 
      WHERE cu.user_id = auth.uid() 
      AND cu.company_id = products.company_id
      AND cu.active = true
      AND cu.role IN ('owner', 'manager')
    )
  );

-- 11. Políticas RLS para payment_methods
CREATE POLICY "Users can view company payment methods" ON payment_methods
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM company_users cu 
      WHERE cu.user_id = auth.uid() 
      AND cu.company_id = payment_methods.company_id
      AND cu.active = true
    )
  );

CREATE POLICY "Users can manage company payment methods" ON payment_methods
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM company_users cu 
      WHERE cu.user_id = auth.uid() 
      AND cu.company_id = payment_methods.company_id
      AND cu.active = true
      AND cu.role IN ('owner', 'manager')
    )
  );

-- 12. Políticas RLS para sale_items
CREATE POLICY "Users can view company sale items" ON sale_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM company_users cu 
      WHERE cu.user_id = auth.uid() 
      AND cu.company_id = sale_items.company_id
      AND cu.active = true
    )
  );

CREATE POLICY "Users can manage company sale items" ON sale_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM company_users cu 
      WHERE cu.user_id = auth.uid() 
      AND cu.company_id = sale_items.company_id
      AND cu.active = true
    )
  );

-- 13. Inserir formas de pagamento padrão para empresas existentes
INSERT INTO payment_methods (name, type, company_id)
SELECT 'Dinheiro', 'cash', id FROM companies
WHERE NOT EXISTS (
  SELECT 1 FROM payment_methods 
  WHERE company_id = companies.id AND name = 'Dinheiro'
);

INSERT INTO payment_methods (name, type, company_id)
SELECT 'Cartão de Débito', 'debit_card', id FROM companies
WHERE NOT EXISTS (
  SELECT 1 FROM payment_methods 
  WHERE company_id = companies.id AND name = 'Cartão de Débito'
);

INSERT INTO payment_methods (name, type, company_id)
SELECT 'Cartão de Crédito', 'credit_card', id FROM companies
WHERE NOT EXISTS (
  SELECT 1 FROM payment_methods 
  WHERE company_id = companies.id AND name = 'Cartão de Crédito'
);

INSERT INTO payment_methods (name, type, company_id)
SELECT 'PIX', 'pix', id FROM companies
WHERE NOT EXISTS (
  SELECT 1 FROM payment_methods 
  WHERE company_id = companies.id AND name = 'PIX'
);

-- 14. Função para calcular estatísticas de vendedor
CREATE OR REPLACE FUNCTION get_seller_stats(
  seller_uuid UUID,
  start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  end_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_sales', COALESCE(COUNT(*), 0),
    'total_revenue', COALESCE(SUM(total_amount), 0),
    'avg_ticket', COALESCE(AVG(total_amount), 0),
    'commission_earned', COALESCE(SUM(total_amount * s.commission_percentage / 100), 0)
  ) INTO result
  FROM sales sa
  JOIN sellers s ON s.id = sa.seller_id
  WHERE sa.seller_id = seller_uuid
    AND sa.created_at::date BETWEEN start_date AND end_date
    AND sa.status = 'paid';
    
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 15. Função para criar formas de pagamento padrão para nova empresa
CREATE OR REPLACE FUNCTION create_default_payment_methods(company_uuid UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO payment_methods (name, type, company_id) VALUES
    ('Dinheiro', 'cash', company_uuid),
    ('Cartão de Débito', 'debit_card', company_uuid),
    ('Cartão de Crédito', 'credit_card', company_uuid),
    ('PIX', 'pix', company_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 16. Trigger para criar formas de pagamento padrão automaticamente
CREATE OR REPLACE FUNCTION trigger_create_default_payment_methods()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_default_payment_methods(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_company_insert
  AFTER INSERT ON companies
  FOR EACH ROW
  EXECUTE FUNCTION trigger_create_default_payment_methods();

-- ========================================
-- DADOS DE EXEMPLO (OPCIONAL)
-- ========================================

-- Exemplo: Inserir categoria padrão
/*
INSERT INTO product_categories (name, description, company_id)
SELECT 'Geral', 'Categoria padrão para produtos', id 
FROM companies 
LIMIT 1;
*/