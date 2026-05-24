import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
export default function BarChartCard({ data }) {
    return (_jsxs("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl p-4 shadow-soft h-[320px]", children: [_jsxs("div", { className: "mb-2", children: [_jsx("div", { className: "font-semibold", children: "Receita por categoria" }), _jsx("div", { className: "text-xs text-slate-400", children: "Compara\u00E7\u00E3o" })] }), _jsx("div", { className: "h-[250px]", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: data, children: [_jsx(CartesianGrid, { stroke: "rgba(148,163,184,.15)", strokeDasharray: "4 4" }), _jsx(XAxis, { dataKey: "category", tick: { fill: "#94a3b8", fontSize: 12 } }), _jsx(YAxis, { tick: { fill: "#94a3b8", fontSize: 12 }, tickFormatter: (value) => `R$ ${(value / 1000).toFixed(0)}k` }), _jsx(Tooltip, { contentStyle: {
                                    backgroundColor: "#1e293b",
                                    border: "1px solid #334155",
                                    borderRadius: "8px",
                                    color: "#f1f5f9",
                                }, formatter: (value) => [`R$ ${value.toLocaleString("pt-BR")}`, "Receita"] }), _jsx(Bar, { dataKey: "revenue", fill: "#3b82f6", radius: [4, 4, 0, 0] })] }) }) })] }));
}
