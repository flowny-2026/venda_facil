import { TrendingUp, TrendingDown, DollarSign, Package, ShoppingCart, Calendar } from 'lucide-react';

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

interface SellerPerformanceCardProps {
  stats: SellerStats;
}

export default function SellerPerformanceCard({ stats }: SellerPerformanceCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getPerformanceColor = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 100) return 'text-green-400';
    if (percentage >= 70) return 'text-blue-400';
    if (percentage >= 40) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors">
      {/* Header - Nome do Vendedor */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">{stats.sellerName}</h3>
          <p className="text-sm text-slate-400">Comissão: {stats.commission}%</p>
        </div>
        <div className="p-3 bg-blue-500/10 rounded-lg">
          <TrendingUp className="w-6 h-6 text-blue-400" />
        </div>
      </div>

      {/* Métricas do Dia */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-slate-400" />
          <h4 className="text-sm font-semibold text-slate-300 uppercase">Hoje</h4>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {/* Vendas do Dia */}
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingCart className="w-3 h-3 text-blue-400" />
              <span className="text-xs text-slate-400">Vendas</span>
            </div>
            <div className="text-lg font-bold text-slate-100">
              {stats.todaySales}
            </div>
          </div>

          {/* Peças Vendidas */}
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-3 h-3 text-purple-400" />
              <span className="text-xs text-slate-400">Peças</span>
            </div>
            <div className="text-lg font-bold text-slate-100">
              {stats.todayItemsCount}
            </div>
          </div>

          {/* Ticket Médio Dia */}
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-3 h-3 text-green-400" />
              <span className="text-xs text-slate-400">Ticket</span>
            </div>
            <div className="text-sm font-bold text-slate-100">
              {formatCurrency(stats.todayTicketAvg)}
            </div>
          </div>
        </div>
      </div>

      {/* Métricas do Mês */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-slate-400" />
          <h4 className="text-sm font-semibold text-slate-300 uppercase">Este Mês</h4>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {/* Vendas do Mês */}
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingCart className="w-3 h-3 text-blue-400" />
              <span className="text-xs text-slate-400">Vendas</span>
            </div>
            <div className="text-lg font-bold text-slate-100">
              {stats.monthSales}
            </div>
          </div>

          {/* Peças Vendidas */}
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-3 h-3 text-purple-400" />
              <span className="text-xs text-slate-400">Peças</span>
            </div>
            <div className="text-lg font-bold text-slate-100">
              {stats.monthItemsCount}
            </div>
          </div>

          {/* Ticket Médio Mês */}
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-3 h-3 text-green-400" />
              <span className="text-xs text-slate-400">Ticket</span>
            </div>
            <div className="text-sm font-bold text-slate-100">
              {formatCurrency(stats.monthTicketAvg)}
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Progresso (opcional - se tiver meta) */}
      {stats.monthSales > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Performance do Mês</span>
            <span className="font-semibold text-slate-300">
              {formatCurrency(stats.monthSales * stats.monthTicketAvg)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
