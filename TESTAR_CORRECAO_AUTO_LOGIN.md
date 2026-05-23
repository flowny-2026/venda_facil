# TESTE: Correção do Auto-Login Múltiplo

## 🎯 OBJETIVO
Verificar se o problema do auto-login com diferentes usuários foi resolvido após as correções implementadas.

## 📋 PASSO A PASSO PARA TESTE

### TESTE 1: Isolamento de Sessões

1. **Abrir primeira aba/janela:**
   ```
   http://localhost:5173
   ```
   - ✅ Deve mostrar tela de login (não auto-login)
   - ✅ Fazer login com: `loja-tem@gmail.com` (gerente)

2. **Abrir segunda aba/janela (mesmo navegador):**
   ```
   http://localhost:5173
   ```
   - ✅ Deve mostrar tela de login (não auto-login com gerente)
   - ✅ Fazer login com: `bete@gmail.com` (vendedora)

3. **Abrir terceira aba/janela:**
   ```
   http://localhost:5173
   ```
   - ✅ Deve mostrar tela de login (não auto-login)
   - ✅ Fazer login com: `maria@gmail.com` (vendedora)

### TESTE 2: Logout Completo

1. **Na aba do gerente:**
   - Ir em Configurações → Sair
   - ✅ Deve fazer logout e recarregar página
   - ✅ Deve mostrar tela de login

2. **Abrir nova aba:**
   ```
   http://localhost:5173
   ```
   - ✅ Deve mostrar tela de login (não auto-login com gerente)

### TESTE 3: Navegador Limpo

1. **Fechar todas as abas do sistema**
2. **Limpar dados do navegador:**
   - F12 → Application → Storage → Clear site data
   - Ou Ctrl+Shift+Delete → Limpar dados de navegação

3. **Abrir nova aba:**
   ```
   http://localhost:5173
   ```
   - ✅ Deve mostrar tela de login
   - ✅ Não deve haver auto-login

### TESTE 4: Diferentes Navegadores

1. **Chrome:** Login com `loja-tem@gmail.com`
2. **Firefox:** Login com `bete@gmail.com`  
3. **Edge:** Login com `maria@gmail.com`
4. **Cada navegador deve manter sua sessão independente**

## 🔍 VERIFICAÇÕES NO CONSOLE

Abra F12 → Console e procure por estas mensagens:

### ✅ Mensagens Esperadas (OK):
```
✅ Supabase configurado, usando dados reais
🔔 Auth state changed: SIGNED_IN
👤 Usuário carregado: [email do usuário]
```

### ⚠️ Mensagens de Detecção de Mudança (OK):
```
🔄 Usuário diferente detectado, fazendo logout...
  - Usuário anterior: [id anterior]
  - Usuário atual: [id atual]
```

### ❌ Mensagens Problemáticas:
```
❌ Auto-login detectado sem interação do usuário
❌ Sessão restaurada automaticamente
❌ Múltiplas sessões ativas
```

## 🗂️ VERIFICAÇÃO NO NAVEGADOR

### LocalStorage (F12 → Application → Local Storage):
- ✅ `theme`: pode ter valor (configuração)
- ❌ `sb-cvmjjzhvdmpbxquxepue-auth-token`: NÃO deve existir
- ❌ `supabase.auth.token`: NÃO deve existir

### SessionStorage (F12 → Application → Session Storage):
- ✅ `current_user_id`: deve ter ID do usuário logado
- ✅ `sb-cvmjjzhvdmpbxquxepue-auth-token`: pode existir (sessão atual)

## 📊 RESULTADO ESPERADO

| Cenário | Antes (Problema) | Depois (Corrigido) |
|---------|------------------|-------------------|
| Nova aba | Auto-login aleatório | Tela de login |
| Após logout | Auto-login com outro usuário | Tela de login |
| Navegador limpo | Auto-login | Tela de login |
| Múltiplas abas | Usuários misturados | Sessões isoladas |

## 🚨 SE AINDA HOUVER PROBLEMAS

### Limpeza Manual Completa:

1. **No Console do navegador (F12):**
   ```javascript
   // Limpar tudo relacionado ao Supabase
   Object.keys(localStorage).forEach(key => {
     if (key.startsWith('sb-') || key.includes('supabase')) {
       localStorage.removeItem(key);
     }
   });
   
   Object.keys(sessionStorage).forEach(key => {
     if (key.startsWith('sb-') || key.includes('supabase')) {
       sessionStorage.removeItem(key);
     }
   });
   
   // Recarregar página
   window.location.reload();
   ```

2. **Verificar se há processos em background:**
   - Fechar todas as abas do sistema
   - Aguardar 30 segundos
   - Abrir nova aba

## ✅ CRITÉRIOS DE SUCESSO

- [ ] Nova aba sempre mostra tela de login
- [ ] Logout limpa completamente a sessão  
- [ ] Não há auto-login com usuários diferentes
- [ ] Cada aba/janela tem sessão independente
- [ ] Console não mostra erros de autenticação
- [ ] SessionStorage contém apenas sessão atual
- [ ] LocalStorage não contém tokens de auth

## 📞 SUPORTE

Se o problema persistir:
1. Execute `VERIFICAR_STATUS_USUARIOS_ATUAL.sql`
2. Execute `CORRIGIR_USUARIOS_DEFINITIVO.sql`
3. Documente qual teste específico está falhando
4. Capture screenshots do console (F12)