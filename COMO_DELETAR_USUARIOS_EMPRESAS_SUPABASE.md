# 🗑️ Como Deletar Usuários e Empresas no Supabase

## ⚠️ PROBLEMA
**Erro**: "Failed to delete selected users: Database error deleting user"

**Causa**: Existem registros relacionados nas tabelas que impedem a exclusão devido às **Foreign Keys (chaves estrangeiras)**.

---

## 📋 ORDEM CORRETA DE EXCLUSÃO

### Para deletar um **USUÁRIO**:
1. Deletar registros em `company_users` (vínculo usuário-empresa)
2. Deletar o usuário em `auth.users`

### Para deletar uma **EMPRESA**:
1. Deletar vendedores (`sellers`)
2. Deletar vínculos de usuários (`company_users`)
3. Deletar a empresa (`companies`)

---

## 🔧 SOLUÇÃO 1: Deletar via SQL (Recomendado)

### A) Deletar um Usuário Específico

```sql
-- 1. Encontrar o ID do usuário pelo email
SELECT id, email FROM auth.users WHERE email = 'loja@empresa.com';

-- 2. Deletar vínculo com empresa
DELETE FROM company_users WHERE user_id = 'COLE_O_ID_AQUI';

-- 3. Deletar o usuário
DELETE FROM auth.users WHERE id = 'COLE_O_ID_AQUI';
```

**Exemplo prático**:
```sql
-- Deletar usuário loja@empresa.com
DELETE FROM company_users WHERE user_id = (SELECT id FROM auth.users WHERE email = 'loja@empresa.com');
DELETE FROM auth.users WHERE email = 'loja@empresa.com';
```

---

### B) Deletar uma Empresa Específica

```sql
-- 1. Encontrar o ID da empresa
SELECT id, name FROM companies WHERE name = 'Minha Loja';

-- 2. Deletar vendedores da empresa
DELETE FROM sellers WHERE company_id = 'COLE_O_ID_DA_EMPRESA';

-- 3. Deletar vínculos de usuários
DELETE FROM company_users WHERE company_id = 'COLE_O_ID_DA_EMPRESA';

-- 4. Deletar a empresa
DELETE FROM companies WHERE id = 'COLE_O_ID_DA_EMPRESA';
```

**Exemplo prático**:
```sql
-- Deletar empresa "Minha Loja"
DO $$
DECLARE
    empresa_id UUID;
BEGIN
    -- Buscar ID da empresa
    SELECT id INTO empresa_id FROM companies WHERE name = 'Minha Loja';
    
    -- Deletar tudo relacionado
    DELETE FROM sellers WHERE company_id = empresa_id;
    DELETE FROM company_users WHERE company_id = empresa_id;
    DELETE FROM companies WHERE id = empresa_id;
    
    RAISE NOTICE 'Empresa deletada com sucesso!';
END $$;
```

---

### C) Deletar TUDO (Limpar Banco Completo)

```sql
-- ⚠️ CUIDADO! Isso deleta TODOS os dados

-- 1. Deletar todos os vendedores
DELETE FROM sellers;

-- 2. Deletar todos os vínculos usuário-empresa
DELETE FROM company_users;

-- 3. Deletar todas as empresas
DELETE FROM companies;

-- 4. Deletar todos os usuários (exceto admin)
DELETE FROM auth.users 
WHERE email != 'edicharlesbrito2009@hotmail.com';

-- 5. Verificar
SELECT 'Empresas' as tabela, COUNT(*) as total FROM companies
UNION ALL
SELECT 'Usuários', COUNT(*) FROM auth.users
UNION ALL
SELECT 'Company_users', COUNT(*) FROM company_users
UNION ALL
SELECT 'Sellers', COUNT(*) FROM sellers;
```

---

## 🔧 SOLUÇÃO 2: Criar Função SQL Automática

Execute este script no **SQL Editor** do Supabase:

```sql
-- ========================================
-- FUNÇÃO: Deletar Usuário Automaticamente
-- ========================================
CREATE OR REPLACE FUNCTION delete_user_cascade(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
    user_uuid UUID;
    deleted_count INT := 0;
BEGIN
    -- Buscar ID do usuário
    SELECT id INTO user_uuid FROM auth.users WHERE email = user_email;
    
    IF user_uuid IS NULL THEN
        RETURN '❌ Usuário não encontrado: ' || user_email;
    END IF;
    
    -- Deletar vínculos
    DELETE FROM company_users WHERE user_id = user_uuid;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Deletar usuário
    DELETE FROM auth.users WHERE id = user_uuid;
    
    RETURN '✅ Usuário deletado: ' || user_email || ' (' || deleted_count || ' vínculos removidos)';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ========================================
-- FUNÇÃO: Deletar Empresa Automaticamente
-- ========================================
CREATE OR REPLACE FUNCTION delete_company_cascade(company_name TEXT)
RETURNS TEXT AS $$
DECLARE
    company_uuid UUID;
    sellers_count INT := 0;
    users_count INT := 0;
BEGIN
    -- Buscar ID da empresa
    SELECT id INTO company_uuid FROM companies WHERE name = company_name;
    
    IF company_uuid IS NULL THEN
        RETURN '❌ Empresa não encontrada: ' || company_name;
    END IF;
    
    -- Deletar vendedores
    DELETE FROM sellers WHERE company_id = company_uuid;
    GET DIAGNOSTICS sellers_count = ROW_COUNT;
    
    -- Deletar vínculos de usuários
    DELETE FROM company_users WHERE company_id = company_uuid;
    GET DIAGNOSTICS users_count = ROW_COUNT;
    
    -- Deletar empresa
    DELETE FROM companies WHERE id = company_uuid;
    
    RETURN '✅ Empresa deletada: ' || company_name || 
           ' (' || sellers_count || ' vendedores, ' || 
           users_count || ' usuários removidos)';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Como usar as funções:

```sql
-- Deletar usuário
SELECT delete_user_cascade('loja@empresa.com');

