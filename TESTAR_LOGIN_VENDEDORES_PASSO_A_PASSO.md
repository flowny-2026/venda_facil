# 🔍 DIAGNOSTICAR PROBLEMA DE LOGIN DOS VENDEDORES

## 🚨 PROBLEMA RELATADO
- Empresa criada com **acesso individual**
- 2 vendedores criados
- Logins criados para os vendedores
- **Logins não estão funcionando**

## 🛠️ DIAGNÓSTICO PASSO A PASSO

### PASSO 1: Verificar no Banco de Dados
Execute o arquivo `DIAGNOSTICAR_LOGIN_VENDEDORES.sql` no Supabase para verificar:
- ✅ Se os usuários foram criados
- ✅ Se os emails foram confirmados
- ✅ Se os vendedores estão vinculados corretamente
- ✅ Se há problemas de configuração

### PASSO 2: Verificar Informações da Empresa
Me informe:
1. **Nome da empresa** que você criou
2. **Emails dos vendedores** que criaram login
3. **Senhas** que foram definidas
4. **Mensagem de erro** que aparece ao tentar fazer login

### PASSO 3: Possíveis Causas do Problema

#### 🔴 CAUSA 1: Email não confirmado
- **Problema**: Supabase exige confirmação de email por padrão
- **Solução**: Desabilitar confirmação ou confirmar emails manualmente

#### 🔴 CAUSA 2: Configuração RLS
- **Problema**: Políticas RLS podem estar bloqueando acesso
- **Solução**: Verificar se vendedores têm permissão de leitura

#### 🔴 CAUSA 3: URL de login incorreta
- **Problema**: Vendedores tentando acessar URL errada
- **Solução**: Usar a URL correta do sistema cliente

#### 🔴 CAUSA 4: Sessão de admin interferindo
- **Problema**: Cache do navegador com sessão de admin
- **Solução**: Usar navegador privado ou limpar cache

## 🧪 TESTE MANUAL

### Para testar o login dos vendedores:

1. **Abra uma aba privada** no navegador
2. **Acesse**: http://localhost:3000 (sistema cliente)
3. **Tente fazer login** com:
   - Email do vendedor
   - Senha definida

### Se der erro, anote:
- ❌ Mensagem de erro exata
- ❌ Em que tela acontece o erro
- ❌ Se aparece algum console.log no F12

## 🔧 SOLUÇÕES RÁPIDAS

### SOLUÇÃO 1: Desabilitar confirmação de email
```sql
-- Execute no Supabase
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL 
AND created_at > NOW() - INTERVAL '1 day';
```

### SOLUÇÃO 2: Verificar se vendedor está ativo
```sql
-- Execute no Supabase
UPDATE company_users 
SET active = TRUE 
WHERE seller_id IS NOT NULL;
```

### SOLUÇÃO 3: Verificar URL correta
- ✅ **Sistema Cliente**: http://localhost:3000
- ❌ **NÃO usar**: http://localhost:5173 (é o admin)

## 📋 CHECKLIST DE VERIFICAÇÃO

- [ ] Executei o diagnóstico SQL
- [ ] Verifiquei se emails estão confirmados
- [ ] Testei login em aba privada
- [ ] Usei a URL correta (localhost:3000)
- [ ] Anotei mensagens de erro
- [ ] Verifiquei console do navegador (F12)

## 🆘 PRÓXIMOS PASSOS

Após executar o diagnóstico, me envie:
1. **Resultado do SQL** de diagnóstico
2. **Nome da empresa** criada
3. **Emails dos vendedores**
4. **Mensagem de erro** ao tentar login
5. **Screenshot** da tela de erro (se houver)

Com essas informações, posso identificar e corrigir o problema específico!