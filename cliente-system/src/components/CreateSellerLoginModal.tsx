import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Key, Mail, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

interface CreateSellerLoginModalProps {
  seller: { id: string; name: string; email: string; };
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateSellerLoginModal({ seller, onClose, onSuccess }: CreateSellerLoginModalProps) {
  const [email, setEmail] = useState(seller.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) { setError('Email é obrigatório'); return; }
    if (password.length < 6) { setError('A senha deve ter pelo menos 6 caracteres'); return; }
    if (password !== confirmPassword) { setError('As senhas não coincidem'); return; }

    try {
      setLoading(true);

      // 1. Criar usuário via RPC sem afetar sessão atual
      const { error: rpcError } = await supabase.rpc('create_seller_user', {
        p_email: email,
        p_password: password,
        p_seller_name: seller.name,
        p_company_id: null, // será buscado pela função
        p_seller_id: seller.id
      });

      if (rpcError) throw new Error(`Erro ao criar usuário: ${rpcError.message}`);

      // 2. Atualizar email do vendedor se necessário
      if (email !== seller.email) {
        await supabase.from('sellers').update({ email }).eq('id', seller.id);
      }

      alert(`✅ Login criado com sucesso!\n\nCredenciais:\nEmail: ${email}\nSenha: ${password}\n\nEnvie essas credenciais para o vendedor.`);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erro ao criar login:', error);
      setError(error.message || 'Erro ao criar login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Key className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-100">Criar Login para Vendedor</h2>
            <p className="text-sm text-slate-400">{seller.name}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email de Acesso</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="vendedor@email.com" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Senha</label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-10 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="Mínimo 6 caracteres" required minLength={6} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Confirmar Senha</label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="Digite a senha novamente" required />
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-300">
                <p className="font-medium mb-1">Permissões do Vendedor:</p>
                <ul className="space-y-1 text-xs">
                  <li>✅ Pode registrar vendas no PDV</li>
                  <li>✅ Vê apenas suas vendas</li>
                  <li>❌ Não vê lucros da empresa</li>
                  <li>❌ Não vê vendas de outros</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800/50 transition-colors"
              disabled={loading}>Cancelar</button>
            <button type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
              disabled={loading}>{loading ? 'Criando...' : 'Criar Login'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
