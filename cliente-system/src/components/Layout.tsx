import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BarChart3, FileText, Settings, ShoppingCart, Package, Users, CreditCard, UserCheck, Menu, X } from "lucide-react";
import { useUserRole } from "../hooks/useUserRole";
import logoUrl from '../assets/logo-vendafacil.png'

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { permissions, isSeller, isManager } = useUserRole();
  const [menuOpen, setMenuOpen] = useState(false);

  const allNavigation = [
    { name: "Painel", href: "/", icon: BarChart3, requiresPermission: null },
    { name: "PDV", href: "/pdv", icon: ShoppingCart, requiresPermission: 'canAccessPdv' },
    { name: "Clientes", href: "/clientes", icon: UserCheck, requiresPermission: null },
    { name: "Produtos", href: "/produtos", icon: Package, requiresPermission: 'canManageProducts' },
    { name: "Vendedores", href: "/vendedores", icon: Users, requiresPermission: 'canManageSellers' },
    { name: "Pagamentos", href: "/pagamentos", icon: CreditCard, requiresPermission: null },
    { name: "Relatórios", href: "/relatorios", icon: FileText, requiresPermission: 'canViewReports' },
    { name: "Configurações", href: "/configuracoes", icon: Settings, requiresPermission: null },
  ];

  const navigation = allNavigation.filter(item => {
    if (!item.requiresPermission) return true;
    if (!permissions) return true;
    if (isManager) return true;
    return permissions[item.requiresPermission as keyof typeof permissions] === true;
  });

  return (
    <>
      <nav className="bg-slate-900/50 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <img
                src={logoUrl}
                alt="VendaFácil"
                className="h-9 w-auto object-contain"
                style={{ filter: 'drop-shadow(0 2px 8px rgba(59, 130, 246, 0.3))' }}
              />
              <div>
                <span className="text-base font-bold text-slate-100">PDV</span>
                {isSeller && permissions?.sellerName && (
                  <div className="text-xs text-slate-400 leading-tight">
                    {permissions.sellerName}
                  </div>
                )}
              </div>
            </div>

            {/* Menu desktop */}
            <div className="hidden lg:flex lg:space-x-1 overflow-x-auto">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      isActive
                        ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* Botão hamburguer mobile */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg transition-colors"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {menuOpen && (
          <div className="lg:hidden border-t border-slate-800 bg-slate-900">
            <div className="px-4 py-3 grid grid-cols-2 gap-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-2 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </>
  );
}
