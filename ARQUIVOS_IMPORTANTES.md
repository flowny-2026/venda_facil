# 📁 Arquivos Importantes do Projeto

## 🎯 ARQUIVOS ESSENCIAIS

### 📄 Landing Page
- **`landing-page.html`** - Landing page principal (funcionando ✅)
- **`assets/`** - Imagens e recursos da landing page

### 🖥️ Sistema Admin
- **`admin-system/`** - Sistema completo de administração
- **`src/`** - Código fonte do sistema cliente
- **`index.html`** - Entry point do sistema React

### ⚙️ Configuração
- **`.env`** - Variáveis de ambiente (NÃO commitar!)
- **`.env.example`** - Exemplo de variáveis de ambiente
- **`vercel.json`** - Configuração do Vercel
- **`package.json`** - Dependências do projeto

---

## 📊 BANCO DE DADOS (SQL)

### Scripts Principais
- **`ADMIN_DATABASE.sql`** - Estrutura completa do banco
- **`ADMIN_VIEWS.sql`** - Views do sistema
- **`ARQUITETURA_COMERCIAL.sql`** - Arquitetura de empresas
- **`PDV_DATABASE.sql`** - Banco de dados do PDV

### Funcionalidades
- **`CRIAR_TABELA_LEADS.sql`** - Tabela de leads da landing page
- **`CRIAR_FUNCAO_IS_ADMIN.sql`** - Função para verificar admin
- **`IMPLEMENTAR_MODO_INDIVIDUAL.sql`** - Modo individual para vendedores

### Segurança
- **`SEGURANCA_MAXIMA_PARTE1.sql`** - RLS para companies e company_users
- **`SEGURANCA_MAXIMA_PARTE2.sql`** - RLS para sellers e validações
- **`SEGURANCA_MAXIMA_PARTE3.sql`** - Audit logs

### Utilitários
- **`DELETAR_USUARIOS_EMPRESAS.sql`** - Funções para deletar usuários/empresas
- **`COMANDOS_DELETAR_RAPIDO.sql`** - Comandos rápidos para deletar
- **`CORRIGIR_FUNCAO_DELETE_USER.sql`** - Correção da função de delete

---

## 📚 DOCUMENTAÇÃO

### Guias Principais
- **`README.md`** - Documentação principal do projeto
- **`RESUMO_COMPLETO_PROJETO.md`** - Resumo completo do sistema
- **`SEGURANCA_MAXIMA_GUIA.md`** - Guia de segurança completo
- **`MODO_INDIVIDUAL_GUIA.md`** - Guia do modo individual

### Deploy
- **`DEPLOY_VERCEL_GUIA_COMPLETO.md`** - Guia completo de deploy
- **`COMANDOS_DEPLOY_RAPIDO.md`** - Comandos rápidos para deploy

### Tutoriais
- **`COMO_DELETAR_USUARIOS_EMPRESAS_SUPABASE.md`** - Como deletar no Supabase
- **`COMO_RECEBER_LEADS.md`** - Como configurar recebimento de leads
- **`SUPABASE_SETUP.md`** - Configuração do Supabase

### Auditorias
- **`AUDITORIA_SEGURANCA_COMPLETA.md`** - Auditoria de segurança

---

## 🗑️ ARQUIVOS DELETADOS (não são mais necessários)

### SQL Temporários
- ❌ ADICIONAR_COLUNA_ACCESS_TYPE.sql
- ❌ CORRECAO_AUTOMATICA.sql
- ❌ CORRIGIR_PERMISSOES_GERENTE.sql
- ❌ DESABILITAR_RLS_TEMPORARIO.sql
- ❌ DIAGNOSTICO_E_CORRECAO.sql
- ❌ RLS_CORRETO_SEM_RECURSAO.sql
- ❌ RLS_SEGURO_PERMITE_LOGIN.sql
- ❌ RLS_SOLUCAO_DEFINITIVA.sql

### Markdown Temporários
- ❌ BOTAO_WHATSAPP_ADICIONADO.md
- ❌ CORRECOES_HTML_LANDING_PAGE.md
- ❌ LANDING_PAGE_ATUALIZADA.md
- ❌ TESTAR_LANDING_PAGE.md

### Outros
- ❌ landing-page-fixed.js (JavaScript agora está inline)
- ❌ teste-botao.html (arquivo de teste)
- ❌ landing-page-backup.html (backup antigo)

---

## 📦 ESTRUTURA DO PROJETO

```
📁 Projeto/
├── 📄 landing-page.html          ← Landing page
├── 📁 assets/                    ← Imagens
├── 📁 admin-system/              ← Sistema admin
│   ├── 📁 src/
│   ├── 📁 public/
│   └── 📄 package.json
├── 📁 src/                       ← Sistema cliente
├── 📄 .env                       ← Variáveis (não commitar!)
├── 📄 vercel.json                ← Config Vercel
├── 📄 package.json               ← Dependências
└── 📁 SQL/                       ← Scripts SQL
    ├── ADMIN_DATABASE.sql
    ├── CRIAR_TABELA_LEADS.sql
    ├── IMPLEMENTAR_MODO_INDIVIDUAL.sql
    └── SEGURANCA_MAXIMA_*.sql
```

---

## ✅ CHECKLIST DE ARQUIVOS

### Antes do Deploy
- [ ] `.env` configurado (não commitar!)
- [ ] `landing-page.html` funcionando
- [ ] `admin-system/` compilando
- [ ] Scripts SQL executados no Supabase
- [ ] RLS ativo e funcionando

### Para Commitar
- [ ] Adicionar `.env` no `.gitignore`
- [ ] Remover arquivos temporários
- [ ] Atualizar README.md
- [ ] Fazer commit com mensagem descritiva

---

**Última atualização**: 25/04/2026
**Status**: ✅ Projeto limpo e organizado
