# 🚀 Deploy no Vercel - Guia Completo

## 📋 Pré-requisitos

- [x] Conta no GitHub
- [x] Conta no Vercel (criar em https://vercel.com)
- [x] Projeto funcionando localmente
- [x] Supabase configurado

---

## 🎯 PASSO 1: Preparar o Projeto

### 1.1 Criar arquivo `.gitignore` (se não existir)

```bash
# Criar/atualizar .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
admin-system/node_modules/

# Build outputs
dist/
admin-system/dist/
build/
.next/

# Environment variables
.env
.env.local
.env.production
admin-system/.env
admin-system/.env.local

# Logs
*.log
npm-debug.log*

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Temporary files
*.tmp
.cache/
EOF
```

### 1.2 Verificar `package.json` do admin-system

Abra `admin-system/package.json` e verifique se tem os scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

### 1.3 Criar arquivo `vercel.json` na raiz do projeto

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
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/admin-system/dist/$1"
    }
  ]
}
```

---

## 🎯 PASSO 2: Subir para o GitHub

### 2.1 Inicializar Git (se ainda não fez)

```bash
# Verificar se já tem git
git status

# Se não tiver, inicializar
git init
git add .
git commit -m "Initial commit - VendaFácil Sistema Completo"
```

### 2.2 Criar repositório no GitHub

1. Acesse https://github.com/new
2. Nome do repositório: `venda-facil` (ou outro nome)
3. **NÃO** marque "Initialize with README"
4. Clique em **"Create repository"**

### 2.3 Conectar e enviar código

```bash
# Adicionar remote (substitua SEU_USUARIO pelo seu usuário do GitHub)
git remote add origin https://github.com/SEU_USUARIO/venda-facil.git

# Enviar código
git branch -M main
git push -u origin main
```

---

## 🎯 PASSO 3: Deploy no Vercel

### 3.1 Conectar GitHub ao Vercel

1. Acesse https://vercel.com
2. Clique em **"Add New Project"**
3. Clique em **"Import Git Repository"**
4. Selecione seu repositório `venda-facil`
5. Clique em **"Import"**

### 3.2 Configurar o Projeto

**Framework Preset**: Vite
**Root Directory**: `admin-system`
**Build Command**: `npm run build`
**Output Directory**: `dist`

### 3.3 Adicionar Variáveis de Ambiente

Na seção **"Environment Variables"**, adicione:

```
VITE_SUPABASE_URL=https://cvmjjzhvdmpbxquxepue.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2bWpqemh2ZG1wYnhxdXhlcHVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNjUxMzQsImV4cCI6MjA4OTc0MTEzNH0.Kp_sWNFiQyBKvkEBFIp8Y5dQCYFP-WDDprCVM6wbqEg
```

### 3.4 Deploy

Clique em **"Deploy"** e aguarde (2-5 minutos)

---

## 🎯 PASSO 4: Configurar Domínio (Opcional)

### 4.1 Domínio Vercel (Grátis)

Seu projeto estará disponível em:
```
https://venda-facil.vercel.app
```

### 4.2 Domínio Customizado (Opcional)

1. No painel do Vercel, vá em **"Settings"** → **"Domains"**
2. Adicione seu domínio (ex: `vendafacil.com.br`)
3. Configure os DNS conforme instruções do Vercel

---

## 🎯 PASSO 5: Configurar Supabase para Produção

### 5.1 Adicionar URL do Vercel no Supabase

1. Acesse https://supabase.com/dashboard
2. Vá em **"Authentication"** → **"URL Configuration"**
3. Adicione em **"Site URL"**:
   ```
   https://venda-facil.vercel.app
   ```
4. Adicione em **"Redirect URLs"**:
   ```
   https://venda-facil.vercel.app/**
   ```

### 5.2 Configurar CORS (se necessário)

No SQL Editor do Supabase:

```sql
-- Permitir requisições do Vercel
-- (Geralmente não é necessário, mas se der erro de CORS)
```

---

## 🎯 PASSO 6: Testar Produção

### 6.1 Acessar o site

```
https://venda-facil.vercel.app
```

### 6.2 Testar funcionalidades

- [ ] Login funciona
- [ ] Criar empresa funciona
- [ ] Cadastrar vendedores funciona
- [ ] Criar login para vendedor funciona
- [ ] Dados aparecem corretamente
- [ ] RLS está funcionando (empresas isoladas)

---

## 🔧 TROUBLESHOOTING

### Erro: "Build failed"

**Solução 1**: Verificar se `admin-system/package.json` tem o script `build`

```json
"scripts": {
  "build": "tsc && vite build"
}
```

**Solução 2**: Verificar se todas as dependências estão no `package.json`

```bash
cd admin-system
npm install
```

### Erro: "Environment variables not found"

**Solução**: Adicionar variáveis no Vercel:
1. Settings → Environment Variables
2. Adicionar `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
3. Fazer redeploy

