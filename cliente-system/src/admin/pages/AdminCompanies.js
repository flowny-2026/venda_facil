import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Power, PowerOff, RefreshCw, Building2, Calendar, DollarSign } from 'lucide-react';
import { AdminService } from '../services/adminService';
export default function AdminCompanies() {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState(null);
    useEffect(() => {
        loadCompanies();
    }, []);
    const loadCompanies = async () => {
        try {
            const data = await AdminService.getCompanies();
            setCompanies(data);
        }
        catch (error) {
            console.error('Erro ao carregar empresas:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleCreateCompany = () => {
        setSelectedCompany(null);
        setShowModal(true);
    };
    const handleEditCompany = (company) => {
        setSelectedCompany(company);
        setShowModal(true);
    };
    const handleDeleteCompany = async (id) => {
        if (confirm('Tem certeza que deseja excluir esta empresa?')) {
            try {
                await AdminService.deleteCompany(id);
                loadCompanies();
            }
            catch (error) {
                console.error('Erro ao excluir empresa:', error);
            }
        }
    };
    const handleToggleStatus = async (id, currentStatus) => {
        try {
            const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
            await AdminService.updateCompany(id, { status: newStatus });
            loadCompanies();
        }
        catch (error) {
            console.error('Erro ao alterar status:', error);
        }
    };
    const filteredCompanies = companies.filter(company => {
        const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || company.status === filterStatus;
        return matchesSearch && matchesStatus;
    });
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('pt-BR');
    };
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsxs("div", { className: "flex items-center gap-2 text-slate-400", children: [_jsx(RefreshCw, { className: "w-5 h-5 animate-spin" }), "Carregando empresas..."] }) }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-slate-100", children: "Empresas" }), _jsx("p", { className: "text-slate-400", children: "Gerencie todas as empresas do sistema" })] }), _jsxs("button", { onClick: handleCreateCompany, className: "flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors", children: [_jsx(Plus, { className: "w-4 h-4" }), "Nova Empresa"] })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "relative flex-1 max-w-md", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" }), _jsx("input", { type: "text", placeholder: "Buscar empresas...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/50" })] }), _jsxs("select", { value: filterStatus, onChange: (e) => setFilterStatus(e.target.value), className: "bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/50", children: [_jsx("option", { value: "all", children: "Todas" }), _jsx("option", { value: "active", children: "Ativas" }), _jsx("option", { value: "inactive", children: "Inativas" })] }), _jsxs("button", { onClick: loadCompanies, className: "flex items-center gap-2 px-4 py-2 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800/50 transition-colors", children: [_jsx(RefreshCw, { className: "w-4 h-4" }), "Atualizar"] })] }), _jsx("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden", children: filteredCompanies.length === 0 ? (_jsxs("div", { className: "p-12 text-center", children: [_jsx(Building2, { className: "w-12 h-12 text-slate-600 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-semibold text-slate-300 mb-2", children: searchTerm || filterStatus !== 'all' ? 'Nenhuma empresa encontrada' : 'Nenhuma empresa cadastrada' }), _jsx("p", { className: "text-slate-400 mb-4", children: searchTerm || filterStatus !== 'all'
                                ? 'Tente alterar os filtros de busca.'
                                : 'Comece criando sua primeira empresa.' }), !searchTerm && filterStatus === 'all' && (_jsxs("button", { onClick: handleCreateCompany, className: "flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors mx-auto", children: [_jsx(Plus, { className: "w-4 h-4" }), "Criar Primeira Empresa"] }))] })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-slate-800/50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase", children: "Empresa" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase", children: "Status" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase", children: "Plano" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase", children: "Criada em" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase", children: "A\u00E7\u00F5es" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-800", children: filteredCompanies.map((company) => (_jsxs("tr", { className: "hover:bg-slate-800/30", children: [_jsx("td", { className: "px-6 py-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-red-500/15 rounded-lg flex items-center justify-center", children: _jsx(Building2, { className: "w-5 h-5 text-red-400" }) }), _jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium text-slate-200", children: company.name }), _jsx("div", { className: "text-xs text-slate-500", children: company.email })] })] }) }), _jsx("td", { className: "px-6 py-4", children: _jsx("span", { className: `inline-flex px-2 py-1 text-xs font-medium rounded-lg border ${company.status === 'active'
                                                    ? 'bg-green-500/15 text-green-400 border-green-500/30'
                                                    : 'bg-red-500/15 text-red-400 border-red-500/30'}`, children: company.status === 'active' ? 'Ativa' : 'Inativa' }) }), _jsx("td", { className: "px-6 py-4", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(DollarSign, { className: "w-4 h-4 text-slate-400" }), _jsxs("div", { children: [_jsx("div", { className: "text-sm text-slate-200", children: company.plan }), _jsxs("div", { className: "text-xs text-slate-400", children: [formatCurrency(company.monthly_fee || 0), "/m\u00EAs"] })] })] }) }), _jsx("td", { className: "px-6 py-4", children: _jsxs("div", { className: "flex items-center gap-2 text-sm text-slate-400", children: [_jsx(Calendar, { className: "w-4 h-4" }), formatDate(company.created_at)] }) }), _jsx("td", { className: "px-6 py-4", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: () => handleEditCompany(company), className: "p-1 text-slate-400 hover:text-blue-400 transition-colors", title: "Editar", children: _jsx(Edit, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => handleToggleStatus(company.id, company.status), className: `p-1 transition-colors ${company.status === 'active'
                                                            ? 'text-slate-400 hover:text-red-400'
                                                            : 'text-slate-400 hover:text-green-400'}`, title: company.status === 'active' ? 'Desativar' : 'Ativar', children: company.status === 'active' ? (_jsx(PowerOff, { className: "w-4 h-4" })) : (_jsx(Power, { className: "w-4 h-4" })) }), _jsx("button", { onClick: () => handleDeleteCompany(company.id), className: "p-1 text-slate-400 hover:text-red-400 transition-colors", title: "Excluir", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }) })] }, company.id))) })] }) })) })] }));
}
