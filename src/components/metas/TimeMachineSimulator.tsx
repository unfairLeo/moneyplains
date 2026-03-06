import * as React from "react";
import { useState, useMemo } from "react";
import { Clock, Sparkles, TrendingUp } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// Use chaves simples (sem acento) para evitar bugs
const INVESTMENT_PROFILES: Record<string, { label: string; rate: number }> = {
  poupanca: { 
    label: "Poupança", 
    rate: 0.06 // 6% ao ano (Use ponto, não vírgula!)
  },
  cdb: { 
    label: "CDB / Renda Fixa", 
    rate: 0.10 // 10% ao ano
  },
  fii: { 
    label: "Fundos Imobiliários", 
    rate: 0.12 // 12% ao ano
  },
};

function calculateCompoundInterest(
  monthlyInvestment: number,
  years: number,
  annualRate: number
): { year: number; value: number; invested: number }[] {
  const monthlyRate = annualRate / 100 / 12;
  const data = [];

  for (let year = 0; year <= years; year++) {
    const months = year * 12;
    let futureValue = 0;
    
    if (months > 0 && monthlyRate > 0) {
      futureValue =
        monthlyInvestment *
        ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
        (1 + monthlyRate);
    }
    
    const invested = monthlyInvestment * months;
    data.push({ year, value: Math.round(futureValue), invested });
  }

  return data;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCurrencyShort(value: number) {
  if (value >= 1000000) {
    return `R$ ${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(0)}k`;
  }
  return formatCurrency(value);
}

interface SliderInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  format: (value: number) => string;
  icon: React.ReactNode;
}

function SliderInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
  format,
  icon,
}: SliderInputProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2 text-sm text-muted-foreground">
          {icon}
          {label}
        </Label>
        <span className="text-lg font-display font-bold text-primary">
          {format(value)}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={(values) => onChange(values[0])}
        min={min}
        max={max}
        step={step}
        className="cursor-pointer"
      />
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 border border-border/50">
        <p className="text-sm text-muted-foreground mb-1">Ano {label}</p>
        <p className="text-sm font-semibold text-primary">
          Total: {formatCurrency(payload[0].value)}
        </p>
        <p className="text-xs text-muted-foreground">
          Investido: {formatCurrency(payload[0].payload.invested)}
        </p>
        <p className="text-xs text-secondary">
          Juros: {formatCurrency(payload[0].value - payload[0].payload.invested)}
        </p>
      </div>
    );
  }
  return null;
};

export function TimeMachineSimulator() {
  const [monthlyInvestment, setMonthlyInvestment] = useState(500);
  const [years, setYears] = useState(10);
  const [annualRate, setAnnualRate] = useState(10);
  const [investmentProfile, setInvestmentProfile] = useState("moderado");

  const handleProfileChange = (profile: string) => {
    setInvestmentProfile(profile);
    const rate = INVESTMENT_PROFILES[profile]?.rate;
    if (rate !== null && rate !== undefined) {
      setAnnualRate(rate);
    }
  };

  const handleRateChange = (value: number) => {
    setAnnualRate(value);
    setInvestmentProfile("personalizado");
  };
  const chartData = useMemo(
    () => calculateCompoundInterest(monthlyInvestment, years, annualRate),
    [monthlyInvestment, years, annualRate]
  );

  const finalValue = chartData[chartData.length - 1]?.value || 0;
  const totalInvested = monthlyInvestment * years * 12;
  const totalInterest = finalValue - totalInvested;

  return (
    <div className="glass-card p-6 md:p-8 mt-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-secondary/20 neon-glow-purple">
            <Clock className="w-7 h-7 text-secondary" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold">A Máquina do Tempo</h2>
            <p className="text-sm text-muted-foreground">
              Simule seus investimentos e veja seu futuro
            </p>
          </div>
        </div>
        <Select value={investmentProfile} onValueChange={handleProfileChange}>
          <SelectTrigger className="w-[160px] glass-card border-border/50 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(INVESTMENT_PROFILES).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <SliderInput
          label="Investimento Mensal"
          value={monthlyInvestment}
          onChange={setMonthlyInvestment}
          min={100}
          max={10000}
          step={50}
          format={(v) => formatCurrency(v)}
          icon={<Sparkles className="w-4 h-4" />}
        />
        <SliderInput
          label="Tempo"
          value={years}
          onChange={setYears}
          min={1}
          max={40}
          step={1}
          format={(v) => `${v} anos`}
          icon={<Clock className="w-4 h-4" />}
        />
        <SliderInput
          label="Rentabilidade"
          value={annualRate}
          onChange={handleRateChange}
          min={1}
          max={20}
          step={0.5}
          format={(v) => `${v}% a.a.`}
          icon={<TrendingUp className="w-4 h-4" />}
        />
      </div>

      {/* Area Chart */}
      <div className="h-[280px] mb-8">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(160, 84%, 45%)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(270, 91%, 65%)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              opacity={0.3}
            />
            <XAxis
              dataKey="year"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}a`}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCurrencyShort(value)}
              width={70}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(160, 84%, 45%)"
              strokeWidth={3}
              fill="url(#areaGradient)"
              dot={false}
              activeDot={{
                r: 6,
                fill: "hsl(160, 84%, 45%)",
                stroke: "hsl(var(--background))",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-muted/20">
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">Total Investido</p>
          <p className="text-lg font-semibold">{formatCurrency(totalInvested)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">Juros Ganhos</p>
          <p className="text-lg font-semibold text-secondary">
            +{formatCurrency(totalInterest)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">No futuro, você terá</p>
          <p className="text-2xl font-display font-bold text-primary text-glow-emerald">
            {formatCurrency(finalValue)}
          </p>
        </div>
      </div>
    </div>
  );
}
