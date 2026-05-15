import { createClient } from '@supabase/supabase-js'

// Estas são as configurações que você vai pegar do painel do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

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

// Tipos para o banco de dados
export interface Database {
  public: {
    Tables: {
      sales: {
        Row: {
          id: string
          created_at: string
          customer: string
          email: string
          category: 'SaaS' | 'Serviços' | 'Hardware'
          status: 'paid' | 'pending' | 'canceled'
          amount: number
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          customer: string
          email: string
          category: 'SaaS' | 'Serviços' | 'Hardware'
          status: 'paid' | 'pending' | 'canceled'
          amount: number
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          customer?: string
          email?: string
          category?: 'SaaS' | 'Serviços' | 'Hardware'
          status?: 'paid' | 'pending' | 'canceled'
          amount?: number
          user_id?: string
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          email: string
          full_name: string | null
          avatar_url: string | null
        }
        Insert: {
          id: string
          created_at?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
        }
      }
    }
  }
}