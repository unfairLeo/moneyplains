import { motion } from "framer-motion";
import { MessageSquare, Target, Compass, UserCircle, Trophy, Settings, type LucideIcon } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { path: "/dashboard", label: "Chat", icon: MessageSquare },
  { path: "/metas", label: "Metas", icon: Target },
  { path: "/missoes", label: "Odisséia", icon: Compass },
  { path: "/personalidades", label: "Personas", icon: UserCircle },
  { path: "/conquistas", label: "Conquistas", icon: Trophy },
  { path: "/configuracoes", label: "Ajustes", icon: Settings },
];

export function GlobalBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) =>
    path === "/dashboard"
      ? location.pathname === "/dashboard"
      : location.pathname.startsWith(path);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden pointer-events-none">
      <div className="mx-3 mb-3 rounded-2xl bg-background/60 backdrop-blur-2xl border border-primary/10 px-1 py-2 pointer-events-auto shadow-[0_-8px_32px_rgba(0,0,0,0.4)]">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <motion.button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`relative flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl transition-colors ${
                  active ? "text-primary" : "text-muted-foreground/60"
                }`}
                whileTap={{ scale: 0.9 }}
              >
                {active && (
                  <motion.div
                    layoutId="globalNavGlow"
                    className="absolute inset-0 rounded-xl bg-primary/10 border border-primary/20"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon
                  className="w-5 h-5 relative z-10"
                  strokeWidth={active ? 2 : 1.5}
                />
                <span className="text-[9px] font-medium relative z-10 leading-none">
                  {item.label}
                </span>
                {active && (
                  <motion.div
                    layoutId="globalNavDot"
                    className="absolute -top-1 w-1 h-1 rounded-full bg-primary"
                    style={{ boxShadow: "0 0 8px hsl(var(--primary) / 0.8)" }}
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
