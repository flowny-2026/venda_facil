-- ========================================
-- CRIAR TRIGGER PARA AUTO-VINCULAR VENDEDORES
-- ========================================
-- Este trigger vincula automaticamente vendedores quando são criados

-- 1. CRIAR FUNÇÃO DO TRIGGER
CREATE OR REPLACE FUNCTION auto_link_seller_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  seller_name TEXT;
  seller_company_id UUID;
  seller_record RECORD;
BEGIN
  -- Extrair nome do vendedor dos metadados
  seller_name := NEW.raw_user_meta_data->>'seller_name';
  seller_company_id := (NEW.raw_user_meta_data->>'company_id')::UUID;
  
  -- Se não tem seller_name, não fazer nada
  IF seller_name IS NULL OR seller_company_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Buscar vendedor pelo nome e empresa
  SELECT id INTO seller_record
  FROM sellers
  WHERE name ILIKE seller_name
  AND company_id = seller_company_id
  LIMIT 1;
  
  -- Se encontrou o vendedor, criar vinculação
  IF FOUND THEN
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
    ) VALUES (
      NEW.id,
      seller_company_id,
      seller_record.id,
      'seller',
      TRUE,
      TRUE,
      FALSE,
      FALSE,
      FALSE
    )
    ON CONFLICT (user_id, company_id) DO UPDATE SET
      seller_id = EXCLUDED.seller_id,
      active = TRUE;
    
    -- Confirmar email automaticamente
    UPDATE auth.users
    SET email_confirmed_at = NOW()
    WHERE id = NEW.id
    AND email_confirmed_at IS NULL;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 2. CRIAR TRIGGER
DROP TRIGGER IF EXISTS on_auth_user_created_auto_link ON auth.users;

CREATE TRIGGER on_auth_user_created_auto_link
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_link_seller_on_signup();

-- 3. VERIFICAR SE FOI CRIADO
SELECT 
  'TRIGGER CRIADO' as categoria,
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created_auto_link';