import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface BarDatum {
  label: string;
  value: number;
}

interface BarTrendProps {
  data: BarDatum[];
  formatValue?: (n: number) => string;
}

export function BarTrend({ data, formatValue = (n) => String(n) }: BarTrendProps) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid stroke="rgb(234 222 199)" strokeDasharray="3 4" vertical={false} />
          <XAxis
            dataKey="label"
            stroke="rgb(110 109 122)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="rgb(110 109 122)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatValue(v)}
          />
          <Tooltip
            cursor={{ fill: "rgb(244 93 68 / 0.08)" }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid rgb(234 222 199)",
              background: "rgb(255 252 245)",
              fontFamily: "Fredoka, sans-serif",
            }}
            formatter={(v: number) => formatValue(v)}
          />
          <Bar dataKey="value" fill="rgb(244 93 68)" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
