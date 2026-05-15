import { useState, useEffect } from 'react';
import { Database, Wifi, WifiOff, User, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

export default function SupabaseStatus() {
  const { user, loading } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected' | 'error'>('checking');
  const [config, setConfig] = useState({
    url: '',
    hasKey: false,
    isConfigured: false
  });
  const [error, setError] = useState<string>('');

  useEffect(() => {
    checkSupabaseConnection();
  }, []);

  const checkSupabaseConnection = async () => {
    try {
      // Verificar configuração
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('supabase_url');
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('supabase_key');
      
      setConfig({
        url: supabaseUrl || 'Não configurado',
        hasKey: !!supabaseKey,
        isConfigured: !!(supabaseUrl && supabaseKey)
      });

      if (!supabaseUrl || !supabaseKey) {
        setConnectionStatus('disconnected');
        setError('Credenciais do Supabase não configuradas');
        return;
      }

      // Testar conexão
      const { data, error: connectionError } = await supabase
        .from('sales')
        .select('count')
        .limit(1);

      if (connectionError) {
        setConnectionStatus('error');
        setError(connectionError.message);
      } else {
        setConnectionStatus('connected');
        setError('');
      }
    } catch (err: any) {
      setConnectionStatus('error');
      setError(err.message || 'Erro desconhecido');
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'checking':
        return <Database className="w-5 h-5 text-yellow-400 animate-pulse" />;
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'disconnected':
        return <WifiOff className="w-5 h-5 text-slate-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Database className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'checking':
        return 'Verificando conexão...';
      case 'connected':
        return 'Conectado ao Supabase';
      case 'disconnected':
        return 'Usando LocalStorage';
      case 'error':
        return 'Erro na conexão';
      default:
        return 'Status desconhecido';
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'checking':
        return 'text-yellow-400';
      case 'connected':
        return 'text-green-400';
      case 'disconnected':
        return 'text-slate-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-soft">
      <div className="flex items-center gap-3 mb-4">
        {getStatusIcon()}
        <div>
          <h3 className="font-semibold text-slate-100">Status da Conexão</h3>
          <p className={`text-sm ${getStatusColor()}`}>{getStatusText()}</p>
        </div>
        <button
          onClick={checkSupabaseConnection}
          className="ml-auto px-3 py-1 text-xs bg-slate-800/50 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors"
        >
          Verificar
        </button>
      </div>

      <div className="space-y-3">
        {/* Configuração */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-slate-800/30 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Database className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-300">URL do Projeto</span>
            </div>
            <p className="text-xs text-slate-400 font-mono break-all">
              {config.url}
            </p>
          </div>

          <div className="p-3 bg-slate-800/30 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-300">Chave API</span>
            </div>
            <p className="text-xs text-slate-400">
              {config.hasKey ? '✅ Configurada' : '❌ Não configurada'}
            </p>
          </div>
        </div>

        {/* Status do usuário */}
        {config.isConfigured && (
          <div className="p-3 bg-slate-800/30 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-300">Usuário Autenticado</span>
            </div>
            <p className="text-xs text-slate-400">
              {loading ? (
                'Verificando...'
              ) : user ? (
                `✅ ${user.email}`
              ) : (
                '❌ Não logado'
              )}
            </p>
          </div>
        )}

        {/* Erro */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium text-red-300">Erro</span>
            </div>
            <p className="text-xs text-red-300">{error}</p>
          </div>
        )}

        {/* Informações de debug */}
        <details className="text-xs">
          <summary className="cursor-pointer text-slate-400 hover:text-slate-300">
            Informações de Debug
          </summary>
          <div className="mt-2 p-3 bg-slate-800/50 rounded-lg font-mono text-slate-400">
            <div>Environment URL: {import.meta.env.VITE_SUPABASE_URL || 'Não definida'}</div>
            <div>Environment Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Definida' : 'Não definida'}</div>
            <div>LocalStorage URL: {localStorage.getItem('supabase_url') || 'Não definida'}</div>
            <div>LocalStorage Key: {localStorage.getItem('supabase_key') ? 'Definida' : 'Não definida'}</div>
            <div>Connection Status: {connectionStatus}</div>
            <div>User ID: {user?.id || 'N/A'}</div>
          </div>
        </details>
      </div>
    </div>
  );
}