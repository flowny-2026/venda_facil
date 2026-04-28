# 📊 Dashboard de Performance de Vendedores

## 🎯 Objetivo

Criar uma seção na página de **Vendedores** que mostra métricas em tempo real de cada vendedor para empresas com **acesso compartilhado** (varejo).

---

## ✨ Funcionalidades Implementadas

### 📈 Métricas por Vendedor

Cada vendedor tem um card mostrando:

#### **Hoje (Dia Atual)**
- 🛒 **Vendas do Dia**: Quantidade de vendas realizadas hoje
- 📦 **Peças Vendidas**: Total de itens vendidos hoje
- 💰 **Ticket Médio**: Valor médio por venda hoje

#### **Este Mês**
- 🛒 **Vendas do Mês**: Quantidade de vendas no mês atual
- 📦 **Peças Vendidas**: Total de itens vendidos no mês
- 💰 **Ticket Médio**: Valor médio por venda no mês

---

## 🎨 Interface

### Card de Performance

```
┌─────────────────────────────────────┐
│  João Silva              📈         │
│  Comissão: 5%                       │
├─────────────────────────────────────┤
│  📅 HOJE                            │
│  ┌─────┐ ┌─────┐ ┌─────┐           │
│  │  5  │ │ 12  │ │R$150│           │
│  │Venda│ │Peças│ │Ticket│          │
│  └─────┘ └─────┘ └─────┘           │
├─────────────────────────────────────┤
│  📈 ESTE MÊS                        │
│  ┌─────┐ ┌─────┐ ┌─────┐           │
│  │ 45  │ │ 120 │ │R$180│           │
│  │Venda│ │Peças│ │Ticket│          │
│  └─────┘ └─────┘ └─────┘           │
└─────────────────────────────────────┘
```

---

## 🔧 Estrutura Técnica

### Arquivos Criados/Modificados

1. **`cliente-system/src/components/SellerPerformanceCard.tsx`** ✅
   - Componente visual do card de performance
   - Mostra métricas do dia e do mês
   - Design responsivo e moderno

2. **`cliente-system/src/pages/Vendedores.tsx`** ✅
   - Adicionada função `loadSellersStats()`
   - Busca vendas do dia e do mês de cada vendedor
   - Calcula métricas automaticamente
   - Mostra dashboard apenas para acesso compartilhado

---

## 📊 Cálculo das Métricas

### Vendas do Dia
```typescript
const today = new Date();
today.setHours(0, 0, 0, 0);

const { data: todaySales } = await supabase
  .from('sales')
  .select('total_amount, items_count')
  .eq('seller_id', seller.id)
  .gte('created_at', today.toISOString());

const todayCount = todaySales?.length || 0;
```

### Peças Vendidas
```typescript
const todayItems = todaySales?.reduce(
  (sum, sale) => sum + (sale.items_count || 1), 
  0
) || 0;
```

### Ticket Médio
```typescript
const todayTotal = todaySales?.reduce(
  (sum, sale) => sum + (sale.total_amount || 0), 
  0
) || 0;

const todayAvg = todayCount > 0 ? todayTotal / todayCount : 0;
```

---

## 🎯 Quando Aparece

### ✅ Aparece quando:
- Empresa tem **acesso compartilhado** (`access_type = 'shared'`)
- Há vendedores cadastrados
- Gerente está logado

### ❌ NÃO aparece quando:
- Empresa tem **acesso individual** (`access_type = 'individual'`)
- Não há vendedores cadastrados
- Vendedor está logado (apenas gerentes veem)

---

## 🧪 Como Testar

### 1. **Acessar o Sistema**
```
http://localhost:5174/
```

### 2. **Fazer Login como Gerente**
- Use credenciais de uma empresa com acesso compartilhado

### 3. **Ir para Vendedores**
- Menu lateral → "Vendedores"

### 4. **Verificar Dashboard**
Você deve ver:
- ✅ Seção "Performance dos Vendedores"
- ✅ Cards com métricas de cada vendedor
- ✅ Botão "Atualizar" para recarregar dados
- ✅ Métricas do dia e do mês

### 5. **Testar com Vendas**

Para ver dados reais:

1. Vá em "PDV" ou "Nova Venda"
2. Registre uma venda selecionando um vendedor
3. Volte para "Vendedores"
4. Clique em "Atualizar"
5. Veja as métricas atualizadas!

