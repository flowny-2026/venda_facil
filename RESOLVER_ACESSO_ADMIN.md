# 🔧 Resolver "Acesso Negado" no Painel Admin

## 📋 Situação Atual

Você está vendo a tela "Acesso Negado" ao fazer login no painel admin porque o usuário não tem a permissão `super_admin`.

---

## ✅ Solução Rápida (3 Passos)

### PASSO 1: Abra o SQL Editor do Supabase

1. Acesse: https://supabase.com/dashboard/project/cvmjjzhvdmpbxquxepue
2. Menu lateral → **SQL Editor**
3. Clique em **New Query**

---

### PASSO 2: Execute este SQL para Diagnóstico

Cole e execute:

```sql
-- Ver qual usuário você tem no sistema
SELECT 
    u.id as user_id,
    u.email,
    cu.role,
    cu.active
FROM auth.users u
LEFT JOIN company_users cu ON cu.user_id = u.id
WHERE u.email IN (
    'edicharlesbrito2009@hotmail.com',
    'lojatem@empresa.com',
    'bete@empresa.com',
    'maria@empresa.com'
)
ORDER BY u.email;
```

**Anote o resultado aqui:**
- Email encontrado: _______________
- User ID: _______________
- Role atual: _______________

---

### PASSO 3: Execute a Correção

#### OPÇÃO A: Se o usuário JÁ EXISTE (tem user_id)

Cole e execute (substitua o email se necessário):

```sql
DO $$
DECLARE
    v_user_id uuid;
    v_company_id uuid;
BEGIN
    -- Buscar user_id pelo email
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = 'lojatem@empresa.com';  -- ← ALTERE AQUI se for outro email
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuário não encontrado! Crie no Dashboard primeiro.';
    END IF;
    
    -- Buscar empresa lojatem
    SELECT id INTO v_company_id
    FROM companies
    WHERE name = 'lojatem'
    LIMIT 1;
    
    -- Dar permissão de super_admin
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
        v_user_id,
        v_company_id,
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
    
    RAISE NOTICE '✅ Usuário configurado como super_admin!';
END $$;
```

**Resultado esperado:**
```
✅ Usuário configurado como super_admin!
```

---

#### OPÇÃO B: Se o usuário NÃO EXISTE

1. **Crie o usuário no Supabase Dashboard:**
   - Vá em: Authentication → Users
   - Clique em **"Add User"**
   - Preencha:
     - **Email:** edicharlesbrito2009@hotmail.com
     - **Password:** [escolha uma senha forte]
     - **Auto Confirm User:** ✅ **MARQUE ESTA OPÇÃO**
   - Clique em **"Create User"**

2. **Depois execute a OPÇÃO A acima**

---

### PASSO 4: Verificar se Funcionou

Execute:

```sql
SELECT 
    u.email,
    cu.role,
    cu.active
FROM auth.users u
JOIN company_users cu ON cu.user_id = u.id
WHERE cu.role = 'super_admin';
```

**Deve retornar:**
```
email: lojatem@empresa.com (ou seu email)
role: super_admin
active: true
```

---

### PASSO 5: Fazer Login

1. Abra o painel admin: http://localhost:5174
2. Faça login com:
   - **Email:** lojatem@empresa.com (ou o email que você configurou)
   - **Senha:** [a senha do usuário]
3. **Deve funcionar!** ✅

---

## 🔍 Verificar Console do Navegador

Abra o **Console do Navegador** (F12) e veja as mensagens:

```
🔍 checkAdminStatus chamado, user: [user_id]
📊 Resultado: { role: 'super_admin' } Erro: null
✅ É admin? true
```

Se aparecer:
```
📊 Resultado: null Erro: null
✅ É admin? false
```

Significa que o usuário não tem role `super_admin` → Execute o PASSO 3 novamente.

---

## 🎯 Qual Email Usar?

Você tem 3 opções:

### 1. **lojatem@empresa.com** (Recomendado)
- ✅ Já existe no sistema
- ✅ Já vinculado à empresa lojatem
- ✅ Mais rápido

### 2. **edicharlesbrito2009@hotmail.com** (Seu email pessoal)
- ⚠️ Precisa criar no Dashboard primeiro
- ✅ Mais profissional
- ✅ Email real

### 3. **Criar um novo** (ex: admin@vendafacil.com)
- ⚠️ Precisa criar no Dashboard
- ✅ Específico para admin

---

## 📞 Ainda não Funcionou?

Execute este diagnóstico completo e me envie o resultado:

```sql
-- 1. Ver todos os usuários
SELECT id, email FROM auth.users;

-- 2. Ver todas as empresas
SELECT id, name FROM companies;

-- 3. Ver todos os company_users
SELECT 
    u.email,
    cu.role,
    cu.active,
    c.name as company
FROM company_users cu
JOIN auth.users u ON u.id = cu.user_id
LEFT JOIN companies c ON c.id = cu.company_id;

-- 4. Ver super_admins
SELECT 
    u.email,
    cu.role
FROM company_users cu
JOIN auth.users u ON u.id = cu.user_id
WHERE cu.role = 'super_admin';
```

Copie e cole todos os resultados.

---

## 💡 Resumo Visual

```
┌─────────────────────────────────────┐
│ 1. Usuário existe no auth.users?    │
└─────────────────────────────────────┘
           │
           ├─ SIM → Execute PASSO 3 OPÇÃO A
           │
           └─ NÃO → Execute PASSO 3 OPÇÃO B
                     (Criar no Dashboard)
                     Depois OPÇÃO A

┌─────────────────────────────────────┐
│ 2. Verificar no PASSO 4             │
│    Deve mostrar role: super_admin   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 3. Fazer login no painel admin      │
│    Deve funcionar! ✅               │
└─────────────────────────────────────┘
```

---

## 🎉 Pronto!

Após seguir estes passos, você terá acesso completo ao painel administrativo.
