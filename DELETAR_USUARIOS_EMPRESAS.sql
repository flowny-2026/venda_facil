-- ========================================
-- SCRIPT: DELETAR USUÁRIOS E EMPRESAS
-- ========================================
-- Data: 25/04/2026
-- Projeto: VendaFácil
-- ========================================

-- ========================================
-- PARTE 1: CRIAR FUNÇÕES AUTOMÁTICAS
-- ========================================

-- Função para deletar usuário com todos os vínculos
CREATE OR REPLACE FUNCTION delete_user_cascade(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
    user_uuid UUID;
    deleted_count INT := 0;
BEGIN
    -- Buscar ID do usuário
    SELECT id INTO user_uuid FROM auth.users WHERE email = user_email;
    
    IF user_uuid IS NULL THEN
        RETURN '❌ Usuário não encontrado: ' || user_email;
    END IF;
    
    -- Deletar vínculos com empresas
    DELETE FROM company_users WHERE user_id = user_uuid;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Deletar usuário da autenticação
    DELETE FROM auth.users WHERE id = user_uuid;
    
    RETURN '✅ Usuário deletado: ' || user_email || ' (' || deleted_count || ' vínculos removidos)';
EXCEPTION
    WHEN OTHERS THEN
        RETURN '❌ Erro ao deletar usuário: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Função para deletar empresa com todos os vínculos
CREATE OR REPLACE FUNCTION delete_company_cascade(company_name TEXT)
RETURNS TEXT AS $$
DECLARE
    company_uuid UUID;
    sellers_count INT := 0;
    users_count INT := 0;
BEGIN
    -- Buscar ID da empresa
    SELECT id INTO company_uuid FROM companies WHERE name = company_name;
    
    IF company_uuid IS NULL THEN
        RETURN '❌ Empresa não encontrada: ' || company_name;
    END IF;
    
    -- Deletar vendedores da empresa
    DELETE FROM sellers WHERE company_id = company_uuid;
    GET DIAGNOSTICS sellers_count = ROW_COUNT;
    
    -- Deletar vínculos de usuários
    DELETE FROM company_users WHERE company_id = company_uuid;
    GET DIAGNOSTICS users_count = ROW_COUNT;
    
    -- Deletar a empresa
    DELETE FROM companies WHERE id = company_uuid;
    
    RETURN '✅ Empresa deletada: ' || company_name || 
           ' (' || sellers_count || ' vendedores, ' || 
           users_count || ' usuários removidos)';
EXCEPTION
    WHEN OTHERS THEN
        RETURN '❌ Erro ao deletar empresa: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ========================================
-- PARTE 2: EXEMPLOS DE USO
-- ========================================

-- DELETAR USUÁRIO ESPECÍFICO
-- SELECT delete_user_cascade('loja@empresa.com');

-- DELETAR EMPRESA ESPECÍFICA
-- SELECT delete_company_cascade('Minha Loja');


-- ========================================
-- PARTE 3: DELETAR MANUALMENTE (ALTERNATIVA)
-- ========================================

-- A) Deletar um usuário específico pelo email
/*
DO $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Buscar ID do usuário
    SELECT id INTO user_uuid FROM auth.users WHERE email = 'loja@empresa.com';
    
    IF user_uuid IS NOT NULL THEN
        -- Deletar vínculos
        DELETE FROM company_users WHERE user_id = user_uuid;
        
        -- Deletar usuário
        DELETE FROM auth.users WHERE id = user_uuid;
        
        RAISE NOTICE '✅ Usuário deletado com sucesso!';
    ELSE
        RAISE NOTICE '❌ Usuário não encontrado!';
    END IF;
END $$;
*/


-- B) Deletar uma empresa específica pelo nome
/*
DO $$
DECLARE
    company_uuid UUID;
BEGIN
    -- Buscar ID da empresa
    SELECT id INTO company_uuid FROM companies WHERE name = 'Minha Loja';
    
    IF company_uuid IS NOT NULL THEN
        -- Deletar vendedores
        DELETE FROM sellers WHERE company_id = company_uuid;
        
        -- Deletar vínculos de usuários
        DELETE FROM company_users WHERE company_id = company_uuid;
        
        -- Deletar empresa
        DELETE FROM companies WHERE id = company_uuid;
        
        RAISE NOTICE '✅ Empresa deletada com sucesso!';
    ELSE
        RAISE NOTICE '❌ Empresa não encontrada!';
    END IF;
END $$;
*/


-- ========================================
-- PARTE 4: LIMPAR TUDO (RESET COMPLETO)
-- ========================================

