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

const iconMap = {
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

const tierStyles = {
  bronze: {
    bg: "bg-amber-900/30",
    border: "border-amber-600/50",
    text: "text-amber-500",
    glow: "",
  },
  silver: {
    bg: "bg-slate-400/20",
    border: "border-slate-400/50",
    text: "text-slate-300",
    glow: "shadow-[0_0_15px_hsl(220_10%_70%/0.3)]",
  },
  gold: {
    bg: "bg-yellow-500/20",
    border: "border-yellow-400/50",
    text: "text-yellow-400",
    glow: "shadow-[0_0_20px_hsl(45_93%_55%/0.4)]",
  },
};

interface AchievementBadgeProps {
  achievement: Achievement;
}

export function AchievementBadge({ achievement }: AchievementBadgeProps) {
  const Icon = iconMap[achievement.icon] || Trophy;
  const tier = tierStyles[achievement.tier];

  if (!achievement.isUnlocked) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex flex-col items-center gap-2 cursor-not-allowed">
            <div className="relative w-20 h-20 hexagon bg-muted/20 border-2 border-dashed border-muted-foreground/20 flex items-center justify-center opacity-50 transition-all hover:opacity-70">
              <Lock className="w-6 h-6 text-muted-foreground" />
            </div>
            <span className="text-xs text-muted-foreground text-center max-w-[80px] truncate">
              ???
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

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex flex-col items-center gap-2 cursor-pointer group">
          <div
            className={cn(
              "w-20 h-20 hexagon flex items-center justify-center border-2 transition-all duration-300",
              "hover:scale-110 hover:rotate-6",
              tier.bg,
              tier.border,
              tier.glow,
              achievement.tier === "gold" && "animate-pulse-glow"
            )}
          >
            <Icon className={cn("w-8 h-8", tier.text)} />
          </div>
          <span
            className={cn(
              "text-xs text-center max-w-[80px] truncate font-medium",
              tier.text
            )}
          >
            {achievement.name}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="glass-card border-border/50">
        <div className="text-center">
          <p className={cn("font-medium mb-1", tier.text)}>{achievement.name}</p>
          <p className="text-xs text-muted-foreground max-w-[200px]">
            {achievement.description}
          </p>
          {achievement.unlockedAt && (
            <p className="text-xs text-muted-foreground/70 mt-2">
              Desbloqueado em{" "}
              {new Intl.DateTimeFormat("pt-BR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }).format(achievement.unlockedAt)}
            </p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
