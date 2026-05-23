-- ========================================
-- TESTE DEFINITIVO - EXCLUSÃO DE EMPRESAS
-- ========================================
-- Este script testa se a função delete_company_cascade está funcionando

-- 1. VERIFICAR ESTADO ATUAL
SELECT 
  'ESTADO ATUAL' as categoria,
  COUNT(*) as total_empresas
FROM companies;

-- 2. LISTAR EMPRESAS DISPONÍVEIS PARA TESTE
SELECT 
  'EMPRESAS TESTE' as categoria,
  id,
  name,
  email,
  CASE 
    WHEN name = 'lojaabcd' THEN '🧪 POSSÍVEL TESTE'
    WHEN name = 'lojatem' THEN '🧪 EMAIL TESTE'
    WHEN name = 'lojalolo' THEN '🧪 POSSÍVEL TESTE'
    ELSE '✅ EMPRESA REAL'
  END as tipo
FROM companies 
WHERE name IN ('lojaabcd', 'lojatem', 'lojalolo')
ORDER BY name;

-- 3. VERIFICAR SE A FUNÇÃO EXISTE
SELECT 
  'FUNCOES RELACIONADAS' as categoria,
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines 
WHERE routine_name IN ('delete_company_cascade', 'create_company')
  AND routine_schema = 'public';

-- 4. INSTRUÇÕES PARA O USUÁRIO
SELECT 
  'INSTRUCOES' as categoria,
  'Para testar a exclusão, use a empresa "lojaabcd" que é claramente de teste' as instrucao
UNION ALL
SELECT 
  'INSTRUCOES' as categoria,
  'Execute: SELECT delete_company_cascade(''lojaabcd'');' as instrucao
UNION ALL
SELECT 
  'INSTRUCOES' as categoria,
  'Depois verifique se a empresa sumiu da lista' as instrucao;