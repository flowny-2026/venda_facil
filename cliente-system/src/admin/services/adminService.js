import { supabase } from '../../lib/supabase';
export class AdminService {
    // Obter estatísticas do dashboard
    static async getDashboardStats() {
        const { data, error } = await supabase.rpc('get_dashboard_stats');
        if (error) {
            console.error('Erro ao obter estatísticas:', error);
            throw error;
        }
        return data;
    }
    // Listar todas as empresas
    static async getCompanies() {
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
    static async createCompany(company) {
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
    static async updateCompany(id, updates) {
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
    static async deleteCompany(id) {
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
    static async toggleCompanyStatus(id, active) {
        return this.updateCompany(id, { active });
    }
    // Obter usuários por empresa
    static async getUsersByCompany(companyId) {
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
    static async getSalesByCompany(companyId) {
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
