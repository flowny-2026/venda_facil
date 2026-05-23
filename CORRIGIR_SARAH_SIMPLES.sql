-- ========================================
-- CORRIGIR SARAH - VERSÃO SIMPLES
-- ========================================

-- 1. VERIFICAR SE SARAH EXISTE
SELECT 
  'SARAH EXISTE?' as pergunta,
  id as user_id,
  email,
  email_confirmed_at
FROM auth.users 
WHERE email LIKE '%sarah%';

-- 2. CONFIRMAR EMAIL
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email LIKE '%sarah%'
AND email_confirmed_at IS NULL;

-- 3. BUSCAR IDs NECESSÁRIOS
SELECT 
  'IDS NECESSARIOS' as categoria,
  (SELECT id FROM auth.users WHERE email LIKE '%sarah%' LIMIT 1) as user_id,
  (SELECT id FROM sellers WHERE name ILIKE '%sarah%' LIMIT 1) as seller_id,
  '5d9fc6d3-22ca-46c8-b0e9-6d06e33dd4e4' as company_id;

-- 4. VINCULAR SARAH (MANUAL)
-- Substitua os IDs se necessário
INSERT INTO company_users (
  user_id,
  company_id,
  seller_id,
  role,
  active,
  can_access_pdv
)
VALUES (
  (SELECT id FROM auth.users WHERE email LIKE '%sarah%' LIMIT 1),
  '5d9fc6d3-22ca-46c8-b0e9-6d06e33dd4e4',
  (SELECT id FROM sellers WHERE name ILIKE '%sarah%' LIMIT 1),
  'seller',
  TRUE,
  TRUE
)
ON CONFLICT (user_id, company_id) DO UPDATE SET
  seller_id = EXCLUDED.seller_id,
  active = TRUE;

-- 5. VERIFICAR RESULTADO
SELECT 
  'RESULTADO' as categoria,
  u.email,
  c.name as company_name,
  s.name as seller_name,
  cu.active
FROM auth.users u
JOIN company_users cu ON cu.user_id = u.id
JOIN companies c ON cu.company_id = c.id
LEFT JOIN sellers s ON cu.seller_id = s.id
WHERE u.email LIKE '%sarah%';