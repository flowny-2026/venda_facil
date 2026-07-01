import { Download, TrendingUp, DollarSign, Package, AlertCircle, FileText, Printer, BarChart3 } from "lucide-react";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { useUserRole } from "../hooks/useUserRole";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ReportData {
  totalVendas: number;
  totalProdutos: number;
  ticketMedio: number;
  vendasPorCategoria: { categoria: string; total: number; quantidade: number }[];
  vendasPorVendedor: { vendedor: string; total: number; quantidade: number }[];
  vendasPorFormaPagamento: { forma: string; total: number; quantidade: number }[];
}

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  price: number;
  cost_price: number;
  promotional_price: number;
  stock_quantity: number;
  min_stock: number;
  track_stock: boolean;
  active: boolean;
}

export default function Relatorios() {
  const { user } = useAuth();
  const { isSeller, permissions } = useUserRole();
  const [reportType, setReportType] = useState<'vendas' | 'produtos' | 'vendedores' | 'inventario'>('vendas');
  const [period, setPeriod] = useState<'mes' | 'trimestre' | 'ano'>('mes');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const getCompanyId = async (): Promise<string | null> => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('company_users')
      .select('company_id')
      .eq('user_id', user.id)
      .single();
    if (error) return null;
    return data?.company_id || null;
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const generateReport = async () => {
    setLoading(true);
    setError(null);
    setReportData(null);
    setInventoryData([]);

    try {
      const companyId = await getCompanyId();
      if (!companyId) { setError('Empresa não encontrada'); return; }

      // Relatório de Inventário
      if (reportType === 'inventario') {
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select(`*, product_categories(name)`)
          .eq('company_id', companyId)
          .order('name');

        if (productsError) throw productsError;

        const inventory = (products || []).map(p => ({
          id: p.id,
          name: p.name,
          sku: p.sku || '-',
          barcode: p.barcode || '-',
          category: p.product_categories?.name || 'Sem Categoria',
          price: p.price || 0,
          cost_price: p.cost_price || 0,
          promotional_price: p.promotional_price || 0,
          stock_quantity: p.stock_quantity || 0,
          min_stock: p.min_stock || 0,
          track_stock: p.track_stock,
          active: p.active
        }));

        setInventoryData(inventory);
        return;
      }

      // Relatórios de Vendas
      const now = new Date();
      let startDate = new Date();
      if (period === 'mes') startDate.setMonth(now.getMonth() - 1);
      else if (period === 'trimestre') startDate.setMonth(now.getMonth() - 3);
      else startDate.setFullYear(now.getFullYear() - 1);

      let salesQuery = supabase
        .from('sales')
        .select('*, sale_items(*, products(name, product_categories(name))), sellers(name), payment_methods(name)')
        .eq('company_id', companyId)
        .gte('created_at', startDate.toISOString());

      if (isSeller && permissions?.sellerId) {
        salesQuery = salesQuery.eq('seller_id', permissions.sellerId);
      }

      const { data: sales, error: salesError } = await salesQuery;
      if (salesError) throw salesError;

      if (!sales || sales.length === 0) {
        setReportData({ totalVendas: 0, totalProdutos: 0, ticketMedio: 0, vendasPorCategoria: [], vendasPorVendedor: [], vendasPorFormaPagamento: [] });
        return;
      }

      const totalVendas = sales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
      const totalProdutos = sales.reduce((sum, s) => sum + (s.sale_items?.length || 0), 0);
      const ticketMedio = totalVendas / sales.length;

      // Por categoria
      const categoriaMap = new Map<string, { total: number; quantidade: number }>();
      sales.forEach(sale => {
        (sale.sale_items || []).forEach((item: any) => {
          const cat = item.products?.product_categories?.name || 'Sem Categoria';
          const cur = categoriaMap.get(cat) || { total: 0, quantidade: 0 };
          categoriaMap.set(cat, { total: cur.total + (item.total_price || 0), quantidade: cur.quantidade + (item.quantity || 0) });
        });
      });

      // Por vendedor
      const vendedorMap = new Map<string, { total: number; quantidade: number }>();
      sales.forEach(sale => {
        const v = (sale as any).sellers?.name || 'Sem Vendedor';
        const cur = vendedorMap.get(v) || { total: 0, quantidade: 0 };
        vendedorMap.set(v, { total: cur.total + (sale.total_amount || 0), quantidade: cur.quantidade + 1 });
      });

      // Por pagamento
      const pagamentoMap = new Map<string, { total: number; quantidade: number }>();
      sales.forEach(sale => {
        const pm = (sale as any).payment_methods?.name || 'Não Informado';
        const cur = pagamentoMap.get(pm) || { total: 0, quantidade: 0 };
        pagamentoMap.set(pm, { total: cur.total + (sale.total_amount || 0), quantidade: cur.quantidade + 1 });
      });

      setReportData({
        totalVendas, totalProdutos, ticketMedio,
        vendasPorCategoria: Array.from(categoriaMap.entries()).map(([categoria, d]) => ({ categoria, ...d })),
        vendasPorVendedor: Array.from(vendedorMap.entries()).map(([vendedor, d]) => ({ vendedor, ...d })),
        vendasPorFormaPagamento: Array.from(pagamentoMap.entries()).map(([forma, d]) => ({ forma, ...d })),
      });

    } catch (err: any) {
      setError(err.message || 'Erro ao gerar relatório');
    } finally {
      setLoading(false);
    }
  };

  // Exportar Inventário CSV
  const exportInventoryCSV = () => {
    const header = 'Nome,SKU,Código de Barras,Categoria,Preço Venda,Preço Custo,Estoque,Estoque Mínimo,Status\n';
    const rows = inventoryData.map(p =>
      `"${p.name}","${p.sku}","${p.barcode}","${p.category}","${p.price.toFixed(2)}","${p.cost_price.toFixed(2)}","${p.stock_quantity}","${p.min_stock}","${p.active ? 'Ativo' : 'Inativo'}"`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `inventario_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.csv`;
    link.click();
  };

  // Exportar Inventário PDF
  const exportInventoryPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(16);
    doc.text('Relatório de Inventário', 14, 15);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 22);

    const totalEstoque = inventoryData.reduce((sum, p) => sum + (p.track_stock ? p.stock_quantity : 0), 0);
    const totalValorVenda = inventoryData.reduce((sum, p) => sum + (p.price * p.stock_quantity), 0);
    const totalValorCusto = inventoryData.reduce((sum, p) => sum + (p.cost_price * p.stock_quantity), 0);

    doc.text(`Total de Produtos: ${inventoryData.length} | Total em Estoque: ${totalEstoque} un | Valor Total (Venda): ${formatCurrency(totalValorVenda)} | Valor Total (Custo): ${formatCurrency(totalValorCusto)}`, 14, 29);

    autoTable(doc, {
      startY: 34,
      head: [['Nome', 'SKU', 'Categoria', 'Preço Venda', 'Preço Custo', 'Lucro Unit.', 'Estoque', 'Mín.', 'Status']],
      body: inventoryData.map(p => [
        p.name,
        p.sku,
        p.category,
        formatCurrency(p.price),
        formatCurrency(p.cost_price),
        formatCurrency(p.price - p.cost_price),
        p.track_stock ? p.stock_quantity.toString() : '∞',
        p.min_stock.toString(),
        p.active ? 'Ativo' : 'Inativo'
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 41, 59] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    doc.save(`inventario_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`);
  };

  // Imprimir Inventário
  const printInventory = () => {
    const totalEstoque = inventoryData.reduce((sum, p) => sum + (p.track_stock ? p.stock_quantity : 0), 0);
    const totalValorVenda = inventoryData.reduce((sum, p) => sum + (p.price * p.stock_quantity), 0);
    const totalValorCusto = inventoryData.reduce((sum, p) => sum + (p.cost_price * p.stock_quantity), 0);

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Inventário</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 12px; }
        h1 { font-size: 18px; margin-bottom: 4px; }
        p { margin: 2px 0; color: #555; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th { background: #1e293b; color: white; padding: 8px; text-align: left; font-size: 11px; }
        td { padding: 6px 8px; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
        tr:nth-child(even) td { background: #f8fafc; }
        .summary { display: flex; gap: 24px; margin: 12px 0; padding: 12px; background: #f1f5f9; border-radius: 8px; }
        .summary div { text-align: center; }
        .summary strong { display: block; font-size: 16px; }
        .low { color: #dc2626; }
        @media print { body { margin: 10px; } }
      </style></head><body>
      <h1>Relatório de Inventário</h1>
      <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
      <div class="summary">
        <div><strong>${inventoryData.length}</strong>Produtos</div>
        <div><strong>${totalEstoque}</strong>Unidades</div>
        <div><strong>${formatCurrency(totalValorVenda)}</strong>Valor Venda</div>
        <div><strong>${formatCurrency(totalValorCusto)}</strong>Valor Custo</div>
        <div><strong>${formatCurrency(totalValorVenda - totalValorCusto)}</strong>Lucro Potencial</div>
      </div>
      <table>
        <thead><tr>
          <th>Nome</th><th>SKU</th><th>Categoria</th>
          <th>Preço Venda</th><th>Preço Custo</th><th>Lucro Unit.</th>
          <th>Estoque</th><th>Mín.</th><th>Status</th>
        </tr></thead>
        <tbody>
          ${inventoryData.map(p => `
            <tr>
              <td>${p.name}</td>
              <td>${p.sku}</td>
              <td>${p.category}</td>
              <td>${formatCurrency(p.price)}</td>
              <td>${formatCurrency(p.cost_price)}</td>
              <td>${formatCurrency(p.price - p.cost_price)}</td>
              <td class="${p.track_stock && p.stock_quantity <= p.min_stock ? 'low' : ''}">${p.track_stock ? p.stock_quantity : '∞'}</td>
              <td>${p.min_stock}</td>
              <td>${p.active ? 'Ativo' : 'Inativo'}</td>
            </tr>`).join('')}
        </tbody>
      </table>
      <script>window.onload = () => { window.print(); window.close(); }</script>
      </body></html>
    `);
    printWindow.document.close();
  };

  // Exportar CSV de vendas
  const exportToCSV = () => {
    if (!reportData) return;
    let csv = '';
    if (reportType === 'vendas') {
      csv = 'Categoria,Total,Quantidade\n' + reportData.vendasPorCategoria.map(i => `${i.categoria},${i.total.toFixed(2)},${i.quantidade}`).join('\n');
    } else if (reportType === 'produtos') {
      csv = 'Forma de Pagamento,Total,Quantidade\n' + reportData.vendasPorFormaPagamento.map(i => `${i.forma},${i.total.toFixed(2)},${i.quantidade}`).join('\n');
    } else if (reportType === 'vendedores') {
      csv = 'Vendedor,Total,Quantidade\n' + reportData.vendasPorVendedor.map(i => `${i.vendedor},${i.total.toFixed(2)},${i.quantidade}`).join('\n');
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_${reportType}_${period}.csv`;
    link.click();
  };

  const getPeriodLabel = () => {
    if (period === 'mes') return 'Último Mês';
    if (period === 'trimestre') return 'Últimos 3 Meses';
    return 'Último Ano';
  };

  const totalEstoqueValue = inventoryData.reduce((sum, p) => sum + (p.price * p.stock_quantity), 0);
  const totalCustoValue = inventoryData.reduce((sum, p) => sum + (p.cost_price * p.stock_quantity), 0);
  const produtosBaixoEstoque = inventoryData.filter(p => p.track_stock && p.stock_quantity <= p.min_stock).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Relatórios</h1>
        <p className="mt-2 text-slate-400">Relatórios detalhados e análises do seu negócio</p>
      </div>

      {/* Filtros */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-slate-100 mb-4">Gerar Relatório</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Tipo</label>
            <select value={reportType} onChange={(e) => setReportType(e.target.value as any)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
              <option value="vendas">Vendas por Categoria</option>
              <option value="produtos">Vendas por Pagamento</option>
              {!isSeller && <option value="vendedores">Performance de Vendedores</option>}
              <option value="inventario">📦 Inventário de Estoque</option>
            </select>
          </div>
          {reportType !== 'inventario' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Período</label>
              <select value={period} onChange={(e) => setPeriod(e.target.value as any)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                <option value="mes">Último mês</option>
                <option value="trimestre">Últimos 3 meses</option>
                <option value="ano">Último ano</option>
              </select>
            </div>
          )}
          <div className={reportType === 'inventario' ? 'md:col-span-2' : ''}>
            <label className="block text-sm font-medium text-slate-300 mb-2">&nbsp;</label>
            <button onClick={generateReport} disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
              {loading ? 'Gerando...' : 'Gerar Relatório'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/25 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Relatório de Inventário */}
      {inventoryData.length > 0 && reportType === 'inventario' && (
        <>
          {/* KPIs do Inventário */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Package className="w-5 h-5 text-blue-400" />
                <span className="text-xs text-slate-400">Total Produtos</span>
              </div>
              <div className="text-2xl font-bold text-slate-100">{inventoryData.length}</div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-5 h-5 text-green-400" />
                <span className="text-xs text-slate-400">Valor em Estoque</span>
              </div>
              <div className="text-xl font-bold text-green-400">{formatCurrency(totalEstoqueValue)}</div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-5 h-5 text-purple-400" />
                <span className="text-xs text-slate-400">Custo em Estoque</span>
              </div>
              <div className="text-xl font-bold text-purple-400">{formatCurrency(totalCustoValue)}</div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-xs text-slate-400">Estoque Baixo</span>
              </div>
              <div className="text-2xl font-bold text-red-400">{produtosBaixoEstoque}</div>
            </div>
          </div>

          {/* Tabela de Inventário */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-lg font-semibold text-slate-100">📦 Inventário Completo</h2>
              <div className="flex gap-2">
                <button onClick={printInventory}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors">
                  <Printer className="w-4 h-4" /> Imprimir
                </button>
                <button onClick={exportInventoryCSV}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-green-400 border border-green-500/30 rounded-lg hover:border-green-500/50 transition-colors">
                  <Download className="w-4 h-4" /> CSV
                </button>
                <button onClick={exportInventoryPDF}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-blue-400 border border-blue-500/30 rounded-lg hover:border-blue-500/50 transition-colors">
                  <FileText className="w-4 h-4" /> PDF
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Produto</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Categoria</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Preço Venda</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Preço Custo</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Lucro Unit.</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Estoque</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Valor Total</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {inventoryData.map((product) => {
                    const isLowStock = product.track_stock && product.stock_quantity <= product.min_stock;
                    return (
                      <tr key={product.id} className={`hover:bg-slate-800/30 ${isLowStock ? 'bg-red-500/5' : ''}`}>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-slate-200">{product.name}</div>
                          <div className="text-xs text-slate-500">{product.sku !== '-' ? `SKU: ${product.sku}` : ''}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-300">{product.category}</td>
                        <td className="px-4 py-3 text-sm text-slate-200 text-right">{formatCurrency(product.price)}</td>
                        <td className="px-4 py-3 text-sm text-slate-200 text-right">{formatCurrency(product.cost_price)}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-sm font-medium ${product.price - product.cost_price >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {formatCurrency(product.price - product.cost_price)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-sm font-medium ${isLowStock ? 'text-red-400' : 'text-slate-200'}`}>
                            {product.track_stock ? product.stock_quantity : '∞'}
                            {isLowStock && <span className="text-xs ml-1">⚠️</span>}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-200 text-right">
                          {formatCurrency(product.price * product.stock_quantity)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex px-2 py-0.5 text-xs rounded-full ${product.active ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                            {product.active ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Relatórios de Vendas */}
      {reportData && reportType !== 'inventario' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Total de Vendas</span>
                <DollarSign className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-slate-100">{formatCurrency(reportData.totalVendas)}</p>
              <p className="text-xs text-slate-500 mt-1">{getPeriodLabel()}</p>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Itens Vendidos</span>
                <Package className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-slate-100">{reportData.totalProdutos}</p>
              <p className="text-xs text-slate-500 mt-1">{getPeriodLabel()}</p>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Ticket Médio</span>
                <TrendingUp className="w-5 h-5 text-orange-400" />
              </div>
              <p className="text-2xl font-bold text-slate-100">{formatCurrency(reportData.ticketMedio)}</p>
              <p className="text-xs text-slate-500 mt-1">{getPeriodLabel()}</p>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-100">
                {reportType === 'vendas' && 'Vendas por Categoria'}
                {reportType === 'produtos' && 'Vendas por Forma de Pagamento'}
                {reportType === 'vendedores' && 'Performance de Vendedores'}
              </h2>
              <button onClick={exportToCSV}
                className="flex items-center gap-2 px-3 py-2 text-sm text-blue-400 border border-blue-500/25 rounded-lg hover:border-blue-500/50 transition-colors">
                <Download className="w-4 h-4" /> CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-300">
                      {reportType === 'vendas' ? 'Categoria' : reportType === 'produtos' ? 'Forma de Pagamento' : 'Vendedor'}
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-300">Total</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-300">Quantidade</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-300">% do Total</th>
                  </tr>
                </thead>
                <tbody>
                  {reportType === 'vendas' && reportData.vendasPorCategoria.map((item, i) => (
                    <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                      <td className="py-3 px-4 text-sm text-slate-200">{item.categoria}</td>
                      <td className="py-3 px-4 text-sm text-slate-200 text-right">{formatCurrency(item.total)}</td>
                      <td className="py-3 px-4 text-sm text-slate-200 text-right">{item.quantidade}</td>
                      <td className="py-3 px-4 text-sm text-slate-200 text-right">{((item.total / reportData.totalVendas) * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                  {reportType === 'produtos' && reportData.vendasPorFormaPagamento.map((item, i) => (
                    <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                      <td className="py-3 px-4 text-sm text-slate-200">{item.forma}</td>
                      <td className="py-3 px-4 text-sm text-slate-200 text-right">{formatCurrency(item.total)}</td>
                      <td className="py-3 px-4 text-sm text-slate-200 text-right">{item.quantidade}</td>
                      <td className="py-3 px-4 text-sm text-slate-200 text-right">{((item.total / reportData.totalVendas) * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                  {reportType === 'vendedores' && reportData.vendasPorVendedor.map((item, i) => (
                    <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                      <td className="py-3 px-4 text-sm text-slate-200">{item.vendedor}</td>
                      <td className="py-3 px-4 text-sm text-slate-200 text-right">{formatCurrency(item.total)}</td>
                      <td className="py-3 px-4 text-sm text-slate-200 text-right">{item.quantidade}</td>
                      <td className="py-3 px-4 text-sm text-slate-200 text-right">{((item.total / reportData.totalVendas) * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}