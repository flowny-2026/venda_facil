import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import { 
  Building, 
  Users, 
  DollarSign, 
  TrendingUp,
  RefreshCw,
  Calendar,
  Package,
  ShoppingCart,
  AlertTriangle,
  Star,
  CreditCard,
  Banknote,
  Smartphone,
  Clock,
  CheckCircle,
  XCircle,
  Bell
} from 'lucide-react';

interface Stats {
  total_companies: number;
  active_companies: number;
  total_users: number;
  total_sales: number;
  total_revenue: number;
  monthly_revenue: number;
  total_products: number;
  total_sellers: number;
  low_stock_products: number;
  top_selling_products: any[];
  recent_sales: any[];
  payment_stats: any;
}

interface PaymentAlert {
  company_id: string;
  company_name: string;
  amount: number;
  due_date: string;
  days_until_due: number;
  status: 'due_today' | 'due_tomorrow' | 'overdue' | 'due_soon';
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    total_companies: 0,
    active_companies: 0,
    total_users: 0,
    total_sales: 0,
    total_revenue: 0,
    monthly_revenue: 0,
    total_products: 0,
    total_sellers: 0,
    low_stock_products: 0,
    top_selling_products: [],
    recent_sales: [],
    payment_stats: {}
  });
  const [paymentAlerts, setPaymentAlerts] = useState<PaymentAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAlerts, setLoadingAlerts] = useState(true);

  useEffect(() => {
    loadStats();
    loadPaymentAlerts();
  }, []);

  const loadPaymentAlerts = async () => {
    try {
      setLoadingAlerts(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const threeDaysFromNow = new Date(today);
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

      // Buscar todos os pagamentos pendentes com dados da empresa
      const { data: payments, error } = await supabase
        .from('client_payments')
        .select(`
          id,
          company_id,
          amount,
          due_date,
          status,
          companies:company_id (name)
        `)
        .eq('status', 'pending')
        .order('due_date', { ascending: true });

      if (error) throw error;

      const alerts: PaymentAlert[] = [];

      payments?.forEach((payment: any) => {
        const due = new Date(payment.due_date);
        due.setHours(0, 0, 0, 0);
        const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        let status: PaymentAlert['status'];
        if (diffDays < 0) status = 'overdue';
        else if (diffDays === 0) status = 'due_today';
        else if (diffDays === 1) status = 'due_tomorrow';
        else if (diffDays <= 3) status = 'due_soon';
        else return; // Só mostra até 3 dias antes

        alerts.push({
          company_id: payment.company_id,
          company_name: payment.companies?.name || 'Empresa não identificada',
          amount: payment.amount,
          due_date: payment.due_date,
          days_until_due: diffDays,
          status
        });
      });

      setPaymentAlerts(alerts);
    } catch (error) {
      console.error('Erro ao carregar alertas de pagamento:', error);
    } finally {
      setLoadingAlerts(false);
    }
  };

  const loadStats = async () => {
    try {
      // Carregar estatísticas das empresas
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('*');

      if (companiesError) throw companiesError;

      // Carregar estatísticas dos usuários
      const { data: users, error: usersError } = await supabase
        .from('company_users')
        .select('*');

      if (usersError) throw usersError;

      // Carregar estatísticas das vendas
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select(`
          *,
          companies (name),
          sellers (name),
          payment_methods (name, type)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (salesError) throw salesError;

      // Carregar estatísticas dos produtos
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*');

      if (productsError) throw productsError;

      // Carregar estatísticas dos vendedores
      const { data: sellers, error: sellersError } = await supabase
        .from('sellers')
        .select('*');

      if (sellersError) throw sellersError;

      // Carregar produtos mais vendidos
      const { data: topProducts, error: topProductsError } = await supabase
        .from('sale_items')
        .select(`
          product_name,
          product_id,
          quantity
        `);

      if (topProductsError) throw topProductsError;

      // Calcular estatísticas básicas
      const totalCompanies = companies?.length || 0;
      const activeCompanies = companies?.filter(c => c.status === 'active').length || 0;
      const totalUsers = users?.length || 0;
      const totalProducts = products?.length || 0;
      const totalSellers = sellers?.length || 0;
      const lowStockProducts = products?.filter(p => p.track_stock && p.stock_quantity <= p.min_stock).length || 0;

      // Calcular estatísticas de vendas
      const allSales = await supabase.from('sales').select(`
        *,
        payment_methods (name, type)
      `);
      const totalSales = allSales.data?.length || 0;
      const totalRevenue = allSales.data?.reduce((sum, sale) => sum + (sale.total_amount || sale.amount || 0), 0) || 0;
      const monthlyRevenue = companies?.filter(c => c.status === 'active')
        .reduce((sum, company) => sum + (company.monthly_fee || 0), 0) || 0;

      // Calcular estatísticas por forma de pagamento
      const paymentStats = allSales.data?.reduce((acc: any, sale) => {
        if (sale.status === 'paid' && sale.payment_methods) {
          const method = sale.payment_methods.name;
          acc[method] = (acc[method] || 0) + (sale.total_amount || sale.amount || 0);
        }
        return acc;
      }, {}) || {};

      // Calcular produtos mais vendidos
      const productSales = topProducts?.reduce((acc: any, item) => {
        const key = item.product_name || 'Produto sem nome';
        acc[key] = (acc[key] || 0) + (item.quantity || 0);
        return acc;
      }, {}) || {};

      const topSellingProducts = Object.entries(productSales)
        .map(([name, quantity]) => ({ name, quantity }))
        .sort((a: any, b: any) => b.quantity - a.quantity)
        .slice(0, 5);

      setStats({
        total_companies: totalCompanies,
        active_companies: activeCompanies,
        total_users: totalUsers,
        total_sales: totalSales,
        total_revenue: totalRevenue,
        monthly_revenue: monthlyRevenue,
        total_products: totalProducts,
        total_sellers: totalSellers,
        low_stock_products: lowStockProducts,
        top_selling_products: topSellingProducts,
        recent_sales: sales || [],
        payment_stats: paymentStats
      });

    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR');
  };

  const getAlertIcon = (status: PaymentAlert['status']) => {
    switch (status) {
      case 'overdue': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'due_today': return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'due_tomorrow': return <Clock className="w-4 h-4 text-amber-400" />;
      case 'due_soon': return <Bell className="w-4 h-4 text-blue-400" />;
    }
  };

  const getAlertLabel = (status: PaymentAlert['status']) => {
    switch (status) {
      case 'overdue': return 'Em atraso';
      case 'due_today': return 'Vence hoje';
      case 'due_tomorrow': return 'Vence amanhã';
      case 'due_soon': return 'Vence em breve';
    }
  };

  const getAlertColor = (status: PaymentAlert['status']) => {
    switch (status) {
      case 'overdue': return 'bg-red-500/10 border-red-500/30 text-red-400';
      case 'due_today': return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
      case 'due_tomorrow': return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
      case 'due_soon': return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
    }
  };

  const getDaysText = (days: number) => {
    if (days < 0) return `${Math.abs(days)} dias em atraso`;
    if (days === 0) return 'Vence hoje';
    if (days === 1) return 'Vence amanhã';
    return `Vence em ${days} dias`;
  };

  const overdueCount = paymentAlerts.filter(a => a.status === 'overdue').length;
  const dueTodayCount = paymentAlerts.filter(a => a.status === 'due_today').length;
  const dueTomorrowCount = paymentAlerts.filter(a => a.status === 'due_tomorrow').length;
  const totalAlertAmount = paymentAlerts.reduce((sum, a) => sum + a.amount, 0);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2 text-slate-400">
            <RefreshCw className="w-5 h-5 animate-spin" />
            Carregando estatísticas...
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
            <h1 className="text-3xl font-bold text-slate-100">Painel Administrativo</h1>
            <p className="mt-2 text-slate-400">Visão geral do seu negócio</p>
          </div>
          <button
            onClick={() => { loadStats(); loadPaymentAlerts(); }}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </button>
        </div>

        {/* ALERTAS DE PAGAMENTO - NOVO CARD */}
        {(paymentAlerts.length > 0 || loadingAlerts) && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-400" />
                Alertas de Pagamento
                {paymentAlerts.length > 0 && (
                  <span className="bg-amber-500/20 text-amber-400 text-xs px-2 py-0.5 rounded-full">
                    {paymentAlerts.length} alerta{paymentAlerts.length > 1 ? 's' : ''}
                  </span>
                )}
              </h3>
              <Link 
                to="/clientes" 
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Ver clientes →
              </Link>
            </div>

            {/* Resumo dos alertas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-red-400">{overdueCount}</div>
                <div className="text-xs text-slate-400">Em atraso</div>
              </div>
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-amber-400">{dueTodayCount}</div>
                <div className="text-xs text-slate-400">Vence hoje</div>
              </div>
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-amber-400">{dueTomorrowCount}</div>
                <div className="text-xs text-slate-400">Vence amanhã</div>
              </div>
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-blue-400">{formatCurrency(totalAlertAmount)}</div>
                <div className="text-xs text-slate-400">Total pendente</div>
              </div>
            </div>

            {/* Lista de alertas */}
            {loadingAlerts ? (
              <div className="flex items-center justify-center py-4 gap-2 text-slate-400">
                <RefreshCw className="w-4 h-4 animate-spin" /> Carregando alertas...
              </div>
            ) : paymentAlerts.length === 0 ? (
              <div className="text-center py-4 text-slate-400">
                <CheckCircle className="w-6 h-6 mx-auto mb-1 text-green-400" />
                <p className="text-sm">Nenhum pagamento pendente nos próximos 3 dias</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {paymentAlerts.map((alert, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center justify-between p-3 border rounded-lg ${getAlertColor(alert.status)}`}
                  >
                    <div className="flex items-center gap-3">
                      {getAlertIcon(alert.status)}
                      <div>
                        <div className="text-sm font-medium text-slate-200">{alert.company_name}</div>
                        <div className="text-xs opacity-80">
                          {getDaysText(alert.days_until_due)} • Vencimento: {formatDate(alert.due_date)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">{formatCurrency(alert.amount)}</div>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${getAlertColor(alert.status)}`}>
                        {getAlertLabel(alert.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* KPIs Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/15 rounded-lg">
                <Building className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-100">{stats.total_companies}</div>
                <div className="text-sm text-slate-400">Total de Empresas</div>
                <div className="text-xs text-green-400 mt-1">
                  {stats.active_companies} ativas
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/15 rounded-lg">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-100">{stats.total_users}</div>
                <div className="text-sm text-slate-400">Total de Usuários</div>
                <div className="text-xs text-slate-500 mt-1">
                  Todos os sistemas
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/15 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-100">{formatCurrency(stats.monthly_revenue)}</div>
                <div className="text-sm text-slate-400">Receita Mensal</div>
                <div className="text-xs text-green-400 mt-1">
                  Assinaturas ativas
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/15 rounded-lg">
                <TrendingUp className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-100">{stats.total_sales}</div>
                <div className="text-sm text-slate-400">Total de Vendas</div>
                <div className="text-xs text-slate-400 mt-1">
                  {formatCurrency(stats.total_revenue)} em receita
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KPIs do Sistema PDV */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/15 rounded-lg">
                <Package className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-100">{stats.total_products}</div>
                <div className="text-sm text-slate-400">Produtos Cadastrados</div>
                <div className="text-xs text-slate-500 mt-1">
                  Todos os clientes
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/15 rounded-lg">
                <Users className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-100">{stats.total_sellers}</div>
                <div className="text-sm text-slate-400">Vendedores Ativos</div>
                <div className="text-xs text-slate-500 mt-1">
                  Equipes de vendas
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/15 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-100">{stats.low_stock_products}</div>
                <div className="text-sm text-slate-400">Produtos Estoque Baixo</div>
                <div className="text-xs text-red-400 mt-1">
                  Requer atenção
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/15 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-100">
                  {stats.total_sales > 0 ? Math.round(stats.total_revenue / stats.total_sales) : 0}
                </div>
                <div className="text-sm text-slate-400">Ticket Médio</div>
                <div className="text-xs text-slate-500 mt-1">
                  Por venda
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resumo do Negócio */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Resumo Financeiro</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Receita Mensal Recorrente:</span>
                <span className="text-green-400 font-medium">{formatCurrency(stats.monthly_revenue)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Receita Anual Projetada:</span>
                <span className="text-slate-200 font-medium">{formatCurrency(stats.monthly_revenue * 12)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Ticket Médio por Empresa:</span>
                <span className="text-slate-200 font-medium">
                  {stats.active_companies > 0 ? formatCurrency(stats.monthly_revenue / stats.active_companies) : 'R$ 0,00'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Métricas de Crescimento</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Taxa de Conversão:</span>
                <span className="text-blue-400 font-medium">
                  {stats.total_companies > 0 ? Math.round((stats.active_companies / stats.total_companies) * 100) : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Usuários por Empresa:</span>
                <span className="text-slate-200 font-medium">
                  {stats.total_companies > 0 ? Math.round(stats.total_users / stats.total_companies) : 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Vendas por Usuário:</span>
                <span className="text-slate-200 font-medium">
                  {stats.total_users > 0 ? Math.round(stats.total_sales / stats.total_users) : 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Produtos Mais Vendidos e Vendas Recentes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400" />
              Produtos Mais Vendidos
            </h3>
            {stats.top_selling_products.length > 0 ? (
              <div className="space-y-3">
                {stats.top_selling_products.map((product: any, index: number) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded">
                        #{index + 1}
                      </span>
                      <span className="text-slate-200 text-sm">{product.name}</span>
                    </div>
                    <span className="text-slate-400 text-sm">{product.quantity} vendidos</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma venda registrada ainda</p>
              </div>
            )}
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Vendas Recentes
            </h3>
            {stats.recent_sales.length > 0 ? (
              <div className="space-y-3">
                {stats.recent_sales.slice(0, 5).map((sale: any) => (
                  <div key={sale.id} className="flex justify-between items-center">
                    <div>
                      <div className="text-slate-200 text-sm font-medium">
                        {sale.companies?.name || 'Empresa não identificada'}
                      </div>
                      <div className="text-slate-400 text-xs">
                        {sale.sellers?.name || 'Vendedor não identificado'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 text-sm font-medium">
                        {formatCurrency(sale.total_amount || sale.amount || 0)}
                      </div>
                      <div className="text-slate-400 text-xs">
                        {new Date(sale.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma venda recente</p>
              </div>
            )}
          </div>
        </div>

        {/* Estatísticas por Forma de Pagamento */}
        {Object.keys(stats.payment_stats).length > 0 && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-400" />
              Vendas por Forma de Pagamento
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(stats.payment_stats).map(([method, amount]: [string, any]) => {
                const getPaymentIcon = (methodName: string) => {
                  if (methodName.toLowerCase().includes('dinheiro')) return <Banknote className="w-5 h-5 text-green-400" />;
                  if (methodName.toLowerCase().includes('pix')) return <Smartphone className="w-5 h-5 text-purple-400" />;
                  if (methodName.toLowerCase().includes('cartão')) return <CreditCard className="w-5 h-5 text-blue-400" />;
                  return <DollarSign className="w-5 h-5 text-slate-400" />;
                };

                return (
                  <div key={method} className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {getPaymentIcon(method)}
                      <span className="text-sm font-medium text-slate-200">{method}</span>
                    </div>
                    <div className="text-lg font-bold text-green-400">
                      {formatCurrency(amount)}
                    </div>
                    <div className="text-xs text-slate-400">
                      {stats.total_revenue > 0 ? Math.round((amount / stats.total_revenue) * 100) : 0}% do total
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Ações Rápidas */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">Ações Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/clientes"
              className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors"
            >
              <Building className="w-5 h-5 text-blue-400" />
              <div>
                <div className="text-sm font-medium text-slate-200">Gerenciar Clientes</div>
                <div className="text-xs text-slate-400">Adicionar nova empresa</div>
              </div>
            </Link>

            <Link to="/vendas"
              className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors"
            >
              <TrendingUp className="w-5 h-5 text-green-400" />
              <div>
                <div className="text-sm font-medium text-slate-200">Ver Todas as Vendas</div>
                <div className="text-xs text-slate-400">Relatório consolidado</div>
              </div>
            </Link>

            <Link to="/configuracoes"
              className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors"
            >
              <Calendar className="w-5 h-5 text-purple-400" />
              <div>
                <div className="text-sm font-medium text-slate-200">Configurações</div>
                <div className="text-xs text-slate-400">Ajustar sistema</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}