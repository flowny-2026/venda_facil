import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { User, Bell, Palette, Database, Shield, LogIn, UserPlus, Key, LogOut } from "lucide-react";
import DataManagement from "../components/DataManagement";
import AuthModal from "../components/AuthModal";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
export default function Configuracoes() {
    const { user, signOut } = useAuth();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState({
        // Configurações de perfil (serão carregadas do banco)
        nome: "",
        email: "",
        cargo: "",
        // Configurações de notificações
        emailNotifications: true,
        pushNotifications: false,
        weeklyReport: true,
        // Configurações de aparência
        theme: localStorage.getItem('theme') || "dark",
        language: "pt-BR",
        // Configurações de dados
        dataRetention: "90",
        autoBackup: true,
    });
    // Carregar dados do usuário logado
    useEffect(() => {
        const loadUserData = async () => {
            if (!user) {
                setLoading(false);
                return;
            }
            try {
                // Buscar dados do usuário na tabela company_users
                const { data: companyUser, error } = await supabase
                    .from('company_users')
                    .select(`
            role,
            companies:company_id (name),
            sellers:seller_id (name)
          `)
                    .eq('user_id', user.id)
                    .eq('active', true)
                    .maybeSingle();
                if (error) {
                    console.error('Erro ao carregar dados do usuário:', error);
                }
                // Atualizar settings com dados reais
                setSettings(prev => ({
                    ...prev,
                    nome: companyUser?.sellers?.name || user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
                    email: user.email || '',
                    cargo: getRoleLabel(companyUser?.role || 'seller')
                }));
            }
            catch (err) {
                console.error('Erro ao buscar dados:', err);
            }
            finally {
                setLoading(false);
            }
        };
        loadUserData();
    }, [user]);
    // Função para traduzir role para português
    const getRoleLabel = (role) => {
        const roles = {
            'super_admin': 'Super Administrador',
            'owner': 'Proprietário',
            'manager': 'Gerente',
            'seller': 'Vendedor',
            'cashier': 'Caixa'
        };
        return roles[role] || 'Usuário';
    };
    // Aplicar tema ao carregar a página
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        applyTheme(savedTheme);
    }, []);
    // Função para aplicar tema
    const applyTheme = (theme) => {
        if (theme === 'light') {
            document.documentElement.classList.add('light-theme');
            document.documentElement.classList.remove('dark-theme');
        }
        else if (theme === 'dark') {
            document.documentElement.classList.add('dark-theme');
            document.documentElement.classList.remove('light-theme');
        }
        else {
            // Auto: detectar preferência do sistema
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                document.documentElement.classList.add('dark-theme');
                document.documentElement.classList.remove('light-theme');
            }
            else {
                document.documentElement.classList.add('light-theme');
                document.documentElement.classList.remove('dark-theme');
            }
        }
    };
    // Aplicar tema quando mudar
    const handleThemeChange = (newTheme) => {
        setSettings({ ...settings, theme: newTheme });
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    };
    const handleLogout = async () => {
        if (window.confirm('Tem certeza que deseja sair?')) {
            await signOut();
        }
    };
    const handleDataChange = () => {
        // Callback para quando os dados mudarem
        window.location.reload(); // Recarrega a página para atualizar o dashboard
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-slate-100", children: "Configura\u00E7\u00F5es" }), _jsx("p", { className: "mt-2 text-slate-400", children: "Gerencie suas prefer\u00EAncias e configura\u00E7\u00F5es do sistema" })] }), _jsxs("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-soft", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("div", { className: "p-2 bg-blue-500/15 rounded-lg", children: _jsx(Shield, { className: "w-5 h-5 text-blue-400" }) }), _jsx("h2", { className: "text-lg font-semibold text-slate-100", children: "Autentica\u00E7\u00E3o" })] }), user ? (
                    // Usuário logado
                    _jsx("div", { className: "space-y-4", children: _jsxs("div", { className: "flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg", children: [_jsx("div", { className: "w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center", children: _jsx(User, { className: "w-5 h-5 text-green-400" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "text-sm font-medium text-green-300", children: "Usu\u00E1rio Conectado" }), _jsx("div", { className: "text-xs text-green-400/80", children: user.email })] }), _jsxs("button", { onClick: handleLogout, className: "flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-300 hover:bg-red-500/20 transition-colors", children: [_jsx(LogOut, { className: "w-4 h-4" }), "Sair"] })] }) })) : (
                    // Usuário não logado
                    _jsx("div", { className: "space-y-4", children: _jsxs("div", { className: "p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg", children: [_jsx("div", { className: "text-sm text-amber-300 mb-3", children: "Para acessar o painel de vendas, voc\u00EA precisa fazer login ou criar uma conta." }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-3", children: [_jsxs("button", { onClick: () => setIsAuthModalOpen(true), className: "flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors", children: [_jsx(LogIn, { className: "w-4 h-4" }), "Entrar"] }), _jsxs("button", { onClick: () => setIsAuthModalOpen(true), className: "flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors", children: [_jsx(UserPlus, { className: "w-4 h-4" }), "Criar Conta"] }), _jsxs("button", { onClick: () => setIsAuthModalOpen(true), className: "flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium transition-colors", children: [_jsx(Key, { className: "w-4 h-4" }), "Recuperar Senha"] })] })] }) }))] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-soft", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("div", { className: "p-2 bg-blue-500/15 rounded-lg", children: _jsx(User, { className: "w-5 h-5 text-blue-400" }) }), _jsx("h2", { className: "text-lg font-semibold text-slate-100", children: "Perfil do Usu\u00E1rio" })] }), loading ? (_jsx("div", { className: "text-center py-8 text-slate-400", children: "Carregando dados do perfil..." })) : !user ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("p", { className: "text-slate-400 mb-4", children: "Fa\u00E7a login para ver seu perfil" }), _jsx("button", { onClick: () => setIsAuthModalOpen(true), className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors", children: "Fazer Login" })] })) : (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Nome" }), _jsx("input", { type: "text", value: settings.nome, readOnly: true, className: "w-full bg-slate-800/30 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 cursor-not-allowed opacity-75", title: "Este campo \u00E9 preenchido automaticamente" }), _jsx("p", { className: "text-xs text-slate-500 mt-1", children: "\u2139\uFE0F Nome do vendedor cadastrado no sistema" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Email" }), _jsx("input", { type: "email", value: settings.email, readOnly: true, className: "w-full bg-slate-800/30 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 cursor-not-allowed opacity-75", title: "Este campo \u00E9 preenchido automaticamente" }), _jsx("p", { className: "text-xs text-slate-500 mt-1", children: "\u2139\uFE0F Email usado para fazer login" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Cargo" }), _jsx("input", { type: "text", value: settings.cargo, readOnly: true, className: "w-full bg-slate-800/30 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 cursor-not-allowed opacity-75", title: "Este campo \u00E9 preenchido automaticamente" }), _jsx("p", { className: "text-xs text-slate-500 mt-1", children: "\u2139\uFE0F Fun\u00E7\u00E3o no sistema (definida pelo administrador)" })] })] }))] }), _jsxs("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-soft", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("div", { className: "p-2 bg-amber-500/15 rounded-lg", children: _jsx(Bell, { className: "w-5 h-5 text-amber-400" }) }), _jsx("h2", { className: "text-lg font-semibold text-slate-100", children: "Notifica\u00E7\u00F5es" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium text-slate-200", children: "Notifica\u00E7\u00F5es por Email" }), _jsx("div", { className: "text-xs text-slate-400", children: "Receber alertas por email" })] }), _jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: settings.emailNotifications, onChange: (e) => setSettings({ ...settings, emailNotifications: e.target.checked }), className: "sr-only peer" }), _jsx("div", { className: "w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium text-slate-200", children: "Notifica\u00E7\u00F5es Push" }), _jsx("div", { className: "text-xs text-slate-400", children: "Alertas no navegador" })] }), _jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: settings.pushNotifications, onChange: (e) => setSettings({ ...settings, pushNotifications: e.target.checked }), className: "sr-only peer" }), _jsx("div", { className: "w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium text-slate-200", children: "Relat\u00F3rio Semanal" }), _jsx("div", { className: "text-xs text-slate-400", children: "Resumo semanal por email" })] }), _jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: settings.weeklyReport, onChange: (e) => setSettings({ ...settings, weeklyReport: e.target.checked }), className: "sr-only peer" }), _jsx("div", { className: "w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" })] })] })] })] }), _jsxs("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-soft", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("div", { className: "p-2 bg-purple-500/15 rounded-lg", children: _jsx(Palette, { className: "w-5 h-5 text-purple-400" }) }), _jsx("h2", { className: "text-lg font-semibold text-slate-100", children: "Apar\u00EAncia" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Tema" }), _jsxs("select", { value: settings.theme, onChange: (e) => handleThemeChange(e.target.value), className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50", children: [_jsx("option", { value: "dark", children: "Escuro" }), _jsx("option", { value: "light", children: "Claro" }), _jsx("option", { value: "auto", children: "Autom\u00E1tico" })] }), _jsxs("p", { className: "text-xs text-slate-500 mt-1", children: [settings.theme === 'light' && '☀️ Tema claro ativado', settings.theme === 'dark' && '🌙 Tema escuro ativado', settings.theme === 'auto' && '🔄 Segue preferência do sistema'] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Idioma" }), _jsxs("select", { value: settings.language, onChange: (e) => setSettings({ ...settings, language: e.target.value }), className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50", children: [_jsx("option", { value: "pt-BR", children: "Portugu\u00EAs (Brasil)" }), _jsx("option", { value: "en-US", children: "English (US)" }), _jsx("option", { value: "es-ES", children: "Espa\u00F1ol" })] })] })] })] }), _jsxs("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-soft", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("div", { className: "p-2 bg-green-500/15 rounded-lg", children: _jsx(Database, { className: "w-5 h-5 text-green-400" }) }), _jsx("h2", { className: "text-lg font-semibold text-slate-100", children: "Dados e Backup" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Reten\u00E7\u00E3o de Dados" }), _jsxs("select", { value: settings.dataRetention, onChange: (e) => setSettings({ ...settings, dataRetention: e.target.value }), className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50", children: [_jsx("option", { value: "30", children: "30 dias" }), _jsx("option", { value: "90", children: "90 dias" }), _jsx("option", { value: "180", children: "6 meses" }), _jsx("option", { value: "365", children: "1 ano" })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium text-slate-200", children: "Backup Autom\u00E1tico" }), _jsx("div", { className: "text-xs text-slate-400", children: "Backup di\u00E1rio dos dados" })] }), _jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: settings.autoBackup, onChange: (e) => setSettings({ ...settings, autoBackup: e.target.checked }), className: "sr-only peer" }), _jsx("div", { className: "w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" })] })] })] })] })] }), _jsxs("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-soft", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("div", { className: "p-2 bg-red-500/15 rounded-lg", children: _jsx(Shield, { className: "w-5 h-5 text-red-400" }) }), _jsx("h2", { className: "text-lg font-semibold text-slate-100", children: "Seguran\u00E7a" })] }), !user ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("p", { className: "text-slate-400 mb-4", children: "Fa\u00E7a login para acessar configura\u00E7\u00F5es de seguran\u00E7a" }), _jsx("button", { onClick: () => setIsAuthModalOpen(true), className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors", children: "Fazer Login" })] })) : (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("button", { onClick: async () => {
                                    if (!user?.email) {
                                        alert('Email não encontrado');
                                        return;
                                    }
                                    if (confirm(`Enviar email de redefinição de senha para ${user.email}?`)) {
                                        try {
                                            // Validar formato do email
                                            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                                            if (!emailRegex.test(user.email)) {
                                                alert(`❌ Email inválido: ${user.email}\n\nO email deve ter um formato válido (ex: usuario@dominio.com)`);
                                                return;
                                            }
                                            const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
                                                redirectTo: `${window.location.origin}/reset-password`
                                            });
                                            if (error) {
                                                console.error('Erro ao enviar email de reset:', error);
                                                throw error;
                                            }
                                            alert(`✅ Email enviado para ${user.email}\n\nVerifique sua caixa de entrada e spam.`);
                                        }
                                        catch (error) {
                                            console.error('Erro completo:', error);
                                            alert('Erro ao enviar email: ' + error.message);
                                        }
                                    }
                                }, className: "flex items-center justify-center gap-2 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-200 hover:border-blue-500 hover:bg-blue-500/10 transition-colors", children: [_jsx(Key, { className: "w-4 h-4" }), "Alterar Senha"] }), _jsxs("button", { onClick: () => alert('🚧 Funcionalidade em desenvolvimento\n\nAutenticação de dois fatores será implementada em breve.'), className: "flex items-center justify-center gap-2 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-200 hover:border-slate-600 transition-colors opacity-50 cursor-not-allowed", disabled: true, children: [_jsx(Shield, { className: "w-4 h-4" }), "Autentica\u00E7\u00E3o 2FA"] }), _jsxs("button", { onClick: () => alert('🚧 Funcionalidade em desenvolvimento\n\nGerenciamento de sessões ativas será implementado em breve.'), className: "flex items-center justify-center gap-2 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-200 hover:border-slate-600 transition-colors opacity-50 cursor-not-allowed", disabled: true, children: [_jsx(User, { className: "w-4 h-4" }), "Sess\u00F5es Ativas"] })] }))] }), _jsx(DataManagement, { onDataChange: handleDataChange }), _jsx(AuthModal, { isOpen: isAuthModalOpen, onClose: () => setIsAuthModalOpen(false) })] }));
}
