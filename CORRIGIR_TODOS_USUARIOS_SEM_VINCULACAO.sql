-- ========================================
-- CORRIGIR TODOS USUÁRIOS SEM VINCULAÇÃO
-- ========================================

-- 1. LISTAR USUÁRIOS SEM VINCULAÇÃO
SELECT 
  'USUARIOS SEM VINCULACAO' as categoria,
  u.id,
  u.email,
  u.created_at,
  u.raw_user_meta_data->>'seller_name' as seller_name_metadata,
  (u.raw_user_meta_data->>'company_id')::UUID as company_id_metadata
FROM auth.users u
LEFT JOIN company_users cu ON cu.user_id = u.id
WHERE cu.user_id IS NULL
AND u.email NOT LIKE '%@hotmail.com' -- Excluir admin
ORDER BY u.created_at DESC;

-- 2. CONFIRMAR EMAILS DE TODOS OS USUÁRIOS SEM CONFIRMAÇÃO
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL
AND email NOT LIKE '%@hotmail.com'; -- Excluir admin

-- 3. VINCULAR AUTOMATICAMENTE TODOS OS USUÁRIOS SEM VINCULAÇÃO
-- Baseado nos metadados salvos durante a criação
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
LEFT JOIN company_users cu ON cu.user_id = u.id
CROSS JOIN LATERAL (
  SELECT id 
  FROM sellers 
  WHERE name ILIKE u.raw_user_meta_data->>'seller_name'
  AND company_id = (u.raw_user_meta_data->>'company_id')::UUID
  LIMIT 1
) s
WHERE cu.user_id IS NULL
AND u.raw_user_meta_data->>'seller_name' IS NOT NULL
AND u.raw_user_meta_data->>'company_id' IS NOT NULL
AND u.email NOT LIKE '%@hotmail.com'
ON CONFLICT (user_id, company_id) DO UPDATE SET
  seller_id = EXCLUDED.seller_id,
  active = TRUE;

-- 4. VERIFICAR RESULTADO
SELECT 
  'RESULTADO FINAL' as categoria,
  u.email,
  cu.company_id,
  c.name as company_name,
  cu.seller_id,
  s.name as seller_name,
  CASE 
    WHEN cu.seller_id IS NOT NULL THEN '✅ VINCULADO'
    ELSE '❌ SEM VINCULAÇÃO'
  END as status
FROM auth.users u
LEFT JOIN company_users cu ON cu.user_id = u.id
LEFT JOIN companies c ON cu.company_id = c.id
LEFT JOIN sellers s ON cu.seller_id = s.id
WHERE u.email NOT LIKE '%@hotmail.com'
ORDER BY u.created_at DESC;