import { Bot, Drama, Cookie, Dumbbell, Lock, Sparkles, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Persona, colorConfig } from "@/types/personas";

const iconMap: Record<string, any> = {
  bot: Bot,
  drama: Drama,
  cookie: Cookie,
  dumbbell: Dumbbell,
};

interface PersonaCardProps {
  persona: Persona;
  isActive?: boolean; // Nova prop para saber se ESTA é a selecionada
  onClick?: () => void; // Nova prop para permitir o clique
}

export function PersonaCard({ persona, isActive = false, onClick }: PersonaCardProps) {
  const config = colorConfig[persona.color] || colorConfig.blue; // Fallback de cor
  // Fallback de ícone (usa HelpCircle se não achar o nome)
  const Icon = iconMap[persona.iconName] || HelpCircle;

  // ESTADO 1: BLOQUEADO
  if (persona.isLocked) {
    return (
      <div className="glass-card p-6 opacity-90 relative overflow-hidden cursor-not-allowed border-muted/20 grayscale-[0.5]">
        {/* Overlay Escuro */}
        <div className="absolute inset-0 bg-background/60 z-10 flex items-center justify-center backdrop-blur-[1px]">
          <div className="p-4 rounded-full bg-background/80 shadow-xl border border-white/5">
            <Lock className="w-8 h-8 text-muted-foreground/50" />
          </div>
        </div>

        <Badge 
          variant="outline" 
          className="absolute top-4 right-4 z-20 border-muted-foreground/30 text-muted-foreground bg-background/50"
        >
          EM BREVE
        </Badge>

        {/* Conteúdo de fundo (apenas visual) */}
        <div className="flex flex-col items-center text-center opacity-50">
          <div className={cn("p-4 rounded-2xl mb-4", config.bg)}>
            <Icon className={cn("w-12 h-12", config.text)} />
          </div>
          <h3 className="text-xl font-display font-bold text-foreground mb-1">
            {persona.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            {persona.subtitle}
          </p>
          
          {persona.unlockRequirement && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4 font-mono">
              <Lock className="w-3 h-3" />
              <span>{persona.unlockRequirement}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ESTADO 2: DESBLOQUEADO (ATIVO OU DISPONÍVEL)
  return (
    <div 
      onClick={onClick}
      className={cn(
        "glass-card p-6 relative overflow-hidden transition-all duration-300 cursor-pointer group",
        "border-2",
        isActive ? config.border : "border-transparent hover:border-white/10", // Borda só aparece se ativo ou hover
        isActive ? config.glow : "hover:bg-white/5", // Brilho só se ativo
        isActive ? "scale-[1.02]" : "hover:scale-[1.01]"
      )}
    >
      {/* Badge só aparece se estiver ATIVO (Selecionado) */}
      {isActive && (
        <Badge 
          className={cn(
            "absolute top-4 right-4 animate-fade-in",
            config.bg,
            config.text,
            "border-transparent shadow-lg shadow-primary/20"
          )}
        >
          <Sparkles className="w-3 h-3 mr-1" />
          ATIVO
        </Badge>
      )}

      <div className="flex flex-col items-center text-center">
        {/* O ícone brilha se ativo, ou fica normal se inativo */}
        <div className={cn(
          "p-4 rounded-2xl mb-4 transition-all duration-300", 
          isActive ? config.bg : "bg-muted/30 group-hover:bg-muted/50",
          isActive ? config.glow : ""
        )}>
          <Icon className={cn(
            "w-12 h-12 transition-colors", 
            isActive ? config.text : "text-muted-foreground group-hover:text-foreground"
          )} />
        </div>
        
        <h3 className={cn(
          "text-xl font-display font-bold mb-1 transition-colors",
          isActive ? config.text : "text-foreground"
        )}>
          {persona.name}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-3">
          {persona.subtitle}
        </p>
        
        <p className="text-sm text-muted-foreground/80 leading-relaxed">
          {persona.description}
        </p>
        
        {/* Botão de ação visual para itens disponíveis mas não ativos */}
        {!isActive && (
          <span className="mt-4 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">
            Clique para selecionar
          </span>
        )}
      </div>
    </div>
  );
}
