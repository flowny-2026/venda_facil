# 🔧 RESOLVER LOGIN NICOLLY E AMANDA - LOJA LIZ BRITO

## 📋 INFORMAÇÕES IDENTIFICADAS
- **Empresa**: loja liz brito
- **Tipo de acesso**: Individual (cada vendedor tem login próprio)
- **Vendedores**: Nicolly e Amanda
- **Emails**: nicolly@empresa.com, amanda@empresa.com

## 🛠️ DIAGNÓSTICO PASSO A PASSO

### PASSO 1: Executar Diagnóstico
1. Vá no **SQL Editor** do Supabase
2. Execute o arquivo `DIAGNOSTICAR_LOJA_LIZ_BRITO.sql`
3. Me envie o resultado completo

### PASSO 2: Aplicar Correção (se necessário)
Se o diagnóstico mostrar problemas de email, execute:
`CORRIGIR_EMAILS_NICOLLY_AMANDA.sql`

## 🚨 PROBLEMA MAIS PROVÁVEL

### ❌ EMAILS NÃO CONFIRMADOS
O Supabase exige confirmação de email por padrão. Se os emails não foram confirmados, os logins não funcionam.

**Sintomas:**
- Login falha silenciosamente
- Não aparece erro específico
- Usuário "some" após tentar login

**Solução:**
```sql
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email IN ('nicolly@empresa.com', 'amanda@empresa.com')
AND email_confirmed_at IS NULL;
```

## 🧪 TESTE APÓS CORREÇÃO

### Para testar os logins:

1. **Abra aba privada** no navegador
2. **Acesse**: http://localhost:3000 (sistema cliente)
3. **Teste login da Nicolly**:
   - Email: nicolly@empresa.com
   - Senha: (a que você definiu)
4. **Teste login da Amanda**:
   - Email: amanda@empresa.com  
   - Senha: (a que você definiu)

### ⚠️ IMPORTANTE - URLs CORRETAS

- ✅ **Vendedores devem usar**: `http://localhost:3000` (sistema cliente)
- ❌ **NÃO usar**: `http://localhost:5173` (painel admin)

## 🔍 OUTROS PROBLEMAS POSSÍVEIS

### PROBLEMA 2: Usuários não vinculados
Se os usuários foram criados mas não vinculados à empresa:
```sql
-- Verificar vinculação
SELECT u.email, cu.company_id, cu.seller_id 
FROM auth.users u
LEFT JOIN company_users cu ON cu.user_id = u.id
WHERE u.email IN ('nicolly@empresa.com', 'amanda@empresa.com');
```

### PROBLEMA 3: Usuários inativos
Se os usuários estão inativos:
```sql
UPDATE company_users 
SET active = TRUE 
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('nicolly@empresa.com', 'amanda@empresa.com')
);
```

## 📝 CHECKLIST DE VERIFICAÇÃO

- [ ] Executei diagnóstico SQL
- [ ] Verifiquei se emails estão confirmados
- [ ] Confirmei que usuários estão vinculados à empresa
- [ ] Testei login em aba privada
- [ ] Usei URL correta (localhost:3000)
- [ ] Verifiquei console do navegador (F12)

## 🆘 SE AINDA NÃO FUNCIONAR

Me envie:
1. **Resultado completo** do diagnóstico SQL
2. **Mensagem de erro** ao tentar login
3. **Screenshot** da tela de login
4. **Console do navegador** (F12 → Console)

## 🎯 RESULTADO ESPERADO

Após a correção:
- ✅ Nicolly faz login com nicolly@empresa.com
- ✅ Amanda faz login com amanda@empresa.com  
- ✅ Ambas veem apenas suas vendas
- ✅ Ambas podem usar o PDV
- ✅ Não veem dados de outras empresas

Execute o diagnóstico primeiro e me envie o resultado!