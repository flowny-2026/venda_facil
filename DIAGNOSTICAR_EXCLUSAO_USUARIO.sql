-- ========================================
-- DIAGNOSTICAR PROBLEMA DE EXCLUSÃO
-- ========================================

-- 1. Verificar se a função existe e está acessível
SELECT 
  '1. FUNCAO EXISTE?' as categoria,
  proname as nome_funcao,
  pronamespace::regnamespace as schema,
  prosecdef as security_definer,
  CASE 
    WHEN proname = 'delete_user_cascade' THEN '✅ Função existe'
    ELSE '❌ Função não encontrada'
  END as status
FROM pg_proc
WHERE proname = 'delete_user_cascade';

-- 2. Testar a função com um usuário real
-- Liste os usuários disponíveis primeiro
SELECT 
  '2. USUARIOS DISPONIVEIS PARA TESTE' as categoria,
  u.email,
  u.id,
  c.name as empresa,
  cu.role
FROM auth.users u
LEFT JOIN company_users cu ON cu.user_id = u.id
LEFT JOIN companies c ON cu.company_id = c.id
WHERE u.email LIKE '%@empresa.com'
ORDER BY u.created_at DESC
LIMIT 5;

-- 3. Verificar permissões da função
SELECT 
  '3. PERMISSOES' as categoria,
  has_function_privilege('delete_user_cascade(text)', 'execute') as pode_executar,
  CASE 
    WHEN has_function_privilege('delete_user_cascade(text)', 'execute') THEN '✅ Você tem permissão'
    ELSE '❌ Sem permissão para executar'
  END as status;

-- 4. Verificar se há políticas RLS bloqueando
SELECT 
  '4. POLITICAS RLS' as categoria,
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN ('company_users', 'sales')
ORDER BY tablename, policyname;

-- ========================================
-- TESTE MANUAL DA FUNÇÃO
-- ========================================
-- Escolha um email da lista acima e teste:
-- SELECT delete_user_cascade('EMAIL_AQUI');

-- Exemplo com usuário que não existe (deve retornar erro amigável):
SELECT 
  '5. TESTE COM USUARIO INEXISTENTE' as categoria,
  delete_user_cascade('naoexiste@teste.com') as resultado;
