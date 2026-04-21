import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Shield, Coins, PiggyBank, Landmark, Zap, Download } from "lucide-react";
import { NumberTicker } from "@/components/ui/NumberTicker";
import { AuraRing } from "@/components/moneymark/AuraRing";
import { MissionCard, type Mission } from "@/components/moneymark/MissionCard";
import { PersonasSection } from "@/components/moneymark/PersonasSection";

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
          <button className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white/50 hover:bg-white/10 transition-colors">
            <Download className="w-3 h-3" />
            <span>Instalar</span>
          </button>
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