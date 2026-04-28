import { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  ShoppingCart, 
  DollarSign,
  TrendingUp,
  Activity,
  RefreshCw
} from 'lucide-react';
import { AdminService, DashboardStats } from '../services/adminService';

interface StatCard {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ComponentType<any>;
  color: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await AdminService.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError('Erro ao carregar estatísticas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-slate-400">
          <RefreshCw className="w-5 h-5 animate-spin" />
          Carregando estatísticas...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 mb-4">{error}</div>
        <button
          onClick={loadStats}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  const statCards: StatCard[] = [
    {
      title: 'Total de Empresas',
      value: stats?.total_companies.toString() || '0',
      subtitle: `${stats?.active_companies || 0} ativas`,
      icon: Building2,
      color: 'blue'
    },
    {
      title: 'Total de Usuários',
      value: stats?.total_users.toString() || '0',
      subtitle: 'Usuários cadastrados',
      icon: Users,
      color: 'green'
    },
    {
      title: 'Total de Vendas',
      value: stats?.total_sales.toString() || '0',
      subtitle: 'Vendas registradas',
      icon: ShoppingCart,
      color: 'purple'
    },
    {
      title: 'Receita Total',
      value: (stats?.total_revenue || 0).toLocaleString('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
      }),
      subtitle: 'Faturamento geral',
      icon: DollarSign,
      color: 'amber'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
      green: 'bg-green-500/15 text-green-400 border-green-500/20',
      purple: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
      amber: 'bg-amber-500/15 text-amber-400 border-amber-500/20'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Dashboard Administrativo</h1>
          <p className="mt-2 text-slate-400">Visão geral do sistema SaaS de vendas</p>
        </div>
        <button
          onClick={loadStats}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl border ${getColorClasses(card.color)}`}>
                <card.icon className="w-6 h-6" />
              </div>
              <TrendingUp className="w-4 h-4 text-slate-500" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-slate-400">{card.title}</h3>
              <div className="text-2xl font-bold text-slate-100">{card.value}</div>
              <p className="text-xs text-slate-500">{card.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Resumo de Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-500/15 rounded-lg">
              <Activity className="w-5 h-5 text-green-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-100">Status das Empresas</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Empresas Ativas</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-slate-100 font-medium">{stats?.active_companies || 0}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Empresas Inativas</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span className="text-slate-100 font-medium">
                  {(stats?.total_companies || 0) - (stats?.active_companies || 0)}
                </span>
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Taxa de Ativação</span>
                <span className="text-slate-100 font-medium">
                  {stats?.total_companies ? 
                    Math.round((stats.active_companies / stats.total_companies) * 100) : 0
                  }%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/15 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-100">Resumo Financeiro</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Receita Total</span>
              <span className="text-slate-100 font-medium">
                {(stats?.total_revenue || 0).toLocaleString('pt-BR', { 
                  style: 'currency', 
                  currency: 'BRL' 
                })}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Ticket Médio</span>
              <span className="text-slate-100 font-medium">
                {stats?.total_sales ? 
                  ((stats.total_revenue || 0) / stats.total_sales).toLocaleString('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  }) : 'R$ 0,00'
                }
              </span>
            </div>
            
            <div className="pt-4 border-t border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Vendas por Empresa</span>
                <span className="text-slate-100 font-medium">
                  {stats?.total_companies ? 
                    Math.round((stats.total_sales || 0) / stats.total_companies) : 0
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-slate-100 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors text-left">
            <Building2 className="w-5 h-5 text-blue-400" />
            <div>
              <div className="text-sm font-medium text-slate-200">Gerenciar Empresas</div>
              <div className="text-xs text-slate-400">Ver todas as empresas</div>
            </div>
          </button>
          
          <button className="flex items-center gap-3 p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors text-left">
            <Users className="w-5 h-5 text-green-400" />
            <div>
              <div className="text-sm font-medium text-slate-200">Ver Usuários</div>
              <div className="text-xs text-slate-400">Listar todos os usuários</div>
            </div>
          </button>
          
          <button className="flex items-center gap-3 p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors text-left">
            <ShoppingCart className="w-5 h-5 text-purple-400" />
            <div>
              <div className="text-sm font-medium text-slate-200">Relatório de Vendas</div>
              <div className="text-xs text-slate-400">Análise detalhada</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}