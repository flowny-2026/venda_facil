import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('🔄 useAuth: Iniciando verificação de sessão...');
    
    // Pegar sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('📦 Sessão inicial:', session ? 'Encontrada' : 'Não encontrada');
      if (session) {
        console.log('   - user_id:', session.user.id);
        console.log('   - email:', session.user.email);
      }
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Escutar mudanças na autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔔 Auth state changed:', event);
      if (session) {
        console.log('   - user_id:', session.user.id);
        console.log('   - email:', session.user.email);
      }
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Função para fazer login
  const signIn = async (email: string, password: string) => {
    console.log('🔐 signIn chamado para:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      console.error('❌ Erro no signIn:', error.message);
    } else {
      console.log('✅ signIn bem-sucedido!');
      console.log('   - user_id:', data.user?.id);
      console.log('   - email:', data.user?.email);
    }
    
    return { data, error }
  }

  // Função para fazer logout
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  return {
    user,
    session,
    loading,
    signIn,
    signOut,
  }
}