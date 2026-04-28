import { FileText, Download, Calendar, TrendingUp } from "lucide-react";

const reports = [
  {
    id: 1,
    title: "Relatório Mensal de Vendas",
    description: "Análise completa das vendas do último mês",
    date: "Março 2026",
    status: "Disponível",
    icon: TrendingUp,
  },
  {
    id: 2,
    title: "Análise de Performance por Categoria",
    description: "Comparativo de performance entre SaaS, Serviços e Hardware",
    date: "Março 2026",
    status: "Disponível",
    icon: FileText,
  },
  {
    id: 3,
    title: "Relatório de Clientes",
    description: "Análise do comportamento e segmentação de clientes",
    date: "Fevereiro 2026",
    status: "Disponível",
    icon: FileText,
  },
];

export default function Relatorios() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Relatórios</h1>
        <p className="mt-2 text-slate-400">Acesse relatórios detalhados e análises avançadas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <div
              key={report.id}
              className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-soft hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-500/15 rounded-lg">
                  <Icon className="w-6 h-6 text-blue-400" />
                </div>
                <span className="text-xs text-emerald-400 bg-emerald-500/15 px-2 py-1 rounded-lg border border-emerald-500/25">
                  {report.status}
                </span>
              </div>
              
              <h3 className="text-lg font-semibold text-slate-100 mb-2">{report.title}</h3>
              <p className="text-sm text-slate-400 mb-4">{report.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center text-xs text-slate-500">
                  <Calendar className="w-4 h-4 mr-1" />
                  {report.date}
                </div>
                <button className="flex items-center gap-1 px-3 py-1 text-xs text-blue-400 hover:text-blue-300 border border-blue-500/25 rounded-lg hover:border-blue-500/50 transition-colors">
                  <Download className="w-3 h-3" />
                  Baixar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-soft">
        <h2 className="text-xl font-semibold text-slate-100 mb-4">Gerar Novo Relatório</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Tipo de Relatório</label>
            <select className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
              <option>Vendas</option>
              <option>Clientes</option>
              <option>Performance</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Período</label>
            <select className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
              <option>Último mês</option>
              <option>Últimos 3 meses</option>
              <option>Último ano</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Gerar Relatório
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}