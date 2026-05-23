# 🔧 Corrigir: Leads Não Aparecem no Painel Admin

## 🚨 Problema

No painel admin, a página de Leads está vazia mesmo após enviar formulários pela landing page.

---

## 🔍 Possíveis Causas

### 1. **Tabela `landing_leads` não existe**
- A tabela pode não ter sido criada no banco de dados

### 2. **RLS bloqueando acesso**
- Row Level Security pode estar impedindo o admin de ver os leads

### 3. **Leads não estão sendo salvos**
- O formulário da landing page pode não estar salvando corretamente

### 4. **Admin não tem permissão**
- Políticas RLS podem estar bloqueando usuários autenticados

---

## ✅ Solução Passo a Passo

### PASSO 1: Verificar se a Tabela Existe

Execute no Supabase SQL Editor:

```sql
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'landing_leads'
);
```

**Resultado esperado:** `true`

**Se retornar `false`**, a tabela não existe. Execute:

```sql
CREATE TABLE landing_leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    business_type TEXT,
    message TEXT,
    status TEXT DEFAULT 'novo' CHECK (status IN ('novo', 'contatado', 'convertido', 'descartado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para melhor performance
CREATE INDEX idx_landing_leads_status ON landing_leads(status);
CREATE INDEX idx_landing_leads_created_at ON landing_leads(created_at DESC);
```

---

### PASSO 2: Verificar RLS

Execute:

```sql
SELECT 
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'landing_leads';
```

**Se `rowsecurity = true`**, o RLS está habilitado e pode estar bloqueando.

**Solução:** Desabilitar RLS ou criar política permissiva:

```sql
-- Opção 1: Desabilitar RLS (mais simples)
ALTER TABLE landing_leads DISABLE ROW LEVEL SECURITY;

-- Opção 2: Criar política que permite tudo (mais seguro)
ALTER TABLE landing_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY landing_leads_admin_all ON landing_leads
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Permitir INSERT público (para landing page)
CREATE POLICY landing_leads_public_insert ON landing_leads
FOR INSERT
TO anon
WITH CHECK (true);
```

---

### PASSO 3: Inserir Lead de Teste

Para verificar se está funcionando:

```sql
INSERT INTO landing_leads (
    company_name,
    contact_name,
    contact_email,
    contact_phone,
    business_type,
    message,
    status
) VALUES (
    'Empresa Teste',
    'João Silva',
    'joao@teste.com',
    '(16) 99999-9999',
    'varejo',
    'Gostaria de conhecer o sistema',
    'novo'
);
```

Depois, recarregue a página de Leads no painel admin.

---

### PASSO 4: Verificar se Leads Existem

```sql
SELECT 
    id,
    company_name,
    contact_name,
    contact_email,
    status,
    created_at
FROM landing_leads
ORDER BY created_at DESC;
```

**Se retornar vazio:** Nenhum lead foi cadastrado ainda.

**Se retornar dados:** Os leads existem, mas o painel não está mostrando (problema de RLS).

---

### PASSO 5: Testar Landing Page

1. Abra a landing page: `http://localhost:5173` (ou sua URL)
2. Role até o formulário de contato
3. Preencha todos os campos
4. Clique em "Enviar"
5. Deve aparecer mensagem de sucesso

Depois, verifique no banco:

```sql
SELECT * FROM landing_leads ORDER BY created_at DESC LIMIT 1;
```

---

## 🎯 Script Completo de Correção

Execute este script no Supabase SQL Editor:

```sql
-- 1. Criar tabela se não existir
CREATE TABLE IF NOT EXISTS landing_leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    business_type TEXT,
    message TEXT,
    status TEXT DEFAULT 'novo' CHECK (status IN ('novo', 'contatado', 'convertido', 'descartado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Desabilitar RLS (mais simples)
ALTER TABLE landing_leads DISABLE ROW LEVEL SECURITY;

-- 3. Inserir lead de teste
INSERT INTO landing_leads (
    company_name,
    contact_name,
    contact_email,
    contact_phone,
    business_type,
    message,
    status
) VALUES (
    'Empresa Teste',
    'João Silva',
    'joao@teste.com',
    '(16) 99999-9999',
    'varejo',
    'Gostaria de conhecer o sistema',
    'novo'
);

-- 4. Verificar
SELECT * FROM landing_leads ORDER BY created_at DESC;
```

---

## 🧪 Teste Final

1. ✅ Execute o script acima
2. ✅ Abra o painel admin
3. ✅ Vá em "Leads"
4. ✅ Deve aparecer pelo menos 1 lead (o de teste)
5. ✅ Clique em "Ver detalhes" (ícone de olho)
6. ✅ Deve abrir modal com informações do lead

---

## 📊 Diagnóstico Rápido

Execute o arquivo **`VERIFICAR_LEADS.sql`** no Supabase SQL Editor.

Ele vai mostrar:
- ✅ Se a tabela existe
- ✅ Estrutura da tabela
- ✅ Todos os leads cadastrados
- ✅ Políticas RLS ativas
- ✅ Se RLS está habilitado

---

## 💡 Prevenção

Para evitar esse problema no futuro:

1. ✅ **Sempre desabilite RLS** em tabelas públicas (landing_leads)
2. ✅ **Teste o formulário** após cada deploy
3. ✅ **Monitore os leads** regularmente
4. ✅ **Configure alertas** para novos leads (email/webhook)

---

## 📞 Suporte

Se após seguir todos os passos o problema persistir:

1. Execute `VERIFICAR_LEADS.sql`
2. Copie todos os resultados
3. Envie para análise

---

## 🎯 Resumo Rápido

**Problema:** Leads não aparecem no painel admin  
**Causa Provável:** RLS bloqueando ou tabela não existe  
**Solução:** Execute o script completo de correção  
**Teste:** Insira lead de teste e verifique no painel
