import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Users, Search, Edit, Trash2, RefreshCw, Mail, Phone, MapPin, Calendar, ShoppingBag, DollarSign, Tag } from 'lucide-react';
export default function Clientes() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        document: '',
        address: '',
        city: '',
        state: '',
        accepts_marketing: true
    });
    useEffect(() => {
        loadCustomers();
    }, []);
    const loadCustomers = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user)
                return;
            const { data, error } = await supabase
                .from('customers')
                .select('*')
                .order('created_at', { ascending: false });
            if (error)
                throw error;
            setCustomers(data || []);
        }
        catch (error) {
            console.error('Erro ao carregar clientes:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user)
                return;
            const { data: companyData } = await supabase
                .from('company_users')
                .select('company_id')
                .eq('user_id', user.id)
                .single();
            if (!companyData)
                return;
            if (editingCustomer) {
                const { error } = await supabase
                    .from('customers')
                    .update(formData)
                    .eq('id', editingCustomer.id);
                if (error)
                    throw error;
                alert('Cliente atualizado com sucesso!');
            }
            else {
                const { error } = await supabase
                    .from('customers')
                    .insert([{
                        ...formData,
                        company_id: companyData.company_id,
                        created_by: user.id
                    }]);
                if (error)
                    throw error;
                alert('Cliente cadastrado com sucesso!');
            }
            closeModal();
            loadCustomers();
        }
        catch (error) {
            console.error('Erro ao salvar cliente:', error);
            alert('Erro ao salvar cliente: ' + error.message);
        }
    };
    const deleteCustomer = async (id) => {
        if (!confirm('Tem certeza que deseja excluir este cliente?'))
            return;
        try {
            const { error } = await supabase
                .from('customers')
                .delete()
                .eq('id', id);
            if (error)
                throw error;
            alert('Cliente excluído com sucesso!');
            loadCustomers();
        }
        catch (error) {
            console.error('Erro ao excluir cliente:', error);
            alert('Erro ao excluir cliente: ' + error.message);
        }
    };
    const openEditModal = (customer) => {
        setEditingCustomer(customer);
        setFormData({
            name: customer.name,
            email: customer.email || '',
            phone: customer.phone || '',
            document: customer.document || '',
            address: customer.address || '',
            city: customer.city || '',
            state: customer.state || '',
            accepts_marketing: customer.accepts_marketing
        });
        setShowModal(true);
    };
    const closeModal = () => {
        setShowModal(false);
        setEditingCustomer(null);
        setFormData({
            name: '',
            email: '',
            phone: '',
            document: '',
            address: '',
            city: '',
            state: '',
            accepts_marketing: true
        });
    };
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };
    const formatDate = (date) => {
        if (!date)
            return 'Nunca';
        return new Date(date).toLocaleDateString('pt-BR');
    };
    const filteredCustomers = customers.filter(customer => customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm) ||
        customer.document?.includes(searchTerm));
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsxs("div", { className: "flex items-center gap-2 text-slate-400", children: [_jsx(RefreshCw, { className: "w-5 h-5 animate-spin" }), "Carregando clientes..."] }) }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-slate-100", children: "Clientes" }), _jsx("p", { className: "text-slate-400", children: "Gerencie sua base de clientes" })] }), _jsxs("button", { onClick: () => setShowModal(true), className: "flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors", children: [_jsx(Plus, { className: "w-4 h-4" }), "Novo Cliente"] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsx("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl p-6", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Users, { className: "w-8 h-8 text-blue-400" }), _jsxs("div", { children: [_jsx("div", { className: "text-2xl font-bold text-slate-100", children: customers.length }), _jsx("div", { className: "text-sm text-slate-400", children: "Total de Clientes" })] })] }) }), _jsx("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl p-6", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(ShoppingBag, { className: "w-8 h-8 text-green-400" }), _jsxs("div", { children: [_jsx("div", { className: "text-2xl font-bold text-slate-100", children: customers.reduce((sum, c) => sum + c.total_purchases, 0) }), _jsx("div", { className: "text-sm text-slate-400", children: "Total de Compras" })] })] }) }), _jsx("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl p-6", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(DollarSign, { className: "w-8 h-8 text-purple-400" }), _jsxs("div", { children: [_jsx("div", { className: "text-2xl font-bold text-slate-100", children: formatCurrency(customers.reduce((sum, c) => sum + c.total_spent, 0)) }), _jsx("div", { className: "text-sm text-slate-400", children: "Valor Total" })] })] }) }), _jsx("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl p-6", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Tag, { className: "w-8 h-8 text-amber-400" }), _jsxs("div", { children: [_jsx("div", { className: "text-2xl font-bold text-slate-100", children: customers.filter(c => c.accepts_marketing).length }), _jsx("div", { className: "text-sm text-slate-400", children: "Aceitam Marketing" })] })] }) })] }), _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" }), _jsx("input", { type: "text", placeholder: "Buscar por nome, email, telefone ou documento...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "w-full bg-slate-900/50 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50" })] }), _jsx("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden", children: filteredCustomers.length === 0 ? (_jsxs("div", { className: "p-12 text-center", children: [_jsx(Users, { className: "w-12 h-12 text-slate-600 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-semibold text-slate-300 mb-2", children: searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado' }), _jsx("p", { className: "text-slate-400 mb-4", children: searchTerm ? 'Tente buscar com outros termos' : 'Comece cadastrando seus clientes' }), !searchTerm && (_jsx("button", { onClick: () => setShowModal(true), className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors", children: "Cadastrar Primeiro Cliente" }))] })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-slate-800/50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase", children: "Cliente" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase", children: "Contato" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase", children: "Localiza\u00E7\u00E3o" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase", children: "Compras" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase", children: "\u00DAltima Compra" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase", children: "A\u00E7\u00F5es" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-800", children: filteredCustomers.map((customer) => (_jsxs("tr", { className: "hover:bg-slate-800/30", children: [_jsx("td", { className: "px-6 py-4", children: _jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium text-slate-200", children: customer.name }), customer.document && (_jsx("div", { className: "text-sm text-slate-400", children: customer.document }))] }) }), _jsx("td", { className: "px-6 py-4", children: _jsxs("div", { children: [customer.email && (_jsxs("div", { className: "flex items-center gap-1 text-sm text-slate-200", children: [_jsx(Mail, { className: "w-3 h-3" }), customer.email] })), customer.phone && (_jsxs("div", { className: "flex items-center gap-1 text-sm text-slate-400", children: [_jsx(Phone, { className: "w-3 h-3" }), customer.phone] }))] }) }), _jsx("td", { className: "px-6 py-4", children: customer.city && customer.state ? (_jsxs("div", { className: "flex items-center gap-1 text-sm text-slate-200", children: [_jsx(MapPin, { className: "w-3 h-3" }), customer.city, "/", customer.state] })) : (_jsx("span", { className: "text-sm text-slate-500", children: "N\u00E3o informado" })) }), _jsx("td", { className: "px-6 py-4", children: _jsxs("div", { children: [_jsxs("div", { className: "text-sm font-medium text-slate-200", children: [customer.total_purchases, " compras"] }), _jsx("div", { className: "text-sm text-green-400", children: formatCurrency(customer.total_spent) })] }) }), _jsx("td", { className: "px-6 py-4", children: _jsxs("div", { className: "flex items-center gap-1 text-sm text-slate-400", children: [_jsx(Calendar, { className: "w-3 h-3" }), formatDate(customer.last_purchase_at)] }) }), _jsx("td", { className: "px-6 py-4", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: () => openEditModal(customer), className: "p-1 text-blue-400 hover:bg-blue-500/20 rounded", title: "Editar", children: _jsx(Edit, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => deleteCustomer(customer.id), className: "p-1 text-red-400 hover:bg-red-500/20 rounded", title: "Excluir", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }) })] }, customer.id))) })] }) })) }), showModal && (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto", children: [_jsx("h2", { className: "text-xl font-semibold text-slate-100 mb-4", children: editingCustomer ? 'Editar Cliente' : 'Novo Cliente' }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "md:col-span-2", children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Nome Completo *" }), _jsx("input", { type: "text", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Email" }), _jsx("input", { type: "email", value: formData.email, onChange: (e) => setFormData({ ...formData, email: e.target.value }), className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Telefone" }), _jsx("input", { type: "tel", value: formData.phone, onChange: (e) => setFormData({ ...formData, phone: e.target.value }), className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "CPF/CNPJ" }), _jsx("input", { type: "text", value: formData.document, onChange: (e) => setFormData({ ...formData, document: e.target.value }), className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Endere\u00E7o" }), _jsx("input", { type: "text", value: formData.address, onChange: (e) => setFormData({ ...formData, address: e.target.value }), className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Cidade" }), _jsx("input", { type: "text", value: formData.city, onChange: (e) => setFormData({ ...formData, city: e.target.value }), className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Estado" }), _jsx("input", { type: "text", value: formData.state, onChange: (e) => setFormData({ ...formData, state: e.target.value }), maxLength: 2, className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50", placeholder: "SP" })] }), _jsx("div", { className: "md:col-span-2", children: _jsxs("label", { className: "flex items-center gap-2", children: [_jsx("input", { type: "checkbox", checked: formData.accepts_marketing, onChange: (e) => setFormData({ ...formData, accepts_marketing: e.target.checked }), className: "w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500/50" }), _jsx("span", { className: "text-sm text-slate-300", children: "Cliente aceita receber comunica\u00E7\u00F5es de marketing" })] }) })] }), _jsxs("div", { className: "flex gap-3 pt-4", children: [_jsx("button", { type: "button", onClick: closeModal, className: "flex-1 px-4 py-2 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800/50 transition-colors", children: "Cancelar" }), _jsx("button", { type: "submit", className: "flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors", children: editingCustomer ? 'Atualizar' : 'Cadastrar' })] })] })] }) }))] }));
}
