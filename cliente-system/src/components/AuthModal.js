import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { X, Mail, Lock, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
export default function AuthModal({ isOpen, onClose }) {
    const [mode, setMode] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { signIn, resetPassword } = useAuth();
    // Limpar campos quando o modal abrir
    const handleClose = () => {
        setEmail('');
        setPassword('');
        setError('');
        setSuccess('');
        setMode('login');
        onClose();
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            if (mode === 'login') {
                const { error } = await signIn(email, password);
                if (error)
                    throw error;
                handleClose();
            }
            else if (mode === 'forgot') {
                const { error } = await resetPassword(email);
                if (error)
                    throw error;
                setSuccess('Email de recuperação enviado! Verifique sua caixa de entrada.');
            }
        }
        catch (err) {
            setError(err.message || 'Erro ao processar solicitação');
        }
        finally {
            setLoading(false);
        }
    };
    const getTitle = () => {
        switch (mode) {
            case 'login': return 'Entrar';
            case 'forgot': return 'Recuperar Senha';
            default: return 'Entrar';
        }
    };
    const getButtonText = () => {
        if (loading)
            return 'Carregando...';
        switch (mode) {
            case 'login': return 'Entrar';
            case 'forgot': return 'Enviar Email';
            default: return 'Entrar';
        }
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { className: "flex items-center gap-3", children: [mode === 'forgot' && (_jsx("button", { onClick: () => setMode('login'), className: "p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800", children: _jsx(ArrowLeft, { className: "w-4 h-4" }) })), _jsx("h2", { className: "text-xl font-semibold text-slate-100", children: getTitle() })] }), _jsx("button", { onClick: handleClose, className: "p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800", children: _jsx(X, { className: "w-5 h-5" }) })] }), error && (_jsx("div", { className: "mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300 text-sm", children: error })), success && (_jsx("div", { className: "mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-300 text-sm", children: success })), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", autoComplete: "off", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Email" }), _jsxs("div", { className: "relative", children: [_jsx(Mail, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" }), _jsx("input", { type: "email", name: "email-field", value: email, onChange: (e) => setEmail(e.target.value), className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50", placeholder: "seu@email.com", autoComplete: "new-email", autoCorrect: "off", autoCapitalize: "off", spellCheck: "false", "data-form-type": "other", "data-lpignore": "true", required: true })] })] }), mode !== 'forgot' && (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Senha" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" }), _jsx("input", { type: "password", name: "password-field", value: password, onChange: (e) => setPassword(e.target.value), className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", autoComplete: "new-password", "data-form-type": "other", "data-lpignore": "true", required: true, minLength: 6 })] })] })), _jsx("button", { type: "submit", disabled: loading, className: "w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg py-2 text-sm font-medium transition-colors", children: getButtonText() })] }), _jsxs("div", { className: "mt-6 space-y-3 text-center", children: [mode === 'login' && (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => setMode('forgot'), className: "text-sm text-blue-400 hover:text-blue-300", children: "Esqueci minha senha" }), _jsx("div", { className: "mt-4 pt-4 border-t border-slate-700", children: _jsx("p", { className: "text-xs text-slate-500", children: "\uD83D\uDD12 N\u00E3o tem conta? Entre em contato com o administrador" }) })] })), mode === 'forgot' && (_jsx("button", { onClick: () => setMode('login'), className: "text-sm text-slate-400 hover:text-slate-200", children: "Lembrou da senha? Entrar" }))] })] }) }));
}
