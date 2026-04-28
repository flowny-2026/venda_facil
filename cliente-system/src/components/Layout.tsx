import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { BarChart3, FileText, Settings, ShoppingCart, Package, Users, CreditCard } from "lucide-react";
import { useUserRole } from "../hooks/useUserRole";

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { permissions, isSeller, isManager } = useUserRole();

  const allNavigation = [
    { name: "Painel", href: "/", icon: BarChart3, requiresPermission: null },
    { name: "PDV", href: "/pdv", icon: ShoppingCart, requiresPermission: 'canAccessPdv' },
    { name: "Produtos", href: "/produtos", icon: Package, requiresPermission: 'canManageProducts' },
    { name: "Vendedores", href: "/vendedores", icon: Users, requiresPermission: 'canManageSellers' },
    { name: "Pagamentos", href: "/pagamentos", icon: CreditCard, requiresPermission: null },
    { name: "Relatórios", href: "/relatorios", icon: FileText, requiresPermission: 'canViewReports' },
    { name: "Configurações", href: "/configuracoes", icon: Settings, requiresPermission: null },
  ];

  // Filtrar navegação baseado nas permissões
  const navigation = allNavigation.filter(item => {
    // Se não requer permissão específica, mostrar para todos
    if (!item.requiresPermission) return true;
    
    // Se não tem permissões carregadas ainda, mostrar tudo (será filtrado depois)
    if (!permissions) return true;
    
    // Gerentes sempre veem tudo
    if (isManager) return true;
    
    // Verificar permissão específica
    return permissions[item.requiresPermission as keyof typeof permissions] === true;
  });

  return (
    <>
      <nav className="bg-slate-900/50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            <div className="flex items-center gap-6 flex-1 min-w-0">
              <div className="flex-shrink-0 flex items-center gap-3">
                <img 
                  src="/assets/images/logo-vendafacil.png" 
                  alt="VendaFácil" 
                  className="h-[105px] w-auto object-contain"
                  style={{ filter: 'drop-shadow(0 2px 8px rgba(59, 130, 246, 0.3))' }}
                />
                <div>
                  <span className="text-lg font-bold text-slate-100 whitespace-nowrap">PDV</span>
                  {isSeller && permissions?.sellerName && (
                    <div className="text-xs text-slate-400">
                      Vendedor: {permissions.sellerName}
                    </div>
                  )}
                </div>
              </div>
              <div className="hidden lg:flex lg:space-x-4 overflow-x-auto">
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
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">{children}</main>
    </>
  );
}
