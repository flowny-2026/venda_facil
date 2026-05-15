import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, Mail, Phone, X, UserPlus, Search } from 'lucide-react';

interface QuickCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCustomer: (customerId: string | null) => void;
  companyId: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export default function QuickCustomerModal({ 
  isOpen, 
  onClose, 
  onSelectCustomer,
  companyId 
}: QuickCustomerModalProps) {
  const [mode, setMode] = useState<'search' | 'create'>('search');
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });

  const searchCustomers = async (term: string) => {
    if (!term || term.length < 2) {
      setCustomers([]);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, phone, email')
        .eq('company_id', companyId)
        .or(`name.ilike.%${term}%,phone.ilike.%${term}%,email.ilike.%${term}%`)
        .limit(10);

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    searchCustomers(value);
  };

  const handleSelectCustomer = (customerId: string) => {
    onSelectCustomer(customerId);
    onClose();
  };

  const handleCreateCustomer = async () => {
    if (!formData.name.trim()) {
      alert('Nome é obrigatório');
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('customers')
        .insert([{
          company_id: companyId,
          name: formData.name.trim(),
          phone: formData.phone.trim() || null,
          email: formData.email.trim() || null,
          created_by: user.id
        }])
        .select('id')
        .single();

      if (error) throw error;

      onSelectCustomer(data.id);
      onClose();
    } catch (error: any) {
      console.error('Erro ao criar cliente:', error);
      alert('Erro ao criar cliente: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    onSelectCustomer(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-100">
            {mode === 'search' ? 'Vincular Cliente' : 'Cadastro Rápido'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {mode === 'search' ? (
          <div className="space-y-4">
            {/* Busca */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Buscar Cliente Existente
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Nome, telefone ou email..."
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  autoFocus
                />
              </div>
            </div>

            {/* Resultados da busca */}
            {searchTerm.length >= 2 && (
              <div className="max-h-48 overflow-y-auto space-y-2">
                {loading ? (
                  <div className="text-center py-4 text-slate-400 text-sm">
                    Buscando...
                  </div>
                ) : customers.length > 0 ? (
                  customers.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => handleSelectCustomer(customer.id)}
                      className="w-full text-left p-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors"
                    >
                      <div className="font-medium text-slate-200">{customer.name}</div>
                      <div className="text-sm text-slate-400">
                        {customer.phone && <span>{customer.phone}</span>}
                        {customer.phone && customer.email && <span> • </span>}
                        {customer.email && <span>{customer.email}</span>}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-4 text-slate-400 text-sm">
                    Nenhum cliente encontrado
                  </div>
                )}
              </div>
            )}

            {/* Botões */}
            <div className="flex flex-col gap-2 pt-4 border-t border-slate-700">
              <button
                onClick={() => setMode('create')}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Cadastrar Novo Cliente
              </button>
              <button
                onClick={handleSkip}
                className="px-4 py-2 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800/50 transition-colors"
              >
                Continuar sem Cliente
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Formulário de cadastro rápido */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nome Completo *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="João Silva"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Telefone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email (opcional)
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="joao@email.com"
                />
              </div>
            </div>

            {/* Botões */}
            <div className="flex flex-col gap-2 pt-4">
              <button
                onClick={handleCreateCustomer}
                disabled={loading || !formData.name.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {loading ? 'Cadastrando...' : 'Cadastrar e Continuar'}
              </button>
              <button
                onClick={() => setMode('search')}
                className="px-4 py-2 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800/50 transition-colors"
              >
                Voltar para Busca
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
