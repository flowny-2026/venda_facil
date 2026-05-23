# CORREÇÃO: Auto-Login Múltiplo de Usuários

## PROBLEMA IDENTIFICADO

O sistema estava fazendo auto-login com diferentes usuários da mesma empresa quando abria novas abas/janelas do localhost. Isso acontecia porque:

1. **Supabase mantém sessões persistentes**: Por padrão, o Supabase armazena tokens de autenticação no localStorage do navegador
2. **Sessões "empilhadas"**: Quando diferentes usuários fazem login no mesmo navegador, suas sessões ficam armazenadas
3. **Auto-restauração**: O Supabase pode restaurar qualquer uma dessas sessões ao abrir uma nova aba

## SINTOMAS OBSERVADOS

- Abrir nova aba/janela já logava automaticamente com usuário diferente
- Usuários Bete, Maria e lojatem@empresa.com apareciam aleatoriamente
- Não havia controle sobre qual usuário seria restaurado

## SOLUÇÃO IMPLEMENTADA

### 1. Limpeza Completa no Logout (`cliente-system/src/hooks/useAuth.ts`)

```typescript
const signOut = async () => {
  try {
    // Limpar sessão do Supabase
    const { error } = await supabase.auth.signOut()
    
    // Limpar todos os dados relacionados ao usuário do localStorage
    const keysToRemove = [
      'supabase.auth.token',
      'sb-cvmjjzhvdmpbxquxepue-auth-token',
      'dashboard-vendas-data',
      'theme'
    ];
    
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.warn(`Erro ao remover ${key}:`, e);
      }
    });
    
    // Limpar todos os itens do localStorage que começam com 'sb-'
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sb-')) {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          console.warn(`Erro ao remover ${key}:`, e);
        }
      }
    });
    
    // Forçar reload da página para garantir limpeza completa
    setTimeout(() => {
      window.location.reload();
    }, 100);
    
    return { error }
  } catch (err) {
    console.error('Erro no logout:', err);
    return { error: err }
  }
}
```

### 2. Configuração Melhorada do Supabase (`cliente-system/src/lib/supabase.ts`)

```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Configurações para evitar auto-login indesejado
    persistSession: true, // Manter sessão, mas com controle melhor
    detectSessionInUrl: true,
    autoRefreshToken: true,
    // Usar sessionStorage ao invés de localStorage para sessões menos persistentes
    storage: {
      getItem: (key: string) => {
        // Usar sessionStorage para dados de sessão, localStorage para configurações
        if (key.includes('auth-token')) {
          return sessionStorage.getItem(key);
        }
        return localStorage.getItem(key);
      },
      setItem: (key: string, value: string) => {
        // Usar sessionStorage para dados de sessão, localStorage para configurações
        if (key.includes('auth-token')) {
          sessionStorage.setItem(key, value);
        } else {
          localStorage.setItem(key, value);
        }
      },
      removeItem: (key: string) => {
        sessionStorage.removeItem(key);
        localStorage.removeItem(key);
      }
    }
  }
})
```

### 3. Detecção de Mudança de Usuário (`cliente-system/src/App.tsx`)

```typescript
// Detectar mudança de usuário e forçar logout se necessário
useEffect(() => {
  if (user && user.id) {
    const storedUserId = sessionStorage.getItem('current_user_id');
    
    if (storedUserId && storedUserId !== user.id) {
      // Usuário diferente detectado, fazer logout
      console.log('🔄 Usuário diferente detectado, fazendo logout...');
      console.log('  - Usuário anterior:', storedUserId);
      console.log('  - Usuário atual:', user.id);
      signOut();
      return;
    }
    
    // Salvar ID do usuário atual
    sessionStorage.setItem('current_user_id', user.id);
    setLastUserId(user.id);
  } else if (!user) {
    // Limpar ID quando não há usuário
    sessionStorage.removeItem('current_user_id');
    setLastUserId(null);
  }
}, [user, signOut]);
```

## COMO FUNCIONA AGORA

1. **Logout Completo**: Quando usuário faz logout, TODOS os dados de sessão são limpos
2. **SessionStorage**: Tokens de autenticação ficam no sessionStorage (não persistem entre abas)
3. **Detecção de Mudança**: Se detectar usuário diferente, força logout automático
4. **Isolamento**: Cada aba/janela terá sua própria sessão independente

## RESULTADO ESPERADO

- ✅ Abrir nova aba/janela mostra tela de login (não auto-login)
- ✅ Cada usuário precisa fazer login manualmente
- ✅ Logout limpa completamente a sessão
- ✅ Não há mais "vazamento" de sessões entre usuários
- ✅ Maior segurança e controle de acesso

## TESTE RECOMENDADO

1. Fazer login com usuário A
2. Fazer logout
3. Abrir nova aba - deve mostrar tela de login
4. Fazer login com usuário B
5. Abrir nova aba - deve mostrar tela de login (não auto-login com usuário B)

## OBSERVAÇÕES

- A mudança usa sessionStorage para tokens (menos persistente)
- localStorage ainda é usado para configurações como tema
- Reload automático após logout garante limpeza completa
- Logs no console ajudam a debugar mudanças de usuário