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

interface CompanyUser {
  user_id: string;
  role: string;
  active: boolean;
  users: {
    email: string;
  };
}

export default function Clientes() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([]);

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

  const loadCompanyUsers = async (companyId: string) => {
    try {
      const { data, error } = await supabase
        .from('company_users')
        .select(`
          user_id,
          role,
          active,
          users:user_id (email)
        `)
        .eq('company_id', companyId);

      if (error) throw error;
      setCompanyUsers(data || []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setCompanyUsers([]);
    }
  };

  const handleViewDetails = async (company: Company) => {
    setSelectedCompany(company);
    await loadCompanyUsers(company.id);
    setShowDetailsModal(true);
  };

  const deleteCompany = async (companyId: string, companyName: string) => {
    const confirmMessage = `⚠️ ATENÇÃO: Excluir empresa "${companyName}"?\n\n` +
      `Esta ação irá:\n` +
      `• Excluir TODOS os dados da empresa\n` +
      `• Remover usuários, vendas, produtos\n` +
      `• Deletar usuários do Supabase Auth\n` +
      `• NÃO PODE SER DESFEITA\n\n` +
      `Tem certeza que deseja continuar?`;

    if (!confirm(confirmMessage)) return;

    const confirmation = prompt('Digite "EXCLUIR" para confirmar:');
    if (confirmation !== 'EXCLUIR') {
      alert('Exclusão cancelada. Texto não confere.');
      return;
    }

    try {
      // 1. Buscar usuários da empresa
      const { data: companyUsers, error: usersError } = await supabase
        .from('company_users')
        .select('user_id')
        .eq('company_id', companyId);

      if (usersError) throw usersError;

      // 2. Deletar empresa (isso vai deletar company_users por CASCADE)
      const { error: companyError } = await supabase
        .from('companies')
        .delete()
        .eq('id', companyId);

      if (companyError) throw companyError;

      // 3. Deletar usuários do Supabase Auth
      if (companyUsers && companyUsers.length > 0) {
        for (const cu of companyUsers) {
          try {
            // Nota: Isso requer service_role key, que não temos no frontend
            // Por enquanto, os usuários ficam no Auth mas não conseguem acessar
            console.log('Usuário a ser deletado:', cu.user_id);
          } catch (err) {
            console.error('Erro ao deletar usuário:', err);
          }
        }
      }
      
      setCompanies(prev => prev.filter(company => company.id !== companyId));
      
      alert(
        `Empresa "${companyName}" excluída com sucesso!\n\n` +
        `⚠️ IMPORTANTE: Os usuários foram removidos da empresa, mas ainda existem no Supabase Auth.\n` +
        `Para deletá-los completamente, vá em:\n` +
        `Supabase → Authentication → Users → Deletar manualmente`
      );
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
                            onClick={() => handleViewDetails(company)}
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

        {/* Modal Criar Empresa */}
        <CompanyModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={loadCompanies}
        />

        {/* Modal Detalhes da Empresa */}
        {showDetailsModal && selectedCompany && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-100">Detalhes da Empresa</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Informações da Empresa */}
                <div>
                  <h3 className="text-lg font-medium text-slate-200 mb-4 flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Informações da Empresa
                  </h3>
                  <div className="grid grid-cols-2 gap-4 bg-slate-800/30 rounded-lg p-4">
                    <div>
                      <div className="text-sm text-slate-400">Nome</div>
                      <div className="text-slate-200 font-medium">{selectedCompany.name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-400">Email</div>
                      <div className="text-slate-200">{selectedCompany.email}</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-400">Telefone</div>
                      <div className="text-slate-200">{selectedCompany.phone || 'Não informado'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-400">CNPJ</div>
                      <div className="text-slate-200">{selectedCompany.document || 'Não informado'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-400">Plano</div>
                      <div className="text-slate-200 capitalize">{selectedCompany.plan}</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-400">Tipo de Acesso</div>
                      <div className="text-slate-200">
                        {selectedCompany.access_type === 'shared' ? 'Compartilhado' : 'Individual'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-400">Valor Mensal</div>
                      <div className="text-green-400 font-semibold">{formatCurrency(selectedCompany.monthly_fee)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-400">Status</div>
                      <div className={`font-medium capitalize ${getStatusColor(selectedCompany.status)}`}>
                        {selectedCompany.status}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Credenciais de Acesso */}
                <div>
                  <h3 className="text-lg font-medium text-slate-200 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Credenciais de Acesso ao Painel Cliente
                  </h3>
                  
                  {companyUsers.length === 0 ? (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                      <p className="text-amber-300 text-sm">Nenhum usuário encontrado para esta empresa.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {companyUsers.map((companyUser, index) => (
                        <div key={companyUser.user_id} className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-slate-300">
                              Usuário {index + 1} {companyUser.role === 'owner' && '(Proprietário)'}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              companyUser.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                              {companyUser.active ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>
                          
                          <div className="space-y-2">
                            <div>
                              <div className="text-xs text-slate-400 mb-1">Email de Login:</div>
                              <div className="flex items-center gap-2">
                                <code className="flex-1 bg-slate-900/50 px-3 py-2 rounded text-sm text-slate-200 font-mono">
                                  {companyUser.users?.email}
                                </code>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(companyUser.users?.email || '');
                                    alert('Email copiado!');
                                  }}
                                  className="px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded text-xs transition-colors"
                                >
                                  Copiar
                                </button>
                              </div>
                            </div>
                            
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded p-3">
                              <p className="text-xs text-amber-300">
                                ⚠️ <strong>Senha:</strong> A senha foi definida no momento da criação da empresa. 
                                Por segurança, não é possível visualizá-la aqui. Se o cliente esqueceu a senha, 
                                você pode redefinir através do Supabase ou criar um novo usuário.
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <p className="text-sm text-blue-300 mb-2">
                      <strong>🔗 URL do Painel Cliente:</strong>
                    </p>
                    <code className="block bg-slate-900/50 px-3 py-2 rounded text-sm text-slate-200 font-mono">
                      http://localhost:5173
                    </code>
                    <p className="text-xs text-slate-400 mt-2">
                      Em produção, substitua pela URL real do sistema cliente.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-800">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}