import { useState, useMemo, useEffect } from "react";
import { Plus, RefreshCw, LogOut, User } from "lucide-react";
import FiltersBar, { Filters } from "../components/FiltersBar";
import KpiCard from "../components/KpiCard";
import LineChartCard from "../components/charts/LineChartCard";
import BarChartCard from "../components/charts/BarChartCard";
import DonutChartCard from "../components/charts/DonutChartCard";
import DataTable from "../components/DataTable";
import AddSaleModal from "../components/AddSaleModal";
import AuthModal from "../components/AuthModal";
import { OrderRow, MOCK_ORDERS } from "../data/mock";
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
        
        // Se for vendedor, filtrar apenas suas vendas
        if (isSeller && permissions?.sellerId) {
          console.log('👤 Vendedor detectado! Filtrando vendas do seller_id:', permissions.sellerId);
          query = query.eq('seller_id', permissions.sellerId);
        }
        
        // Ordenar por data
        query = query.order('created_at', { ascending: false });
        
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
      {/* Debug Info - Remover depois */}
      {isSeller && (
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-400 mb-2">🔍 Modo Vendedor Ativo</h3>
          <div className="text-xs text-slate-300 space-y-1">
            <p>• Vendedor: {permissions?.sellerName || 'Carregando...'}</p>
            <p>• Seller ID: {permissions?.sellerId || 'Não definido'}</p>
            <p>• Empresa: {permissions?.companyName || 'Carregando...'}</p>
            <p>• Vendas exibidas: {orders.length}</p>
            <p>• Pode ver lucros: {permissions?.canViewCompanyProfits ? 'Sim' : 'Não'}</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">
            {isSeller ? '📊 Minhas Vendas' : '📊 Painel de Vendas'}
          </h1>
          <p className="mt-2 text-slate-400">
            {useSupabase ? (
              <>
                🔗 Conectado ao Supabase • {user?.email}
                {isSeller && permissions?.sellerName && (
                  <> • Vendedor: {permissions.sellerName}</>
                )}
                {!isSeller && permissions?.companyName && (
                  <> • {permissions.companyName}</>
                )} • {orders.length} vendas
              </>
            ) : (
              <>
                {useSupabase ? (
                  <>🔗 Conectado ao Supabase • {orders.length} vendas registradas</>
                ) : (
                  <>💾 Usando armazenamento local • {orders.length} vendas registradas</>
                )}
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {useSupabase && user && (
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg">
              <User className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-300">{user.email}</span>
              <button
                onClick={handleLogout}
                className="ml-2 p-1 text-slate-400 hover:text-slate-200 rounded"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
          <button
            onClick={handleClearAllData}
            className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 border border-red-500/30 rounded-lg hover:border-red-500/50 transition-colors"
          >
            🗑️ Limpar Tudo
          </button>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`flex items-center gap-2 px-4 py-2 text-sm border border-slate-700 rounded-lg transition-colors ${
              isRefreshing 
                ? 'text-slate-500 border-slate-800 cursor-not-allowed' 
                : 'text-slate-400 hover:text-slate-200 hover:border-slate-600'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Atualizando...' : 'Atualizar'}
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nova Venda
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