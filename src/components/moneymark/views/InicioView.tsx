import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Shield, Coins, PiggyBank, Landmark, Zap, Download, Columns3, Feather, Anchor } from "lucide-react";
import { NumberTicker } from "@/components/ui/NumberTicker";
import { AuraRing } from "@/components/moneymark/AuraRing";
import { MissionCard, type Mission } from "@/components/moneymark/MissionCard";
import { PersonasSection } from "@/components/moneymark/PersonasSection";

// ── Domínios de Riqueza (mitologic asset map) ──
const dominios = [
  {
    id: "pilares",
    name: "Pilares do Templo",
    desc: "Renda fixa & reservas",
    icon: Columns3,
    value: 18420,
    pct: 38,
    gradient: "from-amber-600/30 via-amber-500/15 to-emerald-500/20",
    accent: "text-amber-300",
    ring: "border-amber-500/30",
  },
  {
    id: "asas",
    name: "Asas do Comércio",
    desc: "Renda variável & ações",
    icon: Feather,
    value: 11230,
    pct: 23,
    gradient: "from-emerald-500/30 via-emerald-400/15 to-amber-500/15",
    accent: "text-emerald-300",
    ring: "border-emerald-500/30",
  },
  {
    id: "correntes",
    name: "Correntes Digitais",
    desc: "Cripto & ativos digitais",
    icon: Anchor,
    value: 2800,
    pct: 6,
    gradient: "from-amber-700/25 via-yellow-600/15 to-emerald-600/20",
    accent: "text-yellow-300",
    ring: "border-yellow-600/30",
  },
];

// ── Alocação das Ofertas (donut puro CSS) ──
const ofertas = [
  { label: "Templos", pct: 42, color: "hsl(45 80% 55%)" },      // ouro envelhecido
  { label: "Mercados", pct: 28, color: "hsl(160 84% 45%)" },    // verde neon
  { label: "Oráculos", pct: 18, color: "hsl(30 60% 45%)" },     // bronze antigo
  { label: "Tributos", pct: 12, color: "hsl(180 50% 50%)" },    // ciano
];

const missions: Mission[] = [
  { id: 1, title: "Reserva de Emergência", desc: "Guardar 6 meses de gastos", icon: Shield, progress: 65, color: "from-cyan-500 to-blue-600" },
  { id: 2, title: "Investir em CDB", desc: "Primeiro aporte em renda fixa", icon: Landmark, progress: 30, color: "from-purple-500 to-violet-600" },
  { id: 3, title: "Meta Viagem", desc: "R$ 5.000 até dezembro", icon: PiggyBank, progress: 45, color: "from-emerald-500 to-green-600" },
  { id: 4, title: "Diversificar Carteira", desc: "Adicionar FIIs ao portfólio", icon: Coins, progress: 10, color: "from-amber-500 to-orange-600" },
  { id: 5, title: "Tesouro Direto", desc: "Investir em IPCA+", icon: TrendingUp, progress: 80, color: "from-pink-500 to-rose-600" },
];

