import { motion } from "framer-motion";
import { Target } from "lucide-react";

export function MissoesView() {
  return (
    <motion.div
      className="px-6 pt-10 flex flex-col items-center text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
        <Target className="w-8 h-8 text-emerald-400" strokeWidth={1.5} />
      </div>
      <h2 className="text-2xl font-bold tracking-tight">Missões</h2>
      <p className="text-sm text-white/40 mt-2 max-w-xs">
        Em breve: complete desafios financeiros e ganhe pontos para desbloquear personas.
      </p>
    </motion.div>
  );
}