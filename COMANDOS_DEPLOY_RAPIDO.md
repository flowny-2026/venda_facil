# ⚡ Comandos Deploy Rápido - Opção C

## 🚀 DEPLOY COMPLETO (Landing + Admin)

### 1. Verificar Estrutura
```bash
# Verificar se tudo está no lugar
ls public/
ls admin-system/
cat vercel.json
```

### 2. Commit e Push
```bash
# Status
git status

# Adicionar tudo
git add .

# Commit
git commit -m "feat: Deploy completo - Landing + Admin"

# Push
git push origin main
```

### 3. Criar Repositório GitHub (se ainda não existe)
```bash
# No terminal
git remote add origin https://github.com/SEU_USUARIO/venda-facil.git
git branch -M main
git push -u origin main
```

### 4. Deploy no Vercel
1. https://vercel.com → Login com GitHub
2. **Add New Project** → Importar `venda-facil`
3. **Configurações**:
   - Framework: Vite
   - Root Directory: `admin-system`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Environment Variables**:
   ```
   VITE_SUPABASE_URL=https://cvmjjzhvdmpbxquxepue.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2bWpqemh2ZG1wYnhxdXhlcHVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNjUxMzQsImV4cCI6MjA4OTc0MTEzNH0.Kp_sWNFiQyBKvkEBFIp8Y5dQCYFP-WDDprCVM6wbqEg
   ```
5. **Deploy**

---

## ✅ TESTAR APÓS DEPLOY

### Landing Page
```
https://seu-projeto.vercel.app/
```
- [ ] Página carrega
- [ ] Logo aparece
- [ ] Botão "Começar Agora" funciona
- [ ] Modal abre
- [ ] Botão WhatsApp funciona

### Sistema Admin
```
https://seu-projeto.vercel.app/admin
```
- [ ] Login carrega
- [ ] Login funciona
- [ ] Dashboard aparece
- [ ] Rotas funcionam

---

## 🔧 CONFIGURAR SUPABASE

1. https://supabase.com/dashboard
2. **Authentication** → **URL Configuration**
3. **Site URL**: `https://seu-projeto.vercel.app`
4. **Redirect URLs**: 
   ```
   https://seu-projeto.vercel.app/**
   https://seu-projeto.vercel.app/admin/**
   ```

---

## 🔄 ATUALIZAÇÕES FUTURAS

```bash
# Fazer alterações no código
git add .
git commit -m "fix: descrição da alteração"
git push

# Vercel faz deploy automático!
```

---

## 🐛 TROUBLESHOOTING

### Landing não carrega
```bash
# Verificar estrutura
ls public/
ls public/assets/

# Deve ter:
# public/index.html
# public/assets/logo-final.png
```

### Admin não carrega
```bash
# Verificar build local
cd admin-system
npm install
npm run build

# Deve criar pasta dist/
ls dist/
```

### Variáveis não funcionam
1. Vercel → Settings → Environment Variables
2. Adicionar `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
3. Redeploy

---

**Última atualização**: 27/04/2026  
**Status**: ✅ Pronto para Deploy
