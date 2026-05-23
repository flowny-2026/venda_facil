-- ========================================
-- SOLUÇÃO DEFINITIVA - LOGIN DE VENDEDORES
-- ========================================
-- Este SQL resolve TODOS os problemas de login de vendedores de uma vez:
-- 1. Confirma emails não confirmados
-- 2. Vincula usuários sem vinculação
-- 3. Corrige seller_id de Amanda e Nicolly
-- 4. Verifica se trigger está funcionando

-- ========================================
-- PASSO 1: DIAGNOSTICAR PROBLEMA ATUAL
-- ========================================

SELECT '========== DIAGNOSTICO INICIAL ==========' as separador;

-- 1.1 Listar TODOS os usuários vendedores
SELECT 
  '1. TODOS USUARIOS' as categoria,
  u.id,
  u.email,
  u.email_confirmed_at,
  u.created_at,
  u.raw_user_meta_data->>'seller_name' as seller_name_metadata,
  (u.raw_user_meta_data->>'company_id')::UUID as company_id_metadata,
  CASE 
    WHEN u.email_confirmed_at IS NULL THEN '❌ EMAIL NAO CONFIRMADO'
    ELSE '✅ EMAIL CONFIRMADO'
  END as status_email
FROM auth.users u
WHERE u.email LIKE '%@empresa.com'
ORDER BY u.created_at DESC;

-- 1.2 Verificar vinculações na tabela company_users
SELECT 
  '2. VINCULACOES' as categoria,
  u.email,
  cu.company_id,
  c.name as company_name,
  cu.seller_id,
  s.name as seller_name,
  cu.role,
  cu.active,
  CASE 
    WHEN cu.user_id IS NULL THEN '❌ SEM VINCULACAO'
    WHEN cu.seller_id IS NULL THEN '⚠️ SEM SELLER_ID'
    ELSE '✅ VINCULADO COMPLETO'
  END as status
FROM auth.users u
LEFT JOIN company_users cu ON cu.user_id = u.id
LEFT JOIN companies c ON cu.company_id = c.id
LEFT JOIN sellers s ON cu.seller_id = s.id
WHERE u.email LIKE '%@empresa.com'
ORDER BY u.email;

-- 1.3 Verificar se trigger existe
SELECT 
  '3. TRIGGER' as categoria,
  trigger_name,
  event_manipulation,
  event_object_table,
  '✅ TRIGGER EXISTE' as status
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created_auto_link';

-- ========================================
-- PASSO 2: CORRIGIR TODOS OS PROBLEMAS
-- ========================================

SELECT '========== APLICANDO CORRECOES ==========' as separador;

-- 2.1 CONFIRMAR EMAILS DE TODOS OS VENDEDORES
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email LIKE '%@empresa.com'
AND email_confirmed_at IS NULL;

SELECT 
  '4. EMAILS CONFIRMADOS' as categoria,
  COUNT(*) as total_confirmados,
  '✅ EMAILS CONFIRMADOS' as status
FROM auth.users
WHERE email LIKE '%@empresa.com'
AND email_confirmed_at IS NOT NULL;

-- 2.2 VINCULAR USUÁRIOS SEM VINCULAÇÃO
-- Baseado nos metadados salvos durante a criação
INSERT INTO company_users (
  user_id,
  company_id,
  seller_id,
  role,
  active,
  can_access_pdv,
  can_view_reports,
  can_manage_products,
  can_manage_sellers
)
SELECT 
  u.id as user_id,
  (u.raw_user_meta_data->>'company_id')::UUID as company_id,
  s.id as seller_id,
  'seller' as role,
  TRUE as active,
  TRUE as can_access_pdv,
  FALSE as can_view_reports,
  FALSE as can_manage_products,
  FALSE as can_manage_sellers
FROM auth.users u
LEFT JOIN company_users cu ON cu.user_id = u.id
CROSS JOIN LATERAL (
  SELECT id 
  FROM sellers 
  WHERE name ILIKE u.raw_user_meta_data->>'seller_name'
  AND company_id = (u.raw_user_meta_data->>'company_id')::UUID
  LIMIT 1
) s
WHERE cu.user_id IS NULL
AND u.raw_user_meta_data->>'seller_name' IS NOT NULL
AND u.raw_user_meta_data->>'company_id' IS NOT NULL
AND u.email LIKE '%@empresa.com'
ON CONFLICT (user_id, company_id) DO UPDATE SET
  seller_id = EXCLUDED.seller_id,
  active = TRUE;

-- 2.3 CORRIGIR SELLER_ID DE AMANDA, NICOLLY E SARAH
-- (Para casos onde vinculação existe mas seller_id está NULL)

-- Amanda
UPDATE company_users
SET seller_id = (
  SELECT id FROM sellers 
  WHERE name ILIKE '%amanda%' 
  AND company_id = '5d9fc6d3-22ca-46c8-b0e9-6d06e33dd4e4'
  LIMIT 1
)
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'amanda@empresa.com')
AND company_id = '5d9fc6d3-22ca-46c8-b0e9-6d06e33dd4e4'
AND (seller_id IS NULL OR seller_id != (
  SELECT id FROM sellers 
  WHERE name ILIKE '%amanda%' 
  AND company_id = '5d9fc6d3-22ca-46c8-b0e9-6d06e33dd4e4'
  LIMIT 1
));

