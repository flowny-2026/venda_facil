-- ========================================
-- CORRIGIR ERRO: "Usuário não é administrador"
-- ========================================

-- PASSO 1: Ver qual email você está usando
-- Execute este comando para ver todos os usuários cadastrados:

SELECT 
  id,
  email,
  created_at,
  confirmed_at,
  last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;

-- ========================================
-- PASSO 2: Promover seu usuário para admin
-- ========================================
-- Substitua pelo seu email: edicharlesbrito2009@hotmail.com

INSERT INTO admin_users (user_id, role, permissions, active)
SELECT 
  id,
  'super_admin',
  '{"view_users": true, "manage_users": true, "view_sales": true, "manage_sales": true, "view_analytics": true, "system_config": true}'::jsonb,
  true
FROM auth.users 
WHERE email = 'edicharlesbrito2009@hotmail.com'
ON CONFLICT (user_id) DO UPDATE
SET 
  role = 'super_admin',
  permissions = '{"view_users": true, "manage_users": true, "view_sales": true, "manage_sales": true, "view_analytics": true, "system_config": true}'::jsonb,
  active = true;

-- ========================================
-- PASSO 3: Verificar se funcionou
-- ========================================

SELECT 
  u.email,
  a.role,
  a.permissions,
  a.active,
  a.created_at
FROM auth.users u
JOIN admin_users a ON u.id = a.user_id
WHERE u.email = 'edicharlesbrito2009@hotmail.com';

-- Deve retornar:
-- email: seu@email.com
-- role: super_admin
-- active: true

-- ========================================
-- ALTERNATIVA: Promover TODOS os usuários
-- ========================================
-- Use apenas se tiver certeza!

/*
INSERT INTO admin_users (user_id, role, permissions, active)
SELECT 
  id,
  'super_admin',
  '{"view_users": true, "manage_users": true, "view_sales": true, "manage_sales": true, "view_analytics": true, "system_config": true}'::jsonb,
  true
FROM auth.users
ON CONFLICT (user_id) DO UPDATE
SET 
  role = 'super_admin',
  active = true;
*/

-- ========================================
-- TROUBLESHOOTING
-- ========================================

-- Ver todos os admins cadastrados:
SELECT 
  u.email,
  a.role,
  a.active
FROM auth.users u
LEFT JOIN admin_users a ON u.id = a.user_id
ORDER BY u.created_at DESC;

-- Remover admin (se necessário):
-- DELETE FROM admin_users WHERE user_id = (SELECT id FROM auth.users WHERE email = 'email@exemplo.com');

-- ========================================
-- IMPORTANTE
-- ========================================
-- Depois de executar o comando:
-- 1. Faça LOGOUT do sistema
-- 2. Faça LOGIN novamente
-- 3. Tente acessar o admin
-- ========================================
