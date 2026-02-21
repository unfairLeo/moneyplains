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

// 1. ALTERAÇÃO AQUI: Melhorei as cores e adicionei a propriedade 'text' que faltava
const tierStyles = {
  bronze: {
    bg: "bg-gradient-to-b from-amber-800/20 to-amber-900/40",
    border: "border-amber-700/50 border-b-4", // Borda inferior mais grossa para efeito 3D
    icon: "text-amber-500",
    text: "text-amber-500",
    glow: "group-hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]"
  },
  silver: {
    bg: "bg-gradient-to-b from-slate-700/20 to-slate-800/40",
    border: "border-slate-500/50 border-b-4",
    icon: "text-slate-300",
    text: "text-slate-300",
    glow: "group-hover:shadow-[0_0_20px_rgba(203,213,225,0.2)]"
  },
  gold: {
    bg: "bg-gradient-to-b from-yellow-700/20 to-yellow-900/40",
    border: "border-yellow-600/50 border-b-4",
    icon: "text-yellow-400",
    text: "text-yellow-400",
    glow: "group-hover:shadow-[0_0_20px_rgba(250,204,21,0.3)]"
  },
};

interface AchievementBadgeProps {
  achievement: Achievement;
}

export function AchievementBadge({ achievement }: AchievementBadgeProps) {
  // Fallback para evitar erro se o ícone não existir no mapa
  const Icon = iconMap[achievement.icon?.toLowerCase()] || Trophy; 
  
  // Fallback para tier
  const tier = tierStyles[achievement.tier as keyof typeof tierStyles] || tierStyles.bronze;

  // 2. ALTERAÇÃO AQUI: CARD BLOQUEADO (Estilo Fantasma)
  if (!achievement.isUnlocked) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex flex-col items-center justify-center p-4 w-32 h-40 rounded-2xl border-2 border-dashed border-muted bg-muted/5 opacity-50 grayscale transition-all hover:opacity-80 hover:bg-muted/10 cursor-not-allowed">
            <div className="p-3 rounded-full bg-muted/20 mb-3">
               <Lock className="w-6 h-6 text-muted-foreground" />
            </div>
            <span className="text-xs font-bold text-muted-foreground text-center">
              Bloqueado
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="glass-card border-border/50">
          <p className="font-medium mb-1">{achievement.name}</p>
          <p className="text-xs text-muted-foreground">
            {achievement.unlockCondition}
          </p>
        </TooltipContent>
      </Tooltip>
    );
  }

  // 3. ALTERAÇÃO AQUI: CARD DESBLOQUEADO (Estilo 3D Colorido)
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "relative group flex flex-col items-center justify-center p-4 w-32 h-40 transition-all duration-300 cursor-pointer",
            "rounded-2xl border-2 backdrop-blur-sm", // Formato de carta arredondada
            "hover:-translate-y-2 hover:scale-105", // Efeito de pulo (3D)
            tier.bg,
            tier.border,
            tier.glow
          )}
        >
          {/* Círculo atrás do ícone para destaque */}
          <div className={cn(
            "p-3 rounded-full mb-3 transition-transform duration-500 group-hover:rotate-12 bg-background/30 backdrop-blur-md",
            achievement.tier === "gold" && "animate-pulse-glow"
          )}>
            <Icon className={cn("w-8 h-8", tier.icon)} />
          </div>
          
          <span className={cn("text-xs font-bold text-center leading-tight px-1", tier.text)}>
            {achievement.name}
          </span>

          {/* Badge de "Novo" opcional se quiser adicionar lógica depois */}
          {/* <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary animate-ping" /> */}
        </div>
      </TooltipTrigger>
      
      <TooltipContent side="top" className="glass-card border-border/50">
        <div className="text-center">
          <p className={cn("font-bold mb-1 text-sm", tier.text)}>{achievement.name}</p>
          <p className="text-xs text-muted-foreground max-w-[180px] mb-2">
            {achievement.description}
          </p>
          {achievement.unlockedAt && (
            <div className="pt-2 border-t border-border/30">
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">
                Desbloqueado em
              </p>
              <p className="text-xs text-muted-foreground">
                 {new Intl.DateTimeFormat("pt-BR").format(new Date(achievement.unlockedAt))}
              </p>
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
