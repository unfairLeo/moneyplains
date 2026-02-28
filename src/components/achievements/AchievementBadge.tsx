import * as React from "react";
import {
  Trophy,
  Medal,
  Star,
  Flame,
  Target,
  Crown,
  Rocket,
  Zap,
  Gem,
  Lock,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider, // IMPORTANTE: Adicionei o Provider
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Achievement } from "@/types/achievements";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ElementType> = {
  trophy: Trophy,
  medal: Medal,
  star: Star,
  flame: Flame,
  target: Target,
  crown: Crown,
  rocket: Rocket,
  zap: Zap,
  gem: Gem,
};

// Definição de estilos segura
const tierStyles = {
  bronze: {
    bg: "bg-gradient-to-b from-orange-500/10 via-orange-900/5 to-transparent",
    border: "border-orange-500/20 border-b-orange-600/50", // Removi border-b-4 aqui para por na classe base
    icon: "text-orange-500",
    text: "text-orange-400",
    shadow: "shadow-orange-500/10", // Nova prop para sombra base
    glow: "group-hover:shadow-[0_0_30px_rgba(249,115,22,0.15)]"
  },
  silver: {
    bg: "bg-gradient-to-b from-slate-400/10 via-slate-800/5 to-transparent",
    border: "border-slate-400/20 border-b-slate-500/50",
    icon: "text-slate-300",
    text: "text-slate-200", // Mais claro para ler melhor
    shadow: "shadow-slate-500/10",
    glow: "group-hover:shadow-[0_0_30px_rgba(148,163,184,0.15)]"
  },
  gold: {
    bg: "bg-gradient-to-b from-yellow-400/10 via-yellow-900/5 to-transparent",
    border: "border-yellow-400/20 border-b-yellow-500/50",
    icon: "text-yellow-400",
    text: "text-yellow-400",
    shadow: "shadow-yellow-500/10",
    glow: "group-hover:shadow-[0_0_30px_rgba(250,204,21,0.2)]"
  },
};

interface AchievementBadgeProps {
  achievement: Achievement;
}

export function AchievementBadge({ achievement }: AchievementBadgeProps) {
  const Icon = iconMap[achievement.icon?.toLowerCase()] || Trophy;
  
  // Garante que 'tier' seja uma chave válida, senão usa 'bronze'
  const tierKey = (achievement.tier?.toLowerCase() as keyof typeof tierStyles) || "bronze";
  const tier = tierStyles[tierKey];

  // CARD BLOQUEADO
  if (!achievement.isUnlocked) {
    return (
      <TooltipProvider> {/* Envolvi com Provider para garantir que funcione isolado */}
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <div className="flex flex-col items-center justify-center p-4 w-32 h-40 rounded-2xl border-2 border-dashed border-muted bg-muted/5 opacity-50 grayscale transition-all duration-300 hover:opacity-100 hover:bg-muted/10 cursor-not-allowed group">
              <div className="p-3 rounded-full bg-muted/20 mb-3 group-hover:scale-110 transition-transform">
                <Lock className="w-6 h-6 text-muted-foreground" />
              </div>
              <span className="text-xs font-bold text-muted-foreground text-center px-2">
                Bloqueado
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="glass-card border-border/50 bg-black/90 text-white">
            <p className="font-medium mb-1">{achievement.name}</p>
            <p className="text-xs text-muted-foreground">
              {achievement.unlockCondition || "Continue usando o app para descobrir."}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // CARD DESBLOQUEADO
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "relative group flex flex-col items-center justify-center p-4 w-32 h-40 transition-all duration-300 cursor-pointer",
              "rounded-2xl border-t border-l border-r border-b-4 backdrop-blur-sm", // Borda base
              "hover:-translate-y-2 hover:scale-105 hover:z-10", // Efeito 3D
              tier.bg,
              tier.border,
              tier.glow,
              tier.shadow // Sombra base suave
            )}
          >
            {/* Ícone com fundo brilhante */}
            <div className={cn(
              "p-3 rounded-full mb-3 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110 bg-background/40 backdrop-blur-md shadow-inner",
              achievement.tier === "gold" && "animate-pulse-glow ring-2 ring-yellow-500/20"
            )}>
              <Icon className={cn("w-8 h-8 drop-shadow-md", tier.icon)} />
            </div>
            
            <span className={cn("text-xs font-bold text-center leading-tight px-1 drop-shadow-sm", tier.text)}>
              {achievement.name}
            </span>
            
            {/* Efeito de brilho ao passar o mouse (opcional) */}
            <div className="absolute inset-0 rounded-2xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </div>
        </TooltipTrigger>
        
        <TooltipContent side="top" className="glass-card border-border/50 bg-black/90 p-4">
          <div className="text-center space-y-2">
            <p className={cn("font-bold text-sm", tier.text)}>{achievement.name}</p>
            <p className="text-xs text-muted-foreground max-w-[180px]">
              {achievement.description}
            </p>
            {achievement.unlockedAt && (
              <div className="pt-2 border-t border-white/10 mt-2">
                <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">
                  Conquistado em
                </p>
                <p className="text-xs font-mono text-muted-foreground">
                  {new Date(achievement.unlockedAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
