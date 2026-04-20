# 🔐 Guia Completo: Criar Login de Admin

## 📋 **Pré-requisitos**

✅ Supabase configurado (você já tem!)  
✅ Sistema rodando localmente  
✅ Acesso ao SQL Editor do Supabase  

---

## 🚀 **Método 1: Criar Admin de Teste (Recomendado)**

### **Passo 1: Iniciar o Sistema Cliente**

```bash
# No terminal, execute:
npm install
npm run dev
```

Aguarde até ver: `Local: http://localhost:5173`

### **Passo 2: Criar Conta de Admin**

1. Abra o navegador em: **http://localhost:5173**
2. Clique em **"Criar conta"**
3. Preencha:
   - **Email**: `admin@vendafacil.com`
   - **Senha**: `Admin@123456`
4. Clique em **"Cadastrar"**
5. **Verifique seu email** e confirme a conta

### **Passo 3: Promover para Admin no Supabase**

1. Acesse: **https://supabase.com/dashboard**
2. Selecione seu projeto
3. Vá em **SQL Editor** (menu lateral)
4. Cole e execute este comando:

```sql
INSERT INTO admin_users (user_id, role, permissions, active)
SELECT 
  id,
  'super_admin',
  '{"view_users": true, "manage_users": true, "view_sales": true, "manage_sales": true, "view_analytics": true, "system_config": true}'::jsonb,
  true
FROM auth.users 
WHERE email = 'admin@vendafacil.com'
ON CONFLICT (user_id) DO NOTHING;
```

5. Clique em **"Run"**
6. Aguarde a confirmação: `Success. No rows returned`

### **Passo 4: Iniciar o Sistema Admin**

```bash
# Em outro terminal, execute:
cd admin-system
npm install
npm run dev
```

Aguarde até ver: `Local: http://localhost:5180`

### **Passo 5: Fazer Login como Admin**

1. Abra o navegador em: **http://localhost:5180**
2. Faça login com:
   - **Email**: `admin@vendafacil.com`
   - **Senha**: `Admin@123456`
3. **Pronto!** Você está no painel admin! 🎉

---

## 🔧 **Método 2: Promover Sua Própria Conta**

Se você já tem uma conta criada:

### **Passo 1: Descobrir Seu Email**

Veja qual email você usou para criar sua conta.

### **Passo 2: Promover no Supabase**

1. Acesse o **SQL Editor** do Supabase
2. Execute (substitua o email):

```sql
INSERT INTO admin_users (user_id, role, permissions, active)
SELECT 
  id,
  'super_admin',
  '{"view_users": true, "manage_users": true, "view_sales": true, "manage_sales": true, "view_analytics": true, "system_config": true}'::jsonb,
  true
FROM auth.users 
WHERE email = 'SEU_EMAIL@exemplo.com'
ON CONFLICT (user_id) DO NOTHING;
```

3. **Faça logout e login novamente**
4. Acesse: **http://localhost:5180**

---

## ✅ **Verificar se Funcionou**

Execute no SQL Editor:

```sql
SELECT 
  u.email,
  a.role,
  a.permissions,
  a.active
FROM auth.users u
JOIN admin_users a ON u.id = a.user_id
WHERE u.email = 'admin@vendafacil.com';
```

Deve retornar:
- **email**: admin@vendafacil.com
- **role**: super_admin
- **active**: true

---

## 🏢 **Criar Empresa de Teste (Opcional)**

### **Passo 1: Criar Conta da Empresa**

1. Acesse: **http://localhost:5173**
2. Crie uma conta:
   - **Email**: `empresa@teste.com`
   - **Senha**: `Teste@123456`
3. Confirme o email

### **Passo 2: Cadastrar Empresa no Admin**

1. Acesse o painel admin: **http://localhost:5180**
2. Faça login como admin
3. Vá em **"Clientes"**
4. Clique em **"Nova Empresa"**
5. Preencha:
   - **Nome**: Empresa Teste
   - **Email**: empresa@teste.com
   - **Telefone**: (11) 99999-9999
   - **CNPJ**: 12.345.678/0001-90
   - **Tipo de Acesso**: Compartilhado
   - **Plano**: Professional
   - **Email do Usuário**: empresa@teste.com
   - **Senha**: Teste@123456
6. Clique em **"Cadastrar"**

Agora você tem:
- ✅ 1 Admin (você)
- ✅ 1 Empresa cliente de teste

---

## 📊 **Credenciais Criadas**

### **🔐 Admin (Painel Administrativo)**
- **URL**: http://localhost:5180
- **Email**: admin@vendafacil.com
- **Senha**: Admin@123456
- **Acesso**: Super Admin (controle total)

### **🏪 Empresa Teste (Sistema PDV)**
- **URL**: http://localhost:5173
- **Email**: empresa@teste.com
- **Senha**: Teste@123456
- **Acesso**: Cliente (sistema PDV)

---

## 🐛 **Troubleshooting**

### **Problema: "Email não confirmado"**
- Verifique sua caixa de entrada
- Procure por email do Supabase
- Clique no link de confirmação

### **Problema: "Usuário não é administrador"**
- Execute novamente o comando SQL de promoção
- Verifique se o email está correto
- Faça logout e login novamente

### **Problema: "Tabela admin_users não existe"**
- Execute o script `ADMIN_DATABASE.sql` no Supabase
- Aguarde a criação das tabelas
- Tente novamente

### **Problema: "Sistema não inicia"**
- Execute `npm install` primeiro
- Verifique se a porta está livre
- Veja os erros no terminal

---

## 🔍 **Comandos Úteis**

### **Ver todos os usuários:**
```sql
SELECT id, email, created_at, confirmed_at 
FROM auth.users 
ORDER BY created_at DESC;
```

### **Ver todos os admins:**
```sql
SELECT 
  u.email,
  a.role,
  a.active
FROM auth.users u
JOIN admin_users a ON u.id = a.user_id;
```

### **Ver todas as empresas:**
```sql
SELECT name, email, plan, active
FROM companies
ORDER BY created_at DESC;
```

### **Remover admin (se necessário):**
```sql
DELETE FROM admin_users 
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'admin@vendafacil.com'
);
```

---

## 🎯 **Próximos Passos**

Agora que você tem um admin:

1. ✅ Explore o painel administrativo
2. ✅ Cadastre empresas clientes
3. ✅ Configure planos e preços
4. ✅ Veja relatórios consolidados
5. ✅ Gerencie usuários

---

## 📚 **Arquivos Relacionados**

- `CRIAR_ADMIN_TESTE.sql` - Script SQL completo
- `ADMIN_DATABASE.sql` - Estrutura do banco admin
- `CONFIGURAR_ADMIN.md` - Configuração detalhada
- `LOGINS_DISPONIVEIS.md` - Informações sobre logins

---

## 💡 **Dica Pro**

Crie múltiplos admins com diferentes níveis:

```sql
-- Admin normal (sem gerenciar outros admins)
INSERT INTO admin_users (user_id, role, permissions, active)
SELECT id, 'admin',
  '{"view_users": true, "manage_users": false, "view_sales": true}'::jsonb,
  true
FROM auth.users WHERE email = 'admin2@vendafacil.com';

-- Suporte (apenas visualização)
INSERT INTO admin_users (user_id, role, permissions, active)
SELECT id, 'support',
  '{"view_users": true, "manage_users": false, "view_sales": false}'::jsonb,
  true
FROM auth.users WHERE email = 'suporte@vendafacil.com';
```

---

**🎉 Parabéns! Seu admin está criado e funcionando!**