export function InicioView() {
  const [points, setPoints] = useState(0);
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  const balance = 47832.56;

  return (
    <>
      {/* ── Header ── */}
      <motion.header
        className="px-6 pt-6 pb-2 flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <p className="text-[10px] text-white/40 font-medium tracking-widest uppercase">Bem-vindo ao</p>
          <h1 className="text-xl font-bold tracking-tight mt-0.5">
            Money<span className="text-cyan-400">Mark</span><span className="text-purple-400">$</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="https://drive.google.com/uc?export=download&id=1iW0RLTk1r-UoajXdD3M81x4QKmWWYfLo"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white/50 hover:bg-white/10 transition-colors"
          >
            <Download className="w-3 h-3" />
            <span>Instalar</span>
          </a>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-[11px] font-semibold text-white/80 leading-tight">Leonardo Ravache</p>
              <span className="inline-block px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-white leading-none mt-0.5">
                Admin
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-xs font-bold">
              LR
            </div>
          </div>
        </div>
      </motion.header>

      {/* ── Points bar ── */}
      <motion.div
        className="px-6 py-2 flex items-center justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-bold text-white/80">{points} pontos</span>
        </div>
        <motion.button
          onClick={() => setPoints((p) => p + 50)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-xs font-semibold text-amber-400 hover:from-amber-500/30 hover:to-orange-500/30 transition-all"
          whileTap={{ scale: 0.95 }}
        >
          <Zap className="w-3 h-3" />
          Ganhar Pontos (+50)
        </motion.button>
      </motion.div>

      {/* ── Central Balance ── */}
      <div className="flex flex-col items-center justify-center relative px-6" style={{ minHeight: 280 }}>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <AuraRing delay={0} size={280} color="hsla(180, 84%, 45%, 0.25)" duration={8} />
          <AuraRing delay={1.5} size={220} color="hsla(270, 91%, 65%, 0.2)" duration={10} />
          <AuraRing delay={0.8} size={170} color="hsla(160, 84%, 39%, 0.22)" duration={7} />
          <AuraRing delay={2} size={300} color="hsla(200, 80%, 50%, 0.12)" duration={12} />
        </div>
        <motion.div
          className="relative z-10 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-xs text-white/40 font-medium tracking-widest uppercase mb-3">Saldo Total</p>
          <div className="text-4xl font-bold tracking-tighter">
            <NumberTicker value={balance} prefix="R$ " decimals={2} duration={1.5} className="text-white" />
          </div>
          <motion.div className="flex items-center justify-center gap-1.5 mt-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-400">+8.4% este mês</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Personas Section ── */}
      <PersonasSection points={points} selectedPersona={selectedPersona} onSelect={setSelectedPersona} />

      {/* ── Seus Domínios de Riqueza ── */}
      <div className="px-6 pb-2 pt-2">
        <motion.div
          className="flex items-center justify-between mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-sm font-semibold text-white/80 tracking-wide">
            Seus <span className="bg-gradient-to-r from-amber-300 via-emerald-300 to-amber-400 bg-clip-text text-transparent">Domínios de Riqueza</span>
          </h3>
          <span className="text-[10px] text-white/30 font-medium uppercase tracking-widest">3 reinos</span>
        </motion.div>
        <div className="space-y-2.5">
          {dominios.map((d, i) => {
            const Icon = d.icon;
            return (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.06 }}
                className={`relative overflow-hidden rounded-2xl border ${d.ring} bg-gradient-to-br ${d.gradient} backdrop-blur-xl p-3.5`}
                style={{
                  backgroundImage: `radial-gradient(ellipse at top left, rgba(255,215,140,0.06), transparent 60%), repeating-linear-gradient(115deg, rgba(255,255,255,0.015) 0 2px, transparent 2px 8px)`,
                }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-black/40 border ${d.ring} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${d.accent}`} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-white truncate">{d.name}</p>
                    <p className="text-[10px] text-white/40 truncate">{d.desc}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-white tabular-nums">
                      R$ {d.value.toLocaleString("pt-BR")}
                    </p>
                    <p className={`text-[10px] font-semibold ${d.accent}`}>{d.pct}%</p>
                  </div>
                </div>
                {/* meter: verde neon → ouro envelhecido */}
                <div className="mt-2.5 h-1 w-full rounded-full bg-black/40 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: "linear-gradient(90deg, hsl(160 84% 45%) 0%, hsl(45 80% 55%) 100%)",
                      boxShadow: "0 0 8px hsl(160 84% 45% / 0.5)",
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${d.pct * 2.2}%` }}
                    transition={{ delay: 0.5 + i * 0.08, duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Alocação das Ofertas ── */}
      <motion.div
        className="px-6 pt-3 pb-1"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div
          className="rounded-2xl border border-amber-500/15 bg-gradient-to-br from-black/60 to-emerald-950/20 backdrop-blur-xl p-4"
          style={{
            backgroundImage: `radial-gradient(ellipse at center, rgba(255,200,120,0.04), transparent 70%), repeating-linear-gradient(45deg, rgba(255,255,255,0.012) 0 1px, transparent 1px 6px)`,
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white/80">
              <span className="bg-gradient-to-r from-amber-300 to-emerald-300 bg-clip-text text-transparent">Alocação das Ofertas</span>
            </h3>
            <span className="text-[10px] text-white/30 uppercase tracking-widest">Mês</span>
          </div>
          <div className="flex items-center gap-4">
            {/* Donut */}
            <div
              className="relative w-24 h-24 rounded-full shrink-0"
              style={{
                background: `conic-gradient(${ofertas
                  .map((o, i) => {
                    const start = ofertas.slice(0, i).reduce((s, x) => s + x.pct, 0);
                    return `${o.color} ${start}% ${start + o.pct}%`;
                  })
                  .join(", ")})`,
                boxShadow: "0 0 24px rgba(255, 200, 100, 0.15), inset 0 0 12px rgba(0,0,0,0.6)",
              }}
            >
              <div className="absolute inset-2 rounded-full bg-black/80 flex flex-col items-center justify-center border border-amber-500/15">
                <span className="text-[9px] text-white/40 uppercase tracking-wider">Total</span>
                <span className="text-xs font-bold text-amber-300 tabular-nums">100%</span>
              </div>
            </div>
            {/* Legend */}
            <ul className="flex-1 space-y-1.5">
              {ofertas.map((o) => (
                <li key={o.label} className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-sm"
                      style={{ background: o.color, boxShadow: `0 0 6px ${o.color}` }}
                    />
                    <span className="text-white/70">{o.label}</span>
                  </div>
                  <span className="font-semibold text-white tabular-nums">{o.pct}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>

      {/* ── Missions ── */}
      <div className="px-6 pb-4">
        <motion.div className="flex items-center justify-between mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
          <h3 className="text-sm font-semibold text-white/70 tracking-wide">Missões Financeiras</h3>
          <span className="text-[10px] text-white/30 font-medium">{missions.length} ativas</span>
        </motion.div>
        <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin -mx-6 px-6 snap-x snap-mandatory">
          {missions.map((m, i) => (
            <div key={m.id} className="snap-start">
              <MissionCard mission={m} index={i} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Quick Stats ── */}
      <motion.div className="px-6 grid grid-cols-2 gap-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.5 }}>
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4">
          <p className="text-[10px] text-white/30 font-medium uppercase tracking-wider">Investido</p>
          <p className="text-lg font-bold text-white mt-1">R$ 32.450</p>
          <p className="text-[10px] text-emerald-400 mt-0.5">+12.3%</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4">
          <p className="text-[10px] text-white/30 font-medium uppercase tracking-wider">Disponível</p>
          <p className="text-lg font-bold text-white mt-1">R$ 15.382</p>
          <p className="text-[10px] text-cyan-400 mt-0.5">Conta corrente</p>
        </div>
      </motion.div>
    </>
  );
}