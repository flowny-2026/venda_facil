# 🔧 Configurar Usuário Admin - Passo a Passo

## 🚨 Problema

Ao fazer login no painel admin, aparece "Acesso Negado" porque o usuário não tem a role `super_admin`.

---

## ✅ Solução Completa

### PASSO 1: Criar Usuário no Supabase Auth

1. **Abra o Supabase Dashboard**
   - URL: https://supabase.com/dashboard/project/cvmjjzhvdmpbxquxepue

2. **Vá em Authentication → Users**
   - Menu lateral esquerdo
   - Clique em "Authentication"
   - Clique em "Users"

3. **Adicione um novo usuário**
   - Clique em "Add User" (botão verde)
   - **Email:** edicharlesbrito2009@hotmail.com
   - **Password:** [escolha uma senha forte]
   - **Auto Confirm User:** ✅ Marque esta opção
   - Clique em "Create User"

4. **Copie o User ID**
   - Após criar, clique no usuário
   - Copie o **ID** (UUID longo)
   - Exemplo: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

---

### PASSO 2: Dar Permissão de Super Admin

Execute no **Supabase SQL Editor**:

```sql
-- Verificar se o usuário existe
SELECT 
    id,
    email,
    created_at
FROM auth.users
WHERE email = 'edicharlesbrito2009@hotmail.com';

-- Copie o ID acima e substitua abaixo
```

Depois execute (substituindo o ID):

```sql
-- Inserir como super_admin
INSERT INTO company_users (
    user_id,
    company_id,
    role,
    active,
    can_access_pdv,
    can_view_reports,
    can_manage_products,
    can_manage_sellers
) VALUES (
    'COLE_O_ID_AQUI',  -- ← SUBSTITUA pelo ID do usuário
    'f3063d74-fa10-4cf7-9324-c7f67f66b307',  -- ID da empresa lojatem
    'super_admin',
    true,
    true,
    true,
    true,
    true
)
ON CONFLICT (user_id, company_id) DO UPDATE
SET 
    role = 'super_admin',
    active = true;
```

---

### PASSO 3: Verificar se Funcionou

Execute:

```sql
SELECT 
    u.email,
    cu.role,
    cu.active,
    c.name as company_name
FROM auth.users u
JOIN company_users cu ON cu.user_id = u.id
LEFT JOIN companies c ON c.id = cu.company_id
WHERE u.email = 'edicharlesbrito2009@hotmail.com';
```

**Resultado esperado:**
```
email: edicharlesbrito2009@hotmail.com
role: super_admin
active: true
company_name: lojatem
```

---

### PASSO 4: Fazer Login no Painel Admin

1. **Abra o painel admin**
   - URL: http://localhost:5174 (ou sua porta)

2. **Faça login**
   - Email: edicharlesbrito2009@hotmail.com
   - Senha: [a senha que você definiu]

3. **Deve funcionar!** ✅
   - Você verá o Dashboard
   - Terá acesso a todas as páginas
   - Poderá gerenciar empresas, leads, vendas

---

## 🔍 Diagnóstico de Problemas

### Problema: "Acesso Negado" após login

**Causa:** Usuário não tem role `super_admin`

**Solução:** Execute o PASSO 2 novamente

---

### Problema: "Email já existe"

**Causa:** Usuário já foi criado antes

**Solução:** 
1. Vá em Authentication → Users
2. Encontre o usuário
3. Copie o ID
4. Execute apenas o PASSO 2

---

### Problema: "Erro ao verificar admin"

**Causa:** Tabela `company_users` não tem o registro

**Solução:** Execute o PASSO 2

---

## 📋 Verificação Rápida

Execute este SQL para ver todos os admins:

```sql
SELECT 
    u.email,
    cu.role,
    cu.active
FROM auth.users u
JOIN company_users cu ON cu.user_id = u.id
WHERE cu.role = 'super_admin'
ORDER BY u.email;
```

---

## 🎯 Resumo

1. ✅ Criar usuário no Supabase Auth
2. ✅ Copiar o User ID
3. ✅ Inserir na tabela `company_users` com role `super_admin`
4. ✅ Fazer login no painel admin
5. ✅ Sucesso! 🎉

---

## 💡 Dica

Se você já tem um usuário criado (como `lojatem@empresa.com`), pode apenas atualizar a role:

```sql
UPDATE company_users
SET role = 'super_admin'
WHERE user_id = (
    SELECT id FROM auth.users WHERE email = 'lojatem@empresa.com'
);
```

---

## 📞 Suporte

Se após seguir todos os passos ainda não funcionar:

1. Execute: `SELECT * FROM company_users WHERE role = 'super_admin';`
2. Copie o resultado
3. Envie para análise
