# 🚗 Modo Individual - Vendedores com Login Próprio

## 📋 Visão Geral

Este sistema permite que vendedores tenham login próprio com acesso limitado ao painel.

---

## 👥 Tipos de Usuários

### 1️⃣ **OWNER/MANAGER** (Gerente/Dono)
✅ Acesso total ao sistema  
✅ Vê todas as vendas  
✅ Vê todos os lucros  
✅ Cria login/senha para vendedores  
✅ Gerencia produtos, categorias, etc  
✅ Vê relatórios completos  

### 2️⃣ **SELLER** (Vendedor)
✅ Acesso limitado ao painel  
✅ Vê **apenas suas vendas**  
✅ Vê **suas comissões**  
✅ Vê **seus clientes** (que compraram dele)  
✅ Registra novas vendas  
❌ **NÃO vê** lucros da empresa  
❌ **NÃO vê** vendas de outros vendedores  
❌ **NÃO vê** clientes de outros vendedores  

---

## 🔧 Implementação

### **PASSO 1: Executar Script SQL**

1. Acesse o Supabase
2. SQL Editor → New Query
3. Cole o conteúdo de: `IMPLEMENTAR_MODO_INDIVIDUAL.sql`
4. Execute (RUN)

**O que será criado:**
- ✅ Coluna `role` em `company_users` (owner, manager, seller)
- ✅ Coluna `seller_id` para vincular usuário ao vendedor
- ✅ Coluna `can_view_company_profits` (false para vendedores)
- ✅ Funções `is_seller()` e `get_user_seller_id()`
- ✅ Políticas RLS para proteger dados
- ✅ View `v_company_users_with_seller`

---

## 📊 Estrutura de Dados

### **company_users**
```sql
- id: UUID
- user_id: UUID (auth.users)
- company_id: UUID
- role: 'owner' | 'manager' | 'seller'
- seller_id: UUID (referência a sellers)
- can_view_company_profits: boolean
- can_access_pdv: boolean
- can_view_reports: boolean
- can_manage_products: boolean
- can_manage_sellers: boolean
```

---

## 🎯 Como Funciona

### **1. Gerente Cria Login para Vendedor**

```typescript
// No painel do gerente
async function createSellerLogin(sellerId: string, email: string, password: string) {
  // 1. Criar usuário no Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true
  });
  
  // 2. Vincular usuário ao vendedor
  const { error: linkError } = await supabase
    .from('company_users')
    .insert({
      user_id: authData.user.id,
      company_id: currentCompanyId,
      seller_id: sellerId,
      role: 'seller',
      can_view_company_profits: false,
      can_access_pdv: true,
      can_view_reports: false,
      can_manage_products: false,
      can_manage_sellers: false
    });
}
```

### **2. Vendedor Faz Login**

```typescript
// Vendedor faz login normalmente
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'vendedor@email.com',
  password: 'senha123'
});

// Sistema detecta que é vendedor
const { data: userData } = await supabase
  .from('company_users')
  .select('role, seller_id, can_view_company_profits')
  .eq('user_id', data.user.id)
  .single();

if (userData.role === 'seller') {
  // Mostrar dashboard limitado
  // Filtrar vendas automaticamente
}
```

### **3. Dashboard Adaptado**

```typescript
// Para vendedores, filtrar automaticamente
const { data: sales } = await supabase
  .from('sales')
  .select('*')
  // RLS já filtra automaticamente!
  // Vendedor vê apenas suas vendas
  .order('created_at', { ascending: false });

// Para gerentes, ver tudo
const { data: allSales } = await supabase
  .from('sales')
  .select('*')
  // RLS permite ver tudo
  .order('created_at', { ascending: false });
```

---

## 🔒 Segurança (RLS)

### **Políticas Implementadas:**

1. **Vendedores veem apenas suas vendas**
   ```sql
   seller_id = get_user_seller_id(auth.uid())
   ```

2. **Vendedores veem apenas seus clientes**
   ```sql
   -- Clientes que compraram do vendedor
   id IN (SELECT customer_id FROM sales WHERE seller_id = ...)
   ```

3. **Gerentes veem tudo**
   ```sql
   role IN ('owner', 'manager')
   ```

---

## 📱 Interface do Usuário

### **Dashboard do Vendedor:**

```
┌─────────────────────────────────────┐
│  🏪 Painel do Vendedor              │
├─────────────────────────────────────┤
│  📊 Minhas Vendas: R$ 15.000        │
│  💰 Minhas Comissões: R$ 1.500      │
│  👥 Meus Clientes: 25               │
├─────────────────────────────────────┤
│  Menu:                              │
│  ✅ Minhas Vendas                   │
│  ✅ Registrar Venda                 │
│  ✅ Meus Clientes                   │
│  ✅ Minhas Comissões                │
│  ❌ Lucros da Empresa (oculto)      │
│  ❌ Todas as Vendas (oculto)        │
└─────────────────────────────────────┘
```

### **Dashboard do Gerente:**

```
┌─────────────────────────────────────┐
│  🏢 Painel do Gerente               │
├─────────────────────────────────────┤
│  📊 Vendas Totais: R$ 150.000       │
│  💰 Lucro Total: R$ 45.000          │
│  👥 Total Clientes: 250             │
├─────────────────────────────────────┤
│  Menu:                              │
│  ✅ Dashboard Completo              │
│  ✅ Todas as Vendas                 │
│  ✅ Todos os Clientes               │
│  ✅ Lucros e Relatórios             │
│  ✅ Gerenciar Vendedores            │
│  ✅ Criar Login para Vendedor       │
└─────────────────────────────────────┘
```

---

## 🧪 Testes

### **Teste 1: Criar Vendedor com Login**
1. Login como gerente
2. Ir em "Vendedores"
3. Criar novo vendedor
4. Clicar em "Criar Login"
5. Definir email e senha
6. Vendedor recebe credenciais

### **Teste 2: Login como Vendedor**
1. Fazer logout
2. Login com credenciais do vendedor
3. Verificar que vê apenas suas vendas
4. Tentar acessar lucros → deve estar oculto
5. Registrar nova venda → deve funcionar

### **Teste 3: Permissões**
1. Vendedor não deve ver vendas de outros
2. Vendedor não deve ver lucros da empresa
3. Vendedor deve ver suas comissões
4. Gerente deve ver tudo

---

## 📝 Próximos Passos

Após executar o script SQL, você precisará:

1. ✅ Criar tela de gerenciamento de vendedores
2. ✅ Adicionar botão "Criar Login" para vendedor
3. ✅ Adaptar dashboard para detectar role do usuário
4. ✅ Ocultar informações sensíveis para vendedores
5. ✅ Criar página "Minhas Vendas" para vendedores
6. ✅ Criar página "Minhas Comissões" para vendedores

---

## ❓ Dúvidas Frequentes

**Q: Vendedor pode ver vendas de outros?**  
A: Não. As políticas RLS garantem que cada vendedor vê apenas suas vendas.

**Q: Vendedor pode alterar suas comissões?**  
A: Não. Apenas gerentes podem alterar comissões.

**Q: Vendedor pode cadastrar produtos?**  
A: Depende da permissão `can_manage_products`. Por padrão, não.

**Q: Como resetar senha de vendedor?**  
A: Gerente pode resetar via painel ou vendedor usa "Esqueci minha senha".

---

**Pronto para implementar!** 🚀
