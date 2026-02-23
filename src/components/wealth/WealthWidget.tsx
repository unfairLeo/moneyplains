import { useState, useEffect } from "react";
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

// 1. ADICIONAMOS 'chartData' NA INTERFACE
interface WealthWidgetProps {
  netWorth?: number;
  monthlyChange?: number;
  className?: string;
  chartData?: any[]; // <--- O CAMPO MÁGICO
}

export function WealthWidget({
  netWorth = 0,
  monthlyChange = 3.2,
  className,
  chartData = [], // Recebe os dados da IA
}: WealthWidgetProps) {
  const [activeRange, setActiveRange] = useState("total");

  // 2. LÓGICA INTELIGENTE:
  // Se a IA mandou dados (chartData), usa eles.
  // Se não mandou nada, cria uma linha reta simples baseada no saldo.
  const data = chartData && chartData.length > 0 
    ? chartData 
    : [
        { name: "Início", value: netWorth * 0.9 }, 
        { name: "Atual", value: netWorth }
      ];

  // Define a cor (Verde se subiu, Vermelho se caiu)
  const startValue = data[0]?.value || 0;
  const endValue = data[data.length - 1]?.value || 0;
  const isPositive = endValue >= startValue;
  const chartColor = isPositive ? "hsl(142, 76%, 36%)" : "hsl(0, 84%, 60%)";

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
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex flex-col">
             <p className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4" />
              Patrimônio Estimado
            </p>
            <p className="text-3xl md:text-4xl font-sans font-bold text-foreground tracking-tight">
              <span className="text-primary text-glow-emerald">R$</span>{" "}
              <span>{formatCurrency(netWorth)}</span>
            </p>
          </div>
          
          {/* Botões de filtro (Visuais) */}
          <div className="flex gap-1 bg-muted/20 p-1 rounded-lg">
             {["7D", "30D", "Total"].map((label) => (
               <button
                 key={label}
                 onClick={() => setActiveRange(label.toLowerCase())}
                 className={cn(
                   "px-3 py-1 text-xs font-medium rounded-md transition-all",
                   activeRange === label.toLowerCase() 
                     ? "bg-primary/20 text-primary" 
                     : "text-muted-foreground hover:text-foreground"
                 )}
               >
                 {label}
               </button>
             ))}
          </div>
        </div>

        {/* O Gráfico */}
        <div className="w-full h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "#666", fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis hide domain={["dataMin - 100", "dataMax + 100"]} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#111", borderColor: "#333", borderRadius: "8px" }}
                itemStyle={{ color: "#fff" }}
                formatter={(value: number) => [`R$ ${formatCurrency(value)}`, "Valor"]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={chartColor}
                strokeWidth={3}
                fill="url(#chartGradient)"
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Footer com % de mudança */}
        <div className="flex justify-end mt-2">
           <div className={cn(
             "px-2 py-1 rounded text-xs font-medium flex items-center gap-1",
             monthlyChange >= 0 ? "text-primary bg-primary/10" : "text-destructive bg-destructive/10"
           )}>
             {monthlyChange >= 0 ? "+" : ""}{monthlyChange}% este mês
           </div>
        </div>
      </div>
    </div>
  );
}
