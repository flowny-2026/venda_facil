import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Key, Mail, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
export default function CreateSellerLoginModal({ seller, onClose, onSuccess }) {
    const [email, setEmail] = useState(seller.email || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        // Validações
        if (!email) {
            setError('Email é obrigatório');
            return;
        }
        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres');
            return;
        }
        if (password !== confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }
        try {
            setLoading(true);
            // 1. Obter company_id do usuário atual ANTES de criar o novo usuário
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (!currentUser) {
                throw new Error('Você precisa estar logado para criar um vendedor');
            }
            // Buscar company_id do usuário atual
            const { data: currentUserData, error: companyError } = await supabase
                .from('company_users')
                .select('company_id')
                .eq('user_id', currentUser.id)
                .maybeSingle();
            if (companyError) {
                console.error('Erro ao buscar empresa:', companyError);
                throw new Error('Erro ao buscar empresa do usuário');
            }
            if (!currentUserData || !currentUserData.company_id) {
                throw new Error('Empresa não encontrada. Você precisa estar vinculado a uma empresa.');
            }
            const companyId = currentUserData.company_id;
            // 2. Criar usuário no Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    emailRedirectTo: window.location.origin,
                    data: {
                        seller_name: seller.name,
                        company_id: companyId
                    },
                    // Desabilitar confirmação de email para evitar problemas
                    emailConfirm: false
                }
            });
            if (authError) {
                console.error('Erro ao criar usuário:', authError);
                throw new Error(`Erro ao criar usuário: ${authError.message}`);
            }
            if (!authData.user) {
                throw new Error('Erro ao criar usuário - nenhum dado retornado');
            }
            console.log('✅ Usuário criado:', authData.user.id);
            // 2.1 CONFIRMAR EMAIL AUTOMATICAMENTE (evita problemas de login)
            try {
                await supabase.rpc('confirm_user_email', { user_email: email });
                console.log('✅ Email confirmado automaticamente');
            }
            catch (confirmError) {
                console.warn('⚠️ Não foi possível confirmar email automaticamente:', confirmError);
                // Não falhar por causa disso
            }
            // 3. Vincular usuário ao vendedor na tabela company_users
            // Usar UPSERT para garantir que sempre funcione
            const { error: linkError } = await supabase
                .from('company_users')
                .upsert({
                user_id: authData.user.id,
                company_id: companyId,
                seller_id: seller.id,
                role: 'seller',
                active: true,
                can_access_pdv: true,
                can_view_reports: false,
                can_manage_products: false,
                can_manage_sellers: false
            }, {
                onConflict: 'user_id,company_id',
                ignoreDuplicates: false
            });
            if (linkError) {
                console.error('Erro ao vincular vendedor:', linkError);
                throw new Error(`Erro ao vincular vendedor: ${linkError.message}`);
            }
            console.log('✅ Vendedor vinculado à empresa');
            // 3.1 VERIFICAR SE A VINCULAÇÃO FOI BEM SUCEDIDA
            const { data: verifyLink, error: verifyError } = await supabase
                .from('company_users')
                .select('user_id, company_id, seller_id, role')
                .eq('user_id', authData.user.id)
                .eq('company_id', companyId)
                .single();
            if (verifyError || !verifyLink) {
                console.error('❌ Falha na verificação da vinculação:', verifyError);
                throw new Error('Usuário criado mas não foi vinculado corretamente. Tente novamente.');
            }
            console.log('✅ Vinculação verificada:', verifyLink);
            // 4. Atualizar email do vendedor se necessário
            if (email !== seller.email) {
                const { error: updateError } = await supabase
                    .from('sellers')
                    .update({ email: email })
                    .eq('id', seller.id);
                if (updateError) {
                    console.warn('Aviso ao atualizar email do vendedor:', updateError);
                }
            }
            // 5. IMPORTANTE: Fazer logout do usuário temporário criado
            // Isso evita que a sessão fique com o vendedor recém-criado
            console.log('🔄 Fazendo logout do usuário temporário...');
            await supabase.auth.signOut();
            console.log('✅ Logout realizado');
            alert(`✅ Login criado com sucesso!\n\nCredenciais:\nEmail: ${email}\nSenha: ${password}\n\nEnvie essas credenciais para o vendedor.\n\n⚠️ O vendedor deve fazer login em: ${window.location.origin}`);
            // Recarregar a página para restaurar a sessão do gerente
            window.location.reload();
        }
        catch (error) {
            console.error('Erro ao criar login:', error);
            setError(error.message || 'Erro ao criar login');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md", children: [_jsxs("div", { className: "flex items-center gap-3 mb-6", children: [_jsx("div", { className: "p-2 bg-blue-500/20 rounded-lg", children: _jsx(Key, { className: "w-6 h-6 text-blue-400" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold text-slate-100", children: "Criar Login para Vendedor" }), _jsx("p", { className: "text-sm text-slate-400", children: seller.name })] })] }), error && (_jsxs("div", { className: "mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" }), _jsx("p", { className: "text-sm text-red-300", children: error })] })), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Email de Acesso" }), _jsxs("div", { className: "relative", children: [_jsx(Mail, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" }), _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50", placeholder: "vendedor@email.com", required: true })] }), _jsx("p", { className: "text-xs text-slate-500 mt-1", children: "Este ser\u00E1 o email usado para fazer login no sistema" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Senha" }), _jsxs("div", { className: "relative", children: [_jsx(Key, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" }), _jsx("input", { type: showPassword ? 'text' : 'password', value: password, onChange: (e) => setPassword(e.target.value), className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-10 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50", placeholder: "M\u00EDnimo 6 caracteres", required: true, minLength: 6 }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300", children: showPassword ? _jsx(EyeOff, { className: "w-4 h-4" }) : _jsx(Eye, { className: "w-4 h-4" }) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Confirmar Senha" }), _jsxs("div", { className: "relative", children: [_jsx(Key, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" }), _jsx("input", { type: showPassword ? 'text' : 'password', value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50", placeholder: "Digite a senha novamente", required: true })] })] }), _jsx("div", { className: "bg-blue-500/10 border border-blue-500/20 rounded-lg p-3", children: _jsxs("div", { className: "flex items-start gap-2", children: [_jsx(CheckCircle, { className: "w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" }), _jsxs("div", { className: "text-sm text-blue-300", children: [_jsx("p", { className: "font-medium mb-1", children: "Permiss\u00F5es do Vendedor:" }), _jsxs("ul", { className: "space-y-1 text-xs", children: [_jsx("li", { children: "\u2705 Pode registrar vendas" }), _jsx("li", { children: "\u2705 V\u00EA apenas suas vendas" }), _jsx("li", { children: "\u2705 V\u00EA suas comiss\u00F5es" }), _jsx("li", { children: "\u274C N\u00E3o v\u00EA lucros da empresa" }), _jsx("li", { children: "\u274C N\u00E3o v\u00EA vendas de outros" })] })] })] }) }), _jsxs("div", { className: "flex gap-3 pt-4", children: [_jsx("button", { type: "button", onClick: onClose, className: "flex-1 px-4 py-2 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800/50 transition-colors", disabled: loading, children: "Cancelar" }), _jsx("button", { type: "submit", className: "flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed", disabled: loading, children: loading ? 'Criando...' : 'Criar Login' })] })] })] }) }));
}
