import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Users, DollarSign, TrendingUp, Activity, BarChart3, RefreshCw } from 'lucide-react';
export default function Admin() {
    const { user } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [activeTab, setActiveTab] = useState('dashboard');
    // Verificar se usuário é admin
    useEffect(() => {
        checkAdminStatus();
    }, [user]);
    const checkAdminStatus = async () => {
        if (!user) {
            setLoading(false);
            return;
        }
        try {
            const { data, error } = await supabase
                .rpc('is_admin', { user_uuid: user.id });
            if (error)
                throw error;
            setIsAdmin(data);
            if (data) {
                await loadAdminData();
            }
        }
        catch (error) {
            console.error('Erro ao verificar admin:', error);
            setIsAdmin(false);
        }
        finally {
            setLoading(false);
        }
    };
    const handleRefresh = async () => {
        setRefreshing(true);
        await loadAdminData();
        setRefreshing(false);
    };
    const loadAdminData = async () => {
        setLoading(true);
        try {
            // Carregar estatísticas
            const { data: statsData, error: statsError } = await supabase
                .from('admin_stats')
                .select('*')
                .single();
            if (statsError) {
                console.error('Erro ao carregar estatísticas:', statsError);
                // Se der erro, criar dados mock para teste
                setStats({
                    total_users: 0,
                    new_users_30d: 0,
                    new_users_7d: 0,
                    total_sales: 0,
                    total_revenue: 0,
                    avg_ticket: 0,
                    sales_30d: 0,
                    revenue_30d: 0,
                    paid_sales: 0,
                    pending_sales: 0,
                    canceled_sales: 0,
                    top_categories: []
                });
            }
            else {
                setStats(statsData);
            }
            // Carregar usuários
            const { data: usersData, error: usersError } = await supabase
                .from('admin_users_overview')
                .select('*')
                .limit(100);
            if (usersError) {
                console.error('Erro ao carregar usuários:', usersError);
                // Se der erro, tentar carregar usuários básicos
                const { data: basicUsers, error: basicError } = await supabase.auth.admin.listUsers();
                if (!basicError && basicUsers) {
                    const formattedUsers = basicUsers.users.map(user => ({
                        id: user.id,
                        email: user.email || '',
                        created_at: user.created_at,
                        email_confirmed_at: user.email_confirmed_at || '',
                        last_sign_in_at: user.last_sign_in_at || '',
                        full_name: user.user_metadata?.full_name || '',
                        company_name: user.user_metadata?.company_name || '',
                        total_sales: 0,
                        total_revenue: 0,
                        avg_ticket: 0,
                        last_sale: ''
                    }));
                    setUsers(formattedUsers);
                }
                else {
                    setUsers([]);
                }
            }
            else {
                setUsers(usersData || []);
            }
        }
        catch (error) {
            console.error('Erro geral ao carregar dados admin:', error);
            // Dados de fallback
            setStats({
                total_users: 0,
                new_users_30d: 0,
                new_users_7d: 0,
                total_sales: 0,
                total_revenue: 0,
                avg_ticket: 0,
                sales_30d: 0,
                revenue_30d: 0,
                paid_sales: 0,
                pending_sales: 0,
                canceled_sales: 0,
                top_categories: []
            });
            setUsers([]);
        }
        finally {
            setLoading(false);
        }
    };
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };
    const formatDate = (dateString) => {
        if (!dateString)
            return 'Nunca';
        return new Date(dateString).toLocaleDateString('pt-BR');
    };
    if (loading) {
        return (_jsx("div", { className: "min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center", children: _jsxs("div", { className: "flex items-center gap-2 text-slate-400", children: [_jsx(RefreshCw, { className: "w-5 h-5 animate-spin" }), "Verificando permiss\u00F5es..."] }) }));
    }
    if (!user) {
        return (_jsx("div", { className: "min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("h1", { className: "text-2xl font-bold text-red-400 mb-2", children: "Acesso Negado" }), _jsx("p", { className: "text-slate-400", children: "Voc\u00EA precisa fazer login para acessar esta \u00E1rea." })] }) }));
    }
    if (!isAdmin) {
        return (_jsx("div", { className: "min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("h1", { className: "text-2xl font-bold text-red-400 mb-2", children: "Acesso Restrito" }), _jsx("p", { className: "text-slate-400", children: "Voc\u00EA n\u00E3o tem permiss\u00E3o para acessar o painel administrativo." })] }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-slate-950 text-slate-100", children: [_jsxs("div", { className: "bg-slate-900/50 border-b border-slate-800 px-6 py-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-slate-100", children: "Painel Administrativo" }), _jsx("p", { className: "text-slate-400", children: "Gest\u00E3o completa do sistema" })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("span", { className: "text-sm text-slate-400", children: ["Admin: ", user.email] }), _jsxs("button", { onClick: handleRefresh, disabled: refreshing, className: `flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg text-sm transition-colors ${refreshing ? 'cursor-not-allowed' : ''}`, children: [_jsx(RefreshCw, { className: `w-4 h-4 ${refreshing ? 'animate-spin' : ''}` }), refreshing ? 'Atualizando...' : 'Atualizar'] })] })] }), _jsxs("div", { className: "flex gap-4 mt-6", children: [_jsx("button", { onClick: () => setActiveTab('dashboard'), className: `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'dashboard'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-400 hover:text-slate-200'}`, children: "Painel" }), _jsx("button", { onClick: () => setActiveTab('users'), className: `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'users'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-400 hover:text-slate-200'}`, children: "Usu\u00E1rios" }), _jsx("a", { href: "/admin/clientes", className: "px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors", children: "Gerenciar Clientes" }), _jsx("button", { onClick: () => setActiveTab('sales'), className: `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'sales'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-400 hover:text-slate-200'}`, children: "Vendas" })] })] }), _jsxs("div", { className: "p-6", children: [activeTab === 'dashboard' && stats && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl p-6", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 bg-blue-500/15 rounded-lg", children: _jsx(Users, { className: "w-5 h-5 text-blue-400" }) }), _jsxs("div", { children: [_jsx("div", { className: "text-2xl font-bold text-slate-100", children: stats.total_users }), _jsx("div", { className: "text-sm text-slate-400", children: "Total de Usu\u00E1rios" })] })] }) }), _jsx("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl p-6", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 bg-green-500/15 rounded-lg", children: _jsx(DollarSign, { className: "w-5 h-5 text-green-400" }) }), _jsxs("div", { children: [_jsx("div", { className: "text-2xl font-bold text-slate-100", children: formatCurrency(stats.total_revenue) }), _jsx("div", { className: "text-sm text-slate-400", children: "Receita Total" })] })] }) }), _jsx("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl p-6", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 bg-purple-500/15 rounded-lg", children: _jsx(TrendingUp, { className: "w-5 h-5 text-purple-400" }) }), _jsxs("div", { children: [_jsx("div", { className: "text-2xl font-bold text-slate-100", children: stats.total_sales }), _jsx("div", { className: "text-sm text-slate-400", children: "Total de Vendas" })] })] }) }), _jsx("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl p-6", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 bg-amber-500/15 rounded-lg", children: _jsx(Activity, { className: "w-5 h-5 text-amber-400" }) }), _jsxs("div", { children: [_jsx("div", { className: "text-2xl font-bold text-slate-100", children: formatCurrency(stats.avg_ticket) }), _jsx("div", { className: "text-sm text-slate-400", children: "Ticket M\u00E9dio" })] })] }) })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-slate-100 mb-4", children: "\u00DAltimos 30 Dias" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-slate-400", children: "Novos Usu\u00E1rios:" }), _jsx("span", { className: "text-slate-200", children: stats.new_users_30d })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-slate-400", children: "Vendas:" }), _jsx("span", { className: "text-slate-200", children: stats.sales_30d })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-slate-400", children: "Receita:" }), _jsx("span", { className: "text-slate-200", children: formatCurrency(stats.revenue_30d) })] })] })] }), _jsxs("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-slate-100 mb-4", children: "Status das Vendas" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-green-400", children: "Pagas:" }), _jsx("span", { className: "text-slate-200", children: stats.paid_sales })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-amber-400", children: "Pendentes:" }), _jsx("span", { className: "text-slate-200", children: stats.pending_sales })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-red-400", children: "Canceladas:" }), _jsx("span", { className: "text-slate-200", children: stats.canceled_sales })] })] })] })] })] })), activeTab === 'users' && (_jsxs("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden", children: [_jsx("div", { className: "p-6 border-b border-slate-800", children: _jsx("h3", { className: "text-lg font-semibold text-slate-100", children: "Usu\u00E1rios Cadastrados" }) }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-slate-800/50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase", children: "Usu\u00E1rio" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase", children: "Empresa" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase", children: "Cadastro" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase", children: "Vendas" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase", children: "Receita" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase", children: "\u00DAltimo Acesso" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-800", children: users.map((user) => (_jsxs("tr", { className: "hover:bg-slate-800/30", children: [_jsx("td", { className: "px-6 py-4", children: _jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium text-slate-200", children: user.full_name || 'Sem nome' }), _jsx("div", { className: "text-sm text-slate-400", children: user.email })] }) }), _jsx("td", { className: "px-6 py-4 text-sm text-slate-200", children: user.company_name || 'Não informado' }), _jsx("td", { className: "px-6 py-4 text-sm text-slate-200", children: formatDate(user.created_at) }), _jsx("td", { className: "px-6 py-4 text-sm text-slate-200", children: user.total_sales }), _jsx("td", { className: "px-6 py-4 text-sm text-slate-200", children: formatCurrency(user.total_revenue) }), _jsx("td", { className: "px-6 py-4 text-sm text-slate-200", children: formatDate(user.last_sign_in_at) })] }, user.id))) })] }) })] })), activeTab === 'sales' && (_jsxs("div", { className: "text-center py-12", children: [_jsx(BarChart3, { className: "w-16 h-16 text-slate-600 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-semibold text-slate-300 mb-2", children: "Relat\u00F3rio de Vendas" }), _jsx("p", { className: "text-slate-400", children: "Esta se\u00E7\u00E3o ser\u00E1 implementada em breve com relat\u00F3rios detalhados." })] }))] })] }));
}
