# 🛡️ Configuração do Painel Admin

## 📋 Passo a Passo para Ativar o Admin

### **1. Execute o Script SQL**
1. Vá para o **SQL Editor** do Supabase
2. Cole e execute o conteúdo do arquivo `ADMIN_DATABASE.sql`
3. Aguarde a confirmação de sucesso

### **2. Crie Sua Conta de Admin**
1. Acesse seu sistema: `http://localhost:5175/`
2. **Crie uma conta normal** com seu email
3. Confirme o email (verifique sua caixa de entrada)
4. Faça login normalmente

### **3. Promova Sua Conta para Super Admin**
1. Volte para o **SQL Editor** do Supabase
2. Execute este comando (substitua pelo seu email):

```sql
INSERT INTO admin_users (user_id, role, permissions, active)
SELECT 
  id,
  'super_admin',
  '{"view_users": true, "manage_users": true, "view_sales": true, "manage_sales": true, "view_analytics": true, "system_config": true}',
  true
FROM auth.users 
WHERE email = 'SEU_EMAIL_AQUI@exemplo.com'
ON CONFLICT (user_id) DO NOTHING;
```

### **4. Acesse o Painel Admin**
1. Faça logout e login novamente
2. Acesse: `http://localhost:5175/admin`
3. Ou clique no menu **"Admin"** que aparecerá na navegação

## 🎯 **Funcionalidades do Painel Admin**

### **Dashboard**
- 📊 **Estatísticas Gerais**: Total de usuários, receita, vendas
- 📈 **Métricas Mensais**: Novos usuários e vendas dos últimos 30 dias
- 🎯 **Status das Vendas**: Pagas, pendentes, canceladas
- 💰 **Ticket Médio**: Valor médio por venda

### **Usuários**
- 👥 **Lista Completa**: Todos os usuários cadastrados
- 🏢 **Informações da Empresa**: Nome da empresa de cada usuário
- 📅 **Datas Importantes**: Cadastro, último acesso
- 💼 **Performance**: Total de vendas e receita por usuário

### **Vendas** (Em Desenvolvimento)
- 📊 Relatórios detalhados
- 📈 Gráficos avançados
- 🔍 Filtros personalizados

## 🔐 **Níveis de Acesso**

### **Super Admin**
- ✅ Ver todos os dados
- ✅ Gerenciar usuários
- ✅ Gerenciar outros admins
- ✅ Configurações do sistema

### **Admin**
- ✅ Ver dados dos usuários
- ✅ Ver relatórios
- ❌ Gerenciar outros admins

### **Support**
- ✅ Ver dados básicos
- ❌ Gerenciar usuários
- ❌ Ver dados financeiros

## 🚀 **Adicionando Outros Admins**

Para adicionar outros administradores:

```sql
-- Substitua o email e o nível de acesso
INSERT INTO admin_users (user_id, role, permissions, active)
SELECT 
  id,
  'admin', -- ou 'support'
  '{"view_users": true, "manage_users": false, "view_sales": true, "manage_sales": false, "view_analytics": true}',
  true
FROM auth.users 
WHERE email = 'outro_admin@exemplo.com'
ON CONFLICT (user_id) DO NOTHING;
```

## 🛡️ **Segurança**

- ✅ **Row Level Security**: Apenas admins veem dados administrativos
- ✅ **Verificação de Permissões**: Cada ação é validada
- ✅ **Logs de Auditoria**: Todas as ações são registradas
- ✅ **Isolamento de Dados**: Usuários normais nunca veem dados admin

## 🎯 **URLs Importantes**

- **Sistema Normal**: `http://localhost:5175/`
- **Painel Admin**: `http://localhost:5175/admin`
- **Supabase Dashboard**: `https://supabase.com/dashboard`

---

**🎉 Painel Admin Configurado com Sucesso!**

Agora você tem controle total sobre todos os usuários e vendas do sistema!