# 💰 Venda Fácil - Sistema PDV Completo

Sistema PDV (Point of Sale) completo para empresas, com arquitetura multi-tenant e painel administrativo.

## 🚀 **INÍCIO RÁPIDO**

**📚 [ÍNDICE COMPLETO DA DOCUMENTAÇÃO](INDICE_DOCUMENTACAO.md)** - Navegue por todos os guias

**Novo aqui? Comece por aqui:**
- 📖 **[Guia Visual Interativo](GUIA_VISUAL.html)** ⭐ **RECOMENDADO** - Abra no navegador
- 📋 **[Próximos Passos](PROXIMOS_PASSOS.md)** - O que fazer agora para usar o sistema
- 🎯 **[Guia Completo Final](GUIA_COMPLETO_FINAL.md)** - Documentação completa do projeto

**Links Importantes:**
- 🌐 **Landing Page:** https://flowny-2026.github.io/venda_facil/
- 💻 **Sistema Cliente:** http://localhost:5173 (após iniciar)
- 🏢 **Sistema Admin:** http://localhost:5180 (após iniciar)

---

## 🎯 **Visão Geral**

O **Venda Fácil** é uma solução SaaS B2B completa que permite:
- **Empresas** usarem um PDV profissional
- **Você** gerenciar múltiplas empresas clientes
- **Receita recorrente** através de mensalidades

## 🏗️ **Arquitetura**

### **Sistema Cliente** (localhost:5173)
- PDV completo com carrinho de compras
- Gestão de produtos e categorias
- Cadastro de vendedores
- Formas de pagamento configuráveis
- Controle de estoque automático
- Relatórios e dashboard em tempo real

### **Sistema Admin** (localhost:5180)
- Gestão de empresas clientes
- Dashboard consolidado
- Controle de planos e mensalidades
- Tipos de acesso (Compartilhado/Individual)
- Estatísticas multi-empresa

## 🚀 **Tecnologias**

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + Lucide Icons
- **Backend**: Supabase (Database + Auth + RLS)
- **Arquitetura**: Multi-tenant com isolamento completo

## 📦 **Instalação**

### **Pré-requisitos**
- Node.js 16+ ou 18+
- Conta no Supabase
- Git

### **1. Clonar o repositório**
```bash
git clone https://github.com/flowny-2026/venda_facil.git
cd venda_facil
```

### **2. Configurar Supabase**
1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute os scripts SQL na pasta raiz:
   - `ADMIN_DATABASE.sql`
   - `PDV_DATABASE.sql` 
   - `MELHORIAS_SISTEMA_EMPRESAS.sql`

### **3. Configurar variáveis de ambiente**
Crie o arquivo `.env` na raiz:
```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_publica_do_supabase
```

Crie o arquivo `admin-system/.env`:
```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_publica_do_supabase
```

### **4. Instalar dependências e rodar**

**Sistema Cliente:**
```bash
npm install
npm run dev
```
Acesse: http://localhost:5173

**Sistema Admin:**
```bash
cd admin-system
npm install
npm run dev
```
Acesse: http://localhost:5180

## 💼 **Modelo de Negócio**

### **Planos Disponíveis**
- **Starter**: R$ 49,90/mês - 1 usuário
- **Professional**: R$ 99,90/mês - 5 usuários
- **Enterprise**: R$ 199,90/mês - 20 usuários

### **Tipos de Acesso**
- **Compartilhado**: 1 login por empresa, vendedores selecionados no PDV
- **Individual**: Cada vendedor tem login próprio

### **Segmentos de Mercado**
- **Comércio tradicional**: Lojas de shopping, varejo
- **Vendas especializadas**: Lojas de carros, imobiliárias
- **Restaurantes**: Controle de mesas e pedidos
- **Serviços**: Salões, clínicas, oficinas

## 🎯 **Funcionalidades Principais**

### **PDV (Point of Sale)**
- ✅ Carrinho de compras intuitivo
- ✅ Busca rápida de produtos
- ✅ Aplicação de descontos (valor/percentual)
- ✅ Múltiplas formas de pagamento
- ✅ Cálculo automático de troco
- ✅ Seleção de vendedor por venda
- ✅ Controle de estoque em tempo real

### **Gestão de Produtos**
- ✅ Cadastro com código de barras
- ✅ Categorização com cores
- ✅ Preços promocionais
- ✅ Controle de estoque mínimo
- ✅ Alertas de estoque baixo

### **Gestão de Vendedores**
- ✅ Cadastro com comissões
- ✅ Relatórios por vendedor
- ✅ Metas e performance
- ✅ Histórico de vendas

### **Relatórios e Analytics**
- ✅ Dashboard em tempo real
- ✅ Vendas por período
- ✅ Produtos mais vendidos
- ✅ Performance por vendedor
- ✅ Análise por forma de pagamento
- ✅ KPIs e métricas

### **Sistema Multi-tenant**
- ✅ Isolamento completo entre empresas
- ✅ RLS (Row Level Security)
- ✅ Gestão centralizada no admin
- ✅ Controle de planos e usuários

## 🔧 **Configuração Avançada**

### **Deploy em Produção**
1. Configure as variáveis de ambiente
2. Execute `npm run build` em ambos os projetos
3. Faça deploy dos arquivos `dist/` gerados
4. Configure domínios personalizados

### **Customização**
- Cores e tema no `tailwind.config.js`
- Logos e branding nos componentes
- Planos e preços no sistema admin
- Campos personalizados no banco

## 📊 **Estrutura do Banco**

### **Tabelas Principais**
- `companies` - Empresas clientes
- `company_users` - Usuários por empresa
- `products` - Produtos das lojas
- `sellers` - Vendedores
- `sales` - Vendas realizadas
- `sale_items` - Itens das vendas
- `payment_methods` - Formas de pagamento

### **Segurança**
- RLS habilitado em todas as tabelas
- Políticas por empresa
- Autenticação via Supabase Auth
- Isolamento completo de dados

## 🤝 **Contribuição**

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 **Licença**

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 **Suporte**

- **GitHub Issues**: Para bugs e sugestões
- **Documentação**: Arquivos `.md` na raiz do projeto
- **Scripts SQL**: Pasta raiz com estrutura do banco

---

**Desenvolvido com ❤️ para revolucionar o varejo brasileiro!** 🇧🇷