# 🚀 Estrutura do Deploy - Git + Vercel

## 📁 ESTRUTURA ATUAL DO PROJETO

```
📁 Seu Projeto/
├── 📄 landing-page.html          ← Landing page (raiz)
├── 📁 assets/                    ← Imagens da landing
├── 📁 admin-system/              ← Sistema admin
│   ├── 📁 src/
│   ├── 📁 public/
│   ├── 📄 index.html
│   └── 📄 package.json
├── 📁 src/                       ← Sistema cliente (React)
├── 📄 .env                       ← Variáveis (NÃO vai pro Git)
├── 📄 .env.example               ← Exemplo (vai pro Git)
├── 📄 vercel.json                ← Config Vercel
├── 📄 package.json
└── 📄 README.md
```

---

## 🌐 COMO FICARÁ NO VERCEL

### Opção 1: Deploy Atual (Sistema Admin)

Com a configuração atual do `vercel.json`:

```json
{
  "buildCommand": "cd admin-system && npm install && npm run build",
  "outputDirectory": "admin-system/dist"
}
```

**URLs resultantes:**
```
https://seu-projeto.vercel.app/              → Sistema Admin (React)
https://seu-projeto.vercel.app/dashboard     → Dashboard
https://seu-projeto.vercel.app/pdv           → PDV
https://seu-projeto.vercel.app/vendedores    → Vendedores
```

**❌ Problema**: Landing page (`landing-page.html`) **NÃO estará acessível**!

---

### Opção 2: Deploy Recomendado (2 Projetos Separados)

#### 🎯 SOLUÇÃO IDEAL: 2 Deploys Separados

**Deploy 1: Landing Page**
```
Repositório: venda-facil-landing
URL: https://vendafacil.vercel.app
Arquivos: landing-page.html, assets/
```

**Deploy 2: Sistema Admin**
```
Repositório: venda-facil-admin
URL: https://admin.vendafacil.vercel.app
Arquivos: admin-system/
```

**✅ Vantagens:**
- URLs limpas e profissionais
- Deploys independentes
- Mais fácil de gerenciar
- Melhor performance

---

### Opção 3: Deploy Único com Subpastas

Modificar `vercel.json` para servir ambos:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "admin-system/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "admin-system/dist"
      }
    },
    {
      "src": "landing-page.html",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/landing",
      "dest": "/landing-page.html"
    },
    {
      "src": "/(.*)",
      "dest": "/admin-system/dist/$1"
    }
  ]
}
```

**URLs resultantes:**
```
https://seu-projeto.vercel.app/              → Sistema Admin
https://seu-projeto.vercel.app/landing       → Landing Page
```

**⚠️ Problema**: URL da landing não é profissional

---

## 🎯 RECOMENDAÇÃO: ESTRUTURA IDEAL

### Reorganizar o Projeto

```
📁 venda-facil/
├── 📁 landing/                   ← Landing Page
│   ├── 📄 index.html            (renomear landing-page.html)
│   ├── 📁 assets/
│   └── 📄 vercel.json
│
└── 📁 admin/                     ← Sistema Admin
    ├── 📁 src/
    ├── 📁 public/
    ├── 📄 index.html
    ├── 📄 package.json
    └── 📄 vercel.json
```

**Deploy:**
- Landing: Deploy da pasta `landing/`
- Admin: Deploy da pasta `admin/`

**URLs:**
```
https://vendafacil.com.br/           → Landing Page
https://app.vendafacil.com.br/       → Sistema Admin
```

---

## 📋 PASSO A PASSO RECOMENDADO

### Opção A: Manter Estrutura Atual (Mais Rápido)

1. **Fazer 1 deploy** apenas do sistema admin
2. **Landing page** hospedar no GitHub Pages (grátis)

**Resultado:**
```
https://seu-usuario.github.io/venda-facil/   → Landing Page (GitHub Pages)
https://venda-facil.vercel.app/              → Sistema Admin (Vercel)
```

**Vantagens:**
- ✅ Rápido de fazer
- ✅ Ambos funcionando
- ✅ 100% grátis
- ✅ Não precisa reorganizar arquivos

---

### Opção B: Reorganizar (Mais Profissional)

1. **Criar 2 repositórios** no GitHub:
   - `venda-facil-landing`
   - `venda-facil-admin`

2. **Fazer 2 deploys** no Vercel

3. **Configurar domínios** customizados (opcional)

**Resultado:**
```
https://vendafacil.vercel.app/       → Landing Page
https://admin-vendafacil.vercel.app/ → Sistema Admin
```

**Vantagens:**
- ✅ URLs profissionais
- ✅ Projetos separados
- ✅ Fácil de gerenciar
- ✅ Melhor para escalar

---

## 🚀 QUAL ESCOLHER?

### Para Começar Rápido (Recomendado):
**Opção A** - Landing no GitHub Pages + Admin no Vercel

### Para Produção Profissional:
**Opção B** - 2 repositórios separados no Vercel

---

## 📝 COMANDOS PARA OPÇÃO A (RÁPIDO)

### 1. Deploy do Admin no Vercel

```bash
# Fazer commit
git add .
git commit -m "Deploy: Sistema Admin"
git push

# No Vercel:
# - Root Directory: admin-system
# - Build Command: npm run build
# - Output Directory: dist
```

### 2. Landing Page no GitHub Pages

```bash
# Criar pasta docs
mkdir docs
cp landing-page.html docs/index.html
cp -r assets docs/

# Commit
git add docs/
git commit -m "Add: Landing page para GitHub Pages"
git push

# No GitHub:
# Settings → Pages → Source: main branch → /docs
```

**URLs finais:**
```
Landing: https://seu-usuario.github.io/venda-facil/
Admin:   https://venda-facil.vercel.app/
```

---

## ❓ QUAL VOCÊ PREFERE?

**Opção A**: Rápido (GitHub Pages + Vercel)
**Opção B**: Profissional (2 Vercel separados)
**Opção C**: Tudo junto (1 Vercel com rotas)

Me diga qual você quer e eu te ajudo a configurar! 🚀
