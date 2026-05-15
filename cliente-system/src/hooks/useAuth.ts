import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Pegar sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Escutar mudanças na autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Função para fazer login
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  // Função para fazer cadastro
  const signUp = async (email: string, password: string, fullName: string, companyName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          company_name: companyName || '',
        },
        emailRedirectTo: window.location.origin, // Usa a URL atual
      },
    })
    return { data, error }
  }

  // Função para fazer logout
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

  // Função para resetar senha
  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { error }
  }

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }
}