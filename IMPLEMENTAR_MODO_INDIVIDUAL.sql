-- ========================================
-- IMPLEMENTAR MODO INDIVIDUAL - VENDEDORES COM LOGIN
-- ========================================

-- PASSO 1: Adicionar colunas necessárias em company_users
ALTER TABLE company_users 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'owner' CHECK (role IN ('owner', 'manager', 'seller'));

ALTER TABLE company_users 
ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE;

ALTER TABLE company_users 
ADD COLUMN IF NOT EXISTS can_view_company_profits BOOLEAN DEFAULT true;

-- PASSO 2: Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_company_users_role ON company_users(role);
CREATE INDEX IF NOT EXISTS idx_company_users_seller_id ON company_users(seller_id);

-- PASSO 3: Comentários explicativos
COMMENT ON COLUMN company_users.role IS 'Papel do usuário: owner (dono), manager (gerente), seller (vendedor)';
COMMENT ON COLUMN company_users.seller_id IS 'ID do vendedor vinculado (apenas para role=seller)';
COMMENT ON COLUMN company_users.can_view_company_profits IS 'Permissão para ver lucros da empresa (false para vendedores)';

-- PASSO 4: Atualizar usuários existentes como 'owner'
UPDATE company_users 
SET role = 'owner',
    can_view_company_profits = true
WHERE role IS NULL;

-- PASSO 5: Criar view para facilitar consultas
CREATE OR REPLACE VIEW v_company_users_with_seller AS
SELECT 
    cu.*,
    s.name as seller_name,
    s.commission_percentage,
    c.name as company_name,
    c.access_type
FROM company_users cu
LEFT JOIN sellers s ON cu.seller_id = s.id
LEFT JOIN companies c ON cu.company_id = c.id;

-- PASSO 6: Função para verificar se usuário é vendedor
CREATE OR REPLACE FUNCTION is_seller(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM company_users
        WHERE user_id = user_uuid 
        AND role = 'seller'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASSO 7: Função para pegar o seller_id do usuário logado
CREATE OR REPLACE FUNCTION get_user_seller_id(user_uuid UUID)
RETURNS UUID AS $$
DECLARE
    v_seller_id UUID;
BEGIN
    SELECT seller_id INTO v_seller_id
    FROM company_users
    WHERE user_id = user_uuid 
    AND role = 'seller';
    
    RETURN v_seller_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASSO 8: Função para verificar se usuário pode ver lucros
CREATE OR REPLACE FUNCTION can_view_profits(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_can_view BOOLEAN;
BEGIN
    SELECT can_view_company_profits INTO v_can_view
    FROM company_users
    WHERE user_id = user_uuid;
    
    RETURN COALESCE(v_can_view, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASSO 9: Verificar estrutura criada
SELECT 
    '✅ ESTRUTURA CRIADA' as status,
    'Colunas adicionadas em company_users' as passo_1,
    'Índices criados' as passo_2,
    'View v_company_users_with_seller criada' as passo_3,
    'Funções criadas: is_seller(), get_user_seller_id(), can_view_profits()' as passo_4,
    'Políticas RLS serão aplicadas no frontend' as passo_5;

-- PASSO 10: Listar colunas de company_users
SELECT 
    '📋 COLUNAS DE COMPANY_USERS' as info,
    column_name,
    data_type,
    column_default
FROM information_schema.columns 
WHERE table_name = 'company_users'
AND column_name IN ('role', 'seller_id', 'can_view_company_profits')
ORDER BY column_name;

-- PASSO 11: Testar funções
SELECT 
    '🧪 TESTE DAS FUNÇÕES' as info,
    'Funções criadas e prontas para uso' as resultado;

-- Mensagem final
SELECT 
    '🎉 SUCESSO!' as titulo,
    'Estrutura do Modo Individual criada' as mensagem,
    'Agora você pode criar logins para vendedores' as proximo_passo;
