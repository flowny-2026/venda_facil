import { supabase } from '../lib/supabase'
import { OrderRow } from '../data/mock'

export interface SupabaseSale {
  id: string
  created_at: string
  customer: string
  email: string
  category: 'SaaS' | 'Serviços' | 'Hardware'
  status: 'paid' | 'pending' | 'canceled'
  amount: number
  user_id: string
}

export class SupabaseService {
  // Converter dados do Supabase para o formato do app
  private static convertToOrderRow(sale: SupabaseSale): OrderRow {
    return {
      id: `PED-${sale.id.slice(-4).toUpperCase()}`,
      date: sale.created_at,
      customer: sale.customer,
      email: sale.email,
      category: sale.category,
      status: sale.status,
      amount: sale.amount,
    }
  }

  // Carregar vendas do usuário atual
  static async loadSales(): Promise<OrderRow[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      return data?.map(this.convertToOrderRow) || []
    } catch (error) {
      console.error('Erro ao carregar vendas:', error)
      throw error
    }
  }

  // Adicionar nova venda
  static async addSale(sale: Omit<OrderRow, 'id' | 'date'>): Promise<OrderRow> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const { data, error } = await supabase
        .from('sales')
        .insert({
          customer: sale.customer,
          email: sale.email,
          category: sale.category,
          status: sale.status,
          amount: sale.amount,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      return this.convertToOrderRow(data)
    } catch (error) {
      console.error('Erro ao adicionar venda:', error)
      throw error
    }
  }

  // Atualizar venda existente
  static async updateSale(id: string, updates: Partial<Omit<OrderRow, 'id' | 'date'>>): Promise<OrderRow> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      // Extrair o ID real do formato PED-XXXX
      const realId = id.replace('PED-', '').toLowerCase()

      const { data, error } = await supabase
        .from('sales')
        .update(updates)
        .eq('id', realId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      return this.convertToOrderRow(data)
    } catch (error) {
      console.error('Erro ao atualizar venda:', error)
      throw error
    }
  }

  // Deletar venda
  static async deleteSale(id: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      // Extrair o ID real do formato PED-XXXX
      const realId = id.replace('PED-', '').toLowerCase()

      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', realId)
        .eq('user_id', user.id)

      if (error) {
        throw error
      }

      return true
    } catch (error) {
      console.error('Erro ao deletar venda:', error)
      throw error
    }
  }

  // Criar dados de exemplo para o usuário
  static async createSampleData(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const sampleSales = [
        {
          customer: 'Maria Silva',
          email: 'maria@exemplo.com',
          category: 'SaaS' as const,
          status: 'paid' as const,
          amount: 2500,
          user_id: user.id,
        },
        {
          customer: 'João Santos',
          email: 'joao@exemplo.com',
          category: 'Serviços' as const,
          status: 'pending' as const,
          amount: 1800,
          user_id: user.id,
        },
        {
          customer: 'Ana Costa',
          email: 'ana@exemplo.com',
          category: 'Hardware' as const,
          status: 'paid' as const,
          amount: 3200,
          user_id: user.id,
        },
      ]

      const { error } = await supabase
        .from('sales')
        .insert(sampleSales)

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Erro ao criar dados de exemplo:', error)
      throw error
    }
  }

  // Verificar se o usuário tem dados
  static async hasData(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return false
      }

      const { data, error } = await supabase
        .from('sales')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)

      if (error) {
        throw error
      }

      return (data?.length || 0) > 0
    } catch (error) {
      console.error('Erro ao verificar dados:', error)
      return false
    }
  }
}