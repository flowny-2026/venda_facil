import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Plus, Building, DollarSign, Users, Eye, Edit, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
export default function AdminClientes() {
    const { user } = useAuth();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newCompany, setNewCompany] = useState({
        name: '',
        email: '',
        phone: '',
        document: '',
        plan: 'starter',
        monthly_fee: 29.00
    });
    useEffect(() => {
        loadCompanies();
    }, []);
    const loadCompanies = async () => {
        try {
            const { data, error } = await supabase
                .from('companies')
                .select(`
          *,
          company_users(count),
          sales(count, amount)
        `)
                .order('created_at', { ascending: false });
            if (error)
                throw error;
            // Processar dados
            const processedCompanies = data?.map(company => ({
                ...company,
                user_count: company.company_users?.length || 0,
                sales_count: company.sales?.length || 0,
                total_revenue: company.sales?.reduce((sum, sale) => sum + (sale.amount || 0), 0) || 0
            })) || [];
            setCompanies(processedCompanies);
        }
        catch (error) {
            console.error('Erro ao carregar empresas:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleAddCompany = async (e) => {
        e.preventDefault();
        try {
            const { data, error } = await supabase
                .from('companies')
                .insert([{
                    ...newCompany,
                    created_by: user?.id
                }])
                .select()
                .single();
            if (error)
                throw error;
            setCompanies(prev => [data, ...prev]);
            setShowAddModal(false);
            setNewCompany({
                name: '',
                email: '',
                phone: '',
                document: '',
                plan: 'starter',
                monthly_fee: 29.00
            });
            alert('Empresa cadastrada com sucesso!');
        }
        catch (error) {
            console.error('Erro ao cadastrar empresa:', error);
            alert('Erro ao cadastrar empresa: ' + error.message);
        }
    };
    const toggleCompanyStatus = async (companyId, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
        try {
            const { error } = await supabase
                .from('companies')
                .update({ status: newStatus })
                .eq('id', companyId);
            if (error)
                throw error;
            setCompanies(prev => prev.map(company => company.id === companyId
                ? { ...company, status: newStatus }
                : company));
        }
        catch (error) {
            console.error('Erro ao alterar status:', error);
        }
    };
    const getPlanColor = (plan) => {
        switch (plan) {
            case 'starter': return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
            case 'professional': return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
            case 'enterprise': return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
            default: return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'text-green-400';
            case 'suspended': return 'text-amber-400';
            case 'canceled': return 'text-red-400';
            default: return 'text-slate-400';
        }
    };
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };
    if (loading) {
        return (_jsx("div", { className: "min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center", children: _jsxs("div", { className: "flex items-center gap-2 text-slate-400", children: [_jsx(RefreshCw, { className: "w-5 h-5 animate-spin" }), "Carregando empresas..."] }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-slate-950 text-slate-100", children: [_jsx("div", { className: "bg-slate-900/50 border-b border-slate-800 px-6 py-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-slate-100", children: "Gerenciar Clientes" }), _jsx("p", { className: "text-slate-400", children: "Cadastre e gerencie empresas clientes" })] }), _jsxs("button", { onClick: () => setShowAddModal(true), className: "flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors", children: [_jsx(Plus, { className: "w-4 h-4" }), "Nova Empresa"] })] }) }), _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-6", children: [_jsx("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl p-6", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Building, { className: "w-8 h-8 text-blue-400" }), _jsxs("div", { children: [_jsx("div", { className: "text-2xl font-bold text-slate-100", children: companies.length }), _jsx("div", { className: "text-sm text-slate-400", children: "Total de Empresas" })] })] }) }), _jsx("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl p-6", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(CheckCircle, { className: "w-8 h-8 text-green-400" }), _jsxs("div", { children: [_jsx("div", { className: "text-2xl font-bold text-slate-100", children: companies.filter(c => c.status === 'active').length }), _jsx("div", { className: "text-sm text-slate-400", children: "Empresas Ativas" })] })] }) }), _jsx("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl p-6", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(DollarSign, { className: "w-8 h-8 text-green-400" }), _jsxs("div", { children: [_jsx("div", { className: "text-2xl font-bold text-slate-100", children: formatCurrency(companies.reduce((sum, c) => sum + (c.status === 'active' ? c.monthly_fee : 0), 0)) }), _jsx("div", { className: "text-sm text-slate-400", children: "Receita Mensal" })] })] }) }), _jsx("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl p-6", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Users, { className: "w-8 h-8 text-purple-400" }), _jsxs("div", { children: [_jsx("div", { className: "text-2xl font-bold text-slate-100", children: companies.reduce((sum, c) => sum + (c.user_count || 0), 0) }), _jsx("div", { className: "text-sm text-slate-400", children: "Total de Usu\u00E1rios" })] })] }) })] }), _jsxs("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden", children: [_jsx("div", { className: "p-6 border-b border-slate-800", children: _jsx("h3", { className: "text-lg font-semibold text-slate-100", children: "Empresas Cadastradas" }) }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-slate-800/50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase", children: "Empresa" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase", children: "Plano" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase", children: "Status" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase", children: "Usu\u00E1rios" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase", children: "Vendas" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase", children: "Receita" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase", children: "A\u00E7\u00F5es" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-800", children: companies.map((company) => (_jsxs("tr", { className: "hover:bg-slate-800/30", children: [_jsx("td", { className: "px-6 py-4", children: _jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium text-slate-200", children: company.name }), _jsx("div", { className: "text-sm text-slate-400", children: company.email })] }) }), _jsx("td", { className: "px-6 py-4", children: _jsx("span", { className: `inline-flex px-2 py-1 text-xs font-medium rounded-lg border ${getPlanColor(company.plan)}`, children: company.plan }) }), _jsx("td", { className: "px-6 py-4", children: _jsxs("div", { className: `flex items-center gap-1 ${getStatusColor(company.status)}`, children: [company.status === 'active' ? _jsx(CheckCircle, { className: "w-4 h-4" }) : _jsx(XCircle, { className: "w-4 h-4" }), _jsx("span", { className: "text-sm capitalize", children: company.status })] }) }), _jsxs("td", { className: "px-6 py-4 text-sm text-slate-200", children: [company.user_count, "/", company.max_users] }), _jsx("td", { className: "px-6 py-4 text-sm text-slate-200", children: company.sales_count || 0 }), _jsx("td", { className: "px-6 py-4 text-sm text-slate-200", children: formatCurrency(company.total_revenue || 0) }), _jsx("td", { className: "px-6 py-4", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: () => toggleCompanyStatus(company.id, company.status), className: `p-1 rounded ${company.status === 'active'
                                                                        ? 'text-amber-400 hover:bg-amber-500/20'
                                                                        : 'text-green-400 hover:bg-green-500/20'}`, title: company.status === 'active' ? 'Suspender' : 'Ativar', children: company.status === 'active' ? _jsx(XCircle, { className: "w-4 h-4" }) : _jsx(CheckCircle, { className: "w-4 h-4" }) }), _jsx("button", { className: "p-1 text-blue-400 hover:bg-blue-500/20 rounded", title: "Ver detalhes", children: _jsx(Eye, { className: "w-4 h-4" }) }), _jsx("button", { className: "p-1 text-slate-400 hover:bg-slate-500/20 rounded", title: "Editar", children: _jsx(Edit, { className: "w-4 h-4" }) })] }) })] }, company.id))) })] }) })] })] }), showAddModal && (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md", children: [_jsx("h2", { className: "text-xl font-semibold text-slate-100 mb-4", children: "Nova Empresa" }), _jsxs("form", { onSubmit: handleAddCompany, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Nome da Empresa" }), _jsx("input", { type: "text", value: newCompany.name, onChange: (e) => setNewCompany({ ...newCompany, name: e.target.value }), className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Email" }), _jsx("input", { type: "email", value: newCompany.email, onChange: (e) => setNewCompany({ ...newCompany, email: e.target.value }), className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Telefone" }), _jsx("input", { type: "tel", value: newCompany.phone, onChange: (e) => setNewCompany({ ...newCompany, phone: e.target.value }), className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "CNPJ" }), _jsx("input", { type: "text", value: newCompany.document, onChange: (e) => setNewCompany({ ...newCompany, document: e.target.value }), className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Plano" }), _jsxs("select", { value: newCompany.plan, onChange: (e) => setNewCompany({
                                                ...newCompany,
                                                plan: e.target.value,
                                                monthly_fee: e.target.value === 'starter' ? 29 : e.target.value === 'professional' ? 79 : 199
                                            }), className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50", children: [_jsx("option", { value: "starter", children: "Starter - R$ 29/m\u00EAs" }), _jsx("option", { value: "professional", children: "Professional - R$ 79/m\u00EAs" }), _jsx("option", { value: "enterprise", children: "Enterprise - R$ 199/m\u00EAs" })] })] }), _jsxs("div", { className: "flex gap-3 pt-4", children: [_jsx("button", { type: "button", onClick: () => setShowAddModal(false), className: "flex-1 px-4 py-2 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800/50 transition-colors", children: "Cancelar" }), _jsx("button", { type: "submit", className: "flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors", children: "Cadastrar" })] })] })] }) }))] }));
}