-- Nicolly
UPDATE company_users
SET seller_id = (
  SELECT id FROM sellers 
  WHERE name ILIKE '%nicolly%' 
  AND company_id = '5d9fc6d3-22ca-46c8-b0e9-6d06e33dd4e4'
  LIMIT 1
)
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'nicolly@empresa.com')
AND company_id = '5d9fc6d3-22ca-46c8-b0e9-6d06e33dd4e4'
AND (seller_id IS NULL OR seller_id != (
  SELECT id FROM sellers 
  WHERE name ILIKE '%nicolly%' 
  AND company_id = '5d9fc6d3-22ca-46c8-b0e9-6d06e33dd4e4'
  LIMIT 1
));

-- Sarah
UPDATE company_users
SET seller_id = (
  SELECT id FROM sellers 
  WHERE name ILIKE '%sarah%' 
  AND company_id = '5d9fc6d3-22ca-46c8-b0e9-6d06e33dd4e4'
  LIMIT 1
)
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'sarah@empresa.com')
AND company_id = '5d9fc6d3-22ca-46c8-b0e9-6d06e33dd4e4'
AND (seller_id IS NULL OR seller_id != (
  SELECT id FROM sellers 
  WHERE name ILIKE '%sarah%' 
  AND company_id = '5d9fc6d3-22ca-46c8-b0e9-6d06e33dd4e4'
  LIMIT 1
));

-- ========================================
-- PASSO 3: VERIFICAR RESULTADO FINAL
-- ========================================

SELECT '========== RESULTADO FINAL ==========' as separador;

-- 3.1 Status completo de todos os vendedores
SELECT 
  '5. STATUS FINAL' as categoria,
  u.email,
  CASE 
    WHEN u.email_confirmed_at IS NOT NULL THEN '✅'
    ELSE '❌'
  END as email_confirmado,
  c.name as empresa,
  s.name as vendedor,
  cu.role,
  CASE 
    WHEN cu.can_access_pdv THEN '✅'
    ELSE '❌'
  END as pode_usar_pdv,
  CASE 
    WHEN cu.user_id IS NULL THEN '❌ SEM VINCULACAO'
    WHEN cu.seller_id IS NULL THEN '⚠️ SEM SELLER_ID - NAO PODE FINALIZAR VENDA'
    WHEN NOT cu.active THEN '⚠️ INATIVO'
    WHEN NOT cu.can_access_pdv THEN '⚠️ SEM PERMISSAO PDV'
    ELSE '✅ TUDO OK - PODE FAZER LOGIN E VENDER'
  END as status_final
FROM auth.users u
LEFT JOIN company_users cu ON cu.user_id = u.id
LEFT JOIN companies c ON cu.company_id = c.id
LEFT JOIN sellers s ON cu.seller_id = s.id
WHERE u.email LIKE '%@empresa.com'
ORDER BY u.email;

-- 3.2 Resumo de problemas restantes
SELECT 
  '6. RESUMO' as categoria,
  COUNT(*) FILTER (WHERE cu.user_id IS NULL) as sem_vinculacao,
  COUNT(*) FILTER (WHERE cu.seller_id IS NULL AND cu.user_id IS NOT NULL) as sem_seller_id,
  COUNT(*) FILTER (WHERE u.email_confirmed_at IS NULL) as email_nao_confirmado,
  COUNT(*) FILTER (WHERE cu.user_id IS NOT NULL AND cu.seller_id IS NOT NULL AND u.email_confirmed_at IS NOT NULL) as tudo_ok,
  CASE 
    WHEN COUNT(*) FILTER (WHERE cu.user_id IS NULL OR cu.seller_id IS NULL OR u.email_confirmed_at IS NULL) = 0 
    THEN '✅ TODOS OS VENDEDORES CORRIGIDOS'
    ELSE '⚠️ AINDA EXISTEM PROBLEMAS'
  END as resultado
FROM auth.users u
LEFT JOIN company_users cu ON cu.user_id = u.id
WHERE u.email LIKE '%@empresa.com';

-- ========================================
-- PASSO 4: INSTRUÇÕES PARA TESTE
-- ========================================

SELECT '========== INSTRUCOES DE TESTE ==========' as separador;

SELECT 
  '7. COMO TESTAR' as categoria,
  'PASSO 1: Fazer logout de todos os usuários' as passo_1,
  'PASSO 2: Tentar login com amanda@empresa.com' as passo_2,
  'PASSO 3: Verificar se aparece "Vendedor: amanda" no canto superior direito' as passo_3,
  'PASSO 4: Adicionar produtos ao carrinho e tentar finalizar venda' as passo_4,
  'PASSO 5: Repetir teste com nicolly@empresa.com e sarah@empresa.com' as passo_5,
  'PASSO 6: Criar NOVO vendedor e testar se login funciona automaticamente' as passo_6;

-- ========================================
-- PASSO 5: VERIFICAR TRIGGER PARA NOVOS USUÁRIOS
-- ========================================

SELECT '========== VERIFICACAO DO TRIGGER ==========' as separador;

SELECT 
  '8. TRIGGER STATUS' as categoria,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.triggers 
      WHERE trigger_name = 'on_auth_user_created_auto_link'
    ) THEN '✅ TRIGGER INSTALADO - Novos vendedores serão vinculados automaticamente'
    ELSE '❌ TRIGGER NAO ENCONTRADO - Novos vendedores precisarão correção manual'
  END as status,
  'Trigger garante que NOVOS vendedores criados a partir de agora serão vinculados automaticamente' as observacao;
