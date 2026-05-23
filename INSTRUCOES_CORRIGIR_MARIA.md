# 🔧 INSTRUÇÕES: Corrigir Problema de Maria não Ver Produtos/Pagamentos

## 📋 Problema
Maria faz login mas não vê produtos e formas de pagamento que foram configurados pela empresa. Bete (da mesma empresa) vê tudo normalmente.

## 🎯 Causa Raiz
As políticas RLS (Row Level Security) usam funções que não existem ou têm tipo errado:
- `get_user_company_id()` - Retorna company_id do usuário
- `get_user_role()` - Retorna role do usuário  
- `is_super_admin()` - Verifica se é super admin

## ✅ Solução em 3 Passos

### PASSO 1: Executar Script de Correção RLS

1. Abra o Supabase Dashboard: https://supabase.com/dashboard/project/cvmjjzhvdmpbxquxepue
2. Vá em **SQL Editor**
3. Abra o arquivo `SOLUCAO_DEFINITIVA_RLS.sql`
4. Copie TODO o conteúdo
5. Cole no SQL Editor
6. Clique em **RUN**

**O que este script faz:**
- ✅ Deleta funções antigas com CASCADE (remove políticas quebradas)
- ✅ Recria funções com tipos corretos (UUID, TEXT, BOOLEAN)
- ✅ Recria políticas de `products` e `payment_methods`
- ✅ Verifica se tudo foi criado corretamente

**Resultado esperado:**
```
✅ 3 funções criadas
✅ 8 políticas criadas (4 para products + 4 para payment_methods)
```

---

### PASSO 2: Verificar se Maria Está Vinculada à Empresa

1. No SQL Editor do Supabase
2. Abra o arquivo `VERIFICAR_MARIA.sql`
3. Copie TODO o conteúdo
4. Cole no SQL Editor
5. Clique em **RUN**

**Resultado esperado:**

Se Maria estiver **CORRETAMENTE vinculada**, você verá:
```
email: maria@empresa.com
company_id: f3063d74-fa10-4cf7-9324-c7f67f66b307
role: seller
active: true
company_name: [Nome da empresa]
```

Se Maria **NÃO estiver vinculada**, você verá:
```
email: maria@empresa.com
company_id: NULL
role: NULL
active: NULL
```

---

### PASSO 3A: Se Maria NÃO Estiver Vinculada

Execute este SQL no Supabase:

```sql
-- Vincular Maria à empresa automaticamente
INSERT INTO company_users (
    user_id,
    company_id,
    seller_id,
    role,
    active,
    can_access_pdv,
    can_view_reports,
    can_manage_products,
    can_manage_sellers
)
SELECT 
    u.id as user_id,
    s.company_id,
    s.id as seller_id,
    'seller' as role,
    true as active,
    true as can_access_pdv,
    false as can_view_reports,
    false as can_manage_products,
    false as can_manage_sellers
FROM auth.users u
CROSS JOIN sellers s
WHERE u.email = 'maria@empresa.com'
AND s.email = 'maria@empresa.com'
AND NOT EXISTS (
    SELECT 1 FROM company_users cu 
    WHERE cu.user_id = u.id
);
```

---

### PASSO 3B: Se Maria JÁ Estiver Vinculada

Teste se as funções RLS estão funcionando:

1. Faça login como **maria@empresa.com** no sistema cliente
2. Vá em **Produtos** - deve ver os produtos cadastrados
3. Vá em **Formas de Pagamento** - deve ver as formas cadastradas

Se ainda não aparecer, execute este SQL **logado como Maria**:

```sql
SELECT 
    auth.uid() as meu_user_id,
    get_user_company_id() as minha_empresa,
    get_user_role() as minha_role,
    is_super_admin() as sou_admin;
```

**Resultado esperado:**
```
meu_user_id: [UUID da maria]
minha_empresa: f3063d74-fa10-4cf7-9324-c7f67f66b307
minha_role: seller
sou_admin: false
```

Se `minha_empresa` retornar **NULL**, o problema é que Maria não está vinculada. Volte ao PASSO 3A.

---

## 🧪 Teste Final

1. Faça login como **bete@empresa.com**
   - ✅ Deve ver produtos
   - ✅ Deve ver formas de pagamento

2. Faça logout e login como **maria@empresa.com**
   - ✅ Deve ver os MESMOS produtos
   - ✅ Deve ver as MESMAS formas de pagamento

3. Tente criar um produto como Maria
   - ❌ Deve dar erro (Maria é vendedora, não pode criar produtos)

4. Tente criar um produto como Bete (se Bete for manager/owner)
   - ✅ Deve funcionar

---

## 🔍 Diagnóstico de Problemas

### Problema: "Funções não foram criadas"
**Solução:** Execute o script `SOLUCAO_DEFINITIVA_RLS.sql` novamente

### Problema: "Maria ainda não vê produtos"
**Possíveis causas:**
1. Maria não está vinculada à empresa → Execute PASSO 3A
2. Funções RLS não estão funcionando → Execute PASSO 1 novamente
3. Maria está vinculada a outra empresa → Verifique com `VERIFICAR_MARIA.sql`

### Problema: "Erro ao criar produto"
**Isso é NORMAL se você for vendedor!** Apenas manager/owner podem criar produtos.

---

## 📝 Resumo dos Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `SOLUCAO_DEFINITIVA_RLS.sql` | Script principal que corrige as funções e políticas RLS |
| `VERIFICAR_MARIA.sql` | Verifica se Maria está vinculada à empresa |
| `INSTRUCOES_CORRIGIR_MARIA.md` | Este arquivo com instruções passo a passo |

---

## 🎯 Próximos Passos Após Correção

1. ✅ Testar login com todos os usuários (Bete, Maria, etc)
2. ✅ Verificar que cada usuário vê apenas dados da sua empresa
3. ✅ Testar permissões (vendedor não pode criar produtos)
4. ✅ Criar novos vendedores usando o modal "Criar Login"

---

## 💡 Prevenção de Problemas Futuros

**Ao criar novos vendedores:**
- ✅ Use o modal "Criar Login para Vendedor" no sistema
- ✅ O sistema vincula automaticamente à empresa
- ✅ Não crie usuários manualmente no Supabase Auth

**Se precisar criar manualmente:**
1. Crie o usuário no Supabase Auth
2. Vincule na tabela `company_users` com o script do PASSO 3A
3. Teste o login antes de entregar ao vendedor

---

## 📞 Suporte

Se após seguir todos os passos o problema persistir:
1. Execute `VERIFICAR_MARIA.sql` e copie o resultado
2. Execute as queries de verificação do `SOLUCAO_DEFINITIVA_RLS.sql`
3. Envie os resultados para análise
