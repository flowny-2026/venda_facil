-- ========================================
-- LIMPAR TODAS AS SESSÕES ATIVAS
-- ========================================
-- Este script força logout de todos os usuários

-- PASSO 1: Invalidar todas as sessões atuais
-- Atualizar o campo updated_at força o Supabase a invalidar tokens
UPDATE auth.users 
SET updated_at = NOW()
WHERE email IN (
  'maria@gmail.com',
  'bete@gmail.com', 
  'lojatem@gmail.com',
  'loja-tem@gmail.com',
  'edicharlesbrito2009@hotmail.com'
);

-- PASSO 2: Limpar refresh tokens (se a tabela existir)
-- Isso garante que não há tokens válidos em cache
DELETE FROM auth.refresh_tokens 
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email IN (
    'maria@gmail.com',
    'bete@gmail.com', 
    'lojatem@gmail.com',
    'loja-tem@gmail.com',
    'edicharlesbrito2009@hotmail.com'
  )
);

-- PASSO 3: Verificar usuários que serão afetados
SELECT 
  'SESSOES INVALIDADAS' as status,
  email,
  id,
  last_sign_in_at,
  updated_at,
  'Sessão invalidada - novo login necessário' as resultado
FROM auth.users 
WHERE email IN (
  'maria@gmail.com',
  'bete@gmail.com', 
  'lojatem@gmail.com',
  'loja-tem@gmail.com',
  'edicharlesbrito2009@hotmail.com'
)
ORDER BY email;

-- PASSO 4: Verificar se não há outros usuários com sessões ativas
SELECT 
  'OUTRAS SESSOES' as status,
  email,
  last_sign_in_at,
  CASE 
    WHEN last_sign_in_at > NOW() - INTERVAL '1 hour' THEN '🔴 ATIVA RECENTE'
    WHEN last_sign_in_at > NOW() - INTERVAL '1 day' THEN '🟡 ATIVA HOJE'
    WHEN last_sign_in_at > NOW() - INTERVAL '7 days' THEN '🟢 ATIVA SEMANA'
    ELSE '⚪ INATIVA'
  END as status_sessao
FROM auth.users 
WHERE last_sign_in_at IS NOT NULL
  AND email NOT IN (
    'maria@gmail.com',
    'bete@gmail.com', 
    'lojatem@gmail.com',
    'loja-tem@gmail.com',
    'edicharlesbrito2009@hotmail.com'
  )
ORDER BY last_sign_in_at DESC;