import { cn } from "../lib/utils";

export default function StatusBadge({ status }: { status: "paid" | "pending" | "canceled" }) {
  const map = {
    paid: { label: "Pago", cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25" },
    pending: { label: "Pendente", cls: "bg-amber-500/15 text-amber-300 border-amber-500/25" },
    canceled: { label: "Cancelado", cls: "bg-rose-500/15 text-rose-300 border-rose-500/25" },
  }[status];

  return (
    <span className={cn("inline-flex items-center px-2 py-1 text-xs rounded-lg border", map.cls)}>
      {map.label}
    </span>
  );
}