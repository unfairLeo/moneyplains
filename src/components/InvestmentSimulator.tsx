import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calculator, TrendingUp, Wallet, Sparkles } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

function formatBRLShort(value: number) {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(0)}k`;
  return `R$ ${value.toFixed(0)}`;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-xl bg-black/80 backdrop-blur-md border border-green-500/30 p-3 shadow-2xl">
      <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Mês {label}</p>
      <p className="text-sm font-bold text-green-400">{formatBRL(p.total)}</p>
      <p className="text-[10px] text-gray-500">Investido: {formatBRL(p.invested)}</p>
      <p className="text-[10px] text-emerald-300">Juros: {formatBRL(p.interest)}</p>
    </div>
  );
};

export function InvestmentSimulator() {
  const [initial, setInitial] = useState(1000);
  const [monthly, setMonthly] = useState(500);
  const [months, setMonths] = useState(60);
  const [annualRate, setAnnualRate] = useState(10.5);

  const { chartData, totalAccumulated, totalInvested, totalInterest } = useMemo(() => {
    const monthlyRate = annualRate / 100 / 12;
    const data: { month: number; total: number; invested: number; interest: number }[] = [];
    let balance = initial;
    let invested = initial;

    data.push({ month: 0, total: balance, invested, interest: 0 });

    for (let m = 1; m <= months; m++) {
      balance = balance * (1 + monthlyRate) + monthly;
      invested += monthly;
      data.push({
        month: m,
        total: Math.round(balance),
        invested: Math.round(invested),
        interest: Math.round(balance - invested),
      });
    }

    return {
      chartData: data,
      totalAccumulated: Math.round(balance),
      totalInvested: Math.round(invested),
      totalInterest: Math.round(balance - invested),
    };
  }, [initial, monthly, months, annualRate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative w-full rounded-[2rem] bg-black/40 border border-white/10 shadow-2xl overflow-hidden backdrop-blur-md hover:border-green-500/30 transition-all"
    >
      {/* Glow */}
      <div className="absolute -top-20 -left-20 w-[400px] h-[400px] bg-green-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-green-500/10 border border-green-500/20 shadow-[0_0_20px_hsl(160_84%_39%/0.3)]">
            <Calculator className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Simulador de Investimentos</h2>
            <p className="text-xs text-gray-400">Projete seus juros compostos em tempo real</p>
          </div>
        </div>

        {/* Grid: Inputs + Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Inputs */}
          <div className="space-y-5">
            {/* Valor Inicial */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                  <Wallet className="w-3 h-3" /> Valor Inicial
                </Label>
                <Input
                  type="number"
                  value={initial}
                  onChange={(e) => setInitial(Math.max(0, Number(e.target.value) || 0))}
                  className="w-28 h-8 text-right text-sm font-bold text-green-400 bg-black/40 border-white/10 focus-visible:ring-green-500/50"
                />
              </div>
              <Slider value={[initial]} onValueChange={(v) => setInitial(v[0])} min={0} max={100000} step={500} />
            </div>

            {/* Aporte Mensal */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" /> Aporte Mensal
                </Label>
                <Input
                  type="number"
                  value={monthly}
                  onChange={(e) => setMonthly(Math.max(0, Number(e.target.value) || 0))}
                  className="w-28 h-8 text-right text-sm font-bold text-green-400 bg-black/40 border-white/10 focus-visible:ring-green-500/50"
                />
              </div>
              <Slider value={[monthly]} onValueChange={(v) => setMonthly(v[0])} min={0} max={10000} step={50} />
            </div>

            {/* Prazo */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs uppercase tracking-widest text-gray-400">Prazo (meses)</Label>
                <span className="text-sm font-bold text-green-400">{months} meses</span>
              </div>
              <Slider value={[months]} onValueChange={(v) => setMonths(v[0])} min={1} max={360} step={1} />
            </div>

            {/* Taxa */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3" /> Taxa Anual
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  value={annualRate}
                  onChange={(e) => setAnnualRate(Math.max(0, Number(e.target.value) || 0))}
                  className="w-28 h-8 text-right text-sm font-bold text-green-400 bg-black/40 border-white/10 focus-visible:ring-green-500/50"
                />
              </div>
              <Slider value={[annualRate]} onValueChange={(v) => setAnnualRate(v[0])} min={0} max={30} step={0.1} />
            </div>
          </div>

          {/* Chart */}
          <div className="flex flex-col">
            <div className="flex-1 min-h-[220px] rounded-2xl bg-black/30 border border-white/5 p-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="simGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(160 84% 45%)" stopOpacity={0.6} />
                      <stop offset="50%" stopColor="hsl(160 84% 39%)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(160 84% 30%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={formatBRLShort} width={50} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="hsl(160 84% 45%)"
                    strokeWidth={2.5}
                    fill="url(#simGradient)"
                    animationDuration={800}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
          <div className="rounded-2xl bg-black/40 border border-white/10 p-4">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Total Investido</p>
            <p className="text-lg font-bold text-white">{formatBRL(totalInvested)}</p>
          </div>
          <div className="rounded-2xl bg-emerald-500/5 border border-emerald-500/20 p-4">
            <p className="text-[10px] uppercase tracking-widest text-emerald-300/70 mb-1">Rendimento (Juros)</p>
            <p className="text-lg font-bold text-emerald-300">+{formatBRL(totalInterest)}</p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/30 p-4 shadow-[0_0_25px_hsl(160_84%_39%/0.2)]">
            <p className="text-[10px] uppercase tracking-widest text-green-300/80 mb-1">Total Acumulado</p>
            <p className="text-xl font-bold text-green-400 drop-shadow-[0_0_8px_hsl(160_84%_45%/0.5)]">{formatBRL(totalAccumulated)}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default InvestmentSimulator;
