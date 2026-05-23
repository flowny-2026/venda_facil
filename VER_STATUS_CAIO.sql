-- ========================================
-- VER STATUS DO CAIO - SIMPLES E DIRETO
-- ========================================

SELECT 
  '✅ STATUS DO CAIO' as titulo,
  u.email,
  u.id as user_id,
  CASE 
    WHEN u.email_confirmed_at IS NOT NULL THEN '✅ Confirmado'
    ELSE '❌ NÃO CONFIRMADO'
  END as email_confirmado,
  CASE 
    WHEN cu.user_id IS NOT NULL THEN '✅ Vinculado'
    ELSE '❌ NÃO VINCULADO'
  END as vinculado_empresa,
  c.name as empresa,
  CASE 
    WHEN cu.seller_id IS NOT NULL THEN '✅ Tem seller_id'
    ELSE '❌ SEM SELLER_ID'
  END as tem_seller,
  s.name as vendedor,
  CASE 
    WHEN cu.active THEN '✅ Ativo'
    ELSE '❌ INATIVO'
  END as usuario_ativo,
  CASE 
    WHEN cu.can_access_pdv THEN '✅ Pode'
    ELSE '❌ NÃO PODE'
  END as pode_usar_pdv,
  '==================' as separador,
  CASE 
    WHEN u.id IS NULL THEN '❌ USUÁRIO NÃO EXISTE'
    WHEN u.email_confirmed_at IS NULL THEN '❌ EMAIL NÃO CONFIRMADO'
    WHEN cu.user_id IS NULL THEN '❌ NÃO VINCULADO À EMPRESA'
    WHEN cu.seller_id IS NULL THEN '❌ SEM SELLER_ID'
    WHEN NOT cu.active THEN '❌ USUÁRIO INATIVO'
    WHEN NOT cu.can_access_pdv THEN '❌ SEM PERMISSÃO PDV'
    ELSE '🎉 TUDO OK - PODE FAZER LOGIN!'
  END as RESULTADO_FINAL
FROM auth.users u
LEFT JOIN company_users cu ON cu.user_id = u.id
LEFT JOIN companies c ON cu.company_id = c.id
LEFT JOIN sellers s ON cu.seller_id = s.id
WHERE u.email = 'caio@oliveira.com';
