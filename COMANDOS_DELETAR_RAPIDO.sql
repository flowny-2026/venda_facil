-- ========================================
-- COMANDOS RÁPIDOS PARA DELETAR
-- ========================================
-- As funções já foram criadas! ✅
-- Agora é só usar os comandos abaixo
-- ========================================

-- ========================================
-- 1. VER TODOS OS USUÁRIOS
-- ========================================
SELECT 
    email,
    created_at,
    id
FROM auth.users
ORDER BY created_at DESC;


-- ========================================
-- 2. VER TODAS AS EMPRESAS
-- ========================================
SELECT 
    name,
    email,
    created_at,
    id
FROM companies
ORDER BY created_at DESC;


-- ========================================
-- 3. DELETAR USUÁRIO (substitua o email)
-- ========================================
SELECT delete_user_cascade('loja@empresa.com');

-- Exemplos:
-- SELECT delete_user_cascade('jose@empresa.com');
-- SELECT delete_user_cascade('maria@empresa.com');


-- ========================================
-- 4. DELETAR EMPRESA (substitua o nome)
-- ========================================
SELECT delete_company_cascade('Minha Loja');

-- Exemplos:
-- SELECT delete_company_cascade('Loja ABC');
-- SELECT delete_company_cascade('Empresa Teste');


-- ========================================
-- 5. DELETAR MÚLTIPLOS USUÁRIOS DE UMA VEZ
-- ========================================
DO $$
DECLARE
    resultado TEXT;
BEGIN
    -- Adicione os emails que quer deletar
    SELECT delete_user_cascade('usuario1@email.com') INTO resultado;
    RAISE NOTICE '%', resultado;
    
    SELECT delete_user_cascade('usuario2@email.com') INTO resultado;
    RAISE NOTICE '%', resultado;
    
    SELECT delete_user_cascade('usuario3@email.com') INTO resultado;
    RAISE NOTICE '%', resultado;
END $$;


-- ========================================
-- 6. DELETAR MÚLTIPLAS EMPRESAS DE UMA VEZ
-- ========================================
DO $$
DECLARE
    resultado TEXT;
BEGIN
    -- Adicione os nomes das empresas que quer deletar
    SELECT delete_company_cascade('Empresa 1') INTO resultado;
    RAISE NOTICE '%', resultado;
    
    SELECT delete_company_cascade('Empresa 2') INTO resultado;
    RAISE NOTICE '%', resultado;
END $$;


-- ========================================
-- 7. LIMPAR TUDO (EXCETO ADMIN)
-- ========================================
-- ⚠️ CUIDADO! Isso deleta TODOS os dados
-- Descomente para usar:

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
-- 8. VERIFICAR O QUE FOI DELETADO
-- ========================================
SELECT 
    'Empresas' as tabela, 
    COUNT(*) as total 
FROM companies
UNION ALL
SELECT 'Usuários', COUNT(*) FROM auth.users
UNION ALL
SELECT 'Vínculos', COUNT(*) FROM company_users
UNION ALL
SELECT 'Vendedores', COUNT(*) FROM sellers
UNION ALL
SELECT 'Leads', COUNT(*) FROM landing_leads;


-- ========================================
-- 9. VER DETALHES DE UM USUÁRIO ESPECÍFICO
-- ========================================
-- Substitua o email para ver os vínculos
SELECT 
    u.email,
    u.created_at as usuario_criado_em,
    c.name as empresa_vinculada,
    cu.role as cargo,
    cu.created_at as vinculo_criado_em
FROM auth.users u
LEFT JOIN company_users cu ON cu.user_id = u.id
LEFT JOIN companies c ON c.id = cu.company_id
WHERE u.email = 'loja@empresa.com';


-- ========================================
-- 10. VER DETALHES DE UMA EMPRESA ESPECÍFICA
-- ========================================
-- Substitua o nome para ver os vínculos
SELECT 
    c.name as empresa,
    c.email as email_empresa,
    COUNT(DISTINCT s.id) as total_vendedores,
    COUNT(DISTINCT cu.user_id) as total_usuarios,
    STRING_AGG(DISTINCT u.email, ', ') as emails_usuarios
FROM companies c
LEFT JOIN sellers s ON s.company_id = c.id
LEFT JOIN company_users cu ON cu.company_id = c.id
LEFT JOIN auth.users u ON u.id = cu.user_id
WHERE c.name = 'Minha Loja'
GROUP BY c.id, c.name, c.email;


-- ========================================
-- 📋 EXEMPLOS PRÁTICOS
-- ========================================

-- Exemplo 1: Ver todos os usuários e deletar um específico
/*
-- 1. Ver lista
SELECT email FROM auth.users ORDER BY created_at DESC;

-- 2. Deletar
SELECT delete_user_cascade('jose@empresa.com');

-- 3. Confirmar
SELECT email FROM auth.users ORDER BY created_at DESC;
*/


-- Exemplo 2: Ver todas as empresas e deletar uma específica
/*
-- 1. Ver lista
SELECT name FROM companies ORDER BY created_at DESC;

-- 2. Deletar
SELECT delete_company_cascade('Loja Teste');

-- 3. Confirmar
SELECT name FROM companies ORDER BY created_at DESC;
*/


-- ========================================
-- 🎯 DICAS
-- ========================================

/*
✅ MENSAGENS DE SUCESSO:
- "✅ Usuário deletado: email@exemplo.com (2 vínculos removidos)"
- "✅ Empresa deletada: Minha Loja (3 vendedores, 2 usuários removidos)"

❌ MENSAGENS DE ERRO:
- "❌ Usuário não encontrado: email@exemplo.com"
- "❌ Empresa não encontrada: Nome da Empresa"

💡 LEMBRE-SE:
- Copie o email/nome EXATAMENTE como aparece no banco
- Use aspas simples: 'email@exemplo.com'
- Maiúsculas e minúsculas importam!
- A exclusão é PERMANENTE e IRREVERSÍVEL
*/
