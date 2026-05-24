import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Link, useLocation } from "react-router-dom";
import { BarChart3, FileText, Settings, ShoppingCart, Package, Users, CreditCard, UserCheck } from "lucide-react";
import { useUserRole } from "../hooks/useUserRole";
export default function Layout({ children }) {
    const location = useLocation();
    const { permissions, isSeller, isManager } = useUserRole();
    const allNavigation = [
        { name: "Painel", href: "/", icon: BarChart3, requiresPermission: null },
        { name: "PDV", href: "/pdv", icon: ShoppingCart, requiresPermission: 'canAccessPdv' },
        { name: "Clientes", href: "/clientes", icon: UserCheck, requiresPermission: null },
        { name: "Produtos", href: "/produtos", icon: Package, requiresPermission: 'canManageProducts' },
        { name: "Vendedores", href: "/vendedores", icon: Users, requiresPermission: 'canManageSellers' },
        { name: "Pagamentos", href: "/pagamentos", icon: CreditCard, requiresPermission: null },
        { name: "Relatórios", href: "/relatorios", icon: FileText, requiresPermission: 'canViewReports' },
        { name: "Configurações", href: "/configuracoes", icon: Settings, requiresPermission: null },
    ];
    // Filtrar navegação baseado nas permissões
    const navigation = allNavigation.filter(item => {
        // Se não requer permissão específica, mostrar para todos
        if (!item.requiresPermission)
            return true;
        // Se não tem permissões carregadas ainda, mostrar tudo (será filtrado depois)
        if (!permissions)
            return true;
        // Gerentes sempre veem tudo
        if (isManager)
            return true;
        // Verificar permissão específica
        return permissions[item.requiresPermission] === true;
    });
    return (_jsxs(_Fragment, { children: [_jsx("nav", { className: "bg-slate-900/50 border-b border-slate-800", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsx("div", { className: "flex justify-between items-center h-24", children: _jsxs("div", { className: "flex items-center gap-6 flex-1 min-w-0", children: [_jsxs("div", { className: "flex-shrink-0 flex items-center gap-3", children: [_jsx("img", { src: "/assets/images/logo-vendafacil.png", alt: "VendaF\u00E1cil", className: "h-[50px] w-auto object-contain", style: { filter: 'drop-shadow(0 2px 8px rgba(59, 130, 246, 0.3))' } }), _jsxs("div", { children: [_jsx("span", { className: "text-lg font-bold text-slate-100 whitespace-nowrap", children: "PDV" }), isSeller && permissions?.sellerName && (_jsxs("div", { className: "text-xs text-slate-400", children: ["Vendedor: ", permissions.sellerName] }))] })] }), _jsx("div", { className: "hidden lg:flex lg:space-x-4 overflow-x-auto", children: navigation.map((item) => {
                                        const Icon = item.icon;
                                        const isActive = location.pathname === item.href;
                                        return (_jsxs(Link, { to: item.href, className: `inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${isActive
                                                ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                                                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"}`, children: [_jsx(Icon, { className: "w-4 h-4" }), item.name] }, item.name));
                                    }) })] }) }) }) }), _jsx("main", { className: "max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8", children: children })] }));
}
