import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function BarChartCard({ data }: { data: { category: string; revenue: number }[] }) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 shadow-soft h-[320px]">
      <div className="mb-2">
        <div className="font-semibold">Receita por categoria</div>
        <div className="text-xs text-slate-400">Comparação</div>
      </div>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="rgba(148,163,184,.15)" strokeDasharray="4 4" />
            <XAxis dataKey="category" tick={{ fill: "#94a3b8", fontSize: 12 }} />
            <YAxis
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "8px",
                color: "#f1f5f9",
              }}
              formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR")}`, "Receita"]}
            />
            <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}