-- ========================================
-- DIAGNÓSTICO COMPLETO - LEADS
-- ========================================

-- ========================================
-- PASSO 1: Verificar se a tabela existe
-- ========================================

SELECT 
    table_name,
    table_type
FROM information_schema.tables
WHERE table_name = 'landing_leads';

-- ========================================
-- PASSO 2: Ver a estrutura da tabela
-- ========================================

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'landing_leads'
ORDER BY ordinal_position;

-- ========================================
-- PASSO 3: Ver TODOS os leads (sem filtro)
-- ========================================

SELECT 
    id,
    company_name,
    name,
    email,
    phone,
    business_type,
    message,
    status,
    created_at
FROM landing_leads
ORDER BY created_at DESC;

-- Se não retornar nada, a tabela está vazia!

-- ========================================
-- PASSO 4: Contar quantos leads existem
-- ========================================

SELECT COUNT(*) as total_leads FROM landing_leads;

-- ========================================
-- PASSO 5: Verificar RLS (Row Level Security)
-- ========================================

-- Ver se RLS está habilitado
SELECT 
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'landing_leads';

-- Ver as políticas RLS
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

-- ========================================
-- PASSO 6: Testar INSERT manual
-- ========================================

-- Tente inserir um lead de teste:
INSERT INTO landing_leads (
    company_name,
    name,
    email,
    phone,
    business_type,
    message,
    status
) VALUES (
    'Empresa Teste',
    'João Silva',
    'joao@teste.com',
    '16999999999',
    'varejo',
    'Mensagem de teste',
    'novo'
);

-- Depois veja se apareceu:
SELECT * FROM landing_leads WHERE email = 'joao@teste.com';

-- ========================================
-- PASSO 7: Verificar permissões da tabela
-- ========================================

SELECT 
    grantee,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'landing_leads';

-- ========================================
-- RESULTADO ESPERADO
-- ========================================
-- 
-- Se PASSO 3 retornar vazio:
--   → A tabela existe mas não tem dados
--   → O formulário da landing page não está salvando
--
-- Se PASSO 5 mostrar RLS habilitado:
--   → Pode estar bloqueando a leitura dos leads
--   → Precisamos ajustar as políticas
--
-- Se PASSO 6 der erro:
--   → Problema de permissões ou estrutura da tabela
--
-- ========================================
