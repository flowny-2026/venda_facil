import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Plus, Users, Search, Edit, Trash2, RefreshCw,
  Mail, Phone, MapPin, Calendar, ShoppingBag,
  DollarSign, Tag, X, History, Cake
} from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  document: string;
  address: string;
  city: string;
  state: string;
  birth_date: string;
  total_purchases: number;
  total_spent: number;
  last_purchase_at: string;
  accepts_marketing: boolean;
  active: boolean;
  created_at: string;
}

interface SaleHistory {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  payment_method_name: string;
  items: { product_name: string; quantity: number; unit_price: number; total_price: number }[];
}

function getBirthdayStatus(birthDate: string): 'today' | 'tomorrow' | null {
  if (!birthDate) return null;
  const today = new Date();
  const parts = birthDate.split('T')[0].split('-');
  const birthMonth = parseInt(parts[1]) - 1;
  const birthDay = parseInt(parts[2]);
  const todayMonth = today.getMonth();
  const todayDay = today.getDate();
  if (todayMonth === birthMonth && todayDay === birthDay) return 'today';
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (tomorrow.getMonth() === birthMonth && tomorrow.getDate() === birthDay) return 'tomorrow';
  return null;
}

export default function Clientes() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyCustomer, setHistoryCustomer] = useState<Customer | null>(null);
  const [saleHistory, setSaleHistory] = useState<SaleHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', document: '',
    address: '', city: '', state: '', birth_date: '',
    accepts_marketing: true
  });

  useEffect(() => { loadCustomers(); }, []);

  const loadCustomers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase.from('customers').select('*').order('name');
      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async (customer: Customer) => {
    setHistoryCustomer(customer);
    setShowHistoryModal(true);
    setLoadingHistory(true);
    try {
      const { data: sales, error } = await supabase
        .from('sales')
        .select(`*, payment_methods(name), sale_items(product_name, quantity, unit_price, total_price)`)
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const history: SaleHistory[] = (sales || []).map((s: any) => ({
        id: s.id,
        created_at: s.created_at,
        total_amount: s.total_amount,
        status: s.status,
        payment_method_name: s.payment_methods?.name || 'Não informado',
        items: s.sale_items || []
      }));
      setSaleHistory(history);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      setSaleHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: companyData } = await supabase.from('company_users').select('company_id').eq('user_id', user.id).single();
      if (!companyData) return;

      const payload = { ...formData, birth_date: formData.birth_date || null };

      if (editingCustomer) {
        const { error } = await supabase.from('customers').update(payload).eq('id', editingCustomer.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('customers').insert([{ ...payload, company_id: companyData.company_id, created_by: user.id }]);
        if (error) throw error;
      }
      closeModal();
      loadCustomers();
    } catch (error: any) {
      alert('Erro ao salvar cliente: ' + error.message);
    }
  };

  const deleteCustomer = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return;
    try {
      const { error } = await supabase.from('customers').delete().eq('id', id);
      if (error) throw error;
      loadCustomers();
    } catch (error: any) {
      alert('Erro ao excluir cliente: ' + error.message);
    }
  };

  const openEditModal = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name, email: customer.email || '', phone: customer.phone || '',
      document: customer.document || '', address: customer.address || '',
      city: customer.city || '', state: customer.state || '',
      birth_date: customer.birth_date ? customer.birth_date.split('T')[0] : '',
      accepts_marketing: customer.accepts_marketing
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCustomer(null);
    setFormData({ name: '', email: '', phone: '', document: '', address: '', city: '', state: '', birth_date: '', accepts_marketing: true });
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  const formatDate = (date: string) => { if (!date) return 'Nunca'; return new Date(date).toLocaleDateString('pt-BR'); };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm) ||
    c.document?.includes(searchTerm)
  );

  const birthdayAlerts = customers.filter(c => getBirthdayStatus(c.birth_date) !== null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-slate-400">
          <RefreshCw className="w-5 h-5 animate-spin" />
          Carregando clientes...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Clientes</h1>
          <p className="text-slate-400">Gerencie sua base de clientes</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
          <Plus className="w-4 h-4" /> Novo Cliente
        </button>
      </div>

      {/* Alertas de Aniversário */}
      {birthdayAlerts.length > 0 && (
        <div className="space-y-2">
          {birthdayAlerts.map(c => {
            const status = getBirthdayStatus(c.birth_date);
            return (
              <div key={c.id} className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <Cake className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <span className="text-sm text-amber-200">
                  {status === 'today' ? '🎂 Hoje é aniversário de' : '🎁 Amanhã é aniversário de'} <strong>{c.name}</strong>! {c.phone && <>WhatsApp: {c.phone}</>}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <Users className="w-7 h-7 text-blue-400" />
            <div>
              <div className="text-2xl font-bold text-slate-100">{customers.length}</div>
              <div className="text-xs text-slate-400">Total de Clientes</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-7 h-7 text-green-400" />
            <div>
              <div className="text-2xl font-bold text-slate-100">{customers.reduce((sum, c) => sum + c.total_purchases, 0)}</div>
              <div className="text-xs text-slate-400">Total de Compras</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <DollarSign className="w-7 h-7 text-purple-400" />
            <div>
              <div className="text-xl font-bold text-slate-100">{formatCurrency(customers.reduce((sum, c) => sum + c.total_spent, 0))}</div>
              <div className="text-xs text-slate-400">Valor Total</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <Tag className="w-7 h-7 text-amber-400" />
            <div>
              <div className="text-2xl font-bold text-slate-100">{customers.filter(c => c.accepts_marketing).length}</div>
              <div className="text-xs text-slate-400">Aceitam Marketing</div>
            </div>
          </div>
        </div>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input type="text" placeholder="Buscar por nome, email, telefone ou documento..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900/50 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
      </div>

      {/* Lista */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-300 mb-2">{searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}</h3>
            {!searchTerm && <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">Cadastrar Primeiro Cliente</button>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Contato</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase hidden md:table-cell">Localização</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Compras</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase hidden md:table-cell">Última Compra</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredCustomers.map((customer) => {
                  const bday = getBirthdayStatus(customer.birth_date);
                  return (
                    <tr key={customer.id} className="hover:bg-slate-800/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <button onClick={() => loadHistory(customer)} className="text-sm font-medium text-blue-400 hover:text-blue-300 hover:underline text-left">
                                {customer.name}
                              </button>
                              {bday === 'today' && <span title="Aniversário hoje!">🎂</span>}
                              {bday === 'tomorrow' && <span title="Aniversário amanhã!">🎁</span>}
                            </div>
                            {customer.document && <div className="text-xs text-slate-400">{customer.document}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {customer.email && <div className="flex items-center gap-1 text-sm text-slate-200"><Mail className="w-3 h-3" />{customer.email}</div>}
                        {customer.phone && <div className="flex items-center gap-1 text-sm text-slate-400"><Phone className="w-3 h-3" />{customer.phone}</div>}
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        {customer.city ? <div className="flex items-center gap-1 text-sm text-slate-200"><MapPin className="w-3 h-3" />{customer.city}/{customer.state}</div> : <span className="text-sm text-slate-500">—</span>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-200">{customer.total_purchases} compras</div>
                        <div className="text-sm text-green-400">{formatCurrency(customer.total_spent)}</div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="flex items-center gap-1 text-sm text-slate-400"><Calendar className="w-3 h-3" />{formatDate(customer.last_purchase_at)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => loadHistory(customer)} className="p-1 text-green-400 hover:bg-green-500/20 rounded" title="Histórico"><History className="w-4 h-4" /></button>
                          <button onClick={() => openEditModal(customer)} className="p-1 text-blue-400 hover:bg-blue-500/20 rounded" title="Editar"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => deleteCustomer(customer.id)} className="p-1 text-red-400 hover:bg-red-500/20 rounded" title="Excluir"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Histórico */}
      {showHistoryModal && historyCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-900 p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-100">Histórico de Compras</h2>
                <p className="text-sm text-slate-400">{historyCustomer.name}</p>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              {loadingHistory ? (
                <div className="flex items-center justify-center py-8 gap-2 text-slate-400"><RefreshCw className="w-5 h-5 animate-spin" /> Carregando...</div>
              ) : saleHistory.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">Nenhuma compra registrada para este cliente.</p>
                  <p className="text-xs text-slate-500 mt-1">Vincule este cliente na próxima venda no PDV.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {saleHistory.map((sale) => (
                    <div key={sale.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="text-sm font-medium text-slate-200">{formatDate(sale.created_at)}</div>
                          <div className="text-xs text-slate-400">{sale.payment_method_name}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-400">{formatCurrency(sale.total_amount)}</div>
                          <span className={`text-xs px-2 py-1 rounded-full ${sale.status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                            {sale.status === 'paid' ? 'Pago' : 'Pendente'}
                          </span>
                        </div>
                      </div>
                      {sale.items.length > 0 && (
                        <div className="border-t border-slate-700 pt-3 space-y-1">
                          {sale.items.map((item, i) => (
                            <div key={i} className="flex justify-between text-xs text-slate-400">
                              <span>{item.product_name} x{item.quantity}</span>
                              <span>{formatCurrency(item.total_price)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Cadastro/Edição */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-slate-100 mb-4">{editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Nome Completo *</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Telefone</label>
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">CPF/CNPJ</label>
                  <input type="text" value={formData.document} onChange={(e) => setFormData({...formData, document: e.target.value})}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">🎂 Data de Nascimento</label>
                  <input type="date" value={formData.birth_date} onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Endereço</label>
                  <input type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Cidade</label>
                  <input type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Estado</label>
                  <input type="text" value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})}
                    maxLength={2} placeholder="SP"
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.accepts_marketing} onChange={(e) => setFormData({...formData, accepts_marketing: e.target.checked})}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-600" />
                    <span className="text-sm text-slate-300">Cliente aceita receber comunicações de marketing</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800/50 transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">{editingCustomer ? 'Atualizar' : 'Cadastrar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
