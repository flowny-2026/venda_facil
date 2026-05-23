-- ========================================
-- DELETAR EMPRESA DE TESTE MANUALMENTE
-- ========================================
-- Vamos deletar a empresa "lojalolo" manualmente para testar

-- EMPRESA ALVO: lojalolo (d21fd5fb-d1d3-461d-98f4-8c7dc380099c)

-- PASSO 1: Verificar estado atual
SELECT 
  'ANTES DA EXCLUSAO' as status,
  c.name,
  (SELECT COUNT(*) FROM company_users WHERE company_id = c.id) as usuarios,
  (SELECT COUNT(*) FROM products WHERE company_id = c.id) as produtos,
  (SELECT COUNT(*) FROM sales WHERE company_id = c.id) as vendas,
  (SELECT COUNT(*) FROM sellers WHERE company_id = c.id) as vendedores,
  (SELECT COUNT(*) FROM payment_methods WHERE company_id = c.id) as formas_pagamento
FROM companies c
WHERE c.id = 'd21fd5fb-d1d3-461d-98f4-8c7dc380099c';

-- PASSO 2: Deletar itens de venda (se houver)
DELETE FROM sale_items 
WHERE sale_id IN (
  SELECT id FROM sales WHERE company_id = 'd21fd5fb-d1d3-461d-98f4-8c7dc380099c'
);

-- PASSO 3: Deletar vendas
DELETE FROM sales 
WHERE company_id = 'd21fd5fb-d1d3-461d-98f4-8c7dc380099c';

-- PASSO 4: Deletar produtos
DELETE FROM products 
WHERE company_id = 'd21fd5fb-d1d3-461d-98f4-8c7dc380099c';

-- PASSO 5: Deletar vendedores
DELETE FROM sellers 
WHERE company_id = 'd21fd5fb-d1d3-461d-98f4-8c7dc380099c';

-- PASSO 6: Deletar formas de pagamento
DELETE FROM payment_methods 
WHERE company_id = 'd21fd5fb-d1d3-461d-98f4-8c7dc380099c';

-- PASSO 7: Deletar usuários da empresa
DELETE FROM company_users 
WHERE company_id = 'd21fd5fb-d1d3-461d-98f4-8c7dc380099c';

-- PASSO 8: Tentar deletar a empresa
DELETE FROM companies 
WHERE id = 'd21fd5fb-d1d3-461d-98f4-8c7dc380099c';

-- PASSO 9: Verificar se foi deletada
SELECT 
  'APOS EXCLUSAO' as status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM companies WHERE id = 'd21fd5fb-d1d3-461d-98f4-8c7dc380099c')
    THEN '❌ EMPRESA AINDA EXISTE'
    ELSE '✅ EMPRESA DELETADA'
  END as resultado;

-- PASSO 10: Verificar se há outras empresas de teste para deletar
SELECT 
  'OUTRAS EMPRESAS TESTE' as categoria,
  id,
  name,
  email,
  CASE 
    WHEN name ILIKE '%test%' OR name ILIKE '%teste%' OR name ILIKE '%loja%' THEN '🧪 POSSÍVEL TESTE'
    WHEN email ILIKE '%empresa.com%' THEN '🧪 EMAIL TESTE'
    ELSE '✅ REAL'
  END as tipo
FROM companies 
WHERE name != 'VendaFácil Admin'
ORDER BY created_at DESC;