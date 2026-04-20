import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { BarChart3, FileText, Settings, ShoppingCart, Package, Users, CreditCard } from "lucide-react";

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();

  const navigation = [
    { name: "Painel", href: "/", icon: BarChart3 },
    { name: "PDV", href: "/pdv", icon: ShoppingCart },
    { name: "Produtos", href: "/produtos", icon: Package },
    { name: "Vendedores", href: "/vendedores", icon: Users },
    { name: "Pagamentos", href: "/pagamentos", icon: CreditCard },
    { name: "Relatórios", href: "/relatorios", icon: FileText },
    { name: "Configurações", href: "/configuracoes", icon: Settings },
  ];

  return (
    <>
      <nav className="bg-slate-900/50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <BarChart3 className="h-8 w-8 text-blue-500" />
                <span className="ml-2 text-xl font-bold text-slate-100">Painel de Vendas</span>
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
                          ? "border-blue-500 text-slate-100"
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
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">{children}</main>
    </>
  );
}