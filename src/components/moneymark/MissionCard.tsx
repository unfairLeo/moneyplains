import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

export interface Mission {
  id: number;
  title: string;
  desc: string;
  icon: LucideIcon;
  progress: number;
  color: string;
}

export function MissionCard({ mission, index }: { mission: Mission; index: number }) {
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
