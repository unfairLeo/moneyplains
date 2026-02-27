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
    // Fundo: Um marrom alaranjado muito suave e transparente que desvanece para o fundo do app
    bg: "bg-gradient-to-b from-orange-500/10 via-orange-900/5 to-transparent",
    // Borda: Laranja escuro, sutil
    border: "border-orange-500/20 border-b-orange-600/50 border-b-4",
    // Ícone: Laranja vibrante
    icon: "text-orange-500",
    text: "text-orange-400",
    // Glow: Sombra laranja suave
    glow: "group-hover:shadow-[0_0_30px_rgba(249,115,22,0.15)]"
  },
  
  silver: {
    // Fundo: Branco/Azulado transparente (frio)
    bg: "bg-gradient-to-b from-slate-400/10 via-slate-800/5 to-transparent",
    // Borda: Cinza metálico
    border: "border-slate-400/20 border-b-slate-500/50 border-b-4",
    // Ícone: Prata claro
    icon: "text-slate-300",
    text: "text-slate-300",
    // Glow: Sombra branca/azulada
    glow: "group-hover:shadow-[0_0_30px_rgba(148,163,184,0.15)]"
  },
  
  gold: {
    // Fundo: Amarelo/Dourado transparente (quente e rico)
    bg: "bg-gradient-to-b from-yellow-400/10 via-yellow-900/5 to-transparent",
    // Borda: Ouro forte
    border: "border-yellow-400/20 border-b-yellow-500/50 border-b-4",
    // Ícone: Ouro vibrante
    icon: "text-yellow-400",
    text: "text-yellow-400",
    // Glow: Sombra dourada mais forte que as outras
    glow: "group-hover:shadow-[0_0_30px_rgba(250,204,21,0.2)]"
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
