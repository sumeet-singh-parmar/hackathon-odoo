import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface PieDatum {
  name: string;
  value: number;
}

interface PieBreakdownProps {
  data: PieDatum[];
  formatValue?: (n: number) => string;
}

const palette = [
  "rgb(244 93 68)",
  "rgb(52 168 158)",
  "rgb(245 188 73)",
  "rgb(126 196 100)",
  "rgb(217 138 99)",
  "rgb(176 138 196)",
];

export function PieBreakdown({ data, formatValue = (n) => String(n) }: PieBreakdownProps) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
      <div className="h-48">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={48}
              outerRadius={84}
              paddingAngle={2}
              stroke="rgb(254 247 237)"
              strokeWidth={3}
            >
              {data.map((_, idx) => (
                <Cell key={idx} fill={palette[idx % palette.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid rgb(234 222 199)",
                background: "rgb(255 252 245)",
                fontFamily: "Fredoka, sans-serif",
              }}
              formatter={(v: number, name) => [formatValue(v), name as string]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="space-y-1.5 text-sm">
        {data.map((d, idx) => {
          const pct = total === 0 ? 0 : Math.round((d.value / total) * 100);
          return (
            <li key={d.name} className="flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-sm"
                style={{ background: palette[idx % palette.length] }}
                aria-hidden="true"
              />
              <span className="font-display font-semibold text-text">{d.name}</span>
              <span className="ml-auto text-muted">{formatValue(d.value)} · {pct}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
