import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Database, Key, ExternalLink, AlertCircle } from 'lucide-react';
export default function SupabaseSetup() {
    const [step, setStep] = useState(1);
    const [supabaseUrl, setSupabaseUrl] = useState('');
    const [supabaseKey, setSupabaseKey] = useState('');
    const handleSaveConfig = () => {
        if (!supabaseUrl || !supabaseKey) {
            alert('Por favor, preencha todos os campos');
            return;
        }
        // Salvar no localStorage temporariamente para demonstração
        localStorage.setItem('supabase_url', supabaseUrl);
        localStorage.setItem('supabase_key', supabaseKey);
        alert('Configuração salva! Recarregue a página para aplicar as mudanças.');
    };
    return (_jsxs("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-soft", children: [_jsxs("div", { className: "flex items-center gap-3 mb-6", children: [_jsx("div", { className: "p-2 bg-green-500/15 rounded-lg", children: _jsx(Database, { className: "w-5 h-5 text-green-400" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-lg font-semibold text-slate-100", children: "Configura\u00E7\u00E3o do Supabase" }), _jsx("p", { className: "text-sm text-slate-400", children: "Configure sua conex\u00E3o com o banco de dados" })] })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: `flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`, children: "1" }), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "font-medium text-slate-200 mb-2", children: "Criar conta no Supabase" }), _jsx("p", { className: "text-sm text-slate-400 mb-3", children: "Acesse o Supabase e crie uma conta gratuita" }), _jsxs("a", { href: "https://supabase.com", target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-2 px-3 py-2 bg-green-600/20 border border-green-500/30 text-green-300 rounded-lg hover:bg-green-600/30 transition-colors text-sm", children: [_jsx(ExternalLink, { className: "w-4 h-4" }), "Abrir Supabase"] })] })] }), _jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: `flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`, children: "2" }), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "font-medium text-slate-200 mb-2", children: "Criar novo projeto" }), _jsx("p", { className: "text-sm text-slate-400", children: "No painel do Supabase, clique em \"New Project\" e escolha um nome" })] })] }), _jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: `flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`, children: "3" }), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "font-medium text-slate-200 mb-2", children: "Executar SQL" }), _jsx("p", { className: "text-sm text-slate-400 mb-3", children: "V\u00E1 em \"SQL Editor\" e execute este c\u00F3digo para criar as tabelas:" }), _jsx("div", { className: "bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-xs font-mono text-slate-300 overflow-x-auto", children: _jsx("pre", { children: `-- Criar tabela de vendas
CREATE TABLE sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  customer TEXT NOT NULL,
  email TEXT NOT NULL,
  category TEXT CHECK (category IN ('SaaS', 'Serviços', 'Hardware')) NOT NULL,
  status TEXT CHECK (status IN ('paid', 'pending', 'canceled')) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas suas vendas
CREATE POLICY "Users can view own sales" ON sales
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sales" ON sales
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sales" ON sales
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sales" ON sales
  FOR DELETE USING (auth.uid() = user_id);` }) })] })] }), _jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: `flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 4 ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`, children: "4" }), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "font-medium text-slate-200 mb-2", children: "Configurar credenciais" }), _jsx("p", { className: "text-sm text-slate-400 mb-3", children: "V\u00E1 em Settings \u2192 API e copie suas credenciais:" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-1", children: "Project URL" }), _jsxs("div", { className: "relative", children: [_jsx(Database, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" }), _jsx("input", { type: "url", value: supabaseUrl, onChange: (e) => setSupabaseUrl(e.target.value), className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50", placeholder: "https://your-project.supabase.co" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-1", children: "Anon Key" }), _jsxs("div", { className: "relative", children: [_jsx(Key, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" }), _jsx("input", { type: "password", value: supabaseKey, onChange: (e) => setSupabaseKey(e.target.value), className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50", placeholder: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." })] })] }), _jsx("button", { onClick: handleSaveConfig, className: "w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 text-sm font-medium transition-colors", children: "Salvar Configura\u00E7\u00E3o" })] })] })] }), _jsxs("div", { className: "flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg", children: [_jsx(AlertCircle, { className: "w-4 h-4 text-amber-400" }), _jsxs("p", { className: "text-sm text-amber-300", children: [_jsx("strong", { children: "Importante:" }), " Em produ\u00E7\u00E3o, use vari\u00E1veis de ambiente (.env) para as credenciais"] })] })] })] }));
}
