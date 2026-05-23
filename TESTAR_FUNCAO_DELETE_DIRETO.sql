-- ========================================
-- TESTE DIRETO DA FUNÇÃO DELETE
-- ========================================

-- PASSO 1: Criar um usuário de teste para deletar
DO $$
DECLARE
  v_test_user_id UUID;
  v_company_id UUID;
BEGIN
  -- Pegar uma empresa existente
  SELECT id INTO v_company_id FROM companies LIMIT 1;
  
  -- Criar usuário de teste no auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'teste_delete@empresa.com',
    crypt('senha123', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW(),
    '',
    ''
  )
  RETURNING id INTO v_test_user_id;
  
  -- Vincular à empresa
  INSERT INTO company_users (
    user_id,
    company_id,
    role,
    active,
    can_access_pdv
  ) VALUES (
    v_test_user_id,
    v_company_id,
    'seller',
    TRUE,
    TRUE
  );
  
  RAISE NOTICE '✅ Usuário de teste criado: teste_delete@empresa.com (ID: %)', v_test_user_id;
END $$;

-- PASSO 2: Verificar se o usuário foi criado
SELECT 
  '1. USUARIO CRIADO' as categoria,
  u.email,
  u.id,
  c.name as empresa,
  cu.role
FROM auth.users u
LEFT JOIN company_users cu ON cu.user_id = u.id
LEFT JOIN companies c ON cu.company_id = c.id
WHERE u.email = 'teste_delete@empresa.com';

-- PASSO 3: Testar a função de exclusão
SELECT 
  '2. EXECUTANDO DELETE' as categoria,
  delete_user_cascade('teste_delete@empresa.com') as resultado;

-- PASSO 4: Verificar se foi deletado
SELECT 
  '3. VERIFICAR EXCLUSAO' as categoria,
  COUNT(*) as usuarios_encontrados,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ SUCESSO - Usuário foi deletado'
    ELSE '❌ FALHA - Usuário ainda existe'
  END as status
FROM auth.users
WHERE email = 'teste_delete@empresa.com';

-- PASSO 5: Verificar vinculação
SELECT 
  '4. VERIFICAR VINCULACAO' as categoria,
  COUNT(*) as vinculos_encontrados,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ SUCESSO - Vinculação foi removida'
    ELSE '❌ FALHA - Vinculação ainda existe'
  END as status
FROM company_users cu
WHERE cu.user_id IN (
  SELECT id FROM auth.users WHERE email = 'teste_delete@empresa.com'
);
