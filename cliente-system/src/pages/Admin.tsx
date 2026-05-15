import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Activity,
  Eye,
  UserX,
  Calendar,
  Mail,
  Building,
  BarChart3,
  PieChart,
  RefreshCw
} from 'lucide-react';

interface AdminStats {
  total_users: number;
  new_users_30d: number;
  new_users_7d: number;
  total_sales: number;
  total_revenue: number;
  avg_ticket: number;
  sales_30d: number;
  revenue_30d: number;
  paid_sales: number;
  pending_sales: number;
  canceled_sales: number;
  top_categories: Array<{category: string, count: number, revenue: number}>;
}

interface UserOverview {
  id: string;
  email: string;
  created_at: string;
  email_confirmed_at: string;
  last_sign_in_at: string;
  full_name: string;
  company_name: string;
  total_sales: number;
  total_revenue: number;
  avg_ticket: number;
  last_sale: string;
}

export default function Admin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserOverview[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'sales'>('dashboard');

  // Verificar se usuário é admin
  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .rpc('is_admin', { user_uuid: user.id });

      if (error) throw error;
      
      setIsAdmin(data);
      
      if (data) {
        await loadAdminData();
      }
    } catch (error) {
      console.error('Erro ao verificar admin:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAdminData();
    setRefreshing(false);
  };

  const loadAdminData = async () => {
    setLoading(true);
    try {
      // Carregar estatísticas
      const { data: statsData, error: statsError } = await supabase
        .from('admin_stats')
        .select('*')
        .single();

      if (statsError) {
        console.error('Erro ao carregar estatísticas:', statsError);
        // Se der erro, criar dados mock para teste
        setStats({
          total_users: 0,
          new_users_30d: 0,
          new_users_7d: 0,
          total_sales: 0,
          total_revenue: 0,
          avg_ticket: 0,
          sales_30d: 0,
          revenue_30d: 0,
          paid_sales: 0,
          pending_sales: 0,
          canceled_sales: 0,
          top_categories: []
        });
      } else {
        setStats(statsData);
      }

      // Carregar usuários
      const { data: usersData, error: usersError } = await supabase
        .from('admin_users_overview')
        .select('*')
        .limit(100);

      if (usersError) {
        console.error('Erro ao carregar usuários:', usersError);
        // Se der erro, tentar carregar usuários básicos
        const { data: basicUsers, error: basicError } = await supabase.auth.admin.listUsers();
        if (!basicError && basicUsers) {
          const formattedUsers = basicUsers.users.map(user => ({
            id: user.id,
            email: user.email || '',
            created_at: user.created_at,
            email_confirmed_at: user.email_confirmed_at || '',
            last_sign_in_at: user.last_sign_in_at || '',
            full_name: user.user_metadata?.full_name || '',
            company_name: user.user_metadata?.company_name || '',
            total_sales: 0,
            total_revenue: 0,
            avg_ticket: 0,
            last_sale: ''
          }));
          setUsers(formattedUsers);
        } else {
          setUsers([]);
        }
      } else {
        setUsers(usersData || []);
      }

    } catch (error) {
      console.error('Erro geral ao carregar dados admin:', error);
      // Dados de fallback
      setStats({
        total_users: 0,
        new_users_30d: 0,
        new_users_7d: 0,
        total_sales: 0,
        total_revenue: 0,
        avg_ticket: 0,
        sales_30d: 0,
        revenue_30d: 0,
        paid_sales: 0,
        pending_sales: 0,
        canceled_sales: 0,
        top_categories: []
      });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex items-center gap-2 text-slate-400">
          <RefreshCw className="w-5 h-5 animate-spin" />
          Verificando permissões...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-2">Acesso Negado</h1>
          <p className="text-slate-400">Você precisa fazer login para acessar esta área.</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-2">Acesso Restrito</h1>
          <p className="text-slate-400">Você não tem permissão para acessar o painel administrativo.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="bg-slate-900/50 border-b border-slate-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Painel Administrativo</h1>
            <p className="text-slate-400">Gestão completa do sistema</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">Admin: {user.email}</span>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg text-sm transition-colors ${refreshing ? 'cursor-not-allowed' : ''}`}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Atualizando...' : 'Atualizar'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Painel
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'users'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Usuários
          </button>
          <a
            href="/admin/clientes"
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            Gerenciar Clientes
          </a>
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'sales'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Vendas
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <div className="space-y-6">
            {/* KPIs Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/15 rounded-lg">
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-100">{stats.total_users}</div>
                    <div className="text-sm text-slate-400">Total de Usuários</div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/15 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-100">{formatCurrency(stats.total_revenue)}</div>
                    <div className="text-sm text-slate-400">Receita Total</div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/15 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-100">{stats.total_sales}</div>
                    <div className="text-sm text-slate-400">Total de Vendas</div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/15 rounded-lg">
                    <Activity className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-100">{formatCurrency(stats.avg_ticket)}</div>
                    <div className="text-sm text-slate-400">Ticket Médio</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Estatísticas Mensais */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-slate-100 mb-4">Últimos 30 Dias</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Novos Usuários:</span>
                    <span className="text-slate-200">{stats.new_users_30d}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Vendas:</span>
                    <span className="text-slate-200">{stats.sales_30d}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Receita:</span>
                    <span className="text-slate-200">{formatCurrency(stats.revenue_30d)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-slate-100 mb-4">Status das Vendas</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-green-400">Pagas:</span>
                    <span className="text-slate-200">{stats.paid_sales}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-400">Pendentes:</span>
                    <span className="text-slate-200">{stats.pending_sales}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-400">Canceladas:</span>
                    <span className="text-slate-200">{stats.canceled_sales}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800">
              <h3 className="text-lg font-semibold text-slate-100">Usuários Cadastrados</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Usuário</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Empresa</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Cadastro</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Vendas</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Receita</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Último Acesso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-800/30">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-slate-200">{user.full_name || 'Sem nome'}</div>
                          <div className="text-sm text-slate-400">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-200">
                        {user.company_name || 'Não informado'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-200">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-200">
                        {user.total_sales}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-200">
                        {formatCurrency(user.total_revenue)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-200">
                        {formatDate(user.last_sign_in_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Sales Tab */}
        {activeTab === 'sales' && (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-300 mb-2">Relatório de Vendas</h3>
            <p className="text-slate-400">Esta seção será implementada em breve com relatórios detalhados.</p>
          </div>
        )}
      </div>
    </div>
  );
}