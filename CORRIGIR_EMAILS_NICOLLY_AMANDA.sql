-- ========================================
-- CORRIGIR EMAILS NICOLLY E AMANDA
-- ========================================
-- Este script corrige os problemas mais comuns de login

-- 1. CONFIRMAR EMAILS (problema mais comum)
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email IN ('nicolly@empresa.com', 'amanda@empresa.com')
AND email_confirmed_at IS NULL;

-- 2. ATIVAR USUÁRIOS NA EMPRESA
UPDATE company_users 
SET active = TRUE,
    can_access_pdv = TRUE
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('nicolly@empresa.com', 'amanda@empresa.com')
);

-- 3. VERIFICAR SE A CORREÇÃO FUNCIONOU
SELECT 
  'VERIFICACAO POS CORRECAO' as categoria,
  u.email,
  CASE 
    WHEN u.email_confirmed_at IS NOT NULL THEN '✅ EMAIL CONFIRMADO'
    ELSE '❌ EMAIL NÃO CONFIRMADO'
  END as status_email,
  CASE 
    WHEN cu.active = TRUE THEN '✅ USUÁRIO ATIVO'
    ELSE '❌ USUÁRIO INATIVO'
  END as status_ativo,
  cu.role,
  s.name as vendedor_nome
FROM auth.users u
JOIN company_users cu ON cu.user_id = u.id
LEFT JOIN sellers s ON cu.seller_id = s.id
WHERE u.email IN ('nicolly@empresa.com', 'amanda@empresa.com')
ORDER BY u.email;