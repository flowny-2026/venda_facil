-- ========================================
-- TESTAR EXCLUSÃO DE USUÁRIO
-- ========================================

-- 1. LISTAR TODOS OS USUÁRIOS VENDEDORES
SELECT 
  '1. USUARIOS DISPONIVEIS' as categoria,
  u.email,
  c.name as empresa,
  s.name as vendedor,
  cu.role,
  (SELECT COUNT(*) FROM sales WHERE user_id = u.id) as total_vendas
FROM auth.users u
LEFT JOIN company_users cu ON cu.user_id = u.id
LEFT JOIN companies c ON cu.company_id = c.id
LEFT JOIN sellers s ON cu.seller_id = s.id
WHERE u.email LIKE '%@empresa.com'
ORDER BY u.email;

-- ========================================
-- PARA TESTAR A EXCLUSÃO:
-- ========================================
-- Descomente a linha abaixo e substitua pelo email do usuário que deseja testar
-- SELECT delete_user_cascade('usuario@empresa.com');

-- ========================================
-- EXEMPLO: Excluir um usuário de teste
-- ========================================
-- Se você criou um usuário de teste, pode excluí-lo assim:
-- SELECT delete_user_cascade('teste@empresa.com');

-- ========================================
-- VERIFICAR SE USUÁRIO FOI DELETADO
-- ========================================
-- Após executar a exclusão, verifique:

-- 2. Verificar se usuário ainda existe no auth.users
SELECT 
  '2. VERIFICAR AUTH.USERS' as categoria,
  COUNT(*) as usuarios_encontrados,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ Usuário foi deletado'
    ELSE '❌ Usuário ainda existe'
  END as status
FROM auth.users
WHERE email = 'SUBSTITUA_PELO_EMAIL_TESTADO';

-- 3. Verificar se vinculação foi removida
SELECT 
  '3. VERIFICAR COMPANY_USERS' as categoria,
  COUNT(*) as vinculos_encontrados,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ Vinculação foi removida'
    ELSE '❌ Vinculação ainda existe'
  END as status
FROM company_users cu
JOIN auth.users u ON cu.user_id = u.id
WHERE u.email = 'SUBSTITUA_PELO_EMAIL_TESTADO';

-- 4. Verificar se vendas foram mantidas (desvinculadas)
SELECT 
  '4. VERIFICAR VENDAS' as categoria,
  COUNT(*) as vendas_desvinculadas,
  '✅ Vendas mantidas para histórico' as status
FROM sales
WHERE user_id IS NULL;

-- ========================================
-- INSTRUÇÕES DE TESTE NO PAINEL ADMIN
-- ========================================
SELECT 
  '5. COMO TESTAR NO PAINEL' as categoria,
  'PASSO 1: Acesse o painel admin' as passo_1,
  'PASSO 2: Clique em "Gerenciar Clientes"' as passo_2,
  'PASSO 3: Clique no ícone 👁️ (Ver detalhes) de uma empresa' as passo_3,
  'PASSO 4: Na lista de usuários, clique no ícone 🗑️ ao lado do usuário' as passo_4,
  'PASSO 5: Confirme a exclusão' as passo_5,
  'PASSO 6: Atualize a página (F5)' as passo_6,
  'RESULTADO: O usuário NÃO deve aparecer mais na lista' as resultado;
