import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  LogOut, 
  Menu, 
  X,
  Shield
} from 'lucide-react';
import { useAdminAuth } from '../hooks/useAdminAuth';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { admin, signOut } = useAdminAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Empresas', href: '/admin/companies', icon: Building2 },
    { name: 'Usuários', href: '/admin/users', icon: Users },
  ];

  const handleLogout = async () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      await signOut();
    }
  };

  return (
    <div className="flex h-screen bg-slate-950">
      {/* Sidebar Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-slate-900/80" />
        </div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-slate-100">Admin Panel</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-slate-400 hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800'
                  }
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
              <Shield className="w-4 h-4 text-slate-300" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-200 truncate">
                {admin?.name}
              </div>
              <div className="text-xs text-slate-400 truncate">
                {admin?.email}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-300 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-400">
              Painel Administrativo - Sistema de Vendas SaaS
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-slate-950 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}