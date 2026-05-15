import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

const COLORS: Record<string, string> = {
  paid: "#22c55e",
  pending: "#f59e0b",
  canceled: "#ef4444",
};

export default function DonutChartCard({
  data,
}: {
  data: { name: string; value: number; status: "paid" | "pending" | "canceled" }[];
}) {
  const total = data.reduce((a, b) => a + b.value, 0);

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 shadow-soft h-[320px]">
      <div className="mb-2">
        <div className="font-semibold">Pedidos por status</div>
        <div className="text-xs text-slate-400">Distribuição</div>
      </div>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.status]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "8px",
                color: "#f1f5f9",
              }}
              formatter={(value: number) => [value, "Pedidos"]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-4 mt-2">
        {data.map((item) => (
          <div key={item.status} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: COLORS[item.status] }}
            />
            <span className="text-xs text-slate-400">
              {item.name}: {item.value} ({((item.value / total) * 100).toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}