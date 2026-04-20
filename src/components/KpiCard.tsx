export default function KpiCard({
  title,
  value,
  hint,
}: {
  title: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 shadow-soft">
      <div className="text-xs text-slate-400">{title}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
      <div className="mt-2 text-xs text-slate-500">{hint}</div>
    </div>
  );
}