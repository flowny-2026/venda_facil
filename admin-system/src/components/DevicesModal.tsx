import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X, Monitor, Smartphone, Globe, Clock, Trash2, RefreshCw, AlertTriangle } from 'lucide-react';

interface Device {
  id: string;
  company_id: string;
  device_fingerprint: string;
  device_name: string;
  ip_address: string;
  user_agent: string;
  last_login: string;
  is_active: boolean;
  created_at: string;
}

interface Company {
  id: string;
  name: string;
  max_devices: number;
}

interface DevicesModalProps {
  company: Company;
  onClose: () => void;
}

export default function DevicesModal({ company, onClose }: DevicesModalProps) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [kicking, setKicking] = useState<string | null>(null);

  useEffect(() => { loadDevices(); }, []);

  const loadDevices = async () => {
    try {
      const { data, error } = await supabase
        .from('company_devices')
        .select('*')
        .eq('company_id', company.id)
        .order('last_login', { ascending: false });

      if (error) throw error;
      setDevices(data || []);
    } catch (error) {
      console.error('Erro ao carregar dispositivos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKickDevice = async (deviceId: string) => {
    if (!confirm('Deslogar este dispositivo? O usuário será desconectado imediatamente.')) return;

    setKicking(deviceId);
    try {
      const { error } = await supabase
        .from('company_devices')
        .update({ is_active: false })
        .eq('id', deviceId);

      if (error) throw error;

      await loadDevices();
    } catch (error: any) {
      alert('Erro ao deslogar: ' + error.message);
    } finally {
      setKicking(null);
    }
  };

  const handleKickAll = async () => {
    if (!confirm('Deslogar TODOS os dispositivos desta empresa? Todos os usuários serão desconectados.')) return;

    try {
      const { error } = await supabase
        .from('company_devices')
        .update({ is_active: false })
        .eq('company_id', company.id)
        .eq('is_active', true);

      if (error) throw error;

      await loadDevices();
    } catch (error: any) {
      alert('Erro: ' + error.message);
    }
  };

  const getDeviceIcon = (userAgent: string) => {
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return <Smartphone className="w-5 h-5 text-purple-400" />;
    }
    return <Monitor className="w-5 h-5 text-blue-400" />;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('pt-BR');
  };

  const activeDevices = devices.filter(d => d.is_active);
  const isOverLimit = activeDevices.length > company.max_devices;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-slate-800 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
              <Monitor className="w-5 h-5 text-blue-400" />
              Dispositivos — {company.name}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {activeDevices.length} de {company.max_devices} dispositivo(s) ativo(s)
              {isOverLimit && (
                <span className="text-red-400 ml-2 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Limite excedido!
                </span>
              )}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Ações */}
          <div className="flex gap-3">
            <button
              onClick={loadDevices}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </button>
            {activeDevices.length > 0 && (
              <button
                onClick={handleKickAll}
                className="flex items-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Deslogar Todos
              </button>
            )}
          </div>

          {/* Lista de dispositivos */}
          {loading ? (
            <div className="flex items-center justify-center py-8 gap-2 text-slate-400">
              <RefreshCw className="w-4 h-4 animate-spin" /> Carregando...
            </div>
          ) : devices.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Monitor className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>Nenhum dispositivo registrado</p>
            </div>
          ) : (
            <div className="space-y-2">
              {devices.map((device) => (
                <div
                  key={device.id}
                  className={`flex items-center justify-between p-4 rounded-xl border ${
                    device.is_active
                      ? 'bg-slate-800/50 border-slate-700'
                      : 'bg-slate-800/20 border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {getDeviceIcon(device.user_agent)}
                    <div>
                      <div className="text-sm font-medium text-slate-200">
                        {device.device_name}
                        {device.is_active && (
                          <span className="ml-2 px-1.5 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">
                            Ativo
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                        <Globe className="w-3 h-3" />
                        {device.ip_address || 'IP não registrado'}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        Último acesso: {formatDate(device.last_login)}
                      </div>
                    </div>
                  </div>

                  {device.is_active && (
                    <button
                      onClick={() => handleKickDevice(device.id)}
                      disabled={kicking === device.id}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                      title="Deslogar dispositivo"
                    >
                      {kicking === device.id ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}