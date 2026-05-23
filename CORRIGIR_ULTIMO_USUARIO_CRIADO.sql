-- ========================================
-- CORRIGIR ÚLTIMO USUÁRIO CRIADO
-- ========================================
-- Este SQL corrige automaticamente o último usuário criado

-- ========================================
-- PASSO 1: IDENTIFICAR O ÚLTIMO USUÁRIO
-- ========================================
SELECT 
  '1. ULTIMO USUARIO CRIADO' as categoria,
  u.email,
  u.id,
  u.email_confirmed_at,
  u.raw_user_meta_data->>'seller_name' as seller_name,
  (u.raw_user_meta_data->>'company_id')::UUID as company_id,
  EXTRACT(EPOCH FROM (NOW() - u.created_at))/60 as minutos_atras
FROM auth.users u
WHERE u.email LIKE '%@empresa.com'
ORDER BY u.created_at DESC
LIMIT 1;

-- ========================================
-- PASSO 2: CONFIRMAR EMAIL
-- ========================================
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email LIKE '%@empresa.com'
  ORDER BY created_at DESC 
  LIMIT 1
)
AND email_confirmed_at IS NULL;

SELECT 
  '2. EMAIL CONFIRMADO' as categoria,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN '✅ Email confirmado'
    ELSE '⚠️ Email já estava confirmado'
  END as status
FROM auth.users
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email LIKE '%@empresa.com'
  ORDER BY created_at DESC 
  LIMIT 1
);

-- ========================================
-- PASSO 3: VINCULAR EM COMPANY_USERS
-- ========================================
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
CROSS JOIN LATERAL (
  SELECT id 
  FROM sellers 
  WHERE name ILIKE u.raw_user_meta_data->>'seller_name'
  AND company_id = (u.raw_user_meta_data->>'company_id')::UUID
  LIMIT 1
) s
WHERE u.id = (
  SELECT id FROM auth.users 
  WHERE email LIKE '%@empresa.com'
  ORDER BY created_at DESC 
  LIMIT 1
)
AND NOT EXISTS (
  SELECT 1 FROM company_users 
  WHERE user_id = u.id
)
ON CONFLICT (user_id, company_id) DO UPDATE SET
  seller_id = EXCLUDED.seller_id,
  active = TRUE,
  can_access_pdv = TRUE;

SELECT 
  '3. VINCULACAO CRIADA' as categoria,
  CASE 
    WHEN cu.user_id IS NOT NULL THEN '✅ Vinculação criada/atualizada'
    ELSE '❌ Falha na vinculação'
  END as status
FROM auth.users u
LEFT JOIN company_users cu ON cu.user_id = u.id
WHERE u.id = (
  SELECT id FROM auth.users 
  WHERE email LIKE '%@empresa.com'
  ORDER BY created_at DESC 
  LIMIT 1
);

-- ========================================
-- PASSO 4: VERIFICAR RESULTADO FINAL
-- ========================================
SELECT 
  '4. RESULTADO FINAL' as categoria,
  u.email,
  u.id,
  CASE 
    WHEN u.email_confirmed_at IS NOT NULL THEN '✅'
    ELSE '❌'
  END as email_confirmado,
  c.name as empresa,
  s.name as vendedor,
  cu.role,
  CASE 
    WHEN cu.active THEN '✅'
    ELSE '❌'
  END as ativo,
  CASE 
    WHEN cu.can_access_pdv THEN '✅'
    ELSE '❌'
  END as pode_usar_pdv,
  CASE 
    WHEN u.email_confirmed_at IS NULL THEN '❌ Email não confirmado'
    WHEN cu.user_id IS NULL THEN '❌ Não vinculado'
    WHEN cu.seller_id IS NULL THEN '❌ Sem seller_id'
    WHEN NOT cu.active THEN '❌ Inativo'
    WHEN NOT cu.can_access_pdv THEN '❌ Sem permissão PDV'
    ELSE '✅ PODE FAZER LOGIN AGORA!'
  END as status_final
FROM auth.users u
LEFT JOIN company_users cu ON cu.user_id = u.id
LEFT JOIN companies c ON cu.company_id = c.id
LEFT JOIN sellers s ON cu.seller_id = s.id
WHERE u.id = (
  SELECT id FROM auth.users 
  WHERE email LIKE '%@empresa.com'
  ORDER BY created_at DESC 
  LIMIT 1
);

-- ========================================
-- PASSO 5: INSTRUÇÕES PARA TESTE
-- ========================================
SELECT 
  '5. COMO TESTAR' as categoria,
  'PASSO 1: Copie o email do usuário acima' as passo_1,
  'PASSO 2: Faça logout do sistema' as passo_2,
  'PASSO 3: Tente fazer login com o email e senha' as passo_3,
  'PASSO 4: Se funcionar, você verá o painel do vendedor' as passo_4,
  'PASSO 5: Verifique se aparece "Vendedor: nome" no canto superior direito' as passo_5;
