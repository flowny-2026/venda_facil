-- ========================================
-- CORRIGIR LOGIN: caio@oliveira.com
-- ========================================

-- ========================================
-- PASSO 1: DIAGNOSTICAR caio@oliveira.com
-- ========================================
SELECT 
  '1. DIAGNOSTICO' as categoria,
  u.email,
  u.id,
  u.email_confirmed_at,
  u.created_at,
  u.raw_user_meta_data->>'seller_name' as seller_name,
  (u.raw_user_meta_data->>'company_id')::UUID as company_id,
  CASE 
    WHEN u.email_confirmed_at IS NULL THEN '❌ EMAIL NAO CONFIRMADO'
    ELSE '✅ EMAIL CONFIRMADO'
  END as status_email,
  EXTRACT(EPOCH FROM (NOW() - u.created_at))/60 as minutos_atras
FROM auth.users u
WHERE u.email = 'caio@oliveira.com';

-- ========================================
-- PASSO 2: VERIFICAR VINCULAÇÃO ATUAL
-- ========================================
SELECT 
  '2. VINCULACAO ATUAL' as categoria,
  u.email,
  cu.company_id,
  c.name as company_name,
  cu.seller_id,
  s.name as seller_name,
  cu.role,
  cu.active,
  cu.can_access_pdv,
  CASE 
    WHEN cu.user_id IS NULL THEN '❌ SEM VINCULACAO - ESTE É O PROBLEMA!'
    WHEN cu.seller_id IS NULL THEN '⚠️ SEM SELLER_ID'
    WHEN NOT cu.active THEN '⚠️ INATIVO'
    WHEN NOT cu.can_access_pdv THEN '⚠️ SEM PERMISSAO PDV'
    ELSE '✅ VINCULADO CORRETAMENTE'
  END as status
FROM auth.users u
LEFT JOIN company_users cu ON cu.user_id = u.id
LEFT JOIN companies c ON cu.company_id = c.id
LEFT JOIN sellers s ON cu.seller_id = s.id
WHERE u.email = 'caio@oliveira.com';

-- ========================================
-- PASSO 3: VERIFICAR SE VENDEDOR CAIO EXISTE
-- ========================================
SELECT 
  '3. VENDEDOR CAIO' as categoria,
  s.id as seller_id,
  s.name as seller_name,
  s.email as seller_email,
  s.company_id,
  c.name as company_name,
  c.access_type,
  s.active,
  CASE 
    WHEN s.active THEN '✅ VENDEDOR ATIVO'
    ELSE '⚠️ VENDEDOR INATIVO'
  END as status
FROM sellers s
JOIN companies c ON s.company_id = c.id
WHERE s.name ILIKE '%caio%'
ORDER BY s.created_at DESC;

-- ========================================
-- PASSO 4: CONFIRMAR EMAIL
-- ========================================
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'caio@oliveira.com'
AND email_confirmed_at IS NULL;

SELECT 
  '4. EMAIL CONFIRMADO' as categoria,
  email,
  email_confirmed_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN '✅ Email confirmado com sucesso'
    ELSE '❌ Falha ao confirmar email'
  END as status
FROM auth.users
WHERE email = 'caio@oliveira.com';

-- ========================================
-- PASSO 5: VINCULAR EM COMPANY_USERS
-- ========================================
-- Primeiro, vamos buscar os dados necessários
DO $$
DECLARE
  v_user_id UUID;
  v_company_id UUID;
  v_seller_id UUID;
  v_seller_name TEXT;
