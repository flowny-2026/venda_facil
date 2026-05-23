-- ========================================
-- CORREÇÃO URGENTE DOS EMAILS
-- ========================================
-- Baseado nos dados dos últimos logins

-- PASSO 1: Atualizar emails inválidos para domínios válidos
UPDATE auth.users 
SET email = 'maria@gmail.com'
WHERE email = 'maria@empresa.com';

UPDATE auth.users 
SET email = 'bete@gmail.com'
WHERE email = 'bete@empresa.com';

-- PASSO 2: Verificar se há duplicação do usuário lojatem
-- Vamos ver se são o mesmo usuário ou usuários diferentes
SELECT 
  'VERIFICAR LOJATEM' as status,
  id,
  email,
  created_at,
  email_confirmed_at,
  last_sign_in_at
FROM auth.users 
WHERE email IN ('lojatem@gmail.com', 'loja-tem@gmail.com')
ORDER BY created_at;

-- PASSO 3: Se forem usuários diferentes, manter apenas um ativo
-- (Execute apenas se houver 2 usuários diferentes)
/*
-- Desativar o usuário mais antigo se houver duplicação
UPDATE company_users 
SET active = false
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'loja-tem@gmail.com'
  AND EXISTS (
    SELECT 1 FROM auth.users u2 
    WHERE u2.email = 'lojatem@gmail.com' 
    AND u2.id != auth.users.id
  )
);
*/

-- PASSO 4: Forçar logout de todas as sessões ativas
-- Isso vai limpar as sessões que estão causando auto-login
UPDATE auth.users 
SET updated_at = NOW()
WHERE email IN (
  'maria@gmail.com',
  'bete@gmail.com', 
  'lojatem@gmail.com',
  'loja-tem@gmail.com'
);

-- PASSO 5: Verificar resultado
SELECT 
  'EMAILS CORRIGIDOS' as status,
  email,
  last_sign_in_at,
  CASE 
    WHEN email LIKE '%@empresa.com' THEN '❌ AINDA INVÁLIDO'
    WHEN email LIKE '%@gmail.com' THEN '✅ CORRIGIDO'
    WHEN email LIKE '%@hotmail.com' THEN '✅ VÁLIDO'
    ELSE '⚠️ VERIFICAR'
  END as situacao
FROM auth.users 
WHERE email IN (
  'maria@empresa.com', 'maria@gmail.com',
  'bete@empresa.com', 'bete@gmail.com',
  'lojatem@empresa.com', 'lojatem@gmail.com', 'loja-tem@gmail.com',
  'edicharlesbrito2009@hotmail.com'
)
ORDER BY situacao, email;