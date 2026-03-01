import { Users, Info } from "lucide-react";
import { PersonaCard } from "@/components/personas/PersonaCard";
import { defaultPersonas } from "@/types/personas";

export function PersonalidadesView() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-xl bg-secondary/20 neon-glow-purple">
            <Users className="w-8 h-8 text-secondary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Personalidades
          </h1>
        </div>
        <p className="text-muted-foreground">
          Escolha quem vai controlar suas finanças
        </p>
      </header>

      {/* Info Banner */}
      <div className="glass-card p-4 mb-8 border-secondary/30 flex items-start gap-3 animate-stagger-in stagger-1">
        <div className="p-2 rounded-lg bg-secondary/20 flex-shrink-0">
          <Info className="w-5 h-5 text-secondary" />
        </div>
        <div>
          <p className="text-sm text-foreground font-medium mb-1">
            Desbloqueie novas personalidades!
          </p>
          <p className="text-sm text-muted-foreground">
            Em breve você poderá escolher quem controla suas finanças. 
            Complete missões diárias e mantenha seu streak para desbloquear personas únicas!
          </p>
        </div>
      </div>

      {/* Personas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {defaultPersonas.map((persona, index) => (
          <div key={persona.id} className={`animate-stagger-in stagger-${index + 1}`}>
            <PersonaCard persona={persona} />
          </div>
        ))}
      </div>
    </div>
  );
}
