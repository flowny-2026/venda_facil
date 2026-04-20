# 🔐 Logins Disponíveis - VendaFácil

## ⚠️ **IMPORTANTE: Sistema Requer Configuração Local**

O sistema VendaFácil **NÃO possui logins pré-configurados** no GitHub Pages. Para usar o sistema, você precisa:

1. **Clonar o repositório**
2. **Configurar o Supabase**
3. **Executar localmente**
4. **Criar suas próprias contas**

---

## 🏗️ **Como Configurar e Criar Logins**

### **Passo 1: Clone o Repositório**
```bash
git clone https://github.com/flowny-2026/venda_facil.git
cd venda_facil
```

### **Passo 2: Configure o Supabase**

1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Execute os scripts SQL:
   - `PDV_DATABASE.sql` - Banco de dados do PDV
   - `ADMIN_DATABASE.sql` - Banco de dados Admin
   - `ARQUITETURA_COMERCIAL.sql` - Arquitetura multi-tenant

4. Configure o arquivo `.env`:
```env
VITE_SUPABASE_URL=sua_url_aqui
VITE_SUPABASE_ANON_KEY=sua_chave_aqui
```

### **Passo 3: Execute o Sistema**

**Sistema Cliente (PDV):**
```bash
npm install
npm run dev
# Acesse: http://localhost:5173
```

**Sistema Admin:**
```bash
cd admin-system
npm install
npm run dev
# Acesse: http://localhost:5180
```

---

## 👤 **Criando Logins**

### **1. Login Cliente (Sistema PDV)**

1. Acesse `http://localhost:5173`
2. Clique em "Criar conta"
3. Preencha:
   - **Email**: seu@email.com
   - **Senha**: mínimo 6 caracteres
4. Confirme o email (verifique sua caixa de entrada)
5. Faça login e comece a usar!

**Funcionalidades disponíveis:**
- ✅ PDV completo
- ✅ Gestão de produtos
- ✅ Cadastro de vendedores
- ✅ Formas de pagamento
- ✅ Relatórios em tempo real

---

### **2. Login Admin (Painel Administrativo)**

#### **Criar Super Admin:**

1. **Crie uma conta normal** no sistema cliente
2. **Confirme o email**
3. **Promova para admin** no SQL Editor do Supabase:

```sql
INSERT INTO admin_users (user_id, role, permissions, active)
SELECT 
  id,
  'super_admin',
  '{"view_users": true, "manage_users": true, "view_sales": true, "manage_sales": true, "view_analytics": true, "system_config": true}',
  true
FROM auth.users 
WHERE email = 'SEU_EMAIL@exemplo.com'
ON CONFLICT (user_id) DO NOTHING;
```

4. **Faça logout e login novamente**
5. **Acesse**: `http://localhost:5180`

**Funcionalidades disponíveis:**
- ✅ Dashboard consolidado
- ✅ Gestão de empresas
- ✅ Controle de usuários
- ✅ Relatórios multi-empresa
- ✅ Configuração de planos

---

## 🏢 **Sistema Multi-Tenant (B2B)**

### **Cadastrar Empresas Clientes:**

1. Acesse o painel admin
2. Vá em "Clientes"
3. Clique em "Nova Empresa"
4. Preencha:
   - Nome da empresa
   - Email
   - Telefone
   - CNPJ
   - Tipo de acesso (Compartilhado/Individual)
   - Plano (Starter/Professional/Enterprise)
   - **Login do usuário principal**
   - **Senha do usuário principal**

5. Sistema cria automaticamente:
   - ✅ Empresa no banco
   - ✅ Usuário principal
   - ✅ Isolamento de dados

### **Tipos de Acesso:**

**Compartilhado** (Ex: Shopping)
- 1 login por empresa
- Vendedores selecionados no PDV
- Ideal para: Lojas de shopping, supermercados

**Individual** (Ex: Concessionária)
- Cada vendedor tem login próprio
- Acesso individual ao sistema
- Ideal para: Lojas especializadas, concessionárias

---

## 📊 **Planos Disponíveis**

### **Starter - R$ 49,90/mês**
- Até 1.000 vendas/mês
- 1 usuário
- Suporte por email

### **Professional - R$ 99,90/mês**
- Até 5.000 vendas/mês
- 5 usuários
- Suporte prioritário
- Relatórios avançados

### **Enterprise - R$ 199,90/mês**
- Vendas ilimitadas
- Usuários ilimitados
- Suporte 24/7
- API personalizada

---

## 🌐 **GitHub Pages (Modo Demonstração)**

O site em **https://flowny-2026.github.io/venda_facil/** é apenas uma **landing page demonstrativa**.

**O que funciona:**
- ✅ Visualização do site
- ✅ Informações sobre o produto
- ✅ Modal de login (demonstração)

**O que NÃO funciona:**
- ❌ Login real (requer Supabase local)
- ❌ Cadastro de usuários
- ❌ Acesso ao sistema PDV
- ❌ Acesso ao painel admin

**Para usar o sistema completo, você DEVE executar localmente!**

---

## 🔑 **Resumo: Não Há Logins Prontos**

❌ **Não existe** login de teste pré-configurado  
❌ **Não existe** usuário demo  
❌ **Não existe** acesso direto pelo GitHub Pages  

✅ **Você precisa** clonar o repositório  
✅ **Você precisa** configurar o Supabase  
✅ **Você precisa** criar suas próprias contas  
✅ **Você precisa** executar localmente  

---

## 📚 **Documentação Adicional**

- `SUPABASE_SETUP.md` - Configuração completa do Supabase
- `CONFIGURAR_ADMIN.md` - Como configurar o painel admin
- `COMERCIALIZACAO.md` - Modelo de negócio B2B
- `README.md` - Documentação geral do projeto

---

## 💡 **Precisa de Ajuda?**

1. Leia a documentação completa
2. Verifique os arquivos `.md` no repositório
3. Execute os scripts SQL na ordem correta
4. Siga o passo a passo de configuração

**O sistema está pronto para uso, mas requer configuração inicial!**

---

## 🎯 **Próximos Passos**

1. ✅ Clone o repositório
2. ✅ Configure o Supabase
3. ✅ Execute os scripts SQL
4. ✅ Configure o `.env`
5. ✅ Execute `npm install && npm run dev`
6. ✅ Crie sua primeira conta
7. ✅ Promova para admin (se necessário)
8. ✅ Comece a usar!

**Boa sorte! 🚀**
