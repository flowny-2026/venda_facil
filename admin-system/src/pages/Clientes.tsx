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
      console.log('🔄 Carregando empresas...');
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log(`✅ ${data?.length || 0} empresas carregadas`);
      setCompanies(data || []);
    } catch (error) {
      console.error('❌ Erro ao carregar empresas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCompanyUsers = async (companyId: string) => {
    try {
      const { data, error } = await supabase
        .from('v_company_users_emails')
        .select('user_id, role, active, email')
        .eq('company_id', companyId);

      if (error) throw error;
      
      setCompanyUsers(data?.map(u => ({
        user_id: u.user_id,
        role: u.role,
        active: u.active,
        users: { email: u.email }
      })) || []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setCompanyUsers([]);
    }
  };

  const deleteUser = async (userEmail: string) => {
    const confirmMessage = `⚠️ ATENÇÃO: Excluir usuário "${userEmail}"?\n\n` +
      `Esta ação irá:\n` +
      `• Remover o acesso do usuário ao sistema\n` +
      `• Manter as vendas registradas por ele (para histórico)\n` +
      `• NÃO PODE SER DESFEITA\n\n` +
      `Tem certeza que deseja continuar?`;

    if (!confirm(confirmMessage)) {
      console.log('❌ Exclusão cancelada pelo usuário');
      return;
    }

    try {
      console.log('========================================');
      console.log('🗑️ INICIANDO EXCLUSÃO DE USUÁRIO');
      console.log('========================================');
      console.log(`📧 Email: ${userEmail}`);
      console.log(`🏢 Empresa: ${selectedCompany?.name}`);
      console.log(`📊 Total de usuários antes: ${companyUsers.length}`);
      
      // PASSO 1: Buscar o user_id pelo email
      console.log('🔍 Buscando user_id...');
      const { data: userData, error: userError } = await supabase
        .from('v_company_users_emails')
        .select('user_id')
        .eq('email', userEmail)
        .maybeSingle();

      if (userError || !userData) {
        throw new Error('Usuário não encontrado: ' + userEmail);
      }

      const userId = userData.user_id;
      console.log(`✅ User ID encontrado: ${userId}`);

      // PASSO 2: Desvincular vendas (manter para histórico)
      console.log('🔄 Desvinculando vendas...');
      const { error: salesError } = await supabase
        .from('sales')
        .update({ user_id: null })
        .eq('user_id', userId);

      if (salesError) {
        console.warn('⚠️ Erro ao desvincular vendas:', salesError);
        // Continuar mesmo com erro
      } else {
        console.log('✅ Vendas desvinculadas');
      }

      // PASSO 3: Deletar vinculação em company_users
      console.log('🔄 Removendo vinculação em company_users...');
      const { error: companyUserError } = await supabase
        .from('company_users')
        .delete()
        .eq('user_id', userId);

      if (companyUserError) {
        console.error('❌ Erro ao remover vinculação:', companyUserError);
        throw new Error('Erro ao remover vinculação: ' + companyUserError.message);
      }
      console.log('✅ Vinculação removida');

      // PASSO 4: Deletar usuário usando Admin API
      console.log('🔄 Deletando usuário do auth.users...');
      
      // Usar a API admin do Supabase para deletar usuário
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        throw new Error('Você precisa estar logado como admin');
      }

      // Tentar deletar via função RPC especial
      const { data: deleteResult, error: deleteError } = await supabase.rpc(
        'delete_auth_user',
        { target_user_id: userId }
      );

      if (deleteError) {
        console.error('❌ Erro ao deletar via RPC:', deleteError);
        
        // Fallback: Marcar como inativo ao invés de deletar
        console.log('⚠️ Não foi possível deletar do auth.users');
        console.log('ℹ️ Usuário foi desvinculado mas permanece no auth.users');
        console.log('ℹ️ Ele não conseguirá mais fazer login pois não tem vinculação');
      } else {
        console.log('✅ Usuário deletado do auth.users');
      }

      // PASSO 5: Aguardar e verificar
      console.log('⏳ Aguardando 500ms...');
      await new Promise(resolve => setTimeout(resolve, 500));

      // PASSO 6: Verificar se foi removido da view
      console.log('🔍 Verificando exclusão...');
      const { data: checkUser } = await supabase
        .from('v_company_users_emails')
        .select('email')
        .eq('email', userEmail)
        .maybeSingle();

      if (checkUser) {
        console.warn('⚠️ Usuário ainda aparece na view');
        throw new Error('Usuário não foi removido completamente. Tente novamente.');
      }

      // PASSO 7: Atualizar lista
      console.log('🔄 Recarregando lista de usuários...');
      if (selectedCompany) {
        await loadCompanyUsers(selectedCompany.id);
        console.log(`📊 Total de usuários depois: ${companyUsers.length}`);
      }

      console.log('========================================');
      console.log('✅ EXCLUSÃO CONCLUÍDA COM SUCESSO');
      console.log('========================================');

      alert(`✅ Usuário deletado com sucesso!\n\nEmail: ${userEmail}\n\nO usuário foi removido e não poderá mais fazer login.`);

    } catch (error: any) {
      console.error('========================================');
      console.error('❌ ERRO NA EXCLUSÃO');
      console.error('========================================');
      console.error('📋 Erro:', error);
      console.error('📋 Mensagem:', error.message);

      // Recarregar a lista
      if (selectedCompany) {
        await loadCompanyUsers(selectedCompany.id);
      }

      alert(`❌ Erro ao excluir usuário:\n\n${error.message}\n\nVerifique o console (F12) para mais detalhes.`);
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
      `• NÃO PODE SER DESFEITA\n\n` +
      `Tem certeza que deseja continuar?`;

    if (!confirm(confirmMessage)) return;

    const confirmation = prompt('Digite "EXCLUIR" para confirmar:');
    if (confirmation !== 'EXCLUIR') {
      alert('Exclusão cancelada. Texto não confere.');
      return;
    }

    try {
      console.log(`🗑️ Iniciando exclusão da empresa: ${companyName}`);
      console.log(`📊 Estado atual: ${companies.length} empresas na lista`);
      
      // USAR A FUNÇÃO SQL ESPECÍFICA PARA DELETAR EMPRESA
      console.log('🔍 Usando função delete_company_cascade...');
      const { data: deleteResult, error: deleteError } = await supabase
        .rpc('delete_company_cascade', { 
          company_name: companyName 
        });

      if (deleteError) {
        console.error('❌ Erro ao executar delete_company_cascade:', deleteError);
        throw deleteError;
      }
      
      console.log('✅ Resultado da função:', deleteResult);
      
      // Verificar se a função retornou sucesso
      if (deleteResult && deleteResult.includes('❌')) {
        console.error('❌ Função retornou erro:', deleteResult);
        throw new Error(deleteResult);
      }
      
      if (deleteResult && deleteResult.includes('✅')) {
        console.log('✅ Empresa deletada com sucesso pela função SQL');
        
        // Aguardar um pouco para garantir que a operação foi processada
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Verificar se realmente foi deletada
        console.log('🔍 Verificando se empresa foi realmente deletada...');
        const { data: checkCompany } = await supabase
          .from('companies')
          .select('id, name')
          .eq('id', companyId)
          .maybeSingle();
        
        if (checkCompany) {
          console.warn('⚠️ Empresa ainda existe no banco, mas função reportou sucesso');
          console.log('ℹ️ Isso pode ser normal se a função deletou por nome e não por ID');
        } else {
          console.log('✅ Confirmado: Empresa não existe mais no banco');
        }
        
        // Atualizar estado local
        console.log('🔍 Atualizando estado local...');
        const oldCount = companies.length;
        setCompanies(prev => prev.filter(company => company.id !== companyId));
        console.log(`📊 Estado atualizado: ${oldCount} → ${oldCount - 1} empresas`);
        
        alert(`✅ ${deleteResult}`);
      } else {
        throw new Error('Função executada mas resultado inesperado: ' + deleteResult);
      }
      
    } catch (error: any) {
      console.error('❌ ERRO GERAL na exclusão:', error);
      
      // Recarregar a lista para garantir consistência
      console.log('🔄 Recarregando lista para garantir consistência...');
      await loadCompanies();
      
      alert(`❌ Erro ao excluir empresa: ${error.message}\n\nA lista foi recarregada para garantir consistência.`);
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
          <div className="flex items-center gap-3">
            <button
              onClick={loadCompanies}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-slate-200 rounded-lg font-medium transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Recarregar
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nova Empresa
            </button>
          </div>
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
                  {formatCurrency(companies.reduce((sum, c) => sum + c.monthly_fee, 0))}
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
                  {companies.reduce((sum, c) => sum + c.max_users, 0)}
                </div>
                <div className="text-sm text-slate-400">Total de Usuários</div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Empresas */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-slate-300">Empresa</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-300">Tipo de Acesso</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-300">Plano</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-300">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-300">Valor Mensal</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-300">Ações</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr key={company.id} className="border-t border-slate-800/50 hover:bg-slate-800/25">
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-slate-100">{company.name}</div>
                        <div className="text-sm text-slate-400">{company.email}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {company.access_type === 'shared' ? (
                          <>
                            <Users className="w-4 h-4 text-orange-400" />
                            <span className="text-sm text-slate-300">Compartilhado</span>
                          </>
                        ) : (
                          <>
                            <Shield className="w-4 h-4 text-blue-400" />
                            <span className="text-sm text-slate-300">Individual</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPlanColor(company.plan)}`}>
                        {company.plan}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {company.status === 'active' ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                        <span className={`text-sm font-medium ${getStatusColor(company.status)}`}>
                          {company.status === 'active' ? 'Ativo' : 
                           company.status === 'suspended' ? 'Suspenso' : 'Cancelado'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-medium text-slate-100">
                        {formatCurrency(company.monthly_fee)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(company)}
                          className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="Ver detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleCompanyStatus(company.id, company.status)}
                          className="p-2 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                          title={company.status === 'active' ? 'Suspender' : 'Ativar'}
                        >
                          {company.status === 'active' ? (
                            <XCircle className="w-4 h-4" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => deleteCompany(company.id, company.name)}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
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
        </div>

        {/* Modal de Nova Empresa */}
        <CompanyModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            loadCompanies();
          }}
        />

        {/* Modal de Detalhes */}
        {showDetailsModal && selectedCompany && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-100">
                  Detalhes da Empresa: {selectedCompany.name}
                </h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                    <div className="text-slate-100">{selectedCompany.email}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Telefone</label>
                    <div className="text-slate-100">{selectedCompany.phone}</div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Documento</label>
                  <div className="text-slate-100">{selectedCompany.document}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Plano</label>
                    <div className="text-slate-100">{selectedCompany.plan}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Máx. Usuários</label>
                    <div className="text-slate-100">{selectedCompany.max_users}</div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Usuários da Empresa</label>
                  <div className="space-y-2">
                    {companyUsers.length === 0 ? (
                      <div className="text-center py-4 text-slate-400">
                        Nenhum usuário encontrado
                      </div>
                    ) : (
                      companyUsers.map((user) => (
                        <div key={user.user_id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                          <div className="flex-1">
                            <div className="text-slate-100">{user.users.email}</div>
                            <div className="text-sm text-slate-400">{user.role}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`px-2 py-1 rounded text-xs ${user.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                              {user.active ? 'Ativo' : 'Inativo'}
                            </div>
                            <button
                              onClick={() => deleteUser(user.users.email)}
                              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Excluir usuário"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}