import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';

interface Admin {
  id: string;
  email: string;
  name: string;
  active: boolean;
}

export function useAdminAuth() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão inicial
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        await checkAdminStatus(session.user.email!);
      }
      setLoading(false);
    });

    // Escutar mudanças na autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        await checkAdminStatus(session.user.email!);
      } else {
        setUser(null);
        setAdmin(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email)
        .eq('active', true)
        .single();

      if (error) {
        console.error('Erro ao verificar admin:', error);
        setAdmin(null);
        return;
      }

      setAdmin(data);
    } catch (error) {
      console.error('Erro ao verificar status de admin:', error);
      setAdmin(null);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setAdmin(null);
      setUser(null);
    }
    return { error };
  };

  return {
    admin,
    user,
    loading,
    signIn,
    signOut,
  };
}