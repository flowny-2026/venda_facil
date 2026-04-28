# 🚀 VendaFácil - Sistema PDV Completo

Sistema completo de Ponto de Venda com Landing Page e Painel Administrativo.

## 📁 Estrutura do Projeto

```
📁 venda-facil/
├── 📁 public/                    ← Landing Page
│   ├── index.html
│   └── assets/logo-final.png
│
├── 📁 admin-system/              ← Sistema Admin
│   ├── src/
│   ├── public/
│   └── package.json
│
├── 📄 vercel.json                ← Configuração de deploy
└── 📄 README.md
```

## 🌐 URLs do Sistema

Após o deploy:

```
https://seu-projeto.vercel.app/              → Landing Page
https://seu-projeto.vercel.app/admin         → Sistema Admin
```

## 🚀 Deploy no Vercel

### Configuração Automática

O projeto está configurado para deploy automático no Vercel:

1. Acesse: https://vercel.com/new
2. Importe o repositório: `flowny-2026/venda-facil`
3. Adicione as variáveis de ambiente:
   ```
   VITE_SUPABASE_URL=sua_url_aqui
   VITE_SUPABASE_ANON_KEY=sua_key_aqui
   ```
4. Clique em **Deploy**

O `vercel.json` já está configurado para:
- Fazer build do admin-system
- Servir a landing page em `/`
- Servir o admin em `/admin`

## 🔧 Desenvolvimento Local

### Landing Page
Abra `public/index.html` diretamente no navegador.

### Sistema Admin
```bash
cd admin-system
npm install
npm run dev
```

Acesse: http://localhost:5180

## 📊 Funcionalidades

### Landing Page
- Apresentação do produto
- Formulário de contato
- Botão WhatsApp flutuante

### Sistema Admin
- 📊 Dashboard com métricas
- 💰 PDV (Ponto de Venda)
- 👥 Gestão de Vendedores
- 🛍️ Gestão de Clientes
- 📈 Relatório de Vendas
- 📋 Gestão de Leads
- ⚙️ Configurações

## 🔐 Segurança

- RLS (Row Level Security) ativo no Supabase
- Isolamento entre empresas
- Autenticação segura
- Variáveis de ambiente protegidas

## 📚 Documentação

- `DEPLOY_OPCAO_C.md` - Guia completo de deploy
- `COMANDOS_DEPLOY_RAPIDO.md` - Comandos rápidos
- `PASSO_A_PASSO_VISUAL.md` - Guia visual
- `ANALISE_PROJETO.md` - Análise da estrutura

## 🛠️ Tecnologias

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase
- **Deploy**: Vercel
- **Autenticação**: Supabase Auth

## 📝 Licença

MIT License

---

**Desenvolvido com ❤️ por VendaFácil**
