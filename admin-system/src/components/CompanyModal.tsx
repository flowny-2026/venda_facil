import { useState } from 'react';
import { X, Building, Mail, Phone, FileText, Users, Shield, DollarSign } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CompanyModal({ isOpen, onClose, onSuccess }: CompanyModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    document: '',
    plan: 'starter' as 'starter' | 'professional' | 'enterprise',
    access_type: 'shared' as 'shared' | 'individual',
    max_users: 1,
    monthly_fee: 49.90,
    // Dados do usuário principal
    user_name: '',
    user_email: '',
    user_password: ''
  });

  const planOptions = [
    { value: 'starter', label: 'Starter', price: 49.90, users: 1 },
    { value: 'professional', label: 'Professional', price: 99.90, users: 5 },
    { value: 'enterprise', label: 'Enterprise', price: 199.90, users: 20 }
  ];

  const handlePlanChange = (plan: string) => {
    const selectedPlan = planOptions.find(p => p.value === plan);
    if (selectedPlan) {
      setFormData(prev => ({
        ...prev,
        plan: plan as any,
        monthly_fee: selectedPlan.price,
        max_users: selectedPlan.users
      }));
    }
  };

  const handleAccessTypeChange = (accessType: 'shared' | 'individual') => {
    setFormData(prev => ({
      ...prev,
      access_type: accessType,
      max_users: accessType === 'shared' ? 1 : prev.max_users
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.user_email,
        password: formData.user_password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            name: formData.user_name
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Erro ao criar usuário');

      // 2. Criar empresa
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert([{
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          document: formData.document,
          plan: formData.plan,
          access_type: formData.access_type,
          max_users: formData.max_users,
          monthly_fee: formData.monthly_fee,
          status: 'active'
        }])
        .select()
        .single();

      if (companyError) throw companyError;

      // 3. Criar relacionamento usuário-empresa
      const { error: userCompanyError } = await supabase
        .from('company_users')
        .insert([{
          company_id: company.id,
          user_id: authData.user.id,
          role: 'owner',
          active: true,
          can_access_pdv: true,
          can_view_reports: true,
          can_manage_products: true,
          can_manage_sellers: true
        }]);

      if (userCompanyError) throw userCompanyError;

      alert(`Empresa criada com sucesso!\n\nCredenciais de acesso:\nEmail: ${formData.user_email}\nSenha: ${formData.user_password}\n\nTipo: ${formData.access_type === 'shared' ? 'Acesso Compartilhado' : 'Acesso Individual'}\n\n⚠️ Você será deslogado momentaneamente, mas o sistema fará login automático novamente.`);
      
      onSuccess();
      onClose();
      
      // Limpar formulário
      setFormData({
        name: '',
        email: '',
        phone: '',
        document: '',
        plan: 'starter',
        access_type: 'shared',
        max_users: 1,
        monthly_fee: 49.90,
        user_name: '',
        user_email: '',
        user_password: ''
      });

    } catch (error: any) {
      console.error('Erro ao criar empresa:', error);
      alert('Erro ao criar empresa: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-100">Nova Empresa</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Dados da Empresa */}
          <div>
            <h3 className="text-lg font-medium text-slate-200 mb-4 flex items-center gap-2">
              <Building className="w-5 h-5" />
              Dados da Empresa
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nome da Empresa *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  placeholder="Ex: Loja ABC"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email da Empresa *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  placeholder="contato@empresa.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  CNPJ
                </label>
                <input
                  type="text"
                  value={formData.document}
                  onChange={(e) => setFormData(prev => ({ ...prev, document: e.target.value }))}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  placeholder="00.000.000/0000-00"
                />
              </div>
            </div>
          </div>

          {/* Tipo de Acesso */}
          <div>
            <h3 className="text-lg font-medium text-slate-200 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Tipo de Acesso
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                onClick={() => handleAccessTypeChange('shared')}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  formData.access_type === 'shared'
                    ? 'border-red-500 bg-red-500/10'
                    : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-red-400" />
                  <span className="font-medium text-slate-200">Compartilhado</span>
                </div>
                <p className="text-sm text-slate-400">
                  1 login para a empresa. Vendedores são selecionados no PDV.
                  Ideal para: Lojas de shopping, comércio tradicional.
                </p>
              </div>

              <div
                onClick={() => handleAccessTypeChange('individual')}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  formData.access_type === 'individual'
                    ? 'border-red-500 bg-red-500/10'
                    : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-5 h-5 text-blue-400" />
                  <span className="font-medium text-slate-200">Individual</span>
                </div>
                <p className="text-sm text-slate-400">
                  Cada vendedor tem login próprio. Acesso individual ao sistema.
                  Ideal para: Lojas de carros, vendas especializadas.
                </p>
              </div>
            </div>
          </div>

          {/* Plano */}
          <div>
            <h3 className="text-lg font-medium text-slate-200 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Plano
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {planOptions.map((plan) => (
                <div
                  key={plan.value}
                  onClick={() => handlePlanChange(plan.value)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    formData.plan === plan.value
                      ? 'border-red-500 bg-red-500/10'
                      : 'border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-medium text-slate-200 mb-1">{plan.label}</div>
                    <div className="text-2xl font-bold text-green-400 mb-2">
                      R$ {plan.price.toFixed(2)}
                    </div>
                    <div className="text-sm text-slate-400">
                      Até {plan.users} usuário{plan.users > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Usuário Principal */}
          <div>
            <h3 className="text-lg font-medium text-slate-200 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Usuário Principal
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nome do Usuário *
                </label>
                <input
                  type="text"
                  required
                  value={formData.user_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, user_name: e.target.value }))}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  placeholder="Nome do responsável"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email de Login *
                </label>
                <input
                  type="email"
                  required
                  value={formData.user_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, user_email: e.target.value }))}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  placeholder="usuario@empresa.com"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Senha *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.user_password}
                  onChange={(e) => setFormData(prev => ({ ...prev, user_password: e.target.value }))}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800/50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white rounded-lg font-medium transition-colors"
            >
              {loading ? 'Criando...' : 'Criar Empresa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}