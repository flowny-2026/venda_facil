import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import CompanyModal from '../components/CompanyModal';
import { 
  Plus, 
  Building, 
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  RefreshCw,
  Shield,
  Eye,
  Trash2
} from 'lucide-react';

interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  document: string;
  plan: 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'suspended' | 'canceled';
  access_type: 'shared' | 'individual';
  max_users: number;
  monthly_fee: number;
  created_at: string;
}

export default function Clientes() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteCompany = async (companyId: string, companyName: string) => {
    const confirmMessage = `⚠️ ATENÇÃO: Excluir empresa "${companyName}"?\n\n` +
      `Esta ação irá:\n` +
      `• Excluir TODOS os dados da empresa\n` +
      `• Remover usuários, vendas, produtos\n` +
      `• NÃO PODE SER DESFEITA\n\n` +
      `Tem certeza que deseja continuar?`;

    if (!confirm(confirmMessage)) return;

    const confirmation = prompt('Digite "EXCLUIR" para confirmar:');
    if (confirmation !== 'EXCLUIR') {
      alert('Exclusão cancelada. Texto não confere.');
      return;
    }

    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', companyId);

      if (error) throw error;
      
      setCompanies(prev => prev.filter(company => company.id !== companyId));
      alert(`Empresa "${companyName}" excluída com sucesso!`);
    } catch (error: any) {
      console.error('Erro ao excluir empresa:', error);
      alert('Erro ao excluir empresa: ' + error.message);
    }
  };

  const toggleCompanyStatus = async (companyId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    
    try {
      const { error } = await supabase
        .from('companies')
        .update({ status: newStatus })
        .eq('id', companyId);

      if (error) throw error;
      
      setCompanies(prev => 
        prev.map(company => 
          company.id === companyId 
            ? { ...company, status: newStatus as any }
            : company
        )
      );
    } catch (error: any) {
      console.error('Erro ao alterar status:', error);
      alert('Erro ao alterar status: ' + error.message);
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'starter': return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'professional': return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      case 'enterprise': return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      default: return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'suspended': return 'text-amber-400';
      case 'canceled': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2 text-slate-400">
            <RefreshCw className="w-5 h-5 animate-spin" />
            Carregando empresas...
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">Gerenciar Clientes</h1>
            <p className="text-slate-400">Cadastre e gerencie empresas clientes</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nova Empresa
          </button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <Building className="w-8 h-8 text-blue-400" />
              <div>
                <div className="text-2xl font-bold text-slate-100">{companies.length}</div>
                <div className="text-sm text-slate-400">Total de Empresas</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <div>
                <div className="text-2xl font-bold text-slate-100">
                  {companies.filter(c => c.status === 'active').length}
                </div>
                <div className="text-sm text-slate-400">Empresas Ativas</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-green-400" />
              <div>
                <div className="text-2xl font-bold text-slate-100">
                  {formatCurrency(companies.reduce((sum, c) => sum + (c.status === 'active' ? c.monthly_fee : 0), 0))}
                </div>
                <div className="text-sm text-slate-400">Receita Mensal</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-purple-400" />
              <div>
                <div className="text-2xl font-bold text-slate-100">
                  {companies.reduce((sum, c) => sum + (c.max_users || 1), 0)}
                </div>
                <div className="text-sm text-slate-400">Total de Usuários</div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Empresas */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h3 className="text-lg font-semibold text-slate-100">Empresas Cadastradas</h3>
          </div>
          
          {companies.length === 0 ? (
            <div className="p-12 text-center">
              <Building className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-300 mb-2">Nenhuma empresa cadastrada</h3>
              <p className="text-slate-400 mb-4">Comece cadastrando sua primeira empresa cliente.</p>
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Cadastrar Primeira Empresa
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Empresa</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Tipo de Acesso</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Plano</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Valor Mensal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {companies.map((company) => (
                    <tr key={company.id} className="hover:bg-slate-800/30">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-slate-200">{company.name}</div>
                          <div className="text-sm text-slate-400">{company.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {company.access_type === 'shared' ? (
                            <>
                              <Users className="w-4 h-4 text-red-400" />
                              <span className="text-sm text-slate-200">Compartilhado</span>
                            </>
                          ) : (
                            <>
                              <Shield className="w-4 h-4 text-blue-400" />
                              <span className="text-sm text-slate-200">Individual</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-lg border ${getPlanColor(company.plan)}`}>
                          {company.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-1 ${getStatusColor(company.status)}`}>
                          {company.status === 'active' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          <span className="text-sm capitalize">{company.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-200">
                        {formatCurrency(company.monthly_fee)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            className="p-1 text-blue-400 hover:bg-blue-500/20 rounded"
                            title="Ver detalhes"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleCompanyStatus(company.id, company.status)}
                            className={`p-1 rounded ${
                              company.status === 'active' 
                                ? 'text-amber-400 hover:bg-amber-500/20' 
                                : 'text-green-400 hover:bg-green-500/20'
                            }`}
                            title={company.status === 'active' ? 'Suspender' : 'Ativar'}
                          >
                            {company.status === 'active' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => deleteCompany(company.id, company.name)}
                            className="p-1 text-red-400 hover:bg-red-500/20 rounded"
                            title="Excluir empresa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal */}
        <CompanyModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={loadCompanies}
        />
      </div>
    </Layout>
  );
}