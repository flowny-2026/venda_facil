import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { BarChart3, Building, TrendingUp, Settings, LogOut, User, Mail, Menu, X } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";

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
  const [newLeadsCount, setNewLeadsCount] = useState(0);
  const [isLoadingLeads, setIsLoadingLeads] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    loadNewLeadsCount();
    const interval = setInterval(() => loadNewLeadsCount(), 30000);
    const subscription = supabase
      .channel('leads_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'landing_leads' },
        (payload) => {
          if (payload.eventType === 'UPDATE' && payload.old && payload.new) {
            if (payload.old.status !== payload.new.status) loadNewLeadsCount();
          } else if (payload.eventType === 'INSERT') {
            loadNewLeadsCount();
          }
        }
      ).subscribe();
    return () => { clearInterval(interval); subscription.unsubscribe(); };
  }, []);

  const loadNewLeadsCount = async () => {
    const now = Date.now();
    if (now - lastUpdateTime < 2000) return;
    try {
      setIsLoadingLeads(true);
      setLastUpdateTime(now);
      const { error } = await supabase.from('landing_leads').select('id, status').limit(1);
      if (error) { setNewLeadsCount(0); return; }
      const { data: newLeads, error: countError } = await supabase.from('landing_leads').select('id').eq('status', 'novo');
      if (countError) { setNewLeadsCount(0); return; }
      const count = newLeads ? newLeads.length : 0;
      if (count !== newLeadsCount) setNewLeadsCount(count);
    } catch { setNewLeadsCount(0); }
    finally { setIsLoadingLeads(false); }
  };

  const handleLogout = async () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      try {
        sessionStorage.setItem('intentional_logout', 'true');
        localStorage.removeItem('admin_email');
        localStorage.removeItem('admin_password');
        await signOut();
        window.location.href = '/';
      } catch (error) { console.error('Erro ao fazer logout:', error); }
    }
  };

  return (
    <>
      <nav className="bg-slate-900/50 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <img
                src="/admin/assets/images/logo-vendafacil.png"
                alt="VendaFácil Admin"
                className="h-9 w-auto object-contain"
                style={{ filter: 'drop-shadow(0 2px 8px rgba(239, 68, 68, 0.3))' }}
              />
              <span className="text-base font-bold text-slate-100">Admin</span>
            </div>

            {/* Menu desktop */}
            <div className="hidden lg:flex lg:space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                const isLeads = item.name === "Leads";
                const hasNewLeads = isLeads && newLeadsCount > 0;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap relative ${
                      isActive ? "bg-red-500/15 text-red-400 border border-red-500/30" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                    {isLeads && !isLoadingLeads && hasNewLeads && (
                      <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                        {newLeadsCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Direita: user + logout + hamburguer */}
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg">
                <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="text-sm text-slate-300 truncate max-w-[150px]">{user?.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-3 py-2 text-slate-400 hover:text-slate-200 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Sair</span>
              </button>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg transition-colors"
              >
                {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Menu mobile */}
        {menuOpen && (
          <div className="lg:hidden border-t border-slate-800 bg-slate-900">
            <div className="px-4 py-3 grid grid-cols-2 gap-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                const isLeads = item.name === "Leads";
                const hasNewLeads = isLeads && newLeadsCount > 0;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-2 px-3 py-3 rounded-lg text-sm font-medium transition-colors relative ${
                      isActive ? "bg-red-500/15 text-red-400 border border-red-500/30" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {item.name}
                    {isLeads && hasNewLeads && (
                      <span className="ml-auto flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full">
                        {newLeadsCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
            <div className="px-4 pb-3 flex items-center gap-2 border-t border-slate-800 pt-3">
              <User className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-400 truncate">{user?.email}</span>
            </div>
          </div>
        )}
      </nav>
      <main className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">{children}</main>
    </>
  );
}
