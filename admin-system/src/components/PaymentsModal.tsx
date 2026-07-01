import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X, Plus, CheckCircle, Clock, AlertTriangle, DollarSign, Calendar, Trash2, Edit, RefreshCw } from 'lucide-react';

interface Payment {
  id: string;
  company_id: string;
  amount: number;
  due_date: string;
  paid_date: string | null;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  notes: string | null;
  created_at: string;
}

interface PaymentsModalProps {
  company: { id: string; name: string; monthly_fee: number };
  onClose: () => void;
}

export default function PaymentsModal({ company, onClose }: PaymentsModalProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    amount: company.monthly_fee.toString(),
    due_date: '',
    paid_date: '',
    status: 'pending' as const,
    notes: ''
  });

  useEffect(() => { loadPayments(); }, []);

  const loadPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('client_payments')
        .select('*')
        .eq('company_id', company.id)
        .order('due_date', { ascending: false });
      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const payload = {
        company_id: company.id,
        amount: parseFloat(form.amount),
        due_date: form.due_date,
        paid_date: form.paid_date || null,
        status: form.paid_date ? 'paid' : form.status,
        notes: form.notes || null,
        created_by: user?.id
      };

      if (editingPayment) {
        const { error } = await supabase.from('client_payments').update(payload).eq('id', editingPayment.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('client_payments').insert([payload]);
        if (error) throw error;
      }

      resetForm();
      loadPayments();
    } catch (error: any) {
      alert('Erro ao salvar pagamento: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleMarkPaid = async (payment: Payment) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { error } = await supabase
        .from('client_payments')
        .update({ status: 'paid', paid_date: today })
        .eq('id', payment.id);
      if (error) throw error;
      loadPayments();
    } catch (error: any) {
      alert('Erro: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este pagamento?')) return;
    try {
      const { error } = await supabase.from('client_payments').delete().eq('id', id);
      if (error) throw error;
      loadPayments();
    } catch (error: any) {
      alert('Erro: ' + error.message);
    }
  };

  const openEdit = (payment: Payment) => {
    setEditingPayment(payment);
    setForm({
      amount: payment.amount.toString(),
      due_date: payment.due_date,
      paid_date: payment.paid_date || '',
      status: payment.status as any,
      notes: payment.notes || ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingPayment(null);
    setForm({ amount: company.monthly_fee.toString(), due_date: '', paid_date: '', status: 'pending', notes: '' });
  };

  const getStatusBadge = (payment: Payment) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(payment.due_date);
    due.setHours(0, 0, 0, 0);
    const isOverdue = payment.status === 'pending' && due < today;

    if (payment.status === 'paid') return { icon: <CheckCircle className="w-4 h-4" />, label: 'Pago', cls: 'bg-green-500/15 text-green-400 border-green-500/30' };
    if (payment.status === 'cancelled') return { icon: <X className="w-4 h-4" />, label: 'Cancelado', cls: 'bg-slate-500/15 text-slate-400 border-slate-500/30' };
    if (isOverdue) return { icon: <AlertTriangle className="w-4 h-4" />, label: 'Vencido', cls: 'bg-red-500/15 text-red-400 border-red-500/30' };
    return { icon: <Clock className="w-4 h-4" />, label: 'Pendente', cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
  };

  const getDaysInfo = (payment: Payment) => {
    if (payment.status === 'paid') return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(payment.due_date);
    due.setHours(0, 0, 0, 0);
    const diff = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return { text: 'Vence hoje!', cls: 'text-amber-400' };
    if (diff === 1) return { text: 'Vence amanhã!', cls: 'text-amber-400' };
    if (diff < 0) return { text: `${Math.abs(diff)} dias em atraso`, cls: 'text-red-400' };
    if (diff <= 3) return { text: `Vence em ${diff} dias`, cls: 'text-amber-400' };
    return null;
  };

  const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const formatDate = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('pt-BR');

  const totalPaid = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const totalPending = payments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0);
  const totalOverdue = payments.filter(p => {
    const today = new Date(); today.setHours(0,0,0,0);
    return p.status === 'pending' && new Date(p.due_date) < today;
  }).reduce((s, p) => s + p.amount, 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-slate-800 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              Pagamentos — {company.name}
            </h2>
            <p className="text-sm text-slate-400 mt-1">Mensalidade padrão: {formatCurrency(company.monthly_fee)}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4 text-center">
              <div className="text-xs text-slate-400 mb-1">Total Recebido</div>
              <div className="text-lg font-bold text-green-400">{formatCurrency(totalPaid)}</div>
            </div>
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 text-center">
              <div className="text-xs text-slate-400 mb-1">A Receber</div>
              <div className="text-lg font-bold text-amber-400">{formatCurrency(totalPending)}</div>
            </div>
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 text-center">
              <div className="text-xs text-slate-400 mb-1">Em Atraso</div>
              <div className="text-lg font-bold text-red-400">{formatCurrency(totalOverdue)}</div>
            </div>
          </div>

          {/* Botão adicionar */}
          {!showForm && (
            <button onClick={() => setShowForm(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-slate-600 text-slate-400 hover:text-slate-200 hover:border-slate-500 rounded-xl transition-colors">
              <Plus className="w-4 h-4" />
              Adicionar Pagamento
            </button>
          )}

          {/* Formulário */}
          {showForm && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-slate-200 mb-4">{editingPayment ? 'Editar Pagamento' : 'Novo Pagamento'}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Valor (R$)</label>
                    <input type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50" required />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Data de Vencimento</label>
                    <input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50" required />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Data de Pagamento (se pago)</label>
                    <input type="date" value={form.paid_date} onChange={e => setForm({ ...form, paid_date: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Observações</label>
                    <input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Ex: Pix, boleto..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={resetForm} className="flex-1 px-4 py-2 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition-colors text-sm">Cancelar</button>
                  <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm disabled:opacity-50">
                    {saving ? 'Salvando...' : editingPayment ? 'Atualizar' : 'Salvar'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Lista de pagamentos */}
          {loading ? (
            <div className="flex items-center justify-center py-8 gap-2 text-slate-400">
              <RefreshCw className="w-4 h-4 animate-spin" /> Carregando...
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Calendar className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>Nenhum pagamento registrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-slate-300">Histórico de Pagamentos</h3>
              {payments.map((payment) => {
                const badge = getStatusBadge(payment);
                const daysInfo = getDaysInfo(payment);
                return (
                  <div key={payment.id} className={`bg-slate-800/50 border rounded-xl p-4 ${
                    daysInfo && (daysInfo.cls.includes('red') || daysInfo.cls.includes('amber')) 
                      ? 'border-red-500/30' : 'border-slate-700'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="text-base font-semibold text-slate-100">{formatCurrency(payment.amount)}</div>
                          <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            Vence: {formatDate(payment.due_date)}
                            {payment.paid_date && <span className="text-green-400">| Pago: {formatDate(payment.paid_date)}</span>}
                          </div>
                          {daysInfo && <div className={`text-xs font-medium mt-1 ${daysInfo.cls}`}>{daysInfo.text}</div>}
                          {payment.notes && <div className="text-xs text-slate-500 mt-1">{payment.notes}</div>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${badge.cls}`}>
                          {badge.icon} {badge.label}
                        </span>
                        {payment.status !== 'paid' && (
                          <button onClick={() => handleMarkPaid(payment)}
                            className="p-1.5 text-green-400 hover:bg-green-500/20 rounded-lg" title="Marcar como pago">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => openEdit(payment)} className="p-1.5 text-blue-400 hover:bg-blue-500/20 rounded-lg">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(payment.id)} className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}