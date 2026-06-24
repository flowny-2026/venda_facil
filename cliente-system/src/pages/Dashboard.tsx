import { useState, useMemo, useEffect } from "react";
import { RefreshCw, LogOut, User } from "lucide-react";
import FiltersBar, { Filters } from "../components/FiltersBar";
import KpiCard from "../components/KpiCard";
import LineChartCard from "../components/charts/LineChartCard";
import BarChartCard from "../components/charts/BarChartCard";
import DonutChartCard from "../components/charts/DonutChartCard";
import DataTable from "../components/DataTable";
import AddSaleModal from "../components/AddSaleModal";
import AuthModal from "../components/AuthModal";
import { OrderRow } from "../data/mock";
import { SalesService } from "../services/salesService";
import { SupabaseService } from "../services/supabaseService";
import { useAuth } from "../hooks/useAuth";
import { useUserRole } from "../hooks/useUserRole";
import { supabase } from "../lib/supabase";

function filterOrders(orders: OrderRow[], filters: Filters): OrderRow[] {
  return orders.filter((order) => {
    // Filtro por período
    if (filters.period !== "all") {
      const days = parseInt(filters.period.replace("d", ""));
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      if (new Date(order.date) < cutoff) return false;
    }

    // Filtro por status
    if (filters.status !== "all" && order.status !== filters.status) return false;

    // Filtro por categoria
    if (filters.category !== "all" && order.category !== filters.category) return false;

    // Filtro por busca
    if (filters.query.trim()) {
      const query = filters.query.toLowerCase();
      return (
        order.customer.toLowerCase().includes(query) ||
        order.email.toLowerCase().includes(query) ||
        order.id.toLowerCase().includes(query)
      );
    }

    return true;
  });
}

