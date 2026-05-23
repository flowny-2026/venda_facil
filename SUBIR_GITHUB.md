# 🚀 Como Subir o Projeto no GitHub

## 📋 Pré-requisitos

1. Git instalado no seu computador
2. Conta no GitHub
3. Repositório criado: https://github.com/flowny-2026/venda_facil.git

## 🔧 Passo a Passo

### PASSO 1: Abrir Terminal na Pasta do Projeto

Abra o terminal (Git Bash, PowerShell ou CMD) na pasta raiz do projeto onde está o arquivo `.git` ou onde estão as pastas `admin-system`, `cliente-system`, etc.

### PASSO 2: Verificar Status do Git

```bash
git status
```

Se aparecer "fatal: not a git repository", execute:
```bash
git init
```

### PASSO 3: Adicionar Todos os Arquivos

```bash
git add .
```

### PASSO 4: Fazer o Commit

```bash
git commit -m "feat: sistema completo VendaFácil com clientes, vendedores e PDV"
```

### PASSO 5: Adicionar o Repositório Remoto

```bash
git remote add origin https://github.com/flowny-2026/venda_facil.git
```

Se já existir, remova e adicione novamente:
```bash
git remote remove origin
git remote add origin https://github.com/flowny-2026/venda_facil.git
```

### PASSO 6: Verificar Branch

```bash
git branch
```

Se não estiver em `main`, crie e mude para ela:
```bash
git branch -M main
```

### PASSO 7: Fazer o Push

```bash
git push -u origin main
```

Se pedir autenticação, use seu token do GitHub (não a senha).

### PASSO 8: Se der erro de "rejected"

Se o repositório já tiver commits, force o push:
```bash
git push -u origin main --force
```

⚠️ **ATENÇÃO**: `--force` sobrescreve o histórico remoto. Use apenas se tiver certeza!

## 🔐 Autenticação

### Opção 1: Token de Acesso Pessoal (Recomendado)

1. Acesse: https://github.com/settings/tokens
2. Clique em "Generate new token (classic)"
3. Marque: `repo` (acesso completo)
4. Clique em "Generate token"
5. Copie o token
6. Use o token como senha quando o Git pedir

### Opção 2: SSH

Se preferir SSH:
```bash
git remote set-url origin git@github.com:flowny-2026/venda_facil.git
```

## 📝 Comandos Resumidos

```bash
# 1. Inicializar (se necessário)
git init

# 2. Adicionar arquivos
git add .

# 3. Commit
git commit -m "feat: sistema completo VendaFácil"

# 4. Adicionar remote
git remote add origin https://github.com/flowny-2026/venda_facil.git

# 5. Branch main
git branch -M main

# 6. Push
git push -u origin main
```

## 🔍 Verificar se Funcionou

Acesse: https://github.com/flowny-2026/venda_facil

Você deve ver todos os arquivos do projeto!

## ⚠️ Arquivos Sensíveis

Antes de fazer o push, verifique se o `.gitignore` está configurado para ignorar:

- `.env` (credenciais do Supabase)
- `node_modules/`
- `dist/`
- Arquivos de build

## 🐛 Problemas Comuns

### Erro: "fatal: not a git repository"
**Solução**: Execute `git init`

### Erro: "rejected"
**Solução**: Execute `git pull origin main --rebase` ou `git push --force`

### Erro: "authentication failed"
**Solução**: Use token de acesso pessoal ao invés de senha

### Erro: "remote origin already exists"
**Solução**: Execute `git remote remove origin` e adicione novamente

## 📚 Próximos Commits

Depois do primeiro push, para enviar novas alterações:

```bash
git add .
git commit -m "descrição das mudanças"
git push
```

## 🎯 Estrutura do Repositório

Após o push, seu repositório terá:

```
venda_facil/
├── admin-system/          # Painel Admin
├── cliente-system/        # Painel Cliente
├── public/               # Landing Page
├── assets/               # Imagens e recursos
├── *.sql                 # Scripts SQL
├── *.md                  # Documentação
├── .gitignore
└── README.md
```

## ✅ Checklist Final

- [ ] Git instalado
- [ ] Repositório criado no GitHub
- [ ] Terminal aberto na pasta do projeto
- [ ] Arquivos adicionados (`git add .`)
- [ ] Commit feito (`git commit`)
- [ ] Remote adicionado (`git remote add`)
- [ ] Push realizado (`git push`)
- [ ] Verificado no GitHub

Pronto! Seu projeto está no GitHub! 🎉
