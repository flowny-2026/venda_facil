-- ========================================
-- VERIFICAR E CORRIGIR PERMISSÕES DA LOJATEM
-- ========================================

-- ========================================
-- PASSO 1: Verificar situação atual
-- ========================================

-- Ver todos os super_admins
SELECT 
    u.email,
    cu.role,
    cu.active,
    c.name as company_name
FROM auth.users u
JOIN company_users cu ON cu.user_id = u.id
LEFT JOIN companies c ON c.id = cu.company_id
WHERE cu.role = 'super_admin'
ORDER BY u.email;

-- Resultado esperado: APENAS edicharlesbrito2009@hotmail.com

-- ========================================
-- PASSO 2: Ver a situação da lojatem
-- ========================================

SELECT 
    u.email,
    cu.role,
    cu.active,
    c.name as company_name
FROM auth.users u
JOIN company_users cu ON cu.user_id = u.id
LEFT JOIN companies c ON c.id = cu.company_id
WHERE u.email = 'lojatem@empresa.com';

-- Resultado esperado: role = 'manager'

-- ========================================
-- PASSO 3: Corrigir se necessário
-- ========================================

-- Se a lojatem ainda estiver como super_admin, execute:

UPDATE company_users
SET role = 'manager'
WHERE user_id = (
    SELECT id FROM auth.users WHERE email = 'lojatem@empresa.com'
)
AND role = 'super_admin';

-- ========================================
-- PASSO 4: Verificação final
-- ========================================

-- Ver TODOS os usuários e suas roles
SELECT 
    u.email,
    cu.role,
    cu.active,
    c.name as company_name
FROM auth.users u
JOIN company_users cu ON cu.user_id = u.id
LEFT JOIN companies c ON c.id = cu.company_id
ORDER BY 
    CASE cu.role
        WHEN 'super_admin' THEN 1
        WHEN 'owner' THEN 2
        WHEN 'manager' THEN 3
        WHEN 'seller' THEN 4
        ELSE 5
    END,
    u.email;

-- ========================================
-- RESULTADO ESPERADO
-- ========================================
-- 
-- | email                           | role        | active | company_name     |
-- | ------------------------------- | ----------- | ------ | ---------------- |
-- | edicharlesbrito2009@hotmail.com | super_admin | true   | VendaFácil Admin |
-- | lojatem@empresa.com             | manager     | true   | lojatem          |
-- | loja01@empresa.com              | manager     | true   | [empresa]        |
-- | bete@empresa.com                | seller      | true   | lojatem          |
-- | maria@empresa.com               | seller      | true   | lojatem          |
--
-- ========================================

-- ========================================
-- EXPLICAÇÃO DAS ROLES
-- ========================================
--
-- super_admin:
--   - Acessa o PAINEL ADMIN (http://localhost:5174)
--   - Gerencia TODAS as empresas
--   - Cria novas empresas
--   - Vê leads da landing page
--   - APENAS: edicharlesbrito2009@hotmail.com
--
-- manager:
--   - Acessa o PAINEL CLIENTE (http://localhost:5173)
--   - Gerencia SUA empresa
--   - Cadastra produtos, vendedores
--   - Usa o PDV
--   - Vê relatórios da empresa
--   - Exemplos: lojatem@empresa.com, loja01@empresa.com
--
-- seller:
--   - Acessa o PAINEL CLIENTE (http://localhost:5173)
--   - Usa o PDV
--   - Vê apenas suas próprias vendas
--   - Exemplos: bete@empresa.com, maria@empresa.com
--
-- ========================================
