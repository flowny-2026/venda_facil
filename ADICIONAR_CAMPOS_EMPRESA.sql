-- =====================================================
-- ADICIONAR CAMPOS CNPJ E ENDEREÇO NA TABELA COMPANIES
-- =====================================================
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- 1. Adicionar coluna 'document' (CNPJ) se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'companies' AND column_name = 'document'
    ) THEN
        ALTER TABLE companies ADD COLUMN document TEXT;
        RAISE NOTICE 'Coluna document adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna document já existe.';
    END IF;
END $$;

-- 2. Adicionar coluna 'address' (Endereço) se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'companies' AND column_name = 'address'
    ) THEN
        ALTER TABLE companies ADD COLUMN address TEXT;
        RAISE NOTICE 'Coluna address adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna address já existe.';
    END IF;
END $$;

-- 3. Adicionar coluna 'cnpj' (alias para document) se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'companies' AND column_name = 'cnpj'
    ) THEN
        ALTER TABLE companies ADD COLUMN cnpj TEXT;
        RAISE NOTICE 'Coluna cnpj adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna cnpj já existe.';
    END IF;
END $$;

-- 4. Copiar dados de 'document' para 'cnpj' se existirem
UPDATE companies 
SET cnpj = document 
WHERE document IS NOT NULL AND (cnpj IS NULL OR cnpj = '');

-- 5. Verificar estrutura final
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'companies'
AND column_name IN ('document', 'cnpj', 'address', 'phone')
ORDER BY column_name;

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- column_name | data_type | is_nullable
-- ------------|-----------|------------
-- address     | text      | YES
-- cnpj        | text      | YES
-- document    | text      | YES
-- phone       | text      | YES
-- =====================================================

-- =====================================================
-- EXEMPLO DE USO:
-- =====================================================
-- Atualizar dados de uma empresa existente:
/*
UPDATE companies 
SET 
  cnpj = '12.345.678/0001-90',
  document = '12.345.678/0001-90',
  address = 'Rua Exemplo, 123 - Centro - São Paulo/SP - CEP 01234-567',
  phone = '(11) 98765-4321'
WHERE id = 'ID_DA_EMPRESA';
*/

-- Verificar dados atualizados:
/*
SELECT id, name, cnpj, address, phone 
FROM companies 
WHERE id = 'ID_DA_EMPRESA';
*/
