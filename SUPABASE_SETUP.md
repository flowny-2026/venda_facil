# 🚀 Guia Completo: Configuração do Supabase

Este guia te ajudará a configurar o Supabase para transformar seu dashboard em um sistema profissional com banco de dados real e autenticação.

## 📋 Pré-requisitos

- Conta no [Supabase](https://supabase.com) (gratuita)
- Projeto React funcionando

## 🎯 Passo a Passo

### 1. Criar Conta e Projeto

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Faça login com GitHub ou Google
4. Clique em "New Project"
5. Escolha:
   - **Name**: `dashboard-vendas`
   - **Database Password**: Crie uma senha forte
   - **Region**: South America (São Paulo)
6. Clique em "Create new project"

### 2. Configurar Banco de Dados

1. No painel do Supabase, vá em **SQL Editor**
2. Clique em "New query"
3. Cole e execute este código:

```sql
-- Criar tabela de vendas
CREATE TABLE sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  customer TEXT NOT NULL,
  email TEXT NOT NULL,
  category TEXT CHECK (category IN ('SaaS', 'Serviços', 'Hardware')) NOT NULL,
  status TEXT CHECK (status IN ('paid', 'pending', 'canceled')) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança (usuários só veem seus dados)
CREATE POLICY "Users can view own sales" ON sales
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sales" ON sales
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sales" ON sales
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sales" ON sales
  FOR DELETE USING (auth.uid() = user_id);
```

### 3. Pegar Credenciais

1. Vá em **Settings** → **API**
2. Copie:
   - **Project URL**: `https://seu-projeto.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

⚠️ **IMPORTANTE**: A chave anônima (anon public key) deve:
- Ter mais de 100 caracteres
- Começar com "eyJ"
- NÃO usar a "service_role key" (essa é secreta!)

🔍 **Como encontrar a chave correta**:
1. No painel do Supabase, vá em **Settings** (ícone de engrenagem)
2. Clique em **API** no menu lateral
3. Na seção "Project API keys", copie a chave **anon public**
4. Ela deve parecer com: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2bWpqemh2ZG1wYnhxdXhlcHVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk1NjI4NzEsImV4cCI6MjAyNTEzODg3MX0.exemplo...`

### 4. Configurar no Projeto

#### Opção A: Variáveis de Ambiente (Recomendado)

1. Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-aqui
```

#### Opção B: Interface do Dashboard

1. Vá em **Configurações** no seu dashboard
2. Role até "Configuração do Supabase"
3. Cole suas credenciais
4. Clique em "Salvar Configuração"

### 5. Habilitar Autenticação com Google (Opcional)

1. No Supabase, vá em **Authentication** → **Providers**
2. Clique em **Google**
3. Habilite o provider
4. Configure:
   - **Client ID**: Do Google Cloud Console
   - **Client Secret**: Do Google Cloud Console
5. Salve as configurações

## ✨ Funcionalidades Habilitadas

Após a configuração, seu dashboard terá:

- ✅ **Autenticação**: Login/cadastro seguro
- ✅ **Banco Real**: Dados salvos na nuvem
- ✅ **Multi-usuário**: Cada usuário vê apenas seus dados
- ✅ **Sincronização**: Dados atualizados em tempo real
- ✅ **Backup**: Dados seguros na nuvem
- ✅ **Escalabilidade**: Suporta milhares de usuários

## 🔧 Testando a Integração

1. Recarregue seu dashboard
2. Você verá uma tela de login
3. Crie uma conta ou faça login
4. Adicione algumas vendas
5. Os dados ficam salvos na nuvem!

## 🚨 Solução de Problemas

### Erro de Conexão
- Verifique se as credenciais estão corretas
- Confirme que o projeto Supabase está ativo

### Erro de Autenticação
- Verifique se executou o SQL corretamente
- Confirme que as políticas RLS estão ativas

### Dados não Aparecem
- Verifique se está logado
- Confirme que as políticas de segurança estão corretas

## 🎉 Próximos Passos

Com o Supabase configurado, você pode:

1. **Deploy**: Hospedar no Vercel/Netlify
2. **Domínio**: Configurar domínio personalizado
3. **Analytics**: Adicionar métricas avançadas
4. **Mobile**: Criar app React Native
5. **API**: Expor dados via API REST

## 💡 Dicas Importantes

- **Segurança**: Nunca exponha suas credenciais
- **Backup**: Exporte dados regularmente
- **Monitoramento**: Acompanhe uso no painel Supabase
- **Limites**: Plano gratuito tem limites (500MB, 50MB/mês)

---

🎯 **Resultado**: Dashboard profissional com banco de dados real, autenticação e multi-usuário!