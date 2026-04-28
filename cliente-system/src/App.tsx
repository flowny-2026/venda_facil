import { Routes, Route } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { useUserRole } from "./hooks/useUserRole";
import { RefreshCw, User, AlertTriangle } from "lucide-react";
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
import { supabase } from "./lib/supabase";

function App() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { permissions, loading: permissionsLoading, isSeller, isManager } = useUserRole();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [useSupabase, setUseSupabase] = useState(false);
  const [hasActiveCompany, setHasActiveCompany] = useState<boolean | null>(null);
  const [checkingCompany, setCheckingCompany] = useState(true);

  // Verificar se deve usar Supabase
  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('supabase_url');
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('supabase_key');
    
    // Só usar Supabase se ambas as credenciais estiverem completas e válidas
    const isValidConfig = !!(supabaseUrl && supabaseKey && supabaseKey.length > 20);
    setUseSupabase(isValidConfig);
  }, []);

  // Verificar se o usuário tem empresa ativa
  useEffect(() => {
    const checkUserCompany = async () => {
      if (!user || !useSupabase) {
        setCheckingCompany(false);
        return;
      }

      try {
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
          .maybeSingle(); // Mudado de .single() para .maybeSingle()

        if (error) {
          console.error('Erro ao buscar empresa:', error);
          setHasActiveCompany(false);
          await signOut();
          return;
        }

        if (!companyUser || !companyUser.companies) {
          console.error('Usuário sem empresa ativa');
          setHasActiveCompany(false);
          await signOut();
          return;
        }

        if (companyUser.companies.status !== 'active') {
          console.error('Empresa não está ativa');
          setHasActiveCompany(false);
          await signOut();
          return;
        }

        setHasActiveCompany(true);
      } catch (err) {
        console.error('Erro ao verificar empresa:', err);
        setHasActiveCompany(false);
        await signOut();
      } finally {
        setCheckingCompany(false);
      }
    };

    checkUserCompany();
  }, [user, useSupabase]);

  // Tela de carregamento
  if (authLoading || checkingCompany || (user && permissionsLoading)) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex items-center gap-2 text-slate-400">
          <RefreshCw className="w-5 h-5 animate-spin" />
          {checkingCompany ? 'Verificando acesso...' : permissionsLoading ? 'Carregando permissões...' : 'Carregando...'}
        </div>
      </div>
    );
  }

  // Tela de erro se usuário não tem empresa ativa
  if (useSupabase && user && hasActiveCompany === false) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="w-full max-w-md px-4">
          <div className="text-center">
            <div className="p-3 bg-red-500/15 rounded-full mx-auto mb-4 w-fit">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-red-400 mb-2">Acesso Negado</h1>
            <p className="text-slate-400 mb-4">
              Sua empresa foi desativada ou removida do sistema.
            </p>
            <p className="text-sm text-slate-500 mb-6">
              Entre em contato com o administrador para mais informações.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Tela de login se Supabase está configurado mas usuário não está logado
  if (useSupabase && !user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="w-full max-w-md px-4">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img 
              src="/assets/images/logo-vendafacil.png" 
              alt="VendaFácil" 
              className="h-28 w-auto object-contain"
              style={{ filter: 'drop-shadow(0 4px 12px rgba(59, 130, 246, 0.4))' }}
            />
          </div>
          
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
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-lg font-medium transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Recuperar Senha
              </button>
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-700">
              <p className="text-center text-sm text-slate-400">
                🔒 Acesso restrito para clientes cadastrados
              </p>
              <p className="text-center text-xs text-slate-500 mt-2">
                Entre em contato com o administrador para obter suas credenciais
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
              {/* Vendedores: sempre mostrar se não for vendedor */}
              {!isSeller && <Route path="/vendedores" element={<Vendedores />} />}
              <Route path="/pagamentos" element={<FormasPagamento />} />
              {/* Relatórios: apenas se tiver permissão ou for gerente */}
              {(isManager || permissions?.canViewReports) && <Route path="/relatorios" element={<Relatorios />} />}
              <Route path="/configuracoes" element={<Configuracoes />} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </div>
  );
}

export default App;
