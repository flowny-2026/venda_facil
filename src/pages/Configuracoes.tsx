import { useState } from "react";
import { Save, User, Bell, Palette, Database, Shield, LogIn, UserPlus, Key, LogOut } from "lucide-react";
import DataManagement from "../components/DataManagement";
import AuthModal from "../components/AuthModal";
import { useAuth } from "../hooks/useAuth";

export default function Configuracoes() {
  const { user, signOut } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [settings, setSettings] = useState({
    // Configurações de perfil
    nome: "João Silva",
    email: "joao@empresa.com",
    cargo: "Gerente de Vendas",
    
    // Configurações de notificações
    emailNotifications: true,
    pushNotifications: false,
    weeklyReport: true,
    
    // Configurações de aparência
    theme: "dark",
    language: "pt-BR",
    
    // Configurações de dados
    dataRetention: "90",
    autoBackup: true,
  });

  const handleLogout = async () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      await signOut();
    }
  };

  const handleSave = () => {
    // Aqui você salvaria as configurações
    alert("Configurações salvas com sucesso!");
  };

  const handleDataChange = () => {
    // Callback para quando os dados mudarem
    window.location.reload(); // Recarrega a página para atualizar o dashboard
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Configurações</h1>
        <p className="mt-2 text-slate-400">Gerencie suas preferências e configurações do sistema</p>
      </div>

      {/* Seção de Autenticação */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-soft">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-500/15 rounded-lg">
            <Shield className="w-5 h-5 text-blue-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-100">Autenticação</h2>
        </div>
        
        {user ? (
          // Usuário logado
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-green-300">Usuário Conectado</div>
                <div className="text-xs text-green-400/80">{user.email}</div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-300 hover:bg-red-500/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          </div>
        ) : (
          // Usuário não logado
          <div className="space-y-4">
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <div className="text-sm text-amber-300 mb-3">
                Para acessar o painel de vendas, você precisa fazer login ou criar uma conta.
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Entrar
                </button>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  Criar Conta
                </button>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium transition-colors"
                >
                  <Key className="w-4 h-4" />
                  Recuperar Senha
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Perfil do Usuário */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-soft">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/15 rounded-lg">
              <User className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-100">Perfil do Usuário</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Nome</label>
              <input
                type="text"
                value={settings.nome}
                onChange={(e) => setSettings({ ...settings, nome: e.target.value })}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Cargo</label>
              <input
                type="text"
                value={settings.cargo}
                onChange={(e) => setSettings({ ...settings, cargo: e.target.value })}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>
        </div>

        {/* Notificações */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-soft">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-500/15 rounded-lg">
              <Bell className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-100">Notificações</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-200">Notificações por Email</div>
                <div className="text-xs text-slate-400">Receber alertas por email</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-200">Notificações Push</div>
                <div className="text-xs text-slate-400">Alertas no navegador</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.pushNotifications}
                  onChange={(e) => setSettings({ ...settings, pushNotifications: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-200">Relatório Semanal</div>
                <div className="text-xs text-slate-400">Resumo semanal por email</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.weeklyReport}
                  onChange={(e) => setSettings({ ...settings, weeklyReport: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Aparência */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-soft">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/15 rounded-lg">
              <Palette className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-100">Aparência</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Tema</label>
              <select
                value={settings.theme}
                onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="dark">Escuro</option>
                <option value="light">Claro</option>
                <option value="auto">Automático</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Idioma</label>
              <select
                value={settings.language}
                onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en-US">English (US)</option>
                <option value="es-ES">Español</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dados e Backup */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-soft">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-500/15 rounded-lg">
              <Database className="w-5 h-5 text-green-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-100">Dados e Backup</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Retenção de Dados</label>
              <select
                value={settings.dataRetention}
                onChange={(e) => setSettings({ ...settings, dataRetention: e.target.value })}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="30">30 dias</option>
                <option value="90">90 dias</option>
                <option value="180">6 meses</option>
                <option value="365">1 ano</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-200">Backup Automático</div>
                <div className="text-xs text-slate-400">Backup diário dos dados</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoBackup}
                  onChange={(e) => setSettings({ ...settings, autoBackup: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Gerenciamento de Dados */}
      <DataManagement onDataChange={handleDataChange} />

      {/* Seção de Segurança */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-soft">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-500/15 rounded-lg">
            <Shield className="w-5 h-5 text-red-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-100">Segurança</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-200 hover:border-slate-600 transition-colors">
            Alterar Senha
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-200 hover:border-slate-600 transition-colors">
            Autenticação 2FA
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-200 hover:border-slate-600 transition-colors">
            Sessões Ativas
          </button>
        </div>
      </div>

      {/* Botão Salvar */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Save className="w-4 h-4" />
          Salvar Configurações
        </button>
      </div>

      {/* Modal de Autenticação */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}