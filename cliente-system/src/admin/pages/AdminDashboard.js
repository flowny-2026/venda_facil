import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Building2, Users, ShoppingCart, DollarSign, TrendingUp, Activity, RefreshCw } from 'lucide-react';
import { AdminService } from '../services/adminService';
export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
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
        }
        catch (err) {
            setError('Erro ao carregar estatísticas');
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    };
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsxs("div", { className: "flex items-center gap-2 text-slate-400", children: [_jsx(RefreshCw, { className: "w-5 h-5 animate-spin" }), "Carregando estat\u00EDsticas..."] }) }));
    }
    if (error) {
        return (_jsxs("div", { className: "text-center py-12", children: [_jsx("div", { className: "text-red-400 mb-4", children: error }), _jsx("button", { onClick: loadStats, className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors", children: "Tentar Novamente" })] }));
    }
    const statCards = [
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
    const getColorClasses = (color) => {
        const colors = {
            blue: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
            green: 'bg-green-500/15 text-green-400 border-green-500/20',
            purple: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
            amber: 'bg-amber-500/15 text-amber-400 border-amber-500/20'
        };
        return colors[color] || colors.blue;
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-slate-100", children: "Dashboard Administrativo" }), _jsx("p", { className: "mt-2 text-slate-400", children: "Vis\u00E3o geral do sistema SaaS de vendas" })] }), _jsxs("button", { onClick: loadStats, className: "flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors", children: [_jsx(RefreshCw, { className: "w-4 h-4" }), "Atualizar"] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: statCards.map((card, index) => (_jsxs("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("div", { className: `p-3 rounded-xl border ${getColorClasses(card.color)}`, children: _jsx(card.icon, { className: "w-6 h-6" }) }), _jsx(TrendingUp, { className: "w-4 h-4 text-slate-500" })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("h3", { className: "text-sm font-medium text-slate-400", children: card.title }), _jsx("div", { className: "text-2xl font-bold text-slate-100", children: card.value }), _jsx("p", { className: "text-xs text-slate-500", children: card.subtitle })] })] }, index))) }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl p-6", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("div", { className: "p-2 bg-green-500/15 rounded-lg", children: _jsx(Activity, { className: "w-5 h-5 text-green-400" }) }), _jsx("h2", { className: "text-lg font-semibold text-slate-100", children: "Status das Empresas" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-slate-300", children: "Empresas Ativas" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-2 h-2 bg-green-400 rounded-full" }), _jsx("span", { className: "text-slate-100 font-medium", children: stats?.active_companies || 0 })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-slate-300", children: "Empresas Inativas" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-2 h-2 bg-red-400 rounded-full" }), _jsx("span", { className: "text-slate-100 font-medium", children: (stats?.total_companies || 0) - (stats?.active_companies || 0) })] })] }), _jsx("div", { className: "pt-4 border-t border-slate-700", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-slate-300", children: "Taxa de Ativa\u00E7\u00E3o" }), _jsxs("span", { className: "text-slate-100 font-medium", children: [stats?.total_companies ?
                                                            Math.round((stats.active_companies / stats.total_companies) * 100) : 0, "%"] })] }) })] })] }), _jsxs("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl p-6", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("div", { className: "p-2 bg-blue-500/15 rounded-lg", children: _jsx(DollarSign, { className: "w-5 h-5 text-blue-400" }) }), _jsx("h2", { className: "text-lg font-semibold text-slate-100", children: "Resumo Financeiro" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-slate-300", children: "Receita Total" }), _jsx("span", { className: "text-slate-100 font-medium", children: (stats?.total_revenue || 0).toLocaleString('pt-BR', {
                                                    style: 'currency',
                                                    currency: 'BRL'
                                                }) })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-slate-300", children: "Ticket M\u00E9dio" }), _jsx("span", { className: "text-slate-100 font-medium", children: stats?.total_sales ?
                                                    ((stats.total_revenue || 0) / stats.total_sales).toLocaleString('pt-BR', {
                                                        style: 'currency',
                                                        currency: 'BRL'
                                                    }) : 'R$ 0,00' })] }), _jsx("div", { className: "pt-4 border-t border-slate-700", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-slate-300", children: "Vendas por Empresa" }), _jsx("span", { className: "text-slate-100 font-medium", children: stats?.total_companies ?
                                                        Math.round((stats.total_sales || 0) / stats.total_companies) : 0 })] }) })] })] })] }), _jsxs("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl p-6", children: [_jsx("h2", { className: "text-lg font-semibold text-slate-100 mb-4", children: "A\u00E7\u00F5es R\u00E1pidas" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("button", { className: "flex items-center gap-3 p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors text-left", children: [_jsx(Building2, { className: "w-5 h-5 text-blue-400" }), _jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium text-slate-200", children: "Gerenciar Empresas" }), _jsx("div", { className: "text-xs text-slate-400", children: "Ver todas as empresas" })] })] }), _jsxs("button", { className: "flex items-center gap-3 p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors text-left", children: [_jsx(Users, { className: "w-5 h-5 text-green-400" }), _jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium text-slate-200", children: "Ver Usu\u00E1rios" }), _jsx("div", { className: "text-xs text-slate-400", children: "Listar todos os usu\u00E1rios" })] })] }), _jsxs("button", { className: "flex items-center gap-3 p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors text-left", children: [_jsx(ShoppingCart, { className: "w-5 h-5 text-purple-400" }), _jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium text-slate-200", children: "Relat\u00F3rio de Vendas" }), _jsx("div", { className: "text-xs text-slate-400", children: "An\u00E1lise detalhada" })] })] })] })] })] }));
}
