# 🔧 Correção: Tela Vazia no Login de Vendedor

## 📋 Problema Identificado

Quando um vendedor fazia login no sistema cliente, a tela ficava vazia (sem conteúdo, sem logo).

### Causas Identificadas:

1. ❌ **Dashboard não filtrava vendas por vendedor**
   - Sistema buscava TODAS as vendas, não apenas do vendedor logado
   - Vendedor sem vendas = tela vazia

2. ❌ **Hook useUserRole não tinha fallback**
   - Se a view `v_company_users_with_seller` falhasse, não carregava permissões
   - Sem permissões = componentes não renderizavam

3. ❌ **Faltava feedback visual**
   - Não havia indicação de que era um vendedor logado
   - Não mostrava informações de debug

---

## ✅ Correções Aplicadas

### 1. **Dashboard.tsx** - Filtro por Vendedor

**Antes:**
```typescript
// Buscava TODAS as vendas
const { data: salesData } = await supabase
  .from('sales')
  .select('*')
  .order('created_at', { ascending: false });
```

**Depois:**
```typescript
// Construir query base
let query = supabase.from('sales').select('*');

// Se for vendedor, filtrar apenas suas vendas
if (isSeller && permissions?.sellerId) {
  console.log('👤 Vendedor detectado! Filtrando vendas do seller_id:', permissions.sellerId);
  query = query.eq('seller_id', permissions.sellerId);
}

// Ordenar por data
query = query.order('created_at', { ascending: false });
```

### 2. **useUserRole.ts** - Fallback Manual

**Antes:**
```typescript
// Falhava se view não existisse
const { data, error } = await supabase
  .from('v_company_users_with_seller')
  .select('*')
  .eq('user_id', user!.id)
  .single();

if (error) throw error;
```

**Depois:**
```typescript
// Tenta view primeiro, se falhar busca manualmente
const { data: viewData, error: viewError } = await supabase
  .from('v_company_users_with_seller')
  .select('*')
  .eq('user_id', user!.id)
  .maybeSingle();

if (viewData && !viewError) {
  // View funcionou
  setPermissions(viewData);
  return;
}

// Se view não funcionou, buscar dados manualmente
const { data: companyUserData } = await supabase
  .from('company_users')
  .select(`
    *,
    companies:company_id (id, name),
    sellers:seller_id (id, name)
  `)
  .eq('user_id', user!.id)
  .maybeSingle();
```

### 3. **Dashboard.tsx** - Feedback Visual

Adicionado banner de debug para vendedores:

```typescript
{isSeller && (
  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
    <h3 className="text-sm font-semibold text-blue-400 mb-2">🔍 Modo Vendedor Ativo</h3>
    <div className="text-xs text-slate-300 space-y-1">
      <p>• Vendedor: {permissions?.sellerName}</p>
      <p>• Seller ID: {permissions?.sellerId}</p>
      <p>• Empresa: {permissions?.companyName}</p>
      <p>• Vendas exibidas: {orders.length}</p>
      <p>• Pode ver lucros: {permissions?.canViewCompanyProfits ? 'Sim' : 'Não'}</p>
    </div>
  </div>
)}
```

### 4. **Dashboard.tsx** - Títulos Personalizados

```typescript
<h1 className="text-3xl font-bold text-slate-100">
  {isSeller ? '📊 Minhas Vendas' : '📊 Painel de Vendas'}
</h1>

<KpiCard
  title={isSeller ? "Minhas Vendas" : "Receita Total"}
  value={totalRevenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
  hint={`${totalOrders} ${isSeller ? 'vendas realizadas' : 'pedidos no período'}`}
/>
```

---

## 🧪 Como Testar

### 1. **Acessar o Sistema Cliente**

```
http://localhost:5174/
```

### 2. **Fazer Login como Vendedor**

Use as credenciais do vendedor que você criou:
- Email: `loja1@empresa.com` (ou outro que você criou)
- Senha: (a senha que você definiu)

### 3. **Verificar o que deve aparecer:**

✅ **Banner azul no topo:**
```
🔍 Modo Vendedor Ativo
• Vendedor: [Nome do Vendedor]
• Seller ID: [UUID do vendedor]
• Empresa: [Nome da Empresa]
• Vendas exibidas: [Número de vendas]
• Pode ver lucros: Não
```

