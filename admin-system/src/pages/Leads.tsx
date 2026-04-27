import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Eye, Mail, Phone, Building2, Calendar, Filter, RefreshCw } from 'lucide-react';

interface Lead {
  id: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  business_type: string | null;
  message: string | null;
  status: 'novo' | 'contatado' | 'convertido' | 'descartado';
  created_at: string;
  updated_at: string;
}

const statusColors = {
  novo: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  contatado: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  convertido: 'bg-green-500/20 text-green-400 border-green-500/30',
  descartado: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
};

const statusLabels = {
  novo: 'Novo',
  contatado: 'Contatado',
  convertido: 'Convertido',
  descartado: 'Descartado'
};

const businessTypeLabels: Record<string, string> = {
  varejo: 'Varejo/Loja Física',
  restaurante: 'Restaurante/Bar',
  servicos: 'Serviços',
  ecommerce: 'E-commerce',
  outro: 'Outro'
};

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('todos');

  useEffect(() => {
    loadLeads();
  }, []);

  async function loadLeads() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('landing_leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Erro ao carregar leads:', error);
      alert('Erro ao carregar leads');
    } finally {
      setLoading(false);
    }
  }

  async function updateLeadStatus(leadId: string, newStatus: Lead['status']) {
    try {
      const { error } = await supabase
        .from('landing_leads')
        .update({ status: newStatus })
        .eq('id', leadId);

      if (error) throw error;

      // Atualizar localmente
      setLeads(leads.map(lead => 
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      ));

      if (selectedLead?.id === leadId) {
        setSelectedLead({ ...selectedLead, status: newStatus });
      }

      alert('Status atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status');
    }
  }

  const filteredLeads = filterStatus === 'todos' 
    ? leads 
    : leads.filter(lead => lead.status === filterStatus);

  const stats = {
    total: leads.length,
    novos: leads.filter(l => l.status === 'novo').length,
    contatados: leads.filter(l => l.status === 'contatado').length,
    convertidos: leads.filter(l => l.status === 'convertido').length
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Leads da Landing Page</h1>
          <p className="text-slate-400 mt-1">Gerencie os contatos recebidos pelo formulário</p>
        </div>
        <button
          onClick={loadLeads}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-sm">Total de Leads</div>
          <div className="text-3xl font-bold text-slate-100 mt-1">{stats.total}</div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-sm">Novos</div>
          <div className="text-3xl font-bold text-blue-400 mt-1">{stats.novos}</div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-sm">Contatados</div>
          <div className="text-3xl font-bold text-yellow-400 mt-1">{stats.contatados}</div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-sm">Convertidos</div>
          <div className="text-3xl font-bold text-green-400 mt-1">{stats.convertidos}</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2">
        <Filter className="w-5 h-5 text-slate-400" />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-lg text-slate-100"
        >
          <option value="todos">Todos os Status</option>
          <option value="novo">Novos</option>
          <option value="contatado">Contatados</option>
          <option value="convertido">Convertidos</option>
          <option value="descartado">Descartados</option>
        </select>
      </div>

      {/* Lista de Leads */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Carregando leads...</div>
      ) : filteredLeads.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          {filterStatus === 'todos' ? 'Nenhum lead recebido ainda' : 'Nenhum lead com este status'}
        </div>
      ) : (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-800/50">
              <tr>
                <th className="text-left px-6 py-3 text-slate-300 font-semibold">Empresa</th>
                <th className="text-left px-6 py-3 text-slate-300 font-semibold">Contato</th>
                <th className="text-left px-6 py-3 text-slate-300 font-semibold">Email</th>
                <th className="text-left px-6 py-3 text-slate-300 font-semibold">Telefone</th>
                <th className="text-left px-6 py-3 text-slate-300 font-semibold">Status</th>
                <th className="text-left px-6 py-3 text-slate-300 font-semibold">Data</th>
                <th className="text-center px-6 py-3 text-slate-300 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-100 font-medium">{lead.company_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-300">{lead.contact_name}</td>
                  <td className="px-6 py-4">
                    <a href={`mailto:${lead.contact_email}`} className="text-blue-400 hover:underline flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {lead.contact_email}
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    <a href={`tel:${lead.contact_phone}`} className="text-green-400 hover:underline flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {lead.contact_phone}
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[lead.status]}`}>
                      {statusLabels[lead.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => setSelectedLead(lead)}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                      title="Ver detalhes"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Detalhes */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-slate-100">Detalhes do Lead</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="text-slate-400 text-sm">Empresa</label>
                <div className="text-slate-100 font-medium text-lg">{selectedLead.company_name}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm">Nome do Contato</label>
                  <div className="text-slate-100">{selectedLead.contact_name}</div>
                </div>
                <div>
                  <label className="text-slate-400 text-sm">Tipo de Negócio</label>
                  <div className="text-slate-100">
                    {selectedLead.business_type ? businessTypeLabels[selectedLead.business_type] : 'Não informado'}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-sm">Email</label>
                <a href={`mailto:${selectedLead.contact_email}`} className="text-blue-400 hover:underline block">
                  {selectedLead.contact_email}
                </a>
              </div>

              <div>
                <label className="text-slate-400 text-sm">Telefone/WhatsApp</label>
                <a href={`tel:${selectedLead.contact_phone}`} className="text-green-400 hover:underline block">
                  {selectedLead.contact_phone}
                </a>
              </div>

              {selectedLead.message && (
                <div>
                  <label className="text-slate-400 text-sm">Mensagem</label>
                  <div className="text-slate-100 bg-slate-800/50 p-3 rounded-lg mt-1">
                    {selectedLead.message}
                  </div>
                </div>
              )}

              <div>
                <label className="text-slate-400 text-sm">Status Atual</label>
                <select
                  value={selectedLead.status}
                  onChange={(e) => updateLeadStatus(selectedLead.id, e.target.value as Lead['status'])}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 mt-1"
                >
                  <option value="novo">Novo</option>
                  <option value="contatado">Contatado</option>
                  <option value="convertido">Convertido</option>
                  <option value="descartado">Descartado</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-slate-400">Recebido em</label>
                  <div className="text-slate-100">{new Date(selectedLead.created_at).toLocaleString('pt-BR')}</div>
                </div>
                <div>
                  <label className="text-slate-400">Última atualização</label>
                  <div className="text-slate-100">{new Date(selectedLead.updated_at).toLocaleString('pt-BR')}</div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedLead(null)}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
