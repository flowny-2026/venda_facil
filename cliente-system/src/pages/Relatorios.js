import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Download, TrendingUp, DollarSign, Package, AlertCircle } from "lucide-react";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { useUserRole } from "../hooks/useUserRole";
export default function Relatorios() {
    const { user } = useAuth();
    const { isSeller, userSellerId } = useUserRole();
    const [reportType, setReportType] = useState('vendas');
    const [period, setPeriod] = useState('mes');
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [error, setError] = useState(null);
    // Buscar company_id do usuário
    const getCompanyId = async () => {
        if (!user)
            return null;
        const { data, error } = await supabase
            .from('company_users')
            .select('company_id')
            .eq('user_id', user.id)
            .single();
        if (error) {
            console.error('Erro ao buscar company_id:', error);
            return null;
        }
        return data?.company_id || null;
    };
    // Gerar relatório
    const generateReport = async () => {
        setLoading(true);
        setError(null);
        try {
            const companyId = await getCompanyId();
            if (!companyId) {
                setError('Empresa não encontrada');
                return;
            }
            // Calcular data inicial baseada no período
            const now = new Date();
            let startDate = new Date();
            if (period === 'mes') {
                startDate.setMonth(now.getMonth() - 1);
            }
            else if (period === 'trimestre') {
                startDate.setMonth(now.getMonth() - 3);
            }
            else if (period === 'ano') {
                startDate.setFullYear(now.getFullYear() - 1);
            }
            // Buscar vendas do período
            let salesQuery = supabase
                .from('sales')
                .select('*')
                .eq('company_id', companyId)
                .gte('created_at', startDate.toISOString());
            // Se for vendedor, filtrar apenas suas vendas
            if (isSeller && userSellerId) {
                salesQuery = salesQuery.eq('seller_id', userSellerId);
            }
            const { data: sales, error: salesError } = await salesQuery;
            if (salesError)
                throw salesError;
            if (!sales || sales.length === 0) {
                setReportData({
                    totalVendas: 0,
                    totalProdutos: 0,
                    ticketMedio: 0,
                    vendasPorCategoria: [],
                    vendasPorVendedor: [],
                    vendasPorFormaPagamento: [],
                });
                return;
            }
            // Buscar produtos, vendedores e formas de pagamento separadamente
            const productIds = [...new Set(sales.map(s => s.product_id).filter(Boolean))];
            const sellerIds = [...new Set(sales.map(s => s.seller_id).filter(Boolean))];
            const paymentMethodIds = [...new Set(sales.map(s => s.payment_method_id).filter(Boolean))];
            const [productsRes, sellersRes, paymentMethodsRes] = await Promise.all([
                productIds.length > 0
                    ? supabase.from('products').select('id, name, category').in('id', productIds)
                    : Promise.resolve({ data: [], error: null }),
                sellerIds.length > 0
                    ? supabase.from('sellers').select('id, name').in('id', sellerIds)
                    : Promise.resolve({ data: [], error: null }),
                paymentMethodIds.length > 0
                    ? supabase.from('payment_methods').select('id, name').in('id', paymentMethodIds)
                    : Promise.resolve({ data: [], error: null }),
            ]);
            // Criar maps para lookup rápido
            const productsMap = new Map(productsRes.data?.map(p => [p.id, p]) || []);
            const sellersMap = new Map(sellersRes.data?.map(s => [s.id, s]) || []);
            const paymentMethodsMap = new Map(paymentMethodsRes.data?.map(pm => [pm.id, pm]) || []);
            // Enriquecer vendas com dados relacionados
            const enrichedSales = sales.map(sale => ({
                ...sale,
                product: productsMap.get(sale.product_id),
                seller: sellersMap.get(sale.seller_id),
                payment_method: paymentMethodsMap.get(sale.payment_method_id),
            }));
            // Calcular métricas
            const totalVendas = enrichedSales.reduce((sum, sale) => sum + sale.total_amount, 0);
            const totalProdutos = enrichedSales.reduce((sum, sale) => sum + sale.quantity, 0);
            const ticketMedio = totalVendas / enrichedSales.length;
            // Vendas por categoria
            const categoriaMap = new Map();
            enrichedSales.forEach(sale => {
                const categoria = sale.product?.category || 'Sem Categoria';
                const current = categoriaMap.get(categoria) || { total: 0, quantidade: 0 };
                categoriaMap.set(categoria, {
                    total: current.total + sale.total_amount,
                    quantidade: current.quantidade + sale.quantity,
                });
            });
            const vendasPorCategoria = Array.from(categoriaMap.entries()).map(([categoria, data]) => ({
                categoria,
                ...data,
            }));
            // Vendas por vendedor
            const vendedorMap = new Map();
            enrichedSales.forEach(sale => {
                const vendedor = sale.seller?.name || 'Sem Vendedor';
                const current = vendedorMap.get(vendedor) || { total: 0, quantidade: 0 };
                vendedorMap.set(vendedor, {
                    total: current.total + sale.total_amount,
                    quantidade: current.quantidade + sale.quantity,
                });
            });
            const vendasPorVendedor = Array.from(vendedorMap.entries()).map(([vendedor, data]) => ({
                vendedor,
                ...data,
            }));
            // Vendas por forma de pagamento
            const pagamentoMap = new Map();
            enrichedSales.forEach(sale => {
                const forma = sale.payment_method?.name || 'Não Informado';
                const current = pagamentoMap.get(forma) || { total: 0, quantidade: 0 };
                pagamentoMap.set(forma, {
                    total: current.total + sale.total_amount,
                    quantidade: current.quantidade + 1,
                });
            });
            const vendasPorFormaPagamento = Array.from(pagamentoMap.entries()).map(([forma, data]) => ({
                forma,
                ...data,
            }));
            setReportData({
                totalVendas,
                totalProdutos,
                ticketMedio,
                vendasPorCategoria,
                vendasPorVendedor,
                vendasPorFormaPagamento,
            });
        }
        catch (err) {
            console.error('Erro ao gerar relatório:', err);
            setError(err.message || 'Erro ao gerar relatório');
        }
        finally {
            setLoading(false);
        }
    };
    // Exportar relatório para CSV
    const exportToCSV = () => {
        if (!reportData)
            return;
        let csvContent = '';
        if (reportType === 'vendas') {
            csvContent = 'Categoria,Total Vendas,Quantidade\n';
            reportData.vendasPorCategoria.forEach(item => {
                csvContent += `${item.categoria},R$ ${item.total.toFixed(2)},${item.quantidade}\n`;
            });
        }
        else if (reportType === 'produtos') {
            csvContent = 'Forma de Pagamento,Total,Quantidade\n';
            reportData.vendasPorFormaPagamento.forEach(item => {
                csvContent += `${item.forma},R$ ${item.total.toFixed(2)},${item.quantidade}\n`;
            });
        }
        else if (reportType === 'vendedores') {
            csvContent = 'Vendedor,Total Vendas,Quantidade\n';
            reportData.vendasPorVendedor.forEach(item => {
                csvContent += `${item.vendedor},R$ ${item.total.toFixed(2)},${item.quantidade}\n`;
            });
        }
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `relatorio_${reportType}_${period}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    const getPeriodLabel = () => {
        if (period === 'mes')
            return 'Último Mês';
        if (period === 'trimestre')
            return 'Últimos 3 Meses';
        return 'Último Ano';
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-slate-100", children: "Relat\u00F3rios" }), _jsx("p", { className: "mt-2 text-slate-400", children: "Acesse relat\u00F3rios detalhados e an\u00E1lises avan\u00E7adas" })] }), _jsxs("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-soft", children: [_jsx("h2", { className: "text-xl font-semibold text-slate-100 mb-4", children: "Gerar Novo Relat\u00F3rio" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Tipo de Relat\u00F3rio" }), _jsxs("select", { value: reportType, onChange: (e) => setReportType(e.target.value), className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50", children: [_jsx("option", { value: "vendas", children: "Vendas por Categoria" }), _jsx("option", { value: "produtos", children: "Vendas por Forma de Pagamento" }), !isSeller && _jsx("option", { value: "vendedores", children: "Performance de Vendedores" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Per\u00EDodo" }), _jsxs("select", { value: period, onChange: (e) => setPeriod(e.target.value), className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50", children: [_jsx("option", { value: "mes", children: "\u00DAltimo m\u00EAs" }), _jsx("option", { value: "trimestre", children: "\u00DAltimos 3 meses" }), _jsx("option", { value: "ano", children: "\u00DAltimo ano" })] })] }), _jsx("div", { className: "flex items-end", children: _jsx("button", { onClick: generateReport, disabled: loading, className: "w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed", children: loading ? 'Gerando...' : 'Gerar Relatório' }) })] })] }), error && (_jsxs("div", { className: "bg-red-500/10 border border-red-500/25 rounded-lg p-4 flex items-center gap-3", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-red-400" }), _jsx("p", { className: "text-red-400 text-sm", children: error })] })), reportData && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-soft", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm text-slate-400", children: "Total de Vendas" }), _jsx(DollarSign, { className: "w-5 h-5 text-emerald-400" })] }), _jsxs("p", { className: "text-2xl font-bold text-slate-100", children: ["R$ ", reportData.totalVendas.toFixed(2)] }), _jsx("p", { className: "text-xs text-slate-500 mt-1", children: getPeriodLabel() })] }), _jsxs("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-soft", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm text-slate-400", children: "Produtos Vendidos" }), _jsx(Package, { className: "w-5 h-5 text-blue-400" })] }), _jsx("p", { className: "text-2xl font-bold text-slate-100", children: reportData.totalProdutos }), _jsx("p", { className: "text-xs text-slate-500 mt-1", children: getPeriodLabel() })] }), _jsxs("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-soft", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm text-slate-400", children: "Ticket M\u00E9dio" }), _jsx(TrendingUp, { className: "w-5 h-5 text-orange-400" })] }), _jsxs("p", { className: "text-2xl font-bold text-slate-100", children: ["R$ ", reportData.ticketMedio.toFixed(2)] }), _jsx("p", { className: "text-xs text-slate-500 mt-1", children: getPeriodLabel() })] })] }), _jsxs("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-soft", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("h2", { className: "text-xl font-semibold text-slate-100", children: [reportType === 'vendas' && 'Vendas por Categoria', reportType === 'produtos' && 'Vendas por Forma de Pagamento', reportType === 'vendedores' && 'Performance de Vendedores'] }), _jsxs("button", { onClick: exportToCSV, className: "flex items-center gap-2 px-4 py-2 text-sm text-blue-400 hover:text-blue-300 border border-blue-500/25 rounded-lg hover:border-blue-500/50 transition-colors", children: [_jsx(Download, { className: "w-4 h-4" }), "Exportar CSV"] })] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-slate-800", children: [_jsxs("th", { className: "text-left py-3 px-4 text-sm font-medium text-slate-300", children: [reportType === 'vendas' && 'Categoria', reportType === 'produtos' && 'Forma de Pagamento', reportType === 'vendedores' && 'Vendedor'] }), _jsx("th", { className: "text-right py-3 px-4 text-sm font-medium text-slate-300", children: "Total" }), _jsx("th", { className: "text-right py-3 px-4 text-sm font-medium text-slate-300", children: "Quantidade" }), _jsx("th", { className: "text-right py-3 px-4 text-sm font-medium text-slate-300", children: "% do Total" })] }) }), _jsxs("tbody", { children: [reportType === 'vendas' && reportData.vendasPorCategoria.map((item, index) => (_jsxs("tr", { className: "border-b border-slate-800/50", children: [_jsx("td", { className: "py-3 px-4 text-sm text-slate-200", children: item.categoria }), _jsxs("td", { className: "py-3 px-4 text-sm text-slate-200 text-right", children: ["R$ ", item.total.toFixed(2)] }), _jsx("td", { className: "py-3 px-4 text-sm text-slate-200 text-right", children: item.quantidade }), _jsxs("td", { className: "py-3 px-4 text-sm text-slate-200 text-right", children: [((item.total / reportData.totalVendas) * 100).toFixed(1), "%"] })] }, index))), reportType === 'produtos' && reportData.vendasPorFormaPagamento.map((item, index) => (_jsxs("tr", { className: "border-b border-slate-800/50", children: [_jsx("td", { className: "py-3 px-4 text-sm text-slate-200", children: item.forma }), _jsxs("td", { className: "py-3 px-4 text-sm text-slate-200 text-right", children: ["R$ ", item.total.toFixed(2)] }), _jsx("td", { className: "py-3 px-4 text-sm text-slate-200 text-right", children: item.quantidade }), _jsxs("td", { className: "py-3 px-4 text-sm text-slate-200 text-right", children: [((item.total / reportData.totalVendas) * 100).toFixed(1), "%"] })] }, index))), reportType === 'vendedores' && reportData.vendasPorVendedor.map((item, index) => (_jsxs("tr", { className: "border-b border-slate-800/50", children: [_jsx("td", { className: "py-3 px-4 text-sm text-slate-200", children: item.vendedor }), _jsxs("td", { className: "py-3 px-4 text-sm text-slate-200 text-right", children: ["R$ ", item.total.toFixed(2)] }), _jsx("td", { className: "py-3 px-4 text-sm text-slate-200 text-right", children: item.quantidade }), _jsxs("td", { className: "py-3 px-4 text-sm text-slate-200 text-right", children: [((item.total / reportData.totalVendas) * 100).toFixed(1), "%"] })] }, index)))] })] }) })] })] }))] }));
}
