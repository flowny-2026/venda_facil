import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import { 
  Settings, 
  User, 
  Shield,
  Database,
  Bell,
  Mail,
  Lock,
  Save,
  RefreshCw,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface AdminUser {
  id: string;
  user_id: string;
  role: 'super_admin' | 'admin' | 'support';
  permissions: any;
  active: boolean;
  created_at: string;
  users?: {
    email: string;
  };
}

export default function Configuracoes() {
  const { user } = useAuth();
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [settings, setSettings] = useState({
    systemName: 'Sistema de Vendas Admin',
    supportEmail: 'suporte@empresa.com',
    maxCompaniesPerAdmin: 100,
    defaultPlan: 'starter',
    enableNotifications: true,
    enableEmailReports: true,
    maintenanceMode: false
  });

  useEffect(() => {
    loadAdminUsers();
  }, []);

  const loadAdminUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select(`
          *,
          users:user_id (email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdminUsers(data || []);
    } catch (error) {
      console.error('Erro ao carregar administradores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setMessage(null);

    try {
      // Simular salvamento das configurações
      // Em um sistema real, você salvaria no banco de dados
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao salvar configurações.' });
    } finally {
      setSaving(false);
    }
  };

  const toggleAdminStatus = async (adminId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('admin_users')
        .update({ active: !currentStatus })
        .eq('id', adminId);

      if (error) throw error;

      setAdminUsers(prev => 
        prev.map(admin => 
          admin.id === adminId 
            ? { ...admin, active: !currentStatus }
            : admin
        )
      );

      setMessage({ 
        type: 'success', 
        text: `Administrador ${!currentStatus ? 'ativado' : 'desativado'} com sucesso!` 
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao alterar status do administrador.' });
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-500/15 text-red-400 border-red-500/30';
      case 'admin': return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'support': return 'bg-green-500/15 text-green-400 border-green-500/30';
      default: return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'Administrador';
      case 'support': return 'Suporte';
      default: return role;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2 text-slate-400">
            <RefreshCw className="w-5 h-5 animate-spin" />
            Carregando configurações...
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">Configurações do Sistema</h1>
            <p className="text-slate-400">Gerencie as configurações gerais e administradores</p>
          </div>
        </div>

        {/* Mensagem de feedback */}
        {message && (
          <div className={`p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-500/10 border-green-500/20 text-green-300' 
              : 'bg-red-500/10 border-red-500/20 text-red-300'
          }`}>
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
              {message.text}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configurações Gerais */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-semibold text-slate-100">Configurações Gerais</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nome do Sistema
                </label>
                <input
                  type="text"
                  value={settings.systemName}
                  onChange={(e) => setSettings({...settings, systemName: e.target.value})}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email de Suporte
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => setSettings({...settings, supportEmail: e.target.value})}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Plano Padrão para Novas Empresas
                </label>
                <select
                  value={settings.defaultPlan}
                  onChange={(e) => setSettings({...settings, defaultPlan: e.target.value})}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="starter">Starter - R$ 29/mês</option>
                  <option value="professional">Professional - R$ 79/mês</option>
                  <option value="enterprise">Enterprise - R$ 199/mês</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Máximo de Empresas por Admin
                </label>
                <input
                  type="number"
                  value={settings.maxCompaniesPerAdmin}
                  onChange={(e) => setSettings({...settings, maxCompaniesPerAdmin: parseInt(e.target.value)})}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  min="1"
                  max="1000"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-300">Notificações Ativas</span>
                  </div>
                  <button
                    onClick={() => setSettings({...settings, enableNotifications: !settings.enableNotifications})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.enableNotifications ? 'bg-blue-600' : 'bg-slate-600'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.enableNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-300">Relatórios por Email</span>
                  </div>
                  <button
                    onClick={() => setSettings({...settings, enableEmailReports: !settings.enableEmailReports})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.enableEmailReports ? 'bg-blue-600' : 'bg-slate-600'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.enableEmailReports ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-300">Modo Manutenção</span>
                  </div>
                  <button
                    onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.maintenanceMode ? 'bg-red-600' : 'bg-slate-600'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>

              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg font-medium transition-colors"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? 'Salvando...' : 'Salvar Configurações'}
              </button>
            </div>
          </div>

          {/* Administradores */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-red-400" />
              <h2 className="text-xl font-semibold text-slate-100">Administradores</h2>
            </div>

            <div className="space-y-4">
              {adminUsers.length === 0 ? (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">Nenhum administrador encontrado</p>
                </div>
              ) : (
                adminUsers.map((admin) => (
                  <div key={admin.id} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${admin.active ? 'bg-green-500/15' : 'bg-slate-500/15'}`}>
                        <User className={`w-4 h-4 ${admin.active ? 'text-green-400' : 'text-slate-400'}`} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-200">
                          {admin.users?.email || 'Email não encontrado'}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded border ${getRoleColor(admin.role)}`}>
                            {getRoleLabel(admin.role)}
                          </span>
                          <span className={`text-xs ${admin.active ? 'text-green-400' : 'text-slate-500'}`}>
                            {admin.active ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {admin.user_id !== user?.id && (
                      <button
                        onClick={() => toggleAdminStatus(admin.id, admin.active)}
                        className={`px-3 py-1 text-xs rounded border transition-colors ${
                          admin.active
                            ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                            : 'border-green-500/30 text-green-400 hover:bg-green-500/10'
                        }`}
                      >
                        {admin.active ? 'Desativar' : 'Ativar'}
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Informações do Sistema */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-semibold text-slate-100">Informações do Sistema</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-800/30 rounded-lg">
              <div className="text-sm text-slate-400">Versão do Sistema</div>
              <div className="text-lg font-semibold text-slate-200">v1.0.0</div>
            </div>
            
            <div className="p-4 bg-slate-800/30 rounded-lg">
              <div className="text-sm text-slate-400">Banco de Dados</div>
              <div className="text-lg font-semibold text-slate-200">Supabase</div>
            </div>
            
            <div className="p-4 bg-slate-800/30 rounded-lg">
              <div className="text-sm text-slate-400">Status</div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-lg font-semibold text-green-400">Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}