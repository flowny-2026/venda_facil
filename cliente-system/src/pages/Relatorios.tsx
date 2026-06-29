import { Download, TrendingUp, DollarSign, Package, AlertCircle, FileText, Printer, FileSpreadsheet, BarChart3, Archive } from "lucide-react";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { useUserRole } from "../hooks/useUserRole";

// jsPDF removido - usar exportação HTML/CSV nativa
// Se precisar de PDF no futuro, instalar: npm install jspdf jspdf-autotable

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
  stock_quantity: number;
  min_stock: number;
  track_stock: boolean;
  active: boolean;
}

type ReportType = 'vendas' | 'pagamentos' | 'vendedores' | 'inventario';
type PeriodType = 'mes' | 'trimestre' | 'ano';

export default function Relatorios() {
  const { user } = useAuth();
  const { isSeller, permissions } = useUserRole();
  const [reportType, setReportType] = useState<ReportType>('vendas');
  const [period, setPeriod] = useState<PeriodType>('mes');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const getCompanyId = async (): Promise<string | null> => {
    if (permissions?.companyId) return permissions.companyId;
    if (!user) return null;
    const { data } = await supabase.from('company_users').select('company_id').eq('user_id', user.id).single();
    return data?.company_id || null;
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const getPeriodLabel = () => {
    if (period === 'mes') return 'Último Mês';
    if (period === 'trimestre') return 'Últimos 3 Meses';
    return 'Último Ano';
  };

  const generateReport = async () => {
    setLoading(true);
    setError(null);
    setReportData(null);
    setInventoryData([]);

    try {
      const companyId = await getCompanyId();
      if (!companyId) { setError('Empresa não encontrada'); return; }

      if (reportType === 'inventario') {
        const { data: products, error: prodError } = await supabase
          .from('products')
          .select(`*, product_categories(name)`)
          .eq('company_id', companyId)
          .order('name');

        if (prodError) throw prodError;

        const items: InventoryItem[] = (products || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          sku: p.sku || '-',
          barcode: p.barcode || '-',
          category: p.product_categories?.name || 'Sem categoria',
          price: p.price || 0,
          cost_price: p.cost_price || 0,
          stock_quantity: p.stock_quantity || 0,
          min_stock: p.min_stock || 0,
          track_stock: p.track_stock,
          active: p.active
        }));

        setInventoryData(items);
        return;
      }

      const now = new Date();
      let startDate = new Date();
      if (period === 'mes') startDate.setMonth(now.getMonth() - 1);
      else if (period === 'trimestre') startDate.setMonth(now.getMonth() - 3);
      else startDate.setFullYear(now.getFullYear() - 1);

      let salesQuery = supabase.from('sales').select('*').eq('company_id', companyId).gte('created_at', startDate.toISOString());
      if (isSeller && permissions?.sellerId) salesQuery = salesQuery.eq('seller_id', permissions.sellerId);
      const { data: sales, error: salesError } = await salesQuery;
      if (salesError) throw salesError;

      if (!sales || sales.length === 0) {
        setReportData({ totalVendas: 0, totalProdutos: 0, ticketMedio: 0, vendasPorCategoria: [], vendasPorVendedor: [], vendasPorFormaPagamento: [] });
        return;
      }

      const sellerIds = [...new Set(sales.map((s: any) => s.seller_id).filter(Boolean))];
      const paymentMethodIds = [...new Set(sales.map((s: any) => s.payment_method_id).filter(Boolean))];

      const [sellersRes, paymentMethodsRes, saleItemsRes] = await Promise.all([
        sellerIds.length > 0 ? supabase.from('sellers').select('id, name').in('id', sellerIds) : Promise.resolve({ data: [] }),
        paymentMethodIds.length > 0 ? supabase.from('payment_methods').select('id, name').in('id', paymentMethodIds) : Promise.resolve({ data: [] }),
        supabase.from('sale_items').select('*, products(name, product_categories(name))').in('sale_id', sales.map((s: any) => s.id))
      ]);

      const sellersMap = new Map((sellersRes.data || []).map((s: any) => [s.id, s]));
      const paymentMethodsMap = new Map((paymentMethodsRes.data || []).map((pm: any) => [pm.id, pm]));

      const totalVendas = sales.reduce((sum: number, s: any) => sum + (s.total_amount || 0), 0);
      const totalProdutos = (saleItemsRes.data || []).reduce((sum: number, i: any) => sum + (i.quantity || 0), 0);
      const ticketMedio = sales.length > 0 ? totalVendas / sales.length : 0;

      // Por categoria (via sale_items)
      const catMap = new Map<string, { total: number; quantidade: number }>();
      (saleItemsRes.data || []).forEach((item: any) => {
        const cat = item.products?.product_categories?.name || 'Sem Categoria';
        const cur = catMap.get(cat) || { total: 0, quantidade: 0 };
        catMap.set(cat, { total: cur.total + item.total_price, quantidade: cur.quantidade + item.quantity });
      });

      // Por vendedor
      const vendMap = new Map<string, { total: number; quantidade: number }>();
      sales.forEach((s: any) => {
        const vend = sellersMap.get(s.seller_id)?.name || 'Sem Vendedor';
        const cur = vendMap.get(vend) || { total: 0, quantidade: 0 };
        vendMap.set(vend, { total: cur.total + s.total_amount, quantidade: cur.quantidade + 1 });
      });

      // Por forma de pagamento
      const pmMap = new Map<string, { total: number; quantidade: number }>();
      sales.forEach((s: any) => {
        const pm = paymentMethodsMap.get(s.payment_method_id)?.name || 'Não informado';
        const cur = pmMap.get(pm) || { total: 0, quantidade: 0 };
        pmMap.set(pm, { total: cur.total + s.total_amount, quantidade: cur.quantidade + 1 });
      });

      setReportData({
        totalVendas, totalProdutos, ticketMedio,
        vendasPorCategoria: Array.from(catMap.entries()).map(([categoria, d]) => ({ categoria, ...d })),
        vendasPorVendedor: Array.from(vendMap.entries()).map(([vendedor, d]) => ({ vendedor, ...d })),
        vendasPorFormaPagamento: Array.from(pmMap.entries()).map(([forma, d]) => ({ forma, ...d })),
      });
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar relatório');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    let csv = '';
    let filename = '';

    if (reportType === 'inventario' && inventoryData.length > 0) {
      csv = 'Nome,SKU,Código de Barras,Categoria,Preço Venda,Preço Custo,Estoque,Estoque Mínimo,Status\n';
      inventoryData.forEach(p => {
        csv += `"${p.name}","${p.sku}","${p.barcode}","${p.category}","${p.price.toFixed(2)}","${p.cost_price.toFixed(2)}","${p.stock_quantity}","${p.min_stock}","${p.active ? 'Ativo' : 'Inativo'}"\n`;
      });
      filename = 'inventario.csv';
    } else if (reportData) {
      if (reportType === 'vendas') {
        csv = 'Categoria,Total,Quantidade\n';
        reportData.vendasPorCategoria.forEach(i => { csv += `"${i.categoria}","${i.total.toFixed(2)}","${i.quantidade}"\n`; });
        filename = `vendas_categoria_${period}.csv`;
      } else if (reportType === 'pagamentos') {
        csv = 'Forma de Pagamento,Total,Quantidade\n';
        reportData.vendasPorFormaPagamento.forEach(i => { csv += `"${i.forma}","${i.total.toFixed(2)}","${i.quantidade}"\n`; });
        filename = `vendas_pagamento_${period}.csv`;
      } else if (reportType === 'vendedores') {
        csv = 'Vendedor,Total,Quantidade\n';
        reportData.vendasPorVendedor.forEach(i => { csv += `"${i.vendedor}","${i.total.toFixed(2)}","${i.quantidade}"\n`; });
        filename = `vendedores_${period}.csv`;
      }
    }

    if (!csv) return;
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  // Exportar PDF usando HTML nativo (sem jsPDF)
  const exportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Permita popups para exportar PDF');
      return;
    }

    const now = new Date().toLocaleDateString('pt-BR');
    let title = '';
    let content = '';

    if (reportType === 'inventario' && inventoryData.length > 0) {
      title = 'Relatório de Inventário';
      content = `
        <h1>${title}</h1>
        <p>Gerado em: ${now}</p>
        <p>Total de produtos: ${inventoryData.length}</p>
        <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%;">
          <thead>
            <tr style="background: #333; color: white;">
              <th>Produto</th><th>Categoria</th><th>Estoque</th><th>Mín.</th><th>Preço Venda</th><th>Preço Custo</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${inventoryData.map(p => `
              <tr>
                <td>${p.name}</td>
                <td>${p.category}</td>
                <td>${p.track_stock ? p.stock_quantity : '∞'}</td>
                <td>${p.min_stock}</td>
                <td>${formatCurrency(p.price)}</td>
                <td>${formatCurrency(p.cost_price)}</td>
                <td>${p.active ? 'Ativo' : 'Inativo'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (reportData) {
      title = `Relatório de ${reportType === 'vendas' ? 'Vendas por Categoria' : reportType === 'pagamentos' ? 'Formas de Pagamento' : 'Vendedores'}`;
      const rows = reportType === 'vendas'
        ? reportData.vendasPorCategoria.map(i => [i.categoria, formatCurrency(i.total), i.quantidade.toString(), `${((i.total / reportData.totalVendas) * 100).toFixed(1)}%`])
        : reportType === 'pagamentos'
        ? reportData.vendasPorFormaPagamento.map(i => [i.forma, formatCurrency(i.total), i.quantidade.toString(), `${((i.total / reportData.totalVendas) * 100).toFixed(1)}%`])
        : reportData.vendasPorVendedor.map(i => [i.vendedor, formatCurrency(i.total), i.quantidade.toString(), `${((i.total / reportData.totalVendas) * 100).toFixed(1)}%`]);

      content = `
        <h1>${title}</h1>
        <p>Período: ${getPeriodLabel()} | Gerado em: ${now}</p>
        <p>Total de Vendas: ${formatCurrency(reportData.totalVendas)}</p>
        <p>Ticket Médio: ${formatCurrency(reportData.ticketMedio)}</p>
        <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%;">
          <thead>
            <tr style="background: #333; color: white;">
              <th>Descrição</th><th>Total</th><th>Qtd</th><th>% Total</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
      `;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; }
            table { margin-top: 20px; }
            th, td { border: 1px solid #ddd; text-align: left; }
            th { background: #2563eb; color: white; }
            tr:nth-child(even) { background: #f5f5f5; }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const printReport = () => {
    window.print();
  };

  const totalEstoque = inventoryData.reduce((s, p) => s + (p.stock_quantity * p.cost_price), 0);
  const totalEstoqueVenda = inventoryData.reduce((s, p) => s + (p.stock_quantity * p.price), 0);
  const produtosBaixoEstoque = inventoryData.filter(p => p.track_stock && p.stock_quantity <= p.min_stock).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Relatórios</h1>
        <p className="mt-2 text-slate-400">Relatórios detalhados e análises do seu negócio</p>
      </div>

      {/* Configurações */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-slate-100 mb-4">Gerar Relatório</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Tipo</label>
            <select value={reportType} onChange={(e) => setReportType(e.target.value as ReportType)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
              <option value="vendas">Vendas por Categoria</option>
              <option value="pagamentos">Formas de Pagamento</option>
              {!isSeller && <option value="vendedores">Performance de Vendedores</option>}
              <option value="inventario">📦 Inventário de Produtos</option>
            </select>
          </div>
          {reportType !== 'inventario' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Período</label>
              <select value={period} onChange={(e) => setPeriod(e.target.value as PeriodType)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                <option value="mes">Último mês</option>
                <option value="trimestre">Últimos 3 meses</option>
                <option value="ano">Último ano</option>
              </select>
            </div>
          )}
          <div className={reportType === 'inventario' ? 'md:col-span-2' : ''} style={{display:'flex', alignItems:'flex-end'}}>
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

      {/* INVENTÁRIO */}
      {reportType === 'inventario' && inventoryData.length > 0 && (
        <>
          {/* KPIs inventário */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
              <div className="text-xs text-slate-400 mb-1">Total Produtos</div>
              <div className="text-2xl font-bold text-slate-100">{inventoryData.length}</div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
              <div className="text-xs text-slate-400 mb-1">Valor em Custo</div>
              <div className="text-xl font-bold text-red-400">{formatCurrency(totalEstoque)}</div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
              <div className="text-xs text-slate-400 mb-1">Valor em Venda</div>
              <div className="text-xl font-bold text-green-400">{formatCurrency(totalEstoqueVenda)}</div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
              <div className="text-xs text-slate-400 mb-1">Estoque Baixo</div>
              <div className="text-2xl font-bold text-amber-400">{produtosBaixoEstoque}</div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-3 flex-wrap">
            <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 text-sm text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/10 transition-colors">
              <FileSpreadsheet className="w-4 h-4" /> Exportar Excel/CSV
            </button>
            <button onClick={exportPDF} className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors">
              <FileText className="w-4 h-4" /> Exportar PDF
            </button>
            <button onClick={printReport} className="flex items-center gap-2 px-4 py-2 text-sm text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/10 transition-colors">
              <Printer className="w-4 h-4" /> Imprimir
            </button>
          </div>

          {/* Tabela inventário */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center gap-2">
              <Archive className="w-5 h-5 text-blue-400" />
              <h3 className="text-base font-semibold text-slate-100">Inventário Completo ({inventoryData.length} produtos)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Produto</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Categoria</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Estoque</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Mín.</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Preço Custo</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Preço Venda</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Margem</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Valor Total</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {inventoryData.map((p) => {
                    const margem = p.price > 0 ? ((p.price - p.cost_price) / p.price * 100) : 0;
                    const valorTotal = p.stock_quantity * p.cost_price;
                    const baixoEstoque = p.track_stock && p.stock_quantity <= p.min_stock;
                    return (
                      <tr key={p.id} className={`hover:bg-slate-800/30 ${baixoEstoque ? 'bg-amber-500/5' : ''}`}>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-slate-200">{p.name}</div>
                          {p.sku !== '-' && <div className="text-xs text-slate-500">SKU: {p.sku}</div>}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-400">{p.category}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-sm font-medium ${baixoEstoque ? 'text-amber-400' : 'text-slate-200'}`}>
                            {p.track_stock ? p.stock_quantity : '∞'}
                          </span>
                          {baixoEstoque && <div className="text-xs text-amber-500">Baixo!</div>}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-slate-400">{p.min_stock}</td>
                        <td className="px-4 py-3 text-right text-sm text-slate-300">{formatCurrency(p.cost_price)}</td>
                        <td className="px-4 py-3 text-right text-sm text-green-400 font-medium">{formatCurrency(p.price)}</td>
                        <td className="px-4 py-3 text-right text-sm text-blue-400">{margem.toFixed(1)}%</td>
                        <td className="px-4 py-3 text-right text-sm text-slate-300">{formatCurrency(valorTotal)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs px-2 py-1 rounded-full ${p.active ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                            {p.active ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-800/30 border-t border-slate-700">
                  <tr>
                    <td colSpan={4} className="px-4 py-3 text-sm font-semibold text-slate-300">TOTAL</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-red-400">{formatCurrency(totalEstoque)}</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-green-400">{formatCurrency(totalEstoqueVenda)}</td>
                    <td colSpan={3}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}

      {/* RELATÓRIOS DE VENDAS */}
      {reportData && reportType !== 'inventario' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <span className="text-sm text-slate-400">Produtos Vendidos</span>
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

          <div className="flex gap-3 flex-wrap">
            <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 text-sm text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/10 transition-colors">
              <FileSpreadsheet className="w-4 h-4" /> Exportar CSV
            </button>
            <button onClick={exportPDF} className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors">
              <FileText className="w-4 h-4" /> Exportar PDF
            </button>
            <button onClick={printReport} className="flex items-center gap-2 px-4 py-2 text-sm text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/10 transition-colors">
              <Printer className="w-4 h-4" /> Imprimir
            </button>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              <h3 className="text-base font-semibold text-slate-100">
                {reportType === 'vendas' && 'Vendas por Categoria'}
                {reportType === 'pagamentos' && 'Vendas por Forma de Pagamento'}
                {reportType === 'vendedores' && 'Performance de Vendedores'}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">
                      {reportType === 'vendas' ? 'Categoria' : reportType === 'pagamentos' ? 'Forma de Pagamento' : 'Vendedor'}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Total</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Quantidade</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">% do Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {(reportType === 'vendas' ? reportData.vendasPorCategoria.map(i => ({ label: i.categoria, ...i }))
                    : reportType === 'pagamentos' ? reportData.vendasPorFormaPagamento.map(i => ({ label: i.forma, ...i }))
                    : reportData.vendasPorVendedor.map(i => ({ label: i.vendedor, ...i }))
                  ).map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30">
                      <td className="px-4 py-3 text-sm text-slate-200">{item.label}</td>
                      <td className="px-4 py-3 text-right text-sm text-green-400 font-medium">{formatCurrency(item.total)}</td>
                      <td className="px-4 py-3 text-right text-sm text-slate-300">{item.quantidade}</td>
                      <td className="px-4 py-3 text-right text-sm text-blue-400">
                        {reportData.totalVendas > 0 ? ((item.total / reportData.totalVendas) * 100).toFixed(1) : 0}%
                      </td>
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