✅ **Título personalizado:**
```
📊 Minhas Vendas
```

✅ **Informações do vendedor:**
```
🔗 Conectado ao Supabase • loja1@empresa.com • Vendedor: João Silva • 5 vendas
```

✅ **KPIs personalizados:**
- "Minhas Vendas" (em vez de "Receita Total")
- "Minha Conversão" (em vez de "Taxa de Conversão")

✅ **Apenas vendas do vendedor:**
- Tabela mostra APENAS vendas onde `seller_id` = ID do vendedor logado

---

## 🔍 Debug no Console

Abra o console do navegador (F12) e verifique os logs:

```
🔄 Iniciando carregamento de dados...
📊 useSupabase: true user: true isSeller: true
🔗 Carregando dados do Supabase...
👤 Vendedor detectado! Filtrando vendas do seller_id: [UUID]
✅ Vendas carregadas do Supabase: 5
🏁 Carregamento finalizado
```

---

## 📊 Estrutura de Dados Necessária

Para o sistema funcionar corretamente, certifique-se de que:

### 1. **Tabela `company_users`** tem as colunas:
```sql
- role: 'owner' | 'manager' | 'seller'
- seller_id: UUID (referência a sellers.id)
- can_view_company_profits: BOOLEAN
- can_access_pdv: BOOLEAN
- can_view_reports: BOOLEAN
- can_manage_products: BOOLEAN
- can_manage_sellers: BOOLEAN
```

### 2. **Tabela `sales`** tem a coluna:
```sql
- seller_id: UUID (referência a sellers.id)
```

### 3. **View `v_company_users_with_seller`** existe:
```sql
CREATE OR REPLACE VIEW v_company_users_with_seller AS
SELECT 
    cu.*,
    s.name as seller_name,
    s.commission_percentage,
    c.name as company_name,
    c.access_type
FROM company_users cu
LEFT JOIN sellers s ON cu.seller_id = s.id
LEFT JOIN companies c ON cu.company_id = c.id;
```

---

## 🚨 Possíveis Problemas

### Problema 1: "Vendas exibidas: 0"

**Causa:** Vendedor não tem vendas cadastradas com seu `seller_id`

**Solução:** 
1. Faça logout do vendedor
2. Faça login como gerente
3. Vá em "PDV" ou "Nova Venda"
4. Registre uma venda selecionando o vendedor
5. Faça logout e login novamente como vendedor

### Problema 2: "Seller ID: Não definido"

**Causa:** Usuário não está vinculado a um vendedor em `company_users`

**Solução:**
```sql
-- Verificar vinculação
SELECT user_id, seller_id, role 
FROM company_users 
WHERE user_id = '[UUID do usuário]';

-- Se seller_id estiver NULL, vincular manualmente
UPDATE company_users 
SET seller_id = '[UUID do vendedor]'
WHERE user_id = '[UUID do usuário]';
```

### Problema 3: Tela ainda vazia

**Causa:** Permissões não estão carregando

**Solução:**
1. Abra o console (F12)
2. Procure por erros em vermelho
3. Verifique se a tabela `company_users` tem os dados corretos:

```sql
SELECT * FROM company_users WHERE user_id = '[UUID do usuário]';
```

---

## 📝 Próximos Passos

Após confirmar que está funcionando:

1. ✅ Remover o banner de debug azul (opcional)
2. ✅ Testar com múltiplos vendedores
3. ✅ Testar registro de novas vendas
4. ✅ Verificar filtros e relatórios
5. ✅ Preparar para deploy

---

## 🎯 Resultado Esperado

Quando um vendedor faz login:

1. ✅ Vê o logo da empresa
2. ✅ Vê seu nome no topo
3. ✅ Vê apenas suas vendas
4. ✅ Vê seus KPIs personalizados
5. ✅ Pode registrar novas vendas
6. ✅ NÃO vê lucros da empresa
7. ✅ NÃO vê vendas de outros vendedores

---

**Status:** ✅ Correções aplicadas e servidor rodando em http://localhost:5174/

**Próximo passo:** Testar login de vendedor e verificar se tudo está funcionando!
