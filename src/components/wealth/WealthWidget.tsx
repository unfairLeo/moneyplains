import { useState } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

type TimeRange = "7d" | "30d" | "total";

interface WealthWidgetProps {
  patrimony?: number;
  monthlyChange?: number;
  className?: string;
}

// --- Mock datasets ---
const data7d = [
  { date: "02 Fev", value: 11800 },
  { date: "03 Fev", value: 11950 },
  { date: "04 Fev", value: 11870 },
  { date: "05 Fev", value: 12100 },
  { date: "06 Fev", value: 12280 },
  { date: "07 Fev", value: 12150 },
  { date: "08 Fev", value: 12450 },
];

const data30d = (() => {
  const base = 10500;
  const target = 12450;
  const points: { date: string; value: number }[] = [];
  for (let i = 0; i < 30; i++) {
    const progress = i / 29;
    const trend = base + (target - base) * progress;
    const noise = (Math.sin(i * 1.7) * 300 + Math.cos(i * 0.8) * 200);
    const day = (i + 10).toString().padStart(2, "0");
    const month = i + 10 > 31 ? "Fev" : "Jan";
    const dayNum = i + 10 > 31 ? i + 10 - 31 : i + 10;
    points.push({
      date: `${dayNum.toString().padStart(2, "0")} ${month}`,
      value: Math.round(trend + noise),
    });
  }
  return points;
})();

const dataTotal = [
  { date: "Mar", value: 5200 },
  { date: "Abr", value: 5800 },
  { date: "Mai", value: 6400 },
  { date: "Jun", value: 6100 },
  { date: "Jul", value: 7200 },
  { date: "Ago", value: 7800 },
  { date: "Set", value: 8500 },
  { date: "Out", value: 9100 },
  { date: "Nov", value: 9800 },
  { date: "Dez", value: 10400 },
  { date: "Jan", value: 11200 },
  { date: "Fev", value: 12450 },
];

const dataMap: Record<TimeRange, typeof data7d> = {
  "7d": data7d,
  "30d": data30d,
  total: dataTotal,
};

const rangeLabels: { key: TimeRange; label: string }[] = [
  { key: "7d", label: "7D" },
  { key: "30d", label: "30D" },
  { key: "total", label: "Total" },
];

// --- Custom Tooltip ---
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;

  const point = payload[0];
  const value = point.value as number;
  const date = point.payload.date as string;

  const formatted = value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="glass-card px-3 py-2 border border-border/50 rounded-lg shadow-lg">
      <p className="text-xs text-muted-foreground mb-0.5">{date}</p>
      <p className="text-sm font-semibold text-foreground">
        <span className="text-primary">R$</span> {formatted}
      </p>
    </div>
  );
}

export function WealthWidget({
  patrimony = 12450,
  monthlyChange = 3.2,
  className,
}: WealthWidgetProps) {
  const [activeRange, setActiveRange] = useState<TimeRange>("7d");
  const data = dataMap[activeRange];

  const isPositiveTrend = data[data.length - 1].value >= data[0].value;
  const chartColor = isPositiveTrend
    ? "hsl(160 84% 45%)"
    : "hsl(0 84% 60%)";

  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className={cn("glass-card p-5 relative overflow-hidden", className)}>
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none" />

      <div className="relative">
        {/* Header row: label + pills */}
        <div className="flex items-start justify-between mb-1">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Patrimônio Estimado
          </p>

          {/* Pill filters */}
          <div className="flex gap-1">
            {rangeLabels.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveRange(key)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-all duration-200",
                  activeRange === key
                    ? "bg-primary/20 text-primary shadow-[0_0_10px_hsl(160_84%_39%/0.25)]"
                    : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Value */}
        <p className="text-3xl md:text-4xl font-sans font-bold text-foreground tracking-tight mb-4">
          <span className="text-primary text-glow-emerald">R$</span>{" "}
          <span>{formatCurrency(patrimony)}</span>
        </p>

        {/* Area chart */}
        <div className="w-full h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="patrimonyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(220 10% 55%)", fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis hide domain={["dataMin - 200", "dataMax + 200"]} />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: "hsl(160 84% 39%)", strokeWidth: 1, strokeDasharray: "4 4" }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={chartColor}
                strokeWidth={2.5}
                fill="url(#patrimonyGradient)"
                animationDuration={800}
                animationEasing="ease-in-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Footer badge */}
        <div className="flex justify-end mt-3">
          <div
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1",
              monthlyChange >= 0
                ? "bg-primary/20 text-primary"
                : "bg-destructive/20 text-destructive"
            )}
          >
            <span>
              {monthlyChange >= 0 ? "+" : ""}
              {monthlyChange}%
            </span>
            <span className="text-xs text-muted-foreground">este mês</span>
          </div>
        </div>
      </div>
    </div>
  );
}
