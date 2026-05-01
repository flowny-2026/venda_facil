-- =====================================================
-- CORREÇÃO DE SEGURANÇA SIMPLIFICADA
-- =====================================================
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- =====================================================
-- PARTE 1: Deletar views perigosas
-- =====================================================
DROP VIEW IF EXISTS public.auth_users_exposed CASCADE;
DROP VIEW IF EXISTS auth_users_exposed CASCADE;

-- =====================================================
-- PARTE 2: Ativar RLS nas tabelas principais
-- =====================================================

-- Companies
ALTER TABLE IF EXISTS public.companies ENABLE ROW LEVEL SECURITY;

-- Company Users
ALTER TABLE IF EXISTS public.company_users ENABLE ROW LEVEL SECURITY;

-- Products
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;

-- Sellers
ALTER TABLE IF EXISTS public.sellers ENABLE ROW LEVEL SECURITY;

-- Payment Methods
ALTER TABLE IF EXISTS public.payment_methods ENABLE ROW LEVEL SECURITY;

-- Sales
ALTER TABLE IF EXISTS public.sales ENABLE ROW LEVEL SECURITY;

-- Product Categories
ALTER TABLE IF EXISTS public.product_categories ENABLE ROW LEVEL SECURITY;

-- Sale Items
ALTER TABLE IF EXISTS public.sale_items ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PARTE 3: Criar políticas básicas de segurança
-- =====================================================

-- ============ COMPANIES ============
DROP POLICY IF EXISTS "Users can view their own company" ON public.companies;
DROP POLICY IF EXISTS "Users can update their own company" ON public.companies;

CREATE POLICY "Users can view their own company"
ON public.companies FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.company_users 
        WHERE company_users.company_id = companies.id 
        AND company_users.user_id = auth.uid()
    )
);

CREATE POLICY "Users can update their own company"
ON public.companies FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.company_users 
        WHERE company_users.company_id = companies.id 
        AND company_users.user_id = auth.uid()
    )
);

-- ============ COMPANY_USERS ============
DROP POLICY IF EXISTS "Users can view their company users" ON public.company_users;

CREATE POLICY "Users can view their company users"
ON public.company_users FOR SELECT
USING (
    company_id IN (
        SELECT company_id FROM public.company_users 
        WHERE user_id = auth.uid()
    )
);

-- ============ PRODUCTS ============
DROP POLICY IF EXISTS "Users can view their company products" ON public.products;
DROP POLICY IF EXISTS "Users can manage their company products" ON public.products;

CREATE POLICY "Users can view their company products"
ON public.products FOR SELECT
USING (
    company_id IN (
        SELECT company_id FROM public.company_users 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can manage their company products"
ON public.products FOR ALL
USING (
    company_id IN (
        SELECT company_id FROM public.company_users 
        WHERE user_id = auth.uid()
    )
);

-- ============ SELLERS ============
DROP POLICY IF EXISTS "Users can view their company sellers" ON public.sellers;
DROP POLICY IF EXISTS "Users can manage their company sellers" ON public.sellers;

CREATE POLICY "Users can view their company sellers"
ON public.sellers FOR SELECT
USING (
    company_id IN (
        SELECT company_id FROM public.company_users 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can manage their company sellers"
ON public.sellers FOR ALL
USING (
    company_id IN (
        SELECT company_id FROM public.company_users 
        WHERE user_id = auth.uid()
    )
);

-- ============ PAYMENT_METHODS ============
DROP POLICY IF EXISTS "Users can view their company payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Users can manage their company payment methods" ON public.payment_methods;

CREATE POLICY "Users can view their company payment methods"
ON public.payment_methods FOR SELECT
USING (
    company_id IN (
        SELECT company_id FROM public.company_users 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can manage their company payment methods"
ON public.payment_methods FOR ALL
USING (
    company_id IN (
        SELECT company_id FROM public.company_users 
        WHERE user_id = auth.uid()
    )
);

-- ============ SALES ============
DROP POLICY IF EXISTS "Users can view their company sales" ON public.sales;
DROP POLICY IF EXISTS "Users can insert their company sales" ON public.sales;

CREATE POLICY "Users can view their company sales"
ON public.sales FOR SELECT
USING (
    company_id IN (
        SELECT company_id FROM public.company_users 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert their company sales"
ON public.sales FOR INSERT
WITH CHECK (
    company_id IN (
        SELECT company_id FROM public.company_users 
        WHERE user_id = auth.uid()
    )
);

-- ============ PRODUCT_CATEGORIES ============
DROP POLICY IF EXISTS "Users can view their company categories" ON public.product_categories;
DROP POLICY IF EXISTS "Users can manage their company categories" ON public.product_categories;

CREATE POLICY "Users can view their company categories"
ON public.product_categories FOR SELECT
USING (
    company_id IN (
        SELECT company_id FROM public.company_users 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can manage their company categories"
ON public.product_categories FOR ALL
USING (
    company_id IN (
        SELECT company_id FROM public.company_users 
        WHERE user_id = auth.uid()
    )
);

-- ============ LANDING_LEADS (Exceção - Público) ============
-- Esta tabela DEVE permanecer pública para receber leads do formulário
ALTER TABLE IF EXISTS public.landing_leads DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================
SELECT 
    tablename,
    CASE 
        WHEN rowsecurity THEN '✅ Protegido'
        ELSE '❌ Desprotegido'
    END as status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
    'companies',
    'company_users', 
    'products',
    'sellers',
    'payment_methods',
    'sales',
    'product_categories',
    'landing_leads'
)
ORDER BY tablename;
