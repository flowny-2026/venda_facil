# 🔐 Como Acessar o Painel Admin

## 🎯 Situação Atual

Você está vendo a tela **"Acesso Negado"** porque está logado com o usuário errado.

---

## ✅ Solução em 3 Passos

### PASSO 1: Fazer Logout

Na tela "Acesso Negado", você verá:

```
┌─────────────────────────────────────────┐
│         🔒 Acesso Negado                │
│                                         │
│  Você está logado como:                 │
│  loja01@empresa.com                     │
│                                         │
│  [🚪 Sair e Fazer Login com Outro      │
│      Usuário]                           │
└─────────────────────────────────────────┘
```

**Clique no botão "Sair e Fazer Login com Outro Usuário"**

---

### PASSO 2: Resetar a Senha do Admin (se necessário)

Se você **NÃO** sabe a senha de `edicharlesbrito2009@hotmail.com`:

1. **Abra o Supabase Dashboard:**
   - URL: https://supabase.com/dashboard/project/cvmjjzhvdmpbxquxepue

2. **Vá em Authentication → Users**

3. **Procure por:** `edicharlesbrito2009@hotmail.com`

4. **Clique nos 3 pontinhos (⋮)** ao lado do usuário

5. **Escolha uma opção:**
   - **"Reset Password"** → Defina uma nova senha manualmente
   - **"Send Password Recovery"** → Envia email de recuperação

6. **Defina a nova senha** (exemplo: `Admin@2024`)

---

### PASSO 3: Fazer Login com o Usuário Correto

1. **Abra:** http://localhost:5174

2. **Faça login com:**
   - **Email:** `edicharlesbrito2009@hotmail.com`
   - **Senha:** [a senha que você definiu no PASSO 2]

3. **Deve funcionar!** ✅

---

## 📊 Tabela de Usuários e Acessos

| Email                           | Sistema        | Role        | Acesso                    |
| ------------------------------- | -------------- | ----------- | ------------------------- |
| edicharlesbrito2009@hotmail.com | **Painel Admin** | super_admin | ✅ Gerenciar empresas     |
| lojatem@empresa.com             | Painel Cliente | manager     | ✅ Gerenciar loja         |
| loja01@empresa.com              | Painel Cliente | manager     | ✅ Gerenciar loja         |
| bete@empresa.com                | Painel Cliente | seller      | ✅ Usar PDV               |
| maria@empresa.com               | Painel Cliente | seller      | ✅ Usar PDV               |

---

## 🌐 URLs dos Sistemas

### Painel Admin (Gerenciar Empresas)
- **URL:** http://localhost:5174
- **Login:** `edicharlesbrito2009@hotmail.com`
- **Funcionalidades:**
  - Criar novas empresas
  - Gerenciar clientes
  - Ver leads da landing page
  - Ver vendas de todas as empresas

### Painel Cliente (Gerenciar Loja)
- **URL:** http://localhost:5173
- **Login:** `lojatem@empresa.com`, `loja01@empresa.com`, etc.
- **Funcionalidades:**
  - Cadastrar produtos
  - Cadastrar vendedores
  - Usar PDV
  - Ver relatórios da empresa

---

## 🔍 Verificar no Console

Após fazer login, abra o Console (F12) e veja:

### ✅ Login Bem-Sucedido:
```
🔐 signIn chamado para: edicharlesbrito2009@hotmail.com
✅ signIn bem-sucedido!
👤 Usuário carregado, verificando admin... 5b6fc538-366c-4489-8b83-d26cc0777e44
🔍 checkAdminStatus chamado, user: 5b6fc538-366c-4489-8b83-d26cc0777e44
📊 Resultado da query:
   - data: {role: 'super_admin', active: true, company_id: '...'}
✅ É admin? true
🎉 ACESSO LIBERADO! Usuário é super_admin
```

### ❌ Login com Usuário Errado:
```
🔐 signIn chamado para: loja01@empresa.com
✅ signIn bem-sucedido!
👤 Usuário carregado, verificando admin... be13e102-956a-4d07-b444-719f4584f5e6
🔍 checkAdminStatus chamado, user: be13e102-956a-4d07-b444-719f4584f5e6
📊 Resultado da query:
   - data: null
✅ É admin? false
🚫 ACESSO NEGADO! Usuário não é super_admin
```

---

## 🆘 Ainda Não Funciona?

### Problema 1: "Não sei a senha do edicharlesbrito2009@hotmail.com"
**Solução:** Siga o PASSO 2 acima para resetar a senha.

### Problema 2: "O botão de logout não aparece"
**Solução:** Recarregue a página (F5) ou limpe o cache:
```javascript
// No Console (F12)
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Problema 3: "Quero usar outro email como admin"
**Solução:** Veja o arquivo `RESETAR_SENHA_ADMIN.sql` seção "ALTERNATIVA: Criar um novo super_admin"

---

## 💡 Resumo Visual

```
┌─────────────────────────────────────────┐
│  1. Está na tela "Acesso Negado"?       │
│     ↓                                   │
│  2. Clique em "Sair e Fazer Login"      │
│     ↓                                   │
│  3. Resetar senha (se necessário)       │
│     ↓                                   │
│  4. Login: edicharlesbrito2009@...      │
│     ↓                                   │
│  5. ✅ Acesso liberado!                 │
└─────────────────────────────────────────┘
```

---

## 🎉 Pronto!

Após seguir estes passos, você terá acesso completo ao painel administrativo.
