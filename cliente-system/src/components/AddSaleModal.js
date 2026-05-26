import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { X, Plus } from 'lucide-react';
export default function AddSaleModal({ isOpen, onClose, onAdd }) {
    const [formData, setFormData] = useState({
        customer: '',
        email: '',
        category: 'SaaS',
        status: 'pending',
        amount: '',
    });
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.customer || !formData.email || !formData.amount) {
            alert('Por favor, preencha todos os campos obrigatórios');
            return;
        }
        const sale = {
            customer: formData.customer,
            email: formData.email,
            category: formData.category,
            status: formData.status,
            amount: parseFloat(formData.amount),
            date: new Date().toISOString(),
        };
        onAdd(sale);
        // Reset form
        setFormData({
            customer: '',
            email: '',
            category: 'SaaS',
            status: 'pending',
            amount: '',
        });
        onClose();
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "text-xl font-semibold text-slate-100", children: "Nova Venda" }), _jsx("button", { onClick: onClose, className: "p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Cliente *" }), _jsx("input", { type: "text", value: formData.customer, onChange: (e) => setFormData({ ...formData, customer: e.target.value }), className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50", placeholder: "Nome do cliente", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Email *" }), _jsx("input", { type: "email", value: formData.email, onChange: (e) => setFormData({ ...formData, email: e.target.value }), className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50", placeholder: "email@exemplo.com", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Categoria" }), _jsxs("select", { value: formData.category, onChange: (e) => setFormData({ ...formData, category: e.target.value }), className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50", children: [_jsx("option", { value: "SaaS", children: "SaaS" }), _jsx("option", { value: "Servi\u00E7os", children: "Servi\u00E7os" }), _jsx("option", { value: "Hardware", children: "Hardware" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Status" }), _jsxs("select", { value: formData.status, onChange: (e) => setFormData({ ...formData, status: e.target.value }), className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50", children: [_jsx("option", { value: "pending", children: "Pendente" }), _jsx("option", { value: "paid", children: "Pago" }), _jsx("option", { value: "canceled", children: "Cancelado" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Valor *" }), _jsx("input", { type: "number", step: "0.01", min: "0", value: formData.amount, onChange: (e) => setFormData({ ...formData, amount: e.target.value }), className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50", placeholder: "0.00", required: true })] }), _jsxs("div", { className: "flex gap-3 pt-4", children: [_jsx("button", { type: "button", onClick: onClose, className: "flex-1 px-4 py-2 text-sm text-slate-400 border border-slate-700 rounded-lg hover:text-slate-200 hover:border-slate-600 transition-colors", children: "Cancelar" }), _jsxs("button", { type: "submit", className: "flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors", children: [_jsx(Plus, { className: "w-4 h-4" }), "Adicionar"] })] })] })] }) }));
}
