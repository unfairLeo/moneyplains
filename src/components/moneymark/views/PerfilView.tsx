import { motion } from "framer-motion";
import { User } from "lucide-react";

export function PerfilView() {
  return (
    <motion.div
      className="px-6 pt-10 flex flex-col items-center text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-xl font-bold mb-4">
        LR
      </div>
      <h2 className="text-2xl font-bold tracking-tight">Leonardo Ravache</h2>
      <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-white">
        Admin
      </span>
      <p className="text-sm text-white/40 mt-4 max-w-xs">
        Em breve: gerencie seu perfil, preferências e configurações da conta.
      </p>
      <div className="mt-6 flex items-center gap-2 text-white/30 text-xs">
        <User className="w-3 h-3" />
        <span>Perfil em construção</span>
      </div>
    </motion.div>
  );
}