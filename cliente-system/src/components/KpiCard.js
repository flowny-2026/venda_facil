import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function KpiCard({ title, value, hint, }) {
    return (_jsxs("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl p-4 shadow-soft", children: [_jsx("div", { className: "text-xs text-slate-400", children: title }), _jsx("div", { className: "mt-2 text-2xl font-semibold tracking-tight", children: value }), _jsx("div", { className: "mt-2 text-xs text-slate-500", children: hint })] }));
}
