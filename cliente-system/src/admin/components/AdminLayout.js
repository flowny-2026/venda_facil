import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, LogOut, Menu, X, Shield } from 'lucide-react';
import { useAdminAuth } from '../hooks/useAdminAuth';
export default function AdminLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { admin, signOut } = useAdminAuth();
    const location = useLocation();
    const navigation = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Empresas', href: '/admin/companies', icon: Building2 },
        { name: 'Usuários', href: '/admin/users', icon: Users },
    ];
    const handleLogout = async () => {
        if (window.confirm('Tem certeza que deseja sair?')) {
            await signOut();
        }
    };
    return (_jsxs("div", { className: "flex h-screen bg-slate-950", children: [sidebarOpen && (_jsx("div", { className: "fixed inset-0 z-40 lg:hidden", onClick: () => setSidebarOpen(false), children: _jsx("div", { className: "fixed inset-0 bg-slate-900/80" }) })), _jsxs("div", { className: `
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `, children: [_jsxs("div", { className: "flex items-center justify-between h-16 px-6 border-b border-slate-800", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 bg-blue-600 rounded-lg", children: _jsx(Shield, { className: "w-5 h-5 text-white" }) }), _jsx("span", { className: "text-lg font-semibold text-slate-100", children: "Admin Panel" })] }), _jsx("button", { onClick: () => setSidebarOpen(false), className: "lg:hidden p-1 text-slate-400 hover:text-slate-200", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsx("nav", { className: "flex-1 px-4 py-6 space-y-2", children: navigation.map((item) => {
                            const isActive = location.pathname === item.href;
                            return (_jsxs(Link, { to: item.href, className: `
                  flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${isActive
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800'}
                `, onClick: () => setSidebarOpen(false), children: [_jsx(item.icon, { className: "w-5 h-5" }), item.name] }, item.name));
                        }) }), _jsxs("div", { className: "p-4 border-t border-slate-800", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("div", { className: "w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center", children: _jsx(Shield, { className: "w-4 h-4 text-slate-300" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("div", { className: "text-sm font-medium text-slate-200 truncate", children: admin?.name }), _jsx("div", { className: "text-xs text-slate-400 truncate", children: admin?.email })] })] }), _jsxs("button", { onClick: handleLogout, className: "flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-300 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors", children: [_jsx(LogOut, { className: "w-4 h-4" }), "Sair"] })] })] }), _jsxs("div", { className: "flex-1 flex flex-col overflow-hidden", children: [_jsxs("header", { className: "h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6", children: [_jsx("button", { onClick: () => setSidebarOpen(true), className: "lg:hidden p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800", children: _jsx(Menu, { className: "w-5 h-5" }) }), _jsx("div", { className: "flex items-center gap-4", children: _jsx("div", { className: "text-sm text-slate-400", children: "Painel Administrativo - Sistema de Vendas SaaS" }) })] }), _jsx("main", { className: "flex-1 overflow-auto bg-slate-950 p-6", children: children })] })] }));
}
