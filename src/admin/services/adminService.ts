import { supabase } from '../../lib/supabase';

export interface Company {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  email: string;
  plan: 'starter' | 'professional' | 'enterprise';
  active: boolean;
  monthly_price: number;
  max_users: number;
  max_sales: number;
}

export interface DashboardStats {
  total_companies: number;
  active_companies: number;
  total_users: number;
  total_sales: number;
  total_revenue: number;
}

export class AdminService {
  // Obter estatísticas do dashboard
  static async getDashboardStats(): Promise<DashboardStats> {
    const { data, error } = await supabase.rpc('get_dashboard_stats');
    
    if (error) {
      console.error('Erro ao obter estatísticas:', error);
      throw error;
    }

    return data;
  }

  // Listar todas as empresas
  static async getCompanies(): Promise<Company[]> {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao listar empresas:', error);
      throw error;
    }

    return data || [];
  }

  // Criar nova empresa
  static async createCompany(company: Omit<Company, 'id' | 'created_at' | 'updated_at'>): Promise<Company> {
    const { data, error } = await supabase
      .from('companies')
      .insert([company])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar empresa:', error);
      throw error;
    }

    return data;
  }

  // Atualizar empresa
  static async updateCompany(id: string, updates: Partial<Company>): Promise<Company> {
    const { data, error } = await supabase
      .from('companies')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar empresa:', error);
      throw error;
    }

    return data;
  }

  // Deletar empresa
  static async deleteCompany(id: string): Promise<void> {
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar empresa:', error);
      throw error;
    }
  }

  // Ativar/Desativar empresa
  static async toggleCompanyStatus(id: string, active: boolean): Promise<Company> {
    return this.updateCompany(id, { active });
  }

  // Obter usuários por empresa
  static async getUsersByCompany(companyId: string) {
    const { data, error } = await supabase
      .from('auth.users')
      .select('id, email, created_at, raw_user_meta_data')
      .eq('company_id', companyId);

    if (error) {
      console.error('Erro ao obter usuários:', error);
      throw error;
    }

    return data || [];
  }

  // Obter todas as vendas
  static async getAllSales() {
    const { data, error } = await supabase
      .from('sales')
      .select(`
        *,
        companies (
          name,
          plan
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao obter vendas:', error);
      throw error;
    }

    return data || [];
  }

  // Obter vendas por empresa
  static async getSalesByCompany(companyId: string) {
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao obter vendas da empresa:', error);
      throw error;
    }

    return data || [];
  }
}