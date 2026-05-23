# 🚀 Deploy na Vercel - VendaFácil

## 📋 Pré-requisitos

1. Conta na Vercel (https://vercel.com)
2. Projeto no GitHub (✅ já feito!)
3. Credenciais do Supabase

## 🎯 Vamos Hospedar 2 Projetos

1. **Admin System** → `admin.vendafacil.com` (ou subdomínio da Vercel)
2. **Cliente System** → `app.vendafacil.com` (ou subdomínio da Vercel)

## 🔧 PASSO 1: Fazer Commit dos Arquivos de Configuração

```bash
git add .
git commit -m "feat: adicionar configuração Vercel"
git push
```

## 🚀 PASSO 2: Deploy do Admin System

### 2.1 - Acessar Vercel
1. Acesse: https://vercel.com
2. Faça login com GitHub
3. Clique em "Add New Project"

### 2.2 - Importar Repositório
1. Selecione: `flowny-2026/venda_facil`
2. Clique em "Import"

### 2.3 - Configurar Projeto Admin
```
Project Name: vendafacil-admin
Framework Preset: Vite
Root Directory: admin-system
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 2.4 - Variáveis de Ambiente
Clique em "Environment Variables" e adicione:

```
VITE_SUPABASE_URL=https://cvmjjzhvdmpbxquxepue.supabase.co
VITE_SUPABASE_ANON_KEY=seu_anon_key_aqui
```

**Como pegar o ANON_KEY:**
1. Acesse: https://supabase.com/dashboard/project/cvmjjzhvdmpbxquxepue/settings/api
2. Copie o "anon public" key

### 2.5 - Deploy
1. Clique em "Deploy"
2. Aguarde o build (2-3 minutos)
3. ✅ Admin estará em: `https://vendafacil-admin.vercel.app`

## 🚀 PASSO 3: Deploy do Cliente System

### 3.1 - Adicionar Novo Projeto
1. Na Vercel, clique em "Add New Project"
2. Selecione: `flowny-2026/venda_facil` novamente

### 3.2 - Configurar Projeto Cliente
```
Project Name: vendafacil-app
Framework Preset: Vite
Root Directory: cliente-system
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 3.3 - Variáveis de Ambiente
```
VITE_SUPABASE_URL=https://cvmjjzhvdmpbxquxepue.supabase.co
VITE_SUPABASE_ANON_KEY=seu_anon_key_aqui
```

### 3.4 - Deploy
1. Clique em "Deploy"
2. Aguarde o build (2-3 minutos)
3. ✅ Cliente estará em: `https://vendafacil-app.vercel.app`

## 🌐 PASSO 4: Configurar Domínios Personalizados (Opcional)

### Se você tiver um domínio próprio:

**Para Admin:**
1. Vá em Settings → Domains
2. Adicione: `admin.seudominio.com`
3. Configure DNS conforme instruções

**Para Cliente:**
1. Vá em Settings → Domains
2. Adicione: `app.seudominio.com`
3. Configure DNS conforme instruções

## 🔐 PASSO 5: Configurar Supabase

### Adicionar URLs permitidas no Supabase:

1. Acesse: https://supabase.com/dashboard/project/cvmjjzhvdmpbxquxepue/auth/url-configuration
2. Em "Site URL", adicione a URL do cliente
3. Em "Redirect URLs", adicione:
   ```
   https://vendafacil-admin.vercel.app
   https://vendafacil-app.vercel.app
   https://vendafacil-admin.vercel.app/reset-password
   https://vendafacil-app.vercel.app/reset-password
   ```

## ✅ PASSO 6: Testar

### Testar Admin:
1. Acesse: `https://vendafacil-admin.vercel.app`
2. Faça login com: `edicharlesbrito2009@hotmail.com`
3. ✅ Deve funcionar!

### Testar Cliente:
1. Acesse: `https://vendafacil-app.vercel.app`
2. Faça login com qualquer gerente/vendedor
3. ✅ Deve funcionar!

## 🔄 PASSO 7: Atualizações Automáticas

Agora, sempre que você fizer push no GitHub:
```bash
git add .
git commit -m "feat: nova funcionalidade"
git push
```

A Vercel vai fazer deploy automático! 🎉

## 📊 Monitoramento

### Ver Logs:
1. Acesse o projeto na Vercel
2. Clique em "Deployments"
3. Clique no deployment
4. Veja os logs

### Ver Analytics:
1. Acesse o projeto na Vercel
2. Clique em "Analytics"
3. Veja visitantes, performance, etc.

## 🐛 Problemas Comuns

### Erro: "Build failed"
**Solução**: Verifique os logs e veja qual dependência faltou

### Erro: "Module not found"
**Solução**: Verifique se todas as dependências estão no `package.json`

### Erro: "Environment variable not found"
**Solução**: Adicione as variáveis de ambiente no painel da Vercel

### Erro: "404 ao recarregar página"
**Solução**: O `vercel.json` já está configurado para resolver isso

## 📝 Comandos Úteis

### Instalar Vercel CLI (opcional):
```bash
npm install -g vercel
```

### Deploy via CLI:
```bash
cd admin-system
vercel

cd ../cliente-system
vercel
```

## 🎯 URLs Finais

Após o deploy, você terá:

- **Admin**: `https://vendafacil-admin.vercel.app`
- **Cliente**: `https://vendafacil-app.vercel.app`
- **Landing Page**: Pode hospedar a pasta `public` separadamente

## 🔒 Segurança

### Variáveis de Ambiente:
- ✅ Nunca commite arquivos `.env`
- ✅ Use variáveis de ambiente na Vercel
- ✅ Mantenha o ANON_KEY seguro

### RLS (Row Level Security):
- ✅ Já está configurado no Supabase
- ✅ Cada empresa vê apenas seus dados
- ✅ Isolamento total

## 📚 Documentação

- Vercel: https://vercel.com/docs
- Vite: https://vitejs.dev/guide/
- Supabase: https://supabase.com/docs

## ✨ Pronto!

Seu sistema está no ar! 🎉

Agora você pode:
- ✅ Acessar de qualquer lugar
- ✅ Compartilhar com clientes
- ✅ Fazer atualizações automáticas
- ✅ Monitorar performance

Precisa de ajuda? Me avise! 😊
