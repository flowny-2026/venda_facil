-- ========================================
-- VERIFICAR ESTRUTURA DA TABELA LANDING_LEADS
-- ========================================

-- Ver todas as colunas da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'landing_leads'
ORDER BY ordinal_position;

-- Ver alguns dados da tabela para entender a estrutura
SELECT * FROM landing_leads LIMIT 3;

-- ========================================
-- SOLUÇÃO: ADICIONAR COLUNA STATUS
-- ========================================

-- Se a coluna status não existir, adicionar:
ALTER TABLE landing_leads 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'novo';

-- Atualizar leads existentes para ter status 'novo'
UPDATE landing_leads 
SET status = 'novo' 
WHERE status IS NULL;

-- Verificar se funcionou
SELECT 
    id,
    company_name,
    name,
    email,
    status,
    created_at
FROM landing_leads
ORDER BY created_at DESC
LIMIT 5;