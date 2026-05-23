-- ========================================
-- DIAGNOSTICAR PROBLEMA DE LOGIN
-- ========================================
-- Execute este SQL para descobrir por que o login não está funcionando

-- ========================================
-- PASSO 1: LISTAR ÚLTIMOS USUÁRIOS CRIADOS
-- ========================================
SELECT 
  '1. ULTIMOS USUARIOS CRIADOS' as categoria,
  u.email,
  u.id,
  u.email_confirmed_at,
  u.created_at,
  u.raw_user_meta_data->>'seller_name' as seller_name_metadata,
  (u.raw_user_meta_data->>'company_id')::UUID as company_id_metadata,
  CASE 
    WHEN u.email_confirmed_at IS NULL THEN '❌ EMAIL NAO CONFIRMADO'
    ELSE '✅ EMAIL CONFIRMADO'
  END as status_email,
  EXTRACT(EPOCH FROM (NOW() - u.created_at))/60 as minutos_atras
FROM auth.users u
WHERE u.email LIKE '%@empresa.com'
ORDER BY u.created_at DESC
LIMIT 10;

-- ========================================
-- PASSO 2: VERIFICAR VINCULAÇÃO EM COMPANY_USERS
-- ========================================
SELECT 
  '2. VINCULACAO COMPANY_USERS' as categoria,
  u.email,
  u.id as user_id,
  cu.company_id,
  c.name as company_name,
  cu.seller_id,
  s.name as seller_name,
  cu.role,
  cu.active,
  cu.can_access_pdv,
  CASE 
    WHEN cu.user_id IS NULL THEN '❌ SEM VINCULACAO - NAO VAI LOGAR'
    WHEN cu.seller_id IS NULL THEN '⚠️ SEM SELLER_ID - NAO VAI FINALIZAR VENDA'
    WHEN NOT cu.active THEN '⚠️ INATIVO - NAO VAI LOGAR'
    WHEN NOT cu.can_access_pdv THEN '⚠️ SEM PERMISSAO PDV'
    ELSE '✅ TUDO OK'
  END as status
FROM auth.users u
LEFT JOIN company_users cu ON cu.user_id = u.id
LEFT JOIN companies c ON cu.company_id = c.id
LEFT JOIN sellers s ON cu.seller_id = s.id
WHERE u.email LIKE '%@empresa.com'
ORDER BY u.created_at DESC
LIMIT 10;

-- ========================================
-- PASSO 3: VERIFICAR SE TRIGGER ESTÁ FUNCIONANDO
-- ========================================
SELECT 
  '3. TRIGGER STATUS' as categoria,
  trigger_name,
  event_manipulation,
  event_object_table,
  CASE 
    WHEN trigger_name = 'on_auth_user_created_auto_link' THEN '✅ TRIGGER EXISTE'
    ELSE '❌ TRIGGER NAO ENCONTRADO'
  END as status
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created_auto_link';

-- ========================================
-- PASSO 4: VERIFICAR FUNÇÃO CONFIRM_USER_EMAIL
-- ========================================
SELECT 
  '4. FUNCAO CONFIRM EMAIL' as categoria,
  proname as nome_funcao,
  CASE 
    WHEN proname = 'confirm_user_email' THEN '✅ FUNCAO EXISTE'
    ELSE '❌ FUNCAO NAO ENCONTRADA'
  END as status
FROM pg_proc
WHERE proname = 'confirm_user_email';

-- ========================================
-- PASSO 5: VERIFICAR VENDEDORES DISPONÍVEIS
-- ========================================
SELECT 
  '5. VENDEDORES DISPONIVEIS' as categoria,
  s.id as seller_id,
  s.name as seller_name,
  s.email as seller_email,
  s.company_id,
  c.name as company_name,
  c.access_type,
  s.active,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM company_users cu 
      WHERE cu.seller_id = s.id
    ) THEN '✅ TEM LOGIN'
    ELSE '❌ SEM LOGIN'
  END as tem_login
FROM sellers s
JOIN companies c ON s.company_id = c.id
WHERE s.active = TRUE
ORDER BY s.created_at DESC
LIMIT 10;

