-- ========================================
-- CRIAR TABELA LANDING_LEADS (VERSÃO CORRETA)
-- ========================================

-- 1. Deletar tabela antiga se existir (cuidado: apaga dados!)
-- DROP TABLE IF EXISTS landing_leads CASCADE;

-- 2. Criar tabela com nomes corretos das colunas
CREATE TABLE IF NOT EXISTS landing_leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_name TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    business_type TEXT,
    message TEXT,
    status TEXT DEFAULT 'novo' CHECK (status IN ('novo', 'contatado', 'convertido', 'descartado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_landing_leads_status ON landing_leads(status);
CREATE INDEX IF NOT EXISTS idx_landing_leads_created_at ON landing_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_landing_leads_email ON landing_leads(email);

-- 4. Desabilitar RLS (permite acesso público para INSERT e admin para SELECT)
ALTER TABLE landing_leads DISABLE ROW LEVEL SECURITY;

-- 5. Inserir lead de teste
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
    '(16) 99999-9999',
    'varejo',
    'Gostaria de conhecer o sistema',
    'novo'
);

-- 6. Verificar se funcionou
SELECT 
    id,
    company_name,
    name,
    email,
    phone,
    business_type,
    status,
    created_at
FROM landing_leads
ORDER BY created_at DESC;

-- ========================================
-- RESULTADO ESPERADO:
-- ========================================
-- Deve aparecer 1 lead (o de teste)
-- com todos os campos preenchidos

-- ========================================
-- SE JÁ EXISTIR TABELA COM NOMES ERRADOS:
-- ========================================

-- Opção 1: Renomear colunas (mantém dados)
/*
ALTER TABLE landing_leads RENAME COLUMN contact_name TO name;
ALTER TABLE landing_leads RENAME COLUMN contact_email TO email;
ALTER TABLE landing_leads RENAME COLUMN contact_phone TO phone;
*/

-- Opção 2: Deletar e recriar (perde dados)
/*
DROP TABLE IF EXISTS landing_leads CASCADE;
-- Depois execute o CREATE TABLE acima
*/