BEGIN
  -- Buscar user_id
  SELECT id, (raw_user_meta_data->>'company_id')::UUID
  INTO v_user_id, v_company_id
  FROM auth.users
  WHERE email = 'caio@oliveira.com';
  
  IF v_user_id IS NULL THEN
    RAISE NOTICE '❌ Usuário caio@oliveira.com não encontrado';
    RETURN;
  END IF;
  
  RAISE NOTICE '✅ User ID: %', v_user_id;
  RAISE NOTICE '✅ Company ID: %', v_company_id;
  
  -- Buscar seller_id
  SELECT id, name
  INTO v_seller_id, v_seller_name
  FROM sellers
  WHERE name ILIKE '%caio%'
  AND company_id = v_company_id
  LIMIT 1;
  
  IF v_seller_id IS NULL THEN
    RAISE NOTICE '⚠️ Vendedor Caio não encontrado na empresa';
    RAISE NOTICE 'ℹ️ Tentando buscar em qualquer empresa...';
    
    SELECT id, name, company_id
    INTO v_seller_id, v_seller_name, v_company_id
    FROM sellers
    WHERE name ILIKE '%caio%'
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;
  
  IF v_seller_id IS NULL THEN
    RAISE NOTICE '❌ Vendedor Caio não encontrado em nenhuma empresa';
    RETURN;
  END IF;
  
  RAISE NOTICE '✅ Seller ID: %', v_seller_id;
  RAISE NOTICE '✅ Seller Name: %', v_seller_name;
  
  -- Criar/atualizar vinculação
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
  ) VALUES (
    v_user_id,
    v_company_id,
    v_seller_id,
    'seller',
    TRUE,
    TRUE,
    FALSE,
    FALSE,
    FALSE
  )
  ON CONFLICT (user_id, company_id) DO UPDATE SET
    seller_id = EXCLUDED.seller_id,
    active = TRUE,
    can_access_pdv = TRUE;
  
  RAISE NOTICE '✅ Vinculação criada/atualizada com sucesso';
END $$;

SELECT 
  '5. VINCULACAO CRIADA' as categoria,
  '✅ Vinculação processada - veja os logs acima' as status;

-- ========================================
-- PASSO 6: VERIFICAR RESULTADO FINAL
-- ========================================
SELECT 
  '6. ✅✅✅ RESULTADO FINAL ✅✅✅' as categoria,
  u.email as email_login,
  u.id as user_id,
  CASE 
    WHEN u.email_confirmed_at IS NOT NULL THEN '✅'
    ELSE '❌'
  END as email_confirmado,
  c.name as empresa,
  s.name as vendedor,
  cu.role,
  CASE WHEN cu.active THEN '✅' ELSE '❌' END as ativo,
  CASE WHEN cu.can_access_pdv THEN '✅' ELSE '❌' END as pode_pdv,
  CASE 
    WHEN u.email_confirmed_at IS NULL THEN '❌ PROBLEMA: Email não confirmado'
    WHEN cu.user_id IS NULL THEN '❌ PROBLEMA: Não vinculado em company_users'
    WHEN cu.seller_id IS NULL THEN '❌ PROBLEMA: Sem seller_id'
    WHEN NOT cu.active THEN '❌ PROBLEMA: Usuário inativo'
    WHEN NOT cu.can_access_pdv THEN '⚠️ AVISO: Sem permissão PDV'
    ELSE '🎉🎉🎉 CAIO PODE FAZER LOGIN AGORA! 🎉🎉🎉'
  END as status_final
FROM auth.users u
LEFT JOIN company_users cu ON cu.user_id = u.id
LEFT JOIN companies c ON cu.company_id = c.id
LEFT JOIN sellers s ON cu.seller_id = s.id
WHERE u.email = 'caio@oliveira.com';

-- ========================================
-- PASSO 7: INSTRUÇÕES DE TESTE
-- ========================================
SELECT 
  '7. 📋 COMO TESTAR' as categoria,
  'Email: caio@oliveira.com' as credencial_1,
  'Senha: (a senha que você criou)' as credencial_2,
  '' as separador,
  'PASSO 1: Faça LOGOUT completo do sistema' as passo_1,
  'PASSO 2: Limpe o cache: Ctrl+Shift+R (Windows) ou Cmd+Shift+R (Mac)' as passo_2,
  'PASSO 3: Acesse a página de login' as passo_3,
  'PASSO 4: Use: caio@oliveira.com + senha' as passo_4,
  'PASSO 5: Deve aparecer o painel do vendedor' as passo_5,
  'PASSO 6: Verifique se aparece "Vendedor: caio" no canto superior direito' as passo_6;

-- ========================================
-- PASSO 8: SE AINDA NÃO FUNCIONAR
-- ========================================
SELECT 
  '8. ⚠️ SE AINDA NAO FUNCIONAR' as categoria,
  'Verifique a seção "6. RESULTADO FINAL" acima' as check_1,
  'Se aparecer algum ❌, me envie o resultado completo' as check_2,
  'Verifique se a senha está correta' as check_3,
  'Tente em uma aba anônima do navegador' as check_4,
  'Verifique se o vendedor Caio existe na página de Vendedores' as check_5;
