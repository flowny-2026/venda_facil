# 🗑️ Como Deletar Usuários no Supabase

## Por que os usuários não são deletados automaticamente?

Quando você deleta uma empresa no Painel Admin, o sistema:
- ✅ Deleta a empresa da tabela `companies`
- ✅ Deleta os relacionamentos da tabela `company_users`
- ❌ **NÃO deleta** os usuários do Supabase Auth

**Motivo:** Para deletar usuários do Supabase Auth, é necessário usar a **service_role key** (chave de admin), que não pode ser exposta no frontend por questões de segurança.

---

## 📋 Como Deletar Usuários Manualmente

### **Passo 1: Acessar o Supabase**
1. Vá para: https://supabase.com/dashboard
2. Faça login
3. Selecione o projeto: **responsabilidade_liz**

### **Passo 2: Ir para Authentication**
1. No menu lateral esquerdo, clique em **"Authentication"**
2. Clique em **"Users"**

### **Passo 3: Identificar Usuários Órfãos**
Você verá uma lista de todos os usuários cadastrados. Para identificar quais são de empresas deletadas:

1. Anote os emails das empresas que você deletou
2. Procure esses emails na lista de usuários

### **Passo 4: Deletar Usuário**
1. Clique no usuário que deseja deletar
2. No canto superior direito, clique nos **3 pontinhos (⋮)**
3. Clique em **"Delete user"**
4. Confirme a exclusão

---

## 🔄 Deletar Múltiplos Usuários

Se você tem muitos usuários para deletar:

1. Vá em **SQL Editor** no Supabase
2. Execute este comando:

```sql
-- Ver todos os usuários
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC;

-- Deletar um usuário específico (substitua o email)
DELETE FROM auth.users 
WHERE email = 'loja300@empresa.com';

-- Deletar múltiplos usuários de uma vez
DELETE FROM auth.users 
WHERE email IN (
  'loja300@empresa.com',
  'teste999@empresa.com',
  'teste888@empresa.com'
);
```

---

## ⚠️ Importante

- **Backup:** Antes de deletar, certifique-se de que não precisa mais desses usuários
- **Irreversível:** A exclusão de usuários é permanente
- **Admin:** Nunca delete o usuário admin (`edicharlesbrito2009@hotmail.com`)

---

## 💡 Dica

Quando deletar uma empresa no Painel Admin, o sistema mostra um alerta com os emails dos usuários que precisam ser deletados manualmente no Supabase.

---

## 🚀 Solução Futura (Edge Function)

Para deletar usuários automaticamente, seria necessário criar uma Edge Function do Supabase que:
1. Recebe o ID da empresa
2. Busca os usuários
3. Deleta do Auth usando service_role key
4. Deleta a empresa

Isso pode ser implementado no futuro se necessário.
