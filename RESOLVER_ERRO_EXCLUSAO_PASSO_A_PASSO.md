# 🚨 RESOLVER ERRO DE EXCLUSÃO - PASSO A PASSO

## 🔍 PROBLEMA IDENTIFICADO

O erro é uma **violação de chave estrangeira**:
```
update or delete on table "sellers" violates foreign key constraint "fk_seller" on table "company_users"
```

Isso significa que há uma **referência circular** entre as tabelas `sellers` e `company_users`.

## 🛠️ SOLUÇÃO IMEDIATA

### PASSO 1: Acessar o Supabase
1. Vá para: https://supabase.com/dashboard
2. Entre no projeto: **responsabilidade_liz**
3. Clique em **SQL Editor** (no menu lateral)

### PASSO 2: Executar a Correção
1. Copie TODO o conteúdo do arquivo `EXECUTAR_NO_SUPABASE_URGENTE.sql`
2. Cole no SQL Editor do Supabase
3. Clique em **RUN** (ou pressione Ctrl+Enter)

### PASSO 3: Testar a Função
Execute este comando no SQL Editor:
```sql
SELECT delete_company_cascade('lojaabcd');
```

### PASSO 4: Verificar se Funcionou
Execute este comando:
```sql
SELECT name, email FROM companies WHERE name = 'lojaabcd';
```
- Se retornar **vazio** = ✅ Funcionou!
- Se retornar a empresa = ❌ Ainda há problema

## 🔄 DEPOIS DE CORRIGIR NO BANCO

### PASSO 5: Testar no Painel Admin
1. Vá para: http://localhost:5173
2. Faça login como admin
3. Vá em "Gerenciar Clientes"
4. Tente excluir uma empresa de teste

## 🎯 CAUSA DO PROBLEMA

A função `delete_company_cascade` original não estava respeitando a ordem correta de exclusão:

**❌ ORDEM ERRADA (causava erro):**
1. Deletar sellers
2. Deletar company_users
3. Deletar companies

**✅ ORDEM CORRETA (nova função):**
1. Deletar sales (vendas)
2. Deletar products (produtos)  
3. Deletar payment_methods (formas de pagamento)
4. Quebrar referência circular (seller_id = NULL)
5. Deletar sellers (vendedores)
6. Deletar company_users (usuários)
7. Deletar companies (empresa)

## 📋 CHECKLIST

- [ ] Executei o SQL no Supabase
- [ ] Testei a função com `SELECT delete_company_cascade('lojaabcd')`
- [ ] Verifiquei que a empresa sumiu
- [ ] Testei no painel admin
- [ ] Exclusão funciona sem erro

## 🆘 SE AINDA DER ERRO

Se ainda houver problemas, me envie:
1. A mensagem de erro completa
2. Screenshot do SQL Editor do Supabase
3. Resultado do comando de teste

A nova função resolve **todas** as dependências na ordem correta!