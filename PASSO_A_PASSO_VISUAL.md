# 👁️ Passo a Passo Visual - Deploy Vercel

## 📋 ANTES DE COMEÇAR

### ✅ Checklist Rápido
```bash
# 1. Verificar estrutura
ls public/index.html
ls public/assets/logo-final.png
ls admin-system/package.json
ls vercel.json

# 2. Verificar Git
git status
```

---

## 🚀 PASSO 1: GITHUB

### 1.1 Criar Repositório
1. Abra: https://github.com/new
2. Preencha:
   ```
   Repository name: venda-facil
   Description: Sistema PDV Completo - Landing Page + Admin
   ☐ Public
   ☐ NÃO marque "Add a README file"
   ☐ NÃO marque "Add .gitignore"
   ☐ NÃO marque "Choose a license"
   ```
3. Clique: **"Create repository"**

### 1.2 Enviar Código
```bash
# No terminal do seu projeto:

# Verificar status
git status

# Adicionar tudo
git add .

# Commit
git commit -m "feat: Deploy completo - Landing + Admin"

# Adicionar remote (SUBSTITUA SEU_USUARIO)
git remote add origin https://github.com/SEU_USUARIO/venda-facil.git

# Verificar
git remote -v

# Enviar
git branch -M main
git push -u origin main
```

**Se der erro de autenticação:**
1. GitHub → Settings → Developer settings
2. Personal access tokens → Tokens (classic)
3. Generate new token
4. Marcar: `repo` (todos os checkboxes)
5. Generate token
6. Copiar o token
7. Usar o token como senha no git push

---

## 🌐 PASSO 2: VERCEL

### 2.1 Login
1. Abra: https://vercel.com
2. Clique: **"Sign Up"** ou **"Login"**
3. Escolha: **"Continue with GitHub"**
4. Autorize o Vercel

### 2.2 Importar Projeto
1. Na dashboard do Vercel, clique: **"Add New..."**
2. Escolha: **"Project"**
3. Clique: **"Import Git Repository"**
4. Procure: `venda-facil`
5. Clique: **"Import"**

### 2.3 Configurar Projeto

**NÃO ALTERE NADA AINDA!**

Você verá uma tela com:
```
Configure Project
├── Project Name: venda-facil
├── Framework Preset: Other
├── Root Directory: ./
├── Build Command: [vazio]
└── Output Directory: [vazio]
```

**IMPORTANTE**: O Vercel vai usar o `vercel.json` automaticamente!

### 2.4 Adicionar Variáveis de Ambiente

1. Clique em: **"Environment Variables"** (expandir seção)
2. Adicione a primeira variável:
   ```
   Key:   VITE_SUPABASE_URL
   Value: https://cvmjjzhvdmpbxquxepue.supabase.co
   ```
   Clique: **"Add"**

3. Adicione a segunda variável:
   ```
   Key:   VITE_SUPABASE_ANON_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2bWpqemh2ZG1wYnhxdXhlcHVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNjUxMzQsImV4cCI6MjA4OTc0MTEzNH0.Kp_sWNFiQyBKvkEBFIp8Y5dQCYFP-WDDprCVM6wbqEg
   ```
   Clique: **"Add"**

### 2.5 Deploy
1. Clique: **"Deploy"**
2. Aguarde 2-5 minutos
3. Você verá:
   ```
   Building...
   ├── Installing dependencies
   ├── Building admin-system
   └── Deploying
   ```

### 2.6 Sucesso! 🎉
Quando terminar, você verá:
```
🎉 Congratulations!
Your project has been deployed.

https://venda-facil-xxx.vercel.app
```

---

## ✅ PASSO 3: TESTAR

### 3.1 Testar Landing Page
1. Copie a URL: `https://venda-facil-xxx.vercel.app`
2. Cole no navegador
3. Verifique:
   - [ ] Página carrega
   - [ ] Logo aparece
   - [ ] Scroll funciona
   - [ ] Botão "Começar Agora" funciona
   - [ ] Modal abre
   - [ ] Botão WhatsApp funciona

### 3.2 Testar Sistema Admin
1. Adicione `/admin` na URL: `https://venda-facil-xxx.vercel.app/admin`
2. Verifique:
   - [ ] Página de login carrega
   - [ ] Consegue fazer login
   - [ ] Dashboard aparece
   - [ ] Menu funciona
   - [ ] Rotas funcionam (/admin/pdv, /admin/vendedores)

---

## 🔧 PASSO 4: CONFIGURAR SUPABASE

