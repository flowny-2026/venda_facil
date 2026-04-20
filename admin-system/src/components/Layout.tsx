import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { BarChart3, Building, TrendingUp, Settings, LogOut, User } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Clientes", href: "/clientes", icon: Building },
  { name: "Vendas", href: "/vendas", icon: TrendingUp },
  { name: "Configurações", href: "/configuracoes", icon: Settings },
];

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      await signOut();
    }
  };

  return (
    <>
      <nav className="bg-slate-900/50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <div className="p-2 bg-red-500/15 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-red-400" />
                </div>
                <span className="ml-3 text-xl font-bold text-slate-100">Admin - Sistema de Vendas</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        isActive
                          ? "border-red-500 text-slate-100"
                          : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg">
                <User className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-300">{user?.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-slate-200 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">{children}</main>
    </>
  );
}