import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Database, WifiOff, User, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
export default function SupabaseStatus() {
    const { user, loading } = useAuth();
    const [connectionStatus, setConnectionStatus] = useState('checking');
    const [config, setConfig] = useState({
        url: '',
        hasKey: false,
        isConfigured: false
    });
    const [error, setError] = useState('');
    useEffect(() => {
        checkSupabaseConnection();
    }, []);
    const checkSupabaseConnection = async () => {
        try {
            // Verificar configuração
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('supabase_url');
            const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('supabase_key');
            setConfig({
                url: supabaseUrl || 'Não configurado',
                hasKey: !!supabaseKey,
                isConfigured: !!(supabaseUrl && supabaseKey)
            });
            if (!supabaseUrl || !supabaseKey) {
                setConnectionStatus('disconnected');
                setError('Credenciais do Supabase não configuradas');
                return;
            }
            // Testar conexão
            const { data, error: connectionError } = await supabase
                .from('sales')
                .select('count')
                .limit(1);
            if (connectionError) {
                setConnectionStatus('error');
                setError(connectionError.message);
            }
            else {
                setConnectionStatus('connected');
                setError('');
            }
        }
        catch (err) {
            setConnectionStatus('error');
            setError(err.message || 'Erro desconhecido');
        }
    };
    const getStatusIcon = () => {
        switch (connectionStatus) {
            case 'checking':
                return _jsx(Database, { className: "w-5 h-5 text-yellow-400 animate-pulse" });
            case 'connected':
                return _jsx(CheckCircle, { className: "w-5 h-5 text-green-400" });
            case 'disconnected':
                return _jsx(WifiOff, { className: "w-5 h-5 text-slate-400" });
            case 'error':
                return _jsx(AlertCircle, { className: "w-5 h-5 text-red-400" });
            default:
                return _jsx(Database, { className: "w-5 h-5 text-slate-400" });
        }
    };
    const getStatusText = () => {
        switch (connectionStatus) {
            case 'checking':
                return 'Verificando conexão...';
            case 'connected':
                return 'Conectado ao Supabase';
            case 'disconnected':
                return 'Usando LocalStorage';
            case 'error':
                return 'Erro na conexão';
            default:
                return 'Status desconhecido';
        }
    };
    const getStatusColor = () => {
        switch (connectionStatus) {
            case 'checking':
                return 'text-yellow-400';
            case 'connected':
                return 'text-green-400';
            case 'disconnected':
                return 'text-slate-400';
            case 'error':
                return 'text-red-400';
            default:
                return 'text-slate-400';
        }
    };
    return (_jsxs("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-soft", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [getStatusIcon(), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-slate-100", children: "Status da Conex\u00E3o" }), _jsx("p", { className: `text-sm ${getStatusColor()}`, children: getStatusText() })] }), _jsx("button", { onClick: checkSupabaseConnection, className: "ml-auto px-3 py-1 text-xs bg-slate-800/50 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors", children: "Verificar" })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "p-3 bg-slate-800/30 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx(Database, { className: "w-4 h-4 text-slate-400" }), _jsx("span", { className: "text-sm font-medium text-slate-300", children: "URL do Projeto" })] }), _jsx("p", { className: "text-xs text-slate-400 font-mono break-all", children: config.url })] }), _jsxs("div", { className: "p-3 bg-slate-800/30 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx(User, { className: "w-4 h-4 text-slate-400" }), _jsx("span", { className: "text-sm font-medium text-slate-300", children: "Chave API" })] }), _jsx("p", { className: "text-xs text-slate-400", children: config.hasKey ? '✅ Configurada' : '❌ Não configurada' })] })] }), config.isConfigured && (_jsxs("div", { className: "p-3 bg-slate-800/30 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx(User, { className: "w-4 h-4 text-slate-400" }), _jsx("span", { className: "text-sm font-medium text-slate-300", children: "Usu\u00E1rio Autenticado" })] }), _jsx("p", { className: "text-xs text-slate-400", children: loading ? ('Verificando...') : user ? (`✅ ${user.email}`) : ('❌ Não logado') })] })), error && (_jsxs("div", { className: "p-3 bg-red-500/10 border border-red-500/20 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx(AlertCircle, { className: "w-4 h-4 text-red-400" }), _jsx("span", { className: "text-sm font-medium text-red-300", children: "Erro" })] }), _jsx("p", { className: "text-xs text-red-300", children: error })] })), _jsxs("details", { className: "text-xs", children: [_jsx("summary", { className: "cursor-pointer text-slate-400 hover:text-slate-300", children: "Informa\u00E7\u00F5es de Debug" }), _jsxs("div", { className: "mt-2 p-3 bg-slate-800/50 rounded-lg font-mono text-slate-400", children: [_jsxs("div", { children: ["Environment URL: ", import.meta.env.VITE_SUPABASE_URL || 'Não definida'] }), _jsxs("div", { children: ["Environment Key: ", import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Definida' : 'Não definida'] }), _jsxs("div", { children: ["LocalStorage URL: ", localStorage.getItem('supabase_url') || 'Não definida'] }), _jsxs("div", { children: ["LocalStorage Key: ", localStorage.getItem('supabase_key') ? 'Definida' : 'Não definida'] }), _jsxs("div", { children: ["Connection Status: ", connectionStatus] }), _jsxs("div", { children: ["User ID: ", user?.id || 'N/A'] })] })] })] })] }));
}
