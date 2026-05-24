import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { useUserRole } from "./hooks/useUserRole";
import { RefreshCw, User, AlertTriangle } from "lucide-react";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import PDV from "./pages/PDV";
import Produtos from "./pages/Produtos";
import Clientes from "./pages/Clientes";
import Vendedores from "./pages/Vendedores";
import FormasPagamento from "./pages/FormasPagamento";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";
import ResetPassword from "./pages/ResetPassword";
import AuthModal from "./components/AuthModal";
import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
function App() {
    const { user, loading: authLoading, signOut } = useAuth();
    const { permissions, loading: permissionsLoading, isSeller, isManager } = useUserRole();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [useSupabase, setUseSupabase] = useState(false);
    const [hasActiveCompany, setHasActiveCompany] = useState(null);
    const [checkingCompany, setCheckingCompany] = useState(true);
    const [lastUserId, setLastUserId] = useState(null);
    // Verificar se deve usar Supabase
    useEffect(() => {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('supabase_url');
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('supabase_key');
        // Só usar Supabase se ambas as credenciais estiverem completas e válidas
        const isValidConfig = !!(supabaseUrl && supabaseKey && supabaseKey.length > 20);
        setUseSupabase(isValidConfig);
    }, []);
    // Salvar ID do usuário atual sem verificar conflitos
    // CORREÇÃO: Não forçar logout quando usuário muda (permite criação de login de vendedores)
    useEffect(() => {
        if (user && user.id) {
            // Apenas salvar o ID do usuário atual
            sessionStorage.setItem('current_user_id', user.id);
            setLastUserId(user.id);
        }
        else if (!user) {
            // Limpar ID quando não há usuário
            sessionStorage.removeItem('current_user_id');
            setLastUserId(null);
        }
    }, [user]);
    // Verificar se o usuário tem empresa ativa
    useEffect(() => {
        const checkUserCompany = async () => {
            if (!user || !useSupabase) {
                setCheckingCompany(false);
                setHasActiveCompany(true); // Permite acesso se não estiver usando Supabase
                return;
            }
            try {
                setCheckingCompany(true);
                // Buscar empresa do usuário
                const { data: companyUser, error } = await supabase
                    .from('company_users')
                    .select(`
            company_id,
            active,
            companies:company_id (
              id,
              name,
              status
            )
          `)
                    .eq('user_id', user.id)
                    .eq('active', true)
                    .maybeSingle();
                if (error) {
                    console.error('Erro ao buscar empresa:', error);
                    setHasActiveCompany(false);
                    setCheckingCompany(false);
                    await signOut();
                    return;
                }
                if (!companyUser || !companyUser.companies) {
                    console.error('Usuário sem empresa ativa');
                    setHasActiveCompany(false);
                    setCheckingCompany(false);
                    await signOut();
                    return;
                }
                if (companyUser.companies.status !== 'active') {
                    console.error('Empresa não está ativa');
                    setHasActiveCompany(false);
                    setCheckingCompany(false);
                    await signOut();
                    return;
                }
                setHasActiveCompany(true);
                setCheckingCompany(false);
            }
            catch (err) {
                console.error('Erro ao verificar empresa:', err);
                setHasActiveCompany(false);
                setCheckingCompany(false);
                await signOut();
            }
        };
        checkUserCompany();
    }, [user, useSupabase]);
    // Tela de carregamento
    if (authLoading || checkingCompany || (user && permissionsLoading)) {
        return (_jsx("div", { className: "min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center", children: _jsxs("div", { className: "flex items-center gap-2 text-slate-400", children: [_jsx(RefreshCw, { className: "w-5 h-5 animate-spin" }), checkingCompany ? 'Verificando acesso...' : permissionsLoading ? 'Carregando permissões...' : 'Carregando...'] }) }));
    }
    // Tela de erro se usuário não tem empresa ativa
    if (useSupabase && user && hasActiveCompany === false) {
        return (_jsx("div", { className: "min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center", children: _jsx("div", { className: "w-full max-w-md px-4", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "p-3 bg-red-500/15 rounded-full mx-auto mb-4 w-fit", children: _jsx(AlertTriangle, { className: "w-8 h-8 text-red-400" }) }), _jsx("h1", { className: "text-2xl font-bold text-red-400 mb-2", children: "Acesso Negado" }), _jsx("p", { className: "text-slate-400 mb-4", children: "Sua empresa foi desativada ou removida do sistema." }), _jsx("p", { className: "text-sm text-slate-500 mb-6", children: "Entre em contato com o administrador para mais informa\u00E7\u00F5es." }), _jsx("button", { onClick: () => window.location.reload(), className: "px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors", children: "Tentar Novamente" })] }) }) }));
    }
    // Tela de login se Supabase está configurado mas usuário não está logado
    if (useSupabase && !user) {
        return (_jsx("div", { className: "min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center", children: _jsxs("div", { className: "w-full max-w-md px-4", children: [_jsx("div", { className: "flex justify-center mb-8", children: _jsx("img", { src: "/assets/images/logo-vendafacil.png", alt: "VendaF\u00E1cil", className: "h-28 w-auto object-contain", style: { filter: 'drop-shadow(0 4px 12px rgba(59, 130, 246, 0.4))' } }) }), _jsxs("div", { className: "text-center mb-8", children: [_jsx("h1", { className: "text-4xl font-bold text-slate-100 mb-2", children: "Painel de Vendas" }), _jsx("p", { className: "text-slate-400", children: "Fa\u00E7a login para acessar o sistema" })] }), _jsxs("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl p-8 shadow-2xl", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("button", { onClick: () => setIsAuthModalOpen(true), className: "w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-lg font-medium transition-colors", children: [_jsx(User, { className: "w-5 h-5" }), "Entrar"] }), _jsxs("button", { onClick: () => setIsAuthModalOpen(true), className: "w-full flex items-center justify-center gap-3 px-6 py-4 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-lg font-medium transition-colors", children: [_jsx(RefreshCw, { className: "w-5 h-5" }), "Recuperar Senha"] })] }), _jsxs("div", { className: "mt-6 pt-6 border-t border-slate-700", children: [_jsx("p", { className: "text-center text-sm text-slate-400", children: "\uD83D\uDD12 Acesso restrito para clientes cadastrados" }), _jsx("p", { className: "text-center text-xs text-slate-500 mt-2", children: "Entre em contato com o administrador para obter suas credenciais" })] })] }), _jsx(AuthModal, { isOpen: isAuthModalOpen, onClose: () => setIsAuthModalOpen(false) })] }) }));
    }
    // App normal se usuário está logado ou não está usando Supabase
    return (_jsx("div", { className: "min-h-screen bg-slate-950 text-slate-100", children: _jsxs(Routes, { children: [_jsx(Route, { path: "/reset-password", element: _jsx(ResetPassword, {}) }), _jsx(Route, { path: "/*", element: _jsx(Layout, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "/pdv", element: _jsx(PDV, {}) }), _jsx(Route, { path: "/clientes", element: _jsx(Clientes, {}) }), _jsx(Route, { path: "/produtos", element: _jsx(Produtos, {}) }), !isSeller && _jsx(Route, { path: "/vendedores", element: _jsx(Vendedores, {}) }), _jsx(Route, { path: "/pagamentos", element: _jsx(FormasPagamento, {}) }), (isManager || permissions?.canViewReports) && _jsx(Route, { path: "/relatorios", element: _jsx(Relatorios, {}) }), _jsx(Route, { path: "/configuracoes", element: _jsx(Configuracoes, {}) })] }) }) })] }) }));
}
export default App;
