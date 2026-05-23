-- ========================================
-- MOVER NICOLLY E AMANDA PARA EMPRESA CORRETA
-- ========================================

-- 1. VERIFICAR EMPRESAS DISPONÍVEIS
SELECT 
  'EMPRESAS DISPONIVEIS' as categoria,
  id,
  name,
  access_type
FROM companies
ORDER BY name;

-- 2. IDENTIFICAR EMPRESA CORRETA
-- Você precisa me dizer qual é o ID correto da empresa "loja liz brito"
-- Por enquanto, vou mostrar as opções

SELECT 
  'QUAL EMPRESA CORRETA?' as pergunta,
  id,
  name,
  access_type,
  CASE 
    WHEN name = 'loja liz brito' THEN '✅ ESTA É A CORRETA?'
    WHEN name = 'loja liz' THEN '❌ ESTA É A ERRADA (atual)'
    ELSE '❓ OUTRA EMPRESA'
  END as status
FROM companies
ORDER BY name;

-- 3. SCRIPT PARA MOVER (AJUSTAR O ID DEPOIS)
-- IMPORTANTE: Substitua 'ID_EMPRESA_CORRETA' pelo ID real da empresa "loja liz brito"

/*
-- DESCOMENTE E AJUSTE O ID DEPOIS DE CONFIRMAR

-- Mover Nicolly
UPDATE company_users 
SET company_id = 'ID_EMPRESA_CORRETA'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'nicolly@empresa.com');

-- Mover Amanda  
UPDATE company_users 
SET company_id = 'ID_EMPRESA_CORRETA'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'amanda@empresa.com');

-- Mover vendedor Nicolly
UPDATE sellers
SET company_id = 'ID_EMPRESA_CORRETA'
WHERE name ILIKE '%nicolly%';

-- Mover vendedor Amanda
UPDATE sellers
SET company_id = 'ID_EMPRESA_CORRETA'
WHERE name ILIKE '%amanda%';
*/