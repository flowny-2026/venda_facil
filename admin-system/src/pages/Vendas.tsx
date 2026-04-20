import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import { 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Building,
  User,
  RefreshCw,
  Filter,
  CreditCard,
  Banknote,
  Smartphone,
  Percent
} from 'lucide-react';

interface Sale {
  id: string;
  amount: number;
  total_amount: number;
  discount_amount: number;
  payment_received: number;
  change_amount: number;
  status: 'paid' | 'pending' | 'canceled';
  created_at: string;
  description: string;
  company_id: string;
  user_id: string;
  seller_id: string;
  payment_method_id: string;
  companies?: {
    name: string;
  };
  sellers?: {
    name: string;
  };
  payment_methods?: {
    name: string;
    type: string;
  };
}

export default function Vendas() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'canceled'>('all');

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          companies (name),
          sellers (name),
          payment_methods (name, type)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSales(data || []);
    } catch (error) {
      console.error('Erro ao carregar vendas:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSales = sales.filter(sale => 
    filter === 'all' || sale.status === filter
  );

  const totalSales = sales.length;
  const totalRevenue = sales.reduce((sum, sale) => sum + (sale.status === 'paid' ? (sale.total_amount || sale.amount) : 0), 0);
  const paidSales = sales.filter(s => s.status === 'paid').length;
  const pendingSales = sales.filter(s => s.status === 'pending').length;
  const totalDiscount = sales.reduce((sum, sale) => sum + (sale.discount_amount || 0), 0);
  
  // Estatísticas por forma de pagamento
  const paymentStats = sales.reduce((acc: any, sale) => {
    if (sale.status === 'paid' && sale.payment_methods) {
      const method = sale.payment_methods.name;
      acc[method] = (acc[method] || 0) + (sale.total_amount || sale.amount);
    }
    return acc;
  }, {});

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'cash': return <Banknote className="w-4 h-4" />;
      case 'credit_card': 
      case 'debit_card': return <CreditCard className="w-4 h-4" />;
      case 'pix': return <Smartphone className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500/15 text-green-400 border-green-500/30';
      case 'pending': return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'canceled': return 'bg-red-500/15 text-red-400 border-red-500/30';
      default: return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2 text-slate-400">
            <RefreshCw className="w-5 h-5 animate-spin" />
            Carregando vendas...
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
            <h1 className="text-3xl font-bold text-slate-100">Todas as Vendas</h1>
            <p className="text-slate-400">Visualize e gerencie todas as vendas do sistema</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadSales}
              className="flex items-center gap-2 px-4 py-2 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800/50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-blue-400" />
              <div>
                <div className="text-2xl font-bold text-slate-100">{totalSales}</div>
                <div className="text-sm text-slate-400">Total de Vendas</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-green-400" />
              <div>
                <div className="text-2xl font-bold text-slate-100">{formatCurrency(totalRevenue)}</div>
                <div className="text-sm text-slate-400">Receita Total</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500/15 rounded-lg flex items-center justify-center">
                <span className="text-green-400 font-bold">✓</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-100">{paidSales}</div>
                <div className="text-sm text-slate-400">Vendas Pagas</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-500/15 rounded-lg flex items-center justify-center">
                <span className="text-amber-400 font-bold">⏳</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-100">{pendingSales}</div>
                <div className="text-sm text-slate-400">Vendas Pendentes</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <Percent className="w-8 h-8 text-red-400" />
              <div>
                <div className="text-2xl font-bold text-slate-100">{formatCurrency(totalDiscount)}</div>
                <div className="text-sm text-slate-400">Total Descontos</div>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas por Forma de Pagamento */}
        {Object.keys(paymentStats).length > 0 && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-400" />
              Vendas por Forma de Pagamento
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(paymentStats).map(([method, amount]: [string, any]) => (
                <div key={method} className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {getPaymentIcon('cash')}
                    <span className="text-sm font-medium text-slate-200">{method}</span>
                  </div>
                  <div className="text-lg font-bold text-green-400">
                    {formatCurrency(amount)}
                  </div>
                  <div className="text-xs text-slate-400">
                    {totalRevenue > 0 ? Math.round((amount / totalRevenue) * 100) : 0}% do total
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-400">Filtrar por status:</span>
          </div>
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'Todas' },
              { key: 'paid', label: 'Pagas' },
              { key: 'pending', label: 'Pendentes' },
              { key: 'canceled', label: 'Canceladas' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
                  filter === key
                    ? 'bg-red-500/15 text-red-400 border-red-500/30'
                    : 'border-slate-700 text-slate-400 hover:bg-slate-800/50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Vendas */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h3 className="text-lg font-semibold text-slate-100">
              Vendas ({filteredSales.length})
            </h3>
          </div>
          
          {filteredSales.length === 0 ? (
            <div className="p-12 text-center">
              <TrendingUp className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-300 mb-2">
                {filter === 'all' ? 'Nenhuma venda encontrada' : `Nenhuma venda ${filter} encontrada`}
              </h3>
              <p className="text-slate-400">
                {filter === 'all' 
                  ? 'As vendas aparecerão aqui quando os clientes começarem a usar o sistema.'
                  : 'Tente alterar o filtro para ver outras vendas.'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Venda</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Empresa</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Vendedor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Valores</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Pagamento</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-800/30">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-slate-200">
                            {sale.description || 'Venda sem descrição'}
                          </div>
                          <div className="text-xs text-slate-500">ID: {sale.id.slice(0, 8)}...</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-200">
                            {sale.companies?.name || 'Empresa não identificada'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400" />
                          <div>
                            <div className="text-sm text-slate-200">
                              {sale.sellers?.name || 'Vendedor não identificado'}
                            </div>
                            <div className="text-xs text-slate-500">
                              ID: {sale.user_id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-slate-200">
                            Total: {formatCurrency(sale.total_amount || sale.amount)}
                          </div>
                          {sale.discount_amount > 0 && (
                            <div className="text-xs text-red-400">
                              Desconto: -{formatCurrency(sale.discount_amount)}
                            </div>
                          )}
                          {sale.change_amount > 0 && (
                            <div className="text-xs text-blue-400">
                              Troco: {formatCurrency(sale.change_amount)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {sale.payment_methods && getPaymentIcon(sale.payment_methods.type)}
                          <div>
                            <div className="text-sm text-slate-200">
                              {sale.payment_methods?.name || 'Não informado'}
                            </div>
                            {sale.payment_received > 0 && (
                              <div className="text-xs text-slate-400">
                                Recebido: {formatCurrency(sale.payment_received)}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-lg border ${getStatusColor(sale.status)}`}>
                          {sale.status === 'paid' ? 'Paga' : sale.status === 'pending' ? 'Pendente' : 'Cancelada'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Calendar className="w-4 h-4" />
                          {formatDate(sale.created_at)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}