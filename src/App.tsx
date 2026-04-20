import { Routes, Route } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { RefreshCw, User } from "lucide-react";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import PDV from "./pages/PDV";
import Produtos from "./pages/Produtos";
import Vendedores from "./pages/Vendedores";
import FormasPagamento from "./pages/FormasPagamento";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";
import ResetPassword from "./pages/ResetPassword";
import AuthModal from "./components/AuthModal";
import { useState, useEffect } from "react";

function App() {
  const { user, loading: authLoading } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [useSupabase, setUseSupabase] = useState(false);

  // Verificar se deve usar Supabase
  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('supabase_url');
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('supabase_key');
    
    // Só usar Supabase se ambas as credenciais estiverem completas e válidas
    const isValidConfig = !!(supabaseUrl && supabaseKey && supabaseKey.length > 20);
    setUseSupabase(isValidConfig);
  }, []);

  // Tela de carregamento
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex items-center gap-2 text-slate-400">
          <RefreshCw className="w-5 h-5 animate-spin" />
          Carregando...
        </div>
      </div>
    );
  }

  // Tela de login se Supabase está configurado mas usuário não está logado
  if (useSupabase && !user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="w-full max-w-md px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-100 mb-2">Painel de Vendas</h1>
            <p className="text-slate-400">Faça login para acessar o sistema</p>
          </div>
          
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 shadow-2xl">
            <div className="space-y-4">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-lg font-medium transition-colors"
              >
                <User className="w-5 h-5" />
                Entrar
              </button>
              
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg text-lg font-medium transition-colors"
              >
                <User className="w-5 h-5" />
                Criar Nova Conta
              </button>
              
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-lg font-medium transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Recuperar Senha
              </button>
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-700">
              <p className="text-center text-sm text-slate-400">
                🔗 Conectado ao Supabase
              </p>
            </div>
          </div>
          
          {/* Modal de Autenticação */}
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
          />
        </div>
      </div>
    );
  }

  // App normal se usuário está logado ou não está usando Supabase
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Routes>
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/pdv" element={<PDV />} />
              <Route path="/produtos" element={<Produtos />} />
              <Route path="/vendedores" element={<Vendedores />} />
              <Route path="/pagamentos" element={<FormasPagamento />} />
              <Route path="/relatorios" element={<Relatorios />} />
              <Route path="/configuracoes" element={<Configuracoes />} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </div>
  );
}

export default App;