export default function Dashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { permissions, loading: permissionsLoading, isSeller } = useUserRole();
  const [filters, setFilters] = useState<Filters>({
    period: "30d",
    status: "all",
    category: "all",
    query: "",
  });
  const [profitData, setProfitData] = useState({ revenue: 0, cost: 0, profit: 0 });
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [useSupabase, setUseSupabase] = useState(false);

  // Verificar se deve usar Supabase
  useEffect(() => {
    const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || localStorage.getItem('supabase_url');
    const supabaseKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('supabase_key');
    
    // Verificar se o Supabase está configurado
    const isValidConfig = !!(supabaseUrl && supabaseKey && supabaseUrl.includes('supabase.co'));
    setUseSupabase(isValidConfig);
    
    console.log('🔧 Configuração Supabase:', {
      url: supabaseUrl ? 'Definida' : 'Não definida',
      key: supabaseKey ? 'Definida' : 'Não definida',
      valid: isValidConfig
    });
    
    if (!isValidConfig) {
      console.log('⚠️ Supabase não configurado, usando LocalStorage');
    } else {
      console.log('✅ Supabase configurado, usando dados reais');
    }
  }, []);

  // Carregar dados quando o usuário mudar
  useEffect(() => {
    if (authLoading || permissionsLoading) return;
    loadData();
  }, [user, authLoading, useSupabase, permissions, permissionsLoading]);

  const loadData = async () => {
    setIsLoading(true);
    console.log('🔄 Iniciando carregamento de dados...');
    console.log('📊 useSupabase:', useSupabase, 'user:', !!user, 'isSeller:', isSeller);
    
    try {
      if (useSupabase && user) {
        console.log('🔗 Carregando dados do Supabase...');
        
        // Construir query base
        let query = supabase
          .from('sales')
          .select('*');
        
        // Filtrar por empresa
        if (permissions?.companyId) {
          console.log('🏢 Filtrando vendas da empresa:', permissions.companyId);
          query = query.eq('company_id', permissions.companyId);
        }
        
        // Se for vendedor, filtrar apenas suas vendas
        if (isSeller && permissions?.sellerId) {
          console.log('👤 Vendedor detectado! Filtrando vendas do seller_id:', permissions.sellerId);
          query = query.eq('seller_id', permissions.sellerId);
        }
        
        // Ordenar por data
        query = query.order('created_at', { ascending: false});
        
        const { data: salesData, error } = await query;
        
        if (error) {
          console.error('Erro ao carregar vendas:', error);
          setOrders([]);
        } else {
          console.log('✅ Vendas carregadas do Supabase:', salesData?.length || 0);
          
          // Converter dados do Supabase para o formato esperado
          const convertedOrders = (salesData || []).map(sale => ({
            id: sale.id,
            date: sale.created_at,
            customer: sale.customer || 'Cliente PDV',
            email: sale.customer_email || 'sem-email@pdv.com',
            amount: sale.total_amount || sale.amount || 0,
            status: sale.status || 'paid',
            category: sale.category || 'Venda PDV',
            description: sale.description || 'Venda realizada'
          }));
          
          setOrders(convertedOrders);
          // Calcular lucro real
const paidSaleIds = (salesData || [])
  .filter(s => s.status === 'paid')
  .map(s => s.id);

if (paidSaleIds.length > 0) {
  const { data: items } = await supabase
    .from('sale_items')
    .select('quantity, unit_price, total_price, products(cost_price)')
    .in('sale_id', paidSaleIds);

  if (items) {
    const totalRevenue = items.reduce((sum: number, item: any) => sum + (item.total_price || 0), 0);
    const totalCost = items.reduce((sum: number, item: any) => {
      const cost = item.products?.cost_price || 0;
      return sum + (cost * item.quantity);
    }, 0);
    setProfitData({ revenue: totalRevenue, cost: totalCost, profit: totalRevenue - totalCost });
  }
}
        }
      } else {
        console.log('💾 Carregando dados do LocalStorage...');
        // Usar LocalStorage apenas se Supabase não estiver configurado
        const localOrders = SalesService.loadSales();
        console.log('✅ Dados carregados do LocalStorage:', localOrders.length, 'vendas');
        setOrders(localOrders);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      // Em caso de erro, tentar LocalStorage como fallback
      const localOrders = SalesService.loadSales();
      setOrders(localOrders);
    } finally {
      setIsLoading(false);
      console.log('🏁 Carregamento finalizado');
    }
  };

  const filteredOrders = useMemo(() => filterOrders(orders, filters), [orders, filters]);

  // Função para adicionar nova venda
  const handleAddSale = async (saleData: Omit<OrderRow, 'id'>) => {
    try {
      if (useSupabase && user) {
        const newSale = await SupabaseService.addSale(saleData);
        setOrders(prev => [newSale, ...prev]);
      } else {
        const newSale = SalesService.addSale(saleData);
        setOrders(prev => [newSale, ...prev]);
      }
    } catch (error) {
      console.error('Erro ao adicionar venda:', error);
      alert('Erro ao adicionar venda');
    }
  };

  // Função para recarregar dados
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadData();
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      alert('Erro ao atualizar dados. Tente novamente.');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Função para limpar todos os dados
  const handleClearAllData = async () => {
    if (!window.confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      if (useSupabase && user) {
        // Limpar dados do Supabase usando query direta
        const { error } = await supabase
          .from('sales')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Deleta todos os registros
        
        if (error) {
          console.error('Erro do Supabase:', error);
          throw new Error(`Erro do Supabase: ${error.message}`);
        }
      } else {
        // Limpar LocalStorage
        try {
          SalesService.clearAllData();
        } catch (localError) {
          console.error('Erro no LocalStorage:', localError);
          // Forçar limpeza manual
          localStorage.removeItem('dashboard-vendas-data');
        }
      }
      
      // Atualizar estado local
      setOrders([]);
      alert('Todos os dados foram limpos com sucesso!');
      
    } catch (error: any) {
      console.error('Erro completo ao limpar dados:', error);
      
      // Tentar limpeza de emergência apenas local
      setOrders([]);
      
      alert(`Erro ao limpar dados remotos, mas dados locais foram limpos.\nErro: ${error.message || 'Erro desconhecido'}`);
    }
  };

  // Função para logout
  const handleLogout = async () => {
    if (useSupabase) {
      await signOut();
    }
    setOrders([]);
  };

  // Cálculos dos KPIs
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.amount, 0);
  const totalOrders = filteredOrders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const paidOrders = filteredOrders.filter((o) => o.status === "paid").length;
  const conversionRate = totalOrders > 0 ? (paidOrders / totalOrders) * 100 : 0;

  // Dados para gráfico de linha (receita por dia)
  const lineChartData = useMemo(() => {
    const dailyRevenue = new Map<string, number>();
    
    filteredOrders
      .filter((order) => order.status === "paid")
      .forEach((order) => {
        const date = order.date.split("T")[0];
        dailyRevenue.set(date, (dailyRevenue.get(date) || 0) + order.amount);
      });

    return Array.from(dailyRevenue.entries())
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30); // Últimos 30 dias
  }, [filteredOrders]);

  // Dados para gráfico de barras (receita por categoria)
  const barChartData = useMemo(() => {
    const categoryRevenue = new Map<string, number>();
    
    filteredOrders
      .filter((order) => order.status === "paid")
      .forEach((order) => {
        categoryRevenue.set(order.category, (categoryRevenue.get(order.category) || 0) + order.amount);
      });

    return Array.from(categoryRevenue.entries()).map(([category, revenue]) => ({
      category,
      revenue,
    }));
  }, [filteredOrders]);

  // Dados para gráfico donut (pedidos por status)
  const donutChartData = useMemo(() => {
    const statusCount = new Map<string, number>();
    
    filteredOrders.forEach((order) => {
      statusCount.set(order.status, (statusCount.get(order.status) || 0) + 1);
    });

    const statusLabels = {
      paid: "Pagos",
      pending: "Pendentes",
      canceled: "Cancelados",
    };

    return Array.from(statusCount.entries()).map(([status, value]) => ({
      name: statusLabels[status as keyof typeof statusLabels],
      value,
      status: status as "paid" | "pending" | "canceled",
    }));
  }, [filteredOrders]);

  if (authLoading || permissionsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-slate-400">
          <RefreshCw className="w-5 h-5 animate-spin" />
          {permissionsLoading ? 'Carregando permissões...' : 'Carregando...'}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-slate-400">
          <RefreshCw className="w-5 h-5 animate-spin" />
          Carregando dados...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
  <div className="min-w-0">
    <h1 className="text-2xl font-bold text-slate-100">
      {isSeller ? '📊 Minhas Vendas' : '📊 Painel de Vendas'}
    </h1>
    <p className="mt-1 text-sm text-slate-400 truncate">
      {useSupabase ? (
        <>
          🔗 {user?.email}
          {isSeller && permissions?.sellerName && <> • {permissions.sellerName}</>}
          {!isSeller && permissions?.companyName && <> • {permissions.companyName}</>}
          {' '}• {orders.length} vendas
        </>
      ) : (
        <>💾 Local • {orders.length} vendas</>
      )}
    </p>
  </div>
  <div className="flex items-center gap-2 flex-shrink-0">
    {useSupabase && user && (
      <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg">
        <User className="w-4 h-4 text-slate-400" />
        <span className="text-sm text-slate-300 max-w-[150px] truncate">{user.email}</span>
        <button onClick={handleLogout} className="ml-1 p-1 text-slate-400 hover:text-slate-200 rounded">
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    )}
    <button onClick={handleClearAllData} className="flex items-center gap-1 px-3 py-2 text-xs text-red-400 hover:text-red-300 border border-red-500/30 rounded-lg transition-colors">
      🗑️ <span className="hidden sm:inline ml-1">Limpar</span>
    </button>
  <button onClick={handleRefresh} disabled={isRefreshing} className={`flex items-center gap-1 px-3 py-2 text-xs border border-slate-700 rounded-lg transition-colors ${isRefreshing ? 'text-slate-500 cursor-not-allowed' : 'text-slate-400 hover:text-slate-200'}`}>
      <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      <span className="hidden sm:inline ml-1">{isRefreshing ? 'Atualizando...' : 'Atualizar'}</span>
    </button>
    
  </div>
</div>

      <FiltersBar value={filters} onChange={setFilters} />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title={isSeller ? "Minhas Vendas" : "Receita Total"}
          value={totalRevenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          hint={`${totalOrders} ${isSeller ? 'vendas realizadas' : 'pedidos no período'}`}
        />
        <KpiCard
          title="Pedidos"
          value={totalOrders.toString()}
          hint={`${paidOrders} pagos, ${filteredOrders.filter((o) => o.status === "pending").length} pendentes`}
        />
        <KpiCard
          title="Ticket Médio"
          value={avgOrderValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          hint="Valor médio por pedido"
        />
        <KpiCard
          title={isSeller ? "Minha Conversão" : "Taxa de Conversão"}
          value={`${conversionRate.toFixed(1)}%`}
          hint="Pedidos pagos / total"
        />
      </div>

      {/* Análise de Lucro */}
{profitData.revenue > 0 && (
  <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h3 className="text-base font-semibold text-slate-100">Análise de Lucro</h3>
        <p className="text-xs text-slate-400 mt-0.5">Baseado nas vendas pagas do período</p>
      </div>
      <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
        profitData.profit >= 0 
          ? 'bg-green-500/15 text-green-400 border border-green-500/30' 
          : 'bg-red-500/15 text-red-400 border border-red-500/30'
      }`}>
        {profitData.profit >= 0 ? '▲' : '▼'} {profitData.revenue > 0 ? ((profitData.profit / profitData.revenue) * 100).toFixed(1) : 0}% margem
      </div>
    </div>

    <div className="grid grid-cols-3 gap-6 mb-6">
      {/* Receita */}
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-blue-400"></div>
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Receita</span>
        </div>
        <div className="text-xl font-bold text-blue-400">
          {profitData.revenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </div>
        <div className="text-xs text-slate-500 mt-1">Total vendido</div>
      </div>

      {/* Custo */}
      <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-red-400"></div>
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Custo</span>
        </div>
        <div className="text-xl font-bold text-red-400">
          {profitData.cost.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </div>
        <div className="text-xs text-slate-500 mt-1">Custo dos produtos</div>
      </div>

      {/* Lucro */}
      <div className={`${profitData.profit >= 0 ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'} border rounded-xl p-4`}>
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-2 h-2 rounded-full ${profitData.profit >= 0 ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Lucro</span>
        </div>
        <div className={`text-xl font-bold ${profitData.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {profitData.profit.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </div>
        <div className="text-xs text-slate-500 mt-1">Receita − Custo</div>
      </div>
    </div>

    {/* Barra de progresso */}
    <div>
      <div className="flex justify-between text-xs text-slate-400 mb-2">
        <span>Custo ({profitData.revenue > 0 ? ((profitData.cost / profitData.revenue) * 100).toFixed(1) : 0}%)</span>
        <span>Lucro ({profitData.revenue > 0 ? ((profitData.profit / profitData.revenue) * 100).toFixed(1) : 0}%)</span>
      </div>
      <div className="h-3 bg-slate-800 rounded-full overflow-hidden flex">
        <div 
          className="h-full bg-red-500/70 transition-all duration-500"
          style={{ width: `${profitData.revenue > 0 ? Math.min((profitData.cost / profitData.revenue) * 100, 100) : 0}%` }}
        />
        <div 
          className="h-full bg-green-500/70 transition-all duration-500"
          style={{ width: `${profitData.revenue > 0 ? Math.max((profitData.profit / profitData.revenue) * 100, 0) : 0}%` }}
        />
      </div>
      <div className="flex items-center gap-4 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/70"></div>
          <span className="text-xs text-slate-500">Custo</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/70"></div>
          <span className="text-xs text-slate-500">Lucro</span>
        </div>
      </div>
    </div>
  </div>
)}

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <LineChartCard data={lineChartData} />
        </div>
        <DonutChartCard data={donutChartData} />
        <div className="lg:col-span-2 xl:col-span-3">
          <BarChartCard data={barChartData} />
        </div>
      </div>

      {/* Tabela */}
      <DataTable rows={filteredOrders} />

      {/* Modals */}
      <AddSaleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddSale}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}