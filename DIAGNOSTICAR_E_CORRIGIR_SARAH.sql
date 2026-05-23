-- ========================================
-- DIAGNOSTICAR E CORRIGIR SARAH
-- ========================================

-- 1. VERIFICAR SE SARAH EXISTE NO AUTH
SELECT 
  'SARAH NO AUTH' as categoria,
  id,
  email,
  created_at,
  email_confirmed_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN '✅ EMAIL CONFIRMADO'
    ELSE '❌ EMAIL NÃO CONFIRMADO'
  END as status
FROM auth.users 
WHERE email = 'sarah.@empresa.com' OR email LIKE '%sarah%';

-- 2. VERIFICAR SE SARAH ESTÁ VINCULADA
SELECT 
  'SARAH VINCULADA?' as categoria,
  u.email,
  cu.company_id,
  c.name as company_name,
  cu.seller_id,
  s.name as seller_name
FROM auth.users u
LEFT JOIN company_users cu ON cu.user_id = u.id
LEFT JOIN companies c ON cu.company_id = c.id
LEFT JOIN sellers s ON cu.seller_id = s.id
WHERE u.email = 'sarah.@empresa.com' OR u.email LIKE '%sarah%';

-- 3. VERIFICAR VENDEDOR SARAH
SELECT 
  'VENDEDOR SARAH' as categoria,
  id,
  name,
  email,
  company_id,
  c.name as company_name
FROM sellers s
LEFT JOIN companies c ON s.company_id = c.id
WHERE s.name ILIKE '%sarah%';

-- 4. CONFIRMAR EMAIL (se não estiver confirmado)
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE (email = 'sarah.@empresa.com' OR email LIKE '%sarah%')
AND email_confirmed_at IS NULL;

-- 5. VINCULAR SARAH À EMPRESA (se não estiver vinculada)
-- Empresa: loja liz brito (5d9fc6d3-22ca-46c8-b0e9-6d06e33dd4e4)
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
  '5d9fc6d3-22ca-46c8-b0e9-6d06e33dd4e4' as company_id,
  s.id as seller_id,
  'seller' as role,
  TRUE as active,
  TRUE as can_access_pdv,
  FALSE as can_view_reports,
  FALSE as can_manage_products,
  FALSE as can_manage_sellers
FROM auth.users u
CROSS JOIN sellers s
WHERE (u.email = 'sarah.@empresa.com' OR u.email LIKE '%sarah%')
AND s.name ILIKE '%sarah%'
AND NOT EXISTS (
  SELECT 1 FROM company_users cu 
  WHERE cu.user_id = u.id
)
ON CONFLICT (user_id, company_id) DO NOTHING;

-- 6. VERIFICAR RESULTADO FINAL
SELECT 
  'RESULTADO FINAL' as categoria,
  u.email,
  cu.company_id,
  c.name as company_name,
  c.access_type,
  cu.role,
  cu.active,
  s.name as seller_name,
  CASE 
    WHEN cu.company_id IS NOT NULL THEN '✅ VINCULADA COM SUCESSO'
    ELSE '❌ AINDA NÃO VINCULADA'
  END as status
FROM auth.users u
LEFT JOIN company_users cu ON cu.user_id = u.id
LEFT JOIN companies c ON cu.company_id = c.id
LEFT JOIN sellers s ON cu.seller_id = s.id
WHERE u.email = 'sarah.@empresa.com' OR u.email LIKE '%sarah%';