### 4.1 Adicionar URL no Supabase
1. Abra: https://supabase.com/dashboard
2. Selecione o projeto: **responsabilidade_liz**
3. Vá em: **Authentication** (menu lateral)
4. Clique em: **URL Configuration**
5. Em **Site URL**, cole:
   ```
   https://venda-facil-xxx.vercel.app
   ```
   (substitua pela sua URL do Vercel)

6. Em **Redirect URLs**, adicione:
   ```
   https://venda-facil-xxx.vercel.app/**
   ```
   Clique: **"Add URL"**

7. Adicione outra:
   ```
   https://venda-facil-xxx.vercel.app/admin/**
   ```
   Clique: **"Add URL"**

8. Clique: **"Save"**

### 4.2 Testar Login Novamente
1. Volte para: `https://venda-facil-xxx.vercel.app/admin`
2. Faça login com: `edicharlesbrito2009@hotmail.com`
3. Deve funcionar perfeitamente! ✅

---

## 🎯 PASSO 5: DOMÍNIO CUSTOMIZADO (OPCIONAL)

### 5.1 Adicionar Domínio
1. No Vercel, vá em: **Settings** → **Domains**
2. Clique: **"Add"**
3. Digite seu domínio: `vendafacil.com.br`
4. Clique: **"Add"**

### 5.2 Configurar DNS
O Vercel vai mostrar os registros DNS:
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

Adicione esses registros no seu provedor de domínio (Registro.br, GoDaddy, etc.)

### 5.3 Aguardar Propagação
- Pode levar de 5 minutos a 48 horas
- Quando estiver pronto, você terá:
  ```
  https://vendafacil.com.br/        → Landing Page
  https://vendafacil.com.br/admin   → Sistema Admin
  ```

---

## 🔄 ATUALIZAÇÕES FUTURAS

### Como Atualizar o Site
```bash
# 1. Fazer alterações no código
# 2. Commit
git add .
git commit -m "fix: descrição da alteração"

# 3. Push
git push

# 4. Vercel faz deploy automático em 2-5 minutos!
```

---

## 🐛 PROBLEMAS COMUNS

### ❌ Landing page não carrega
**Sintoma**: Erro 404 ao acessar `/`

**Solução**:
```bash
# Verificar se existe
ls public/index.html

# Se não existir, copiar
cp landing-page.html public/index.html
git add public/
git commit -m "fix: adicionar landing page"
git push
```

### ❌ Logo não aparece
**Sintoma**: Imagem quebrada no topo

**Solução**:
```bash
# Verificar se existe
ls public/assets/logo-final.png

# Se não existir, copiar
cp assets/images/logo-final.png public/assets/
git add public/assets/
git commit -m "fix: adicionar logo"
git push
```

### ❌ Admin não carrega
**Sintoma**: Erro 404 ao acessar `/admin`

**Solução**:
1. Vercel Dashboard → Deployments
2. Clicar no último deployment
3. Ver logs de build
4. Procurar por erros

**Erro comum**: Falta de variáveis de ambiente
1. Settings → Environment Variables
2. Verificar se `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` existem
3. Se não, adicionar
4. Redeploy

### ❌ Login não funciona
**Sintoma**: Erro ao fazer login

**Solução**:
1. Verificar se URL do Vercel está no Supabase
2. Supabase → Authentication → URL Configuration
3. Adicionar URL do Vercel em **Redirect URLs**

---

## 📞 PRECISA DE AJUDA?

### Logs do Vercel
1. Vercel Dashboard
2. Deployments
3. Clicar no deployment
4. Ver logs completos

### Console do Navegador
1. Abrir site
2. Pressionar F12
3. Aba "Console"
4. Ver erros

### Supabase Logs
1. Supabase Dashboard
2. Logs & Analytics
3. Ver erros de autenticação

---

## ✅ CHECKLIST FINAL

- [ ] Código no GitHub
- [ ] Deploy no Vercel funcionando
- [ ] Landing page acessível
- [ ] Sistema admin acessível
- [ ] Login funcionando
- [ ] Todas as rotas funcionando
- [ ] URL do Vercel no Supabase
- [ ] Variáveis de ambiente configuradas

---

## 🎉 PRONTO!

Seu sistema está no ar! 🚀

**URLs:**
```
Landing: https://venda-facil-xxx.vercel.app/
Admin:   https://venda-facil-xxx.vercel.app/admin
```

**Próximos passos:**
1. Testar todas as funcionalidades
2. Compartilhar com clientes
3. Configurar domínio customizado (opcional)
4. Monitorar analytics

---

**Criado por**: Kiro AI  
**Data**: 27/04/2026  
**Status**: ✅ Guia Completo
