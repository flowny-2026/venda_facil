# 🚨 GUIA URGENTE: Corrigir Vulnerabilidades de Segurança

## ⚠️ ATENÇÃO: EXECUTE IMEDIATAMENTE!

O Supabase detectou **2 vulnerabilidades críticas** que podem expor seus dados!

---

## 🔴 Problemas Detectados

### 1. **User data exposed through a view**
- **Risco**: Dados pessoais dos usuários expostos publicamente
- **Impacto**: Qualquer pessoa pode ver emails, nomes, etc.
- **Código**: `auth_users_exposed`

### 2. **Table publicly accessible**
- **Risco**: Tabelas sem proteção RLS
- **Impacto**: Qualquer pessoa pode ler, editar e deletar dados
- **Código**: `rls_disabled_in_public`

---

## ✅ SOLUÇÃO (5 minutos)

### **Passo 1: Abrir Supabase**

1. Acesse: https://supabase.com/dashboard
2. Selecione o projeto: **lojas_liz** (cvmjjzhvdmpbxquxepue)
3. Clique em **SQL Editor** (ícone de banco de dados no menu lateral)

### **Passo 2: Executar Script de Correção**

1. Clique em **"New Query"**
2. Abra o arquivo: `CORRIGIR_SEGURANCA_URGENTE.sql`
3. **Copie TODO o conteúdo** do arquivo
4. **Cole** no SQL Editor do Supabase
5. Clique em **"Run"** (ou pressione Ctrl+Enter)

### **Passo 3: Verificar Sucesso**

Você deve ver mensagens como:
```
✅ Segurança corrigida com sucesso!
✅ RLS ativado em todas as tabelas
✅ Políticas de segurança criadas
```

### **Passo 4: Resolver no Dashboard**

1. Volte para o email do Supabase
2. Clique em **"Resolve issue"** em cada problema
3. Confirme que os problemas foram resolvidos

---

## 🔒 O Que o Script Faz

### 1. **Remove View Perigosa**
```sql
DROP VIEW IF EXISTS auth_users_exposed;
```
- Deleta a view que expõe dados de usuários

### 2. **Ativa RLS em Todas as Tabelas**
```sql
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
-- ... e todas as outras
```
- Ativa proteção em todas as tabelas

### 3. **Cria Políticas de Segurança**
```sql
CREATE POLICY "Users can view their company products"
ON products FOR SELECT
USING (
    company_id IN (
        SELECT company_id FROM company_users 
        WHERE user_id = auth.uid()
    )
);
```
- Cada empresa vê apenas seus próprios dados
- Isolamento total entre empresas

---

## 🛡️ Proteções Aplicadas

### **Antes (INSEGURO)**
```
❌ Qualquer pessoa pode acessar:
   - Dados de todas as empresas
   - Produtos de todos
   - Vendas de todos
   - Informações de usuários
```

### **Depois (SEGURO)**
```
✅ Cada empresa vê apenas:
   - Seus próprios produtos
   - Suas próprias vendas
   - Seus próprios vendedores
   - Seus próprios dados

✅ Usuários não autenticados:
   - NÃO podem acessar nada
   - Exceto formulário de leads (intencional)
```

---

## 📋 Checklist de Verificação

Após executar o script, verifique:

- [ ] Script executou sem erros
- [ ] Mensagem "✅ Segurança corrigida" apareceu
- [ ] Email do Supabase: cliquei em "Resolve issue"
- [ ] Testei fazer login no sistema
- [ ] Sistema continua funcionando normalmente
- [ ] Não consigo ver dados de outras empresas

---

## 🧪 Como Testar

### Teste 1: Isolamento de Dados
1. Faça login com empresa A
2. Vá no PDV
3. Veja os produtos
4. Faça logout
5. Faça login com empresa B
6. Vá no PDV
7. **Verifique**: Produtos da empresa A NÃO aparecem ✅

### Teste 2: Acesso Não Autorizado
1. Abra o navegador em modo anônimo
2. Tente acessar: `https://seu-projeto.supabase.co/rest/v1/products`
3. **Resultado esperado**: Erro 401 (Não autorizado) ✅

---

## ⚠️ Problemas Comuns

### Problema: "Script deu erro"
**Solução:**
- Copie o script novamente
- Certifique-se de copiar TODO o conteúdo
- Execute linha por linha se necessário

### Problema: "Sistema parou de funcionar"
**Solução:**
- Faça logout
- Faça login novamente
- Limpe o cache do navegador (Ctrl+Shift+Delete)

### Problema: "Ainda vejo o alerta no email"
**Solução:**
- Aguarde 5-10 minutos
- Clique em "Resolve issue" manualmente
- Supabase pode demorar para atualizar

---

## 📊 Verificação Técnica

Execute este SQL para verificar se RLS está ativo:

```sql
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Resultado esperado:**
```
tablename          | rls_enabled
-------------------|------------
companies          | true
company_users      | true
payment_methods    | true
products           | true
sales              | true
sellers            | true
landing_leads      | false  ← Único que deve ser false
```

---

## 🎯 Resumo

**O que você precisa fazer:**
1. ✅ Abrir Supabase SQL Editor
2. ✅ Copiar e colar o script `CORRIGIR_SEGURANCA_URGENTE.sql`
3. ✅ Clicar em "Run"
4. ✅ Clicar em "Resolve issue" no email
5. ✅ Testar o sistema

**Tempo estimado:** 5 minutos  
**Dificuldade:** Fácil (só copiar e colar)  
**Impacto:** CRÍTICO (protege todos os seus dados)

---

## 🆘 Precisa de Ajuda?

Se tiver qualquer problema:
1. Tire um print do erro
2. Me envie
3. Vou te ajudar a resolver

---

**⚠️ NÃO IGNORE ESTE ALERTA!**  
**Seus dados estão em risco até você executar este script!**

---

**Commit**: `b1969c8`  
**Data**: 30/04/2026  
**Prioridade**: 🔴 URGENTE
