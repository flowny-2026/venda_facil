# 📚 DOCUMENTAÇÃO COMPLETA - SISTEMA VENDAFÁCIL

## 🎯 VISÃO GERAL DO SISTEMA

O **VendaFácil** é um sistema SaaS (Software as a Service) completo de gestão de vendas multiempresa, desenvolvido para pequenas e médias empresas que precisam gerenciar produtos, vendedores, vendas e gerar cupons fiscais.

---

## 🏗️ ARQUITETURA DO SISTEMA

### Estrutura de 3 Camadas

```
┌─────────────────────────────────────────────────────────┐
│                   LANDING PAGE                          │
│  • Captura de leads                                     │
│  • Formulário de contato                                │
│  • Informações sobre o VendaFácil                       │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  PAINEL ADMIN                           │
│  • Gestão de empresas                                   │
│  • Visualização de leads                                │
│  • Criação de acessos                                   │
│  • Administração geral                                  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                 PAINEL CLIENTE                          │
│  • Gestão de produtos                                   │
│  • Gestão de vendedores                                 │
│  • PDV (Ponto de Venda)                                 │
│  • Relatórios e Dashboard                               │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 1. LANDING PAGE

### Objetivo
Capturar leads de potenciais clientes interessados no sistema VendaFácil.

### Funcionalidades

#### 1.1 Formulário de Contato
- **Campos:**
  - Nome completo
  - Email
  - Telefone/WhatsApp
  - Nome da empresa
  - Tipo de negócio (dropdown)
  - Mensagem (opcional)

#### 1.2 Informações Exibidas
- Apresentação do VendaFácil
- Funcionalidades principais
- Benefícios do sistema
- Planos e preços (se aplicável)
- Depoimentos de clientes

#### 1.3 Armazenamento de Leads
- Todos os leads são salvos na tabela `landing_leads`
- Administrador pode visualizar no Painel Admin
- Dados capturados:
  - Nome, email, telefone
  - Empresa e tipo de negócio
  - Data/hora do contato
  - Mensagem

---

## 🔐 2. PAINEL ADMIN

### Objetivo
Gerenciar empresas clientes e visualizar leads capturados pela landing page.

### Acesso
- **Email:** edicharlesbrito2009@hotmail.com
- **Tipo:** Super Admin
- **Permissões:** Acesso total ao sistema

### Funcionalidades

#### 2.1 Gestão de Empresas

##### Criar Nova Empresa
O admin pode criar empresas com **2 tipos de acesso:**

**A) ACESSO COMPARTILHADO**
- **Descrição:** Um único login para gerente + vendedores
- **Uso:** Empresa pequena onde todos compartilham o mesmo acesso
- **Criação:**
  - Nome da empresa
  - Email do gerente
  - Senha compartilhada
  - Dados da empresa (CNPJ, telefone, endereço)
- **Funcionamento:**
  - Gerente faz login
  - Gerente cadastra vendedores no sistema
  - Vendedores NÃO têm login próprio
  - Todos usam o mesmo acesso

**B) ACESSO INDIVIDUAL**
- **Descrição:** Cada vendedor tem seu próprio login
- **Uso:** Empresa que quer controle individual por vendedor
- **Criação:**
  - Nome da empresa
  - Email do gerente
  - Senha do gerente
  - Dados da empresa
- **Funcionamento:**
  - Gerente faz login com suas credenciais
  - Gerente cria logins individuais para cada vendedor
  - Cada vendedor tem email e senha próprios
  - Sistema rastreia vendas por vendedor

##### Dados da Empresa
- Nome da empresa
- Email de contato
- Telefone
- CNPJ/CPF
- Endereço completo
- Cidade e Estado
- CEP
- Logo (opcional)
- Status (Ativa/Inativa)

#### 2.2 Visualização de Leads
- Lista de todos os leads capturados
- Filtros por data, tipo de negócio
- Exportação de leads
- Marcar lead como "Contatado"
- Converter lead em cliente

#### 2.3 Dashboard Admin
- Total de empresas cadastradas
- Total de leads capturados
- Empresas ativas vs inativas
- Leads por tipo de negócio
- Gráficos e estatísticas

---

## 👔 3. PAINEL CLIENTE (GERENTE)

### Objetivo
Gerenciar produtos, vendedores, realizar vendas e visualizar relatórios.

### Tipos de Acesso

#### 3.1 GERENTE (Acesso Compartilhado)
- **Login:** Email e senha da empresa
- **Permissões:**
  - ✅ Cadastrar produtos
  - ✅ Editar produtos
  - ✅ Cadastrar vendedores (sem login)
  - ✅ Realizar vendas no PDV
  - ✅ Ver todas as vendas
  - ✅ Gerar relatórios
  - ✅ Configurar formas de pagamento
  - ✅ Gerenciar categorias

#### 3.2 GERENTE (Acesso Individual)
- **Login:** Email e senha próprios
- **Permissões:**
  - ✅ Todas as permissões do gerente compartilhado
  - ✅ **Criar logins para vendedores**
  - ✅ Definir permissões por vendedor
  - ✅ Ver vendas por vendedor
  - ✅ Relatórios individuais por vendedor

### Funcionalidades Principais

#### 3.3 Gestão de Produtos

##### Cadastro de Produto
- **Informações Básicas:**
  - Nome do produto
  - Descrição
  - Categoria
  - Código de barras
  - SKU
  - Imagem do produto

- **Preços:**
  - Preço de custo
  - Preço de venda
  - Preço promocional (opcional)
  - Margem de lucro (calculada automaticamente)

- **Estoque:**
  - Quantidade em estoque
  - Estoque mínimo (alerta)
  - Controlar estoque (sim/não)
  - Histórico de movimentações

- **Status:**
  - Ativo/Inativo

##### Visualização de Produtos
- **Filtros:**
  - Por categoria
  - Por nome
  - Por código de barras
  - Por status (ativo/inativo)
  - Com estoque baixo

- **Ações:**
  - Editar produto
  - Excluir produto
  - Ativar/Desativar
  - Ajustar estoque
  - Ver histórico

##### Isolamento de Dados
- ✅ **Cada empresa vê APENAS seus produtos**
- ✅ Impossível ver produtos de outras empresas
- ✅ Segurança garantida por RLS (Row Level Security)

#### 3.4 Gestão de Vendedores

##### Acesso Compartilhado
- Cadastro simples de vendedores:
  - Nome
  - Email (opcional)
  - Telefone
  - Percentual de comissão
  - Status (ativo/inativo)
- Vendedores NÃO têm login
- Gerente seleciona vendedor ao fazer venda

##### Acesso Individual
- Cadastro completo de vendedores:
  - Nome
  - Email (obrigatório - será o login)
  - Telefone
  - Percentual de comissão
  - **Criar login de acesso**
  - Definir senha inicial
  - Status (ativo/inativo)
- Cada vendedor recebe:
  - Email de boas-vindas
  - Credenciais de acesso
  - Link para acessar o sistema

#### 3.5 PDV (Ponto de Venda)

##### Funcionalidades
- **Busca de Produtos:**
  - Por nome
  - Por código de barras
  - Por categoria

- **Carrinho de Compras:**
  - Adicionar produtos
  - Ajustar quantidade
  - Remover produtos
  - Ver subtotal em tempo real

- **Descontos:**
  - Desconto em valor (R$)
  - Desconto em percentual (%)
  - Aplicado ao total da venda

- **Pagamento:**
  - Selecionar forma de pagamento
  - Informar valor recebido
  - Calcular troco automaticamente

- **Finalização:**
  - Selecionar vendedor responsável
  - Gerar cupom não fiscal
  - Atualizar estoque automaticamente
  - Registrar comissão do vendedor

##### Cupom Não Fiscal
- **Informações no Cupom:**
  - Dados da empresa
  - Número do cupom (único)
  - Data e hora
  - Vendedor responsável
  - Lista de produtos (nome, qtd, preço)
  - Subtotal, desconto, total
  - Forma de pagamento
  - Valor recebido e troco

- **Formatos Disponíveis:**
  - Impressão térmica 58mm
  - Impressão térmica 80mm
  - Download em PDF
  - Compartilhar via WhatsApp

#### 3.6 Dashboard e Relatórios

##### Dashboard
- **KPIs Principais:**
  - Total de vendas (dia/mês)
  - Ticket médio
  - Produtos mais vendidos
  - Vendedor destaque
  - Estoque baixo (alertas)

- **Gráficos:**
  - Vendas por período
  - Vendas por categoria
  - Vendas por vendedor
  - Evolução de vendas

##### Relatórios
- **Relatório de Vendas:**
  - Filtro por período
  - Filtro por vendedor
  - Filtro por forma de pagamento
  - Exportar para Excel/PDF

- **Relatório de Produtos:**
  - Produtos mais vendidos
  - Produtos com estoque baixo
  - Margem de lucro por produto
  - Valor do inventário

- **Relatório de Vendedores:**
  - Vendas por vendedor
  - Comissões a pagar
  - Performance individual
  - Ranking de vendedores

#### 3.7 Configurações

##### Categorias de Produtos
- Criar categorias
- Definir cores para identificação
- Ativar/Desativar categorias

##### Formas de Pagamento
- Cadastrar formas de pagamento
- Tipos: Dinheiro, Cartão, PIX, etc.
- Ativar/Desativar

##### Dados da Empresa
- Atualizar informações
- Upload de logo
- Configurar dados do cupom

---

## 🛒 4. PAINEL VENDEDOR (Acesso Individual)

### Objetivo
Permitir que vendedores façam vendas e vejam suas próprias estatísticas.

### Acesso
- **Login:** Email e senha criados pelo gerente
- **Tipo:** Vendedor Individual

### Funcionalidades

#### 4.1 O Que o Vendedor VÊ

##### Dashboard Simplificado
- **Suas Vendas:**
  - Total de vendas do dia
  - Total de vendas do mês
  - Suas comissões
  - Ticket médio

- **Produtos:**
  - Lista de produtos disponíveis
  - Preços e estoque
  - **NÃO pode cadastrar/editar**

##### PDV Simplificado
- Fazer vendas normalmente
- Vendas são automaticamente atribuídas a ele
- Não pode selecionar outro vendedor
- Gera cupom normalmente

##### Minhas Vendas
- Ver histórico de suas vendas
- Filtrar por data
- Ver detalhes de cada venda
- Reimprimir cupons

#### 4.2 O Que o Vendedor NÃO VÊ

❌ Vendas de outros vendedores  
❌ Cadastro de produtos  
❌ Edição de produtos  
❌ Exclusão de produtos  
❌ Gestão de vendedores  
❌ Relatórios gerais  
❌ Configurações do sistema  
❌ Dados financeiros da empresa  

---

## 🔐 5. SISTEMA DE PERMISSÕES

### Hierarquia de Acessos

```
┌─────────────────────────────────────────────────────────┐
│                    SUPER ADMIN                          │
│  • Acesso total ao sistema                              │
│  • Gerencia todas as empresas                           │
│  • Visualiza todos os dados                             │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              GERENTE (Empresa Admin)                    │
│  • Acesso total à sua empresa                           │
│  • Cadastra produtos, vendedores                        │
│  • Faz vendas, gera relatórios                          │
│  • Cria logins (se acesso individual)                   │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                     VENDEDOR                            │
│  • Acesso limitado                                      │
│  • Faz vendas no PDV                                    │
│  • Vê apenas suas vendas                                │
│  • Não cadastra/edita produtos                          │
└─────────────────────────────────────────────────────────┘
```

### Matriz de Permissões

| Funcionalidade | Super Admin | Gerente | Vendedor |
|----------------|-------------|---------|----------|
| **Empresas** |
| Criar empresa | ✅ | ❌ | ❌ |
| Editar empresa | ✅ | ✅ Sua | ❌ |
| Ver empresas | ✅ Todas | ✅ Sua | ❌ |
| **Produtos** |
| Criar produto | ✅ | ✅ | ❌ |
| Editar produto | ✅ | ✅ | ❌ |
| Excluir produto | ✅ | ✅ | ❌ |
| Ver produtos | ✅ Todos | ✅ Seus | ✅ Seus |
| **Vendedores** |
| Criar vendedor | ✅ | ✅ | ❌ |
| Criar login vendedor | ✅ | ✅ | ❌ |
| Editar vendedor | ✅ | ✅ | ❌ |
| Ver vendedores | ✅ Todos | ✅ Seus | ❌ |
| **Vendas** |
| Fazer venda | ✅ | ✅ | ✅ |
| Ver todas vendas | ✅ | ✅ | ❌ |
| Ver suas vendas | ✅ | ✅ | ✅ |
| Gerar cupom | ✅ | ✅ | ✅ |
| **Relatórios** |
| Relatórios gerais | ✅ | ✅ | ❌ |
| Relatório pessoal | ✅ | ✅ | ✅ |
| **Configurações** |
| Configurar sistema | ✅ | ✅ | ❌ |
| Formas pagamento | ✅ | ✅ | ❌ |
| Categorias | ✅ | ✅ | ❌ |

---

## 📊 6. FLUXOS DO SISTEMA

### 6.1 Fluxo de Cadastro de Empresa

```
1. Lead preenche formulário na Landing Page
   ↓
