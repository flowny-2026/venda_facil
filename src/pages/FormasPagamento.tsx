import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Plus, 
  CreditCard, 
  Banknote,
  Smartphone,
  DollarSign,
  Edit,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface PaymentMethod {
  id: string;
  name: string;
  type: 'cash' | 'debit_card' | 'credit_card' | 'pix' | 'other';
  active: boolean;
  created_at: string;
}

export default function FormasPagamento() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [newMethod, setNewMethod] = useState({
    name: '',
    type: 'cash' as const
  });

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPaymentMethods(data || []);
    } catch (error) {
      console.error('Erro ao carregar formas de pagamento:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Usuário não autenticado');
        return;
      }

      // Usar o ID do usuário como company_id se não houver empresa definida
      let companyId = localStorage.getItem('company_id');
      if (!companyId) {
        companyId = user.id;
        localStorage.setItem('company_id', companyId);
      }
      
      const { data, error } = await supabase
        .from('payment_methods')
        .insert([{
          ...newMethod,
          company_id: companyId
        }])
        .select()
        .single();

      if (error) throw error;

      setPaymentMethods(prev => [data, ...prev]);
      setShowAddModal(false);
      resetForm();
      alert('Forma de pagamento cadastrada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao cadastrar forma de pagamento:', error);
      alert('Erro ao cadastrar forma de pagamento: ' + error.message);
    }
  };

  const handleEditMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMethod) return;
    
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .update(newMethod)
        .eq('id', editingMethod.id)
        .select()
        .single();

      if (error) throw error;

      setPaymentMethods(prev => 
        prev.map(method => 
          method.id === editingMethod.id ? data : method
        )
      );
      
      setEditingMethod(null);
      resetForm();
      alert('Forma de pagamento atualizada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao atualizar forma de pagamento:', error);
      alert('Erro ao atualizar forma de pagamento: ' + error.message);
    }
  };

  const toggleMethodStatus = async (methodId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .update({ active: !currentStatus })
        .eq('id', methodId);

      if (error) throw error;

      setPaymentMethods(prev => 
        prev.map(method => 
          method.id === methodId 
            ? { ...method, active: !currentStatus }
            : method
        )
      );
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    }
  };

  const deleteMethod = async (methodId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta forma de pagamento?')) return;
    
    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', methodId);

      if (error) throw error;

      setPaymentMethods(prev => prev.filter(method => method.id !== methodId));
      alert('Forma de pagamento excluída com sucesso!');
    } catch (error: any) {
      console.error('Erro ao excluir forma de pagamento:', error);
      alert('Erro ao excluir forma de pagamento: ' + error.message);
    }
  };

  const resetForm = () => {
    setNewMethod({
      name: '',
      type: 'cash'
    });
  };

  const openEditModal = (method: PaymentMethod) => {
    setEditingMethod(method);
    setNewMethod({
      name: method.name,
      type: method.type
    });
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingMethod(null);
    resetForm();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'cash': return <Banknote className="w-5 h-5 text-green-400" />;
      case 'debit_card': return <CreditCard className="w-5 h-5 text-blue-400" />;
      case 'credit_card': return <CreditCard className="w-5 h-5 text-purple-400" />;
      case 'pix': return <Smartphone className="w-5 h-5 text-orange-400" />;
      default: return <DollarSign className="w-5 h-5 text-slate-400" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'cash': return 'Dinheiro';
      case 'debit_card': return 'Cartão de Débito';
      case 'credit_card': return 'Cartão de Crédito';
      case 'pix': return 'PIX';
      case 'other': return 'Outros';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'cash': return 'bg-green-500/15 text-green-400 border-green-500/30';
      case 'debit_card': return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'credit_card': return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      case 'pix': return 'bg-orange-500/15 text-orange-400 border-orange-500/30';
      default: return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-slate-400">
          <RefreshCw className="w-5 h-5 animate-spin" />
          Carregando formas de pagamento...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Formas de Pagamento</h1>
          <p className="text-slate-400">Configure as formas de pagamento aceitas na sua loja</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Forma de Pagamento
        </button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-blue-400" />
            <div>
              <div className="text-2xl font-bold text-slate-100">{paymentMethods.length}</div>
              <div className="text-sm text-slate-400">Total Cadastradas</div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <div>
              <div className="text-2xl font-bold text-slate-100">
                {paymentMethods.filter(m => m.active).length}
              </div>
              <div className="text-sm text-slate-400">Formas Ativas</div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <Banknote className="w-8 h-8 text-green-400" />
            <div>
              <div className="text-2xl font-bold text-slate-100">
                {paymentMethods.filter(m => m.type === 'cash' && m.active).length}
              </div>
              <div className="text-sm text-slate-400">Dinheiro</div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <Smartphone className="w-8 h-8 text-orange-400" />
            <div>
              <div className="text-2xl font-bold text-slate-100">
                {paymentMethods.filter(m => ['debit_card', 'credit_card', 'pix'].includes(m.type) && m.active).length}
              </div>
              <div className="text-sm text-slate-400">Eletrônicos</div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Formas de Pagamento */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800">
          <h3 className="text-lg font-semibold text-slate-100">Formas de Pagamento Configuradas</h3>
        </div>
        
        {paymentMethods.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-300 mb-2">Nenhuma forma de pagamento cadastrada</h3>
            <p className="text-slate-400 mb-4">Configure as formas de pagamento aceitas na sua loja.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Cadastrar Primeira Forma de Pagamento
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {paymentMethods.map((method) => (
              <div key={method.id} className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(method.type)}
                    <div>
                      <h4 className="text-sm font-medium text-slate-200">{method.name}</h4>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded border ${getTypeColor(method.type)}`}>
                        {getTypeLabel(method.type)}
                      </span>
                    </div>
                  </div>
                  
                  <div className={`flex items-center gap-1 ${method.active ? 'text-green-400' : 'text-red-400'}`}>
                    {method.active ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => openEditModal(method)}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs text-blue-400 hover:bg-blue-500/20 rounded transition-colors"
                  >
                    <Edit className="w-3 h-3" />
                    Editar
                  </button>
                  
                  <button
                    onClick={() => toggleMethodStatus(method.id, method.active)}
                    className={`flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                      method.active 
                        ? 'text-amber-400 hover:bg-amber-500/20' 
                        : 'text-green-400 hover:bg-green-500/20'
                    }`}
                  >
                    {method.active ? <XCircle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                    {method.active ? 'Desativar' : 'Ativar'}
                  </button>
                  
                  <button
                    onClick={() => deleteMethod(method.id)}
                    className="flex items-center justify-center gap-1 px-2 py-1 text-xs text-red-400 hover:bg-red-500/20 rounded transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Adicionar/Editar Forma de Pagamento */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-slate-100 mb-4">
              {editingMethod ? 'Editar Forma de Pagamento' : 'Nova Forma de Pagamento'}
            </h2>
            
            <form onSubmit={editingMethod ? handleEditMethod : handleAddMethod} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Nome</label>
                <input
                  type="text"
                  value={newMethod.name}
                  onChange={(e) => setNewMethod({...newMethod, name: e.target.value})}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="Ex: Dinheiro, Cartão de Crédito, PIX"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Tipo</label>
                <select
                  value={newMethod.type}
                  onChange={(e) => setNewMethod({...newMethod, type: e.target.value as any})}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="cash">Dinheiro</option>
                  <option value="debit_card">Cartão de Débito</option>
                  <option value="credit_card">Cartão de Crédito</option>
                  <option value="pix">PIX</option>
                  <option value="other">Outros</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800/50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  {editingMethod ? 'Atualizar' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}