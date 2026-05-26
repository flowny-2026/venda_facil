import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route } from "react-router-dom";
import { useAdminAuth } from "./hooks/useAdminAuth";
import { RefreshCw } from "lucide-react";
import AdminLayout from "./components/AdminLayout";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCompanies from "./pages/AdminCompanies";
import AdminUsers from "./pages/AdminUsers";
function AdminApp() {
    const { admin, loading } = useAdminAuth();
    if (loading) {
        return (_jsx("div", { className: "min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center", children: _jsxs("div", { className: "flex items-center gap-2 text-slate-400", children: [_jsx(RefreshCw, { className: "w-5 h-5 animate-spin" }), "Carregando painel administrativo..."] }) }));
    }
    if (!admin) {
        return _jsx(AdminLogin, {});
    }
    return (_jsx("div", { className: "min-h-screen bg-slate-950 text-slate-100", children: _jsx(AdminLayout, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(AdminDashboard, {}) }), _jsx(Route, { path: "/dashboard", element: _jsx(AdminDashboard, {}) }), _jsx(Route, { path: "/companies", element: _jsx(AdminCompanies, {}) }), _jsx(Route, { path: "/users", element: _jsx(AdminUsers, {}) })] }) }) }));
}
export default AdminApp;
