# 📊 RESUMO EXECUTIVO - ESTRUTURA DO BANCO DE DADOS SUPABASE

**Projeto:** VendaFácil  
**URL:** https://cvmjjzhvdmpbxquxepue.supabase.co  
**Projeto Supabase:** responsabilidade_liz

---

## 🎯 TABELAS PRINCIPAIS - VISÃO RÁPIDA

### Tabela: `companies` (Empresas)
```
Colunas Principais:
├── id (UUID) - PK
├── name (TEXT) - Nome da empresa
├── email (TEXT) - Email
├── phone (TEXT) - Telefone
├── document (TEXT) - CNPJ/CPF
├── address (TEXT) - Endereço
├── plan (ENUM) - starter | professional | enterprise
├── access_type (ENUM) - shared | individual
├── max_users (INTEGER) - Limite de usuários
├── monthly_fee (DECIMAL) - Valor mensal
├── status (ENUM) - active | suspended | canceled
└── created_at (TIMESTAMP)

Relacionamentos:
├── 1:N → company_users
├── 1:N → products
├── 1:N → sellers
├── 1:N → sales
├── 1:N → payment_methods
└── 1:N → product_categories

RLS: ✅ Ativo
```

---

### Tabela: `company_users` (Usuários da Empresa)
```
Colunas Principais:
├── id (UUID) - PK
├── user_id (UUID) - FK → auth.users
├── company_id (UUID) - FK → companies
├── role (ENUM) - owner | manager | seller
├── seller_id (UUID) - FK → sellers (opcional)
├── active (BOOLEAN)
├── can_view_company_profits (BOOLEAN)
├── can_access_pdv (BOOLEAN)
├── can_view_reports (BOOLEAN)
├── can_manage_products (BOOLEAN)
├── can_manage_sellers (BOOLEAN)
└── created_at (TIMESTAMP)

Relacionamentos:
├── N:1 → auth.users
├── N:1 → companies
└── N:1 → sellers

RLS: ✅ Ativo
Índice Único: (user_id, company_id)
```

---

### Tabela: `sales` (Vendas)
```
Colunas Principais:
├── id (UUID) - PK
├── receipt_number (TEXT) - Número do cupom
├── user_id (UUID) - FK → auth.users
├── company_id (UUID) - FK → companies
├── seller_id (UUID) - FK → sellers
├── payment_method_id (UUID) - FK → payment_methods
├── subtotal (DECIMAL)
├── discount_amount (DECIMAL)
├── total_amount (DECIMAL)
├── payment_received (DECIMAL)
├── change_amount (DECIMAL)
├── status (ENUM) - paid | pending | canceled
└── created_at (TIMESTAMP)

Relacionamentos:
├── N:1 → auth.users
├── N:1 → companies
├── N:1 → sellers
├── N:1 → payment_methods
└── 1:N → sale_items

RLS: ✅ Ativo
Índices: company_id, user_id, seller_id, created_at, status
```

---

### Tabela: `sale_items` (Itens da Venda)
```
Colunas Principais:
├── id (UUID) - PK
├── sale_id (UUID) - FK → sales (CASCADE)
├── product_id (UUID) - FK → products
├── product_name (TEXT) - Snapshot do nome
├── quantity (INTEGER)
├── unit_price (DECIMAL)
├── total_price (DECIMAL)
├── company_id (UUID) - FK → companies
└── created_at (TIMESTAMP)

Relacionamentos:
├── N:1 → sales
├── N:1 → products
└── N:1 → companies

RLS: ✅ Ativo
```

---

### Tabela: `products` (Produtos)
```
Colunas Principais:
├── id (UUID) - PK
├── name (TEXT)
├── description (TEXT)
├── barcode (TEXT)
├── sku (TEXT)
├── price (DECIMAL) - Preço de venda
├── cost_price (DECIMAL) - Preço de custo
├── promotional_price (DECIMAL)
├── stock_quantity (INTEGER)
├── min_stock (INTEGER)
├── track_stock (BOOLEAN)
├── category_id (UUID) - FK → product_categories
├── company_id (UUID) - FK → companies
├── image_url (TEXT)
├── active (BOOLEAN)
└── created_at (TIMESTAMP)

Relacionamentos:
├── N:1 → product_categories
├── N:1 → companies
└── 1:N → sale_items

RLS: ✅ Ativo
Índices: company_id, category_id, barcode, active
```

---

### Tabela: `payment_methods` (Formas de Pagamento)
```
Colunas Principais:
├── id (UUID) - PK
├── name (TEXT)
├── type (ENUM) - cash | card | pix | check | other
├── company_id (UUID) - FK → companies
├── active (BOOLEAN)
└── created_at (TIMESTAMP)

Relacionamentos:
├── N:1 → companies
└── 1:N → sales

RLS: ✅ Ativo
```

---

### Tabela: `sellers` (Vendedores)
```
Colunas Principais:
├── id (UUID) - PK
├── name (TEXT)
├── email (TEXT)
├── phone (TEXT)
├── commission_percentage (DECIMAL)
├── company_id (UUID) - FK → companies
├── active (BOOLEAN)
└── created_at (TIMESTAMP)

Relacionamentos:
├── N:1 → companies
├── 1:N → sales
└── 1:N → company_users

RLS: ✅ Ativo
```

