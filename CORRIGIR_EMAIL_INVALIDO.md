# 🔧 Corrigir Email Inválido "lojaabcd@empresa.com"

## 🚨 Problema

Ao tentar alterar a senha, aparece o erro:
```
Erro ao enviar email: Email address "lojaabcd@empresa.com" is invalid
```

## 🔍 Causa

O usuário logado tem um **email inválido** cadastrado no Supabase Auth. Esse email não existe e não pode receber emails de redefinição de senha.

---

## ✅ Solução 1: Corrigir Email no Supabase Dashboard

### Passo a Passo:

1. **Abra o Supabase Dashboard**
   - URL: https://supabase.com/dashboard/project/cvmjjzhvdmpbxquxepue

2. **Vá em Authentication → Users**
   - Menu lateral esquerdo
   - Clique em "Authentication"
   - Clique em "Users"

3. **Encontre o usuário com email inválido**
   - Procure por "lojaabcd@empresa.com"
   - Ou procure por emails que começam com "loja"

4. **Edite o usuário**
   - Clique nos 3 pontinhos (...) ao lado do usuário
   - Clique em "Edit User"

5. **Altere o email para um válido**
   - Exemplo: `gerente@lojatem.com`
   - Ou use seu email real: `edicharlesbrito2009@hotmail.com`

6. **Salve as alterações**
   - Clique em "Save"

7. **Faça logout e login novamente**
   - Use o novo email para fazer login

---

## ✅ Solução 2: Deletar e Recriar Usuário

Se preferir começar do zero:

### 1. Deletar Usuário Inválido

**No Supabase Dashboard:**
1. Authentication → Users
2. Encontre "lojaabcd@empresa.com"
3. Clique em "..." → Delete User
4. Confirme a exclusão

### 2. Criar Novo Usuário

**No Painel Admin:**
1. Vá em "Clientes"
2. Encontre a empresa "lojatem"
3. Clique em "Ver detalhes"
4. Se não houver usuários, crie um novo:
   - Vá em "Vendedores" (no painel cliente)
   - Crie um vendedor
   - Clique em "Criar Login"
   - Use um email VÁLIDO (ex: gerente@lojatem.com)

---

## 🔍 Verificar Qual Usuário Está Logado

Execute o script `VERIFICAR_EMAILS_USUARIOS.sql` no Supabase SQL Editor para ver:
- Todos os usuários cadastrados
- Qual empresa cada usuário pertence
- Quais emails são válidos/inválidos

---

## 📧 Emails Válidos vs Inválidos

### ❌ Emails Inválidos (NÃO funcionam)
- `lojaabcd@empresa.com` ← Este é o problema!
- `teste@teste.com`
- `admin@admin.com`
- Qualquer email que não existe de verdade

### ✅ Emails Válidos (funcionam)
- `edicharlesbrito2009@hotmail.com` ← Seu email real
- `maria@empresa.com` ← Se for um email real
- `bete@empresa.com` ← Se for um email real
- Qualquer email que você tenha acesso

---

## 🎯 Recomendação

**Use emails reais** para todos os usuários do sistema:

| Usuário | Email Recomendado | Motivo |
|---------|-------------------|--------|
| **Admin** | edicharlesbrito2009@hotmail.com | Seu email real |
| **Gerente Lojatem** | gerente@lojatem.com | Email da empresa |
| **Maria** | maria@lojatem.com | Email da vendedora |
| **Bete** | bete@lojatem.com | Email da vendedora |

---

## 🧪 Testar Após Correção

1. **Faça logout** do sistema
2. **Faça login** com o email corrigido
3. **Vá em Configurações → Segurança**
4. **Clique em "Alterar Senha"**
5. **Confirme o email**
6. **Verifique sua caixa de entrada** (e spam)
7. **Clique no link** do email
8. **Defina nova senha**

---

## 💡 Prevenção

Para evitar esse problema no futuro:

1. ✅ **Sempre use emails reais** ao criar usuários
2. ✅ **Teste o email** antes de criar o usuário
3. ✅ **Documente** os emails de cada usuário
4. ✅ **Use domínio da empresa** quando possível

---

## 📞 Suporte

Se após seguir esses passos o problema persistir:
1. Execute `VERIFICAR_EMAILS_USUARIOS.sql`
2. Copie o resultado
3. Envie para análise

---

## 🎯 Resumo Rápido

**Problema:** Email "lojaabcd@empresa.com" é inválido  
**Solução:** Editar no Supabase Dashboard → Authentication → Users  
**Novo Email:** Use um email real que você tenha acesso  
**Teste:** Logout → Login → Alterar Senha → Verificar email
