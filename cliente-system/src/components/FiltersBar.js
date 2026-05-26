import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Search, X } from "lucide-react";
import Select from "./Select";
export default function FiltersBar({ value, onChange, }) {
    const hasActive = value.period !== "30d" ||
        value.status !== "all" ||
        value.category !== "all" ||
        value.query.trim() !== "";
    return (_jsx("section", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl p-4 shadow-soft", children: _jsxs("div", { className: "flex flex-col gap-3", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [_jsx(Select, { label: "Per\u00EDodo", value: value.period, options: [
                                { value: "7d", label: "Últimos 7 dias" },
                                { value: "30d", label: "Últimos 30 dias" },
                                { value: "90d", label: "Últimos 90 dias" },
                                { value: "all", label: "Todos" },
                            ], onChange: (period) => onChange({ ...value, period: period }) }), _jsx(Select, { label: "Status", value: value.status, options: [
                                { value: "all", label: "Todos" },
                                { value: "paid", label: "Pago" },
                                { value: "pending", label: "Pendente" },
                                { value: "canceled", label: "Cancelado" },
                            ], onChange: (status) => onChange({ ...value, status: status }) }), _jsx(Select, { label: "Categoria", value: value.category, options: [
                                { value: "all", label: "Todas" },
                                { value: "SaaS", label: "SaaS" },
                                { value: "Serviços", label: "Serviços" },
                                { value: "Hardware", label: "Hardware" },
                            ], onChange: (category) => onChange({ ...value, category: category }) }), hasActive && (_jsxs("button", { onClick: () => onChange({
                                period: "30d",
                                status: "all",
                                category: "all",
                                query: "",
                            }), className: "flex items-center gap-1 px-3 py-2 text-xs text-slate-400 hover:text-slate-200 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors", children: [_jsx(X, { className: "w-3 h-3" }), "Limpar filtros"] }))] }), _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" }), _jsx("input", { type: "text", placeholder: "Buscar por cliente, email ou ID...", value: value.query, onChange: (e) => onChange({ ...value, query: e.target.value }), className: "w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50" })] })] }) }));
}
