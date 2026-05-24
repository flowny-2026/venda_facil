import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, flexRender, } from "@tanstack/react-table";
import StatusBadge from "./StatusBadge";
import { ArrowDownUp, ChevronLeft, ChevronRight } from "lucide-react";
function moneyBRL(n) {
    return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
export default function DataTable({ rows }) {
    const [sorting, setSorting] = useState([{ id: "date", desc: true }]);
    const columns = useMemo(() => [
        {
            accessorKey: "id",
            header: "ID",
            cell: (info) => _jsx("span", { className: "text-slate-300 font-mono text-sm", children: info.getValue() }),
        },
        {
            accessorKey: "date",
            header: ({ column }) => (_jsxs("button", { className: "flex items-center gap-1 hover:text-slate-200", onClick: () => column.toggleSorting(column.getIsSorted() === "asc"), children: ["Data", _jsx(ArrowDownUp, { className: "w-3 h-3" })] })),
            cell: (info) => {
                const date = new Date(info.getValue());
                return _jsx("span", { className: "text-slate-300", children: date.toLocaleDateString("pt-BR") });
            },
        },
        {
            accessorKey: "customer",
            header: "Cliente",
            cell: (info) => (_jsxs("div", { children: [_jsx("div", { className: "text-slate-200 font-medium", children: info.getValue() }), _jsx("div", { className: "text-xs text-slate-400", children: info.row.original.email })] })),
        },
        {
            accessorKey: "category",
            header: "Categoria",
            cell: (info) => (_jsx("span", { className: "inline-flex items-center px-2 py-1 text-xs rounded-lg bg-blue-500/15 text-blue-300 border border-blue-500/25", children: info.getValue() })),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: (info) => _jsx(StatusBadge, { status: info.getValue() }),
        },
        {
            accessorKey: "amount",
            header: ({ column }) => (_jsxs("button", { className: "flex items-center gap-1 hover:text-slate-200", onClick: () => column.toggleSorting(column.getIsSorted() === "asc"), children: ["Valor", _jsx(ArrowDownUp, { className: "w-3 h-3" })] })),
            cell: (info) => _jsx("span", { className: "text-slate-200 font-semibold", children: moneyBRL(info.getValue()) }),
        },
    ], []);
    const table = useReactTable({
        data: rows,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: { pageSize: 10 },
        },
    });
    if (rows.length === 0) {
        return (_jsxs("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl shadow-soft overflow-hidden", children: [_jsxs("div", { className: "p-4 border-b border-slate-800", children: [_jsx("h3", { className: "font-semibold", children: "Pedidos recentes" }), _jsx("p", { className: "text-xs text-slate-400 mt-1", children: "Lista de todos os pedidos" })] }), _jsxs("div", { className: "p-8 text-center", children: [_jsx("div", { className: "text-slate-400 mb-2", children: "\uD83D\uDCCA" }), _jsx("h3", { className: "text-lg font-medium text-slate-300 mb-2", children: "Nenhum pedido encontrado" }), _jsx("p", { className: "text-sm text-slate-500", children: "Adicione seu primeiro pedido clicando em \"Nova Venda\"" })] })] }));
    }
    return (_jsxs("div", { className: "bg-slate-900/50 border border-slate-800 rounded-2xl shadow-soft overflow-hidden", children: [_jsxs("div", { className: "p-4 border-b border-slate-800", children: [_jsx("h3", { className: "font-semibold", children: "Pedidos recentes" }), _jsx("p", { className: "text-xs text-slate-400 mt-1", children: "Lista de todos os pedidos" })] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-slate-800/50", children: table.getHeaderGroups().map((headerGroup) => (_jsx("tr", { children: headerGroup.headers.map((header) => (_jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider", children: header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext()) }, header.id))) }, headerGroup.id))) }), _jsx("tbody", { className: "divide-y divide-slate-800", children: table.getRowModel().rows.map((row) => (_jsx("tr", { className: "hover:bg-slate-800/30", children: row.getVisibleCells().map((cell) => (_jsx("td", { className: "px-4 py-3 whitespace-nowrap", children: flexRender(cell.column.columnDef.cell, cell.getContext()) }, cell.id))) }, row.id))) })] }) }), _jsxs("div", { className: "flex items-center justify-between px-4 py-3 border-t border-slate-800", children: [_jsxs("div", { className: "text-sm text-slate-400", children: ["Mostrando ", table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1, " a", " ", Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, rows.length), " de", " ", rows.length, " resultados"] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("button", { onClick: () => table.previousPage(), disabled: !table.getCanPreviousPage(), className: "flex items-center gap-1 px-3 py-1 text-sm text-slate-400 hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed", children: [_jsx(ChevronLeft, { className: "w-4 h-4" }), "Anterior"] }), _jsxs("span", { className: "text-sm text-slate-400", children: ["P\u00E1gina ", table.getState().pagination.pageIndex + 1, " de ", table.getPageCount()] }), _jsxs("button", { onClick: () => table.nextPage(), disabled: !table.getCanNextPage(), className: "flex items-center gap-1 px-3 py-1 text-sm text-slate-400 hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed", children: ["Pr\u00F3xima", _jsx(ChevronRight, { className: "w-4 h-4" })] })] })] })] }));
}
