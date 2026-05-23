-- ========================================
-- VERIFICAR TABELA DE LEADS
-- ========================================

-- 1. Verificar se a tabela existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'landing_leads'
);

-- 2. Ver estrutura da tabela
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'landing_leads'
ORDER BY ordinal_position;

-- 3. Ver todos os leads cadastrados
SELECT 
    id,
    company_name,
    contact_name,
    contact_email,
    contact_phone,
    business_type,
    status,
    created_at
FROM landing_leads
ORDER BY created_at DESC;

-- 4. Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'landing_leads';

-- 5. Verificar se RLS está habilitado
SELECT 
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'landing_leads';

-- ========================================
-- SOLUÇÃO: Se não houver leads
-- ========================================

-- Inserir um lead de teste
INSERT INTO landing_leads (
    company_name,
    contact_name,
    contact_email,
    contact_phone,
    business_type,
    message,
    status
) VALUES (
    'Empresa Teste',
    'João Silva',
    'joao@teste.com',
    '(16) 99999-9999',
    'varejo',
    'Gostaria de conhecer o sistema',
    'novo'
);

-- ========================================
-- SOLUÇÃO: Se RLS estiver bloqueando
-- ========================================

-- Desabilitar RLS temporariamente para admin ver todos os leads
ALTER TABLE landing_leads DISABLE ROW LEVEL SECURITY;

-- OU criar política que permite admin ver tudo
CREATE POLICY landing_leads_admin_all ON landing_leads
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ========================================
-- VERIFICAR NOVAMENTE
-- ========================================

SELECT COUNT(*) as total_leads FROM landing_leads;
SELECT * FROM landing_leads ORDER BY created_at DESC LIMIT 5;
