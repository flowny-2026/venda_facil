-- ========================================
-- VERIFICAR PERMISSÕES DE UPDATE NA TABELA LANDING_LEADS
-- ========================================

-- Ver todas as políticas RLS da tabela
SELECT 
    policyname,
    cmd,
    roles,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'landing_leads'
ORDER BY cmd;

-- Resultado esperado:
-- | policyname   | cmd    | roles           |
-- | leads_insert | INSERT | {public}        |
-- | leads_select | SELECT | {authenticated} |
-- | leads_update | UPDATE | {authenticated} | ← ESTA PODE ESTAR FALTANDO!

-- ========================================
-- SOLUÇÃO: ADICIONAR POLÍTICA UPDATE
-- ========================================

-- Se não houver política UPDATE, criar:
CREATE POLICY "leads_update" ON landing_leads
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ========================================
-- VERIFICAR SE FUNCIONOU
-- ========================================

-- Ver as políticas novamente
SELECT 
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE tablename = 'landing_leads'
ORDER BY cmd;

-- Testar UPDATE manualmente
-- (substitua o ID por um ID real da sua tabela)
UPDATE landing_leads 
SET status = 'contatado' 
WHERE id = 'SEU_ID_AQUI';

-- Ver se funcionou
SELECT id, status, updated_at FROM landing_leads 
WHERE id = 'SEU_ID_AQUI';

-- ========================================
-- POLÍTICA COMPLETA RECOMENDADA
-- ========================================

-- Para maior segurança, você pode criar uma política mais específica:
-- DROP POLICY IF EXISTS "leads_update" ON landing_leads;
-- 
-- CREATE POLICY "leads_update" ON landing_leads
--     FOR UPDATE
--     TO authenticated
--     USING (true)  -- Qualquer usuário autenticado pode atualizar
--     WITH CHECK (status IN ('novo', 'contatado', 'convertido', 'descartado'));  -- Só permite status válidos