-- ⚠️ CUIDADO! Isso deleta TODOS os dados (exceto admin)
/*
DO $$
BEGIN
    -- Deletar todos os vendedores
    DELETE FROM sellers;
    RAISE NOTICE '✅ Vendedores deletados';
    
    -- Deletar todos os vínculos
    DELETE FROM company_users;
    RAISE NOTICE '✅ Vínculos deletados';
    
    -- Deletar todas as empresas
    DELETE FROM companies;
    RAISE NOTICE '✅ Empresas deletadas';
    
    -- Deletar todos os usuários (exceto admin)
    DELETE FROM auth.users 
    WHERE email != 'edicharlesbrito2009@hotmail.com';
    RAISE NOTICE '✅ Usuários deletados (admin preservado)';
    
    RAISE NOTICE '🎉 Banco de dados limpo!';
END $$;
*/


-- ========================================
-- PARTE 5: VERIFICAÇÕES
-- ========================================

-- Ver todos os usuários e seus vínculos
SELECT 
    u.email,
    u.created_at,
    COUNT(DISTINCT cu.company_id) as empresas_vinculadas,
    STRING_AGG(DISTINCT c.name, ', ') as empresas
FROM auth.users u
LEFT JOIN company_users cu ON cu.user_id = u.id
LEFT JOIN companies c ON c.id = cu.company_id
GROUP BY u.id, u.email, u.created_at
ORDER BY u.created_at DESC;


-- Ver todas as empresas e seus vínculos
SELECT 
    c.name as empresa,
    c.created_at,
    COUNT(DISTINCT s.id) as vendedores,
    COUNT(DISTINCT cu.user_id) as usuarios
FROM companies c
LEFT JOIN sellers s ON s.company_id = c.id
LEFT JOIN company_users cu ON cu.company_id = c.id
GROUP BY c.id, c.name, c.created_at
ORDER BY c.created_at DESC;


-- Contar registros em todas as tabelas
SELECT 
    'companies' as tabela, 
    COUNT(*) as total 
FROM companies
UNION ALL
SELECT 'auth.users', COUNT(*) FROM auth.users
UNION ALL
SELECT 'company_users', COUNT(*) FROM company_users
UNION ALL
SELECT 'sellers', COUNT(*) FROM sellers
UNION ALL
SELECT 'landing_leads', COUNT(*) FROM landing_leads;


-- ========================================
-- PARTE 6: MODIFICAR FOREIGN KEYS (OPCIONAL)
-- ========================================

-- Isso faz com que o Supabase delete automaticamente
-- os registros relacionados quando você deletar um usuário/empresa

/*
-- Remover constraints antigas
ALTER TABLE company_users 
    DROP CONSTRAINT IF EXISTS company_users_user_id_fkey,
    DROP CONSTRAINT IF EXISTS company_users_company_id_fkey;

ALTER TABLE sellers 
    DROP CONSTRAINT IF EXISTS sellers_company_id_fkey;

-- Adicionar constraints com CASCADE
ALTER TABLE company_users
    ADD CONSTRAINT company_users_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    
    ADD CONSTRAINT company_users_company_id_fkey 
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

ALTER TABLE sellers
    ADD CONSTRAINT sellers_company_id_fkey 
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

-- Verificar (deve mostrar 'd' = CASCADE)
SELECT 
    conname as constraint_name,
    conrelid::regclass as table_name,
    CASE confdeltype
        WHEN 'a' THEN 'NO ACTION'
        WHEN 'r' THEN 'RESTRICT'
        WHEN 'c' THEN 'CASCADE'
        WHEN 'n' THEN 'SET NULL'
        WHEN 'd' THEN 'SET DEFAULT'
    END as delete_action
FROM pg_constraint
WHERE contype = 'f'
AND conrelid::regclass::text IN ('company_users', 'sellers')
ORDER BY table_name, constraint_name;
*/


-- ========================================
-- 📋 INSTRUÇÕES DE USO
-- ========================================

/*
OPÇÃO 1 - USAR FUNÇÕES (RECOMENDADO):
1. Execute a PARTE 1 deste script (criar funções)
2. Use os comandos:
   SELECT delete_user_cascade('email@usuario.com');
   SELECT delete_company_cascade('Nome da Empresa');

OPÇÃO 2 - DELETAR MANUALMENTE:
1. Descomente o bloco da PARTE 3
2. Substitua o email/nome
3. Execute

OPÇÃO 3 - LIMPAR TUDO:
1. Descomente o bloco da PARTE 4
2. Execute (CUIDADO: deleta tudo!)

OPÇÃO 4 - CASCADE AUTOMÁTICO:
1. Descomente o bloco da PARTE 6
2. Execute uma vez
3. Depois disso, deletar no Supabase UI funcionará automaticamente
*/


-- ========================================
-- ✅ TESTE RÁPIDO
-- ========================================

-- Após executar a PARTE 1, teste com:
-- SELECT delete_user_cascade('teste@teste.com');
-- (deve retornar "Usuário não encontrado" se não existir)
