import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Plus, CreditCard, Banknote, Smartphone, DollarSign, Edit, Trash2, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
export default function FormasPagamento() {
    const { user } = useAuth();
    const [companyId, setCompanyId] = useState(null);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingMethod, setEditingMethod] = useState(null);
    const [newMethod, setNewMethod] = useState({
        name: '',
        type: 'cash'
    });
    // Buscar company_id
    useEffect(() => {
        const loadCompanyId = async () => {
            if (!user)
                return;
            try {
                const { data, error } = await supabase
                    .from('company_users')
                    .select('company_id')
                    .eq('user_id', user.id)
                    .single();
                if (error)
                    throw error;
                setCompanyId(data.company_id);
            }
            catch (error) {
                console.error('Erro ao buscar company_id:', error);
            }
        };
        loadCompanyId();
    }, [user]);
    useEffect(() => {
        if (companyId) {
            loadPaymentMethods();
        }
    }, [companyId]);
    const loadPaymentMethods = async () => {
        if (!companyId)
            return;
        try {
            const { data, error } = await supabase
                .from('payment_methods')
                .select('*')
                .eq('company_id', companyId)
                .order('created_at', { ascending: false });
            if (error)
                throw error;
            setPaymentMethods(data || []);
        }
        catch (error) {
            console.error('Erro ao carregar formas de pagamento:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleAddMethod = async (e) => {
        e.preventDefault();
        if (!companyId) {
            alert('Erro: Empresa não identificada');
            return;
        }
        try {
            const { data, error } = await supabase
                .from('payment_methods')
                .insert([{
                    ...newMethod,
                    company_id: companyId
                }])
                .select()
                .single();
            if (error)
                throw error;
            setPaymentMethods(prev => [data, ...prev]);
            setShowAddModal(false);
            resetForm();
            alert('Forma de pagamento cadastrada com sucesso!');
        }
        catch (error) {
            console.error('Erro ao cadastrar forma de pagamento:', error);
            alert('Erro ao cadastrar forma de pagamento: ' + error.message);
        }
    };
    const handleEditMethod = async (e) => {
        e.preventDefault();
        if (!editingMethod)
            return;
        try {
            const { data, error } = await supabase
                .from('payment_methods')
                .update(newMethod)
                .eq('id', editingMethod.id)
                .select()
                .single();
            if (error)
                throw error;
            setPaymentMethods(prev => prev.map(method => method.id === editingMethod.id ? data : method));
            setEditingMethod(null);
            resetForm();
            alert('Forma de pagamento atualizada com sucesso!');
        }
        catch (error) {
            console.error('Erro ao atualizar forma de pagamento:', error);
            alert('Erro ao atualizar forma de pagamento: ' + error.message);
        }
    };
    const toggleMethodStatus = async (methodId, currentStatus) => {
        try {
            const { error } = await supabase
                .from('payment_methods')
                .update({ active: !currentStatus })
                .eq('id', methodId);
            if (error)
                throw error;
            setPaymentMethods(prev => prev.map(method => method.id === methodId
                ? { ...method, active: !currentStatus }
                : method));
        }
        catch (error) {
            console.error('Erro ao alterar status:', error);
        }
    };
    const deleteMethod = async (methodId) => {
        if (!confirm('Tem certeza que deseja excluir esta forma de pagamento?'))
            return;
        try {
            const { error } = await supabase
                .from('payment_methods')
                .delete()
                .eq('id', methodId);
            if (error)
                throw error;
            setPaymentMethods(prev => prev.filter(method => method.id !== methodId));
            alert('Forma de pagamento excluída com sucesso!');
        }
        catch (error) {
            console.error('Erro ao excluir forma de pagamento:', error);
            alert('Erro ao excluir forma de pagamento: ' + error.message);
        }
    };
    const resetForm = () => {
        setNewMethod({
            name: '',
            type: 'cash'
        });
    };
    const openEditModal = (method) => {
        setEditingMethod(method);
        setNewMethod({
            name: method.name,
            type: method.type
        });
        setShowAddModal(true);
    };
    const closeModal = () => {
        setShowAddModal(false);
        setEditingMethod(null);
        resetForm();
    };
    const getTypeIcon = (type) => {
        switch (type) {
            case 'cash': return _jsx(Banknote, { className: "w-5 h-5 text-green-400" });
            case 'debit_card': return _jsx(CreditCard, { className: "w-5 h-5 text-blue-400" });
            case 'credit_card': return _jsx(CreditCard, { className: "w-5 h-5 text-purple-400" });
            case 'pix': return _jsx(Smartphone, { className: "w-5 h-5 text-orange-400" });
            default: return _jsx(DollarSign, { className: "w-5 h-5 text-slate-400" });
        }
    };
    const getTypeLabel = (type) => {
        switch (type) {
            case 'cash': return 'Dinheiro';
            case 'debit_card': return 'Cartão de Débito';
            case 'credit_card': return 'Cartão de Crédito';
            case 'pix': return 'PIX';
            case 'other': return 'Outros';
            default: return type;
        }
    };
    const getTypeColor = (type) => {
        switch (type) {
            case 'cash': return 'bg-green-500/15 text-green-400 border-green-500/30';
            case 'debit_card': return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
            case 'credit_card': return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
            case 'pix': return 'bg-orange-500/15 text-orange-400 border-orange-500/30';
            default: return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
        }
    };
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsxs("div", { className: "flex items-center gap-2 text-slate-400", children: [_jsx(RefreshCw, { className: "w-5 h-5 animate-spin" }), "Carregando formas de pagamento..."] }) }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-slate-100", children: "Formas de Pagamento" }), _jsx("p", { className: "text-slate-400", children: "Configure as formas de pagamento aceitas na sua loja" })] }), _jsxs("button", { onClick: () => setShowAddModal(true), className: "flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors", children: [_jsx(Plus, { className: "w-4 h-4" }), "Nova Forma de Pagamento"] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsx("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl p-6", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(CreditCard, { className: "w-8 h-8 text-blue-400" }), _jsxs("div", { children: [_jsx("div", { className: "text-2xl font-bold text-slate-100", children: paymentMethods.length }), _jsx("div", { className: "text-sm text-slate-400", children: "Total Cadastradas" })] })] }) }), _jsx("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl p-6", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(CheckCircle, { className: "w-8 h-8 text-green-400" }), _jsxs("div", { children: [_jsx("div", { className: "text-2xl font-bold text-slate-100", children: paymentMethods.filter(m => m.active).length }), _jsx("div", { className: "text-sm text-slate-400", children: "Formas Ativas" })] })] }) }), _jsx("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl p-6", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Banknote, { className: "w-8 h-8 text-green-400" }), _jsxs("div", { children: [_jsx("div", { className: "text-2xl font-bold text-slate-100", children: paymentMethods.filter(m => m.type === 'cash' && m.active).length }), _jsx("div", { className: "text-sm text-slate-400", children: "Dinheiro" })] })] }) }), _jsx("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl p-6", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Smartphone, { className: "w-8 h-8 text-orange-400" }), _jsxs("div", { children: [_jsx("div", { className: "text-2xl font-bold text-slate-100", children: paymentMethods.filter(m => ['debit_card', 'credit_card', 'pix'].includes(m.type) && m.active).length }), _jsx("div", { className: "text-sm text-slate-400", children: "Eletr\u00F4nicos" })] })] }) })] }), _jsxs("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden", children: [_jsx("div", { className: "p-6 border-b border-slate-800", children: _jsx("h3", { className: "text-lg font-semibold text-slate-100", children: "Formas de Pagamento Configuradas" }) }), paymentMethods.length === 0 ? (_jsxs("div", { className: "p-12 text-center", children: [_jsx(CreditCard, { className: "w-12 h-12 text-slate-600 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-semibold text-slate-300 mb-2", children: "Nenhuma forma de pagamento cadastrada" }), _jsx("p", { className: "text-slate-400 mb-4", children: "Configure as formas de pagamento aceitas na sua loja." }), _jsx("button", { onClick: () => setShowAddModal(true), className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors", children: "Cadastrar Primeira Forma de Pagamento" })] })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6", children: paymentMethods.map((method) => (_jsxs("div", { className: "bg-slate-800/30 border border-slate-700 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { className: "flex items-center gap-3", children: [getTypeIcon(method.type), _jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-slate-200", children: method.name }), _jsx("span", { className: `inline-flex px-2 py-1 text-xs font-medium rounded border ${getTypeColor(method.type)}`, children: getTypeLabel(method.type) })] })] }), _jsx("div", { className: `flex items-center gap-1 ${method.active ? 'text-green-400' : 'text-red-400'}`, children: method.active ? _jsx(CheckCircle, { className: "w-4 h-4" }) : _jsx(XCircle, { className: "w-4 h-4" }) })] }), _jsxs("div", { className: "flex items-center gap-2 mt-3", children: [_jsxs("button", { onClick: () => openEditModal(method), className: "flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs text-blue-400 hover:bg-blue-500/20 rounded transition-colors", children: [_jsx(Edit, { className: "w-3 h-3" }), "Editar"] }), _jsxs("button", { onClick: () => toggleMethodStatus(method.id, method.active), className: `flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs rounded transition-colors ${method.active
                                                ? 'text-amber-400 hover:bg-amber-500/20'
                                                : 'text-green-400 hover:bg-green-500/20'}`, children: [method.active ? _jsx(XCircle, { className: "w-3 h-3" }) : _jsx(CheckCircle, { className: "w-3 h-3" }), method.active ? 'Desativar' : 'Ativar'] }), _jsx("button", { onClick: () => deleteMethod(method.id), className: "flex items-center justify-center gap-1 px-2 py-1 text-xs text-red-400 hover:bg-red-500/20 rounded transition-colors", children: _jsx(Trash2, { className: "w-3 h-3" }) })] })] }, method.id))) }))] }), showAddModal && (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md", children: [_jsx("h2", { className: "text-xl font-semibold text-slate-100 mb-4", children: editingMethod ? 'Editar Forma de Pagamento' : 'Nova Forma de Pagamento' }), _jsxs("form", { onSubmit: editingMethod ? handleEditMethod : handleAddMethod, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Nome" }), _jsx("input", { type: "text", value: newMethod.name, onChange: (e) => setNewMethod({ ...newMethod, name: e.target.value }), className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50", placeholder: "Ex: Dinheiro, Cart\u00E3o de Cr\u00E9dito, PIX", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Tipo" }), _jsxs("select", { value: newMethod.type, onChange: (e) => setNewMethod({ ...newMethod, type: e.target.value }), className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50", children: [_jsx("option", { value: "cash", children: "Dinheiro" }), _jsx("option", { value: "debit_card", children: "Cart\u00E3o de D\u00E9bito" }), _jsx("option", { value: "credit_card", children: "Cart\u00E3o de Cr\u00E9dito" }), _jsx("option", { value: "pix", children: "PIX" }), _jsx("option", { value: "other", children: "Outros" })] })] }), _jsxs("div", { className: "flex gap-3 pt-4", children: [_jsx("button", { type: "button", onClick: closeModal, className: "flex-1 px-4 py-2 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800/50 transition-colors", children: "Cancelar" }), _jsx("button", { type: "submit", className: "flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors", children: editingMethod ? 'Atualizar' : 'Cadastrar' })] })] })] }) }))] }));
}
