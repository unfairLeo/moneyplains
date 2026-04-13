import { motion, AnimatePresence } from "framer-motion";
import { Lock, Bot, Drama, Cookie, Dumbbell, Check, Sparkles } from "lucide-react";

interface PersonaItem {
  id: string;
  name: string;
  subtitle: string;
  iconName: "bot" | "drama" | "cookie" | "dumbbell";
  color: string;
  borderColor: string;
  glowColor: string;
  unlockAt: number;
}

const personas: PersonaItem[] = [
  { id: "padrao", name: "O Padrão", subtitle: "Equilibrado & Profissional", iconName: "bot", color: "from-emerald-500 to-green-600", borderColor: "border-emerald-500/40", glowColor: "shadow-[0_0_20px_hsla(160,84%,39%,0.4)]", unlockAt: 0 },
  { id: "sarcastico", name: "O Sarcástico", subtitle: "Te julga gastando", iconName: "drama", color: "from-purple-500 to-violet-600", borderColor: "border-purple-500/40", glowColor: "shadow-[0_0_20px_hsla(270,91%,65%,0.4)]", unlockAt: 100 },
  { id: "vovo", name: "A Vovó Econômica", subtitle: "Cuida do seu dinheiro", iconName: "cookie", color: "from-cyan-500 to-blue-600", borderColor: "border-cyan-500/40", glowColor: "shadow-[0_0_20px_hsla(180,84%,45%,0.4)]", unlockAt: 300 },
  { id: "coach", name: "O Coach", subtitle: "Te motiva no grito", iconName: "dumbbell", color: "from-amber-500 to-orange-600", borderColor: "border-orange-500/40", glowColor: "shadow-[0_0_20px_hsla(30,84%,50%,0.4)]", unlockAt: 500 },
];

const iconMap = { bot: Bot, drama: Drama, cookie: Cookie, dumbbell: Dumbbell };

interface PersonasSectionProps {
  points: number;
  selectedPersona: string | null;
  onSelect: (id: string) => void;
}

export function PersonasSection({ points, selectedPersona, onSelect }: PersonasSectionProps) {
  return (
    <div className="px-6 pb-6">
      <motion.div
        className="flex items-center justify-between mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-semibold text-white/70 tracking-wide">Personalidades de IA</h3>
        </div>
        <span className="text-[10px] text-white/30 font-medium">{points} pts</span>
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        {personas.map((p, i) => {
          const Icon = iconMap[p.iconName];
          const unlocked = points >= p.unlockAt;
          const isSelected = selectedPersona === p.id;

          return (
            <motion.button
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.08 }}
              onClick={() => unlocked && onSelect(p.id)}
              disabled={!unlocked}
              className={`relative rounded-2xl border p-4 text-left transition-all duration-300 ${
                unlocked
                  ? `bg-white/5 backdrop-blur-xl ${p.borderColor} ${isSelected ? p.glowColor : ""} hover:bg-white/10 cursor-pointer`
                  : "bg-white/[0.02] border-white/5 cursor-not-allowed"
              }`}
            >
              {/* Lock overlay */}
              <AnimatePresence>
                {!unlocked && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Lock className="w-5 h-5 text-white/20 mb-1" />
                    <span className="text-[9px] text-white/25 font-medium">{p.unlockAt} pts</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Selected indicator */}
              {isSelected && unlocked && (
                <motion.div
                  className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center z-20"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500 }}
                >
                  <Check className="w-3 h-3 text-white" />
                </motion.div>
              )}

              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center mb-3 ${!unlocked ? "opacity-30 grayscale" : ""}`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <h4 className={`text-xs font-semibold ${unlocked ? "text-white/90" : "text-white/20"}`}>{p.name}</h4>
              <p className={`text-[10px] mt-0.5 ${unlocked ? "text-white/40" : "text-white/10"}`}>{p.subtitle}</p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
