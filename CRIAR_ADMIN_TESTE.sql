-- ========================================
-- SCRIPT: CRIAR LOGIN DE ADMIN DE TESTE
-- ========================================
-- Este script cria um usuário admin de teste no sistema
-- Execute este script no SQL Editor do Supabase
-- ========================================

-- PASSO 1: Criar usuário de teste no auth.users
-- IMPORTANTE: O Supabase não permite criar usuários via SQL diretamente
-- Você precisa criar o usuário pela interface ou API

-- ========================================
-- OPÇÃO 1: CRIAR MANUALMENTE (RECOMENDADO)
-- ========================================
-- 1. Acesse seu sistema: http://localhost:5173
-- 2. Clique em "Criar conta"
-- 3. Use estas credenciais:
--    Email: admin@vendafacil.com
--    Senha: Admin@123456
-- 4. Confirme o email (verifique sua caixa de entrada)
-- 5. Volte aqui e execute o PASSO 2 abaixo

-- ========================================
-- PASSO 2: PROMOVER USUÁRIO PARA ADMIN
-- ========================================
-- Execute este comando DEPOIS de criar a conta acima:

INSERT INTO admin_users (user_id, role, permissions, active)
SELECT 
  id,
  'super_admin',
  '{"view_users": true, "manage_users": true, "view_sales": true, "manage_sales": true, "view_analytics": true, "system_config": true}'::jsonb,
  true
FROM auth.users 
WHERE email = 'admin@vendafacil.com'
ON CONFLICT (user_id) DO NOTHING;

-- ========================================
-- VERIFICAR SE O ADMIN FOI CRIADO
-- ========================================
SELECT 
  u.email,
  a.role,
  a.permissions,
  a.active,
  a.created_at
FROM auth.users u
JOIN admin_users a ON u.id = a.user_id
WHERE u.email = 'admin@vendafacil.com';

-- ========================================
-- OPÇÃO 2: PROMOVER SEU PRÓPRIO EMAIL
-- ========================================
-- Se você já tem uma conta, pode promovê-la para admin:
-- Substitua 'SEU_EMAIL@exemplo.com' pelo seu email real

/*
INSERT INTO admin_users (user_id, role, permissions, active)
SELECT 
  id,
  'super_admin',
  '{"view_users": true, "manage_users": true, "view_sales": true, "manage_sales": true, "view_analytics": true, "system_config": true}'::jsonb,
  true
FROM auth.users 
WHERE email = 'SEU_EMAIL@exemplo.com'
ON CONFLICT (user_id) DO NOTHING;
*/

-- ========================================
-- CRIAR EMPRESA DE TESTE (OPCIONAL)
-- ========================================
-- Cria uma empresa de teste para o admin gerenciar

INSERT INTO companies (
  name,
  email,
  phone,
  cnpj,
  access_type,
  plan,
  active
) VALUES (
  'Empresa Teste',
  'empresa@teste.com',
  '(11) 99999-9999',
  '12.345.678/0001-90',
  'shared',
  'professional',
  true
) ON CONFLICT DO NOTHING;

-- ========================================
-- CRIAR USUÁRIO PARA A EMPRESA DE TESTE
-- ========================================
-- Primeiro crie a conta manualmente:
-- Email: empresa@teste.com
-- Senha: Teste@123456
-- Depois execute:

/*
INSERT INTO company_users (company_id, user_id, role)
SELECT 
  c.id,
  u.id,
  'owner'
FROM companies c
CROSS JOIN auth.users u
WHERE c.email = 'empresa@teste.com'
  AND u.email = 'empresa@teste.com'
ON CONFLICT DO NOTHING;
*/

-- ========================================
-- RESUMO DAS CREDENCIAIS DE TESTE
-- ========================================
/*

ADMIN (Painel Administrativo):
- URL: http://localhost:5180
- Email: admin@vendafacil.com
- Senha: Admin@123456
- Acesso: Super Admin (controle total)

EMPRESA TESTE (Sistema PDV):
- URL: http://localhost:5173
- Email: empresa@teste.com
- Senha: Teste@123456
- Acesso: Cliente (sistema PDV)

IMPORTANTE:
1. Crie as contas manualmente primeiro
2. Confirme os emails
3. Execute os comandos SQL para promover
4. Faça logout e login novamente

*/

-- ========================================
-- TROUBLESHOOTING
-- ========================================

-- Ver todos os usuários cadastrados:
SELECT id, email, created_at, confirmed_at 
FROM auth.users 
ORDER BY created_at DESC;

-- Ver todos os admins:
SELECT 
  u.email,
  a.role,
  a.active,
  a.created_at
FROM auth.users u
JOIN admin_users a ON u.id = a.user_id
ORDER BY a.created_at DESC;

-- Ver todas as empresas:
SELECT 
  id,
  name,
  email,
  access_type,
  plan,
  active,
  created_at
FROM companies
ORDER BY created_at DESC;

-- Remover admin (se necessário):
-- DELETE FROM admin_users WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@vendafacil.com');

-- ========================================
-- FIM DO SCRIPT
-- ========================================
