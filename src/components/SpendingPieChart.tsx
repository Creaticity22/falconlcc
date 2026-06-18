import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--success))",
  "hsl(var(--primary-glow))",
  "hsl(var(--accent-glow))",
  "hsl(var(--primary-deep))",
  "hsl(var(--destructive))",
  "hsl(var(--muted-foreground))",
];

interface SpendingPieChartProps {
  data: { name: string; value: number }[];
}

export default function SpendingPieChart({ data }: SpendingPieChartProps) {
  if (!data.length || data.every((d) => d.value === 0)) {
    return (
      <p className="text-xs text-muted-foreground text-center py-6">
        Add an expense to see your spending breakdown.
      </p>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            innerRadius={40}
            paddingAngle={2}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v: number) => `£${v.toFixed(2)}`}
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 12,
              fontSize: 12,
            }}
          />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            wrapperStyle={{ fontSize: 11 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
