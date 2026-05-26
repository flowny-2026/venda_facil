import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, } from "recharts";
export default function LineChartCard({ data }) {
    return (_jsxs("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl p-4 shadow-soft h-[320px]", children: [_jsx("div", { className: "flex items-center justify-between mb-2", children: _jsxs("div", { children: [_jsx("div", { className: "font-semibold", children: "Receita ao longo do tempo" }), _jsx("div", { className: "text-xs text-slate-400", children: "Agregado por dia" })] }) }), _jsx("div", { className: "h-[250px]", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(LineChart, { data: data, children: [_jsx(CartesianGrid, { stroke: "rgba(148,163,184,.15)", strokeDasharray: "4 4" }), _jsx(XAxis, { dataKey: "date", tick: { fill: "#94a3b8", fontSize: 12 }, tickFormatter: (value) => new Date(value).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) }), _jsx(YAxis, { tick: { fill: "#94a3b8", fontSize: 12 }, tickFormatter: (value) => `R$ ${(value / 1000).toFixed(0)}k` }), _jsx(Tooltip, { contentStyle: {
                                    backgroundColor: "#1e293b",
                                    border: "1px solid #334155",
                                    borderRadius: "8px",
                                    color: "#f1f5f9",
                                }, formatter: (value) => [`R$ ${value.toLocaleString("pt-BR")}`, "Receita"], labelFormatter: (label) => new Date(label).toLocaleDateString("pt-BR") }), _jsx(Line, { type: "monotone", dataKey: "revenue", stroke: "#3b82f6", strokeWidth: 2, dot: { fill: "#3b82f6", strokeWidth: 2, r: 4 }, activeDot: { r: 6, stroke: "#3b82f6", strokeWidth: 2 } })] }) }) })] }));
}