---

## 📋 Estrutura de Dados Necessária

### Tabela `sales` deve ter:
```sql
- id: UUID
- seller_id: UUID (referência a sellers.id)
- total_amount: DECIMAL
- items_count: INTEGER (quantidade de peças)
- created_at: TIMESTAMP
- status: TEXT
```

### Tabela `sellers` deve ter:
```sql
- id: UUID
- name: TEXT
- commission_percentage: DECIMAL
- active: BOOLEAN
- company_id: UUID
```

### Tabela `companies` deve ter:
```sql
- id: UUID
- name: TEXT
- access_type: TEXT ('shared' ou 'individual')
```

---

## 🎨 Cores e Ícones

### Ícones Usados:
- 🛒 `ShoppingCart` - Vendas
- 📦 `Package` - Peças
- 💰 `DollarSign` - Ticket Médio
- 📅 `Calendar` - Hoje
- 📈 `TrendingUp` - Este Mês
- 🔄 `RefreshCw` - Atualizar

### Cores:
- **Azul** (`blue-400`) - Vendas
- **Roxo** (`purple-400`) - Peças
- **Verde** (`green-400`) - Ticket Médio
- **Cinza** (`slate-400`) - Labels

---

## 🚀 Funcionalidades Futuras (Opcional)

### Possíveis Melhorias:

1. **Ranking de Vendedores**
   - Ordenar por performance
   - Destacar top 3

2. **Gráficos de Evolução**
   - Linha do tempo de vendas
   - Comparação entre vendedores

3. **Metas e Progresso**
   - Barra de progresso da meta
   - Percentual atingido

4. **Filtros de Período**
   - Última semana
   - Últimos 30 dias
   - Período customizado

5. **Exportar Relatório**
   - PDF com métricas
   - Excel com dados detalhados

6. **Notificações**
   - Alerta quando vendedor atinge meta
   - Notificação de baixa performance

---

## 📱 Responsividade

O dashboard é totalmente responsivo:

- **Desktop**: 3 cards por linha
- **Tablet**: 2 cards por linha
- **Mobile**: 1 card por linha

---

## 🔄 Atualização de Dados

### Automática:
- Dados carregam ao entrar na página
- Recarregam quando vendedores mudam

### Manual:
- Botão "Atualizar" no topo do dashboard
- Recarrega métricas em tempo real

---

## 🐛 Troubleshooting

### Problema: "Nenhuma venda registrada"

**Causa:** Não há vendas no banco de dados

**Solução:**
1. Registre vendas pelo PDV
2. Certifique-se de selecionar o vendedor
3. Clique em "Atualizar" no dashboard

### Problema: Dashboard não aparece

**Causa:** Empresa tem acesso individual

**Solução:**
- Dashboard só aparece para empresas com `access_type = 'shared'`
- Verifique o tipo de acesso da empresa no admin

### Problema: Métricas zeradas

**Causa:** Vendas não têm `seller_id` vinculado

**Solução:**
```sql
-- Verificar vendas sem vendedor
SELECT * FROM sales WHERE seller_id IS NULL;

-- Vincular vendas a um vendedor
UPDATE sales 
SET seller_id = '[UUID do vendedor]'
WHERE seller_id IS NULL;
```

---

## ✅ Checklist de Implementação

- ✅ Componente `SellerPerformanceCard` criado
- ✅ Função `loadSellersStats()` implementada
- ✅ Dashboard adicionado na página Vendedores
- ✅ Filtro por acesso compartilhado
- ✅ Cálculo de métricas do dia
- ✅ Cálculo de métricas do mês
- ✅ Botão de atualizar
- ✅ Loading states
- ✅ Design responsivo
- ✅ Documentação completa

---

## 🎉 Resultado Final

Agora os gerentes de empresas com acesso compartilhado podem:

1. ✅ Ver performance de cada vendedor em tempo real
2. ✅ Comparar vendas do dia vs mês
3. ✅ Acompanhar ticket médio
4. ✅ Monitorar quantidade de peças vendidas
5. ✅ Identificar vendedores mais produtivos
6. ✅ Tomar decisões baseadas em dados

---

**Status:** ✅ Implementado e funcionando!

**Servidor:** http://localhost:5174/

**Próximo passo:** Testar com dados reais e ajustar conforme necessário!
