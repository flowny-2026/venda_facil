-- ========================================
-- CORREÇÃO: Função delete_user_cascade
-- ========================================
-- Problema: Usuário tem vendedores vinculados em sellers.created_by
-- Solução: Deletar vendedores antes de deletar o usuário
-- ========================================

-- Substituir a função antiga pela nova versão corrigida
CREATE OR REPLACE FUNCTION delete_user_cascade(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
    user_uuid UUID;
    company_users_count INT := 0;
    sellers_created_count INT := 0;
    sellers_linked_count INT := 0;
BEGIN
    -- Buscar ID do usuário
    SELECT id INTO user_uuid FROM auth.users WHERE email = user_email;
    
    IF user_uuid IS NULL THEN
        RETURN '❌ Usuário não encontrado: ' || user_email;
    END IF;
    
    -- 1. Deletar vendedores CRIADOS por este usuário (created_by)
    DELETE FROM sellers WHERE created_by = user_uuid;
    GET DIAGNOSTICS sellers_created_count = ROW_COUNT;
    
    -- 2. Deletar vendedores VINCULADOS a este usuário (user_id)
    DELETE FROM sellers WHERE user_id = user_uuid;
    GET DIAGNOSTICS sellers_linked_count = ROW_COUNT;
    
    -- 3. Deletar vínculos com empresas
    DELETE FROM company_users WHERE user_id = user_uuid;
    GET DIAGNOSTICS company_users_count = ROW_COUNT;
    
    -- 4. Deletar o usuário
    DELETE FROM auth.users WHERE id = user_uuid;
    
    RETURN '✅ Usuário deletado: ' || user_email || 
           ' (vendedores criados: ' || sellers_created_count || 
           ', vendedores vinculados: ' || sellers_linked_count ||
           ', vínculos empresa: ' || company_users_count || ')';
EXCEPTION
    WHEN OTHERS THEN
        RETURN '❌ Erro ao deletar usuário: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ========================================
-- TESTE: Execute a função novamente
-- ========================================

-- Substitua pelo email que deu erro
SELECT delete_user_cascade('usuario@email.com');


-- ========================================
-- VERIFICAR: Ver quem criou vendedores
-- ========================================

-- Ver todos os usuários e quantos vendedores cada um criou
SELECT 
    u.email,
    COUNT(s.id) as vendedores_criados,
    STRING_AGG(s.name, ', ') as nomes_vendedores
FROM auth.users u
LEFT JOIN sellers s ON s.created_by = u.id
GROUP BY u.id, u.email
HAVING COUNT(s.id) > 0
ORDER BY COUNT(s.id) DESC;


-- ========================================
-- ALTERNATIVA: Deletar usuário específico manualmente
-- ========================================

-- Se a função ainda não funcionar, use este código:
/*
DO $$
DECLARE
    user_uuid UUID;
    user_email_var TEXT := 'usuario@email.com'; -- SUBSTITUA AQUI
BEGIN
    -- Buscar ID do usuário
    SELECT id INTO user_uuid FROM auth.users WHERE email = user_email_var;
    
    IF user_uuid IS NOT NULL THEN
        -- 1. Deletar vendedores criados por este usuário
        DELETE FROM sellers WHERE created_by = user_uuid;
        RAISE NOTICE '✅ Vendedores criados deletados';
        
        -- 2. Deletar vendedores vinculados a este usuário
        DELETE FROM sellers WHERE user_id = user_uuid;
        RAISE NOTICE '✅ Vendedores vinculados deletados';
        
        -- 3. Deletar vínculos com empresas
        DELETE FROM company_users WHERE user_id = user_uuid;
        RAISE NOTICE '✅ Vínculos com empresas deletados';
        
        -- 4. Deletar o usuário
        DELETE FROM auth.users WHERE id = user_uuid;
        RAISE NOTICE '✅ Usuário deletado: %', user_email_var;
    ELSE
        RAISE NOTICE '❌ Usuário não encontrado: %', user_email_var;
    END IF;
END $$;
*/
