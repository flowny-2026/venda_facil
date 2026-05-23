-- ========================================
-- VERIFICAR PERMISSÕES DE SARAH
-- ========================================

SELECT 
  'PERMISSOES SARAH' as categoria,
  u.email,
  cu.role,
  cu.can_access_pdv,
  cu.can_view_reports,
  cu.can_manage_products,
  cu.can_manage_sellers,
  CASE 
    WHEN cu.role = 'seller' AND cu.can_manage_products = FALSE AND cu.can_manage_sellers = FALSE 
    THEN '✅ PERMISSOES CORRETAS PARA VENDEDOR'
    WHEN cu.role = 'manager' 
    THEN '👔 GERENTE - VÊ TUDO'
    ELSE '⚠️ PERMISSOES INCORRETAS'
  END as status
FROM auth.users u
JOIN company_users cu ON cu.user_id = u.id
WHERE u.email LIKE '%sarah%';