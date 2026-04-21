import { useState } from "react";
import { motion } from "framer-motion";
import {
  Compass,
  Lock,
  Sword,
  ScrollText,
  Crown,
  Shield,
  Flame,
  Gem,
  Sparkles,
  Mountain,
  type LucideIcon,
} from "lucide-react";

interface OdisseiaAchievement {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  unlocked: boolean;
}

const INITIAL_ACHIEVEMENTS: OdisseiaAchievement[] = [
  { id: "hero-init", name: "O Herói Iniciante", description: "Inicie sua jornada de riqueza", icon: Sword, unlocked: false },
  { id: "wisdom-master", name: "O Mestre da Sabedoria", description: "Aprenda 10 lições financeiras", icon: ScrollText, unlocked: false },
  { id: "gold-conqueror", name: "O Conquistador de Ouro", description: "Acumule R$ 100.000 em ativos", icon: Crown, unlocked: false },
  { id: "shield-bearer", name: "Portador do Escudo", description: "Construa sua reserva de emergência", icon: Shield, unlocked: false },
  { id: "eternal-flame", name: "Chama Eterna", description: "Mantenha 30 dias de disciplina", icon: Flame, unlocked: false },
  { id: "gem-keeper", name: "Guardião das Gemas", description: "Diversifique em 5 classes de ativos", icon: Gem, unlocked: false },
  { id: "olympus-climber", name: "Escalador do Olimpo", description: "Atinja 3 metas consecutivas", icon: Mountain, unlocked: false },
  { id: "oracle-touch", name: "Toque do Oráculo", description: "Use o simulador 10 vezes", icon: Sparkles, unlocked: false },
];

export function MissoesView() {
  // Estado pronto para futuras unlock functions (ex: setAchievements(prev => prev.map(a => a.id === id ? {...a, unlocked: true} : a)))
  const [achievements] = useState<OdisseiaAchievement[]>(INITIAL_ACHIEVEMENTS);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <motion.div
      className="px-6 pt-8 pb-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-6">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 border border-amber-500/30"
          style={{
            background: "linear-gradient(135deg, hsl(45 80% 55% / 0.15), hsl(160 84% 45% / 0.12))",
            boxShadow: "0 0 24px hsl(45 80% 55% / 0.2)",
          }}
        >
          <Compass className="w-7 h-7 text-amber-300" strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-amber-300 via-emerald-300 to-amber-400 bg-clip-text text-transparent">
          Odisséia
        </h2>
        <p className="text-sm text-white/50 mt-2 max-w-xs leading-relaxed">
          Desbloqueie conquistas gerenciando seu legado financeiro.
        </p>
        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-amber-500/20">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span className="text-[11px] font-semibold text-white/70 tabular-nums">
            <span className="text-amber-300">{unlockedCount}</span>
            <span className="text-white/30">/{achievements.length}</span>
          </span>
          <span className="text-[10px] text-white/40 uppercase tracking-wider">desbloqueadas</span>
        </div>
      </div>

      {/* Grid de conquistas */}
      <div className="grid grid-cols-3 gap-3">
        {achievements.map((a, i) => {
          const Icon = a.icon;
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * i, duration: 0.3 }}
              className="group relative aspect-square rounded-2xl border border-white/10 bg-black/50 overflow-hidden flex flex-col items-center justify-center p-2"
              style={{
                backgroundImage:
                  "radial-gradient(ellipse at center, rgba(255,200,120,0.04), transparent 70%), repeating-linear-gradient(115deg, rgba(255,255,255,0.012) 0 1px, transparent 1px 6px)",
                filter: a.unlocked ? "none" : "grayscale(1)",
                opacity: a.unlocked ? 1 : 0.55,
              }}
            >
              <Icon
                className={`w-7 h-7 mb-1.5 ${a.unlocked ? "text-amber-300" : "text-white/40"}`}
                strokeWidth={1.5}
              />
              <p className="text-[9px] font-semibold text-white/70 text-center leading-tight px-1">
                {a.name}
              </p>

              {/* Lock overlay */}
              {!a.unlocked && (
                <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/80 border border-white/20 flex items-center justify-center">
                  <Lock className="w-2.5 h-2.5 text-white/60" strokeWidth={2} />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Hint */}
      <p className="text-center text-[10px] text-white/30 mt-6 italic">
        “Cada feito conquistado é uma página em sua lenda.”
      </p>
    </motion.div>
  );
}