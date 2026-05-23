-- ========================================
-- VERIFICAR ESTRUTURA DA TABELA SALES
-- ========================================

-- 1. VERIFICAR COLUNAS DA TABELA SALES
SELECT 
  'COLUNAS SALES' as categoria,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'sales'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. VERIFICAR SE TEM COMPANY_ID
SELECT 
  'TEM COMPANY_ID?' as pergunta,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'sales' 
      AND column_name = 'company_id'
    ) THEN '✅ SIM - Tabela tem company_id'
    ELSE '❌ NÃO - Tabela NÃO tem company_id (PROBLEMA!)'
  END as resultado;

-- 3. VERIFICAR RELACIONAMENTOS
SELECT 
  'RELACIONAMENTOS' as categoria,
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'sales' 
AND tc.constraint_type = 'FOREIGN KEY';