---

### Tabela: `product_categories` (Categorias)
```
Colunas Principais:
├── id (UUID) - PK
├── name (TEXT)
├── color (TEXT) - Cor hex
├── company_id (UUID) - FK → companies
├── active (BOOLEAN)
└── created_at (TIMESTAMP)

Relacionamentos:
├── N:1 → companies
└── 1:N → products

RLS: ✅ Ativo
```

---

### Tabela: `landing_leads` (Leads)
```
Colunas Principais:
├── id (UUID) - PK
├── name (TEXT)
├── email (TEXT)
├── phone (TEXT)
├── company_name (TEXT)
├── business_type (TEXT)
├── message (TEXT)
└── created_at (TIMESTAMP)

RLS: ✅ Ativo (Apenas Super Admin)
```

---

### Tabela: `user_roles` (Roles de Usuários)
```
Colunas Principais:
├── id (UUID) - PK
├── user_id (UUID) - FK → auth.users (UNIQUE)
├── role (TEXT) - super_admin | admin | user
└── created_at (TIMESTAMP)

Relacionamentos:
└── N:1 → auth.users

RLS: ✅ Ativo
```

---

## 🔍 VIEWS

### VIEW: `v_company_users_with_seller`
Combina dados de `company_users`, `companies` e `sellers` para facilitar consultas de permissões.

**Colunas:**
- user_id, company_id, company_name
- role, seller_id, seller_name
- can_view_company_profits, can_access_pdv, can_view_reports
- can_manage_products, can_manage_sellers

---

## 🔐 FUNÇÕES RPC

### `is_admin(user_uuid UUID) → BOOLEAN`
Verifica se um usuário é super_admin.

### `create_company(...) → company`
Cria empresa e vincula usuário.

### `get_dashboard_stats() → dashboard_stats`
Retorna estatísticas do dashboard.

---

## ⚠️ PROBLEMAS IDENTIFICADOS

### 1. Colunas Faltantes em `companies`
- ❌ `status` (deveria ser 'active', 'suspended', 'canceled')
- ❌ `updated_at` (para rastrear alterações)

### 2. Colunas Faltantes em `sales`
- ❌ `customer_name`
- ❌ `customer_email`
- ❌ `customer_phone`
- ❌ `notes`

### 3. Colunas Faltantes em `products`
- ❌ `updated_at`
- ❌ `supplier_id`

### 4. Colunas Faltantes em `sellers`
- ❌ `user_id` (para acesso individual)
- ❌ `updated_at`

### 5. Falta de Auditoria
- ❌ Sem `created_by` e `updated_by` em tabelas
- ❌ Sem triggers para atualizar `updated_at`

### 6. Possíveis Problemas com RLS
- ⚠️ Validação de `company_id` em todas as queries
- ⚠️ Validação de role para operações sensíveis

---

## 📊 ESTATÍSTICAS

| Métrica | Valor |
|---------|-------|
| **Total de Tabelas** | 10 |
| **Total de Views** | 1 |
| **Total de Funções RPC** | 3+ |
| **Tabelas com RLS** | 10 ✅ |
| **Relacionamentos** | 15+ |
| **Colunas Faltantes** | 8 |
| **Índices Recomendados** | 12+ |

---

## 🎯 PRÓXIMOS PASSOS

### Prioridade Alta
1. ✅ Adicionar `status` em `companies`
2. ✅ Adicionar `updated_at` em todas as tabelas
3. ✅ Adicionar campos de cliente em `sales`
4. ✅ Criar índices faltantes

### Prioridade Média
1. ⚠️ Implementar triggers para `updated_at`
2. ⚠️ Adicionar auditoria (`created_by`, `updated_by`)
3. ⚠️ Melhorar políticas RLS

### Prioridade Baixa
1. 📋 Adicionar campos opcionais (supplier_id, weight, etc)
2. 📋 Otimizar queries com índices compostos

---

## 🔒 SEGURANÇA

| Aspecto | Status | Observação |
|--------|--------|-----------|
| **RLS Ativo** | ✅ | Todas as tabelas protegidas |
| **Isolamento por Empresa** | ✅ | Multi-tenant implementado |
| **Autenticação** | ✅ | Supabase Auth |
| **Autorização** | ✅ | Roles e permissões |
| **Auditoria** | ❌ | Falta implementar |
| **Validação de Entrada** | ⚠️ | Verificar no código |

---

## 📝 CONCLUSÃO

O banco de dados está bem estruturado com:
- ✅ Isolamento de dados por empresa
- ✅ Controle de permissões granular
- ✅ RLS ativo em todas as tabelas
- ⚠️ Mas faltam colunas de auditoria e alguns campos importantes

**Recomendação:** Implementar as melhorias sugeridas para aumentar robustez e rastreabilidade.

---

*Documento gerado automaticamente - Análise do Supabase VendaFácil*