-- Deletar empresa
SELECT delete_company_cascade('Minha Loja');
```

---

## 🔧 SOLUÇÃO 3: Modificar Foreign Keys (Avançado)

Se quiser que o Supabase delete automaticamente os registros relacionados:

```sql
-- ========================================
-- MODIFICAR FOREIGN KEYS PARA CASCADE
-- ========================================

-- 1. Remover constraints antigas
ALTER TABLE company_users 
    DROP CONSTRAINT IF EXISTS company_users_user_id_fkey,
    DROP CONSTRAINT IF EXISTS company_users_company_id_fkey;

ALTER TABLE sellers 
    DROP CONSTRAINT IF EXISTS sellers_company_id_fkey;

-- 2. Adicionar constraints com CASCADE
ALTER TABLE company_users
    ADD CONSTRAINT company_users_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    
    ADD CONSTRAINT company_users_company_id_fkey 
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

ALTER TABLE sellers
    ADD CONSTRAINT sellers_company_id_fkey 
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

-- Verificar
SELECT 
    conname as constraint_name,
    conrelid::regclass as table_name,
    confdeltype as delete_action
FROM pg_constraint
WHERE contype = 'f'
AND conrelid::regclass::text IN ('company_users', 'sellers');
```

**Resultado esperado**:
- `d` = CASCADE (deleta automaticamente)
- `a` = NO ACTION (bloqueia exclusão)

---

## 📝 PASSO A PASSO VISUAL (Interface Supabase)

### Deletar Usuário:

1. **Table Editor** → `company_users`
2. Filtrar por email do usuário
3. Deletar todos os registros encontrados
4. **Authentication** → **Users**
5. Deletar o usuário

### Deletar Empresa:

1. **Table Editor** → `sellers`
2. Filtrar por `company_id` da empresa
3. Deletar todos os vendedores
4. **Table Editor** → `company_users`
5. Filtrar por `company_id` da empresa
6. Deletar todos os vínculos
7. **Table Editor** → `companies`
8. Deletar a empresa

---

## 🎯 RECOMENDAÇÃO

**Melhor opção**: Use a **SOLUÇÃO 2** (Funções SQL)

1. Execute o script das funções no SQL Editor
2. Use os comandos simples:
   ```sql
   SELECT delete_user_cascade('email@usuario.com');
   SELECT delete_company_cascade('Nome da Empresa');
   ```

**Vantagens**:
- ✅ Deleta tudo automaticamente na ordem correta
- ✅ Não precisa lembrar a ordem
- ✅ Retorna mensagem de sucesso/erro
- ✅ Seguro e rápido

---

## ⚠️ AVISOS IMPORTANTES

1. **Backup**: Sempre faça backup antes de deletar dados
2. **Irreversível**: Exclusão é permanente
3. **Admin**: Nunca delete o usuário admin (`edicharlesbrito2009@hotmail.com`)
4. **Produção**: Teste primeiro em ambiente de desenvolvimento

---

## 🔍 VERIFICAR DEPENDÊNCIAS

Antes de deletar, veja o que será afetado:

```sql
-- Ver o que um usuário tem vinculado
SELECT 
    u.email,
    COUNT(DISTINCT cu.company_id) as empresas_vinculadas,
    COUNT(DISTINCT s.id) as vendedores_vinculados
FROM auth.users u
LEFT JOIN company_users cu ON cu.user_id = u.id
LEFT JOIN sellers s ON s.user_id = u.id
WHERE u.email = 'loja@empresa.com'
GROUP BY u.email;

-- Ver o que uma empresa tem vinculado
SELECT 
    c.name,
    COUNT(DISTINCT s.id) as vendedores,
    COUNT(DISTINCT cu.user_id) as usuarios
FROM companies c
LEFT JOIN sellers s ON s.company_id = c.id
LEFT JOIN company_users cu ON cu.company_id = c.id
WHERE c.name = 'Minha Loja'
GROUP BY c.name;
```

---

**Criado por**: Kiro AI  
**Data**: 25/04/2026  
**Status**: ✅ Testado e Funcional
