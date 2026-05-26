import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, Mail, Phone, X, UserPlus, Search } from 'lucide-react';
export default function QuickCustomerModal({ isOpen, onClose, onSelectCustomer, companyId }) {
    const [mode, setMode] = useState('search');
    const [searchTerm, setSearchTerm] = useState('');
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: ''
    });
    const searchCustomers = async (term) => {
        if (!term || term.length < 2) {
            setCustomers([]);
            return;
        }
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('customers')
                .select('id, name, phone, email')
                .eq('company_id', companyId)
                .or(`name.ilike.%${term}%,phone.ilike.%${term}%,email.ilike.%${term}%`)
                .limit(10);
            if (error)
                throw error;
            setCustomers(data || []);
        }
        catch (error) {
            console.error('Erro ao buscar clientes:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleSearchChange = (value) => {
        setSearchTerm(value);
        searchCustomers(value);
    };
    const handleSelectCustomer = (customerId) => {
        onSelectCustomer(customerId);
        onClose();
    };
    const handleCreateCustomer = async () => {
        if (!formData.name.trim()) {
            alert('Nome é obrigatório');
            return;
        }
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user)
                return;
            const { data, error } = await supabase
                .from('customers')
                .insert([{
                    company_id: companyId,
                    name: formData.name.trim(),
                    phone: formData.phone.trim() || null,
                    email: formData.email.trim() || null,
                    created_by: user.id
                }])
                .select('id')
                .single();
            if (error)
                throw error;
            onSelectCustomer(data.id);
            onClose();
        }
        catch (error) {
            console.error('Erro ao criar cliente:', error);
            alert('Erro ao criar cliente: ' + error.message);
        }
        finally {
            setLoading(false);
        }
    };
    const handleSkip = () => {
        onSelectCustomer(null);
        onClose();
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("h2", { className: "text-xl font-semibold text-slate-100", children: mode === 'search' ? 'Vincular Cliente' : 'Cadastro Rápido' }), _jsx("button", { onClick: onClose, className: "p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800", children: _jsx(X, { className: "w-5 h-5" }) })] }), mode === 'search' ? (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Buscar Cliente Existente" }), _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" }), _jsx("input", { type: "text", value: searchTerm, onChange: (e) => handleSearchChange(e.target.value), placeholder: "Nome, telefone ou email...", className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50", autoFocus: true })] })] }), searchTerm.length >= 2 && (_jsx("div", { className: "max-h-48 overflow-y-auto space-y-2", children: loading ? (_jsx("div", { className: "text-center py-4 text-slate-400 text-sm", children: "Buscando..." })) : customers.length > 0 ? (customers.map((customer) => (_jsxs("button", { onClick: () => handleSelectCustomer(customer.id), className: "w-full text-left p-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors", children: [_jsx("div", { className: "font-medium text-slate-200", children: customer.name }), _jsxs("div", { className: "text-sm text-slate-400", children: [customer.phone && _jsx("span", { children: customer.phone }), customer.phone && customer.email && _jsx("span", { children: " \u2022 " }), customer.email && _jsx("span", { children: customer.email })] })] }, customer.id)))) : (_jsx("div", { className: "text-center py-4 text-slate-400 text-sm", children: "Nenhum cliente encontrado" })) })), _jsxs("div", { className: "flex flex-col gap-2 pt-4 border-t border-slate-700", children: [_jsxs("button", { onClick: () => setMode('create'), className: "flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors", children: [_jsx(UserPlus, { className: "w-4 h-4" }), "Cadastrar Novo Cliente"] }), _jsx("button", { onClick: handleSkip, className: "px-4 py-2 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800/50 transition-colors", children: "Continuar sem Cliente" })] })] })) : (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Nome Completo *" }), _jsxs("div", { className: "relative", children: [_jsx(User, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" }), _jsx("input", { type: "text", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50", placeholder: "Jo\u00E3o Silva", autoFocus: true })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Telefone" }), _jsxs("div", { className: "relative", children: [_jsx(Phone, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" }), _jsx("input", { type: "tel", value: formData.phone, onChange: (e) => setFormData({ ...formData, phone: e.target.value }), className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50", placeholder: "(11) 99999-9999" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Email (opcional)" }), _jsxs("div", { className: "relative", children: [_jsx(Mail, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" }), _jsx("input", { type: "email", value: formData.email, onChange: (e) => setFormData({ ...formData, email: e.target.value }), className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50", placeholder: "joao@email.com" })] })] }), _jsxs("div", { className: "flex flex-col gap-2 pt-4", children: [_jsx("button", { onClick: handleCreateCustomer, disabled: loading || !formData.name.trim(), className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors", children: loading ? 'Cadastrando...' : 'Cadastrar e Continuar' }), _jsx("button", { onClick: () => setMode('search'), className: "px-4 py-2 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800/50 transition-colors", children: "Voltar para Busca" })] })] }))] }) }));
}
