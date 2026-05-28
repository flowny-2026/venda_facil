-- ============================================
-- ADICIONAR CAMPO DATA DE NASCIMENTO
-- ============================================

-- Adicionar coluna birth_date na tabela customers
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS birth_date DATE;

-- Verificar
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'customers' 
AND column_name = 'birth_date';