### Erro: "404 Not Found"

**Solução**: Criar arquivo `admin-system/vercel.json`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Erro: "Supabase connection failed"

**Solução**: Verificar se as variáveis de ambiente estão corretas:
1. Vercel Dashboard → Settings → Environment Variables
2. Verificar `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
3. Fazer redeploy

---

## 📱 DEPLOY DA LANDING PAGE

### Opção 1: GitHub Pages (Grátis)

1. Criar repositório `venda_facil` no GitHub
2. Fazer push do arquivo `landing-page.html`
3. Settings → Pages → Source: main branch
4. URL: `https://SEU_USUARIO.github.io/venda_facil/landing-page.html`

### Opção 2: Vercel (Grátis)

1. Criar pasta `landing` na raiz
2. Mover `landing-page.html` para `landing/index.html`
3. Mover `landing-page-fixed.js` para `landing/`
4. Deploy separado no Vercel

---

## 🎨 CUSTOMIZAÇÕES PÓS-DEPLOY

### Alterar nome do projeto

1. Vercel Dashboard → Settings → General
2. Project Name: `venda-facil`
3. Salvar

### Configurar Analytics

1. Vercel Dashboard → Analytics
2. Ativar Analytics (grátis)

### Configurar Logs

1. Vercel Dashboard → Logs
2. Ver logs de build e runtime

---

## 📊 MONITORAMENTO

### Vercel Analytics

- Visitas
- Performance
- Erros

### Supabase Dashboard

- Usuários ativos
- Requisições
- Erros de banco

---

## 🔄 ATUALIZAÇÕES FUTURAS

### Deploy automático

Toda vez que você fizer `git push`, o Vercel faz deploy automaticamente!

```bash
# Fazer alterações no código
git add .
git commit -m "Descrição da alteração"
git push

# Vercel faz deploy automático em 2-5 minutos
```

### Rollback (voltar versão anterior)

1. Vercel Dashboard → Deployments
2. Encontrar versão anterior
3. Clicar nos 3 pontos → Promote to Production

---

## ✅ CHECKLIST FINAL

- [ ] Código no GitHub
- [ ] Deploy no Vercel funcionando
- [ ] Variáveis de ambiente configuradas
- [ ] URL do Vercel adicionada no Supabase
- [ ] Login funcionando em produção
- [ ] RLS funcionando (empresas isoladas)
- [ ] Landing page funcionando
- [ ] Domínio customizado (opcional)

---

## 🎉 PRONTO!

Seu sistema está no ar em:
```
https://venda-facil.vercel.app
```

**Próximos passos**:
1. Compartilhar link com clientes
2. Monitorar analytics
3. Fazer melhorias baseadas no feedback

---

## 📞 SUPORTE

**Vercel**: https://vercel.com/support
**Supabase**: https://supabase.com/support
**GitHub**: https://github.com/support

---

**Criado por**: Kiro AI  
**Data**: 25/04/2026  
**Status**: ✅ Pronto para Deploy
