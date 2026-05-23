-- ========================================
-- VERIFICAÇÃO SIMPLES - NICOLLY E AMANDA
-- ========================================

-- 1. OS USUÁRIOS EXISTEM?
SELECT 
  'USUARIOS EXISTEM?' as pergunta,
  email,
  id,
  created_at
FROM auth.users 
WHERE email IN ('nicolly@empresa.com', 'amanda@empresa.com');

-- 2. ESTÃO VINCULADOS À EMPRESA?
SELECT 
  'VINCULADOS A EMPRESA?' as pergunta,
  u.email,
  cu.company_id,
  cu.seller_id,
  cu.role,
  cu.active
FROM auth.users u
LEFT JOIN company_users cu ON cu.user_id = u.id
WHERE u.email IN ('nicolly@empresa.com', 'amanda@empresa.com');

-- 3. A EMPRESA EXISTE E TEM ACESSO INDIVIDUAL?
SELECT 
  'EMPRESA CONFIGURADA?' as pergunta,
  name,
  access_type,
  status
FROM companies 
WHERE name ILIKE '%liz%' OR name ILIKE '%brito%';

-- 4. RESULTADO FINAL
SELECT 
  'DIAGNOSTICO FINAL' as categoria,
  CASE 
    WHEN NOT EXISTS (
      SELECT 1 FROM auth.users 
      WHERE email IN ('nicolly@empresa.com', 'amanda@empresa.com')
    ) THEN '❌ USUÁRIOS NÃO EXISTEM NO AUTH'
    
    WHEN NOT EXISTS (
      SELECT 1 FROM auth.users u
      JOIN company_users cu ON cu.user_id = u.id
      WHERE u.email IN ('nicolly@empresa.com', 'amanda@empresa.com')
    ) THEN '❌ USUÁRIOS NÃO VINCULADOS À EMPRESA'
    
    ELSE '✅ USUÁRIOS EXISTEM E ESTÃO VINCULADOS'
  END as resultado;