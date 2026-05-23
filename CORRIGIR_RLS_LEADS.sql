-- ========================================
-- CORRIGIR RLS DA TABELA LANDING_LEADS
-- ========================================

-- Problema: Tabela tem política INSERT mas não tem SELECT
-- Resultado: Leads são salvos mas não aparecem no painel admin

-- ========================================
-- PASSO 1: Ver políticas atuais
-- ========================================

SELECT 
    policyname,
    cmd,
    roles,
    qual
FROM pg_policies
WHERE tablename = 'landing_leads';

-- ========================================
-- PASSO 2: Adicionar política SELECT
-- ========================================

-- Permitir que usuários autenticados leiam os leads
CREATE POLICY "leads_select" ON landing_leads
    FOR SELECT
    TO authenticated
    USING (true);

-- ========================================
-- PASSO 3: Verificar se funcionou
-- ========================================

-- Ver todas as políticas
SELECT 
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE tablename = 'landing_leads'
ORDER BY cmd;

-- Resultado esperado:
-- | policyname   | cmd    | roles         |
-- | leads_insert | INSERT | anon          |
-- | leads_select | SELECT | authenticated |

-- ========================================
-- PASSO 4: Testar leitura
-- ========================================

-- Ver todos os leads (deve funcionar agora)
SELECT 
    id,
    company_name,
    name,
    email,
    phone,
    status,
    created_at
FROM landing_leads
ORDER BY created_at DESC;

-- ========================================
-- ALTERNATIVA: Se quiser permitir leitura para todos
-- ========================================

-- Se preferir que qualquer usuário (mesmo não autenticado) possa ler:
-- DROP POLICY IF EXISTS "leads_select" ON landing_leads;
-- 
-- CREATE POLICY "leads_select" ON landing_leads
--     FOR SELECT
--     TO public
--     USING (true);

-- ========================================
-- EXPLICAÇÃO DAS POLÍTICAS
-- ========================================

-- leads_insert (INSERT, anon):
--   - Permite que usuários NÃO autenticados (anon) insiram leads
--   - Usado pelo formulário da landing page
--   - Qualquer pessoa pode enviar um lead
--
-- leads_select (SELECT, authenticated):
--   - Permite que usuários AUTENTICADOS leiam os leads
--   - Usado pelo painel admin
--   - Apenas admins logados podem ver os leads
--
-- ========================================
