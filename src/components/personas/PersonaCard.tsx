import { Bot, Drama, Cookie, Dumbbell, Lock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Persona, colorConfig } from "@/types/personas";

const iconMap = {
  bot: Bot,
  drama: Drama,
  cookie: Cookie,
  dumbbell: Dumbbell,
};

interface PersonaCardProps {
  persona: Persona;
}

export function PersonaCard({ persona }: PersonaCardProps) {
  const config = colorConfig[persona.color];
  const Icon = iconMap[persona.iconName];

if (persona.isLocked) {
    return (
      // 1. Aumentamos a opacidade de 60 para 80 ou 90 para o card não sumir no fundo
      <div className="glass-card p-6 opacity-90 relative overflow-hidden cursor-not-allowed border-muted/20">
        
        {/* Locked Overlay */}
        {/* 2. Removemos o 'backdrop-blur' e usamos um fundo preto bem transparente 'bg-black/20' */}
        <div className="absolute inset-0 bg-black/20 z-10 flex items-center justify-center">
          <div className="p-4 rounded-full bg-background/80 shadow-xl border border-white/5">
            <Lock className="w-8 h-8 text-muted-foreground/50" />
          </div>
        </div>

        {/* Conteúdo do Card - Nítido e sem borrões */}
        <div className="flex flex-col items-center text-center gap-4 grayscale-[0.4]">
          <div className="p-4 rounded-full bg-muted bg-opacity-10 text-muted-foreground">
            <persona.icon size={32} />
          </div>
          <h3 className="text-xl font-bold text-muted-foreground">{persona.name}</h3>
          <p className="text-sm text-muted-foreground opacity-60 leading-relaxed">
            {persona.description}
          </p>
          
          <div className="flex items-center gap-2 mt-2">
             <Lock className="w-3 h-3 text-muted-foreground opacity-40" />
             <span className="text-[10px] text-muted-foreground opacity-40">
               {persona.requiredStreak} dias de streak
             </span>
          </div>
        </div>
      </div>
    );
  }

        {/* Badge */}
        <Badge 
          variant="outline" 
          className="absolute top-4 right-4 z-20 border-muted-foreground/50 text-muted-foreground"
        >
          EM BREVE
        </Badge>

        {/* Content (behind overlay) */}
        <div className="flex flex-col items-center text-center">
          <div className={cn("p-4 rounded-2xl mb-4", config.bg)}>
            <Icon className={cn("w-12 h-12", config.text)} />
          </div>
          
          <h3 className="text-xl font-display font-bold text-foreground mb-1">
            {persona.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            {persona.subtitle}
          </p>
          <p className="text-sm text-muted-foreground/70 mb-4">
            {persona.description}
          </p>
          
          {persona.unlockRequirement && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="w-3 h-3" />
              <span>Desbloqueie com {persona.unlockRequirement}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "glass-card p-6 relative overflow-hidden transition-all duration-300",
      "border-2",
      config.border,
      config.glow,
      "hover:scale-[1.02]"
    )}>
      {/* Active Badge */}
      <Badge 
        className={cn(
          "absolute top-4 right-4",
          config.bg,
          config.text,
          "border-transparent"
        )}
      >
        <Sparkles className="w-3 h-3 mr-1" />
        ATIVO
      </Badge>

      {/* Content */}
      <div className="flex flex-col items-center text-center">
        <div className={cn("p-4 rounded-2xl mb-4", config.bg, config.glow)}>
          <Icon className={cn("w-12 h-12", config.text)} />
        </div>
        
        <h3 className={cn("text-xl font-display font-bold mb-1", config.text)}>
          {persona.name}
        </h3>
        <p className="text-sm text-foreground mb-3">
          {persona.subtitle}
        </p>
        <p className="text-sm text-muted-foreground">
          {persona.description}
        </p>
      </div>
    </div>
  );
}
