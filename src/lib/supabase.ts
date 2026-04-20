import { createClient } from '@supabase/supabase-js'

// Estas são as configurações que você vai pegar do painel do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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