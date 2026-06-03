import { Search, X } from "lucide-react";
import Select from "./Select";

export type Filters = {
  period: "7d" | "30d" | "90d" | "all";
  status: "all" | "paid" | "pending" | "canceled";
  query: string;
};

export default function FiltersBar({
  value,
  onChange,
}: {
  value: Filters;
  onChange: (v: Filters) => void;
}) {
  const hasActive =
  value.period !== "30d" ||
  value.status !== "all" ||
  value.query.trim() !== "";

  return (
    <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 shadow-soft">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Select
            label="Período"
            value={value.period}
            options={[
              { value: "7d", label: "Últimos 7 dias" },
              { value: "30d", label: "Últimos 30 dias" },
              { value: "90d", label: "Últimos 90 dias" },
              { value: "all", label: "Todos" },
            ]}
            onChange={(period) => onChange({ ...value, period: period as Filters["period"] })}
          />

          <Select
            label="Status"
            value={value.status}
            options={[
              { value: "all", label: "Todos" },
              { value: "paid", label: "Pago" },
              { value: "pending", label: "Pendente" },
              { value: "canceled", label: "Cancelado" },
            ]}
            onChange={(status) => onChange({ ...value, status: status as Filters["status"] })}
          />

          
          {hasActive && (
            <button
              onClick={() =>
               onChange({
                period: "30d",
                status: "all",
                query: "",
              })
              }
              className="flex items-center gap-1 px-3 py-2 text-xs text-slate-400 hover:text-slate-200 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors"
            >
              <X className="w-3 h-3" />
              Limpar filtros
            </button>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por cliente, email ou ID..."
            value={value.query}
            onChange={(e) => onChange({ ...value, query: e.target.value })}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
          />
        </div>
      </div>
    </section>
  );
}