# 🚨 RESOLVER PROBLEMA DE LOGIN - URGENTE

## 🎯 Problema
Você criou um usuário vendedor mas ele não consegue fazer login.

## 🔍 Diagnóstico Rápido

### Execute este SQL primeiro:
**Arquivo**: `DIAGNOSTICAR_PROBLEMA_LOGIN.sql`

Este SQL vai mostrar:
- ✅ Se o email foi confirmado
- ✅ Se o usuário foi vinculado à empresa
- ✅ Se o seller_id está correto
- ✅ Se as permissões estão corretas
- ✅ Se o trigger está funcionando

## 🔧 Correção Rápida

### Se você acabou de criar o usuário (últimos 10 minutos):

**Execute**: `CORRIGIR_ULTIMO_USUARIO_CRIADO.sql`

Este SQL vai:
1. ✅ Confirmar o email automaticamente
2. ✅ Vincular o usuário à empresa
3. ✅ Vincular ao vendedor correto
4. ✅ Configurar permissões corretas
5. ✅ Mostrar se está pronto para login

## 📋 Passo a Passo Completo

### PASSO 1: Diagnosticar
```
1. Acesse: https://supabase.com/dashboard/project/cvmjjzhvdmpbxquxepue/sql/new
2. Cole o conteúdo de: DIAGNOSTICAR_PROBLEMA_LOGIN.sql
3. Clique em "Run"
4. Leia os resultados
```

### PASSO 2: Corrigir
```
1. Acesse: https://supabase.com/dashboard/project/cvmjjzhvdmpbxquxepue/sql/new
2. Cole o conteúdo de: CORRIGIR_ULTIMO_USUARIO_CRIADO.sql
3. Clique em "Run"
4. Verifique se apareceu: "✅ PODE FAZER LOGIN AGORA!"
```

### PASSO 3: Testar
```
1. Copie o email do usuário que foi corrigido
2. Faça logout do sistema
3. Tente fazer login com o email e senha
4. Deve funcionar agora!
```

## 🐛 Problemas Comuns e Soluções

### Problema 1: Email não confirmado
**Sintoma**: `❌ EMAIL NAO CONFIRMADO`

**Solução**:
```sql
-- Execute no Supabase SQL Editor
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'usuario@empresa.com';
```

### Problema 2: Usuário não vinculado
**Sintoma**: `❌ SEM VINCULACAO - NAO VAI LOGAR`

**Solução**: Execute `SOLUCAO_DEFINITIVA_LOGIN_VENDEDORES.sql`

### Problema 3: Sem seller_id
**Sintoma**: `⚠️ SEM SELLER_ID - NAO VAI FINALIZAR VENDA`

**Solução**:
```sql
-- Substitua os valores apropriados
UPDATE company_users
SET seller_id = (
  SELECT id FROM sellers 
  WHERE name ILIKE '%NOME_DO_VENDEDOR%' 
  AND company_id = 'ID_DA_EMPRESA'
  LIMIT 1
)
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'usuario@empresa.com'
);
```

### Problema 4: Usuário inativo
**Sintoma**: `⚠️ INATIVO - NAO VAI LOGAR`

**Solução**:
```sql
UPDATE company_users
SET active = TRUE
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'usuario@empresa.com'
);
```

### Problema 5: Sem permissão PDV
**Sintoma**: `⚠️ SEM PERMISSAO PDV`

**Solução**:
```sql
UPDATE company_users
SET can_access_pdv = TRUE
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'usuario@empresa.com'
);
```

## 🔍 Verificação Manual

Para verificar se o usuário está OK:

```sql
SELECT 
  u.email,
  u.email_confirmed_at,
  cu.company_id,
  c.name as empresa,
  cu.seller_id,
  s.name as vendedor,
  cu.role,
  cu.active,
  cu.can_access_pdv,
  CASE 
    WHEN u.email_confirmed_at IS NULL THEN '❌ Email não confirmado'
    WHEN cu.user_id IS NULL THEN '❌ Não vinculado'
    WHEN cu.seller_id IS NULL THEN '⚠️ Sem seller_id'
    WHEN NOT cu.active THEN '❌ Inativo'
    WHEN NOT cu.can_access_pdv THEN '⚠️ Sem permissão PDV'
    ELSE '✅ TUDO OK'
  END as status
FROM auth.users u
LEFT JOIN company_users cu ON cu.user_id = u.id
LEFT JOIN companies c ON cu.company_id = c.id
LEFT JOIN sellers s ON cu.seller_id = s.id
WHERE u.email = 'SUBSTITUA_PELO_EMAIL';
```

## 📝 Checklist de Verificação

Para um usuário conseguir fazer login, ele precisa:

- [ ] ✅ Existir em `auth.users`
- [ ] ✅ Ter `email_confirmed_at` preenchido
- [ ] ✅ Estar vinculado em `company_users`
- [ ] ✅ Ter `seller_id` preenchido (para aparecer no PDV)
- [ ] ✅ Ter `active = TRUE`
- [ ] ✅ Ter `can_access_pdv = TRUE`
- [ ] ✅ Ter `role = 'seller'`

## 🎯 Solução Definitiva

Para evitar esse problema no futuro, certifique-se de que:

1. ✅ Função `confirm_user_email` está criada
   - Execute: `CRIAR_FUNCAO_CONFIRM_EMAIL.sql`

2. ✅ Trigger `on_auth_user_created_auto_link` está criado
   - Execute: `CRIAR_TRIGGER_AUTO_VINCULAR.sql`

3. ✅ Função `delete_auth_user` está criada (para exclusão)
   - Execute: `CRIAR_FUNCAO_DELETE_AUTH_USER.sql`

Com essas 3 funções criadas, novos usuários serão vinculados automaticamente!

## 📞 Próximos Passos

1. Execute `DIAGNOSTICAR_PROBLEMA_LOGIN.sql` para ver o problema
2. Execute `CORRIGIR_ULTIMO_USUARIO_CRIADO.sql` para corrigir
3. Teste o login
4. Se ainda não funcionar, me envie os resultados do diagnóstico