-- ========================================
-- PASSO 6: DIAGNÓSTICO ESPECÍFICO DO ÚLTIMO USUÁRIO
-- ========================================
WITH ultimo_usuario AS (
  SELECT 
    u.id,
    u.email,
    u.email_confirmed_at,
    u.raw_user_meta_data->>'seller_name' as seller_name,
    (u.raw_user_meta_data->>'company_id')::UUID as company_id
  FROM auth.users u
  WHERE u.email LIKE '%@empresa.com'
  ORDER BY u.created_at DESC
  LIMIT 1
)
SELECT 
  '6. DIAGNOSTICO ULTIMO USUARIO' as categoria,
  uu.email,
  uu.id,
  CASE 
    WHEN uu.email_confirmed_at IS NULL THEN '❌ PROBLEMA: Email não confirmado'
    ELSE '✅ Email confirmado'
  END as check_1_email,
  CASE 
    WHEN cu.user_id IS NULL THEN '❌ PROBLEMA: Não vinculado em company_users'
    ELSE '✅ Vinculado em company_users'
  END as check_2_vinculacao,
  CASE 
    WHEN cu.seller_id IS NULL THEN '❌ PROBLEMA: Sem seller_id'
    ELSE '✅ Tem seller_id'
  END as check_3_seller_id,
  CASE 
    WHEN NOT cu.active THEN '❌ PROBLEMA: Usuário inativo'
    WHEN cu.active THEN '✅ Usuário ativo'
    ELSE '⚠️ Sem informação de ativo'
  END as check_4_ativo,
  CASE 
    WHEN NOT cu.can_access_pdv THEN '⚠️ AVISO: Sem permissão PDV'
    WHEN cu.can_access_pdv THEN '✅ Tem permissão PDV'
    ELSE '⚠️ Sem informação de PDV'
  END as check_5_pdv,
  -- Verificar se o vendedor existe
  CASE 
    WHEN s.id IS NULL THEN '❌ PROBLEMA: Vendedor não encontrado'
    ELSE '✅ Vendedor encontrado: ' || s.name
  END as check_6_vendedor,
  -- Verificar se a empresa existe
  CASE 
    WHEN c.id IS NULL THEN '❌ PROBLEMA: Empresa não encontrada'
    ELSE '✅ Empresa encontrada: ' || c.name
  END as check_7_empresa
FROM ultimo_usuario uu
LEFT JOIN company_users cu ON cu.user_id = uu.id
LEFT JOIN sellers s ON cu.seller_id = s.id
LEFT JOIN companies c ON cu.company_id = c.id;

-- ========================================
-- PASSO 7: RESUMO DE PROBLEMAS
-- ========================================
SELECT 
  '7. RESUMO DE PROBLEMAS' as categoria,
  COUNT(*) FILTER (WHERE u.email_confirmed_at IS NULL) as emails_nao_confirmados,
  COUNT(*) FILTER (WHERE cu.user_id IS NULL) as usuarios_sem_vinculacao,
  COUNT(*) FILTER (WHERE cu.seller_id IS NULL AND cu.user_id IS NOT NULL) as usuarios_sem_seller_id,
  COUNT(*) FILTER (WHERE NOT cu.active AND cu.user_id IS NOT NULL) as usuarios_inativos,
  COUNT(*) FILTER (
    WHERE u.email_confirmed_at IS NOT NULL 
    AND cu.user_id IS NOT NULL 
    AND cu.seller_id IS NOT NULL 
    AND cu.active
  ) as usuarios_ok,
  CASE 
    WHEN COUNT(*) FILTER (WHERE u.email_confirmed_at IS NULL) > 0 THEN '❌ Existem emails não confirmados'
    WHEN COUNT(*) FILTER (WHERE cu.user_id IS NULL) > 0 THEN '❌ Existem usuários sem vinculação'
    WHEN COUNT(*) FILTER (WHERE cu.seller_id IS NULL AND cu.user_id IS NOT NULL) > 0 THEN '❌ Existem usuários sem seller_id'
    WHEN COUNT(*) FILTER (WHERE NOT cu.active AND cu.user_id IS NOT NULL) > 0 THEN '❌ Existem usuários inativos'
    ELSE '✅ Todos os usuários estão OK'
  END as diagnostico
FROM auth.users u
LEFT JOIN company_users cu ON cu.user_id = u.id
WHERE u.email LIKE '%@empresa.com';

-- ========================================
-- PASSO 8: INSTRUÇÕES DE CORREÇÃO
-- ========================================
SELECT 
  '8. INSTRUCOES' as categoria,
  'Se encontrou problemas acima, execute o SQL apropriado:' as instrucao_1,
  '- Email não confirmado: Execute CRIAR_FUNCAO_CONFIRM_EMAIL.sql' as instrucao_2,
  '- Sem vinculação: Execute SOLUCAO_DEFINITIVA_LOGIN_VENDEDORES.sql' as instrucao_3,
  '- Sem seller_id: Execute CORRIGIR_SELLER_ID_AMANDA_NICOLLY.sql' as instrucao_4,
  '- Trigger não existe: Execute CRIAR_TRIGGER_AUTO_VINCULAR.sql' as instrucao_5;
