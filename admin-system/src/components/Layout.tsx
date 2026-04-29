import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { BarChart3, Building, TrendingUp, Settings, LogOut, User, Mail } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const navigation = [
  { name: "Painel", href: "/", icon: BarChart3 },
  { name: "Clientes", href: "/clientes", icon: Building },
  { name: "Vendas", href: "/vendas", icon: TrendingUp },
  { name: "Leads", href: "/leads", icon: Mail },
  { name: "Configurações", href: "/configuracoes", icon: Settings },
];

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      try {
        // PASSO 1: Marcar logout intencional PRIMEIRO
        console.log('🚪 Logout intencional do cabeçalho - desabilitando auto-login...');
        sessionStorage.setItem('intentional_logout', 'true');
        
        // PASSO 2: Limpar credenciais
        localStorage.removeItem('admin_email');
        localStorage.removeItem('admin_password');
        
        // PASSO 3: Fazer logout
        await signOut();
        
        console.log('✅ Logout realizado com sucesso!');
        
        // PASSO 4: Recarregar a página para garantir que o estado foi limpo
        window.location.href = '/';
      } catch (error) {
        console.error('Erro ao fazer logout:', error);
      }
    }
  };

  return (
    <>
      <nav className="bg-slate-900/50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              <div className="flex-shrink-0 flex items-center gap-3">
                <img 
                  src="/assets/images/logo-vendafacil.png" 
                  alt="VendaFácil Admin" 
                  className="h-[45px] w-auto object-contain"
                  style={{ filter: 'drop-shadow(0 2px 8px rgba(239, 68, 68, 0.3))' }}
                />
                <span className="text-lg font-bold text-slate-100 whitespace-nowrap">Admin</span>
              </div>
              <div className="hidden lg:flex lg:space-x-4">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                        isActive
                          ? "bg-red-500/15 text-red-400 border border-red-500/30"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
            
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg">
                <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="text-sm text-slate-300 truncate max-w-[200px]">{user?.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-slate-200 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors whitespace-nowrap"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">{children}</main>
    </>
  );
}