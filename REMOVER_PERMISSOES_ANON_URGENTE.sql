-- =====================================================
-- 🚨 EXECUTE ESTE SCRIPT IMEDIATAMENTE 🚨
-- =====================================================
-- Remove permissões perigosas de usuários não autenticados
-- =====================================================

-- REVOGAR TODAS as permissões de ANON (não autenticados)
REVOKE ALL ON v_company_users_emails FROM anon;
REVOKE ALL ON v_company_users_full FROM anon;
REVOKE ALL ON v_company_users_with_seller FROM anon;

-- REVOGAR TODAS as permissões de PUBLIC
REVOKE ALL ON v_company_users_emails FROM public;
REVOKE ALL ON v_company_users_full FROM public;
REVOKE ALL ON v_company_users_with_seller FROM public;

-- Permitir APENAS SELECT para usuários AUTENTICADOS
GRANT SELECT ON v_company_users_emails TO authenticated;
GRANT SELECT ON v_company_users_full TO authenticated;
GRANT SELECT ON v_company_users_with_seller TO authenticated;

-- =====================================================
-- ✅ PRONTO! Agora execute a verificação abaixo:
-- =====================================================

SELECT 
  table_name,
  grantee,
  string_agg(privilege_type, ', ' ORDER BY privilege_type) as permissions
FROM information_schema.table_privileges
WHERE table_schema = 'public'
AND table_name LIKE 'v_company_%'
AND grantee IN ('anon', 'authenticated', 'public')
GROUP BY table_name, grantee
ORDER BY table_name, grantee;

-- =====================================================
-- RESULTADO ESPERADO:
-- 
-- | table_name                  | grantee       | permissions |
-- |-----------------------------|---------------|-------------|
-- | v_company_users_emails      | authenticated | SELECT      |
-- | v_company_users_full        | authenticated | SELECT      |
-- | v_company_users_with_seller | authenticated | SELECT      |
--
-- ❌ NÃO DEVE TER LINHAS COM grantee = 'anon' ou 'public'
-- ✅ Apenas 'authenticated' com 'SELECT'
-- =====================================================
