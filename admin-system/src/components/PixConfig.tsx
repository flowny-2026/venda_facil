import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CreditCard, Save, Check } from 'lucide-react';

interface PixSettings {
  pix_key: string;
  pix_key_type: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
  pix_name: string;
  pix_city: string;
}

export default function PixConfig() {
  const [settings, setSettings] = useState<PixSettings>({
    pix_key: '',
    pix_key_type: 'cpf',
    pix_name: '',
    pix_city: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('pix_key, pix_key_type, pix_name, pix_city')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          pix_key: data.pix_key || '',
          pix_key_type: data.pix_key_type || 'cpf',
          pix_name: data.pix_name || '',
          pix_city: data.pix_city || ''
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações Pix:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('admin_settings')
        .update({
          pix_key: settings.pix_key,
          pix_key_type: settings.pix_key_type,
          pix_name: settings.pix_name,
          pix_city: settings.pix_city,
          updated_at: new Date().toISOString()
        })
        .eq('id', (await supabase.from('admin_settings').select('id').single()).data?.id);

      if (error) throw error;

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error: any) {
      alert('Erro ao salvar: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
        <div className="text-slate-400 text-sm">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-500/15 rounded-lg">
          <CreditCard className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-100">Configuração Pix</h3>
          <p className="text-sm text-slate-400">
            Chave Pix que será exibida para os clientes realizarem pagamentos
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Tipo de chave */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Tipo de Chave Pix
          </label>
          <select
            value={settings.pix_key_type}
            onChange={(e) => setSettings({ ...settings, pix_key_type: e.target.value as any })}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/50"
          >
            <option value="cpf">CPF</option>
            <option value="cnpj">CNPJ</option>
            <option value="email">E-mail</option>
            <option value="phone">Telefone</option>
            <option value="random">Chave Aleatória</option>
          </select>
        </div>

        {/* Chave Pix */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Chave Pix
          </label>
          <input
            type="text"
            value={settings.pix_key}
            onChange={(e) => setSettings({ ...settings, pix_key: e.target.value })}
            placeholder="Digite sua chave Pix..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/50"
          />
        </div>

        {/* Nome do titular */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Nome do Titular
          </label>
          <input
            type="text"
            value={settings.pix_name}
            onChange={(e) => setSettings({ ...settings, pix_name: e.target.value })}
            placeholder="Nome que aparecerá no Pix..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/50"
          />
        </div>

        {/* Cidade */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Cidade
          </label>
          <input
            type="text"
            value={settings.pix_city}
            onChange={(e) => setSettings({ ...settings, pix_city: e.target.value })}
            placeholder="Cidade do titular..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/50"
          />
        </div>

        {/* Preview */}
        {settings.pix_key && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <p className="text-xs text-slate-400 mb-2">Preview para o cliente:</p>
            <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2">
              <code className="text-sm text-green-400 font-mono break-all">
                {settings.pix_key}
              </code>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {settings.pix_name && `Titular: ${settings.pix_name}`}
            </p>
          </div>
        )}

        {/* Botão salvar */}
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            saved
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {saved ? (
            <>
              <Check className="w-4 h-4" />
              Salvo!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {saving ? 'Salvando...' : 'Salvar Configuração'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}