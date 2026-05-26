import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Shield, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAdminAuth } from '../hooks/useAdminAuth';
export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { signIn } = useAdminAuth();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { error } = await signIn(email, password);
            if (error) {
                if (error.message.includes('Invalid login credentials')) {
                    setError('Email ou senha incorretos');
                }
                else {
                    setError('Erro ao fazer login. Tente novamente.');
                }
            }
        }
        catch (err) {
            setError('Erro inesperado. Tente novamente.');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-slate-950 flex items-center justify-center p-4", children: _jsxs("div", { className: "w-full max-w-md", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("div", { className: "inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4", children: _jsx(Shield, { className: "w-8 h-8 text-white" }) }), _jsx("h1", { className: "text-3xl font-bold text-slate-100 mb-2", children: "Admin Panel" }), _jsx("p", { className: "text-slate-400", children: "Acesso restrito para administradores" })] }), _jsxs("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl p-8 shadow-2xl", children: [error && (_jsxs("div", { className: "mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-red-400 flex-shrink-0" }), _jsx("span", { className: "text-red-300 text-sm", children: error })] })), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Email do Administrador" }), _jsxs("div", { className: "relative", children: [_jsx(Mail, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" }), _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-11 pr-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50", placeholder: "admin@empresa.com", required: true })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Senha" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" }), _jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-11 pr-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", required: true, minLength: 6 })] })] }), _jsx("button", { type: "submit", disabled: loading, className: "w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg py-3 font-medium transition-colors flex items-center justify-center gap-2", children: loading ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" }), "Entrando..."] })) : (_jsxs(_Fragment, { children: [_jsx(Shield, { className: "w-4 h-4" }), "Entrar no Painel"] })) })] }), _jsx("div", { className: "mt-8 pt-6 border-t border-slate-700", children: _jsxs("div", { className: "text-center text-sm text-slate-400", children: [_jsx("p", { className: "mb-2", children: "\u26A0\uFE0F Acesso restrito" }), _jsx("p", { children: "Apenas administradores autorizados podem acessar este painel" })] }) })] })] }) }));
}