2. Admin visualiza lead no Painel Admin
   ↓
3. Admin entra em contato com lead
   ↓
4. Admin cria empresa no sistema
   ↓
5. Admin escolhe tipo de acesso:
   • Compartilhado → Cria 1 login para gerente
   • Individual → Cria login gerente + permite criar logins vendedores
   ↓
6. Gerente recebe credenciais por email
   ↓
7. Gerente faz primeiro acesso
   ↓
8. Gerente configura empresa (logo, dados)
   ↓
9. Sistema pronto para uso
```

### 6.2 Fluxo de Cadastro de Vendedor

#### Acesso Compartilhado:
```
1. Gerente acessa Painel Cliente
   ↓
2. Vai em "Vendedores"
   ↓
3. Clica em "Novo Vendedor"
   ↓
4. Preenche: Nome, Email, Telefone, Comissão
   ↓
5. Salva vendedor
   ↓
6. Vendedor cadastrado (SEM login)
   ↓
7. Gerente seleciona vendedor ao fazer venda
```

#### Acesso Individual:
```
1. Gerente acessa Painel Cliente
   ↓
2. Vai em "Vendedores"
   ↓
3. Clica em "Novo Vendedor com Login"
   ↓
4. Preenche: Nome, Email, Telefone, Comissão
   ↓
