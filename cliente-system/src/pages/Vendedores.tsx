import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Plus, 
  User, 
  Mail, 
  Phone,
  Target,
  Percent,
  Edit,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Key,
  BarChart3
} from 'lucide-react';
import CreateSellerLoginModal from '../components/CreateSellerLoginModal';
import SellerPerformanceCard from '../components/SellerPerformanceCard';

interface Seller {
  id: string;
  name: string;
  email: string;
  phone: string;
  document: string;
  commission_percentage: number;
  monthly_goal: number;
  active: boolean;
  created_at: string;
  has_login?: boolean;
}

interface SellerStats {
  sellerId: string;
  sellerName: string;
  todaySales: number;
  todayItemsCount: number;
  todayTicketAvg: number;
  monthSales: number;
  monthItemsCount: number;
  monthTicketAvg: number;
  commission: number;
}

export default function Vendedores() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSeller, setEditingSeller] = useState<Seller | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedSellerForLogin, setSelectedSellerForLogin] = useState<Seller | null>(null);
  const [companyAccessType, setCompanyAccessType] = useState<string>('shared'); // 'shared' ou 'individual'
  const [sellersStats, setSellersStats] = useState<SellerStats[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [newSeller, setNewSeller] = useState({
    name: '',
    email: '',
    phone: '',
    document: '',
    commission_percentage: 0,
    monthly_goal: 0
  });

  useEffect(() => {
    loadCompanyAccessType();
    loadSellers();
  }, []);

  useEffect(() => {
    // Carregar estatísticas apenas para empresas com acesso compartilhado
    if (companyAccessType === 'shared' && sellers.length > 0) {
      loadSellersStats();
    }
  }, [companyAccessType, sellers]);

  const loadSellersStats = async () => {
    try {
      setLoadingStats(true);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      
      // Buscar vendas do dia e do mês para cada vendedor
      const statsPromises = sellers.map(async (seller) => {
        // Vendas do dia
        const { data: todaySales, error: todayError } = await supabase
          .from('sales')
          .select('total_amount, items_count')
          .eq('seller_id', seller.id)
          .gte('created_at', today.toISOString());

        // Vendas do mês
        const { data: monthSales, error: monthError } = await supabase
          .from('sales')
          .select('total_amount, items_count')
          .eq('seller_id', seller.id)
          .gte('created_at', firstDayOfMonth.toISOString());

        const todayCount = todaySales?.length || 0;
        const todayItems = todaySales?.reduce((sum, sale) => sum + (sale.items_count || 1), 0) || 0;
        const todayTotal = todaySales?.reduce((sum, sale) => sum + (sale.total_amount || 0), 0) || 0;
        const todayAvg = todayCount > 0 ? todayTotal / todayCount : 0;

        const monthCount = monthSales?.length || 0;
        const monthItems = monthSales?.reduce((sum, sale) => sum + (sale.items_count || 1), 0) || 0;
        const monthTotal = monthSales?.reduce((sum, sale) => sum + (sale.total_amount || 0), 0) || 0;
        const monthAvg = monthCount > 0 ? monthTotal / monthCount : 0;

        return {
          sellerId: seller.id,
          sellerName: seller.name,
          todaySales: todayCount,
          todayItemsCount: todayItems,
          todayTicketAvg: todayAvg,
          monthSales: monthCount,
          monthItemsCount: monthItems,
          monthTicketAvg: monthAvg,
          commission: seller.commission_percentage
        };
      });

      const stats = await Promise.all(statsPromises);
      setSellersStats(stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const loadCompanyAccessType = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Buscar o access_type da empresa do usuário
      const { data: companyData, error } = await supabase
        .from('company_users')
        .select('companies(access_type)')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Erro ao buscar tipo de acesso:', error);
        return;
      }

      const accessType = (companyData as any)?.companies?.access_type || 'shared';
      setCompanyAccessType(accessType);
      console.log('🔑 Tipo de acesso da empresa:', accessType);
    } catch (error) {
      console.error('Erro ao carregar tipo de acesso:', error);
    }
  };

  const loadSellers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Buscar company_id do usuário
      const { data: companyData, error: companyError } = await supabase
        .from('company_users')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      if (companyError || !companyData) {
        console.error('Erro ao buscar empresa:', companyError);
        return;
      }

      const companyId = companyData.company_id;

      // Carregar vendedores DA EMPRESA
      const { data: sellersData, error: sellersError } = await supabase
        .from('sellers')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (sellersError) throw sellersError;

      // Verificar quais vendedores têm login
      const { data: companyUsersData } = await supabase
        .from('company_users')
        .select('seller_id')
        .eq('company_id', companyId)
        .not('seller_id', 'is', null);

      const sellersWithLogin = new Set(companyUsersData?.map(cu => cu.seller_id) || []);

      // Adicionar flag has_login
      const sellersWithLoginFlag = (sellersData || []).map(seller => ({
        ...seller,
        has_login: sellersWithLogin.has(seller.id)
      }));

      setSellers(sellersWithLoginFlag);
    } catch (error) {
      console.error('Erro ao carregar vendedores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSeller = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevenir múltiplos cliques
    if (saving) return;
    
    try {
      setSaving(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Usuário não autenticado');
        return;
      }

      // Buscar company_id correto do banco de dados
      const { data: companyUserData, error: companyError } = await supabase
        .from('company_users')
        .select('company_id')
        .eq('user_id', user.id)
        .eq('active', true)
        .single();

      if (companyError || !companyUserData) {
        alert('Erro: Usuário não está vinculado a nenhuma empresa');
        console.error('Erro ao buscar empresa:', companyError);
        return;
      }

      const companyId = companyUserData.company_id;
      
      const { data, error } = await supabase
        .from('sellers')
        .insert([{
          ...newSeller,
          company_id: companyId,
          created_by: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      setSellers(prev => [{ ...data, has_login: false }, ...prev]);
      setShowAddModal(false);
      resetForm();
      alert('Vendedor cadastrado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao cadastrar vendedor:', error);
      alert('Erro ao cadastrar vendedor: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEditSeller = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSeller || saving) return;
    
    try {
      setSaving(true);
      
      const { data, error } = await supabase
        .from('sellers')
        .update(newSeller)
        .eq('id', editingSeller.id)
        .select()
        .single();

      if (error) throw error;

      setSellers(prev => 
        prev.map(seller => 
          seller.id === editingSeller.id ? { ...data, has_login: seller.has_login } : seller
        )
      );
      
      setEditingSeller(null);
      resetForm();
      alert('Vendedor atualizado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao atualizar vendedor:', error);
      alert('Erro ao atualizar vendedor: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleSellerStatus = async (sellerId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('sellers')
        .update({ active: !currentStatus })
        .eq('id', sellerId);

      if (error) throw error;

      setSellers(prev => 
        prev.map(seller => 
          seller.id === sellerId 
            ? { ...seller, active: !currentStatus }
            : seller
        )
      );
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    }
  };

  const deleteSeller = async (sellerId: string) => {
    if (!confirm('Tem certeza que deseja excluir este vendedor?')) return;
    
    try {
      const { error } = await supabase
        .from('sellers')
        .delete()
        .eq('id', sellerId);

      if (error) throw error;

      setSellers(prev => prev.filter(seller => seller.id !== sellerId));
      alert('Vendedor excluído com sucesso!');
    } catch (error: any) {
      console.error('Erro ao excluir vendedor:', error);
      alert('Erro ao excluir vendedor: ' + error.message);
    }
  };

  const resetForm = () => {
    setNewSeller({
      name: '',
      email: '',
      phone: '',
      document: '',
      commission_percentage: 0,
      monthly_goal: 0
    });
  };

  const openEditModal = (seller: Seller) => {
    setEditingSeller(seller);
    setNewSeller({
      name: seller.name,
      email: seller.email,
      phone: seller.phone,
      document: seller.document,
      commission_percentage: seller.commission_percentage,
      monthly_goal: seller.monthly_goal
    });
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingSeller(null);
    resetForm();
  };

  const openLoginModal = (seller: Seller) => {
    setSelectedSellerForLogin(seller);
    setShowLoginModal(true);
  };

  const closeLoginModal = () => {
    setShowLoginModal(false);
    setSelectedSellerForLogin(null);
  };

  const handleLoginSuccess = () => {
    loadSellers(); // Recarregar lista para atualizar status de login
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-slate-400">
          <RefreshCw className="w-5 h-5 animate-spin" />
          Carregando vendedores...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Vendedores</h1>
          <p className="text-slate-400">Gerencie sua equipe de vendas</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Vendedor
        </button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <User className="w-8 h-8 text-blue-400" />
            <div>
              <div className="text-2xl font-bold text-slate-100">{sellers.length}</div>
              <div className="text-sm text-slate-400">Total de Vendedores</div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <div>
              <div className="text-2xl font-bold text-slate-100">
                {sellers.filter(s => s.active).length}
              </div>
              <div className="text-sm text-slate-400">Vendedores Ativos</div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <Percent className="w-8 h-8 text-purple-400" />
            <div>
              <div className="text-2xl font-bold text-slate-100">
                {sellers.length > 0 
                  ? (sellers.reduce((sum, s) => sum + s.commission_percentage, 0) / sellers.length).toFixed(1)
                  : 0
                }%
              </div>
              <div className="text-sm text-slate-400">Comissão Média</div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-amber-400" />
            <div>
              <div className="text-2xl font-bold text-slate-100">
                {formatCurrency(sellers.reduce((sum, s) => sum + s.monthly_goal, 0))}
              </div>
              <div className="text-sm text-slate-400">Meta Total</div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard de Performance - Apenas para Acesso Compartilhado */}
      {companyAccessType === 'shared' && sellers.length > 0 && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-blue-400" />
              <div>
                <h3 className="text-lg font-semibold text-slate-100">Performance dos Vendedores</h3>
                <p className="text-sm text-slate-400">Métricas em tempo real de cada vendedor</p>
              </div>
            </div>
            <button
              onClick={loadSellersStats}
              disabled={loadingStats}
              className="flex items-center gap-2 px-4 py-2 text-sm border border-slate-700 rounded-lg hover:border-slate-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loadingStats ? 'animate-spin' : ''}`} />
              {loadingStats ? 'Atualizando...' : 'Atualizar'}
            </button>
          </div>

          <div className="p-6">
            {loadingStats ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-2 text-slate-400">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Carregando estatísticas...
                </div>
              </div>
            ) : sellersStats.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sellersStats.map((stats) => (
                  <SellerPerformanceCard key={stats.sellerId} stats={stats} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-300 mb-2">Nenhuma venda registrada</h3>
                <p className="text-slate-400">As estatísticas aparecerão quando houver vendas.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lista de Vendedores */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800">
          <h3 className="text-lg font-semibold text-slate-100">Equipe de Vendas</h3>
        </div>
        
        {sellers.length === 0 ? (
          <div className="p-12 text-center">
            <User className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-300 mb-2">Nenhum vendedor cadastrado</h3>
            <p className="text-slate-400 mb-4">Comece cadastrando sua equipe de vendas.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Cadastrar Primeiro Vendedor
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Vendedor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Contato</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Comissão</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Meta Mensal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Login</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sellers.map((seller) => (
                  <tr key={seller.id} className="hover:bg-slate-800/30">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-slate-200">{seller.name}</div>
                        <div className="text-sm text-slate-400">CPF: {seller.document || 'Não informado'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-slate-200">{seller.email || 'Não informado'}</div>
                        <div className="text-sm text-slate-400">{seller.phone || 'Não informado'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-purple-400">
                        {seller.commission_percentage}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-200">
                        {formatCurrency(seller.monthly_goal)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {companyAccessType === 'individual' ? (
                        seller.has_login ? (
                          <div className="flex items-center gap-1 text-green-400">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm">Configurado</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => openLoginModal(seller)}
                            className="flex items-center gap-1 px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm transition-colors"
                          >
                            <Key className="w-3 h-3" />
                            Criar Login
                          </button>
                        )
                      ) : (
                        <div className="flex items-center gap-1 text-slate-500">
                          <span className="text-sm">Acesso Compartilhado</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-1 ${seller.active ? 'text-green-400' : 'text-red-400'}`}>
                        {seller.active ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        <span className="text-sm">{seller.active ? 'Ativo' : 'Inativo'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(seller)}
                          className="p-1 text-blue-400 hover:bg-blue-500/20 rounded"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleSellerStatus(seller.id, seller.active)}
                          className={`p-1 rounded ${
                            seller.active 
                              ? 'text-amber-400 hover:bg-amber-500/20' 
                              : 'text-green-400 hover:bg-green-500/20'
                          }`}
                          title={seller.active ? 'Desativar' : 'Ativar'}
                        >
                          {seller.active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => deleteSeller(seller.id)}
                          className="p-1 text-red-400 hover:bg-red-500/20 rounded"
                          title="Excluir"
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

      {/* Modal Adicionar/Editar Vendedor */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-slate-100 mb-4">
              {editingSeller ? 'Editar Vendedor' : 'Novo Vendedor'}
            </h2>
            
            <form onSubmit={editingSeller ? handleEditSeller : handleAddSeller} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Nome Completo</label>
                <input
                  type="text"
                  value={newSeller.name}
                  onChange={(e) => setNewSeller({...newSeller, name: e.target.value})}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                <input
                  type="email"
                  value={newSeller.email}
                  onChange={(e) => setNewSeller({...newSeller, email: e.target.value})}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Telefone</label>
                <input
                  type="tel"
                  value={newSeller.phone}
                  onChange={(e) => setNewSeller({...newSeller, phone: e.target.value})}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">CPF</label>
                <input
                  type="text"
                  value={newSeller.document}
                  onChange={(e) => setNewSeller({...newSeller, document: e.target.value})}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Comissão (%)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={newSeller.commission_percentage}
                  onChange={(e) => setNewSeller({...newSeller, commission_percentage: parseFloat(e.target.value) || 0})}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Meta Mensal (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newSeller.monthly_goal}
                  onChange={(e) => setNewSeller({...newSeller, monthly_goal: parseFloat(e.target.value) || 0})}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800/50 transition-colors"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={saving}
                >
                  {saving ? 'Salvando...' : (editingSeller ? 'Atualizar' : 'Cadastrar')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Criar Login */}
      {showLoginModal && selectedSellerForLogin && (
        <CreateSellerLoginModal
          seller={selectedSellerForLogin}
          onClose={closeLoginModal}
          onSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
}
