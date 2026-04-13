import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, BarChart3, Target, User, TrendingUp, Shield, Coins, PiggyBank, Landmark } from "lucide-react";
import { NumberTicker } from "@/components/ui/NumberTicker";

/* ── Missions Data ── */
const missions = [
  { id: 1, title: "Reserva de Emergência", desc: "Guardar 6 meses de gastos", icon: Shield, progress: 65, color: "from-cyan-500 to-blue-600" },
  { id: 2, title: "Investir em CDB", desc: "Primeiro aporte em renda fixa", icon: Landmark, progress: 30, color: "from-purple-500 to-violet-600" },
  { id: 3, title: "Meta Viagem", desc: "R$ 5.000 até dezembro", icon: PiggyBank, progress: 45, color: "from-emerald-500 to-green-600" },
  { id: 4, title: "Diversificar Carteira", desc: "Adicionar FIIs ao portfólio", icon: Coins, progress: 10, color: "from-amber-500 to-orange-600" },
  { id: 5, title: "Tesouro Direto", desc: "Investir em IPCA+", icon: TrendingUp, progress: 80, color: "from-pink-500 to-rose-600" },
];

/* ── Bottom Nav Items ── */
const navItems = [
  { id: "home", label: "Início", icon: Home },
  { id: "analytics", label: "Análises", icon: BarChart3 },
  { id: "missions", label: "Missões", icon: Target },
  { id: "profile", label: "Perfil", icon: User },
];

/* ── Radial Aura Ring ── */
function AuraRing({ delay, size, color, duration }: { delay: number; size: number; color: string; duration: number }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: "blur(30px)",
      }}
      animate={{
        scale: [1, 1.15, 0.95, 1.1, 1],
        rotate: [0, 90, 180, 270, 360],
        opacity: [0.3, 0.6, 0.35, 0.55, 0.3],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    />
  );
}

/* ── Mission Card ── */
function MissionCard({ mission, index }: { mission: typeof missions[0]; index: number }) {
  const Icon = mission.icon;
  return (
    <motion.div
      className="flex-shrink-0 w-[200px] rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 space-y-3"
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.4 + index * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.03, borderColor: "rgba(255,255,255,0.2)" }}
    >
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${mission.color} flex items-center justify-center shadow-lg`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <h4 className="text-sm font-semibold text-white/90">{mission.title}</h4>
        <p className="text-xs text-white/40 mt-0.5">{mission.desc}</p>
      </div>
      {/* Progress bar */}
      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${mission.color}`}
          initial={{ width: 0 }}
          animate={{ width: `${mission.progress}%` }}
          transition={{ delay: 0.6 + index * 0.1, duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <span className="text-[10px] text-white/30 font-medium">{mission.progress}% concluído</span>
    </motion.div>
  );
}

/* ── Main Dashboard ── */
export function MoneyMarkDashboard() {
  const [activeTab, setActiveTab] = useState("home");
  const balance = 47832.56;

  return (
    <div className="relative min-h-screen bg-[#050508] text-white overflow-hidden">
      {/* Mobile container centered */}
      <div className="max-w-[400px] mx-auto relative min-h-screen flex flex-col">

        {/* ── Header ── */}
        <motion.header
          className="px-6 pt-8 pb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs text-white/40 font-medium tracking-widest uppercase">Bem-vindo ao</p>
          <h1 className="text-2xl font-bold tracking-tight mt-1">
            Money<span className="text-cyan-400">Mark</span><span className="text-purple-400">$</span>
          </h1>
        </motion.header>

        {/* ── Central Balance Section ── */}
        <div className="flex-1 flex flex-col items-center justify-center relative px-6" style={{ minHeight: 340 }}>

          {/* Radial Aura Animation */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <AuraRing delay={0} size={320} color="hsla(180, 84%, 45%, 0.25)" duration={8} />
            <AuraRing delay={1.5} size={260} color="hsla(270, 91%, 65%, 0.2)" duration={10} />
            <AuraRing delay={0.8} size={200} color="hsla(160, 84%, 39%, 0.22)" duration={7} />
            <AuraRing delay={2} size={340} color="hsla(200, 80%, 50%, 0.12)" duration={12} />
            <AuraRing delay={0.5} size={180} color="hsla(280, 80%, 60%, 0.15)" duration={9} />
          </div>

          {/* Balance Content */}
          <motion.div
            className="relative z-10 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-xs text-white/40 font-medium tracking-widest uppercase mb-3">Saldo Total</p>
            <div className="text-5xl font-bold tracking-tighter">
              <NumberTicker value={balance} prefix="R$ " decimals={2} duration={1.5} className="text-white" />
            </div>
            <motion.div
              className="flex items-center justify-center gap-1.5 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-400">+8.4% este mês</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* ── Missions Section ── */}
        <div className="px-6 pb-4">
          <motion.div
            className="flex items-center justify-between mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            <h3 className="text-sm font-semibold text-white/70 tracking-wide">Missões Financeiras</h3>
            <span className="text-[10px] text-white/30 font-medium">{missions.length} ativas</span>
          </motion.div>

          {/* Horizontal Scroll */}
          <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin -mx-6 px-6 snap-x snap-mandatory">
            {missions.map((m, i) => (
              <div key={m.id} className="snap-start">
                <MissionCard mission={m} index={i} />
              </div>
            ))}
          </div>
        </div>

        {/* ── Quick Stats ── */}
        <motion.div
          className="px-6 pb-28 grid grid-cols-2 gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
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

        {/* ── Bottom Navigation ── */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[400px] z-50">
          <div className="mx-3 mb-3 rounded-2xl bg-white/5 backdrop-blur-2xl border border-white/10 px-2 py-2">
            <div className="flex items-center justify-around">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
                      isActive ? "text-cyan-400" : "text-white/30"
                    }`}
                    whileTap={{ scale: 0.9 }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="navGlow"
                        className="absolute inset-0 rounded-xl bg-cyan-500/10 border border-cyan-500/20"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <Icon className="w-5 h-5 relative z-10" strokeWidth={1.5} />
                    <span className="text-[10px] font-medium relative z-10">{item.label}</span>
                    {isActive && (
                      <motion.div
                        className="absolute -top-1 w-1 h-1 rounded-full bg-cyan-400"
                        layoutId="navDot"
                        style={{ boxShadow: "0 0 8px hsl(180 84% 45% / 0.8)" }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}
