import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Bell,
  DollarSign,
  Calendar,
  Copy,
  Check,
  CreditCard
} from 'lucide-react';

interface PaymentAlert {
  id: string;
  amount: number;
  due_date: string;
  paid_date: string | null;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  notes: string | null;
  days_until_due: number;
  alert_type: 'overdue' | 'due_today' | 'due_tomorrow' | 'due_soon';
}

interface PixInfo {
  pix_key: string;
  pix_key_type: string;
  pix_name: string;
}

interface PaymentAlertProps {
  companyId: string;
}

export default function PaymentAlertBanner({ companyId }: PaymentAlertProps) {
  const [alerts, setAlerts] = useState<PaymentAlert[]>([]);
  const [pixInfo, setPixInfo] = useState<PixInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    loadAlerts();
    loadPixInfo();
  }, [companyId]);

  const loadAlerts = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: payments, error } = await supabase
        .from('client_payments')
        .select('id, amount, due_date, paid_date, status, notes')
        .eq('company_id', companyId)
        .eq('status', 'pending')
        .order('due_date', { ascending: true });

      if (error) throw error;

      const alertList: PaymentAlert[] = [];

      payments?.forEach((payment: any) => {
        const due = new Date(payment.due_date);
        due.setHours(0, 0, 0, 0);
        const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        let alert_type: PaymentAlert['alert_type'];
        if (diffDays < 0) alert_type = 'overdue';
        else if (diffDays === 0) alert_type = 'due_today';
        else if (diffDays === 1) alert_type = 'due_tomorrow';
        else if (diffDays <= 3) alert_type = 'due_soon';
        else return;

        alertList.push({
          id: payment.id,
          amount: payment.amount,
          due_date: payment.due_date,
          paid_date: payment.paid_date,
          status: payment.status,
          notes: payment.notes,
          days_until_due: diffDays,
          alert_type
        });
      });

      setAlerts(alertList);
    } catch (error) {
      console.error('Erro ao carregar alertas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPixInfo = async () => {
    try {
      // Tentar pegar da tabela admin_settings (chave global)
      const { data: settings } = await supabase
        .from('admin_settings')
        .select('pix_key, pix_key_type, pix_name')
        .maybeSingle();

      if (settings?.pix_key) {
        setPixInfo(settings);
        return;
      }

      // Fallback: pegar da empresa
      const { data: company } = await supabase
        .from('companies')
        .select('pix_key, pix_key_type')
        .eq('id', companyId)
        .maybeSingle();

      if (company?.pix_key) {
        setPixInfo({
          pix_key: company.pix_key,
          pix_key_type: company.pix_key_type || 'cpf',
          pix_name: ''
        });
      }
    } catch (error) {
      console.error('Erro ao carregar Pix:', error);
    }
  };

  const copyPixKey = async () => {
    if (!pixInfo?.pix_key) return;

    try {
      await navigator.clipboard.writeText(pixInfo.pix_key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback para dispositivos móveis
      const textArea = document.createElement('textarea');
      textArea.value = pixInfo.pix_key;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getAlertIcon = (type: PaymentAlert['alert_type']) => {
    switch (type) {
      case 'overdue': return <XCircle className="w-5 h-5 text-red-400" />;
      case 'due_today': return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'due_tomorrow': return <Clock className="w-5 h-5 text-amber-400" />;
      case 'due_soon': return <Bell className="w-5 h-5 text-blue-400" />;
    }
  };

  const getAlertBg = (type: PaymentAlert['alert_type']) => {
    switch (type) {
      case 'overdue': return 'bg-red-500/10 border-red-500/30';
      case 'due_today': return 'bg-amber-500/10 border-amber-500/30';
      case 'due_tomorrow': return 'bg-amber-500/10 border-amber-500/30';
      case 'due_soon': return 'bg-blue-500/10 border-blue-500/30';
    }
  };

  const getAlertTitle = (type: PaymentAlert['alert_type']) => {
    switch (type) {
      case 'overdue': return '⚠️ Pagamento em Atraso';
      case 'due_today': return '⏰ Pagamento Vence Hoje';
      case 'due_tomorrow': return '🔔 Pagamento Vence Amanhã';
      case 'due_soon': return '💳 Pagamento em Breve';
    }
  };

  const getAlertText = (alert: PaymentAlert) => {
    switch (alert.alert_type) {
      case 'overdue': 
        return `Seu pagamento de ${formatCurrency(alert.amount)} está ${Math.abs(alert.days_until_due)} dias em atraso. Regularize o quanto antes para evitar suspensão.`;
      case 'due_today': 
        return `Seu pagamento de ${formatCurrency(alert.amount)} vence hoje! Não deixe para depois.`;
      case 'due_tomorrow': 
        return `Seu pagamento de ${formatCurrency(alert.amount)} vence amanhã. Fique atento!`;
      case 'due_soon': 
        return `Seu pagamento de ${formatCurrency(alert.amount)} vence em ${alert.days_until_due} dias.`;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR');
  };

  const getPixTypeLabel = (type: string) => {
    switch (type) {
      case 'cpf': return 'CPF';
      case 'cnpj': return 'CNPJ';
      case 'email': return 'E-mail';
      case 'phone': return 'Telefone';
      case 'random': return 'Chave Aleatória';
      default: return 'Chave Pix';
    }
  };

  // Pegar o alerta mais crítico
  const criticalAlert = alerts.length > 0 
    ? alerts.find(a => a.alert_type === 'overdue') 
      || alerts.find(a => a.alert_type === 'due_today')
      || alerts.find(a => a.alert_type === 'due_tomorrow')
      || alerts[0]
    : null;

  if (loading) return null;

  if (!criticalAlert || dismissed) return null;

  return (
    <div className={`border rounded-xl p-4 mb-6 ${getAlertBg(criticalAlert.alert_type)}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getAlertIcon(criticalAlert.alert_type)}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold text-slate-100">
              {getAlertTitle(criticalAlert.alert_type)}
            </h4>
            <button 
              onClick={() => setDismissed(true)}
              className="text-slate-400 hover:text-slate-200 p-1 rounded"
              title="Dispensar"
            >
              <span className="text-lg leading-none">×</span>
            </button>
          </div>

          {/* Mensagem */}
          <p className="text-sm text-slate-300 mt-1">
            {getAlertText(criticalAlert)}
          </p>

          {/* Info do pagamento */}
          <div className="flex flex-wrap items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-sm font-medium text-slate-200">
                {formatCurrency(criticalAlert.amount)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-sm text-slate-400">
                Vencimento: {formatDate(criticalAlert.due_date)}
              </span>
            </div>
            {criticalAlert.notes && (
              <span className="text-xs text-slate-500">
                Obs: {criticalAlert.notes}
              </span>
            )}
          </div>

          {/* Chave Pix */}
          {pixInfo?.pix_key && (
            <div className="mt-3 bg-slate-800/50 border border-slate-700 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-4 h-4 text-green-400" />
                <span className="text-xs font-medium text-slate-300">
                  Pague via Pix — {getPixTypeLabel(pixInfo.pix_key_type)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2">
                  <code className="text-sm text-green-400 font-mono break-all">
                    {pixInfo.pix_key}
                  </code>
                </div>
                <button
                  onClick={copyPixKey}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    copied 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copiar
                    </>
                  )}
                </button>
              </div>

              {pixInfo.pix_name && (
                <p className="text-xs text-slate-500 mt-1.5">
                  Titular: {pixInfo.pix_name}
                </p>
              )}
            </div>
          )}

          {/* Outros pagamentos pendentes */}
          {alerts.length > 1 && (
            <p className="text-xs text-slate-500 mt-2">
              +{alerts.length - 1} outro{alerts.length > 2 ? 's' : ''} pagamento{alerts.length > 2 ? 's' : ''} pendente{alerts.length > 2 ? 's' : ''}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}