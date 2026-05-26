import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ChevronDown } from "lucide-react";
export default function Select({ label, value, options, onChange, }) {
    return (_jsxs("div", { className: "relative", children: [_jsx("label", { className: "block text-xs text-slate-400 mb-1", children: label }), _jsxs("div", { className: "relative", children: [_jsx("select", { value: value, onChange: (e) => onChange(e.target.value), className: "appearance-none bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50", children: options.map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value))) }), _jsx(ChevronDown, { className: "absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" })] })] }));
}
