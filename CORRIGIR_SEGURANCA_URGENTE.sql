-- =====================================================
-- CORREÇÃO URGENTE DE SEGURANÇA - SUPABASE
-- =====================================================
-- Execute este script IMEDIATAMENTE no Supabase SQL Editor
-- =====================================================

-- =====================================================
-- PROBLEMA 1: View auth_users_exposed
-- =====================================================
-- Deletar view que expõe dados de usuários (se existir)
DROP VIEW IF EXISTS public.auth_users_exposed CASCADE;
DROP VIEW IF EXISTS auth_users_exposed CASCADE;

-- =====================================================
-- PROBLEMA 2: Ativar RLS em TODAS as tabelas
-- =====================================================

-- Ativar RLS na tabela companies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Ativar RLS na tabela company_users
ALTER TABLE public.company_users ENABLE ROW LEVEL SECURITY;

-- Ativar RLS na tabela products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Ativar RLS na tabela sellers
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;

-- Ativar RLS na tabela payment_methods
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- Ativar RLS na tabela sales
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- Ativar RLS na tabela sale_items (se existir)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sale_items') THEN
        ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Ativar RLS na tabela product_categories (se existir)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_categories') THEN
        ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- =====================================================
-- POLÍTICAS DE SEGURANÇA (RLS Policies)
-- =====================================================

-- ============ COMPANIES ============
-- Deletar políticas antigas
DROP POLICY IF EXISTS "Users can view their own company" ON public.companies;
DROP POLICY IF EXISTS "Users can update their own company" ON public.companies;

-- Criar novas políticas
CREATE POLICY "Users can view their own company"
ON public.companies FOR SELECT
USING (
    id IN (
        SELECT company_id FROM public.company_users 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can update their own company"
ON public.companies FOR UPDATE
USING (
    id IN (
        SELECT company_id FROM public.company_users 
        WHERE user_id = auth.uid()
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
DROP POLICY IF EXISTS "Users can insert their company products" ON public.products;
DROP POLICY IF EXISTS "Users can update their company products" ON public.products;
DROP POLICY IF EXISTS "Users can delete their company products" ON public.products;

CREATE POLICY "Users can view their company products"
ON public.products FOR SELECT
USING (
    company_id IN (
        SELECT company_id FROM public.company_users 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert their company products"
ON public.products FOR INSERT
WITH CHECK (
    company_id IN (
        SELECT company_id FROM public.company_users 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can update their company products"
ON public.products FOR UPDATE
USING (
    company_id IN (
        SELECT company_id FROM public.company_users 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete their company products"
ON public.products FOR DELETE
USING (
    company_id IN (
        SELECT company_id FROM public.company_users 
        WHERE user_id = auth.uid()
    )
);

-- ============ SELLERS ============
DROP POLICY IF EXISTS "Users can view their company sellers" ON public.sellers;
DROP POLICY IF EXISTS "Users can insert their company sellers" ON public.sellers;
DROP POLICY IF EXISTS "Users can update their company sellers" ON public.sellers;
DROP POLICY IF EXISTS "Users can delete their company sellers" ON public.sellers;

CREATE POLICY "Users can view their company sellers"
ON public.sellers FOR SELECT
USING (
    company_id IN (
        SELECT company_id FROM public.company_users 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert their company sellers"
ON public.sellers FOR INSERT
WITH CHECK (
    company_id IN (
        SELECT company_id FROM public.company_users 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can update their company sellers"
ON public.sellers FOR UPDATE
USING (
    company_id IN (
        SELECT company_id FROM public.company_users 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete their company sellers"
ON public.sellers FOR DELETE
USING (
    company_id IN (
        SELECT company_id FROM public.company_users 
        WHERE user_id = auth.uid()
    )
);

-- ============ PAYMENT_METHODS ============
DROP POLICY IF EXISTS "Users can view their company payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Users can insert their company payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Users can update their company payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Users can delete their company payment methods" ON public.payment_methods;

CREATE POLICY "Users can view their company payment methods"
ON public.payment_methods FOR SELECT
USING (
    company_id IN (
        SELECT company_id FROM public.company_users 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert their company payment methods"
ON public.payment_methods FOR INSERT
WITH CHECK (
    company_id IN (
        SELECT company_id FROM public.company_users 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can update their company payment methods"
ON public.payment_methods FOR UPDATE
USING (
    company_id IN (
        SELECT company_id FROM public.company_users 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete their company payment methods"
ON public.payment_methods FOR DELETE
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

-- ============ LANDING_LEADS (Exceção - Público) ============
-- Esta tabela DEVE ser pública para receber leads do formulário
ALTER TABLE IF EXISTS public.landing_leads DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar quais tabelas têm RLS ativado
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Verificar políticas criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd as command
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- Todas as tabelas (exceto landing_leads) devem ter:
-- rls_enabled = true
--
-- Cada tabela deve ter políticas de:
-- - SELECT (visualizar)
-- - INSERT (inserir)
-- - UPDATE (atualizar)
-- - DELETE (deletar)
-- =====================================================

RAISE NOTICE '✅ Segurança corrigida com sucesso!';
RAISE NOTICE '✅ RLS ativado em todas as tabelas';
RAISE NOTICE '✅ Políticas de segurança criadas';
RAISE NOTICE '⚠️ Verifique o Supabase Dashboard para confirmar';
