import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
const COLORS = {
    paid: "#22c55e",
    pending: "#f59e0b",
    canceled: "#ef4444",
};
export default function DonutChartCard({ data, }) {
    const total = data.reduce((a, b) => a + b.value, 0);
    return (_jsxs("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl p-4 shadow-soft h-[320px]", children: [_jsxs("div", { className: "mb-2", children: [_jsx("div", { className: "font-semibold", children: "Pedidos por status" }), _jsx("div", { className: "text-xs text-slate-400", children: "Distribui\u00E7\u00E3o" })] }), _jsx("div", { className: "h-[220px]", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(PieChart, { children: [_jsx(Pie, { data: data, cx: "50%", cy: "50%", innerRadius: 60, outerRadius: 80, paddingAngle: 5, dataKey: "value", children: data.map((entry, index) => (_jsx(Cell, { fill: COLORS[entry.status] }, `cell-${index}`))) }), _jsx(Tooltip, { contentStyle: {
                                    backgroundColor: "#1e293b",
                                    border: "1px solid #334155",
                                    borderRadius: "8px",
                                    color: "#f1f5f9",
                                }, formatter: (value) => [value, "Pedidos"] })] }) }) }), _jsx("div", { className: "flex justify-center gap-4 mt-2", children: data.map((item) => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-3 h-3 rounded-full", style: { backgroundColor: COLORS[item.status] } }), _jsxs("span", { className: "text-xs text-slate-400", children: [item.name, ": ", item.value, " (", ((item.value / total) * 100).toFixed(1), "%)"] })] }, item.status))) })] }));
}
