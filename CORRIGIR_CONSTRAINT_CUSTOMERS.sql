-- ========================================
-- CORRIGIR CONSTRAINT DE EMAIL DUPLICADO
-- ========================================

-- 1. REMOVER CONSTRAINT DE EMAIL ÚNICO
ALTER TABLE customers 
DROP CONSTRAINT IF EXISTS customers_email_company_unique;

-- 2. VERIFICAR SE FOI REMOVIDA
SELECT 
  '✅ CONSTRAINT REMOVIDA' as status,
  'Agora é possível cadastrar clientes com mesmo email' as observacao;

-- 3. LISTAR CONSTRAINTS RESTANTES
SELECT 
  'CONSTRAINTS ATUAIS' as categoria,
  conname as constraint_name,
  contype as tipo
FROM pg_constraint
WHERE conrelid = 'customers'::regclass;
