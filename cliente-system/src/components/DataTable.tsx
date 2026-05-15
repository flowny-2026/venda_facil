import { useMemo, useState } from "react";
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import StatusBadge from "./StatusBadge";
import { OrderRow } from "../data/mock";
import { ArrowDownUp, ChevronLeft, ChevronRight } from "lucide-react";

function moneyBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function DataTable({ rows }: { rows: OrderRow[] }) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "date", desc: true }]);

  const columns = useMemo<ColumnDef<OrderRow>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        cell: (info) => <span className="text-slate-300 font-mono text-sm">{info.getValue() as string}</span>,
      },
      {
        accessorKey: "date",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 hover:text-slate-200"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Data
            <ArrowDownUp className="w-3 h-3" />
          </button>
        ),
        cell: (info) => {
          const date = new Date(info.getValue() as string);
          return <span className="text-slate-300">{date.toLocaleDateString("pt-BR")}</span>;
        },
      },
      {
        accessorKey: "customer",
        header: "Cliente",
        cell: (info) => (
          <div>
            <div className="text-slate-200 font-medium">{info.getValue() as string}</div>
            <div className="text-xs text-slate-400">{info.row.original.email}</div>
          </div>
        ),
      },
      {
        accessorKey: "category",
        header: "Categoria",
        cell: (info) => (
          <span className="inline-flex items-center px-2 py-1 text-xs rounded-lg bg-blue-500/15 text-blue-300 border border-blue-500/25">
            {info.getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => <StatusBadge status={info.getValue() as "paid" | "pending" | "canceled"} />,
      },
      {
        accessorKey: "amount",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 hover:text-slate-200"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Valor
            <ArrowDownUp className="w-3 h-3" />
          </button>
        ),
        cell: (info) => <span className="text-slate-200 font-semibold">{moneyBRL(info.getValue() as number)}</span>,
      },
    ],
    []
  );

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
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl shadow-soft overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <h3 className="font-semibold">Pedidos recentes</h3>
          <p className="text-xs text-slate-400 mt-1">Lista de todos os pedidos</p>
        </div>
        <div className="p-8 text-center">
          <div className="text-slate-400 mb-2">📊</div>
          <h3 className="text-lg font-medium text-slate-300 mb-2">Nenhum pedido encontrado</h3>
          <p className="text-sm text-slate-500">Adicione seu primeiro pedido clicando em "Nova Venda"</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl shadow-soft overflow-hidden">
      <div className="p-4 border-b border-slate-800">
        <h3 className="font-semibold">Pedidos recentes</h3>
        <p className="text-xs text-slate-400 mt-1">Lista de todos os pedidos</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-800/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-800">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-800/30">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">
        <div className="text-sm text-slate-400">
          Mostrando {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} a{" "}
          {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, rows.length)} de{" "}
          {rows.length} resultados
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="flex items-center gap-1 px-3 py-1 text-sm text-slate-400 hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>
          <span className="text-sm text-slate-400">
            Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="flex items-center gap-1 px-3 py-1 text-sm text-slate-400 hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Próxima
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}