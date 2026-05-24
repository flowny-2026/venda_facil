import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();
    useEffect(() => {
        // Verificar se há um token de reset na URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const type = hashParams.get('type');
        if (type !== 'recovery' || !accessToken) {
            setError('Link de recuperação inválido ou expirado');
        }
    }, []);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        if (password !== confirmPassword) {
            setError('As senhas não coincidem');
            setLoading(false);
            return;
        }
        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres');
            setLoading(false);
            return;
        }
        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });
            if (error)
                throw error;
            setSuccess(true);
            setTimeout(() => {
                navigate('/');
            }, 3000);
        }
        catch (err) {
            setError(err.message || 'Erro ao redefinir senha');
        }
        finally {
            setLoading(false);
        }
    };
    if (success) {
        return (_jsx("div", { className: "min-h-screen bg-slate-950 flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl p-8 w-full max-w-md text-center", children: [_jsx("div", { className: "text-green-400 text-4xl mb-4", children: "\u2705" }), _jsx("h1", { className: "text-2xl font-bold text-slate-100 mb-2", children: "Senha Redefinida!" }), _jsx("p", { className: "text-slate-400 mb-4", children: "Sua senha foi alterada com sucesso. Voc\u00EA ser\u00E1 redirecionado para o painel em alguns segundos." }), _jsx("button", { onClick: () => navigate('/'), className: "bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors", children: "Ir para o Painel" })] }) }));
    }
    return (_jsx("div", { className: "min-h-screen bg-slate-950 flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl p-8 w-full max-w-md", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("div", { className: "p-3 bg-blue-500/15 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center", children: _jsx(Lock, { className: "w-8 h-8 text-blue-400" }) }), _jsx("h1", { className: "text-2xl font-bold text-slate-100 mb-2", children: "Redefinir Senha" }), _jsx("p", { className: "text-slate-400", children: "Digite sua nova senha abaixo" })] }), error && (_jsx("div", { className: "mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300 text-sm", children: error })), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Nova Senha" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" }), _jsx("input", { type: showPassword ? 'text' : 'password', value: password, onChange: (e) => setPassword(e.target.value), className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-12 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", required: true, minLength: 6 }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200", children: showPassword ? _jsx(EyeOff, { className: "w-4 h-4" }) : _jsx(Eye, { className: "w-4 h-4" }) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Confirmar Nova Senha" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" }), _jsx("input", { type: showPassword ? 'text' : 'password', value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", required: true, minLength: 6 })] })] }), _jsx("button", { type: "submit", disabled: loading, className: "w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg py-2 text-sm font-medium transition-colors", children: loading ? 'Redefinindo...' : 'Redefinir Senha' })] }), _jsx("div", { className: "mt-6 text-center", children: _jsx("button", { onClick: () => navigate('/'), className: "text-sm text-slate-400 hover:text-slate-200", children: "Voltar ao Painel" }) })] }) }));
}
