-- ========================================
-- EXECUTAR DELETE CASCADE - TESTE
-- ========================================
-- Vamos testar com a empresa "lojalolo" que é claramente de teste

-- ANTES: Verificar estado atual
SELECT 
  'ANTES DO DELETE' as momento,
  COUNT(*) as total_empresas
FROM companies;

SELECT 
  'EMPRESA ALVO' as categoria,
  id,
  name,
  email,
  status
FROM companies 
WHERE name = 'lojalolo';

-- EXECUTAR A FUNÇÃO DE DELETE CASCADE
SELECT delete_company_cascade('lojalolo') as resultado;

-- DEPOIS: Verificar se foi deletada
SELECT 
  'DEPOIS DO DELETE' as momento,
  COUNT(*) as total_empresas
FROM companies;

-- Verificar se lojalolo ainda existe
SELECT 
  'VERIFICACAO FINAL' as categoria,
  CASE 
    WHEN EXISTS (SELECT 1 FROM companies WHERE name = 'lojalolo')
    THEN '❌ EMPRESA AINDA EXISTE'
    ELSE '✅ EMPRESA DELETADA COM SUCESSO'
  END as resultado;

-- Listar empresas restantes
SELECT 
  'EMPRESAS RESTANTES' as categoria,
  name,
  email,
  status
FROM companies 
ORDER BY name;