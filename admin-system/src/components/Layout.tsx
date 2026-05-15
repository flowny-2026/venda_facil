import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { BarChart3, Building, TrendingUp, Settings, LogOut, User, Mail } from "lucide-react";
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

  console.log('🎨 Layout renderizado, newLeadsCount:', newLeadsCount);

  // Função para atualizar manualmente (para debug)
  const forceUpdate = () => {
    console.log('🔄 Forçando atualização manual...');
    loadNewLeadsCount();
  };

  // Buscar contagem de leads novos
  useEffect(() => {
    console.log('🚀 Layout carregado, iniciando busca de leads...');
    loadNewLeadsCount();

    // Atualizar a cada 30 segundos
    const interval = setInterval(() => {
      console.log('⏰ Atualizando contagem de leads (30s)...');
      loadNewLeadsCount();
    }, 30000);

    // Subscrever a mudanças em tempo real
    const subscription = supabase
      .channel('leads_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'landing_leads' },
        (payload) => {
          console.log('🔔 Mudança detectada na tabela landing_leads:');
          console.log('   - Evento:', payload.eventType);
          console.log('   - Dados antigos:', payload.old);
          console.log('   - Dados novos:', payload.new);
          
          // Só atualizar se realmente houve mudança no status
          if (payload.eventType === 'UPDATE' && payload.old && payload.new) {
            const oldStatus = payload.old.status;
            const newStatus = payload.new.status;
            console.log('   - Status mudou de:', oldStatus, 'para:', newStatus);
            
            if (oldStatus !== newStatus) {
              console.log('✅ Status realmente mudou, atualizando badge...');
              loadNewLeadsCount();
            } else {
              console.log('ℹ️ Status não mudou, não atualizando badge');
            }
          } else if (payload.eventType === 'INSERT') {
            console.log('✅ Novo lead inserido, atualizando badge...');
            loadNewLeadsCount();
          } else {
            console.log('ℹ️ Evento não relevante para o badge');
          }
        }
      )
      .subscribe();

    return () => {
      console.log('🧹 Limpando interval e subscription...');
      clearInterval(interval);
      subscription.unsubscribe();
    };
  }, []);

  // Atualizar contagem quando mudar de página
  useEffect(() => {
    if (location.pathname === '/leads') {
      console.log('📍 Usuário entrou na página de Leads');
      // NÃO atualizar automaticamente só por entrar na página
      // O badge deve permanecer até que o status seja alterado
    }
  }, [location.pathname]);

  const loadNewLeadsCount = async () => {
    const now = Date.now();
    
    // Evitar atualizações muito frequentes (menos de 2 segundos)
    if (now - lastUpdateTime < 2000) {
      console.log('⏸️ Pulando atualização (muito recente)');
      return;
    }
    
    try {
      console.log('🔍 Carregando contagem de leads novos...');
      setIsLoadingLeads(true);
      setLastUpdateTime(now);
      
      // Primeiro, testar se conseguimos acessar a tabela
      console.log('🧪 Testando acesso à tabela landing_leads...');
      
      const { data, error } = await supabase
        .from('landing_leads')
        .select('id, status')
        .limit(1);

      console.log('📊 Teste de acesso:');
      console.log('   - data:', data);
      console.log('   - error:', error);

      if (error) {
        console.error('❌ Erro no teste de acesso:', error);
        console.error('❌ Detalhes do erro:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        // Se não conseguir acessar a tabela, definir count como 0
        setNewLeadsCount(0);
        return;
      }
      
      // Se chegou até aqui, a tabela existe e temos acesso
      console.log('✅ Acesso à tabela confirmado, buscando leads novos...');
      
      const { data: newLeads, error: countError } = await supabase
        .from('landing_leads')
        .select('id')
        .eq('status', 'novo');

      if (countError) {
        console.error('❌ Erro ao buscar leads novos:', countError);
        setNewLeadsCount(0);
        return;
      }
      
      const count = newLeads ? newLeads.length : 0;
      console.log('✅ Leads novos encontrados:', count);
      
      // Só atualizar se o valor realmente mudou
      if (count !== newLeadsCount) {
        console.log('🔄 Contagem mudou de', newLeadsCount, 'para', count);
        setNewLeadsCount(count);
      } else {
        console.log('ℹ️ Contagem não mudou, mantendo:', count);
      }
      
    } catch (error) {
      console.error('❌ Erro geral:', error);
      setNewLeadsCount(0);
    } finally {
      setIsLoadingLeads(false);
    }
  };

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
                  const isLeads = item.name === "Leads";
                  const hasNewLeads = isLeads && newLeadsCount > 0;
                  
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap relative ${
                        isActive
                          ? "bg-red-500/15 text-red-400 border border-red-500/30"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.name}
                      {isLeads && (
                        <>
                          {isLoadingLeads ? (
                            <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-blue-500 text-white text-xs font-bold rounded-full animate-spin">
                              ⟳
                            </span>
                          ) : hasNewLeads ? (
                            <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                              {newLeadsCount}
                            </span>
                          ) : null}
                        </>
                      )}
                      {/* Botão de debug - clique duplo para atualizar */}
                      {isLeads && (
                        <span 
                          onDoubleClick={forceUpdate}
                          className="absolute -bottom-1 -right-1 w-2 h-2 bg-gray-500 rounded-full opacity-30 cursor-pointer"
                          title="Duplo clique para atualizar"
                        />
                      )}
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