5. Clica em "Gerar Login"
   ↓
6. Sistema cria usuário no Supabase Auth
   ↓
7. Vendedor recebe email com credenciais
   ↓
8. Vendedor faz login com email/senha
   ↓
9. Vendedor acessa painel simplificado
```

### 6.3 Fluxo de Venda no PDV

```
1. Usuário acessa PDV
   ↓
2. Busca e adiciona produtos ao carrinho
   ↓
3. Ajusta quantidades se necessário
   ↓
4. Aplica desconto (se houver)
   ↓
5. Seleciona vendedor responsável
   (Se for vendedor logado, já vem selecionado)
   ↓
6. Seleciona forma de pagamento
   ↓
7. Informa valor recebido
   ↓
8. Sistema calcula troco
   ↓
9. Clica em "Finalizar Venda"
   ↓
10. Sistema:
    • Registra venda no banco
    • Atualiza estoque dos produtos
    • Gera número único do cupom
    • Registra comissão do vendedor
   ↓
11. Modal de cupom aparece
   ↓
12. Usuário pode:
    • Imprimir cupom 58mm
    • Imprimir cupom 80mm
    • Baixar PDF
    • Compartilhar WhatsApp
   ↓
13. Venda concluída!
```

---

## 🗄️ 7. ESTRUTURA DO BANCO DE DADOS

### Tabelas Principais

#### 7.1 companies (Empresas)
```sql
- id (UUID)
- name (Nome da empresa)
- email (Email de contato)
- phone (Telefone)
- document (CNPJ/CPF)
- address (Endereço)
- city (Cidade)
- state (Estado)
- zip_code (CEP)
- logo_url (URL do logo)
- active (Ativa/Inativa)
- created_at (Data de criação)
```

#### 7.2 company_users (Usuários das Empresas)
```sql
- id (UUID)
- user_id (ID do usuário no Supabase Auth)
- company_id (ID da empresa)
- role (Papel: admin, gerente, vendedor)
- seller_id (ID do vendedor, se aplicável)
- active (Ativo/Inativo)
- created_at (Data de criação)
```

#### 7.3 landing_leads (Leads da Landing Page)
```sql
- id (UUID)
- name (Nome)
- email (Email)
- phone (Telefone)
- company_name (Nome da empresa)
- business_type (Tipo de negócio)
- message (Mensagem)
- created_at (Data do contato)
```

#### 7.4 product_categories (Categorias)
```sql
- id (UUID)
- name (Nome da categoria)
- color (Cor para identificação)
- company_id (ID da empresa)
- active (Ativa/Inativa)
- created_at (Data de criação)
```

#### 7.5 products (Produtos)
```sql
- id (UUID)
- name (Nome do produto)
- description (Descrição)
- barcode (Código de barras)
- sku (SKU)
- price (Preço de venda)
- cost_price (Preço de custo)
- promotional_price (Preço promocional)
- stock_quantity (Quantidade em estoque)
- min_stock (Estoque mínimo)
- track_stock (Controlar estoque)
- category_id (ID da categoria)
- company_id (ID da empresa)
- image_url (URL da imagem)
- active (Ativo/Inativo)
- created_at (Data de criação)
```

#### 7.6 sellers (Vendedores)
```sql
- id (UUID)
- name (Nome)
- email (Email)
- phone (Telefone)
- commission_percentage (% de comissão)
- company_id (ID da empresa)
- active (Ativo/Inativo)
- created_at (Data de criação)
```

#### 7.7 payment_methods (Formas de Pagamento)
```sql
- id (UUID)
- name (Nome)
- type (Tipo: dinheiro, cartão, pix, etc)
- company_id (ID da empresa)
- active (Ativa/Inativa)
- created_at (Data de criação)
```

#### 7.8 sales (Vendas)
```sql
- id (UUID)
- receipt_number (Número do cupom)
- user_id (ID do usuário que fez a venda)
- company_id (ID da empresa)
- seller_id (ID do vendedor)
- payment_method_id (ID da forma de pagamento)
- subtotal (Subtotal)
- discount_amount (Valor do desconto)
- total_amount (Total)
- payment_received (Valor recebido)
- change_amount (Troco)
- status (Status: paid, cancelled)
- created_at (Data da venda)
```

#### 7.9 sale_items (Itens das Vendas)
```sql
- id (UUID)
- sale_id (ID da venda)
- product_id (ID do produto)
- product_name (Nome do produto)
- quantity (Quantidade)
- unit_price (Preço unitário)
- total_price (Preço total)
- company_id (ID da empresa)
- created_at (Data)
```

### Relacionamentos

```
companies (1) ──── (N) company_users
companies (1) ──── (N) products
companies (1) ──── (N) sellers
companies (1) ──── (N) sales
products (1) ──── (N) sale_items
sellers (1) ──── (N) sales
sales (1) ──── (N) sale_items
```

---

## 🔒 8. SEGURANÇA

### 8.1 Isolamento de Dados
- ✅ Cada empresa vê APENAS seus dados
- ✅ Impossível acessar dados de outras empresas
- ✅ Filtros automáticos por `company_id`

### 8.2 Autenticação
- ✅ Supabase Auth
- ✅ Email e senha
- ✅ Recuperação de senha
- ✅ Sessões seguras

### 8.3 Autorização
- ✅ Verificação de permissões por role
- ✅ Controle de acesso por funcionalidade
- ✅ Logs de auditoria

---

## 📱 9. TECNOLOGIAS UTILIZADAS

### Frontend
- **React** - Framework JavaScript
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Vite** - Build tool
- **Lucide React** - Ícones

### Backend
- **Supabase** - Backend as a Service
- **PostgreSQL** - Banco de dados
- **Row Level Security (RLS)** - Segurança

### Bibliotecas
- **jsPDF** - Geração de PDFs
- **React Router** - Navegação
- **Supabase Client** - Integração com Supabase

---

## 🚀 10. PRÓXIMOS PASSOS

### Melhorias Futuras
- [ ] Integração com nota fiscal eletrônica
- [ ] App mobile para vendedores
- [ ] Integração com WhatsApp Business
- [ ] Relatórios avançados com BI
- [ ] Gestão de clientes (CRM)
- [ ] Programa de fidelidade
- [ ] Integração com marketplaces
- [ ] API pública para integrações

---

## 📞 11. SUPORTE

### Contato
- **Email:** edicharlesbrito2009@hotmail.com
- **WhatsApp:** (16) 99291-5540

### Documentação Técnica
- Scripts SQL em: `/sql`
- Guias em: `/docs`
- Exemplos em: `/examples`

---

**Sistema VendaFácil - Gestão de Vendas Simplificada** 🚀

*Desenvolvido com ❤️ para pequenas e médias empresas*
