-- ========================================
-- TESTAR FUNÇÃO DELETE_COMPANY_CASCADE
-- ========================================

-- PASSO 1: Verificar se a função existe
SELECT 
  'FUNCAO EXISTE' as status,
  routine_name,
  routine_type,
  specific_name
FROM information_schema.routines 
WHERE routine_name = 'delete_company_cascade';

-- PASSO 2: Ver a definição completa da função
SELECT 
  'DEFINICAO FUNCAO' as status,
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'delete_company_cascade';

-- PASSO 3: Testar a função com a empresa lojalolo
-- ATENÇÃO: Esta linha VAI DELETAR a empresa se descomentada!
-- SELECT delete_company_cascade('lojalolo');

-- PASSO 4: Verificar parâmetros da função
SELECT 
  'PARAMETROS FUNCAO' as status,
  parameter_name,
  data_type,
  parameter_mode
FROM information_schema.parameters 
WHERE specific_name IN (
  SELECT specific_name 
  FROM information_schema.routines 
  WHERE routine_name = 'delete_company_cascade'
)
ORDER BY ordinal_position;

-- PASSO 5: Verificar se há outras empresas de teste para usar
SELECT 
  'EMPRESAS TESTE' as categoria,
  id,
  name,
  email,
  CASE 
    WHEN name ILIKE '%test%' OR name ILIKE '%teste%' THEN '🧪 TESTE'
    WHEN name ILIKE '%loja%' AND name != 'lojatem' THEN '🧪 POSSÍVEL TESTE'
    WHEN email ILIKE '%empresa.com%' THEN '🧪 EMAIL TESTE'
    ELSE '✅ REAL'
  END as tipo
FROM companies 
WHERE name != 'VendaFácil Admin'
ORDER BY created_at DESC;

-- PASSO 6: Se quiser testar a função, descomente a linha abaixo:
-- CUIDADO: Isso VAI DELETAR a empresa!
-- SELECT delete_company_cascade('lojalolo') as resultado_teste;