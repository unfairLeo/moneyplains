import { motion } from "framer-motion";
import { Home, BarChart3, Compass, User, type LucideIcon } from "lucide-react";

export type TabId = "home" | "analytics" | "missions" | "profile";

interface NavItem {
  id: TabId;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { id: "home", label: "Início", icon: Home },
  { id: "analytics", label: "Análises", icon: BarChart3 },
  { id: "missions", label: "Odisséia", icon: Compass },
  { id: "profile", label: "Perfil", icon: User },
];

interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (id: TabId) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[400px] z-50">
      <div className="mx-3 mb-3 rounded-2xl bg-white/5 backdrop-blur-2xl border border-white/10 px-2 py-2">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <motion.button
                key={item.id}
                onClick={() => onTabChange(item.id)}
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
  );
}