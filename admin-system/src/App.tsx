import { Routes, Route } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { RefreshCw, User, Lock } from "lucide-react";
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import Vendas from "./pages/Vendas";
import Configuracoes from "./pages/Configuracoes";
import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";

function App() {
  const { user, loading: authLoading, signIn } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Verificar se usuário é admin
  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) {
      setIsAdmin(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .rpc('is_admin', { user_uuid: user.id });

      if (error) throw error;
      setIsAdmin(data);
    } catch (error) {
      console.error('Erro ao verificar admin:', error);
      setIsAdmin(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const { error } = await signIn(loginForm.email, loginForm.password);
      if (error) throw error;
    } catch (err: any) {
      setLoginError(err.message || 'Erro ao fazer login');
    } finally {
      setLoginLoading(false);
    }
  };

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

  // Tela de login se não estiver logado
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="w-full max-w-md px-4">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-red-500/15 rounded-full">
                <Lock className="w-8 h-8 text-red-400" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-slate-100 mb-2">Painel Administrativo</h1>
            <p className="text-slate-400">Acesso restrito apenas para administradores</p>
          </div>
          
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 shadow-2xl">
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300 text-sm">
                  {loginError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email do Administrador
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                    placeholder="admin@empresa.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white rounded-lg py-3 text-sm font-medium transition-colors"
              >
                {loginLoading ? 'Entrando...' : 'Entrar no Sistema'}
              </button>
            </form>
            
            <div className="mt-6 pt-6 border-t border-slate-700">
              <p className="text-center text-xs text-slate-500">
                🔒 Sistema restrito para administradores autorizados
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Verificar se é admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="p-3 bg-red-500/15 rounded-full mx-auto mb-4 w-fit">
            <Lock className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-red-400 mb-2">Acesso Negado</h1>
          <p className="text-slate-400 mb-4">Você não tem permissão para acessar este sistema.</p>
          <p className="text-sm text-slate-500">Apenas administradores autorizados podem acessar.</p>
        </div>
      </div>
    );
  }

  // Sistema administrativo
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/vendas" element={<Vendas />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
      </Routes>
    </div>
  );
}

export default App;